from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import Token, UserCreate, UserLogin, UserRead
from app.services.auth_service import (
    authenticate_user,
    create_user,
    get_user_by_email,
    issue_access_token,
)


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a user",
    description="Create a staff, doctor, or admin account with a bcrypt hashed password.",
)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    if get_user_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    try:
        return create_user(db, user_in)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        ) from exc


@router.post(
    "/login",
    response_model=Token,
    summary="Login",
    description="Validate credentials and return a JWT bearer token.",
)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)) -> Token:
    user = authenticate_user(db, credentials.email, credentials.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return Token(access_token=issue_access_token(user), user=user)
