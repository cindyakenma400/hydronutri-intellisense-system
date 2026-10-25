from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database.database import Base


class Recommendation(Base):
    __tablename__ = "crop_recommendations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    recommended_crop = Column(String)

    confidence = Column(Float)

    # Soil snapshot at the time the recommendation was made, so the
    # farmer can see the conditions behind each past recommendation.
    soil_moisture = Column(Float, default=0.0)
    soil_ph = Column(Float, default=0.0)
    nitrogen = Column(Float, default=0.0)
    phosphorus = Column(Float, default=0.0)
    potassium = Column(Float, default=0.0)
    ec = Column(Float, default=0.0)

    # Why this recommendation was given (JSON-encoded lists of strings).
    limiting_factors = Column(String, default="[]")
    suggestions = Column(String, default="[]")
    message = Column(String, default="")

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )