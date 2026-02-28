"""
backend/services/email_service.py

Sends AQI spike alerts via Gmail SMTP — completely free.
Uses Python's built-in smtplib + ssl (zero extra dependencies).

Setup (one-time):
  1. Enable 2-Step Verification on your Gmail account.
  2. Go to: myaccount.google.com → Security → App Passwords
  3. Create an App Password for "Mail" → copy the 16-char password.
  4. Set GMAIL_SENDER and GMAIL_APP_PASSWORD in your .env file.
"""
from __future__ import annotations

import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config import settings

logger = logging.getLogger(__name__)

SEVERITY_EMOJI: dict[str, str] = {
    "Good"        : "🟢",
    "Satisfactory": "🟡",
    "Moderate"    : "🟡",
    "Poor"        : "🟠",
    "Very Poor"   : "🔴",
    "Severe"      : "🔴",
    "Hazardous"   : "⛔",
}

SEVERITY_COLOR: dict[str, str] = {
    "Good"        : "#22c55e",
    "Satisfactory": "#84cc16",
    "Moderate"    : "#eab308",
    "Poor"        : "#f97316",
    "Very Poor"   : "#ef4444",
    "Severe"      : "#dc2626",
    "Hazardous"   : "#7f1d1d",
}


def send_email_alert(zone: str, prediction: dict, explanation: str) -> bool:
    """
    Sends a richly formatted HTML email alert via Gmail SMTP (free).

    Returns True if sent successfully, False on failure.

    Required .env keys:
      GMAIL_SENDER       — your Gmail address (e.g. airguardian@gmail.com)
      GMAIL_APP_PASSWORD — 16-char App Password from Google Account settings
      ALERT_EMAIL        — destination email address for alerts
    """
    sender   = settings.gmail_sender
    # Strip spaces — Google displays App Passwords as "xxxx xxxx xxxx xxxx"
    # but smtplib needs the raw 16-char string with no spaces.
    password  = settings.gmail_app_password.replace(" ", "")
    recipient = settings.alert_email

    if not all([sender, password, recipient]):
        logger.warning(
            "Gmail credentials not configured — skipping email alert. "
            "Set GMAIL_SENDER, GMAIL_APP_PASSWORD, and ALERT_EMAIL in .env"
        )
        return False

    # Build recipient list: primary + optional CC addresses
    cc_list: list[str] = [
        addr.strip()
        for addr in settings.alert_email_cc.split(",")
        if addr.strip()
    ]
    all_recipients = [recipient] + cc_list

    aqi      = prediction["predicted_aqi"]
    severity = prediction["severity"]
    emoji    = SEVERITY_EMOJI.get(severity, "⚠️")
    color    = SEVERITY_COLOR.get(severity, "#f97316")
    features = prediction.get("features", {})

    subject = f"{emoji} AirGuardian Alert — {zone} | AQI {aqi} ({severity})"

    # ── Plain-text fallback ───────────────────────────────────────────────
    plain_body = (
        f"AirGuardian AI — AQI Spike Alert\n\n"
        f"Zone      : {zone}\n"
        f"Predicted AQI (6hr ahead): {aqi}\n"
        f"Status    : {severity}\n\n"
        f"{explanation}\n\n"
        f"Key Conditions:\n"
        f"  Wind Speed           : {features.get('wind_speed', 'N/A')} km/h\n"
        f"  Boundary Layer Height: {features.get('boundary_layer_height', 'N/A')} m\n"
        f"  Humidity             : {features.get('humidity', 'N/A')} %\n"
        f"  AQI Trend            : {features.get('aqi_trend', 'N/A')}\n\n"
        f"AirGuardian AI — Predict. Explain. Act.\n"
        f"Built for AMD Slingshot 2025"
    )

    # ── Rich HTML body ────────────────────────────────────────────────────
    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }}
    .container {{ max-width: 580px; margin: 32px auto; background: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }}
    .header {{ background: {color}; padding: 24px 32px; }}
    .header h1 {{ margin: 0; font-size: 22px; color: #fff; }}
    .header p {{ margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 13px; }}
    .body {{ padding: 28px 32px; }}
    .metric {{ display: flex; justify-content: space-between; background: #0f172a; border-radius: 8px; padding: 14px 18px; margin-bottom: 12px; }}
    .metric .label {{ color: #94a3b8; font-size: 13px; }}
    .metric .value {{ font-weight: 700; font-size: 18px; color: {color}; }}
    .explanation {{ background: #0f172a; border-left: 4px solid {color}; border-radius: 4px; padding: 16px 18px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1; }}
    .conditions {{ margin: 20px 0; }}
    .conditions h3 {{ color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }}
    .condition-row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }}
    .footer {{ background: #0f172a; padding: 16px 32px; text-align: center; font-size: 11px; color: #475569; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{emoji} AirGuardian Alert</h1>
      <p>Automated 6-hour AQI spike prediction · AMD Slingshot 2025</p>
    </div>
    <div class="body">
      <div class="metric">
        <span class="label">📍 Zone</span>
        <span class="value" style="color:#e2e8f0">{zone}</span>
      </div>
      <div class="metric">
        <span class="label">🔢 Predicted AQI (6hr ahead)</span>
        <span class="value">{aqi}</span>
      </div>
      <div class="metric">
        <span class="label">📊 Severity</span>
        <span class="value">{severity}</span>
      </div>
      <div class="explanation">{explanation}</div>
      <div class="conditions">
        <h3>Key Atmospheric Conditions</h3>
        <div class="condition-row"><span>💨 Wind Speed</span><span>{features.get('wind_speed', 'N/A')} km/h</span></div>
        <div class="condition-row"><span>🌫 Boundary Layer Height</span><span>{features.get('boundary_layer_height', 'N/A')} m</span></div>
        <div class="condition-row"><span>💧 Humidity</span><span>{features.get('humidity', 'N/A')} %</span></div>
        <div class="condition-row"><span>📈 AQI Trend</span><span>{features.get('aqi_trend', 'N/A')}</span></div>
      </div>
    </div>
    <div class="footer">AirGuardian AI — Predict. Explain. Act. &nbsp;|&nbsp; Built for AMD Slingshot 2025</div>
  </div>
</body>
</html>
"""

    # ── Compose and send ──────────────────────────────────────────────────
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"AirGuardian AI <{sender}>"
        msg["To"]      = recipient
        if cc_list:
            msg["Cc"] = ", ".join(cc_list)

        msg.attach(MIMEText(plain_body, "plain"))
        msg.attach(MIMEText(html_body,  "html"))

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(sender, password)
            server.sendmail(sender, all_recipients, msg.as_string())

        logger.info(
            "Email alert sent | Zone: %s | AQI: %s | To: %s | CC: %s",
            zone, aqi, recipient, cc_list or "—",
        )
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error(
            "Gmail authentication failed. Check GMAIL_SENDER and GMAIL_APP_PASSWORD. "
            "Make sure you're using an App Password, NOT your regular Gmail password."
        )
        return False
    except Exception as exc:
        logger.error("Email alert failed: %s", exc)
        return False
