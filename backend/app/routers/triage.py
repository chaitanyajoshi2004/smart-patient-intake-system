from fastapi import APIRouter, Depends

from app.services.auth_service import get_current_user


router = APIRouter(prefix="/triage", tags=["AI Triage"], dependencies=[Depends(get_current_user)])


@router.get("", summary="AI triage module status")
def triage_status() -> dict[str, str]:
    return {"module": "triage", "status": "ready"}
