"""
ml/sequence_generator.py

Converts a clean merged DataFrame into (X, y) numpy arrays suitable for
GRU training.

Shapes:
  X: (samples, LOOKBACK, num_features)  e.g. (N, 24, 6)
  y: (samples,)                          predicted AQI scalar (unscaled)
"""
from __future__ import annotations

import logging

import numpy as np
import pandas as pd

from config import LOOKBACK, HORIZON, FEATURE_COLS

logger = logging.getLogger(__name__)


def build_sequences(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
    """
    Input  : Clean merged DataFrame with FEATURE_COLS columns.
    Output : (X, y) as float32 numpy arrays.

    CRITICAL: AQI in y is kept at raw scale (never scaled by the scaler).
    """
    min_rows = LOOKBACK + HORIZON + 1
    if len(df) < min_rows:
        raise ValueError(
            f"Dataset has only {len(df)} rows but needs at least {min_rows} "
            f"(LOOKBACK={LOOKBACK} + HORIZON={HORIZON} + 1). "
            f"Provide more historical data in data/raw/ before training."
        )

    data = df[FEATURE_COLS].values.astype(np.float32)
    aqi  = df["AQI"].values.astype(np.float32)

    X, y = [], []
    for i in range(LOOKBACK, len(data) - HORIZON):
        X.append(data[i - LOOKBACK : i])   # shape (24, 6)
        y.append(aqi[i + HORIZON])         # AQI 6 hours ahead

    X_arr = np.array(X, dtype=np.float32)
    y_arr = np.array(y, dtype=np.float32)
    logger.info("Built %d sequences  X=%s  y=%s", len(X_arr), X_arr.shape, y_arr.shape)
    return X_arr, y_arr


def train_val_split(
    X: np.ndarray,
    y: np.ndarray,
    val_ratio: float = 0.15,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Splits sequences into training and validation sets (time-ordered, no shuffle)."""
    n_val = int(len(X) * val_ratio)
    split = len(X) - n_val
    return X[:split], y[:split], X[split:], y[split:]
