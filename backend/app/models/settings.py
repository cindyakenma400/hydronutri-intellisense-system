from sqlalchemy import Column, Integer, Float, Boolean

from app.database.database import Base


class SystemSettings(Base):
    """
    Single-row table holding the automation and notification
    preferences configured on the frontend Settings page.
    """
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)

    auto_irrigation = Column(Boolean, default=True)
    moisture_trigger = Column(Float, default=30.0)
    max_pump_minutes = Column(Integer, default=15)

    auto_fertilization = Column(Boolean, default=True)
    npk_trigger = Column(Float, default=40.0)
    fertilizer_duration_seconds = Column(Integer, default=30)

    soil_quality_assessment = Column(Boolean, default=True)
    assessment_frequency_hours = Column(Integer, default=6)

    disease_detection = Column(Boolean, default=True)
    confidence_threshold = Column(Float, default=70.0)

    notify_in_app = Column(Boolean, default=True)
    notify_email = Column(Boolean, default=False)
    notify_soil_moisture = Column(Boolean, default=True)
    notify_irrigation = Column(Boolean, default=True)
    notify_fertilization = Column(Boolean, default=True)
    notify_soil_quality = Column(Boolean, default=True)
    notify_disease = Column(Boolean, default=True)
    notify_system = Column(Boolean, default=True)
