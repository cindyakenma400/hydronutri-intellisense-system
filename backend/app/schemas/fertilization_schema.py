from pydantic import BaseModel
from typing import List


class FertilizationRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float


class FertilizationResponse(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    recommendations: List[str]