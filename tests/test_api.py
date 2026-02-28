"""
tests/test_api.py

Integration tests for the FastAPI backend routes.
Run: pytest tests/test_api.py -v
"""
import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def client():
    from backend.main import app
    return TestClient(app)


# ── Health ───────────────────────────────────────────────────────────────────

def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"]            == "ok"
    assert "model_loaded"             in body
    assert "scheduler_running"        in body
    assert "email_configured"         in body
    assert "notification_mode"        in body
    assert body["notification_mode"] == "Gmail SMTP (free)"


def test_root(client):
    resp = client.get("/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["service"] == "AirGuardian AI"
    assert body["notification"] == "Gmail SMTP (free)"


# ── Predict ──────────────────────────────────────────────────────────────────

def test_predict_invalid_zone(client):
    resp = client.get("/api/predict?zone=UNKNOWN_ZONE")
    assert resp.status_code == 422


def test_predict_valid_zone(client):
    resp = client.get("/api/predict?zone=Sports Ground")
    assert resp.status_code == 200
    body = resp.json()
    assert "predicted_aqi"  in body
    assert "severity"       in body
    assert "trigger_alert"  in body
    assert "features"       in body


def test_predict_all_zones(client):
    resp = client.get("/api/predict/all")
    assert resp.status_code == 200
    body = resp.json()
    assert "predictions"    in body
    assert "zones_ok"       in body
    assert "zones_failed"   in body


# ── Zones ────────────────────────────────────────────────────────────────────

def test_zones_endpoint(client):
    resp = client.get("/api/zones")
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, dict)
    assert len(body) > 0


def test_alerts_history(client):
    resp = client.get("/api/alerts/history?limit=5")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_alerts_history_limit_too_high(client):
    # limit > 100 should 422
    resp = client.get("/api/alerts/history?limit=999")
    assert resp.status_code == 422


def test_alerts_by_zone_valid(client):
    resp = client.get("/api/alerts/zone?zone=Sports Ground&limit=5")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_alerts_by_zone_invalid(client):
    resp = client.get("/api/alerts/zone?zone=INVALID ZONE")
    assert resp.status_code == 422


def test_stats_endpoint(client):
    resp = client.get("/api/stats")
    assert resp.status_code == 200
    body = resp.json()
    assert "total_alerts"       in body
    assert "severity_breakdown" in body
    assert "alerts_by_zone"     in body


# ── Alert ────────────────────────────────────────────────────────────────────

def test_alert_invalid_zone(client):
    resp = client.post("/api/alert", json={"zone": "FAKE_ZONE"})
    assert resp.status_code == 422


def test_alert_valid_zone(client):
    """
    Triggers a real prediction + email pipeline.
    If Gmail is not configured the email just skips (success=False)
    but the prediction and explanation should still work.
    """
    resp = client.post("/api/alert", json={"zone": "Library"})
    assert resp.status_code == 200
    body = resp.json()
    assert "predicted_aqi" in body
    assert "explanation"   in body
    assert "email_sent_to" in body
