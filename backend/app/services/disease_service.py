from pathlib import Path
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.disease import DiseaseDetection

# Uploaded leaf photos are stored here (inside backend/)
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploaded_leaves"


def analyze_image(db: Session, filename: str, contents: bytes):
    """
    Receives a leaf image, stores it on disk, and records the
    detection in the database.

    NOTE: The CNN model is not trained yet, so the classification
    below is a sample result. When the trained model is available,
    replace the block marked DEMO RESULT with real inference.
    """
    # 1. Save the uploaded image
    UPLOAD_DIR.mkdir(exist_ok=True)

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_name = f"{timestamp}_{filename}"
    file_path = UPLOAD_DIR / safe_name

    with open(file_path, "wb") as f:
        f.write(contents)

    # 2. DEMO RESULT (replace with real CNN inference later)
    result = {
        "crop": "Tomato",
        "disease_detected": "Early Blight",
        "confidence": 94.5,
        "severity": "Moderate",
        "treatment": [
            "Remove infected leaves",
            "Avoid overhead irrigation",
            "Apply recommended fungicide",
        ],
        "status": "Demo mode: sample result (CNN model not trained yet)",
        "image_source": f"Web Upload ({filename})",
        "recommended_action":
            "Monitor crop closely and begin treatment immediately",
    }

    # 3. Record the detection in the database
    record = DiseaseDetection(
        crop=result["crop"],
        disease_detected=result["disease_detected"],
        confidence=result["confidence"],
        severity=result["severity"],
        treatment=". ".join(result["treatment"]),
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