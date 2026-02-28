"""
backend/routes/predict.py

Routes:
  GET /api/predict          — Predict AQI for a single zone
  GET /api/predict/all      — Predict AQI for all zones (batch)
"""
from fastapi import APIRouter, Query, HTTPException
from backend.services.model_service import get_prediction
from backend.database.db import save_prediction
from config import ZONES

router = APIRouter()

VALID_ZONES = list(ZONES.keys())


@router.get("/predict", summary="Predict AQI for a single zone")
def predict_zone(
    zone: str = Query(
        ...,
        description=f"Campus zone name. Valid values: {VALID_ZONES}",
        example="Sports Ground",
    )
):
    """
    Returns the 6-hour ahead AQI prediction for one campus zone.
    Persists the prediction to the database for later accuracy tracking.
    """
    if zone not in VALID_ZONES:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown zone '{zone}'. Valid zones: {VALID_ZONES}",
        )
    try:
        result = get_prediction(zone)
        # Log prediction for accuracy tracking
        try:
            save_prediction(zone, result)
        except Exception:
            pass  # Don't fail the response if logging fails
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/predict/all", summary="Predict AQI for all campus zones (batch)")
def predict_all_zones():
    """
    Runs predictions for every campus zone sequentially and returns them as a dict.
    Useful for refreshing the dashboard without needing /api/zones IDW interpolation.
    """
    results: dict = {}
    errors:  dict = {}

    for zone in VALID_ZONES:
        try:
            result = get_prediction(zone)
            try:
                save_prediction(zone, result)
            except Exception:
                pass
            results[zone] = result
        except Exception as exc:
            errors[zone] = str(exc)

    return {
        "predictions": results,
        "errors"     : errors,
        "zones_ok"   : len(results),
        "zones_failed": len(errors),
    }
