"""
ml/feature_scaler.py

Fits a StandardScaler on training features (excluding AQI target) and saves
it to ml/artifacts/scaler.pkl.  At inference, loads the saved scaler.
"""
from __future__ import annotations

import pickle
from pathlib import Path

import pandas as pd
from sklearn.preprocessing import StandardScaler

from config import SCALE_COLS, SCALER_PATH

ARTIFACTS_DIR = Path(__file__).parent / "artifacts"


def fit_and_save(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fits a StandardScaler on SCALE_COLS using training data.
    Scales the DataFrame in-place, saves the fitted scaler to SCALER_PATH.
    Returns the *scaled* DataFrame (not the scaler object).
    """
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    scaler = StandardScaler()
    df[SCALE_COLS] = scaler.fit_transform(df[SCALE_COLS])
    with open(SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)
    print(f"✅ Scaler fitted and saved to {SCALER_PATH}")
    return df   # return the scaled DataFrame — callers need this for build_sequences()


def load_and_transform(df: pd.DataFrame) -> pd.DataFrame:
    """
    Loads a pre-fitted scaler and transforms the given DataFrame in-place.
    Returns the transformed DataFrame.
    """
    with open(SCALER_PATH, "rb") as f:
        scaler: StandardScaler = pickle.load(f)
    df[SCALE_COLS] = scaler.transform(df[SCALE_COLS])
    return df
