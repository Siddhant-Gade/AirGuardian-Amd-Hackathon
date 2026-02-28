"""
data_integration/weather_fetcher.py

Fetches the latest hourly weather forecast from the Open-Meteo API (no key needed).
Falls back to synthetic data if the API is unavailable.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

import httpx
import pandas as pd

from config import OPEN_METEO_BASE, NAGPUR_LAT, NAGPUR_LON, WEATHER_VARS

logger = logging.getLogger(__name__)


def get_latest_weather(hours: int = 24) -> pd.DataFrame:
    """
    Returns a DataFrame with the last `hours` hourly weather rows.
    Columns: timestamp, temperature, humidity, wind_speed, wind_direction, boundary_layer_height
    """
    try:
        return _fetch_open_meteo(hours)
    except Exception as exc:
        logger.warning("Open-Meteo fetch failed: %s — using synthetic data.", exc)
        return _synthetic_weather(hours)


# ---------------------------------------------------------------------------
# Private
# ---------------------------------------------------------------------------
def _fetch_open_meteo(hours: int) -> pd.DataFrame:
    today     = datetime.now(tz=timezone.utc).date()
    yesterday = today - timedelta(days=1)

    params = {
        "latitude"  : NAGPUR_LAT,
        "longitude" : NAGPUR_LON,
        "hourly"    : WEATHER_VARS,
        # Use UTC so timestamps are consistent with OpenAQ (UTC) and the
        # feature-merger can join both datasets without a tz-mismatch error.
        "timezone"  : "UTC",
        "start_date": str(yesterday),
        "end_date"  : str(today),
        # NOTE: do NOT pass forecast_days alongside start_date/end_date —
        # they are mutually exclusive on the Open-Meteo API.
    }

    resp = httpx.get(OPEN_METEO_BASE, params=params, timeout=15)
    resp.raise_for_status()
    j = resp.json()

    hourly = j["hourly"]
    df = pd.DataFrame({
        "timestamp"                : pd.to_datetime(hourly["time"]),
        "temperature"              : hourly["temperature_2m"],
        "humidity"                 : hourly["relative_humidity_2m"],
        "wind_speed"               : hourly["wind_speed_10m"],
        "wind_direction"           : hourly["wind_direction_10m"],
        "boundary_layer_height"    : hourly.get("boundary_layer_height", [600] * len(hourly["time"])),
    })

    df = df.sort_values("timestamp").tail(hours).reset_index(drop=True)
    return df


def _synthetic_weather(hours: int = 24) -> pd.DataFrame:
    """Stable synthetic weather sequence used as offline fallback."""
    import numpy as np

    end = datetime.now(tz=timezone.utc).replace(minute=0, second=0, microsecond=0)
    timestamps = [end - timedelta(hours=h) for h in range(hours - 1, -1, -1)]

    return pd.DataFrame({
        "timestamp"             : timestamps,
        "temperature"           : np.random.normal(28, 3, hours).clip(15, 45),
        "humidity"              : np.random.normal(65, 10, hours).clip(20, 100),
        "wind_speed"            : np.abs(np.random.normal(12, 4, hours)).clip(0, 60),
        "wind_direction"        : np.random.uniform(0, 360, hours),
        "boundary_layer_height" : np.random.normal(600, 100, hours).clip(100, 2000),
    })
