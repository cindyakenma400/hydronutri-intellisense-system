from app.services.sensor_service import get_sensor_data
from app.services.soil_assessment_service import assess_soil
from app.services.irrigation_service import get_irrigation_status
from app.services.fertilization_service import get_fertilizer_recommendation


def get_dashboard_summary():

    sensor_data = get_sensor_data()

    soil_result = assess_soil(
        sensor_data["nitrogen"],
        sensor_data["phosphorus"],
        sensor_data["potassium"],
        sensor_data["ph"],
        sensor_data["soil_moisture"]
    )

    irrigation_result = get_irrigation_status(
        sensor_data["soil_moisture"]
    )

    fertilizer_result = get_fertilizer_recommendation(
        sensor_data["nitrogen"],
        sensor_data["phosphorus"],
        sensor_data["potassium"]
    )

    return {
        "soil_moisture": sensor_data["soil_moisture"],
        "soil_ph": sensor_data["ph"],
        "temperature": sensor_data["temperature"],
        "humidity": sensor_data["humidity"],
        "nitrogen": sensor_data["nitrogen"],
        "phosphorus": sensor_data["phosphorus"],
        "potassium": sensor_data["potassium"],
        "soil_quality": soil_result["soil_quality"],
        "recommended_crop": "Tomato",
        "irrigation_status": irrigation_result["message"],
        "fertilizer_status": fertilizer_result[0],
        "system_status": "Healthy"
    }