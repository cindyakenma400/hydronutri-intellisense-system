from sqlalchemy.orm import Session

from app.models.soil_assessment_schema import SoilAssessment


def assess_soil(
    nitrogen,
    phosphorus,
    potassium,
    ph,
    moisture
):

    score = 0

    if 6.0 <= ph <= 7.5:
        score += 25

    if moisture >= 60:
        score += 25

    if nitrogen >= 50:
        score += 15

    if phosphorus >= 40:
        score += 15

    if potassium >= 50:
        score += 20

    if score >= 80:
        quality = "Excellent"
        recommendation = (
            "Highly suitable for Tomato cultivation"
        )

    elif score >= 60:
        quality = "Good"
        recommendation = (
            "Suitable for Tomato cultivation"
        )

    else:
        quality = "Poor"
        recommendation = (
            "Soil improvement required"
        )

    return {
        "soil_quality": quality,
        "soil_score": score,
        "recommendation": recommendation
    }


def save_soil_assessment(
    db: Session,
    result,
    moisture,
    ph,
    nitrogen,
    phosphorus,
    potassium
):

    assessment = SoilAssessment(
        soil_quality=result["soil_quality"],
        soil_score=result["soil_score"],
        soil_moisture=moisture,
        soil_ph=ph,
        nitrogen=nitrogen,
        phosphorus=phosphorus,
        potassium=potassium,
        recommendation=result["recommendation"]
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return assessment