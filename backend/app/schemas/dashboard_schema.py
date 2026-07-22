from pydantic import BaseModel


class DashboardSummary(BaseModel):
    soil_moisture: float
    soil_ph: float
    temperature: float
    humidity: float
    nitrogen: float
    phosphorus: float
    potassium: float

    soil_quality: str
    recommended_crop: str

    irrigation_status: str
    fertilizer_status: str
    system_status: str