from sqlalchemy import inspect
from sqlalchemy import text

from app.database.database import Base
from app.database.database import engine

from app.models.sensor import SensorReading
from app.models.alert import Alert
from app.models.soil_assessment_schema import SoilAssessment
from app.models.irrigation import Irrigation
from app.models.fertilization import Fertilization
from app.models.recommendation import Recommendation
from app.models.disease import DiseaseDetection
from app.models.control import SystemControl


def _add_missing_columns():
    """
    Lightweight migration: adds columns that were introduced
    after the database file was first created, without losing
    any existing data.
    """
    inspector = inspect(engine)

    if "sensor_readings" in inspector.get_table_names():
        existing = [
            col["name"]
            for col in inspector.get_columns("sensor_readings")
        ]

        if "ec" not in existing:
            with engine.begin() as conn:
                conn.execute(text(
                    "ALTER TABLE sensor_readings "
                    "ADD COLUMN ec FLOAT DEFAULT 0.0"
                ))
            print("Migration: added 'ec' column to sensor_readings")


def init_db():
    Base.metadata.create_all(bind=engine)
    _add_missing_columns()


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")