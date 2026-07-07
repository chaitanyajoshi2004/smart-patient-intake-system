from fastapi import APIRouter, Depends

from app.services.auth_service import get_current_user


router = APIRouter(
    prefix="/medical-history",
    tags=["Medical History"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", summary="Medical history module status")
def medical_history_status() -> dict[str, str]:
    return {"module": "medical-history", "status": "ready"}
