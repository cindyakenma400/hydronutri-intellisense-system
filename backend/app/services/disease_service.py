"""
Disease detection service.

Loads a separate Teachable Machine model per crop (tomato, maize, onion),
runs the uploaded or captured leaf image through the matching crop model,
and returns the disease, confidence, and treatment advice.
"""

from pathlib import Path
from datetime import datetime

import numpy as np
from PIL import Image
import io

import tensorflow as tf

from sqlalchemy.orm import Session
from app.models.disease import DiseaseDetection

# ------------------------------------------------------------------ paths

# backend/app/ml/disease_models/<crop>/{model.tflite, labels.txt}
ML_DIR = Path(__file__).resolve().parents[1] / "ml" / "disease_models"

# Uploaded / captured leaf photos are stored here (inside backend/)
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploaded_leaves"

# Teachable Machine image models expect 224x224 RGB.
IMG_SIZE = 224

# Below this confidence we do not trust the prediction (bad frame,
# not a leaf, blurry photo). Tunable.
CONFIDENCE_THRESHOLD = 35.0

SUPPORTED_CROPS = ["tomato", "maize", "onion"]


# ------------------------------------------------------- treatment lookup

# Practical, general guidance. Refine wording / local product names later.
TREATMENTS = {
    # ---- Tomato
    "Tomato_Early Blight": [
        "Remove and destroy affected lower leaves.",
        "Avoid overhead watering; water at the base.",
        "Apply a copper-based or chlorothalonil fungicide.",
    ],
    "Tomato_Bacterial Spot": [
        "Remove infected leaves and avoid working with wet plants.",
        "Use copper-based sprays early.",
        "Rotate crops next season; use disease-free seed.",
    ],
    "Tomato_Septoria Leaf Spot": [
        "Pick off spotted leaves promptly.",
        "Mulch to stop soil splash onto leaves.",
        "Apply a suitable fungicide if spread continues.",
    ],
    "Tomato_Yellow Leaf Curl Virus": [
        "Remove and destroy infected plants; there is no cure.",
        "Control whiteflies, which spread the virus.",
        "Use resistant varieties and insect netting next cycle.",
    ],
    "Tomato_Healthy": [],

    # ---- Maize
    "Maize_Common Rust": [
        "Remove heavily infected leaves where practical.",
        "Apply a foliar fungicide if infection is early and severe.",
        "Plant rust-resistant maize varieties next season.",
    ],
    "Maize_Northern Leaf Blight": [
        "Remove crop debris after harvest to reduce spores.",
        "Apply fungicide at early lesion stage if severe.",
        "Rotate with a non-cereal crop.",
    ],
    "Maize_Streak Virus": [
        "Remove and destroy infected plants; no chemical cure.",
        "Control leafhoppers that transmit the virus.",
        "Plant early and use tolerant varieties.",
    ],
    "Maize_Gray Leaf Spot": [
        "Improve airflow; avoid dense planting.",
        "Apply fungicide at first signs if conditions are humid.",
        "Rotate crops and bury residue.",
    ],
    "Maize_Healthy": [],

    # ---- Onion
    "Onion_Botrytis Leaf Blight": [
        "Remove affected leaves; avoid overhead irrigation.",
        "Improve spacing for airflow.",
        "Apply a recommended fungicide preventively in wet weather.",
    ],
    "Onion_Purple Blotch": [
        "Remove infected leaves early.",
        "Avoid leaf wetness; water at the base in the morning.",
        "Apply protective fungicide on a schedule in humid periods.",
    ],
    "Onion_Yellow Dwarf Virus": [
        "Remove and destroy infected plants; no cure.",
        "Control aphids that spread the virus.",
        "Use virus-free sets and resistant varieties.",
    ],
    "Onion_Stemphylium Leaf Blight": [
        "Remove affected foliage promptly.",
        "Reduce leaf wetness and improve drainage.",
        "Apply an appropriate fungicide when symptoms begin.",
    ],
    "Onion_Healthy": [],
}


# --------------------------------------------------------- model loading

# Each crop's interpreter and labels are loaded once, on first use.
_models = {}


def _load_crop_model(crop: str):
    """Loads and caches the interpreter + labels for one crop."""
    if crop in _models:
        return _models[crop]

    crop_dir = ML_DIR / crop
    model_path = crop_dir / "model.tflite"
    labels_path = crop_dir / "labels.txt"

    if not model_path.exists() or not labels_path.exists():
        _models[crop] = None
        return None

    interpreter = tf.lite.Interpreter(model_path=str(model_path))
    interpreter.allocate_tensors()

    # labels.txt lines look like: "0 Tomato_Early Blight"
    labels = []
    with open(labels_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(" ", 1)
            labels.append(parts[1] if len(parts) > 1 else parts[0])

    bundle = {
        "interpreter": interpreter,
        "labels": labels,
        "input": interpreter.get_input_details(),
        "output": interpreter.get_output_details(),
    }
    _models[crop] = bundle
    return bundle


def _preprocess(contents: bytes, input_dtype):
    """
    Turns raw image bytes into the 224x224 batch the model expects.

    Quantized Teachable Machine models want raw UINT8 pixels (0-255).
    Float models want pixels normalized to [-1, 1]. We match whichever
    the model was exported as.
    """
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image = image.resize((IMG_SIZE, IMG_SIZE))
    array = np.asarray(image)

    if input_dtype == np.uint8:
        array = array.astype(np.uint8)
    else:
        array = (array.astype(np.float32) / 127.5) - 1.0

    return np.expand_dims(array, axis=0)

def _run_inference(crop: str, contents: bytes):
    """Returns (label, confidence_percent) or None if the model is missing."""
    bundle = _load_crop_model(crop)
    if bundle is None:
        return None

    interpreter = bundle["interpreter"]
    input_details = bundle["input"]
    output_details = bundle["output"]

    input_dtype = input_details[0]["dtype"]
    data = _preprocess(contents, input_dtype)

    interpreter.set_tensor(input_details[0]["index"], data)
    interpreter.invoke()

    scores = interpreter.get_tensor(output_details[0]["index"])[0]
    top = int(np.argmax(scores))

    # Quantized models output 0-255 scores; float models output 0-1.
    raw = float(scores[top])
    confidence = round((raw / 255.0 if scores.dtype == np.uint8 else raw) * 100, 1)

    label = bundle["labels"][top]
    return label, confidence

# ------------------------------------------------------------- main entry

def analyze_image(db: Session, filename: str, contents: bytes,
                  crop: str = "tomato", image_source: str = "Web Upload"):
    """
    Saves the image, runs the matching crop model, and records the result.

    `crop` selects which model runs. `image_source` distinguishes a manual
    web upload from an automatic ESP32-CAM capture.
    """
    crop = (crop or "tomato").strip().lower()
    if crop not in SUPPORTED_CROPS:
        crop = "tomato"

    # 1. Save the uploaded image
    UPLOAD_DIR.mkdir(exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_name = f"{timestamp}_{filename}"
    with open(UPLOAD_DIR / safe_name, "wb") as f:
        f.write(contents)

    # 2. Run the model
    prediction = _run_inference(crop, contents)

    if prediction is None:
        result = {
            "crop": crop.capitalize(),
            "disease_detected": "Model unavailable",
            "confidence": 0.0,
            "severity": "Unknown",
            "treatment": ["The disease model for this crop is not installed."],
            "status": "error",
            "image_source": f"{image_source} ({filename})",
            "recommended_action": "Check that the crop model files are present.",
        }
    else:
        label, confidence = prediction
        is_healthy = label.lower().endswith("healthy")

        if confidence < CONFIDENCE_THRESHOLD:
            # Low confidence: don't trust it. Likely a poor image.
            result = {
                "crop": crop.capitalize(),
                "disease_detected": "Uncertain",
                "confidence": confidence,
                "severity": "Unknown",
                "treatment": [
                    "The result is not confident. Make sure you selected the correct "
                    "crop, and upload a clear close-up of a single leaf in good light.",
                ],
                "status": "uncertain",
                "image_source": f"{image_source} ({filename})",
                "recommended_action": "Retake a clearer close-up of one leaf.",
            }
        elif is_healthy:
            result = {
                "crop": crop.capitalize(),
                "disease_detected": "Healthy",
                "confidence": confidence,
                "severity": "None",
                "treatment": [],
                "status": "healthy",
                "image_source": f"{image_source} ({filename})",
                "recommended_action": "No action needed. Keep monitoring.",
            }
        else:
            # Clean disease name for display: drop the crop prefix.
            display = label.split("_", 1)[-1] if "_" in label else label
            severity = "Moderate"
            if confidence >= 85:
                severity = "High"
            elif confidence < 70:
                severity = "Mild"

            result = {
                "crop": crop.capitalize(),
                "disease_detected": display,
                "confidence": confidence,
                "severity": severity,
                "treatment": TREATMENTS.get(
                    label, ["Consult a local agricultural officer."]
                ),
                "status": "disease",
                "image_source": f"{image_source} ({filename})",
                "recommended_action":
                    "Begin the treatment steps and monitor closely.",
            }

    # 3. Record the detection
    record = DiseaseDetection(
        crop=result["crop"],
        disease_detected=result["disease_detected"],
        confidence=result["confidence"],
        severity=result["severity"],
        treatment=". ".join(result["treatment"]) if result["treatment"] else "None",
        image_source=result["image_source"],
    )
    db.add(record)
    db.commit()

    return result


def get_history(db: Session, limit: int = 20):
    return (
        db.query(DiseaseDetection)
        .order_by(DiseaseDetection.created_at.desc())
        .limit(limit)
        .all()
    )