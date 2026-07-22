from pydantic import BaseModel


class IrrigationRequest(BaseModel):
    soil_moisture: float
    temperature: float
    humidity: float


class IrrigationResponse(BaseModel):
    irrigation_needed: bool
    water_amount_liters: float
    message: str