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
INPUT_SIZE  = 6    # number of input features
HIDDEN_SIZE = 64   # GRU hidden units
GRU_LAYERS  = 2    # stacked GRU layers
GRU_DROPOUT = 0.2  # dropout between GRU layers

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
# City zones — Nagpur metropolitan area (~80 km spread)
# These are real geographic locations across the city, enabling meaningful
# IDW interpolation and a heatmap that covers the full metro region.
# ---------------------------------------------------------------------------
ZONES: dict[str, dict] = {
    # ── Central Nagpur ──────────────────────────────────────────────────
    "Sitabuldi"         : {"lat": 21.1466, "lon": 79.0810},
    "Dharampeth"        : {"lat": 21.1530, "lon": 79.0720},
    "Sadar"             : {"lat": 21.1560, "lon": 79.0960},
    "Ambazari Lake"     : {"lat": 21.1330, "lon": 79.0480},
    "Futala Lake"       : {"lat": 21.1580, "lon": 79.0430},
    # ── East Nagpur ─────────────────────────────────────────────────────
    "Wadi"              : {"lat": 21.1300, "lon": 79.1300},
    "Manewada"          : {"lat": 21.1080, "lon": 79.1100},
    "Besa"              : {"lat": 21.0950, "lon": 79.1350},
    # ── West Nagpur ─────────────────────────────────────────────────────
    "Hingna"            : {"lat": 21.1150, "lon": 78.9800},
    "Narendra Nagar"    : {"lat": 21.1480, "lon": 79.0200},
    # ── North Nagpur ────────────────────────────────────────────────────
    "Kamptee"           : {"lat": 21.2300, "lon": 79.2000},
    "Koradi"            : {"lat": 21.2450, "lon": 79.0970},
    "Parseoni"          : {"lat": 21.3800, "lon": 79.1420},
    # ── South / South-East ──────────────────────────────────────────────
    "Wardha Road"       : {"lat": 21.0800, "lon": 79.0750},
    "Butibori"          : {"lat": 20.9700, "lon": 79.0300},
}

# CPCB / MPCB monitoring stations used for model inference.
# 5 stations spread across Nagpur give proper spatial coverage for IDW.
STATIONS: dict[str, dict] = {
    "Civil Lines"       : {"lat": 21.1463, "lon": 79.0849},
    "Ambazari"          : {"lat": 21.1332, "lon": 79.0485},
    "MIDC Hingna"       : {"lat": 21.1160, "lon": 78.9740},
    "Koradi"            : {"lat": 21.2430, "lon": 79.0980},
    "NEERI Nehru Nagar" : {"lat": 21.1220, "lon": 79.0590},
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
