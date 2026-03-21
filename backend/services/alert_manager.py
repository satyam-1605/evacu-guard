"""
Alert Manager: manages alert state and WebSocket broadcast.
"""
import asyncio
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Set
from fastapi import WebSocket

# In-memory alert store
_alerts: List[Dict[str, Any]] = [
    {
        "id": "alert-boot-1",
        "title": "Heavy Rainfall — Mansarovar",
        "description": "45mm/hr rainfall detected. Dravyavati river water level at 87% capacity. Immediate evacuation advised.",
        "severity": "critical",
        "location": "Mansarovar, Jaipur",
        "type": "flood",
        "created_at": datetime.utcnow().isoformat() + "Z",
    },
    {
        "id": "alert-boot-2",
        "title": "IMD Orange Alert — Jaipur District",
        "description": "India Meteorological Department has issued Orange Alert for Jaipur. Rainfall forecast: 65-115mm in next 6 hours.",
        "severity": "warning",
        "location": "Jaipur District",
        "type": "weather",
        "created_at": datetime.utcnow().isoformat() + "Z",
    },
    {
        "id": "alert-boot-3",
        "title": "Sanganer Zone Escalated to CRITICAL",
        "description": "Amanishah Nala overflowing near Sanganer. 28,000 residents at risk. Emergency services deployed.",
        "severity": "critical",
        "location": "Sanganer, Jaipur",
        "type": "flood",
        "created_at": datetime.utcnow().isoformat() + "Z",
    },
]

# Active WebSocket connections
_connections: Set[WebSocket] = set()

# Citizen reports store
_reports: List[Dict[str, Any]] = []
_report_counts: Dict[str, int] = {}  # zone_key -> count


class AlertManager:
    def __init__(self):
        self._alerts = _alerts
        self._connections = _connections

    # ── WebSocket management ─────────────────────────────────────────────────

    async def connect(self, ws: WebSocket):
        await ws.accept()
        _connections.add(ws)
        # Send current alerts on connect
        try:
            await ws.send_json({"type": "init", "alerts": _alerts[-10:]})
        except Exception:
            pass

    def disconnect(self, ws: WebSocket):
        _connections.discard(ws)

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast to all connected WebSocket clients."""
        dead = set()
        for ws in list(_connections):
            try:
                await ws.send_json(message)
            except Exception:
                dead.add(ws)
        _connections -= dead

    # ── Alert management ─────────────────────────────────────────────────────

    def get_alerts(self, limit: int = 20) -> List[Dict[str, Any]]:
        return list(reversed(_alerts[-limit:]))

    async def add_alert(self, title: str, description: str, severity: str,
                        location: str, alert_type: str = "system") -> Dict[str, Any]:
        alert = {
            "id": f"alert-{uuid.uuid4().hex[:8]}",
            "title": title,
            "description": description,
            "severity": severity,
            "location": location,
            "type": alert_type,
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
        _alerts.append(alert)
        # Keep last 100
        if len(_alerts) > 100:
            _alerts.pop(0)

        await self.broadcast({"type": "new_alert", "alert": alert})
        return alert

    # ── Citizen report management ────────────────────────────────────────────

    def add_report(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        report = {
            "id": f"rep-{uuid.uuid4().hex[:8]}",
            **report_data,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "status": "pending",
        }
        _reports.append(report)

        # Zone key from rounded coordinates
        zone_key = f"{round(report_data['lat'], 2)},{round(report_data['lng'], 2)}"
        _report_counts[zone_key] = _report_counts.get(zone_key, 0) + 1

        return report, _report_counts.get(zone_key, 1)

    def get_reports(self) -> List[Dict[str, Any]]:
        return list(reversed(_reports[-50:]))

    async def check_auto_escalate(self, zone_key: str, count: int, hazard_state) -> bool:
        """Auto-escalate zone if 3+ reports from same area in 30 min."""
        if count >= 3:
            await self.add_alert(
                title="Auto-Escalation: Citizen Reports Threshold",
                description=f"{count} citizen reports from the same zone in 30 minutes. Zone risk elevated automatically.",
                severity="warning",
                location="Jaipur",
                alert_type="auto_escalation",
            )
            return True
        return False

    # ── Stats ────────────────────────────────────────────────────────────────

    def get_connection_count(self) -> int:
        return len(_connections)


# Singleton
alert_manager = AlertManager()
