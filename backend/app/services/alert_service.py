from sqlalchemy.orm import Session

from app.models.alert import Alert as AlertModel


def generate_alerts(sensor):
    """
    Builds alert messages from the latest sensor reading.
    """
    alerts = []

    if sensor.soil_moisture < 30:
        alerts.append({
            "type": "Irrigation Alert",
            "message": "Soil moisture is critically low."
        })

    elif sensor.soil_moisture > 85:
        alerts.append({
            "type": "Irrigation Alert",
            "message": "Soil is waterlogged. Pause irrigation."
        })

    if sensor.ph < 5.5:
        alerts.append({
            "type": "Soil pH Alert",
            "message": "Soil pH is below recommended range."
        })

    elif sensor.ph > 7.5:
        alerts.append({
            "type": "Soil pH Alert",
            "message": "Soil pH is above recommended range."
        })

    if sensor.nitrogen < 40:
        alerts.append({
            "type": "Nutrient Alert",
            "message": "Nitrogen level is low."
        })

    if sensor.phosphorus < 25:
        alerts.append({
            "type": "Nutrient Alert",
            "message": "Phosphorus level is low."
        })

    if sensor.potassium < 35:
        alerts.append({
            "type": "Nutrient Alert",
            "message": "Potassium level is low."
        })

    if sensor.ec is not None and sensor.ec > 3.0:
        alerts.append({
            "type": "Salinity Alert",
            "message": "Electrical conductivity is high. Salinity risk."
        })

    if not alerts:
        alerts.append({
            "type": "System Status",
            "message": "All parameters are within acceptable limits."
        })

    return alerts


def save_alerts(
    db: Session,
    alert_data
):

    saved = []

    for item in alert_data:

        # Do not fill the table with "all good" status rows
        if item["type"] == "System Status":
            continue

        alert = AlertModel(
            alert_type=item["type"],
            message=item["message"]
        )

        db.add(alert)
        saved.append(alert)

    if saved:
        db.commit()

    return saved


def get_alert_history(db: Session):

    return (
        db.query(AlertModel)
        .order_by(AlertModel.created_at.desc())
        .all()
    )