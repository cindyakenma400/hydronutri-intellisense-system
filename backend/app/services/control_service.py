from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.control import SystemControl
from app.models.sensor import SensorReading
from app.models.settings import SystemSettings
from app.utils.thresholds import CROP_THRESHOLDS

PUMP_REST_SECONDS = 30


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


def _switch_valve(state: SystemControl, on: bool) -> None:
    if on and not state.valve_on:
        state.valve_started_at = datetime.utcnow()
    elif not on and state.valve_on:
        state.valve_stopped_at = datetime.utcnow()

    state.valve_on = on


def _is_sensor_frame_empty(reading) -> bool:
    """
    An all-zero frame means the soil sensor is disconnected or failed
    to answer; acting on it would flood or over-fertilize the field.
    """
    values = (
        reading.soil_moisture,
        reading.temperature,
        reading.ph,
        reading.nitrogen,
        reading.phosphorus,
        reading.potassium,
    )
    return not any(values)


def enforce_pump_cutoff(db: Session) -> SystemControl:
    """
    Stops the pump once it has run longer than the maximum runtime
    from Settings. Applies to manual and automatic starts alike, and
    runs on every status poll, so the pump cannot be left running if
    someone forgets it or the sensor stops reporting.

    Also closes the fertilizer valve once the dose duration from
    Settings has passed, for manual and automatic doses alike.
    """
    state = get_state(db)
    now = datetime.utcnow()
    changed = False

    # A pump or valve switched on before the start-time columns existed
    # has no start time, so the cutoff below would never fire. Start
    # its clock now instead.
    if state.pump_on and state.pump_started_at is None:
        state.pump_started_at = now
        changed = True
    if state.valve_on and state.valve_started_at is None:
        state.valve_started_at = now
        changed = True

    if state.pump_on and state.pump_started_at is not None:
        settings = _get_settings(db)
        limit = timedelta(minutes=settings.max_pump_minutes or 15)

        if now - state.pump_started_at >= limit:
            _switch_pump(state, False)
            changed = True

    if changed:
        db.commit()
        db.refresh(state)

    return state


def set_pump(db: Session, on: bool | None) -> SystemControl:
    """
    Sets the pump explicitly, or flips it when on is None.

    Auto mode stays on so the moisture thresholds still apply: the pump
    will auto-stop at the moisture_stop level even after a manual start,
    and auto-start when moisture drops below the trigger. The 5-minute
    rest period after any stop prevents immediate re-start.
    """
    state = get_state(db)
    _switch_pump(state, (not state.pump_on) if on is None else on)
    db.commit()
    db.refresh(state)
    return state


def set_valve(db: Session, on: bool | None) -> SystemControl:
    state = get_state(db)
    _switch_valve(state, (not state.valve_on) if on is None else on)
    db.commit()
    db.refresh(state)
    return state


def set_auto_mode(db: Session, on: bool | None) -> SystemControl:
    state = get_state(db)
    state.auto_mode = (not state.auto_mode) if on is None else on

    if state.auto_mode:
        state.pump_stopped_at = None
        state.valve_stopped_at = None

        reading = (
            db.query(SensorReading)
            .order_by(SensorReading.id.desc())
            .first()
        )

        if reading and not _is_sensor_frame_empty(reading):
            settings = _get_settings(db)

            if settings.current_crop:
                moisture = reading.soil_moisture
                if moisture >= settings.moisture_stop:
                    _switch_pump(state, False)
                else:
                    _switch_pump(state, True)

            if settings.auto_fertilization and settings.current_crop:
                crop = settings.current_crop
                thresholds = CROP_THRESHOLDS.get(crop)
                if thresholds:
                    _, n_low, _, _ = thresholds["n"]
                    _, p_low, _, _ = thresholds["p"]
                    _, k_low, _, _ = thresholds["k"]
                    if (reading.nitrogen < n_low
                            or reading.phosphorus < p_low
                            or reading.potassium < k_low):
                        _switch_valve(state, True)
    else:
        _switch_pump(state, False)
        _switch_valve(state, False)

    db.commit()
    db.refresh(state)
    return state


def apply_auto_irrigation(db: Session, reading) -> SystemControl:
    """
    Runs after every sensor upload. With auto mode on (dashboard) and
    automatic irrigation enabled (Settings):
      - Starts the pump when soil moisture drops below moisture_trigger (45%)
      - Stops the pump when soil moisture reaches moisture_stop (80%)
    """
    state = get_state(db)

    if not state.auto_mode:
        return state

    settings = _get_settings(db)

    if not settings.auto_irrigation:
        return state

    if not settings.current_crop:
        return state

    if _is_sensor_frame_empty(reading):
        return state

    moisture = reading.soil_moisture
    trigger = settings.moisture_trigger   # default 45%
    stop = settings.moisture_stop         # default 80%

    if not state.pump_on and moisture < trigger:
        rested = state.pump_stopped_at is None or (
            datetime.utcnow() - state.pump_stopped_at
            >= timedelta(seconds=PUMP_REST_SECONDS)
        )
        if rested:
            _switch_pump(state, True)

    elif state.pump_on and moisture >= stop:
        _switch_pump(state, False)

    db.commit()
    db.refresh(state)
    return state


def apply_auto_fertilization(db: Session, reading) -> SystemControl:
    """
    Runs after every sensor upload. Opens the fertilizer valve when
    any NPK nutrient is below the crop-specific optimal low threshold,
    and closes it when all three reach the optimal high threshold.
    Skips entirely when no crop is selected (current_crop is None).
    """
    state = get_state(db)

    if not state.auto_mode:
        return state

    settings = _get_settings(db)

    if not settings.auto_fertilization:
        return state

    if _is_sensor_frame_empty(reading):
        return state

    crop = settings.current_crop
    if not crop:
        return state

    thresholds = CROP_THRESHOLDS.get(crop)
    if thresholds is None:
        return state

    _, n_low, n_high, _ = thresholds["n"]
    _, p_low, p_high, _ = thresholds["p"]
    _, k_low, k_high, _ = thresholds["k"]

    n = reading.nitrogen
    p = reading.phosphorus
    k = reading.potassium

    # Any nutrient below its optimal low -> need to dose
    deficient = n < n_low or p < p_low or k < k_low

    # All nutrients at or above their optimal high -> stop dosing
    sufficient = n >= n_high and p >= p_high and k >= k_high

    if not state.valve_on and deficient:
        _switch_valve(state, True)
        db.commit()
        db.refresh(state)

    elif state.valve_on and sufficient:
        _switch_valve(state, False)
        db.commit()
        db.refresh(state)

    return state
