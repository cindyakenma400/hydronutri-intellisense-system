from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import DateTime

from datetime import datetime

from app.database.database import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    temperature = Column(Float)
    humidity = Column(Float)

    soil_moisture = Column(Float)

    ph = Column(Float)

    nitrogen = Column(Float)
    phosphorus = Column(Float)
    potassium = Column(Float)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )