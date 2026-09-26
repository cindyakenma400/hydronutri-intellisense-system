from sqlalchemy import Column, Integer, Boolean, DateTime
from datetime import datetime

from app.database.database import Base


class SystemControl(Base):
    """
    Stores the control state of the farm actuators.
    A single row holds the current state; the ESP32 polls
    /controls/status to know what to switch on or off.
    """
    __tablename__ = "system_controls"

    id = Column(Integer, primary_key=True, index=True)
    pump_on = Column(Boolean, default=False)
    valve_on = Column(Boolean, default=False)
    auto_mode = Column(Boolean, default=True)

    # When the pump last switched on and off; used for the maximum
    # runtime cutoff and the rest period before auto mode restarts it.
    pump_started_at = Column(DateTime, nullable=True)
    pump_stopped_at = Column(DateTime, nullable=True)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
