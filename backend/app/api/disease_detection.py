from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from sqlalchemy.orm import Session
import traceback

from app.database.dependencies import get_db
from app.schemas.disease_schema import DiseasePredictionResponse
from app.services.disease_service import analyze_image, get_history

router = APIRouter(
    prefix="/disease",
    tags=["Disease Detection"]
)


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

    try:
        result = analyze_image(
            db,
            file.filename or "leaf.jpg",
            contents,
            crop=crop,
            image_source=source,
        )
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Disease analysis failed: {exc}",
        )

    return DiseasePredictionResponse(**result)


@router.get("/history")
def disease_history(db: Session = Depends(get_db)):
    records = get_history(db)

    return [
        {
            "id": r.id,
            "crop": r.crop,
            "disease_detected": r.disease_detected,
            "confidence": r.confidence,
            "severity": r.severity,
            "image_source": r.image_source,
            "image_url": f"/uploaded_leaves/{r.image_filename}" if r.image_filename else None,
            "created_at": r.created_at,
        }
        for r in records
    ]