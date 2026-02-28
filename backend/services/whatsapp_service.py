"""
backend/services/whatsapp_service.py

WhatsApp / Twilio has been replaced with Gmail SMTP (100 % free, zero paid APIs).
This shim keeps the existing call interface intact so no other file needs to change.

All calls are transparently forwarded to email_service.send_email_alert().
"""
from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def send_whatsapp_alert(zone: str, prediction: dict, explanation: str) -> bool:
    """
    Backward-compatible shim — previously sent a Twilio WhatsApp message.
    Now routes through Gmail SMTP via email_service (100 % free).

    Returns True if the notification was sent successfully.
    """
    # Lazy import avoids any circular-import issues at module load time
    from backend.services.email_service import send_email_alert

    logger.info("send_whatsapp_alert → forwarding to Gmail email_service | zone: %s", zone)
    return send_email_alert(zone, prediction, explanation)
