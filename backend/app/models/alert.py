from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Boolean
from sqlalchemy import DateTime

from datetime import datetime

from app.database.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    alert_type = Column(String)

    message = Column(String)

    # "critical" | "warning" | "info"
    severity = Column(
        String,
        default="info"
    )

    # False until the farmer opens the alerts panel.
    # This is what makes the navbar badge clearable.
    is_read = Column(
        Boolean,
        default=False
    )

    # Set to False once the condition no longer applies, so the same
    # alert is not raised twice while it is still active.
    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )