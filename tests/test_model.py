"""
tests/test_model.py

Unit tests for the GRU model and prediction pipeline.
Run: pytest tests/test_model.py -v
"""
import numpy as np
import pandas as pd
import pytest
import torch


def test_aqi_predictor_forward():
    """GRU model forward pass should return a scalar per batch item."""
    from ml.model import AQIPredictor

    model = AQIPredictor(input_size=6, hidden_size=64)
    x     = torch.randn(4, 24, 6)   # batch=4, seq=24, features=6
    out   = model(x)
    assert out.shape == (4,), f"Expected (4,) but got {out.shape}"


def test_build_sequences():
    """Sequence generator should produce matching X/y shapes."""
    from ml.sequence_generator import build_sequences

    # 100 rows of 6 features
    df = pd.DataFrame(
        np.random.rand(100, 6),
        columns=["PM2.5", "temperature", "humidity",
                 "wind_speed", "boundary_layer_height", "AQI"],
    )
    X, y = build_sequences(df)
    assert X.ndim == 3,         "X should be 3-dimensional"
    assert y.ndim == 1,         "y should be 1-dimensional"
    assert X.shape[1] == 24,    "Lookback should be 24"
    assert X.shape[2] == 6,     "Feature count should be 6"


def test_predict_aqi_mock():
    """predict_aqi should return a valid dict even without model artifacts."""
    from ml.predict import predict_aqi

    df = pd.DataFrame(
        np.random.rand(24, 6),
        columns=["PM2.5", "temperature", "humidity",
                 "wind_speed", "boundary_layer_height", "AQI"],
    )
    result = predict_aqi(df)
    assert "predicted_aqi"  in result
    assert "severity"       in result
    assert "trigger_alert"  in result
    assert "features"       in result
    assert isinstance(result["predicted_aqi"], float)


def test_idw_interpolate():
    """IDW should return a weighted average of station AQIs."""
    from data_integration.idw_engine import idw_interpolate

    stations = [
        {"lat": 21.14, "lon": 79.08, "predicted_aqi": 100.0},
        {"lat": 21.16, "lon": 79.10, "predicted_aqi": 200.0},
    ]
    result = idw_interpolate(21.15, 79.09, stations)
    assert 100.0 <= result <= 200.0, "IDW result should be between station values"
