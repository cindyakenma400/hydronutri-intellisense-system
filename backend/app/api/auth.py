from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.services.auth_service import (
    create_user,
    get_user_by_email,
    authenticate,
    create_token,
    get_user_from_token,
    update_profile,
    verify_password,
    set_password,
    create_reset_token,
    get_user_from_reset_token,
    send_password_reset_email,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Matches the CORS origin the frontend runs on; used to build reset links.
FRONTEND_URL = "http://localhost:3000"


class RegisterRequest(BaseModel):
    full_name: str
    email: str
    phone: str = ""
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UpdateProfileRequest(BaseModel):
    full_name: str
    phone: str = ""


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str


def _user_dict(user):
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
    }


def _current_user(authorization: str, db: Session) -> User:
    token = authorization.replace("Bearer ", "")
    user = get_user_from_token(db, token)

    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")

    return user


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
    return _user_dict(_current_user(authorization, db))


@router.post("/update-profile")
def update_profile_endpoint(
    body: UpdateProfileRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
):
    user = _current_user(authorization, db)
    updated = update_profile(db, user, body.full_name, body.phone)
    return _user_dict(updated)


@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
):
    user = _current_user(authorization, db)

    if not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect",
        )

    if body.new_password != body.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="New password and confirmation do not match",
        )

    if len(body.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters",
        )

    set_password(db, user, body.new_password)
    return {"message": "Password updated successfully"}


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, body.email)

    if user:
        token = create_reset_token(user)
        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
        send_password_reset_email(user.email, reset_link)

    # Same response whether or not the email is registered, so this
    # endpoint can't be used to enumerate accounts.
    return {
        "message": "If that email is registered, a password reset link has been sent."
    }


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_from_reset_token(db, body.token)

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Reset link is invalid or has expired",
        )

    if body.new_password != body.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="New password and confirmation do not match",
        )

    if len(body.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters",
        )

    set_password(db, user, body.new_password)
    return {"message": "Password reset successfully"}