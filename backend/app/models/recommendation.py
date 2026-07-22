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

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )