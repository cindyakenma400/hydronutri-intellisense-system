from pydantic import BaseModel


class CropRecommendationRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float


class CropRecommendationResponse(BaseModel):
    crop: str
    confidence: float