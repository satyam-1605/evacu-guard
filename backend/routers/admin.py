import json
import os
import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from models.schemas import ScenarioRequest, HazardUpdate, AlertBroadcast
from services.alert_manager import alert_manager
from routers.hazards import update_zone_severity, get_hazard_state
from services.risk_engine import risk_engine
from auth.dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

_active_scenarios: set = set()


async def _run_scenario(scenario_data: dict):
    """Progressively activate scenario steps with asyncio delays."""
    scenario_id = scenario_data["id"]
    _active_scenarios.add(scenario_id)

    try:
        steps = scenario_data.get("steps", [])
        for step in steps:
            delay = step.get("delay_sec", 0)
            await asyncio.sleep(delay if delay == 0 else 1)  # Fast-forward for demo

            # Update zone severity
            zone_id = step.get("zone_id")
            new_severity = step.get("new_severity", "high")
            if zone_id:
                update_zone_severity(zone_id, new_severity)

            # Push alert
            alert_info = step.get("alert", {})
            if alert_info:
                await alert_manager.add_alert(
                    title=alert_info.get("title", "Scenario Alert"),
                    description=alert_info.get("description", ""),
                    severity=alert_info.get("severity", "warning"),
                    location=alert_info.get("location", "Jaipur"),
                    alert_type="scenario",
                )

            # Small delay between steps
            await asyncio.sleep(2)

    finally:
        _active_scenarios.discard(scenario_id)


@router.post("/scenario")
async def activate_scenario(body: ScenarioRequest, background_tasks: BackgroundTasks, _: dict = Depends(require_admin)):
    """Activate a pre-built disaster scenario with progressive zone escalation."""
    valid_scenarios = ["monsoon_flood", "cloudburst", "multi_hazard"]
    if body.scenario not in valid_scenarios:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown scenario. Valid: {valid_scenarios}"
        )

    # Load scenario file
    scenario_path = os.path.join(
        os.path.dirname(__file__), "..", "data", "scenarios", f"{body.scenario}.json"
    )
    scenario_path = os.path.abspath(scenario_path)

    if not os.path.exists(scenario_path):
        raise HTTPException(status_code=404, detail=f"Scenario file not found: {body.scenario}")

    with open(scenario_path, "r", encoding="utf-8") as f:
        scenario_data = json.load(f)

    # Announce scenario activation
    await alert_manager.add_alert(
        title=f"SCENARIO ACTIVATED: {scenario_data['name']}",
        description=scenario_data.get("description", "Disaster scenario activated by admin."),
        severity="critical",
        location="Jaipur — Command Center",
        alert_type="scenario_start",
    )

    # Run scenario in background
    background_tasks.add_task(_run_scenario, scenario_data)

    return {
        "status": "activated",
        "scenario": body.scenario,
        "name": scenario_data["name"],
        "total_steps": len(scenario_data.get("steps", [])),
        "duration_sec": scenario_data.get("total_duration_sec", 60),
    }


@router.post("/hazard")
async def create_hazard(body: HazardUpdate, _: dict = Depends(require_admin)):
    """Create or update a hazard zone."""
    from datetime import datetime
    import uuid
    new_feature = {
        "type": "Feature",
        "properties": {
            "id": f"hz-custom-{uuid.uuid4().hex[:6]}",
            "name": body.name or "Custom Zone",
            "severity": body.severity,
            "type": body.type,
            "risk_score": {"low": 25, "medium": 55, "high": 78, "critical": 92}[body.severity],
            "affected_population": 0,
            "updated_at": datetime.utcnow().isoformat() + "Z",
        },
        "geometry": body.polygon,
    }

    data = get_hazard_state()
    data["features"].append(new_feature)

    await alert_manager.add_alert(
        title=f"New Hazard Zone Created: {body.severity.upper()}",
        description=f"Admin created a new {body.type} zone at {body.severity} severity level.",
        severity="warning",
        location="Jaipur",
        alert_type="admin",
    )

    return new_feature


@router.post("/broadcast")
async def broadcast_alert(body: AlertBroadcast, _: dict = Depends(require_admin)):
    """Broadcast emergency message to all connected clients."""
    alert = await alert_manager.add_alert(
        title=f"[BROADCAST] Emergency Alert",
        description=body.message,
        severity=body.severity,
        location=body.location or "Jaipur",
        alert_type="broadcast",
    )
    return {"status": "broadcast", "alert": alert, "connections": alert_manager.get_connection_count()}


@router.get("/status")
async def get_status(_: dict = Depends(require_admin)):
    """System health check."""
    return {
        "api": "online",
        "ml_model": risk_engine._loaded,
        "weather_service": "online",
        "websocket_connections": alert_manager.get_connection_count(),
        "active_scenarios": list(_active_scenarios),
    }
