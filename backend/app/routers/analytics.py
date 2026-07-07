from fastapi import APIRouter, Depends

from app.services.auth_service import get_current_user


router = APIRouter(prefix="/analytics", tags=["Analytics"], dependencies=[Depends(get_current_user)])


@router.get("", summary="Analytics module status")
def analytics_status() -> dict[str, str]:
    return {"module": "analytics", "status": "ready"}
