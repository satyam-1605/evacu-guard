"""
Shelter matching: finds best shelter for a given location.
Scoring: alpha=0.6 * (1/distance) + beta=0.4 * (remaining_capacity/total_capacity)
"""
import json
import os
import math
from typing import List, Dict, Any, Optional

ALPHA = 0.6  # distance weight
BETA = 0.4   # capacity weight

_shelters: List[Dict[str, Any]] = []


def _load_shelters():
    global _shelters
    if _shelters:
        return
    path = os.path.join(os.path.dirname(__file__), "..", "data", "jaipur_shelters.json")
    path = os.path.abspath(path)
    with open(path, "r", encoding="utf-8") as f:
        _shelters = json.load(f)


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Distance in km between two lat/lng points."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def get_all_shelters(user_lat: Optional[float] = None, user_lng: Optional[float] = None) -> List[Dict[str, Any]]:
    _load_shelters()
    result = []
    for s in _shelters:
        shelter = dict(s)
        if user_lat is not None and user_lng is not None:
            shelter["distance_km"] = round(_haversine(user_lat, user_lng, s["lat"], s["lng"]), 2)
        shelter["available_spaces"] = s["capacity"] - s["current_occupancy"]
        result.append(shelter)

    if user_lat is not None:
        result.sort(key=lambda x: x.get("distance_km", 9999))

    return result


def find_best_shelter(user_lat: float, user_lng: float, exclude_full: bool = True) -> Optional[Dict[str, Any]]:
    """Find the optimal shelter using the scoring formula."""
    _load_shelters()
    candidates = []

    for s in _shelters:
        if exclude_full and s["current_occupancy"] >= s["capacity"]:
            continue
        if s.get("status") == "closed":
            continue

        dist = _haversine(user_lat, user_lng, s["lat"], s["lng"])
        remaining = s["capacity"] - s["current_occupancy"]
        capacity_ratio = remaining / s["capacity"] if s["capacity"] > 0 else 0

        # Scoring formula from CLAUDE.md
        score = ALPHA * (1 / max(dist, 0.1)) + BETA * capacity_ratio

        candidates.append({**s, "distance_km": round(dist, 2), "score": score, "available_spaces": remaining})

    if not candidates:
        return None

    candidates.sort(key=lambda x: -x["score"])
    return candidates[0]


def find_top_shelters(user_lat: float, user_lng: float, n: int = 3) -> List[Dict[str, Any]]:
    """Return top N scored shelters."""
    _load_shelters()
    candidates = []

    for s in _shelters:
        dist = _haversine(user_lat, user_lng, s["lat"], s["lng"])
        remaining = max(0, s["capacity"] - s["current_occupancy"])
        capacity_ratio = remaining / s["capacity"] if s["capacity"] > 0 else 0
        score = ALPHA * (1 / max(dist, 0.1)) + BETA * capacity_ratio
        candidates.append({**s, "distance_km": round(dist, 2), "score": score, "available_spaces": remaining})

    candidates.sort(key=lambda x: -x["score"])
    return candidates[:n]


def get_shelter_by_id(shelter_id: str) -> Optional[Dict[str, Any]]:
    _load_shelters()
    for s in _shelters:
        if s["id"] == shelter_id:
            return dict(s)
    return None


def update_occupancy(shelter_id: str, delta: int):
    """Increment/decrement occupancy in memory."""
    _load_shelters()
    for s in _shelters:
        if s["id"] == shelter_id:
            s["current_occupancy"] = max(0, min(s["capacity"], s["current_occupancy"] + delta))
            break
