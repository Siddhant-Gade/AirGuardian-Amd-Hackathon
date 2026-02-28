"""
ml/data_cleaner.py — Clean and preprocess raw AQI + weather DataFrames.

Rules:
  - Drop rows where AQI is null (cannot be imputed)
  - Resample to hourly, forward-fill gaps ≤ 3 hours
  - Drop rows still null after filling (large gaps)
  - Standardise column names across data sources
  - Merge CPCB AQI with Open-Meteo weather on timestamp
  - Save merged output to data/processed/merged_dataset.csv
"""
from __future__ import annotations

import logging
from pathlib import Path

import pandas as pd

from config import FEATURE_COLS

logger = logging.getLogger(__name__)

DATA_PROCESSED = Path(__file__).parent.parent / "data" / "processed"


def clean_aqi_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean raw CPCB AQI DataFrame.

    Args:
        df: Raw CPCB DataFrame with columns [Dates, PM2.5, AQI, ...]

    Returns:
        Cleaned DataFrame indexed by timestamp with columns:
        [AQI, PM2.5, temperature, humidity, wind_speed, boundary_layer_height]
        (weather columns may all be NaN here — merged later)
    """
    # Normalise timestamp column
    if "Dates" in df.columns:
        df["timestamp"] = pd.to_datetime(df["Dates"], errors="coerce")
    elif "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    else:
        raise ValueError("DataFrame has no 'Dates' or 'timestamp' column.")

    df = df.set_index("timestamp").sort_index()

    # Only keep the columns we care about (ignore missing ones gracefully)
    keep = {"AQI", "PM2.5"}
    available = keep.intersection(set(df.columns))
    df = df[list(available)]

    if "AQI" not in df.columns:
        raise ValueError("AQI column missing from CPCB data.")

    # Drop rows with null AQI — these cannot be imputed
    df = df.dropna(subset=["AQI"])

    # Resample to strict hourly index
    df = df.resample("h").asfreq()

    # Identify gap groups
    df["_gap"] = df["AQI"].isna()
    df["_gap_group"] = (df["_gap"] != df["_gap"].shift()).cumsum()

    gap_sizes = df[df["_gap"]].groupby("_gap_group").size()
    long_gaps = gap_sizes[gap_sizes > 3].index

    # Null out large gaps (do not forward-fill them)
    df.loc[df["_gap_group"].isin(long_gaps), "AQI"] = None

    # Forward-fill short gaps (≤ 3 hours)
    df["AQI"] = df["AQI"].ffill(limit=3)

    # Drop still-null rows
    df = df.dropna(subset=["AQI"])
    df = df.drop(columns=["_gap", "_gap_group"])

    logger.info("After cleaning: %d rows remain", len(df))
    return df


def clean_weather_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean Open-Meteo weather DataFrame.

    Args:
        df: Raw Open-Meteo DataFrame with columns including 'time'.

    Returns:
        Weather DataFrame indexed by timestamp with standardised column names.
    """
    rename_map = {
        "time"                  : "timestamp",
        "temperature_2m"        : "temperature",
        "relative_humidity_2m"  : "humidity",
        "wind_speed_10m"        : "wind_speed",
        "wind_direction_10m"    : "wind_direction",
        "boundary_layer_height" : "boundary_layer_height",
    }
    df = df.rename(columns=rename_map)

    if "timestamp" not in df.columns:
        raise ValueError("Weather DataFrame has no 'time'/'timestamp' column.")

    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df = df.set_index("timestamp").sort_index()

    weather_cols = ["temperature", "humidity", "wind_speed", "boundary_layer_height"]
    available = [c for c in weather_cols if c in df.columns]
    df = df[available].resample("h").mean()

    logger.info("After weather cleaning: %d rows, cols: %s", len(df), list(df.columns))
    return df


def merge_and_save(
    aqi_df: pd.DataFrame,
    weather_df: pd.DataFrame,
    output_filename: str = "merged_dataset.csv",
) -> pd.DataFrame:
    """
    Inner-join cleaned AQI data with weather data on timestamp, then save.

    Returns:
        Merged DataFrame with all FEATURE_COLS present.
    """
    merged = aqi_df.join(weather_df, how="inner")

    # Ensure all required feature columns are present
    missing = [c for c in FEATURE_COLS if c not in merged.columns]
    if missing:
        logger.warning("Missing feature columns after merge: %s", missing)

    merged = merged.dropna()
    logger.info("Merged dataset: %d rows", len(merged))

    DATA_PROCESSED.mkdir(parents=True, exist_ok=True)
    output_path = DATA_PROCESSED / output_filename
    merged.index.name = "timestamp"
    merged.to_csv(output_path)
    logger.info("Merged dataset saved to %s", output_path)

    return merged


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)

    from ml.data_loader import load_cpcb_csv, load_weather_csv

    raw_aqi     = load_cpcb_csv()
    raw_weather = load_weather_csv()

    clean_aqi     = clean_aqi_data(raw_aqi)
    clean_weather = clean_weather_data(raw_weather)

    merged = merge_and_save(clean_aqi, clean_weather)
    print(f"Done. Merged shape: {merged.shape}")
