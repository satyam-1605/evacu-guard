from fastapi import APIRouter
from services.weather_client import fetch_weather, get_cached_weather

router = APIRouter(prefix="/api/weather", tags=["weather"])


@router.get("")
async def get_weather():
    """Return current Jaipur weather from Open-Meteo."""
    return await fetch_weather()


@router.get("/cached")
async def get_weather_cached():
    """Return last cached weather (instant, no external call)."""
    return get_cached_weather()
