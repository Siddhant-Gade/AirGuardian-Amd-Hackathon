"""
data_integration/feature_merger.py

Merges CPCB AQI data with Open-Meteo weather data on a shared hourly
timestamp index, producing the exact DataFrame shape expected by predict_aqi().
"""
from __future__ import annotations

import logging

import pandas as pd

logger = logging.getLogger(__name__)

REQUIRED_COLS = ["AQI", "PM2.5", "temperature", "humidity",
                 "wind_speed", "boundary_layer_height"]


def merge_features(
    aqi_df    : pd.DataFrame,
    weather_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Merges AQI data and weather data hour-by-hour.

    Both DataFrames must have a 'timestamp' column (or a DatetimeIndex).
    Returns a clean DataFrame with REQUIRED_COLS, forward-filled, len == 24.
    """
    # Normalise indexes
    aqi_df     = _to_hourly_index(aqi_df)
    weather_df = _to_hourly_index(weather_df)

    # Outer merge on timestamp index (keep all hours from both)
    merged = aqi_df.join(weather_df, how="outer", rsuffix="_weather")

    # Forward-fill short gaps (≤3 hrs) then drop remaining NaN rows
    merged = merged.ffill(limit=3).dropna()

    # Keep only the last 24 complete rows
    if len(merged) < 24:
        logger.warning(
            "Merged DataFrame has only %d rows (need 24). Synthetic fill applied.",
            len(merged),
        )
        merged = _pad_to_24(merged)

    result = merged[REQUIRED_COLS].tail(24).reset_index(drop=True)
    logger.info("Feature merge complete: %d rows, %d cols.", len(result), len(result.columns))
    return result


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------
def _to_hourly_index(df: pd.DataFrame) -> pd.DataFrame:
    """Converts a 'timestamp' column (or existing DatetimeIndex) to hourly UTC-naive index.

    Normalises timezone-aware (e.g. OpenAQ UTC) and timezone-naive (e.g.
    Open-Meteo UTC) indexes to the same tz-naive UTC floor so that pandas
    join() never raises a tz-naive / tz-aware mismatch TypeError.
    """
    if "timestamp" in df.columns:
        df = df.set_index("timestamp")
    idx = pd.to_datetime(df.index)
    # Strip timezone info — convert tz-aware to UTC first, then make naive;
    # leave tz-naive untouched (Open-Meteo already returns UTC when requested).
    if idx.tz is not None:
        idx = idx.tz_convert("UTC").tz_localize(None)
    df.index = idx.floor("h")
    return df.sort_index()


def _pad_to_24(df: pd.DataFrame) -> pd.DataFrame:
    """
    If fewer than 24 rows, back-fills from the first row so we always
    return 24 complete rows (worst-case safety net).
    Raises ValueError if df is completely empty (no data at all to pad from).
    """
    if len(df) == 0:
        raise ValueError(
            "Merged feature DataFrame is empty — no overlapping timestamps between "
            "AQI data and weather data. Check that your data sources cover the same "
            "time range and that the API calls are succeeding."
        )
    while len(df) < 24:
        df = pd.concat([df.iloc[[0]], df], ignore_index=False)
    return df.tail(24)
