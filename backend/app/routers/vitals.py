from fastapi import APIRouter, Depends

from app.services.auth_service import get_current_user


router = APIRouter(prefix="/vitals", tags=["Vitals"], dependencies=[Depends(get_current_user)])


@router.get("", summary="Vitals module status")
def vitals_status() -> dict[str, str]:
    return {"module": "vitals", "status": "ready"}
