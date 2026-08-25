from datetime import datetime, timedelta

import bcrypt
import jwt
from sqlalchemy.orm import Session

from app.models.user import User

# For a production deployment this secret must come from an
# environment variable. A fixed value is acceptable for the
# localhost demonstration system.
SECRET_KEY = "hydronutri-intellisense-secret-key-2026"
ALGORITHM = "HS256"
TOKEN_LIFETIME_DAYS = 7
RESET_TOKEN_LIFETIME_MINUTES = 30


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed.encode("utf-8"),
    )


def create_user(
    db: Session,
    full_name: str,
    email: str,
    phone: str,
    password: str,
) -> User:
    user = User(
        full_name=full_name,
        email=email.lower().strip(),
        phone=phone,
        hashed_password=hash_password(password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    return (
        db.query(User)
        .filter(User.email == email.lower().strip())
        .first()
    )


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)

    if user and verify_password(password, user.hashed_password):
        return user

    return None


def create_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(days=TOKEN_LIFETIME_DAYS),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_user_from_token(db: Session, token: str) -> User | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None

    return db.query(User).filter(User.id == int(payload["sub"])).first()


def update_profile(db: Session, user: User, full_name: str, phone: str) -> User:
    user.full_name = full_name
    user.phone = phone

    db.commit()
    db.refresh(user)
    return user


def set_password(db: Session, user: User, new_password: str) -> None:
    user.hashed_password = hash_password(new_password)

    db.commit()
    db.refresh(user)


def create_reset_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "type": "reset",
        "exp": datetime.utcnow() + timedelta(minutes=RESET_TOKEN_LIFETIME_MINUTES),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_user_from_reset_token(db: Session, token: str) -> User | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None

    if payload.get("type") != "reset":
        return None

    return db.query(User).filter(User.id == int(payload["sub"])).first()


def send_password_reset_email(email: str, reset_link: str) -> None:
    """Delivers the password reset link to the user.

    SMTP is not configured yet, so the link is logged to the console
    instead. Swapping this body for a real mail send later requires no
    change to the API surface or the frontend.
    """
    print(f"[HydroNutri] Password reset requested for {email}: {reset_link}")