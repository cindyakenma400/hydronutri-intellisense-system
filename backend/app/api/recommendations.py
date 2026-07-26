from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.schemas.recommendation_schema import (
    CropRecommendationResponse,
    RecommendationHistoryItem
)

from app.services.recommendations_service import (
    recommend_crop,
    get_recommendation_history
)

router = APIRouter(
    prefix="/recommendations",
    tags=["Crop Recommendations"]
)


@router.get(
    "/crop",
    response_model=CropRecommendationResponse
)
def crop_recommendation(
    db: Session = Depends(get_db)
):

    result = recommend_crop(db)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "No sensor readings available yet. "
                "Upload sensor data first."
            )
        )

    return result


@router.get(
    "/history",
    response_model=list[RecommendationHistoryItem]
)
def recommendation_history(
    db: Session = Depends(get_db)
):

    return get_recommendation_history(db)