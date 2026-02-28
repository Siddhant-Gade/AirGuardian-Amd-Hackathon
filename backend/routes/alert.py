"""
backend/routes/alert.py

Routes:
  POST /api/alert          — Manually trigger an email alert for a zone
  POST /api/alert/test     — Send a test email to verify Gmail SMTP config
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.services.model_service import get_prediction
from backend.services.explanation_service import generate_explanation
from backend.services.email_service import send_email_alert
from backend.database.db import save_alert
from config import ZONES, settings

router = APIRouter()

VALID_ZONES = list(ZONES.keys())


class AlertRequest(BaseModel):
    zone: str = Field(..., description=f"Campus zone name. Valid: {list(ZONES.keys())}")


@router.post("/alert", summary="Manually trigger an email alert for a zone")
def trigger_alert(request: AlertRequest):
    """
    Runs the full prediction → explanation → email pipeline for the given zone
    on-demand. Useful for demos or manual intervention.
    """
    zone = request.zone
    if zone not in VALID_ZONES:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown zone '{zone}'. Valid zones: {VALID_ZONES}",
        )
    try:
        prediction  = get_prediction(zone)
        explanation = generate_explanation(zone, prediction)
        sent        = send_email_alert(zone, prediction, explanation)
        save_alert(zone, prediction, explanation)
        return {
            "success"      : sent,
            "zone"         : zone,
            "predicted_aqi": prediction["predicted_aqi"],
            "severity"     : prediction["severity"],
            "explanation"  : explanation,
            "email_sent_to": settings.alert_email or "not configured",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/alert/test", summary="Send a test email to verify Gmail SMTP setup")
def test_email_alert():
    """
    Sends a dummy email to ALERT_EMAIL so you can confirm Gmail SMTP is
    configured correctly before the live demo.

    Returns 200 with sent=True on success, or 200 with sent=False + reason
    on configuration/auth failure (does not raise 500 so you see the detail).
    """
    dummy_prediction = {
        "predicted_aqi": 251.0,
        "severity"     : "Very Poor",
        "features"     : {
            "wind_speed"           : 12.5,
            "boundary_layer_height": 430,
            "humidity"             : 74,
            "aqi_trend"            : "rising",
        },
    }
    explanation = (
        "⚠️ This is a TEST alert from AirGuardian AI. "
        "If you received this, Gmail SMTP is configured correctly and ready for the demo."
    )
    try:
        sent = send_email_alert("TEST_ZONE", dummy_prediction, explanation)
        return {
            "sent"        : sent,
            "sent_to"     : settings.alert_email or "not configured",
            "note"        : "Check your inbox. If not received, verify GMAIL_SENDER and GMAIL_APP_PASSWORD in .env",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
