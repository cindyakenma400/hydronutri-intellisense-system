from sqlalchemy.orm import Session

from app.services.sensor_service import get_latest_sensor_reading
from app.services.soil_assessment_service import assess_soil
from app.services.irrigation_service import get_irrigation_status
from app.services.fertilization_service import get_fertilizer_recommendation
from app.ml.crop_rules import rank_crops


def get_dashboard_summary(db: Session):
    """
    Builds the dashboard summary entirely from the latest
    sensor reading stored in the database.
    """
    sensor = get_latest_sensor_reading(db)

    if sensor is None:
        return None

    soil_result = assess_soil(
        sensor.nitrogen,
        sensor.phosphorus,
        sensor.potassium,
        sensor.ph,
        sensor.soil_moisture
    )

    irrigation_result = get_irrigation_status(
        sensor.soil_moisture
    )

    fertilizer_result = get_fertilizer_recommendation(
        sensor.nitrogen,
        sensor.phosphorus,
        sensor.potassium
    )

    ranking = rank_crops(
        sensor.soil_moisture,
        sensor.ph,
        sensor.nitrogen,
        sensor.phosphorus,
        sensor.potassium,
        sensor.ec if sensor.ec is not None else 0.0
    )

    best_crop = ranking[0]

    if best_crop["score"] >= 60:
        system_status = "Healthy"
    elif best_crop["score"] >= 40:
        system_status = "Needs Attention"
    else:
        system_status = "Critical"

    return {
        "soil_moisture": sensor.soil_moisture,
        "soil_ph": sensor.ph,
        "temperature": sensor.temperature,
        "humidity": sensor.humidity,
        "nitrogen": sensor.nitrogen,
        "phosphorus": sensor.phosphorus,
        "potassium": sensor.potassium,
        "soil_quality": soil_result["soil_quality"],
        "recommended_crop": best_crop["crop"],
        "irrigation_status": irrigation_result["message"],
        "fertilizer_status": fertilizer_result[0],
        "system_status": system_status
    }