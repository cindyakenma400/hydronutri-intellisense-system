import os

from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation
from app.ml.crop_rules import rank_crops
from app.services.sensor_service import get_latest_sensor_reading


# ---------------------------------------------------------------- ML model

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "ml", "models", "crop_model.pkl"
)

_bundle = None
_load_error = None


def _load_model():
    """
    Loads the trained Random Forest once, on first use.

    If the file or joblib is missing, the error is remembered and the
    endpoint falls back to the rule engine instead of crashing.
    """
    global _bundle, _load_error

    if _bundle is not None or _load_error is not None:
        return _bundle

    try:
        import joblib
        _bundle = joblib.load(MODEL_PATH)
        print(f"Crop model loaded from {MODEL_PATH}")
    except Exception as error:
        _load_error = str(error)
        print(f"Crop model unavailable ({error}). Using rule engine only.")

    return _bundle


def _predict(sensor):
    """
    Runs the ML model on one sensor reading.

    Returns (crop, {crop: probability}) or None when the model is missing.
    Note the name mapping: the database stores nitrogen/phosphorus/potassium
    while the model was trained on N/P/K.
    """
    bundle = _load_model()

    if bundle is None:
        return None

    values = {
        "N": sensor.nitrogen,
        "P": sensor.phosphorus,
        "K": sensor.potassium,
        "temperature": sensor.temperature,
        "humidity": sensor.humidity,
        "ph": sensor.ph,
    }

    # The pkl carries the feature order the model was trained with, so
    # the row is always built in the correct order.
    features = bundle["features"]

    if any(values.get(name) is None for name in features):
        return None

    try:
        import pandas as pd
        row = pd.DataFrame([{name: values[name] for name in features}])

        model = bundle["model"]
        crop = str(model.predict(row)[0])

        probabilities = {
            str(label): round(float(probability), 4)
            for label, probability in zip(
                model.classes_,
                model.predict_proba(row)[0]
            )
        }

        return crop, probabilities

    except Exception as error:
        print(f"Crop prediction failed: {error}")
        return None


# ------------------------------------------------------------- main entry

def recommend_crop(db: Session):
    """
    Combines two engines:

      - the trained Random Forest decides WHICH crop suits the soil
      - the rule engine explains WHY, and what to amend

    If the model is unavailable the rule engine's own top crop is used,
    so the endpoint keeps working either way.
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

    prediction = _predict(sensor)

    if prediction is not None:
        crop, probabilities = prediction
        source = "machine_learning"
        confidence = round(probabilities.get(crop, 0.0) * 100, 1)

        # Find the rule-engine entry for the ML choice so we can attach
        # its limiting factors and amendment suggestions.
        match = next(
            (item for item in ranking
             if item["crop"].lower() == crop.lower()),
            None
        )
        best = match if match is not None else ranking[0]

        message = (
            f"{crop} is predicted as the most suitable crop for the "
            f"current soil conditions ({confidence}% confidence)."
        )
    else:
        best = ranking[0]
        crop = best["crop"]
        source = "rule_engine"
        confidence = best["score"]
        probabilities = {
            item["crop"]: round(item["score"] / 100, 4)
            for item in ranking
        }
        message = (
            f"{crop} is the most suitable crop for the current soil "
            f"conditions ({best['suitability']})."
        )

    save_recommendation(db, crop, confidence)

    return {
        "recommended_crop": crop,
        "confidence": confidence,
        "prediction_source": source,
        "probabilities": probabilities,
        "message": message,
        "limiting_factors": best.get("limiting_factors", []),
        "suggestions": best.get("suggestions", []),
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