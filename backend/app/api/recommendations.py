from fastapi import APIRouter

router = APIRouter(
    prefix="/recommendations",
    tags=["Crop Recommendations"]
)

@router.get("/crop")
def recommend_crop():

    soil_moisture = 65
    soil_ph = 6.5
    nitrogen = 70
    phosphorus = 45
    potassium = 60

    if (
        6.0 <= soil_ph <= 7.0 and
        soil_moisture >= 60 and
        nitrogen >= 60
    ):
        crop = "Tomato"
        confidence = 92

    elif (
        5.5 <= soil_ph <= 6.8 and
        potassium >= 50
    ):
        crop = "Onion"
        confidence = 88

    else:
        crop = "Maize"
        confidence = 85

    return {
        "recommended_crop": crop,
        "confidence": confidence,
        "soil_moisture": soil_moisture,
        "soil_ph": soil_ph,
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "message": f"{crop} is the most suitable crop for the current soil conditions."
    }