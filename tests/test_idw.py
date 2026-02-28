"""
tests/test_idw.py

Unit tests for the IDW spatial interpolation engine.
Run: pytest tests/test_idw.py -v
"""
import pytest
from data_integration.idw_engine import idw_interpolate


def test_single_station_direct_hit():
    """Zone at exact station location should return that station's AQI."""
    stations = [{"lat": 21.15, "lon": 79.09, "predicted_aqi": 175.0}]
    result   = idw_interpolate(21.15, 79.09, stations)
    assert result == 175.0


def test_empty_stations():
    """Empty station list should return 0.0 without crashing."""
    assert idw_interpolate(21.15, 79.09, []) == 0.0


def test_two_equal_distance_stations():
    """Equidistant stations should produce a simple average."""
    stations = [
        {"lat": 21.14, "lon": 79.09, "predicted_aqi": 100.0},
        {"lat": 21.16, "lon": 79.09, "predicted_aqi": 200.0},
    ]
    result = idw_interpolate(21.15, 79.09, stations)
    # Should be close to 150 (average) since both are equidistant
    assert abs(result - 150.0) < 5.0, f"Expected ~150 but got {result}"


def test_closer_station_dominates():
    """The station closer to the zone should dominate the interpolated result."""
    stations = [
        {"lat": 21.1460, "lon": 79.0882, "predicted_aqi": 50.0},   # very close
        {"lat": 21.2500, "lon": 79.2000, "predicted_aqi": 400.0},  # far away
    ]
    result = idw_interpolate(21.1458, 79.0882, stations)
    assert result < 100.0, "Close station (AQI 50) should dominate — result should be near 50"


def test_power_parameter():
    """Higher power should make the interpolation more sensitive to closer stations."""
    stations = [
        {"lat": 21.14, "lon": 79.09, "predicted_aqi": 100.0},
        {"lat": 21.20, "lon": 79.09, "predicted_aqi": 300.0},
    ]
    result_p1 = idw_interpolate(21.15, 79.09, stations, power=1)
    result_p3 = idw_interpolate(21.15, 79.09, stations, power=3)
    # With power=3 the close station (100) pulls the result lower
    assert result_p3 < result_p1, "Higher power should bias toward the closer station more strongly"
