"""
backend/routes/zones.py

Routes:
  GET /api/zones            — All campus zone predictions (heatmap data)
  GET /api/alerts/history   — Recent alert log from SQLite
  GET /api/alerts/zone      — Alert history filtered by zone
  GET /api/stats            — Aggregate alert statistics
"""
from fastapi import APIRouter, Query, HTTPException
from data_integration.zone_orchestrator import get_all_zone_predictions
from backend.database.db import get_recent_alerts, get_alerts_by_zone, get_alert_stats
from config import ZONES

router = APIRouter()

VALID_ZONES = list(ZONES.keys())


@router.get("/zones", summary="All zone predictions — heatmap data")
def all_zones():
    """Returns IDW-interpolated AQI predictions for every campus zone."""
    try:
        return get_all_zone_predictions()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/alerts/history", summary="Recent alert history log")
def alerts_history(
    limit: int = Query(default=10, ge=1, le=100, description="Number of alerts to return"),
):
    """Returns the most recent N alert entries from the database."""
    try:
        return get_recent_alerts(limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/alerts/zone", summary="Alert history for a specific zone")
def alerts_by_zone(
    zone : str = Query(..., description=f"Campus zone name. Valid: {VALID_ZONES}"),
    limit: int = Query(default=20, ge=1, le=100, description="Number of records to return"),
):
    """Returns alert history filtered to a single campus zone."""
    if zone not in VALID_ZONES:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown zone '{zone}'. Valid zones: {VALID_ZONES}",
        )
    try:
        return get_alerts_by_zone(zone=zone, limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/stats", summary="Aggregate alert statistics")
def alert_stats():
    """
    Returns aggregate statistics:
      - Total alerts fired
      - Severity breakdown
      - Alerts per zone
      - Worst zone (highest recorded AQI)
      - Timestamp of last alert
    """
    try:
        return get_alert_stats()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
