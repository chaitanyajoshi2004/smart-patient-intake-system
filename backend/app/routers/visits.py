from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.visit import VisitStatus
from app.schemas.visit import VisitCreate, VisitRead
from app.services.auth_service import get_current_user
from app.services import visit_service


router = APIRouter(prefix="/visits", tags=["Visits"], dependencies=[Depends(get_current_user)])


@router.post(
    "/",
    response_model=VisitRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create visit",
)
def create_visit(
    visit_in: VisitCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> VisitRead:
    return visit_service.create_visit(db, visit_in)


@router.get(
    "/",
    response_model=list[VisitRead],
    summary="List visits",
)
def list_visits(
    doctor_id: int | None = Query(default=None),
    patient_id: int | None = Query(default=None),
    date_filter: date | None = Query(default=None, alias="date"),
    status_filter: VisitStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[VisitRead]:
    return visit_service.list_visits(
        db,
        doctor_id=doctor_id,
        patient_id=patient_id,
        visit_date=date_filter,
        status_filter=status_filter,
    )
