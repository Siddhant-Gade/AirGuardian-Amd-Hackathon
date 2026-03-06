"""
seed_alerts.py — Populates AirGuardian DB with real predictions + alerts for all zones.

Run once before the demo to ensure /api/alerts/history returns real data:
    python seed_alerts.py
"""
import sys
import os

# Ensure project root is on sys.path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import ZONES
from backend.services.model_service import get_prediction
from backend.services.explanation_service import generate_explanation
from backend.database.db import init_db, save_alert, save_prediction


def seed():
    print("[SEED] Initialising database...")
    init_db()

    print(f"[SEED] Running predictions for {len(ZONES)} zones...")
    for zone in ZONES:
        try:
            prediction = get_prediction(zone)
            aqi = prediction["predicted_aqi"]
            severity = prediction["severity"]
            print(f"  {zone}: AQI={aqi} ({severity})")

            # Generate explanation
            explanation = generate_explanation(zone, prediction)

            # Save prediction record
            save_prediction(zone, prediction)

            # Save alert (all zones, so alert log has entries)
            save_alert(zone, prediction, explanation)
            print(f"    -> Alert + prediction saved to DB")

        except Exception as exc:
            print(f"  {zone}: FAILED - {exc}")

    print("[SEED] Done! Alert history is now populated.")


if __name__ == "__main__":
    seed()
