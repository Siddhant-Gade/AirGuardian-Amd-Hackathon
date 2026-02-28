"""
ml/data_loader.py

Loads raw CSV files from the data/raw/ directory.
Run this script directly to verify your CSVs are readable:
    python ml/data_loader.py
"""
from __future__ import annotations

from pathlib import Path

import pandas as pd

RAW_DIR  = Path(__file__).parent.parent / "data" / "raw"

CPCB_CSV    = RAW_DIR / "cpcb_nagpur.csv"
WEATHER_CSV = RAW_DIR / "weather_nagpur.csv"


def load_cpcb() -> pd.DataFrame:
    """
    Loads the CPCB AQI CSV.
    Expected columns: StationId, Dates, PM2.5, PM10, NO2, AQI
    """
    df = pd.read_csv(CPCB_CSV)
    print(f"CPCB data loaded: {len(df)} rows, columns: {list(df.columns)}")
    return df


def load_weather() -> pd.DataFrame:
    """
    Loads the Open-Meteo weather CSV.
    Expected columns: time, temperature_2m, relative_humidity_2m,
                      wind_speed_10m, wind_direction_10m, boundary_layer_height
    """
    df = pd.read_csv(WEATHER_CSV, comment="#")
    print(f"Weather data loaded: {len(df)} rows, columns: {list(df.columns)}")
    return df


# Aliases used by data_cleaner.py CLI
load_cpcb_csv    = load_cpcb
load_weather_csv = load_weather


if __name__ == "__main__":
    cpcb    = load_cpcb()
    weather = load_weather()
    print("\nCPCB sample:")
    print(cpcb.head(3))
    print("\nWeather sample:")
    print(weather.head(3))
