import os
import json

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
    Primary: the rule engine scores every crop against optimal
    thresholds and picks the best one with a transparent 0-100%
    suitability score.

    Backup: if the rule engine ranking is empty (should not happen),
    the trained Random Forest predicts the crop instead.

    The ML model still runs when available so its prediction can be
    compared in the thesis, but it no longer drives the dashboard.
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
    crop = best["crop"]
    confidence = best["score"]
    source = "rule_engine"
    probabilities = {
        item["crop"]: round(item["score"] / 100, 4)
        for item in ranking
    }
    message = (
        f"{crop} is the most suitable crop for the current soil "
        f"conditions ({best['suitability']})."
    )

    prediction = _predict(sensor)
    ml_crop = None
    ml_confidence = None

    if prediction is not None:
        ml_crop, ml_probabilities = prediction
        ml_confidence = round(ml_probabilities.get(ml_crop, 0.0) * 100, 1)

    save_recommendation(
        db,
        crop,
        confidence,
        sensor,
        ec_value,
        best.get("limiting_factors", []),
        best.get("suggestions", []),
        message,
    )

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
        "ml_crop": ml_crop,
        "ml_confidence": ml_confidence,
    }


def save_recommendation(
    db: Session,
    crop,
    confidence,
    sensor,
    ec_value,
    limiting_factors,
    suggestions,
    message,
):
    """
    Records a recommendation, but only when it is meaningfully different
    from the most recent one. The page polls every few seconds, so without
    this check the history would fill with identical rows. A new entry is
    kept only when the recommended crop or its limiting factors change.
    """
    factors_json = json.dumps(limiting_factors)

    latest = (
        db.query(Recommendation)
        .order_by(Recommendation.created_at.desc())
        .first()
    )

    if (
        latest is not None
        and latest.recommended_crop == crop
        and (latest.limiting_factors or "[]") == factors_json
    ):
        return latest

    recommendation = Recommendation(
        recommended_crop=crop,
        confidence=confidence,
        soil_moisture=sensor.soil_moisture,
        soil_ph=sensor.ph,
        nitrogen=sensor.nitrogen,
        phosphorus=sensor.phosphorus,
        potassium=sensor.potassium,
        ec=ec_value,
        limiting_factors=factors_json,
        suggestions=json.dumps(suggestions),
        message=message,
    )

    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return recommendation


def _parse_list(value):
    """Turns a stored JSON string back into a list, tolerating old rows."""
    if not value:
        return []
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, list) else []
    except (ValueError, TypeError):
        return []


def get_recommendation_history(db: Session, limit: int = 50):

    records = (
        db.query(Recommendation)
        .order_by(Recommendation.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": r.id,
            "recommended_crop": r.recommended_crop,
            "confidence": r.confidence,
            "soil_moisture": r.soil_moisture or 0.0,
            "soil_ph": r.soil_ph or 0.0,
            "nitrogen": r.nitrogen or 0.0,
            "phosphorus": r.phosphorus or 0.0,
            "potassium": r.potassium or 0.0,
            "ec": r.ec or 0.0,
            "limiting_factors": _parse_list(r.limiting_factors),
            "suggestions": _parse_list(r.suggestions),
            "message": r.message or "",
            "created_at": r.created_at,
        }
        for r in records
    ]