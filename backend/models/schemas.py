from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class SeverityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class HazardTypeEnum(str, Enum):
    flood = "flood"
    waterlog = "waterlog"
    road_block = "road_block"
    fire = "fire"
    infrastructure = "infrastructure"


class AlertSeverityEnum(str, Enum):
    info = "info"
    warning = "warning"
    high = "high"
    critical = "critical"
    emergency = "emergency"


# ── Shelter schemas ─────────────────────────────────────────────────────────

class ShelterOut(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    capacity: int
    current_occupancy: int
    amenities: List[str]
    contact: str
    status: str
    distance_km: Optional[float] = None
    available_spaces: Optional[int] = None

    class Config:
        from_attributes = True


# ── Route schemas ────────────────────────────────────────────────────────────

class RouteRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="User latitude")
    lng: float = Field(..., ge=-180, le=180, description="User longitude")
    shelter_id: Optional[str] = None


class RouteOut(BaseModel):
    route_coordinates: List[List[float]]
    distance_km: float
    eta_minutes: float
    assigned_shelter: Dict[str, Any]
    risk_zones_avoided: int
    alternative_routes: List[Dict[str, Any]] = []
    polyline: Optional[str] = None


# ── Hazard schemas ───────────────────────────────────────────────────────────

class HazardProperties(BaseModel):
    id: str
    name: str
    severity: SeverityEnum
    type: HazardTypeEnum
    risk_score: float
    affected_population: int
    elevation_m: Optional[float] = None
    dist_to_water_km: Optional[float] = None
    soil_drainage: Optional[int] = None
    historical_floods: Optional[int] = None
    population_density: Optional[float] = None
    updated_at: str


class HazardUpdate(BaseModel):
    polygon: Dict[str, Any]
    severity: SeverityEnum
    type: HazardTypeEnum
    name: Optional[str] = None


# ── Alert schemas ────────────────────────────────────────────────────────────

class AlertOut(BaseModel):
    id: str
    title: str
    description: str
    severity: AlertSeverityEnum
    location: str
    type: str
    created_at: str


class AlertBroadcast(BaseModel):
    message: str
    severity: AlertSeverityEnum
    location: Optional[str] = "Jaipur"


# ── Report schemas ───────────────────────────────────────────────────────────

class HazardReport(BaseModel):
    lat: float = Field(..., ge=26.5, le=27.5)
    lng: float = Field(..., ge=75.3, le=76.3)
    type: str
    severity: SeverityEnum
    description: str
    reporter_id: Optional[str] = None


class ReportOut(BaseModel):
    id: str
    lat: float
    lng: float
    type: str
    severity: str
    description: str
    created_at: str
    status: str = "pending"


# ── Admin schemas ────────────────────────────────────────────────────────────

class ScenarioRequest(BaseModel):
    scenario: str = Field(..., description="monsoon_flood | cloudburst | multi_hazard")


# ── Weather schemas ──────────────────────────────────────────────────────────

class WeatherOut(BaseModel):
    temperature: float
    feels_like: Optional[float] = None
    humidity: float
    rainfall_mm: float
    wind_speed: float
    wind_direction: Optional[str] = None
    visibility_km: Optional[float] = None
    condition: str
    forecast_next_6h: List[Dict[str, Any]] = []
    alert_level: str
    updated_at: str


# ── Stats schemas ────────────────────────────────────────────────────────────

class StatsOut(BaseModel):
    active_zones: int
    critical_zones: int
    total_shelter_capacity: int
    occupied_capacity: int
    avg_evacuation_time: float
    active_reports: int
    current_alert_level: str
    alert_level_num: int
    scenarios_ready: int
    response_time_min: float
    evacuees_assisted: int


# ── Risk prediction schemas ──────────────────────────────────────────────────

class RiskFeatures(BaseModel):
    elevation_m: float
    dist_to_water_km: float
    rainfall_mm: float
    soil_drainage: int = Field(..., ge=1, le=5)
    historical_floods: int
    population_density: float


class RiskPrediction(BaseModel):
    label: str
    risk_score: float
    probabilities: Dict[str, float]
    feature_importances: Dict[str, float]
