"""
backend/services/model_service.py

Loads the GRU model and scaler once at module import time.
Exposes get_prediction(zone) as the single callable for all routes.

Optimisation: weather data (Open-Meteo) is Nagpur-wide and identical for
every zone call within the same minute.  A 10-minute TTL cache means the
scheduler's 6-zone cycle makes exactly ONE HTTP request to Open-Meteo
instead of six.
"""
from __future__ import annotations

import logging
import time

import pandas as pd

from data_integration.cpcb_fetcher import get_latest_station_data
from data_integration.weather_fetcher import get_latest_weather
from data_integration.feature_merger import merge_features
from ml.predict import predict_aqi, model as _gru_model

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model availability flag
# ---------------------------------------------------------------------------
_MODEL_LOADED: bool = _gru_model is not None


def is_model_loaded() -> bool:
    """Returns True if the GRU model was loaded successfully at startup."""
    return _MODEL_LOADED


# ---------------------------------------------------------------------------
# Weather TTL cache — shared across all zone calls in the same cycle
# ---------------------------------------------------------------------------
_WEATHER_TTL_SECONDS: int = 600          # 10 minutes
_weather_cache: tuple[float, pd.DataFrame] | None = None  # (monotonic_ts, df)


def _get_weather(hours: int = 24) -> pd.DataFrame:
    """
    Returns up-to-date weather data, hitting Open-Meteo at most once per
    _WEATHER_TTL_SECONDS seconds.  Thread-safe enough for a single-worker
    demo; no locking needed at hackathon scale.
    """
    global _weather_cache
    now = time.monotonic()
    if _weather_cache is not None and (now - _weather_cache[0]) < _WEATHER_TTL_SECONDS:
        logger.debug("Weather cache hit (age %.0fs).", now - _weather_cache[0])
        return _weather_cache[1].copy()

    logger.info("Fetching fresh weather data from Open-Meteo.")
    df = get_latest_weather(hours=hours)
    _weather_cache = (now, df)
    return df.copy()


# ---------------------------------------------------------------------------
# Public prediction API
# ---------------------------------------------------------------------------
def get_prediction(zone: str) -> dict:
    """
    Full prediction pipeline for one zone.

    Steps:
      1. Pull latest 24 hours of AQI data for the zone's nearest station.
      2. Pull latest 24 hours of weather data (cached — one request per 10 min).
      3. Merge into a clean feature DataFrame.
      4. Run GRU model inference.
      5. Return enriched result dict with zone key attached.

    Called by routes/predict.py, routes/alert.py, and scheduler_service.
    """
    logger.info("Running prediction for zone: %s", zone)

    # Step 1 — live AQI from CPCB / OpenAQ fallback
    aqi_data = get_latest_station_data(zone=zone, hours=24)

    # Step 2 — weather (TTL-cached; shared across all zones in same cycle)
    weather_data = _get_weather(hours=24)

    # Step 3 — merge into model-ready DataFrame
    feature_df = merge_features(aqi_data, weather_data)

    # Step 4 — inference
    result = predict_aqi(feature_df)

    # Step 5 — tag with zone name
    result["zone"] = zone

    return result
