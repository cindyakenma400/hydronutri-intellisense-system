from sqlalchemy.orm import Session

from app.models.sensor import SensorReading


def create_sensor_reading(
    db: Session,
    sensor_data
):

    reading = SensorReading(
        temperature=sensor_data.temperature,
        humidity=sensor_data.humidity,
        soil_moisture=sensor_data.soil_moisture,
        nitrogen=sensor_data.nitrogen,
        phosphorus=sensor_data.phosphorus,
        potassium=sensor_data.potassium,
        ph=sensor_data.ph,
        ec=sensor_data.ec
    )

    db.add(reading)
    db.commit()
    db.refresh(reading)

    return reading


def get_sensor_history(db: Session):

    return (
        db.query(SensorReading)
        .order_by(SensorReading.created_at.desc())
        .all()
    )


def get_latest_sensor_reading(db: Session):

    return (
        db.query(SensorReading)
        .order_by(SensorReading.created_at.desc())
        .first()
    )