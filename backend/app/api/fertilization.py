from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session
from datetime import datetime

from pydantic import BaseModel

from app.database.dependencies import get_db

from app.schemas.fertilization_schema import FertilizationResponse

from app.services.fertilization_service import (
    get_fertilizer_recommendation,
    save_fertilization_log,
    get_fertilization_history
)

from app.services.sensor_service import (
    get_latest_sensor_reading
)

router = APIRouter(
    prefix="/fertilization",
    tags=["Fertilization Management"]
)


class FertilizationHistoryItem(BaseModel):
    id: int
    nitrogen: float
    phosphorus: float
    potassium: float
    recommendation: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get(
    "/recommend",
    response_model=FertilizationResponse
)
def fertilizer_recommendation(
    db: Session = Depends(get_db)
):

    sensor = get_latest_sensor_reading(db)

    if sensor is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "No sensor readings available yet. "
                "Upload sensor data first."
            )
        )

    recommendations = get_fertilizer_recommendation(
        sensor.nitrogen,
        sensor.phosphorus,
        sensor.potassium
    )

    save_fertilization_log(
        db,
        sensor.nitrogen,
        sensor.phosphorus,
        sensor.potassium,
        recommendations
    )

    return FertilizationResponse(
        nitrogen=sensor.nitrogen,
        phosphorus=sensor.phosphorus,
        potassium=sensor.potassium,
        recommendations=recommendations
    )


@router.get(
    "/history",
    response_model=list[FertilizationHistoryItem]
)
def fertilization_history(
    db: Session = Depends(get_db)
):

    return get_fertilization_history(db)