from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.medical_history import MedicalHistoryRead, PatientMedicalHistoryCreate
from app.schemas.patient import PatientCreate, PatientDetails, PatientListResponse, PatientRead, PatientUpdate
from app.services.auth_service import get_current_user
from app.services import patient_service


router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
)


@router.post(
    "/",
    response_model=PatientRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create patient",
    description="Create a patient intake record. Requires a valid JWT bearer token.",
)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> PatientRead:
    return patient_service.create_patient(db, patient_in)


@router.get(
    "/",
    response_model=PatientListResponse,
    summary="List patients",
    description="Return paginated patients with optional search and demographic filters.",
)
def list_patients(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None, max_length=120),
    gender: str | None = Query(default=None, max_length=30),
    blood_group: str | None = Query(default=None, max_length=10),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> PatientListResponse:
    patients, total = patient_service.list_patients(
        db,
        page=page,
        limit=limit,
        search=search,
        gender=gender,
        blood_group=blood_group,
    )

    return PatientListResponse(data=patients, total=total, page=page, limit=limit)


@router.get(
    "/{patient_id}",
    response_model=PatientDetails,
    summary="Get patient",
    description="Return a single patient record by ID.",
)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> PatientDetails:
    return patient_service.get_patient_details(db, patient_id)


@router.put(
    "/{patient_id}",
    response_model=PatientRead,
    summary="Update patient",
    description="Update patient demographic and contact details.",
)
def update_patient(
    patient_id: int,
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> PatientRead:
    return patient_service.update_patient(db, patient_id, patient_in)


@router.delete(
    "/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete patient",
    description="Delete a patient record by ID.",
)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Response:
    patient_service.soft_delete_patient(db, patient_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{patient_id}/history",
    response_model=MedicalHistoryRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create patient medical history",
)
def create_patient_history(
    patient_id: int,
    history_in: PatientMedicalHistoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> MedicalHistoryRead:
    return patient_service.create_patient_history(db, patient_id, history_in)


@router.get(
    "/{patient_id}/history",
    response_model=list[MedicalHistoryRead],
    summary="List patient medical history",
)
def list_patient_history(
    patient_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[MedicalHistoryRead]:
    return patient_service.list_patient_history(db, patient_id)
