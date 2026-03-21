"""
Open-Meteo weather client for Jaipur.
No API key required — free public API.
"""
import httpx
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional

JAIPUR_LAT = 26.9124
JAIPUR_LNG = 75.7873

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

RAIN_THRESHOLDS = {
    "NORMAL": (0, 15),
    "WATCH":   (15, 35),
    "WARNING": (35, 65),
    "ALERT":   (65, float("inf")),
}

# Cached weather to serve instantly while polling
_cached_weather: Optional[Dict[str, Any]] = None
_last_fetched: Optional[datetime] = None


def _get_alert_level(rainfall_mm: float) -> tuple[str, int]:
    if rainfall_mm >= 65:
        return "ALERT", 3
    if rainfall_mm >= 35:
        return "WARNING", 2
    if rainfall_mm >= 15:
        return "WATCH", 1
    return "NORMAL", 0


def _get_condition(rainfall_mm: float, wind_speed: float) -> str:
    if rainfall_mm >= 65:
        return "Heavy Thunderstorm"
    if rainfall_mm >= 35:
        return "Heavy Rain"
    if rainfall_mm >= 15:
        return "Moderate Rain"
    if rainfall_mm > 0:
        return "Light Rain"
    if wind_speed > 30:
        return "Windy"
    return "Clear"


async def fetch_weather() -> Dict[str, Any]:
    """Fetch current weather from Open-Meteo API."""
    global _cached_weather, _last_fetched

    params = {
        "latitude": JAIPUR_LAT,
        "longitude": JAIPUR_LNG,
        "current": [
            "temperature_2m",
            "rain",
            "relative_humidity_2m",
            "wind_speed_10m",
            "apparent_temperature",
            "weather_code",
        ],
        "hourly": ["rain", "temperature_2m"],
        "forecast_days": 1,
        "timezone": "Asia/Kolkata",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(OPEN_METEO_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        current = data.get("current", {})
        hourly = data.get("hourly", {})

        rainfall_mm = float(current.get("rain", 0) or 0)
        temperature = float(current.get("temperature_2m", 32) or 32)
        humidity = float(current.get("relative_humidity_2m", 60) or 60)
        wind_speed = float(current.get("wind_speed_10m", 10) or 10)
        feels_like = float(current.get("apparent_temperature", temperature) or temperature)

        alert_level, alert_num = _get_alert_level(rainfall_mm)

        # Next 6 hourly forecasts
        hourly_rain = hourly.get("rain", [])
        hourly_temp = hourly.get("temperature_2m", [])
        forecast_next_6h = [
            {"hour": i + 1, "rainfall_mm": round(float(r), 1), "temp": round(float(t), 1)}
            for i, (r, t) in enumerate(zip(hourly_rain[:6], hourly_temp[:6]))
        ]

        weather = {
            "temperature": round(temperature, 1),
            "feels_like": round(feels_like, 1),
            "humidity": round(humidity, 1),
            "rainfall_mm": round(rainfall_mm, 1),
            "wind_speed": round(wind_speed, 1),
            "wind_direction": "SW",
            "visibility_km": max(1.0, round(10 - rainfall_mm / 15, 1)),
            "condition": _get_condition(rainfall_mm, wind_speed),
            "forecast_next_6h": forecast_next_6h,
            "alert_level": alert_level,
            "alert_level_num": alert_num,
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "source": "Open-Meteo",
        }

        _cached_weather = weather
        _last_fetched = datetime.utcnow()
        return weather

    except Exception as e:
        print(f"[WeatherClient] Error fetching weather: {e}")
        # Return cached or fallback
        if _cached_weather:
            return _cached_weather
        return _get_fallback_weather()


def get_cached_weather() -> Dict[str, Any]:
    """Return cached weather synchronously."""
    if _cached_weather:
        return _cached_weather
    return _get_fallback_weather()


def _get_fallback_weather() -> Dict[str, Any]:
    return {
        "temperature": 32.0,
        "feels_like": 38.0,
        "humidity": 78.0,
        "rainfall_mm": 45.0,
        "wind_speed": 22.0,
        "wind_direction": "SW",
        "visibility_km": 3.2,
        "condition": "Heavy Rain",
        "forecast_next_6h": [
            {"hour": 1, "rainfall_mm": 52, "temp": 31},
            {"hour": 2, "rainfall_mm": 68, "temp": 30},
            {"hour": 3, "rainfall_mm": 71, "temp": 29},
            {"hour": 4, "rainfall_mm": 55, "temp": 29},
            {"hour": 5, "rainfall_mm": 40, "temp": 30},
            {"hour": 6, "rainfall_mm": 28, "temp": 31},
        ],
        "alert_level": "WARNING",
        "alert_level_num": 2,
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "source": "fallback",
    }
