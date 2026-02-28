"""
data_integration/cpcb_fetcher.py

Fetches live AQI data for a given zone from the OpenAQ API (no key needed).
Falls back to generating a plausible synthetic sequence when offline.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

import httpx
import pandas as pd

from config import OPENAQ_BASE, STATIONS, settings

logger = logging.getLogger(__name__)

# Map zone names to nearest CPCB station name
ZONE_TO_STATION: dict[str, str] = {
    "Main Gate"     : "Civil Lines",
    "Hostel A"      : "Civil Lines",
    "Academic Block": "Civil Lines",
    "Library"       : "Civil Lines",
    "Sports Ground" : "Ambazari",
    "Parking Area"  : "Ambazari",
    # Station names map to themselves
    "Civil Lines"   : "Civil Lines",
    "Ambazari"      : "Ambazari",
}

# OpenAQ location IDs for Nagpur stations (looked up once)
STATION_LOCATION_IDS: dict[str, int] = {
    "Civil Lines": 8118,
    "Ambazari"   : 8119,
}


def get_latest_station_data(zone: str, hours: int = 24) -> pd.DataFrame:
    """
    Returns a DataFrame with the last `hours` hourly AQI + PM2.5 readings
    for the station nearest to `zone`.

    Columns: timestamp, AQI, PM2.5
    If live fetch fails, returns synthetic data so inference never crashes.
    """
    station = ZONE_TO_STATION.get(zone, "Civil Lines")
    loc_id  = STATION_LOCATION_IDS.get(station, 8118)

    try:
        return _fetch_openaq(loc_id, hours)
    except Exception as exc:
        logger.warning("OpenAQ fetch failed for %s: %s — using synthetic data.", zone, exc)
        return _synthetic_aqi(hours)


# ---------------------------------------------------------------------------
# Private
# ---------------------------------------------------------------------------
def _fetch_openaq(location_id: int, hours: int) -> pd.DataFrame:
    end   = datetime.now(tz=timezone.utc)
    start = end - timedelta(hours=hours)

    url    = f"{OPENAQ_BASE}/locations/{location_id}/measurements"
    params = {
        "date_from": start.isoformat(),
        "date_to"  : end.isoformat(),
        # Use a high limit: the API mixes all parameters (NO2, SO2, PM10, PM2.5…)
        # so we need many records to guarantee ≥24 PM2.5 hourly readings.
        "limit"    : hours * 8,
    }
    # Pass API key when configured (higher rate limits)
    headers: dict[str, str] = {}
    if settings.openaq_api_key:
        headers["X-API-Key"] = settings.openaq_api_key

    resp = httpx.get(url, params=params, headers=headers, timeout=10)
    resp.raise_for_status()
    data = resp.json().get("results", [])

    if not data:
        raise ValueError("Empty result from OpenAQ API")

    records: list[dict] = []
    for r in data:
        # Filter strictly to PM2.5 — handle OpenAQ v2 (string) and v3 (object) formats
        param = r.get("parameter", "")
        param_name = param.get("name", "") if isinstance(param, dict) else str(param)
        if param_name not in ("pm25", "PM2.5"):
            continue  # skip NO2, SO2, PM10, etc.

        # Timestamp: OpenAQ v3 uses period.datetimeFrom.utc; v2 uses date.utc
        ts = (
            (r.get("period") or {}).get("datetimeFrom", {}).get("utc")  # v3
            or (r.get("date") or {}).get("utc")                          # v2
        )
        value = r.get("value")
        if ts is not None and value is not None:
            records.append({"timestamp": ts, "PM2.5": float(value)})

    if not records:
        raise ValueError("No PM2.5 measurements found in OpenAQ response")

    df = pd.DataFrame(records)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").set_index("timestamp")
    df = df.resample("h").mean().ffill().tail(hours).reset_index()

    # AQI is approximated from PM2.5 using linear AQI breakpoints (India NAAQS)
    df["AQI"] = df["PM2.5"].apply(_pm25_to_aqi)

    return df[["timestamp", "AQI", "PM2.5"]]


def _pm25_to_aqi(pm25: float) -> float:
    """Linear AQI approximation from PM2.5 (μg/m³) — India NAAQS scale."""
    breakpoints = [
        (0,   30,   0,   50),
        (30,  60,   51,  100),
        (60,  90,   101, 200),
        (90,  120,  201, 300),
        (120, 250,  301, 400),
        (250, 500,  401, 500),
    ]
    for c_lo, c_hi, i_lo, i_hi in breakpoints:
        if c_lo <= pm25 <= c_hi:
            return round(i_lo + (pm25 - c_lo) * (i_hi - i_lo) / (c_hi - c_lo), 1)
    return 500.0


def _synthetic_aqi(hours: int = 24) -> pd.DataFrame:
    """Stable synthetic sequence used as offline fallback."""
    import numpy as np

    end = datetime.now(tz=timezone.utc).replace(minute=0, second=0, microsecond=0)
    timestamps = [end - timedelta(hours=h) for h in range(hours - 1, -1, -1)]
    pm25 = np.abs(np.random.normal(60, 15, hours)).clip(10, 200)

    df = pd.DataFrame({
        "timestamp": timestamps,
        "PM2.5"    : pm25,
        "AQI"      : [_pm25_to_aqi(p) for p in pm25],
    })
    return df
