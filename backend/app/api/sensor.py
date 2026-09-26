from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.dependencies import get_db, require_device
from app.services.control_service import (
    apply_auto_fertilization,
    apply_auto_irrigation,
)

from app.schemas.sensor_schema import (
    SensorCreate,
    SensorResponse
)

from app.services.sensor_service import (
    create_sensor_reading,
    get_sensor_history,
    get_latest_sensor_reading
)

router = APIRouter(
    prefix="/sensor",
    tags=["Sensor Data"]
)


@router.post(
    "/upload",
    response_model=SensorResponse,
    dependencies=[Depends(require_device)]
)
def upload_sensor_data(
    sensor_data: SensorCreate,
    db: Session = Depends(get_db)
):

    reading = create_sensor_reading(
        db,
        sensor_data
    )

    # Auto mode decides the pump and valve state from each new reading.
    apply_auto_irrigation(db, reading)
    apply_auto_fertilization(db, reading)

    return reading


@router.get(
    "/history",
    response_model=list[SensorResponse]
)
def sensor_history(
    db: Session = Depends(get_db)
):

    return get_sensor_history(db)


@router.get(
    "/latest",
    response_model=SensorResponse
)
def latest_sensor_data(
    db: Session = Depends(get_db)
):

    latest = get_latest_sensor_reading(db)

    if latest is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "No sensor readings available yet. "
                "Upload sensor data first."
            )
        )

    return latest