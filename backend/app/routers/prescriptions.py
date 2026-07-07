from fastapi import APIRouter, Depends

from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", summary="Prescriptions module status")
def prescriptions_status() -> dict[str, str]:
    return {"module": "prescriptions", "status": "ready"}
