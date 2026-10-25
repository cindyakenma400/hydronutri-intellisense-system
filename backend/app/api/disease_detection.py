from fastapi import APIRouter, Depends, File, UploadFile, Form, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database.dependencies import get_db
from app.schemas.disease_schema import DiseasePredictionResponse
from app.services.disease_service import analyze_image, get_history, get_latest_by_source

router = APIRouter(
    prefix="/disease",
    tags=["Disease Detection"]
)


def _record_to_dict(r):
    return {
        "id": r.id,
        "crop": r.crop,
        "disease_detected": r.disease_detected,
        "confidence": r.confidence,
        "severity": r.severity,
        "treatment": r.treatment,
        "image_source": r.image_source,
        "image_url": f"/uploaded_leaves/{r.image_filename}" if r.image_filename else None,
        "created_at": r.created_at,
    }


@router.post(
    "/analyze",
    response_model=DiseasePredictionResponse
)
async def analyze_disease(
    file: UploadFile = File(...),
    crop: str = Form("tomato"),
    source: str = Form("Web Upload"),
    db: Session = Depends(get_db),
):
    contents = await file.read()

    result = analyze_image(
        db,
        file.filename or "leaf.jpg",
        contents,
        crop=crop,
        image_source=source,
    )

    return DiseasePredictionResponse(**result)


@router.get("/history")
def disease_history(
    source: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    records = get_history(db, source=source)
    return [_record_to_dict(r) for r in records]

<<<<<<< HEAD

@router.get("/latest-capture")
def latest_capture(db: Session = Depends(get_db)):
    record = get_latest_by_source(db, "ESP32")
    if record is None:
        return None
    return _record_to_dict(record)
=======
    return [
        {
            "id": r.id,
            "crop": r.crop,
            "disease_detected": r.disease_detected,
            "confidence": r.confidence,
            "severity": r.severity,
            "treatment": r.treatment,
            "image_source": r.image_source,
            "image_url": f"/uploaded_leaves/{r.image_filename}" if r.image_filename else None,
            "created_at": r.created_at,
        }
        for r in records
    ]
>>>>>>> origin/claude/gracious-wozniak-r1cyri
