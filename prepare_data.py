"""
prepare_data.py — One-shot script to prepare training data for AirGuardian.

1. Reads MH015.csv (Nagpur CPCB), computes AQI from pollutant sub-indices,
   renames columns, and saves as data/raw/cpcb_nagpur.csv
2. Reads Dataset4.csv (Open-Meteo weather), skips metadata header,
   renames columns, and saves as data/raw/weather_nagpur.csv
"""
import pandas as pd
import numpy as np
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT   = Path(__file__).parent.resolve()
DATASETS  = PROJECT.parent / "DATASETS"
RAW_DIR   = PROJECT / "data" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

AQI_SRC     = DATASETS / "Dataset2_extracted" / "MH015.csv"
WEATHER_SRC = DATASETS / "Dataset4.csv"

# ---------------------------------------------------------------------------
# CPCB AQI Sub-Index Breakpoints
# Each pollutant: list of (C_low, C_high, I_low, I_high)
# Reference: https://app.cpcbccr.com/ccr_docs/FINAL-REPORT_AQI_.pdf
# ---------------------------------------------------------------------------
BREAKPOINTS = {
    "PM2.5": [
        (0, 30, 0, 50),
        (31, 60, 51, 100),
        (61, 90, 101, 200),
        (91, 120, 201, 300),
        (121, 250, 301, 400),
        (251, 500, 401, 500),
    ],
    "PM10": [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 250, 101, 200),
        (251, 350, 201, 300),
        (351, 430, 301, 400),
        (431, 600, 401, 500),
    ],
    "NO2": [
        (0, 40, 0, 50),
        (41, 80, 51, 100),
        (81, 180, 101, 200),
        (181, 280, 201, 300),
        (281, 400, 301, 400),
        (401, 800, 401, 500),
    ],
    "SO2": [
        (0, 40, 0, 50),
        (41, 80, 51, 100),
        (81, 380, 101, 200),
        (381, 800, 201, 300),
        (801, 1600, 301, 400),
        (1601, 2400, 401, 500),
    ],
    "CO": [  # mg/m3 in source data
        (0, 1.0, 0, 50),
        (1.1, 2.0, 51, 100),
        (2.1, 10.0, 101, 200),
        (10.1, 17.0, 201, 300),
        (17.1, 34.0, 301, 400),
        (34.1, 50.0, 401, 500),
    ],
    "O3": [  # Ozone ug/m3
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 168, 101, 200),
        (169, 208, 201, 300),
        (209, 748, 301, 400),
        (749, 1000, 401, 500),
    ],
}


def calc_sub_index(value: float, breakpoints: list) -> float:
    """Calculate AQI sub-index for a single pollutant value."""
    if pd.isna(value) or value < 0:
        return np.nan
    for c_low, c_high, i_low, i_high in breakpoints:
        if c_low <= value <= c_high:
            return ((i_high - i_low) / (c_high - c_low)) * (value - c_low) + i_low
    # Value exceeds the highest breakpoint — cap at 500
    return 500.0


def compute_aqi(row: pd.Series) -> float:
    """
    AQI = max of all available sub-indices.
    CPCB rule: need at least 3 sub-indices (with at least one from PM2.5 or PM10).
    """
    sub_indices = []

    col_map = {
        "PM2.5": "PM2.5",
        "PM10": "PM10",
        "NO2": "NO2",
        "SO2": "SO2",
        "CO": "CO",
        "O3": "Ozone",
    }

    for pollutant, col_name in col_map.items():
        val = row.get(col_name, np.nan)
        if pd.notna(val):
            si = calc_sub_index(float(val), BREAKPOINTS[pollutant])
            if pd.notna(si):
                sub_indices.append(si)

    if len(sub_indices) < 2:
        return np.nan

    return round(max(sub_indices), 1)


def prepare_aqi_data():
    """Read MH015.csv, compute AQI, rename columns, save."""
    print("=" * 60)
    print("STEP 1: Preparing CPCB AQI data (MH015.csv)")
    print("=" * 60)

    df = pd.read_csv(AQI_SRC)
    print(f"  Loaded: {len(df)} rows, columns: {list(df.columns)}")

    # Rename pollutant columns (strip units)
    rename = {
        "From Date": "Dates",
        "PM2.5 (ug/m3)": "PM2.5",
        "PM10 (ug/m3)": "PM10",
        "NO2 (ug/m3)": "NO2",
        "SO2 (ug/m3)": "SO2",
        "CO (mg/m3)": "CO",
        "Ozone (ug/m3)": "Ozone",
    }
    df = df.rename(columns=rename)

    # Compute AQI row by row
    print("  Computing AQI from sub-indices (PM2.5, PM10, NO2, SO2, CO, O3)...")
    df["AQI"] = df.apply(compute_aqi, axis=1)

    valid = df["AQI"].notna().sum()
    print(f"  AQI computed: {valid}/{len(df)} rows have valid AQI ({valid/len(df)*100:.1f}%)")

    # Drop rows without AQI
    df = df.dropna(subset=["AQI"])

    # Keep only the columns the pipeline needs + extras that might help
    keep_cols = ["Dates", "PM2.5", "PM10", "NO2", "AQI"]
    available = [c for c in keep_cols if c in df.columns]
    df = df[available]

    out_path = RAW_DIR / "cpcb_nagpur.csv"
    df.to_csv(out_path, index=False)
    print(f"  Saved: {out_path} ({len(df)} rows)")
    print(f"  AQI stats — min: {df['AQI'].min()}, max: {df['AQI'].max()}, mean: {df['AQI'].mean():.1f}")
    print()
    return df


def prepare_weather_data():
    """Read Dataset4.csv, skip metadata header, rename columns, save."""
    print("=" * 60)
    print("STEP 2: Preparing weather data (Dataset4.csv)")
    print("=" * 60)

    # Dataset4. csv has a 2-line metadata header, then a blank line, then the actual CSV
    # Line 1: latitude,longitude,elevation,...
    # Line 2: 21.124779,79.11585,310.0,...
    # Line 3: (blank)
    # Line 4: time,temperature_2m (°C),...  ← actual header
    # Line 5+: data rows
    df = pd.read_csv(WEATHER_SRC, skiprows=3)
    print(f"  Loaded: {len(df)} rows, columns: {list(df.columns)}")

    # Rename columns to match what data_cleaner.py expects
    # The column names may have encoding issues with degree symbols
    col_renames = {}
    for col in df.columns:
        if "temperature" in col.lower():
            col_renames[col] = "temperature_2m"
        elif "humidity" in col.lower():
            col_renames[col] = "relative_humidity_2m"
        elif "wind_speed" in col.lower():
            col_renames[col] = "wind_speed_10m"
        elif "wind_direction" in col.lower():
            col_renames[col] = "wind_direction_10m"
        elif "boundary" in col.lower():
            col_renames[col] = "boundary_layer_height"

    df = df.rename(columns=col_renames)
    print(f"  Renamed columns: {list(df.columns)}")

    out_path = RAW_DIR / "weather_nagpur.csv"
    df.to_csv(out_path, index=False)
    print(f"  Saved: {out_path} ({len(df)} rows)")
    print(f"  Date range: {df['time'].iloc[0]} → {df['time'].iloc[-1]}")
    print()
    return df


if __name__ == "__main__":
    aqi_df = prepare_aqi_data()
    weather_df = prepare_weather_data()

    print("=" * 60)
    print("DATA PREPARATION COMPLETE")
    print("=" * 60)
    print(f"  cpcb_nagpur.csv    : {len(aqi_df)} rows")
    print(f"  weather_nagpur.csv : {len(weather_df)} rows")
    print()
    print("Next: run `python ml/train.py` to train the model.")
