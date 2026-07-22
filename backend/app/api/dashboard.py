from fastapi import APIRouter
from app.schemas.dashboard_schema import DashboardSummary
from app.services.dashboard_service import get_dashboard_summary

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/summary",
    response_model=DashboardSummary
)
def dashboard_summary():

    return DashboardSummary(
        **get_dashboard_summary()
    )