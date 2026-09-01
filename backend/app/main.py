from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.database.init_db import init_db

from app.api.soil_assessment import router as soil_router
from app.api.sensor import router as sensor_router
from app.api.irrigation import router as irrigation_router
from app.api.fertilization import router as fertilization_router
from app.api.recommendations import router as recommendation_router
from app.api.disease_detection import router as disease_router
from app.api.alerts import router as alerts_router
from app.api.dashboard import router as dashboard_router
from app.api.controls import router as controls_router
from app.api.auth import router as auth_router
from app.api.devices import router as devices_router
from app.api.settings import router as settings_router

app = FastAPI(
    title="HydroNutri IntelliSense API",
    version="1.0.0"
)

# Create any missing tables/columns before serving requests
init_db()

# Allow the Next.js frontend (and local tools) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_leaf_dir = Path(__file__).resolve().parents[1] / "uploaded_leaves"
_leaf_dir.mkdir(exist_ok=True)
app.mount("/uploaded_leaves", StaticFiles(directory=str(_leaf_dir)), name="uploaded_leaves")


app.include_router(soil_router)
app.include_router(sensor_router)
app.include_router(irrigation_router)
app.include_router(fertilization_router)
app.include_router(recommendation_router)
app.include_router(disease_router)
app.include_router(alerts_router)
app.include_router(dashboard_router)
app.include_router(controls_router)
app.include_router(auth_router)
app.include_router(devices_router)
app.include_router(settings_router)


@app.get("/")
def root():
    return {
        "message": "HydroNutri IntelliSense Backend Running"
    }