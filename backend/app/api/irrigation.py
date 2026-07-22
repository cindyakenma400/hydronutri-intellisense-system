from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.schemas.irrigation_schema import (
    IrrigationResponse
)

from app.services.irrigation_service import (
    get_irrigation_status,
    save_irrigation_log
)

from app.services.sensor_service import (
    get_latest_sensor_reading
)

router = APIRouter(
    prefix="/irrigation",
    tags=["Irrigation Management"]
)


@router.get(
    "/status",
    response_model=IrrigationResponse
)
def irrigation_status(
    db: Session = Depends(get_db)
):

    sensor = get_latest_sensor_reading(db)

    result = get_irrigation_status(
        sensor.soil_moisture
    )

    save_irrigation_log(
        db,
        result
    )

    return result