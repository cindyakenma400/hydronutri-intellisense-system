import hmac
import os

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user import User
from app.services.auth_service import get_user_from_token


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


def require_user(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> User:
    """Rejects the request unless it carries a valid login token."""
    token = authorization.replace("Bearer ", "")
    user = get_user_from_token(db, token)

    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")

    return user


def require_device(x_device_key: str = Header(default="")) -> None:
    """
    Guards the endpoints the ESP32 writes to.

    Set DEVICE_API_KEY in the backend environment to switch this on;
    the firmware and simulator then send the same value in the
    X-Device-Key header. Left unset, device endpoints stay open so a
    bench setup works with no configuration.
    """
    expected = os.getenv("DEVICE_API_KEY", "")

    if expected and not hmac.compare_digest(x_device_key, expected):
        raise HTTPException(status_code=401, detail="Invalid device key")
