from fastapi import APIRouter

from app.schemas.alert_schema import (
    Alert,
    AlertResponse
)

from app.services.alert_service import (
    generate_alerts
)

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.get(
    "/",
    response_model=AlertResponse
)
def get_alerts():

    # Temporary values
    # Later these will come from ESP32 sensors
    soil_moisture = 25
    soil_ph = 8.2

    alert_data = generate_alerts(
        soil_moisture,
        soil_ph
    )

    alerts = [
        Alert(**item)
        for item in alert_data
    ]

    return AlertResponse(
        total_alerts=len(alerts),
        alerts=alerts
    )