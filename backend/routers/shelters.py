from fastapi import APIRouter, Query
from typing import List, Optional
from services.shelter_matcher import get_all_shelters, find_top_shelters, get_shelter_by_id
from models.schemas import ShelterOut

router = APIRouter(prefix="/api/shelters", tags=["shelters"])


@router.get("", response_model=None)
async def get_shelters(
    lat: Optional[float] = Query(None, description="User latitude for distance calc"),
    lng: Optional[float] = Query(None, description="User longitude for distance calc"),
):
    """Return all shelters, optionally sorted by distance from user."""
    shelters = get_all_shelters(user_lat=lat, user_lng=lng)
    return shelters


@router.get("/nearest")
async def get_nearest_shelters(
    lat: float = Query(...),
    lng: float = Query(...),
    n: int = Query(3, ge=1, le=7),
):
    """Return top N shelters scored by distance + capacity."""
    return find_top_shelters(lat, lng, n=n)


@router.get("/{shelter_id}")
async def get_shelter(shelter_id: str):
    shelter = get_shelter_by_id(shelter_id)
    if not shelter:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Shelter not found")
    return shelter
