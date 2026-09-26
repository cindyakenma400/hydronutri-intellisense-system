from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.dependencies import get_db, require_user
from app.services.control_service import (
    enforce_pump_cutoff,
    set_pump,
    set_valve,
    set_auto_mode,
)

router = APIRouter(
    prefix="/controls",
    tags=["System Controls"]
)


class ControlCommand(BaseModel):
    """
    Body for the switch endpoints. Send {"on": true} or {"on": false}
    to set a state explicitly; a retried request then cannot flip it
    back. With no body, the endpoint toggles.
    """
    on: bool | None = None


def _serialize(state):
    return {
        "pump_on": state.pump_on,
        "valve_on": state.valve_on,
        "auto_mode": state.auto_mode,
    }


def _requested(command: ControlCommand | None) -> bool | None:
    return command.on if command else None


# Polled by the ESP32 and the dashboard, so it stays open.
@router.get("/status")
def control_status(db: Session = Depends(get_db)):
    return _serialize(enforce_pump_cutoff(db))


@router.post("/pump", dependencies=[Depends(require_user)])
def switch_pump(
    command: ControlCommand | None = None,
    db: Session = Depends(get_db),
):
    return _serialize(set_pump(db, _requested(command)))


@router.post("/valve", dependencies=[Depends(require_user)])
def switch_valve(
    command: ControlCommand | None = None,
    db: Session = Depends(get_db),
):
    return _serialize(set_valve(db, _requested(command)))


@router.post("/auto", dependencies=[Depends(require_user)])
def switch_auto_mode(
    command: ControlCommand | None = None,
    db: Session = Depends(get_db),
):
    return _serialize(set_auto_mode(db, _requested(command)))
