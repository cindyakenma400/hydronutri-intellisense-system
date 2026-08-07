from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime


class CropRecommendationRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float


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

    # "machine_learning" when the trained model made the call,
    # "rule_engine" when it fell back to the threshold rules.
    prediction_source: str

    # Probability for every crop the model knows, 0.0 - 1.0.
    probabilities: Dict[str, float]

    # Explanation for the recommended crop, from the rule engine.
    limiting_factors: List[str]
    suggestions: List[str]

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