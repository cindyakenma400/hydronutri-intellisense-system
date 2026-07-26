from sqlalchemy.orm import Session

from app.models.irrigation import Irrigation


def get_irrigation_status(soil_moisture):

    if soil_moisture < 30:
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