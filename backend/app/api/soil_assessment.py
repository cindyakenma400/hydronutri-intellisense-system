from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.schemas.soil_assessment_schema import (
    SoilAssessmentResponse
)

from app.services.soil_assessment_service import (
    assess_soil,
    save_soil_assessment
)

from app.services.sensor_service import (
    get_latest_sensor_reading
)

router = APIRouter(
    prefix="/soil",
    tags=["Soil Assessment"]
)


@router.get(
    "/analyze",
    response_model=SoilAssessmentResponse
)
def analyze_soil(
    db: Session = Depends(get_db)
):

    sensor = get_latest_sensor_reading(db)

    result = assess_soil(
        sensor.nitrogen,
        sensor.phosphorus,
        sensor.potassium,
        sensor.ph,
        sensor.soil_moisture
    )

    assessment = save_soil_assessment(
        db,
        result,
        sensor.soil_moisture,
        sensor.ph,
        sensor.nitrogen,
        sensor.phosphorus,
        sensor.potassium
    )

    return assessment