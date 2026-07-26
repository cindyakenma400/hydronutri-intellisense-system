from pydantic import BaseModel
from typing import List
from datetime import datetime


class CropRecommendationRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float


class CropScore(BaseModel):
    crop: str
    score: float
    suitability: str
    limiting_factors: List[str]
    suggestions: List[str]


class CropRecommendationResponse(BaseModel):
    recommended_crop: str
    confidence: float
    message: str

    soil_moisture: float
    soil_ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    ec: float

    ranking: List[CropScore]


class RecommendationHistoryItem(BaseModel):
    id: int
    recommended_crop: str
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True