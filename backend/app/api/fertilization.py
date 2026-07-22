from fastapi import APIRouter
from app.schemas.fertilization_schema import FertilizationResponse
from app.services.fertilization_service import (
    get_fertilizer_recommendation
)

router = APIRouter(
    prefix="/fertilization",
    tags=["Fertilization Management"]
)

@router.get(
    "/recommend",
    response_model=FertilizationResponse
)
def fertilizer_recommendation():

    nitrogen = 40
    phosphorus = 35
    potassium = 55

    recommendations = get_fertilizer_recommendation(
        nitrogen,
        phosphorus,
        potassium
    )

    return FertilizationResponse(
        nitrogen=nitrogen,
        phosphorus=phosphorus,
        potassium=potassium,
        recommendations=recommendations
    )