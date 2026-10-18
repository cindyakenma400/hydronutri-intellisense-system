"""
Disease detection service — unified model.

Uses a single TFLite model trained on all crops (Tomato, Maize, Onion)
plus an "Unknown" class for unsupported leaves and non-leaf objects.
The model auto-detects which crop a leaf belongs to from the predicted
class name.
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

ML_DIR = Path(__file__).resolve().parents[1] / "ml" / "disease_models"
UNIFIED_DIR = ML_DIR / "unified"

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploaded_leaves"

IMG_SIZE = 224

CONFIDENCE_THRESHOLD = 35.0

SUPPORTED_CROPS = ["tomato", "maize", "onion"]


# ------------------------------------------------------- treatment lookup

TREATMENTS = {
    # ---- Maize
    "Maize fall armyworm": [
        "Remove and destroy infested leaves and egg masses by hand.",
        "Apply Bt (Bacillus thuringiensis) spray on young larvae.",
        "Use neem-based insecticide as a natural control.",
    ],
    "Maize_Common Rust": [
        "Remove heavily infected leaves where practical.",
        "Apply a foliar fungicide if infection is early and severe.",
        "Plant rust-resistant maize varieties next season.",
    ],
    "Maize_Gray Leaf Spot": [
        "Improve airflow; avoid dense planting.",
        "Apply fungicide at first signs if conditions are humid.",
        "Rotate crops and bury residue.",
    ],
    "Maize_Healthy": [],
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

    # ---- Onion
    "Onion_Alternaria_D": [
        "Remove and destroy infected leaves promptly.",
        "Apply mancozeb or chlorothalonil fungicide preventively.",
        "Avoid overhead irrigation; water at the base.",
    ],
    "Onion_Botrytis Leaf Blight": [
        "Remove affected leaves; avoid overhead irrigation.",
        "Improve spacing for airflow.",
        "Apply a recommended fungicide preventively in wet weather.",
    ],
    "Onion_Bulb_blight_D": [
        "Remove and destroy affected bulbs immediately.",
        "Improve soil drainage and avoid waterlogging.",
        "Treat seed bulbs with a fungicide before planting.",
    ],
    "Onion_Bulb_Rot": [
        "Remove infected bulbs and surrounding soil.",
        "Ensure good drainage and avoid over-watering.",
        "Apply a soil drench fungicide; rotate crops for 3 years.",
    ],
    "Onion_Downy_mildew": [
        "Remove and destroy infected foliage.",
        "Apply metalaxyl or mancozeb-based fungicide early.",
        "Improve spacing and avoid overhead watering.",
    ],
    "Onion_Fusarium_D": [
        "Remove and destroy infected plants and surrounding soil.",
        "Solarize soil before next planting season.",
        "Use disease-free seed and resistant varieties.",
    ],
    "Onion_Healthy": [],
    "Onion_Purple Blotch": [
        "Remove infected leaves early.",
        "Avoid leaf wetness; water at the base in the morning.",
        "Apply protective fungicide on a schedule in humid periods.",
    ],
    "Onion_Rust": [
        "Remove and destroy infected leaves.",
        "Apply a sulphur-based or systemic fungicide.",
        "Improve airflow between plants and avoid excess nitrogen.",
    ],
    "Onion_Stemphylium Leaf Blight": [
        "Remove affected foliage promptly.",
        "Reduce leaf wetness and improve drainage.",
        "Apply an appropriate fungicide when symptoms begin.",
    ],
    "Onion_Yellow Dwarf Virus": [
        "Remove and destroy infected plants; no cure.",
        "Control aphids that spread the virus.",
        "Use virus-free sets and resistant varieties.",
    ],

    # ---- Tomato
    "Tomato__Target_Spot": [
        "Remove and destroy infected leaves.",
        "Improve plant spacing for better airflow.",
        "Apply chlorothalonil or copper-based fungicide.",
    ],
    "Tomato__Tomato_mosaic_virus": [
        "Remove and destroy infected plants; no cure.",
        "Disinfect tools and hands after handling infected plants.",
        "Use resistant varieties and disease-free seed.",
    ],
    "Tomato_Bacterial Spot": [
        "Remove infected leaves and avoid working with wet plants.",
        "Use copper-based sprays early.",
        "Rotate crops next season; use disease-free seed.",
    ],
    "Tomato_Early Blight": [
        "Remove and destroy affected lower leaves.",
        "Avoid overhead watering; water at the base.",
        "Apply a copper-based or chlorothalonil fungicide.",
    ],
    "Tomato_Healthy": [],
    "Tomato_Late_blight": [
        "Remove and destroy infected plants immediately.",
        "Apply metalaxyl or copper-based fungicide preventively.",
        "Avoid overhead watering and improve airflow.",
    ],
    "Tomato_Leaf_Mold": [
        "Improve ventilation; reduce humidity in the growing area.",
        "Remove infected leaves promptly.",
        "Apply a fungicide if spread is severe.",
    ],
    "Tomato_Septoria Leaf Spot": [
        "Pick off spotted leaves promptly.",
        "Mulch to stop soil splash onto leaves.",
        "Apply a suitable fungicide if spread continues.",
    ],
    "Tomato_Spider_mites_Two_spotted_spider_mite": [
        "Spray plants with a strong jet of water to dislodge mites.",
        "Apply neem oil or insecticidal soap.",
        "Introduce predatory mites as biological control.",
    ],
    "Tomato_Yellow Leaf Curl Virus": [
        "Remove and destroy infected plants; there is no cure.",
        "Control whiteflies, which spread the virus.",
        "Use resistant varieties and insect netting next cycle.",
    ],

    # ---- Unknown
    "Unknown": [],
}


# --------------------------------------------------------- model loading

_model = None


def _load_model():
    """Loads and caches the unified interpreter + labels."""
    global _model
    if _model is not None:
        return _model

    model_path = UNIFIED_DIR / "model.tflite"
    labels_path = UNIFIED_DIR / "labels.txt"

    if not model_path.exists() or not labels_path.exists():
        _model = False
        return False

    interpreter = tf.lite.Interpreter(model_path=str(model_path))
    interpreter.allocate_tensors()

    labels = []
    with open(labels_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(" ", 1)
            labels.append(parts[1] if len(parts) > 1 else parts[0])

    _model = {
        "interpreter": interpreter,
        "labels": labels,
        "input": interpreter.get_input_details(),
        "output": interpreter.get_output_details(),
    }
    return _model


def _extract_crop(label: str) -> str:
    """Extracts the crop name from a predicted class label."""
    lower = label.lower()
    if lower.startswith("tomato"):
        return "Tomato"
    if lower.startswith("maize"):
        return "Maize"
    if lower.startswith("onion"):
        return "Onion"
    return "Unknown"


def _preprocess(contents: bytes, input_dtype):
    """
    Turns raw image bytes into the 224x224 batch the model expects.

    The unified model was trained with rescale=1/255 so float inputs
    are in [0, 1]. Quantized models expect UINT8 pixels (0-255).
    """
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image = image.resize((IMG_SIZE, IMG_SIZE))
    array = np.asarray(image)

    if input_dtype == np.uint8:
        array = array.astype(np.uint8)
    else:
        array = array.astype(np.float32) / 255.0

    return np.expand_dims(array, axis=0)


def _run_inference(contents: bytes):
    """Returns (label, confidence_percent) or None if the model is missing."""
    bundle = _load_model()
    if not bundle:
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

    raw = float(scores[top])
    confidence = round((raw / 255.0 if scores.dtype == np.uint8 else raw) * 100, 1)

    label = bundle["labels"][top]
    return label, confidence


# ------------------------------------------------------------- main entry

def analyze_image(db: Session, filename: str, contents: bytes,
                  crop: str = "tomato", image_source: str = "Web Upload"):
    """
    Saves the image, runs the unified model, and records the result.

    The `crop` parameter is accepted for API compatibility but the
    unified model auto-detects the crop from the predicted class name.
    """
    # 1. Save the uploaded image
    UPLOAD_DIR.mkdir(exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_name = f"{timestamp}_{filename}"
    with open(UPLOAD_DIR / safe_name, "wb") as f:
        f.write(contents)

    # 2. Run the model
    prediction = _run_inference(contents)

    if prediction is None:
        result = {
            "crop": (crop or "tomato").strip().capitalize(),
            "disease_detected": "Model unavailable",
            "confidence": 0.0,
            "severity": "Unknown",
            "treatment": ["The unified disease model is not installed."],
            "status": "error",
            "image_source": f"{image_source} ({filename})",
            "recommended_action": "Place model.tflite and labels.txt in backend/app/ml/disease_models/unified/",
        }
    else:
        label, confidence = prediction
        detected_crop = _extract_crop(label)
        is_healthy = label.lower().endswith("healthy")
        is_unknown = label == "Unknown"

        if is_unknown or confidence < CONFIDENCE_THRESHOLD:
            result = {
                "crop": detected_crop if not is_unknown else "Unknown",
                "disease_detected": "Unknown" if is_unknown else "Uncertain",
                "confidence": confidence,
                "severity": "Unknown",
                "treatment": [
                    "The image could not be identified as a supported crop leaf. "
                    "Upload a clear close-up of a single tomato, maize, or onion leaf in good light.",
                ] if is_unknown else [
                    "The result is not confident. Upload a clear close-up of a "
                    "single leaf in good light.",
                ],
                "status": "unknown" if is_unknown else "uncertain",
                "image_source": f"{image_source} ({filename})",
                "recommended_action": "Take a clear photo of a single leaf from a supported crop.",
            }
        elif is_healthy:
            result = {
                "crop": detected_crop,
                "disease_detected": "Healthy",
                "confidence": confidence,
                "severity": "None",
                "treatment": [],
                "status": "healthy",
                "image_source": f"{image_source} ({filename})",
                "recommended_action": "No action needed. Keep monitoring.",
            }
        else:
            display = label
            for prefix in ("Tomato__", "Tomato_", "Maize_", "Maize ", "Onion_"):
                if label.startswith(prefix):
                    display = label[len(prefix):]
                    break

            severity = "Moderate"
            if confidence >= 85:
                severity = "High"
            elif confidence < 70:
                severity = "Mild"

            result = {
                "crop": detected_crop,
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
        image_filename=safe_name,
    )
    db.add(record)
    db.commit()

    return result


def get_history(db: Session, limit: int = 20, source: str | None = None):
    query = db.query(DiseaseDetection)
    if source:
        query = query.filter(DiseaseDetection.image_source.ilike(f"{source}%"))
    return query.order_by(DiseaseDetection.created_at.desc()).limit(limit).all()


def get_latest_by_source(db: Session, source: str):
    return (
        db.query(DiseaseDetection)
        .filter(DiseaseDetection.image_source.ilike(f"{source}%"))
        .order_by(DiseaseDetection.created_at.desc())
        .first()
    )
