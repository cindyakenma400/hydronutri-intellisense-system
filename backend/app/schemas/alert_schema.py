from pydantic import BaseModel
from typing import List
from datetime import datetime


class Alert(BaseModel):
    """A stored alert. The id is what lets the frontend track read state."""

    id: int
    alert_type: str
    message: str
    severity: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    total_alerts: int
    unread_count: int
    alerts: List[Alert]


class MarkReadResponse(BaseModel):
    updated: int
    unread_count: int