from pydantic import BaseModel
from typing import List


class DiseasePredictionResponse(BaseModel):
    crop: str
    disease_detected: str
    confidence: float
    severity: str

    treatment: List[str]

    status: str
    image_source: str
    recommended_action: str