from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session
from datetime import datetime

from pydantic import BaseModel

from app.database.dependencies import get_db

from app.schemas.alert_schema import (
    AlertResponse,
    MarkReadResponse
)

from app.services.alert_service import (
    generate_alerts,
    sync_alerts,
    get_active_alerts,
    count_unread,
    mark_alert_read,
    mark_all_read,
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
    """
    Returns the alerts that are currently active, read from the database
    so each one keeps a stable id and its read state.

    Returns an empty list rather than a 404 when there is no sensor data,
    so the navbar bell does not show an error before the first reading.
    """
    sensor = get_latest_sensor_reading(db)

    if sensor is not None:
        sync_alerts(db, generate_alerts(sensor))

    alerts = get_active_alerts(db)

    return AlertResponse(
        total_alerts=len(alerts),
        unread_count=count_unread(db),
        alerts=alerts
    )


@router.post(
    "/{alert_id}/read",
    response_model=MarkReadResponse
)
def read_one(
    alert_id: int,
    db: Session = Depends(get_db)
):

    updated = mark_alert_read(db, alert_id)

    return MarkReadResponse(
        updated=updated,
        unread_count=count_unread(db)
    )


@router.post(
    "/read-all",
    response_model=MarkReadResponse
)
def read_all(
    db: Session = Depends(get_db)
):

    updated = mark_all_read(db)

    return MarkReadResponse(
        updated=updated,
        unread_count=count_unread(db)
    )


@router.get(
    "/history",
    response_model=list[AlertHistoryItem]
)
def alert_history(
    db: Session = Depends(get_db)
):

    return get_alert_history(db)