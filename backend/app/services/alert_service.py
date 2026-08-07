from sqlalchemy.orm import Session

from app.models.alert import Alert as AlertModel


# Severity per alert type, used for colour coding in the UI.
SEVERITY_BY_TYPE = {
    "Irrigation Alert": "critical",
    "Salinity Alert": "critical",
    "Soil pH Alert": "warning",
    "Nutrient Alert": "warning",
    "System Status": "info",
}


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

    return alerts


def sync_alerts(db: Session, alert_data):
    """
    Reconciles the alerts table with the conditions that are true right now.

    This is the fix for the badge that never cleared. Previously every call
    inserted a fresh row, so an alert you had already read reappeared as new
    a few seconds later. Now:

      - an alert that is already active is left untouched (keeps its id and
        its is_read flag)
      - an alert whose condition has cleared is deactivated
      - only genuinely new conditions create a new row
    """
    current = {
        (item["type"], item["message"])
        for item in alert_data
    }

    active = (
        db.query(AlertModel)
        .filter(AlertModel.is_active == True)  # noqa: E712
        .order_by(AlertModel.created_at.desc())
        .all()
    )

    # Keep one row per condition and retire the rest. This also cleans up
    # the duplicate rows the previous version created on every poll.
    existing = {}

    for alert in active:
        key = (alert.alert_type, alert.message)

        if key in existing:
            alert.is_active = False   # duplicate of one we already kept
            continue

        existing[key] = alert

    # Retire alerts whose condition no longer applies.
    for key, alert in existing.items():
        if key not in current:
            alert.is_active = False

    # Insert only conditions we are not already tracking.
    for item in alert_data:
        key = (item["type"], item["message"])

        if key in existing:
            continue

        db.add(AlertModel(
            alert_type=item["type"],
            message=item["message"],
            severity=SEVERITY_BY_TYPE.get(item["type"], "info"),
            is_read=False,
            is_active=True,
        ))

    db.commit()


def get_active_alerts(db: Session):
    return (
        db.query(AlertModel)
        .filter(AlertModel.is_active == True)  # noqa: E712
        .order_by(AlertModel.created_at.desc())
        .all()
    )


def count_unread(db: Session) -> int:
    return (
        db.query(AlertModel)
        .filter(AlertModel.is_active == True)  # noqa: E712
        .filter(AlertModel.is_read == False)  # noqa: E712
        .count()
    )


def mark_alert_read(db: Session, alert_id: int) -> int:
    alert = (
        db.query(AlertModel)
        .filter(AlertModel.id == alert_id)
        .first()
    )

    if alert is None or alert.is_read:
        return 0

    alert.is_read = True
    db.commit()
    return 1


def mark_all_read(db: Session) -> int:
    updated = (
        db.query(AlertModel)
        .filter(AlertModel.is_active == True)  # noqa: E712
        .filter(AlertModel.is_read == False)  # noqa: E712
        .update({AlertModel.is_read: True})
    )

    db.commit()
    return updated


def get_alert_history(db: Session):
    return (
        db.query(AlertModel)
        .order_by(AlertModel.created_at.desc())
        .all()
    )