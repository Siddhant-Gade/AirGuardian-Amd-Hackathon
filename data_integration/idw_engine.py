"""
data_integration/idw_engine.py

Inverse Distance Weighting (IDW) spatial interpolation.
Estimates the air quality index at any target coordinate based on
predictions at nearby monitoring stations.

This is the standard technique used in official meteorological mapping
and GIS systems (same algorithm as ArcGIS / QGIS IDW tool).
"""
from __future__ import annotations

import math
import logging

logger = logging.getLogger(__name__)


def idw_interpolate(
    zone_lat           : float,
    zone_lon           : float,
    station_predictions: list[dict],
    power              : int = 2,
) -> float:
    """
    Inverse Distance Weighting interpolation.

    Args:
        zone_lat             : Target latitude  (decimal degrees)
        zone_lon             : Target longitude (decimal degrees)
        station_predictions  : List of {"lat": float, "lon": float,
                                         "predicted_aqi": float}
        power                : IDW power parameter (standard = 2)

    Returns:
        Interpolated AQI float, rounded to 1 decimal place.
    """
    if not station_predictions:
        logger.warning("No station predictions supplied to IDW — returning 0.")
        return 0.0

    weights    : list[float] = []
    aqi_values : list[float] = []

    for station in station_predictions:
        dist = _haversine(zone_lat, zone_lon, station["lat"], station["lon"])

        # If zone is essentially AT the station, return that AQI directly
        if dist < 1e-5:
            return round(float(station["predicted_aqi"]), 1)

        weight = 1.0 / (dist ** power)
        weights.append(weight)
        aqi_values.append(float(station["predicted_aqi"]))

    total_weight = sum(weights)
    interpolated = sum(w * v for w, v in zip(weights, aqi_values)) / total_weight
    return round(interpolated, 1)


# ---------------------------------------------------------------------------
# Private
# ---------------------------------------------------------------------------
def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Returns the great-circle distance in kilometres between two coordinates.
    More accurate than Euclidean for geographic distances.
    """
    R    = 6371.0          # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a    = (math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(dlon / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))
