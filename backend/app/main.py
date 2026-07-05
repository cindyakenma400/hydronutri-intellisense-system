from fastapi import FastAPI
from app.api.soil_assessment import router as soil_router

app = FastAPI(
    title="HydroNutri IntelliSense API",
    version="1.0.0"
)

app.include_router(soil_router)

@app.get("/")
def root():
    return {
        "message": "HydroNutri IntelliSense Backend Running"
    }