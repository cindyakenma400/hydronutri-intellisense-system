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