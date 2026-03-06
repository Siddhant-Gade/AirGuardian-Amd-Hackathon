"""
data_integration/zone_orchestrator.py

Loops all CPCB monitoring stations, runs GRU model inference for each,
then IDW-interpolates to every city zone across the Nagpur metro area.

Returns: { zone_name : { predicted_aqi, severity, lat, lon } }
"""
from __future__ import annotations

import logging

from config import ZONES, STATIONS, AQI_SEVERITY_MAP
from data_integration.idw_engine import idw_interpolate
from backend.services.model_service import get_prediction  # type: ignore[import]

logger = logging.getLogger(__name__)


def get_all_zone_predictions() -> dict[str, dict]:
    """
    1. Get model prediction for each CPCB monitoring station.
    2. IDW interpolate to estimate AQI at each city zone.
    3. Return zone → { predicted_aqi, severity, lat, lon } map
       (used by frontend Leaflet heatmap).
    """
    # --- Step 1: predict at each monitoring station -----------------------
    station_predictions: list[dict] = []
    for station_name, coords in STATIONS.items():
        try:
            result = get_prediction(zone=station_name)
            station_predictions.append({
                "lat"          : coords["lat"],
                "lon"          : coords["lon"],
                "predicted_aqi": result["predicted_aqi"],
            })
            logger.info("Station %s → AQI %s", station_name, result["predicted_aqi"])
        except Exception as exc:
            logger.warning("Prediction failed for station %s: %s", station_name, exc)

    if not station_predictions:
        logger.error("No station predictions available — returning empty zone map.")
        return {}

    # --- Step 2: IDW interpolate to each campus zone ----------------------
    zone_results: dict[str, dict] = {}
    for zone_name, coords in ZONES.items():
        interp_aqi = idw_interpolate(
            zone_lat            = coords["lat"],
            zone_lon            = coords["lon"],
            station_predictions = station_predictions,
        )
        severity = _aqi_to_severity(interp_aqi)
        zone_results[zone_name] = {
            "predicted_aqi": interp_aqi,
            "severity"     : severity,
            "lat"          : coords["lat"],
            "lon"          : coords["lon"],
        }

    return zone_results


# ---------------------------------------------------------------------------
# Private
# ---------------------------------------------------------------------------
def _aqi_to_severity(aqi: float) -> str:
    for threshold, label in AQI_SEVERITY_MAP:
        if aqi <= threshold:
            return label
    return "Hazardous"
