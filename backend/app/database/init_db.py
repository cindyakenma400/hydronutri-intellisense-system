from app.database.database import Base
from app.database.database import engine

from app.models.sensor import SensorReading
from app.models.alert import Alert
from app.models.soil_assessment_schema import SoilAssessment
from app.models.irrigation import Irrigation
from app.models.fertilization import Fertilization
from app.models.recommendation import Recommendation
from app.models.disease import DiseaseDetection


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")