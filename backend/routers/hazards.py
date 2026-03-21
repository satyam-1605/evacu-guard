import json
import os
from fastapi import APIRouter, HTTPException
from typing import Any, Dict

router = APIRouter(prefix="/api/hazards", tags=["hazards"])

_hazards: Dict[str, Any] = {}


def _load():
    global _hazards
    if _hazards:
        return _hazards
    path = os.path.join(os.path.dirname(__file__), "..", "data", "jaipur_hazards.geojson")
    with open(os.path.abspath(path), "r", encoding="utf-8") as f:
        _hazards = json.load(f)
    return _hazards


def get_hazard_state() -> Dict[str, Any]:
    return _load()


def update_zone_severity(zone_id: str, new_severity: str):
    data = _load()
    for feature in data["features"]:
        if feature["properties"]["id"] == zone_id:
            feature["properties"]["severity"] = new_severity
            # Update risk score based on severity
            score_map = {"low": 35, "medium": 58, "high": 78, "critical": 92}
            feature["properties"]["risk_score"] = score_map.get(new_severity, 50)
            from datetime import datetime
            feature["properties"]["updated_at"] = datetime.utcnow().isoformat() + "Z"
            break


@router.get("", response_model=None)
async def get_hazards():
    """Return all active hazard zones as GeoJSON FeatureCollection."""
    return _load()


@router.get("/{zone_id}")
async def get_hazard(zone_id: str):
    data = _load()
    for feature in data["features"]:
        if feature["properties"]["id"] == zone_id:
            return feature
    raise HTTPException(status_code=404, detail="Hazard zone not found")
