from sqlalchemy.orm import Session

from app.models.fertilization import Fertilization


def get_fertilizer_recommendation(
    nitrogen,
    phosphorus,
    potassium
):

    recommendations = []

    if nitrogen < 50:
        recommendations.append(
            "Apply Nitrogen-rich fertilizer (Urea)"
        )

    if phosphorus < 40:
        recommendations.append(
            "Apply Phosphorus-rich fertilizer (DAP)"
        )

    if potassium < 50:
        recommendations.append(
            "Apply Potassium-rich fertilizer (MOP)"
        )

    if not recommendations:
        recommendations.append(
            "NPK levels are within acceptable range"
        )

    return recommendations


def save_fertilization_log(
    db: Session,
    nitrogen,
    phosphorus,
    potassium,
    recommendations
):

    log = Fertilization(
        nitrogen=nitrogen,
        phosphorus=phosphorus,
        potassium=potassium,
        recommendation="; ".join(recommendations)
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


def get_fertilization_history(db: Session):

    return (
        db.query(Fertilization)
        .order_by(Fertilization.created_at.desc())
        .all()
    )