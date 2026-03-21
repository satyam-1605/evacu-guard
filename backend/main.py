"""
EvacuGuard — AI-Powered Evacuation Route Planning System
FastAPI backend for Jaipur, Rajasthan, India

Run with:
  uvicorn main:app --reload --port 8000
"""
import asyncio
import os
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

# ── Import services ──────────────────────────────────────────────────────────
from services.risk_engine import risk_engine
from services.weather_client import fetch_weather, get_cached_weather
from services.alert_manager import alert_manager
from routers.hazards import get_hazard_state, update_zone_severity

# ── Import routers ───────────────────────────────────────────────────────────
from routers import hazards, shelters, routing, alerts, reports, admin, weather, stats


# ── Background weather polling task ─────────────────────────────────────────

RAIN_THRESHOLD_ESCALATIONS = {
    15:  ("hz-3", "medium"),   # Sindhi Camp watch
    35:  ("hz-1", "high"),     # Mansarovar warning
    65:  ("hz-1", "critical"), # Mansarovar critical
}

_last_alert_level = "NORMAL"


async def weather_poll_loop():
    """
    Background task: polls Open-Meteo every 5 minutes.
    Updates zone risk levels and pushes WebSocket alerts on changes.
    """
    global _last_alert_level
    await asyncio.sleep(10)  # Wait for startup to complete

    while True:
        try:
            wx = await fetch_weather()
            rainfall = wx.get("rainfall_mm", 0)
            alert_level = wx.get("alert_level", "NORMAL")

            # Check for alert level change
            if alert_level != _last_alert_level:
                await alert_manager.add_alert(
                    title=f"Weather Alert Level Changed: {_last_alert_level} -> {alert_level}",
                    description=(
                        f"Open-Meteo reports {rainfall}mm/hr rainfall at Jaipur. "
                        f"Alert level escalated to {alert_level}."
                    ),
                    severity="warning" if alert_level in ("WATCH", "WARNING") else "critical",
                    location="Jaipur",
                    alert_type="weather",
                )
                _last_alert_level = alert_level

            # Feed into risk engine for each zone
            hazard_data = get_hazard_state()
            for feature in hazard_data.get("features", []):
                props = feature["properties"]
                features_dict = {
                    "elevation_m":        props.get("elevation_m", 430),
                    "dist_to_water_km":   props.get("dist_to_water_km", 2.5),
                    "rainfall_mm":        rainfall,
                    "soil_drainage":      props.get("soil_drainage", 3),
                    "historical_floods":  props.get("historical_floods", 2),
                    "population_density": props.get("population_density", 10000),
                }
                prediction = risk_engine.predict(features_dict)
                new_label = prediction["label"]
                old_label = props.get("severity", "low")

                # Escalate if ML says higher risk
                severity_order = ["low", "medium", "high", "critical"]
                if severity_order.index(new_label) > severity_order.index(old_label):
                    update_zone_severity(props["id"], new_label)
                    await alert_manager.add_alert(
                        title=f"ML Risk Escalation: {props['name']}",
                        description=(
                            f"AI model detected increased flood risk at {props['name']}. "
                            f"Risk level: {old_label.upper()} -> {new_label.upper()}. "
                            f"Rainfall: {rainfall}mm/hr"
                        ),
                        severity=new_label if new_label in ("high", "critical") else "warning",
                        location=props["name"],
                        alert_type="ml_escalation",
                    )

        except Exception as e:
            print(f"[WeatherPoll] Error: {e}")

        await asyncio.sleep(int(os.getenv("WEATHER_POLL_INTERVAL", 300)))


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print("[EvacuGuard] Starting up...")

    # Load ML model
    risk_engine.load()

    # Initial weather fetch
    try:
        await fetch_weather()
        print("[EvacuGuard] Initial weather fetched")
    except Exception as e:
        print(f"[EvacuGuard] Weather fetch failed (using fallback): {e}")

    # Start background weather polling
    task = asyncio.create_task(weather_poll_loop())
    print("[EvacuGuard] Weather polling task started (every 5 min)")
    print("[EvacuGuard] Backend ready at http://localhost:8000")

    yield

    task.cancel()
    print("[EvacuGuard] Shutdown complete")


# ── FastAPI app ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="EvacuGuard API",
    description="AI-Powered Evacuation Route Planning & Crowd Movement System — Jaipur, India",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Include routers ──────────────────────────────────────────────────────────

app.include_router(hazards.router)
app.include_router(shelters.router)
app.include_router(routing.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(admin.router)
app.include_router(weather.router)
app.include_router(stats.router)


# ── Root & health endpoints ──────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "project": "EvacuGuard",
        "version": "1.0.0",
        "description": "AI-Powered Evacuation Intelligence for Jaipur, India",
        "hackathon": "Hackerz Street 4.0 — IEEE CS — MUJ",
        "docs": "/docs",
        "endpoints": {
            "hazards":  "GET /api/hazards",
            "shelters": "GET /api/shelters",
            "route":    "POST /api/route",
            "alerts":   "GET /api/alerts",
            "weather":  "GET /api/weather",
            "stats":    "GET /api/stats",
            "ws":       "WS /ws/alerts",
            "admin":    "POST /api/admin/scenario",
        },
        "model_loaded": risk_engine._loaded,
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/health")
async def health():
    return {"status": "ok", "model": risk_engine._loaded}


# ── Risk prediction endpoint ─────────────────────────────────────────────────

@app.post("/api/risk/predict")
async def predict_risk(body: dict):
    """Predict flood risk from raw features."""
    result = risk_engine.predict(body)
    return result
