"""
config.py — Central configuration for AirGuardian AI.

All constants, zone/station coordinates, and environment variables are
loaded here. Import from this module everywhere; never hardcode values.
"""
from __future__ import annotations

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# ---------------------------------------------------------------------------
# Project root
# ---------------------------------------------------------------------------
ROOT_DIR = Path(__file__).parent.resolve()


# ---------------------------------------------------------------------------
# Environment-backed settings (loaded from .env at startup)
# ---------------------------------------------------------------------------
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- LLM ----------------------------------------------------------------
    groq_api_key: str = Field(default="", description="Groq API key (free at console.groq.com)")

    # --- Email (Gmail SMTP — 100% free, no paid API) ----------------------
    gmail_sender: str = Field(
        default="",
        description="Gmail address used to send alerts (e.g. airguardian@gmail.com)",
    )
    gmail_app_password: str = Field(
        default="",
        description="16-char Google App Password (NOT your regular password). "
                    "Generate at: myaccount.google.com → Security → App Passwords",
    )
    alert_email: str = Field(
        default="",
        description="Destination email address for alert notifications",
    )
    # Comma-separated extra recipients (optional)
    alert_email_cc: str = Field(
        default="",
        description="Optional comma-separated CC email addresses for alerts",
    )

    # --- Optional -----------------------------------------------------------
    openaq_api_key: str = Field(default="", description="OpenAQ API key (optional, not required)")

    # --- App ----------------------------------------------------------------
    debug: bool = Field(default=False)
    db_path: str = Field(default="airguardian.db", description="SQLite DB file path")
    log_level: str = Field(default="INFO")


# Singleton — import `settings` everywhere
settings = Settings()


# ---------------------------------------------------------------------------
# ML artefact paths
# ---------------------------------------------------------------------------
ML_ARTIFACTS_DIR  = ROOT_DIR / "ml" / "artifacts"
MODEL_PATH        = ML_ARTIFACTS_DIR / "model.pt"
SCALER_PATH       = ML_ARTIFACTS_DIR / "scaler.pkl"
FEATURE_COLS_PATH = ML_ARTIFACTS_DIR / "feature_columns.json"

# Fallback LLM explanation cache
CACHE_DIR          = ROOT_DIR / "cache"
EXPLANATION_CACHE  = CACHE_DIR / "explanations.json"

# ---------------------------------------------------------------------------
# ML hyper-parameters
# ---------------------------------------------------------------------------
LOOKBACK   = 24   # hours of history used as model input
HORIZON    = 6    # hours ahead to predict
INPUT_SIZE = 6    # number of input features
HIDDEN_SIZE = 64  # GRU hidden units

FEATURE_COLS = [
    "PM2.5",
    "temperature",
    "humidity",
    "wind_speed",
    "boundary_layer_height",
    "AQI",
]

SCALE_COLS = ["PM2.5", "temperature", "humidity", "wind_speed", "boundary_layer_height"]

# ---------------------------------------------------------------------------
# AQI severity thresholds (CPCB India standard)
# ---------------------------------------------------------------------------
AQI_SEVERITY_MAP = [
    (50,  "Good"),
    (100, "Satisfactory"),
    (200, "Moderate"),
    (300, "Poor"),
    (400, "Very Poor"),
    (500, "Severe"),
]
AQI_ALERT_THRESHOLD = 200  # trigger alert above this

# ---------------------------------------------------------------------------
# Campus zones (Nagpur, coordinates)
# ---------------------------------------------------------------------------
ZONES: dict[str, dict] = {
    "Main Gate"     : {"lat": 21.1458, "lon": 79.0882},
    "Hostel A"      : {"lat": 21.1462, "lon": 79.0891},
    "Academic Block": {"lat": 21.1470, "lon": 79.0878},
    "Library"       : {"lat": 21.1455, "lon": 79.0875},
    "Sports Ground" : {"lat": 21.1478, "lon": 79.0895},
    "Parking Area"  : {"lat": 21.1450, "lon": 79.0900},
}

# CPCB monitoring stations used for model inference
STATIONS: dict[str, dict] = {
    "Civil Lines": {"lat": 21.1463, "lon": 79.0849},
    "Ambazari"  : {"lat": 21.1332, "lon": 79.0485},
}

# ---------------------------------------------------------------------------
# Open-Meteo weather API config
# ---------------------------------------------------------------------------
OPEN_METEO_BASE     = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_ARCHIVE  = "https://archive-api.open-meteo.com/v1/archive"
NAGPUR_LAT          = 21.15
NAGPUR_LON          = 79.09
WEATHER_VARS        = "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,boundary_layer_height"

# OpenAQ (fallback for live AQI)
OPENAQ_BASE = "https://api.openaq.org/v3"

# ---------------------------------------------------------------------------
# Scheduler
# ---------------------------------------------------------------------------
SCHEDULER_INTERVAL_MINUTES = 30
