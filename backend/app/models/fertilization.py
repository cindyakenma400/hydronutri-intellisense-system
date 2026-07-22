from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database.database import Base


class Fertilization(Base):
    __tablename__ = "fertilization_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nitrogen = Column(Float)

    phosphorus = Column(Float)

    potassium = Column(Float)

    recommendation = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )