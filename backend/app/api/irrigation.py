from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session
from datetime import datetime

from pydantic import BaseModel

from app.database.dependencies import get_db

from app.schemas.irrigation_schema import (
    IrrigationResponse
)

from app.services.irrigation_service import (
    get_irrigation_status,
    save_irrigation_log,
    get_irrigation_history
)

from app.services.sensor_service import (
    get_latest_sensor_reading
)

router = APIRouter(
    prefix="/irrigation",
    tags=["Irrigation Management"]
)


class IrrigationHistoryItem(BaseModel):
    id: int
    irrigation_needed: bool
    water_amount_liters: float
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get(
    "/status",
    response_model=IrrigationResponse
)
def irrigation_status(
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

    result = get_irrigation_status(
        sensor.soil_moisture
    )

    save_irrigation_log(
        db,
        result
    )

    return result


@router.get(
    "/history",
    response_model=list[IrrigationHistoryItem]
)
def irrigation_history(
    db: Session = Depends(get_db)
):

    return get_irrigation_history(db)