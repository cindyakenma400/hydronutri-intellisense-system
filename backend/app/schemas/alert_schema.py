from pydantic import BaseModel
from typing import List


class Alert(BaseModel):
    type: str
    message: str


class AlertResponse(BaseModel):
    total_alerts: int
    alerts: List[Alert]