from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.services.control_service import (
    get_state,
    toggle_pump,
    toggle_valve,
    toggle_auto_mode,
)

router = APIRouter(
    prefix="/controls",
    tags=["System Controls"]
)


def _serialize(state):
    return {
        "pump_on": state.pump_on,
        "valve_on": state.valve_on,
        "auto_mode": state.auto_mode,
    }


@router.get("/status")
def control_status(db: Session = Depends(get_db)):
    return _serialize(get_state(db))


@router.post("/pump")
def switch_pump(db: Session = Depends(get_db)):
    return _serialize(toggle_pump(db))


@router.post("/valve")
def switch_valve(db: Session = Depends(get_db)):
    return _serialize(toggle_valve(db))


@router.post("/auto")
def switch_auto_mode(db: Session = Depends(get_db)):
    return _serialize(toggle_auto_mode(db))