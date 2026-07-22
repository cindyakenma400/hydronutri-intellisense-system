from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Boolean
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database.database import Base


class Irrigation(Base):
    __tablename__ = "irrigation_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    irrigation_needed = Column(Boolean)

    water_amount_liters = Column(Float)

    message = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )