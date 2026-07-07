from datetime import date, datetime, timezone
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from app.services.auth_service import get_current_user
from app.services import patient_service


def patient_payload(patient_id: int = 1) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    return {
        "id": patient_id,
        "patient_code": f"PT-{patient_id:06d}",
        "first_name": "Rahul",
        "last_name": "Sharma",
        "date_of_birth": date(1992, 1, 5).isoformat(),
        "age": 34,
        "gender": "Male",
        "blood_group": "O+",
        "phone": "9999999999",
        "email": "rahul@example.com",
        "address": "Pune",
        "emergency_contact": "8888888888",
        "profile_image": None,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }


def install_overrides() -> None:
    app.dependency_overrides[get_db] = lambda: None
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
        id=1,
        full_name="Staff User",
        role="staff",
        is_active=True,
    )


def test_create_patient(monkeypatch) -> None:
    install_overrides()
    monkeypatch.setattr(patient_service, "create_patient", lambda db, patient_in: patient_payload())

    client = TestClient(app)
    response = client.post(
        "/patients/",
        json={
            "first_name": "Rahul",
            "last_name": "Sharma",
            "date_of_birth": "1992-01-05",
            "gender": "Male",
            "blood_group": "O+",
            "phone": "9999999999",
            "email": "rahul@example.com",
            "address": "Pune",
            "emergency_contact": "8888888888",
        },
    )

    assert response.status_code == 201
    assert response.json()["patient_code"] == "PT-000001"
    app.dependency_overrides.clear()


def test_update_search_and_delete_patient(monkeypatch) -> None:
    install_overrides()
    monkeypatch.setattr(patient_service, "update_patient", lambda db, patient_id, patient_in: patient_payload(patient_id))
    monkeypatch.setattr(
        patient_service,
        "list_patients",
        lambda db, **kwargs: ([patient_payload()], 1),
    )
    monkeypatch.setattr(patient_service, "soft_delete_patient", lambda db, patient_id: None)

    client = TestClient(app)

    update_response = client.put("/patients/1", json={"phone": "7777777777"})
    assert update_response.status_code == 200
    assert update_response.json()["id"] == 1

    search_response = client.get("/patients/?search=rahul")
    assert search_response.status_code == 200
    assert search_response.json()["total"] == 1

    delete_response = client.delete("/patients/1")
    assert delete_response.status_code == 204
    app.dependency_overrides.clear()
