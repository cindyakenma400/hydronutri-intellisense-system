from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.irrigation import Irrigation
from app.models.settings import SystemSettings


def _get_settings() -> SystemSettings:
    """
    Reads the system settings row in its own short-lived session, so
    get_irrigation_status() does not need a db session threaded through it.
    """
    db = SessionLocal()

    try:
        settings = db.query(SystemSettings).first()

        if settings is None:
            settings = SystemSettings()
            db.add(settings)
            db.commit()
            db.refresh(settings)

        return settings
    finally:
        db.close()


def get_irrigation_status(soil_moisture):
    settings = _get_settings()

    if not settings.auto_irrigation:
        return {
            "irrigation_needed": False,
            "water_amount_liters": 0.0,
            "message": "Automatic irrigation is disabled"
        }

    if soil_moisture < settings.moisture_trigger:
        return {
            "irrigation_needed": True,
            "water_amount_liters": 15.0,
            "message": "Irrigation Required"
        }

    elif soil_moisture < 60:
        return {
            "irrigation_needed": True,
            "water_amount_liters": 5.0,
            "message": "Monitor Moisture Level"
        }

    return {
        "irrigation_needed": False,
        "water_amount_liters": 0.0,
        "message": "Soil Moisture Adequate"
    }


def save_irrigation_log(
    db: Session,
    result
):

    irrigation = Irrigation(
        irrigation_needed=result["irrigation_needed"],
        water_amount_liters=result["water_amount_liters"],
        message=result["message"]
    )

    db.add(irrigation)
    db.commit()
    db.refresh(irrigation)

    return irrigation

def get_irrigation_history(db: Session):

    return (
        db.query(Irrigation)
        .order_by(Irrigation.created_at.desc())
        .all()
    )