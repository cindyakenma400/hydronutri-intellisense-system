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
from app.models.user import User
from app.models.settings import SystemSettings


def _add_column(table, column, definition):
    """Adds one column if the table exists and the column does not."""
    inspector = inspect(engine)

    if table not in inspector.get_table_names():
        return

    existing = [
        col["name"]
        for col in inspector.get_columns(table)
    ]

    if column in existing:
        return

    with engine.begin() as conn:
        conn.execute(text(
            f"ALTER TABLE {table} ADD COLUMN {column} {definition}"
        ))

    print(f"Migration: added '{column}' column to {table}")


def _add_missing_columns():
    """
    Lightweight migration: adds columns that were introduced
    after the database file was first created, without losing
    any existing data.
    """
    _add_column("sensor_readings", "ec", "FLOAT DEFAULT 0.0")

    # Read state and severity for the navbar alerts badge.
    _add_column("alerts", "severity", "VARCHAR DEFAULT 'info'")
    _add_column("alerts", "is_read", "BOOLEAN DEFAULT 0")
    _add_column("alerts", "is_active", "BOOLEAN DEFAULT 1")

    # Stored leaf photo, shown in the disease history table.
    _add_column("disease_detections", "image_filename", "VARCHAR")

    # Pump runtime cutoff and rest period.
    _add_column("system_controls", "pump_started_at", "DATETIME")
    _add_column("system_controls", "pump_stopped_at", "DATETIME")

    # Fertilizer valve timing.
    _add_column("system_controls", "valve_started_at", "DATETIME")
    _add_column("system_controls", "valve_stopped_at", "DATETIME")

    # Current crop selection and moisture stop point.
    _add_column("system_settings", "current_crop", "VARCHAR DEFAULT NULL")
    _add_column("system_settings", "moisture_stop", "FLOAT DEFAULT 80.0")

    # Soil snapshot and reasons stored with each crop recommendation,
    # so the recommendation history shows why each one was made.
    _add_column("crop_recommendations", "soil_moisture", "FLOAT DEFAULT 0.0")
    _add_column("crop_recommendations", "soil_ph", "FLOAT DEFAULT 0.0")
    _add_column("crop_recommendations", "nitrogen", "FLOAT DEFAULT 0.0")
    _add_column("crop_recommendations", "phosphorus", "FLOAT DEFAULT 0.0")
    _add_column("crop_recommendations", "potassium", "FLOAT DEFAULT 0.0")
    _add_column("crop_recommendations", "ec", "FLOAT DEFAULT 0.0")
    _add_column("crop_recommendations", "limiting_factors", "VARCHAR DEFAULT '[]'")
    _add_column("crop_recommendations", "suggestions", "VARCHAR DEFAULT '[]'")
    _add_column("crop_recommendations", "message", "VARCHAR DEFAULT ''")


def init_db():
    Base.metadata.create_all(bind=engine)
    _add_missing_columns()


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")