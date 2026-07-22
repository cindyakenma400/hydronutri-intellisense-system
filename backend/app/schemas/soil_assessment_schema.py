from pydantic import BaseModel


class SoilAssessmentResponse(BaseModel):
    soil_quality: str
    soil_score: int

    soil_moisture: float
    soil_ph: float

    nitrogen: float
    phosphorus: float
    potassium: float

    recommendation: str