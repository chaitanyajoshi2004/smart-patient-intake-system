from fastapi import APIRouter, Depends

from app.services.auth_service import get_current_user


router = APIRouter(prefix="/settings", tags=["Settings"], dependencies=[Depends(get_current_user)])


@router.get("", summary="Settings module status")
def settings_status() -> dict[str, str]:
    return {"module": "settings", "status": "ready"}
