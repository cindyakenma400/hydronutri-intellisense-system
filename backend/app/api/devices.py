from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.sensor import SensorReading
from app.models.disease import DiseaseDetection
from app.services.control_service import get_state

router = APIRouter(
    prefix="/devices",
    tags=["Devices"]
)

SENSOR_ONLINE_WINDOW_SECONDS = 60
CAMERA_ONLINE_WINDOW_SECONDS = 300


def _is_recent(created_at, window_seconds: int) -> bool:
    if created_at is None:
        return False

    return datetime.utcnow() - created_at <= timedelta(seconds=window_seconds)


@router.get("/status")
def device_status(db: Session = Depends(get_db)):
    latest_reading = (
        db.query(SensorReading)
        .order_by(SensorReading.created_at.desc())
        .first()
    )
    latest_detection = (
        db.query(DiseaseDetection)
        .order_by(DiseaseDetection.created_at.desc())
        .first()
    )
    controls = get_state(db)

    esp32_online = latest_reading is not None and _is_recent(
        latest_reading.created_at, SENSOR_ONLINE_WINDOW_SECONDS
    )
    camera_online = latest_detection is not None and _is_recent(
        latest_detection.created_at, CAMERA_ONLINE_WINDOW_SECONDS
    )

    has_nonzero_reading = latest_reading is not None and any(
        (value or 0) != 0
        for value in (
            latest_reading.soil_moisture,
            latest_reading.temperature,
            latest_reading.ph,
            latest_reading.nitrogen,
            latest_reading.phosphorus,
            latest_reading.potassium,
        )
    )
    soil_sensor_online = esp32_online and has_nonzero_reading

    return [
        {
            "name": "ESP32 Controller",
            "model": "Main sensor & control hub",
            "icon": "Cpu",
            "online": esp32_online,
        },
        {
            "name": "ESP32-CAM",
            "model": "Leaf imaging module",
            "icon": "Camera",
            "online": camera_online,
        },
        {
            "name": "Soil Sensor",
            "model": "CWT-SOIL-NPKPHCTH-S",
            "icon": "Gauge",
            "online": soil_sensor_online,
        },
        {
            "name": "Water Pump",
            "model": "Irrigation actuator",
            "icon": "Droplets",
            "online": controls.pump_on,
        },
        {
            "name": "Fertilizer Pump",
            "model": "Nutrient dosing actuator",
            "icon": "FlaskConical",
            "online": controls.valve_on,
        },
    ]
