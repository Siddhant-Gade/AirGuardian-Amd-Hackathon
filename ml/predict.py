"""
ml/predict.py

Inference module for the AirGuardian GRU model.

Loads model.pt, scaler.pkl, and feature_columns.json ONCE at module import
time.  predict_aqi() is the only function the backend calls — it must NOT
be modified to touch model internals directly.
"""
from __future__ import annotations

import json
import logging
import pickle

import numpy as np
import pandas as pd
import torch

from config import (
    MODEL_PATH,
    SCALER_PATH,
    FEATURE_COLS_PATH,
    FEATURE_COLS,
    SCALE_COLS,
    AQI_SEVERITY_MAP,
    AQI_ALERT_THRESHOLD,
)
from ml.model import AQIPredictor

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level singletons — load ONCE on import, not per request
# ---------------------------------------------------------------------------
model: AQIPredictor | None = None
_scaler                    = None
_feature_columns: list[str] | None = None


def _load_artifacts() -> None:
    global model, _scaler, _feature_columns

    if not MODEL_PATH.exists() or not SCALER_PATH.exists() or not FEATURE_COLS_PATH.exists():
        logger.warning(
            "Model artifacts not found at %s. "
            "Run `python ml/train.py` first.",
            MODEL_PATH.parent,
        )
        return

    try:
        _m = AQIPredictor()
        _m.load_state_dict(
            torch.load(str(MODEL_PATH), map_location="cpu", weights_only=True)
        )
        _m.eval()
        model = _m

        with open(SCALER_PATH, "rb") as f:
            _scaler = pickle.load(f)

        with open(FEATURE_COLS_PATH) as f:
            _feature_columns = json.load(f)

        logger.info("GRU model loaded successfully from %s.", MODEL_PATH)
        print(f"✅ Model loaded: {MODEL_PATH}")
    except Exception as exc:
        logger.error("Failed to load model artifacts: %s", exc)
        model = None


_load_artifacts()


# ---------------------------------------------------------------------------
# Public inference API
# ---------------------------------------------------------------------------
def predict_aqi(last_24_hours_df: pd.DataFrame) -> dict:
    """
    Takes a DataFrame of the last 24 hourly rows (FEATURE_COLS columns).
    Returns a prediction dict:

    {
        "predicted_aqi"  : 247.3,
        "severity"       : "Very Poor",
        "trigger_alert"  : True,
        "features"       : {
            "wind_speed"           : 14.2,
            "boundary_layer_height": 420,
            "humidity"             : 78,
            "aqi_trend"            : "rising"
        }
    }

    Falls back to a plausible mock result when model is unavailable
    (so the backend does NOT crash during demo if model.pt is missing).
    """
    if model is None or _scaler is None:
        logger.warning("Model not loaded — returning mock prediction.")
        return _mock_prediction()

    # Validate that feature columns match what the model was trained on
    if _feature_columns is not None and list(_feature_columns) != FEATURE_COLS:
        logger.warning(
            "Feature column mismatch! Saved: %s  Config: %s — using config order.",
            _feature_columns, FEATURE_COLS,
        )

    df = last_24_hours_df[FEATURE_COLS].copy()

    # Scale features (not AQI)
    df[SCALE_COLS] = _scaler.transform(df[SCALE_COLS])

    x = torch.FloatTensor(df.values).unsqueeze(0)   # (1, 24, 6)

    with torch.no_grad():
        predicted = model(x).item()

    predicted = round(max(0.0, predicted), 1)

    severity = "Hazardous"
    for threshold, label in AQI_SEVERITY_MAP:
        if predicted <= threshold:
            severity = label
            break

    last_row  = last_24_hours_df.iloc[-1]
    sixth_row = last_24_hours_df.iloc[-6]
    trend     = "rising" if last_row["AQI"] > sixth_row["AQI"] else "falling"

    return {
        "predicted_aqi": predicted,
        "severity"     : severity,
        "trigger_alert": predicted > AQI_ALERT_THRESHOLD,
        "features"     : {
            "wind_speed"           : float(last_row.get("wind_speed", 0)),
            "boundary_layer_height": float(last_row.get("boundary_layer_height", 0)),
            "humidity"             : float(last_row.get("humidity", 0)),
            "aqi_trend"            : trend,
        },
    }


# ---------------------------------------------------------------------------
# Private
# ---------------------------------------------------------------------------
def _mock_prediction() -> dict:
    """Stable, non-random fallback used when model artifacts are absent."""
    return {
        "predicted_aqi": 150.0,
        "severity"     : "Moderate",
        "trigger_alert": False,
        "features"     : {
            "wind_speed"           : 10.0,
            "boundary_layer_height": 600.0,
            "humidity"             : 60.0,
            "aqi_trend"            : "stable",
        },
        "_mock"        : True,
    }
