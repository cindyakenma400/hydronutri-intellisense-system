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


def init_db():
    Base.metadata.create_all(bind=engine)
    _add_missing_columns()


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")