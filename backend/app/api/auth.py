from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.services.auth_service import (
    create_user,
    get_user_by_email,
    authenticate,
    create_token,
    get_user_from_token,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


class RegisterRequest(BaseModel):
    full_name: str
    email: str
    phone: str = ""
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


def _user_dict(user):
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
    }


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if len(body.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters",
        )

    if get_user_by_email(db, body.email):
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists",
        )

    user = create_user(
        db,
        body.full_name,
        body.email,
        body.phone,
        body.password,
    )

    return {
        "access_token": create_token(user),
        "user": _user_dict(user),
    }


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate(db, body.email, body.password)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    return {
        "access_token": create_token(user),
        "user": _user_dict(user),
    }


@router.get("/me")
def me(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
):
    token = authorization.replace("Bearer ", "")
    user = get_user_from_token(db, token)

    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")

    return _user_dict(user)