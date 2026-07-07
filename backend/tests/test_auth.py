from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import get_db
from app.main import app
from app.models.user import User


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"


def build_session() -> tuple[Session, sessionmaker[Session]]:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    User.__table__.create(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return TestingSessionLocal(), TestingSessionLocal


def override_db(session_factory: sessionmaker[Session]):
    def _override() -> Generator[Session, None, None]:
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    return _override


def test_register_and_login_user() -> None:
    _, session_factory = build_session()
    app.dependency_overrides[get_db] = override_db(session_factory)
    client = TestClient(app)

    register_response = client.post(
        "/auth/register",
        json={
            "full_name": "Dr John",
            "email": "doctor@test.com",
            "password": "password123",
            "role": "doctor",
            "phone": "9999999999",
        },
    )

    assert register_response.status_code == 201
    assert register_response.json()["email"] == "doctor@test.com"
    assert "password_hash" not in register_response.json()

    login_response = client.post(
        "/auth/login",
        json={"email": "doctor@test.com", "password": "password123"},
    )

    assert login_response.status_code == 200
    body = login_response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["role"] == "doctor"

    app.dependency_overrides.clear()


def test_login_rejects_invalid_password() -> None:
    _, session_factory = build_session()
    app.dependency_overrides[get_db] = override_db(session_factory)
    client = TestClient(app)

    client.post(
        "/auth/register",
        json={
            "full_name": "Staff User",
            "email": "staff@test.com",
            "password": "password123",
            "role": "staff",
        },
    )

    response = client.post(
        "/auth/login",
        json={"email": "staff@test.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    app.dependency_overrides.clear()


def test_protected_route_requires_token() -> None:
    client = TestClient(app)

    response = client.get("/patients/")

    assert response.status_code == 401
