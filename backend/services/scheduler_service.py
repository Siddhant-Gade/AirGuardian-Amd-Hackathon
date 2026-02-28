"""
backend/services/scheduler_service.py

APScheduler background scheduler that runs the full prediction cycle
for every campus zone every 30 minutes automatically.
Alerts are sent via Gmail SMTP (free, no API key required).
"""
from __future__ import annotations

import logging

from apscheduler.schedulers.background import BackgroundScheduler

from config import ZONES, AQI_ALERT_THRESHOLD, SCHEDULER_INTERVAL_MINUTES

logger = logging.getLogger(__name__)

_scheduler: BackgroundScheduler | None = None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def start_scheduler() -> None:
    """
    Creates and starts the background scheduler.
    Called once on FastAPI lifespan startup.
    """
    global _scheduler

    _scheduler = BackgroundScheduler(timezone="Asia/Kolkata")
    _scheduler.add_job(
        func             = run_prediction_cycle,
        trigger          = "interval",
        minutes          = SCHEDULER_INTERVAL_MINUTES,
        id               = "aqi_prediction_cycle",
        max_instances    = 1,
        replace_existing = True,
    )
    _scheduler.start()
    logger.info("Scheduler started — predictions every %d minutes.", SCHEDULER_INTERVAL_MINUTES)
    print(f"⏰ Scheduler started — predictions every {SCHEDULER_INTERVAL_MINUTES} minutes.")


def stop_scheduler() -> None:
    """
    Gracefully shuts down the APScheduler background thread.
    Called from FastAPI lifespan shutdown to prevent thread leaks on --reload.
    """
    global _scheduler
    if _scheduler is not None and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped gracefully.")
        print("🛑 Scheduler stopped.")


def is_scheduler_running() -> bool:
    """Returns True if the APScheduler instance is alive and running."""
    return _scheduler is not None and _scheduler.running


def get_next_run() -> str | None:
    """
    Returns the ISO-8601 timestamp of the next scheduled prediction cycle,
    or None if the scheduler is not running.
    Used by the /api/health endpoint.
    """
    if _scheduler is None:
        return None
    job = _scheduler.get_job("aqi_prediction_cycle")
    if job and job.next_run_time:
        return job.next_run_time.isoformat()
    return None


# ---------------------------------------------------------------------------
# Core prediction cycle
# ---------------------------------------------------------------------------
def run_prediction_cycle() -> None:
    """
    Runs every 30 minutes automatically.
    For each zone:
      1. Predict AQI
      2. If spike → generate LLM explanation → send Email → log to DB
    """
    # Lazy imports to avoid circular deps at module load time
    from backend.services.model_service import get_prediction
    from backend.services.explanation_service import generate_explanation
    from backend.services.email_service import send_email_alert
    from backend.database.db import save_alert, save_prediction

    logger.info("AirGuardian prediction cycle started.")
    print("🔄 Running AirGuardian prediction cycle...")

    for zone in ZONES:
        try:
            prediction = get_prediction(zone)
            aqi        = prediction["predicted_aqi"]
            logger.info("%s → Predicted AQI: %s", zone, aqi)
            print(f"  {zone}: Predicted AQI = {aqi}")

            # Always persist every prediction for accuracy tracking / backtesting
            save_prediction(zone, prediction)

            if aqi > AQI_ALERT_THRESHOLD:
                explanation = generate_explanation(zone, prediction)
                sent        = send_email_alert(zone, prediction, explanation)
                save_alert(zone, prediction, explanation)
                logger.info("Alert fired for %s (sent=%s)", zone, sent)

        except Exception as exc:
            logger.error("Prediction failed for zone '%s': %s", zone, exc)
