from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session
from datetime import datetime

from pydantic import BaseModel

from app.database.dependencies import get_db

from app.schemas.alert_schema import (
    Alert,
    AlertResponse
)

from app.services.alert_service import (
    generate_alerts,
    save_alerts,
    get_alert_history
)

from app.services.sensor_service import (
    get_latest_sensor_reading
)

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


class AlertHistoryItem(BaseModel):
    id: int
    alert_type: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get(
    "/",
    response_model=AlertResponse
)
def get_alerts(
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

    alert_data = generate_alerts(sensor)

    save_alerts(db, alert_data)

    alerts = [
        Alert(**item)
        for item in alert_data
    ]

    return AlertResponse(
        total_alerts=len(alerts),
        alerts=alerts
    )


@router.get(
    "/history",
    response_model=list[AlertHistoryItem]
)
def alert_history(
    db: Session = Depends(get_db)
):

    return get_alert_history(db)