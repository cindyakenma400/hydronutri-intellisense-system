from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation
from app.ml.crop_rules import rank_crops
from app.services.sensor_service import get_latest_sensor_reading


def recommend_crop(db: Session):
    """
    Reads the latest sensor reading from the database, ranks all
    target crops by soil suitability, saves the top recommendation
    to the crop_recommendations table and returns the full result.
    """
    sensor = get_latest_sensor_reading(db)

    if sensor is None:
        return None

    ec_value = sensor.ec if sensor.ec is not None else 0.0

    ranking = rank_crops(
        sensor.soil_moisture,
        sensor.ph,
        sensor.nitrogen,
        sensor.phosphorus,
        sensor.potassium,
        ec_value
    )

    best = ranking[0]

    save_recommendation(
        db,
        best["crop"],
        best["score"]
    )

    return {
        "recommended_crop": best["crop"],
        "confidence": best["score"],
        "message": (
            f"{best['crop']} is the most suitable crop for the "
            f"current soil conditions ({best['suitability']})."
        ),
        "soil_moisture": sensor.soil_moisture,
        "soil_ph": sensor.ph,
        "nitrogen": sensor.nitrogen,
        "phosphorus": sensor.phosphorus,
        "potassium": sensor.potassium,
        "ec": ec_value,
        "ranking": ranking,
    }


def save_recommendation(
    db: Session,
    crop,
    confidence
):

    recommendation = Recommendation(
        recommended_crop=crop,
        confidence=confidence
    )

    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return recommendation


def get_recommendation_history(db: Session):

    return (
        db.query(Recommendation)
        .order_by(Recommendation.created_at.desc())
        .all()
    )