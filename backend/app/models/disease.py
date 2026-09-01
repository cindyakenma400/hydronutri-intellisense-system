from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database.database import Base


class DiseaseDetection(Base):
    __tablename__ = "disease_detections"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    crop = Column(String)

    disease_detected = Column(String)

    confidence = Column(Float)

    severity = Column(String)

    treatment = Column(String)

    image_source = Column(String)

    image_filename = Column(String, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )