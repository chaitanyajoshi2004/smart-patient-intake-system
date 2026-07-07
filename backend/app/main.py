from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.config import get_settings
from app.routers import (
    analytics,
    auth,
    medical_history,
    patients,
    prescriptions,
    reports,
    settings as settings_router,
    triage,
    visits,
    vitals,
)


settings = get_settings()

app = FastAPI(
    title="Smart Patient Intake API",
    description="Backend API for authentication and patient intake management.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(_: Request, __: SQLAlchemyError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database error occurred. Please try again later."},
    )


@app.get("/", tags=["Health"])
def root() -> dict[str, str]:
    return {
        "name": "Smart Patient Intake API",
        "status": "ok",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(visits.router)
app.include_router(medical_history.router)
app.include_router(vitals.router)
app.include_router(prescriptions.router)
app.include_router(triage.router)
app.include_router(reports.router)
app.include_router(analytics.router)
app.include_router(settings_router.router)
