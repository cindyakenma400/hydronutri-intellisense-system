from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database.database import Base


class SoilAssessment(Base):
    __tablename__ = "soil_assessments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    soil_quality = Column(String)

    soil_score = Column(Integer)

    soil_moisture = Column(Float)

    soil_ph = Column(Float)

    nitrogen = Column(Float)

    phosphorus = Column(Float)

    potassium = Column(Float)

    recommendation = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )