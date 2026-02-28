"""
backend/routes/health.py — GET /api/health

Returns comprehensive system status:
  - Server alive
  - GRU model loaded
  - Scheduler running
  - Email (Gmail SMTP) configured
  - Groq LLM configured
"""
from fastapi import APIRouter
from backend.services.model_service import is_model_loaded
from backend.services.scheduler_service import is_scheduler_running, get_next_run
from config import settings

router = APIRouter()


@router.get("/health", summary="System health check")
def health_check():
    """
    Returns a snapshot of every critical system component.
    All fields should be True / non-empty for a fully functional deployment.
    """
    email_configured = bool(
        settings.gmail_sender
        and settings.gmail_app_password
        and settings.alert_email
    )
    groq_configured  = bool(settings.groq_api_key)

    return {
        "status"            : "ok",
        "model_loaded"      : is_model_loaded(),
        "scheduler_running" : is_scheduler_running(),
        "next_prediction_at": get_next_run(),
        "email_configured"  : email_configured,
        "groq_configured"   : groq_configured,
        "alert_recipient"   : settings.alert_email or "not set",
        "notification_mode" : "Gmail SMTP (free)",
        "service"           : "AirGuardian AI v1.1.0",
    }
