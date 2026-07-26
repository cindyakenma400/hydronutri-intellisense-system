from sqlalchemy.orm import Session

from app.models.control import SystemControl


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


def toggle_pump(db: Session) -> SystemControl:
    state = get_state(db)
    state.pump_on = not state.pump_on
    db.commit()
    db.refresh(state)
    return state


def toggle_valve(db: Session) -> SystemControl:
    state = get_state(db)
    state.valve_on = not state.valve_on
    db.commit()
    db.refresh(state)
    return state


def toggle_auto_mode(db: Session) -> SystemControl:
    state = get_state(db)
    state.auto_mode = not state.auto_mode
    db.commit()
    db.refresh(state)
    return state