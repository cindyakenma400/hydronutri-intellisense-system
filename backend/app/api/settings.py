from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.settings import SystemSettings

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)


class SettingsUpdateRequest(BaseModel):
    auto_irrigation: bool | None = None
    moisture_trigger: float | None = None
    max_pump_minutes: int | None = None

    auto_fertilization: bool | None = None
    npk_trigger: float | None = None
    fertilizer_duration_seconds: int | None = None

    soil_quality_assessment: bool | None = None
    assessment_frequency_hours: int | None = None

    disease_detection: bool | None = None
    confidence_threshold: float | None = None

    notify_in_app: bool | None = None
    notify_email: bool | None = None
    notify_soil_moisture: bool | None = None
    notify_irrigation: bool | None = None
    notify_fertilization: bool | None = None
    notify_soil_quality: bool | None = None
    notify_disease: bool | None = None
    notify_system: bool | None = None


def _get_or_create(db: Session) -> SystemSettings:
    """Returns the single settings row, creating it with defaults on first use."""
    settings = db.query(SystemSettings).first()

    if settings is None:
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


def _serialize(settings: SystemSettings):
    return {
        "auto_irrigation": settings.auto_irrigation,
        "moisture_trigger": settings.moisture_trigger,
        "max_pump_minutes": settings.max_pump_minutes,
        "auto_fertilization": settings.auto_fertilization,
        "npk_trigger": settings.npk_trigger,
        "fertilizer_duration_seconds": settings.fertilizer_duration_seconds,
        "soil_quality_assessment": settings.soil_quality_assessment,
        "assessment_frequency_hours": settings.assessment_frequency_hours,
        "disease_detection": settings.disease_detection,
        "confidence_threshold": settings.confidence_threshold,
        "notify_in_app": settings.notify_in_app,
        "notify_email": settings.notify_email,
        "notify_soil_moisture": settings.notify_soil_moisture,
        "notify_irrigation": settings.notify_irrigation,
        "notify_fertilization": settings.notify_fertilization,
        "notify_soil_quality": settings.notify_soil_quality,
        "notify_disease": settings.notify_disease,
        "notify_system": settings.notify_system,
    }


@router.get("/")
def get_settings(db: Session = Depends(get_db)):
    return _serialize(_get_or_create(db))


@router.put("/")
def update_settings(
    body: SettingsUpdateRequest,
    db: Session = Depends(get_db),
):
    settings = _get_or_create(db)

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)

    return _serialize(settings)
