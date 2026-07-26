from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SensorCreate(BaseModel):
    temperature: float
    humidity: float
    soil_moisture: float
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    ec: float = 0.0


class SensorResponse(BaseModel):
    id: int

    temperature: float
    humidity: float
    soil_moisture: float

    nitrogen: float
    phosphorus: float
    potassium: float

    ph: float
    ec: Optional[float] = 0.0

    created_at: datetime

    class Config:
        from_attributes = True