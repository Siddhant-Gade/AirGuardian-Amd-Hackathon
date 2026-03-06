"""
backend/services/explanation_service.py

Generates a plain-English AQI alert explanation using Groq Llama 3.3 70B.
Falls back to a pre-generated cache file if the Groq API is unavailable.
"""
from __future__ import annotations

import json
import logging

from openai import OpenAI

from config import settings, EXPLANATION_CACHE

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Groq client (uses OpenAI-compatible SDK)
# ---------------------------------------------------------------------------
def _make_client() -> OpenAI | None:
    key = settings.groq_api_key
    if not key:
        logger.warning("GROQ_API_KEY not set — explanation service will use cache only.")
        return None
    return OpenAI(api_key=key, base_url="https://api.groq.com/openai/v1")


_client: OpenAI | None = _make_client()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def generate_explanation(zone: str, prediction: dict) -> str:
    """
    Returns a 3-sentence plain-English explanation for campus administrators.
    Uses Groq Llama 3.3-70B; falls back to cache on error or quota exhaustion.
    """
    prompt = _build_prompt(zone, prediction)

    if _client is not None:
        try:
            response = _client.chat.completions.create(
                model       = "llama-3.3-70b-versatile",
                messages    = [{"role": "user", "content": prompt}],
                max_tokens  = 180,
                temperature = 0.3,
            )
            explanation = response.choices[0].message.content.strip()
            _cache_explanation(prediction["severity"], explanation)
            return explanation
        except Exception as exc:
            logger.warning("Groq API error: %s — falling back to cache.", exc)

    return _get_cached_explanation(prediction["severity"])


def pre_generate_cache() -> None:
    """
    Call once before hackathon demo to warm the fallback cache with realistic
    explanations for each severity level. Uses Groq API.
    """
    severities = ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe", "Hazardous"]
    dummy_prediction_base = {
        "features": {
            "wind_speed": 12.0,
            "boundary_layer_height": 450,
            "humidity": 72,
            "aqi_trend": "rising",
        }
    }
    aqi_map = {
        "Good": 40, "Satisfactory": 80, "Moderate": 150,
        "Poor": 260, "Very Poor": 360, "Severe": 450, "Hazardous": 520,
    }
    for sev in severities:
        pred = {**dummy_prediction_base, "predicted_aqi": aqi_map[sev], "severity": sev}
        text = generate_explanation("Campus", pred)
        logger.info("Cached explanation for %s: %s", sev, text[:60])
    print("[OK] Explanation cache pre-generated.")


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------
def _build_prompt(zone: str, prediction: dict) -> str:
    feats = prediction["features"]
    return f"""
You are AirGuardian AI. Write an alert for a campus administrator.
Maximum 3 sentences. No technical jargon. Be specific and actionable.

Predicted AQI   : {prediction['predicted_aqi']} ({prediction['severity']})
Location        : {zone}
Time horizon    : 6 hours from now
Wind speed      : {feats.get('wind_speed', 'N/A')} km/h
Boundary layer  : {feats.get('boundary_layer_height', 'N/A')}m (below 500m = pollutants trapped)
Humidity        : {feats.get('humidity', 'N/A')}%
AQI trend       : {feats.get('aqi_trend', 'N/A')}

Sentence 1: State the prediction and how serious it is.
Sentence 2: Explain the main cause in simple terms.
Sentence 3: Give one specific action they should take right now.
""".strip()


def _cache_explanation(severity: str, text: str) -> None:
    EXPLANATION_CACHE.parent.mkdir(parents=True, exist_ok=True)
    try:
        cache = json.loads(EXPLANATION_CACHE.read_text()) if EXPLANATION_CACHE.exists() else {}
    except json.JSONDecodeError:
        cache = {}
    cache[severity] = text
    EXPLANATION_CACHE.write_text(json.dumps(cache, indent=2))


def _get_cached_explanation(severity: str) -> str:
    try:
        cache = json.loads(EXPLANATION_CACHE.read_text())
        return cache.get(severity, "AQI spike predicted. Please take precautionary action immediately.")
    except (FileNotFoundError, json.JSONDecodeError):
        return "AQI spike predicted. Please take precautionary action immediately."
