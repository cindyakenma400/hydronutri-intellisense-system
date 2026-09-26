from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.control import SystemControl
from app.models.settings import SystemSettings

# Auto mode switches the pump off once moisture climbs this many
# points above the trigger, so it does not flicker on and off
# around a single value.
MOISTURE_HYSTERESIS = 10.0

# After a stop, auto mode waits this long before starting the pump
# again, so a sensor stuck at a low value cannot run it back to back.
PUMP_REST_MINUTES = 5


def get_state(db: Session) -> SystemControl:
    """
    Returns the single control-state row,
    creating it with defaults on first use.
    """
    state = db.query(SystemControl).first()

    if state is None:
        state = SystemControl(
            pump_on=False,
            valve_on=False,
            auto_mode=True,
        )
        db.add(state)
        db.commit()
        db.refresh(state)

    return state


def _get_settings(db: Session) -> SystemSettings:
    settings = db.query(SystemSettings).first()

    if settings is None:
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


def _switch_pump(state: SystemControl, on: bool) -> None:
    if on and not state.pump_on:
        state.pump_started_at = datetime.utcnow()
    elif not on and state.pump_on:
        state.pump_stopped_at = datetime.utcnow()

    state.pump_on = on


def enforce_pump_cutoff(db: Session) -> SystemControl:
    """
    Stops the pump once it has run longer than the maximum runtime
    from Settings. Applies to manual and automatic starts alike, and
    runs on every status poll, so the pump cannot be left running if
    someone forgets it or the sensor stops reporting.
    """
    state = get_state(db)

    if state.pump_on and state.pump_started_at is not None:
        limit = timedelta(minutes=_get_settings(db).max_pump_minutes or 15)

        if datetime.utcnow() - state.pump_started_at >= limit:
            _switch_pump(state, False)
            db.commit()
            db.refresh(state)

    return state


def set_pump(db: Session, on: bool | None) -> SystemControl:
    """
    Sets the pump explicitly, or flips it when on is None.

    A manual command turns auto mode off; otherwise the next sensor
    reading would undo what the user just asked for.
    """
    state = get_state(db)
    _switch_pump(state, (not state.pump_on) if on is None else on)
    state.auto_mode = False
    db.commit()
    db.refresh(state)
    return state


def set_valve(db: Session, on: bool | None) -> SystemControl:
    state = get_state(db)
    state.valve_on = (not state.valve_on) if on is None else on
    db.commit()
    db.refresh(state)
    return state


def set_auto_mode(db: Session, on: bool | None) -> SystemControl:
    state = get_state(db)
    state.auto_mode = (not state.auto_mode) if on is None else on

    # The rest period guards against auto mode cycling the pump. A stop
    # the user made by hand should not delay auto mode taking over.
    if state.auto_mode:
        state.pump_stopped_at = None

    db.commit()
    db.refresh(state)
    return state


def apply_auto_irrigation(db: Session, reading) -> SystemControl:
    """
    Runs after every sensor upload. With auto mode on (dashboard) and
    automatic irrigation enabled (Settings), starts the pump when soil
    moisture falls below the trigger and stops it once moisture is back
    above trigger + MOISTURE_HYSTERESIS.
    """
    state = get_state(db)

    if not state.auto_mode:
        return state

    settings = _get_settings(db)

    if not settings.auto_irrigation:
        return state

    # An all-zero frame means the soil sensor is disconnected or failed
    # to answer; irrigating on it would flood the field.
    values = (
        reading.soil_moisture,
        reading.temperature,
        reading.ph,
        reading.nitrogen,
        reading.phosphorus,
        reading.potassium,
    )
    if not any(values):
        return state

    trigger = settings.moisture_trigger
    moisture = reading.soil_moisture

    if not state.pump_on and moisture < trigger:
        rested = state.pump_stopped_at is None or (
            datetime.utcnow() - state.pump_stopped_at
            >= timedelta(minutes=PUMP_REST_MINUTES)
        )
        if rested:
            _switch_pump(state, True)

    elif state.pump_on and moisture >= trigger + MOISTURE_HYSTERESIS:
        _switch_pump(state, False)

    db.commit()
    db.refresh(state)
    return state
