from fastapi import APIRouter
from models.schemas import HazardReport, ReportOut
from services.alert_manager import alert_manager
from routers.hazards import get_hazard_state

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("", response_model=None)
async def submit_report(body: HazardReport):
    """Submit a citizen hazard report. Auto-escalates zone if 3+ reports in same area."""
    report_data = body.model_dump()
    report, zone_count = alert_manager.add_report(report_data)

    # Auto-escalate check
    if zone_count >= 3:
        hazard_state = get_hazard_state()
        await alert_manager.add_alert(
            title=f"Auto-Escalation: {zone_count} Reports — {body.type.title()}",
            description=(
                f"{zone_count} citizen reports of {body.type} at "
                f"({body.lat:.4f}, {body.lng:.4f}) within 30 minutes. "
                "Zone risk level elevated automatically."
            ),
            severity="warning",
            location=f"({body.lat:.4f}, {body.lng:.4f}), Jaipur",
            alert_type="auto_escalation",
        )

    return {
        **report,
        "zone_report_count": zone_count,
        "auto_escalated": zone_count >= 3,
    }


@router.get("", response_model=None)
async def get_reports():
    return alert_manager.get_reports()
