import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
from services.alert_manager import alert_manager
from models.schemas import AlertBroadcast

router = APIRouter(tags=["alerts"])


@router.get("/api/alerts")
async def get_alerts(limit: int = Query(20, ge=1, le=100)):
    """Return recent alerts."""
    return alert_manager.get_alerts(limit=limit)


@router.websocket("/ws/alerts")
async def websocket_alerts(ws: WebSocket):
    """WebSocket endpoint — pushes live alerts to connected clients."""
    await alert_manager.connect(ws)
    try:
        while True:
            # Keep connection alive; server pushes, client just listens
            data = await ws.receive_text()
            # Optionally handle ping/pong
            if data == "ping":
                await ws.send_text("pong")
    except WebSocketDisconnect:
        alert_manager.disconnect(ws)
    except Exception:
        alert_manager.disconnect(ws)
