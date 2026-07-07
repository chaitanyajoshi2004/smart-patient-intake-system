from fastapi import APIRouter, Depends

from app.services.auth_service import get_current_user


router = APIRouter(prefix="/reports", tags=["Reports"], dependencies=[Depends(get_current_user)])


@router.get("", summary="Reports module status")
def reports_status() -> dict[str, str]:
    return {"module": "reports", "status": "ready"}
