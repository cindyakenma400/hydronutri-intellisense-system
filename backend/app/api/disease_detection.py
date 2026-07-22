from fastapi import APIRouter

from app.schemas.disease_schema import (
    DiseasePredictionResponse
)

from app.services.disease_service import (
    detect_disease
)

router = APIRouter(
    prefix="/disease",
    tags=["Disease Detection"]
)


@router.get(
    "/analyze",
    response_model=DiseasePredictionResponse
)
def analyze_disease():

    result = detect_disease()

    return DiseasePredictionResponse(**result)