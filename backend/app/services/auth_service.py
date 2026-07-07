from datetime import timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.utils.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    user = User(
        full_name=user_in.full_name,
        email=user_in.email.lower(),
        password_hash=hash_password(user_in.password),
        role=user_in.role.value,
        phone=user_in.phone,
        profile_image=user_in.profile_image,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def issue_access_token(user: User) -> str:
    settings = get_settings()
    return create_access_token(
        subject=str(user.id),
        role=user.role.value if hasattr(user.role, "value") else str(user.role),
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_error

    subject = payload.get("sub")
    if not isinstance(subject, str):
        raise credentials_error
    user = db.get(User, int(subject)) if subject.isdigit() else None
    if user is None or not user.is_active:
        raise credentials_error
    return user


def require_roles(*roles: UserRole):
    allowed = {role.value for role in roles}

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        current_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        if current_role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user

    return dependency


def require_admin(current_user: User = Depends(require_roles(UserRole.admin))) -> User:
    return current_user


def require_doctor(current_user: User = Depends(require_roles(UserRole.doctor))) -> User:
    return current_user


def require_staff(
    current_user: User = Depends(
        require_roles(UserRole.admin, UserRole.doctor, UserRole.nurse, UserRole.staff)
    ),
) -> User:
    return current_user
