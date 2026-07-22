from pydantic import BaseModel
from datetime import datetime


class SensorCreate(BaseModel):
    temperature: float
    humidity: float
    soil_moisture: float
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float


class SensorResponse(BaseModel):
    id: int

    temperature: float
    humidity: float
    soil_moisture: float

    nitrogen: float
    phosphorus: float
    potassium: float

    ph: float

    created_at: datetime

    class Config:
        from_attributes = True