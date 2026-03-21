"""
Route planner: NetworkX Dijkstra + OSRM for road-snapped coordinates.
Hazard zones penalize road weights.
"""
import asyncio
import math
import json
import os
import httpx
import networkx as nx
from typing import List, Dict, Any, Optional, Tuple

OSRM_BASE = "https://router.project-osrm.org"

HAZARD_PENALTIES = {
    "low": 1.0,
    "medium": 5.0,
    "high": 20.0,
    "critical": 100.0,
}

# Jaipur road network nodes (major intersections, real coordinates)
JAIPUR_NODES = {
    "sindhi_camp":      (26.9200, 75.7880),
    "mi_road":          (26.9160, 75.8120),
    "sanganeri_gate":   (26.9050, 75.8200),
    "ajmer_road":       (26.9000, 75.7600),
    "tonk_road":        (26.8750, 75.8000),
    "jawahar_circle":   (26.8900, 75.8050),
    "civil_lines":      (26.9050, 75.7850),
    "malviya_nagar":    (26.8600, 75.8100),
    "vaishali_nagar":   (26.9200, 75.7400),
    "mansarovar":       (26.8550, 75.7500),
    "pratap_nagar":     (26.8300, 75.7600),
    "sanganer":         (26.7950, 75.7970),
    "jagatpura":        (26.8150, 75.8400),
    "pink_city":        (26.9250, 75.8250),
    "albert_hall":      (26.9117, 75.8194),
    "sms_stadium":      (26.9024, 75.8065),
    "jkk":              (26.8893, 75.8133),
    "ric":              (26.8780, 75.7960),
    "raj_univ":         (26.8585, 75.7612),
}

# Road connections (bidirectional)
JAIPUR_EDGES = [
    ("sindhi_camp", "civil_lines", 3.2),
    ("sindhi_camp", "mi_road", 2.8),
    ("sindhi_camp", "pink_city", 4.1),
    ("sindhi_camp", "vaishali_nagar", 6.5),
    ("mi_road", "sanganeri_gate", 3.0),
    ("mi_road", "jawahar_circle", 2.2),
    ("mi_road", "albert_hall", 1.8),
    ("mi_road", "civil_lines", 2.5),
    ("jawahar_circle", "sms_stadium", 1.2),
    ("jawahar_circle", "jkk", 1.5),
    ("jawahar_circle", "ric", 2.8),
    ("albert_hall", "sms_stadium", 0.9),
    ("albert_hall", "pink_city", 2.0),
    ("civil_lines", "ajmer_road", 3.8),
    ("civil_lines", "vaishali_nagar", 5.2),
    ("ajmer_road", "vaishali_nagar", 4.0),
    ("ajmer_road", "mansarovar", 5.5),
    ("ajmer_road", "raj_univ", 3.2),
    ("tonk_road", "jawahar_circle", 3.5),
    ("tonk_road", "malviya_nagar", 2.8),
    ("tonk_road", "sanganer", 8.0),
    ("tonk_road", "ric", 2.0),
    ("malviya_nagar", "jkk", 3.0),
    ("malviya_nagar", "jagatpura", 5.5),
    ("mansarovar", "pratap_nagar", 3.8),
    ("mansarovar", "raj_univ", 4.2),
    ("pratap_nagar", "sanganer", 5.0),
    ("sanganer", "jagatpura", 6.2),
    ("jagatpura", "malviya_nagar", 5.5),
    ("sanganeri_gate", "pink_city", 1.5),
    ("ric", "raj_univ", 2.5),
    ("sms_stadium", "jkk", 1.8),
]


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def _point_in_polygon(lat: float, lng: float, polygon_coords: List) -> bool:
    """Ray casting algorithm for point-in-polygon test."""
    n = len(polygon_coords)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon_coords[i][0], polygon_coords[i][1]
        xj, yj = polygon_coords[j][0], polygon_coords[j][1]
        if ((yi > lat) != (yj > lat)) and (lng < (xj - xi) * (lat - yi) / (yj - yi + 1e-10) + xi):
            inside = not inside
        j = i
    return inside


def _get_hazard_penalty(lat: float, lng: float, hazards: List[Dict]) -> float:
    """Return penalty multiplier for a location based on active hazard zones."""
    max_penalty = 1.0
    for hz in hazards:
        sev = hz.get("properties", {}).get("severity", "low")
        coords = hz.get("geometry", {}).get("coordinates", [[]])[0]
        if _point_in_polygon(lat, lng, coords):
            penalty = HAZARD_PENALTIES.get(sev, 1.0)
            max_penalty = max(max_penalty, penalty)
    return max_penalty


def _nearest_node(lat: float, lng: float) -> str:
    """Find nearest graph node to given coordinates."""
    best = None
    best_dist = float("inf")
    for node, (nlat, nlng) in JAIPUR_NODES.items():
        d = _haversine(lat, lng, nlat, nlng)
        if d < best_dist:
            best_dist = d
            best = node
    return best


def build_graph(hazards: List[Dict] = None) -> nx.Graph:
    """Build weighted road graph with hazard penalties."""
    G = nx.Graph()

    for node, (lat, lng) in JAIPUR_NODES.items():
        G.add_node(node, lat=lat, lng=lng)

    for u, v, base_km in JAIPUR_EDGES:
        penalty_u = _get_hazard_penalty(*JAIPUR_NODES[u], hazards or [])
        penalty_v = _get_hazard_penalty(*JAIPUR_NODES[v], hazards or [])
        avg_penalty = (penalty_u + penalty_v) / 2
        weight = base_km * avg_penalty
        G.add_edge(u, v, weight=weight, distance_km=base_km, penalty=avg_penalty)

    return G


def _interpolate_coords(node_path: List[str]) -> List[List[float]]:
    """Generate intermediate waypoints along the node path."""
    coords = []
    for node in node_path:
        lat, lng = JAIPUR_NODES[node]
        coords.append([lat, lng])
    return coords


async def get_osrm_route(src_lat: float, src_lng: float,
                         dst_lat: float, dst_lng: float) -> Optional[List[List[float]]]:
    """Call OSRM for a road-snapped route. Returns list of [lat, lng] points."""
    url = (
        f"{OSRM_BASE}/route/v1/driving/"
        f"{src_lng},{src_lat};{dst_lng},{dst_lat}"
        "?overview=full&geometries=geojson&steps=false"
    )
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return None
            data = resp.json()
            if data.get("code") != "Ok" or not data.get("routes"):
                return None
            coords = data["routes"][0]["geometry"]["coordinates"]
            # OSRM returns [lng, lat] — flip to [lat, lng]
            return [[c[1], c[0]] for c in coords]
    except Exception as e:
        print(f"[RoutePlanner] OSRM error: {e}")
        return None


async def plan_route(
    user_lat: float,
    user_lng: float,
    shelter: Dict[str, Any],
    hazards: List[Dict] = None,
) -> Dict[str, Any]:
    """
    Full route planning pipeline:
    1. Build weighted graph with hazard penalties
    2. Find shortest path with Dijkstra
    3. Try OSRM for road-snapped coordinates
    4. Fallback to graph waypoints
    """
    hazard_list = hazards or []
    G = build_graph(hazard_list)

    src_node = _nearest_node(user_lat, user_lng)
    dst_lat, dst_lng = shelter["lat"], shelter["lng"]
    dst_node = _nearest_node(dst_lat, dst_lng)

    # Count zones avoided along fallback path
    risk_zones_avoided = 0

    try:
        path = nx.shortest_path(G, src_node, dst_node, weight="weight")
        path_coords = _interpolate_coords(path)

        # Count edges that had high penalty (zones avoided)
        for u, v in zip(path[:-1], path[1:]):
            edge_data = G.edges[u, v]
            if edge_data.get("penalty", 1.0) > 5.0:
                risk_zones_avoided += 1

        # Estimate distance
        graph_dist = sum(
            G.edges[u, v]["distance_km"]
            for u, v in zip(path[:-1], path[1:])
        )

    except nx.NetworkXNoPath:
        # Straight-line fallback
        path_coords = [[user_lat, user_lng], [dst_lat, dst_lng]]
        graph_dist = _haversine(user_lat, user_lng, dst_lat, dst_lng)

    # Try OSRM for actual road-snapped route
    osrm_coords = await get_osrm_route(user_lat, user_lng, dst_lat, dst_lng)

    if osrm_coords and len(osrm_coords) > 2:
        route_coords = osrm_coords
        # Recalculate distance from OSRM coords
        total_dist = sum(
            _haversine(route_coords[i][0], route_coords[i][1],
                       route_coords[i + 1][0], route_coords[i + 1][1])
            for i in range(len(route_coords) - 1)
        )
    else:
        # Use graph waypoints
        route_coords = path_coords
        total_dist = graph_dist

    # ETA: assume 30 km/h average speed in flood conditions
    eta_minutes = round((total_dist / 30) * 60, 1)

    return {
        "route_coordinates": route_coords,
        "distance_km": round(total_dist, 2),
        "eta_minutes": eta_minutes,
        "risk_zones_avoided": risk_zones_avoided,
        "graph_path": path_coords,
    }
