from fastapi import APIRouter, HTTPException, Depends
from models.schemas import RouteRequest, RouteOut
from services.shelter_matcher import find_best_shelter, get_shelter_by_id
from services.route_planner import plan_route
from routers.hazards import get_hazard_state
from auth.dependencies import get_optional_user
from database.queries import create_evacuation_log

router = APIRouter(prefix="/api/route", tags=["routing"])


@router.post("", response_model=None)
async def compute_route(body: RouteRequest, user: dict = Depends(get_optional_user)):
    """Compute safe evacuation route from user location to nearest/specified shelter."""
    # Get target shelter
    if body.shelter_id:
        shelter = get_shelter_by_id(body.shelter_id)
        if not shelter:
            raise HTTPException(status_code=404, detail=f"Shelter '{body.shelter_id}' not found")
    else:
        shelter = find_best_shelter(body.lat, body.lng)
        if not shelter:
            raise HTTPException(status_code=503, detail="No available shelters found")

    # Get current hazard zones for penalty weighting
    hazard_data = get_hazard_state()
    hazards = hazard_data.get("features", [])

    # Plan route
    result = await plan_route(
        user_lat=body.lat,
        user_lng=body.lng,
        shelter=shelter,
        hazards=hazards,
    )

    # Log evacuation route for authenticated users
    if user is not None:
        try:
            await create_evacuation_log(
                user["id"], body.lat, body.lng, shelter["id"],
                result.get("distance_km"), result.get("eta_minutes"), "safest"
            )
        except Exception:
            pass  # Non-critical; don't fail the route response

    return {
        **result,
        "assigned_shelter": {
            "id": shelter["id"],
            "name": shelter["name"],
            "lat": shelter["lat"],
            "lng": shelter["lng"],
            "available_spaces": shelter["capacity"] - shelter["current_occupancy"],
            "amenities": shelter.get("amenities", []),
        },
        "alternative_routes": [],
    }
