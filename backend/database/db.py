"""
backend/database/db.py

SQLite helpers using plain sqlite3 (no ORM overhead for hackathon speed).
init_db() is called once on startup.
"""
from __future__ import annotations

import sqlite3
import logging
from contextlib import contextmanager
from pathlib import Path
from config import settings, ROOT_DIR

logger = logging.getLogger(__name__)

# Resolve to an absolute path so the DB lands in the project root regardless
# of the current working directory when uvicorn is launched.
_raw_path = settings.db_path
DB_PATH: str = (
    _raw_path
    if Path(_raw_path).is_absolute()
    else str(ROOT_DIR / _raw_path)
)


# ---------------------------------------------------------------------------
# Schema init
# ---------------------------------------------------------------------------
def init_db() -> None:
    """Creates tables if they do not already exist."""
    with _db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS alerts (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                zone          TEXT        NOT NULL,
                predicted_aqi REAL        NOT NULL,
                severity      TEXT        NOT NULL,
                explanation   TEXT,
                alerted       INTEGER     DEFAULT 1,
                timestamp     DATETIME    DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS predictions (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                zone             TEXT    NOT NULL,
                predicted_aqi    REAL    NOT NULL,
                actual_aqi       REAL,
                wind_speed       REAL,
                boundary_layer   REAL,
                humidity         REAL,
                aqi_trend        TEXT,
                timestamp        DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
    logger.info("Database initialised at %s.", DB_PATH)
    print(f"[DB] Database initialised: {DB_PATH}")


# ---------------------------------------------------------------------------
# CRUD helpers
# ---------------------------------------------------------------------------
def save_alert(zone: str, prediction: dict, explanation: str) -> None:
    """Persists an alert row to the alerts table."""
    with _db() as conn:
        conn.execute(
            """
            INSERT INTO alerts (zone, predicted_aqi, severity, explanation, alerted)
            VALUES (?, ?, ?, ?, 1)
            """,
            (zone, prediction["predicted_aqi"], prediction["severity"], explanation),
        )


def save_prediction(zone: str, prediction: dict) -> None:
    """Persists a raw prediction row (for accuracy tracking / backtesting)."""
    feats = prediction.get("features", {})
    with _db() as conn:
        conn.execute(
            """
            INSERT INTO predictions
                (zone, predicted_aqi, wind_speed, boundary_layer, humidity, aqi_trend)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                zone,
                prediction["predicted_aqi"],
                feats.get("wind_speed"),
                feats.get("boundary_layer_height"),
                feats.get("humidity"),
                feats.get("aqi_trend"),
            ),
        )


def get_recent_alerts(limit: int = 10) -> list[dict]:
    """Returns the most recent alert rows as a list of dicts."""
    with _db() as conn:
        cursor = conn.execute(
            """
            SELECT zone, predicted_aqi, severity, explanation, timestamp
            FROM alerts
            ORDER BY timestamp DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cursor.fetchall()
    return [
        {
            "zone"         : r[0],
            "predicted_aqi": r[1],
            "severity"     : r[2],
            "explanation"  : r[3],
            "timestamp"    : r[4],
        }
        for r in rows
    ]


def get_alerts_by_zone(zone: str, limit: int = 20) -> list[dict]:
    """Returns recent alert rows filtered by zone."""
    with _db() as conn:
        cursor = conn.execute(
            """
            SELECT zone, predicted_aqi, severity, explanation, timestamp
            FROM alerts
            WHERE zone = ?
            ORDER BY timestamp DESC
            LIMIT ?
            """,
            (zone, limit),
        )
        rows = cursor.fetchall()
    return [
        {
            "zone"         : r[0],
            "predicted_aqi": r[1],
            "severity"     : r[2],
            "explanation"  : r[3],
            "timestamp"    : r[4],
        }
        for r in rows
    ]


def get_alert_stats() -> dict:
    """
    Returns aggregate statistics about the alerts table.
    Used by the /api/stats endpoint.
    """
    with _db() as conn:
        total_row = conn.execute("SELECT COUNT(*) FROM alerts").fetchone()
        total_alerts = total_row[0] if total_row else 0

        total_preds = conn.execute("SELECT COUNT(*) FROM predictions").fetchone()
        total_predictions = total_preds[0] if total_preds else 0

        max_row = conn.execute("SELECT MAX(predicted_aqi), zone FROM alerts").fetchone()
        worst_zone = {"zone": max_row[1], "aqi": max_row[0]} if max_row and max_row[0] else None

        severity_rows = conn.execute(
            "SELECT severity, COUNT(*) FROM alerts GROUP BY severity ORDER BY COUNT(*) DESC"
        ).fetchall()
        severity_counts = {r[0]: r[1] for r in severity_rows}

        zone_rows = conn.execute(
            "SELECT zone, COUNT(*) FROM alerts GROUP BY zone ORDER BY COUNT(*) DESC LIMIT 6"
        ).fetchall()
        alerts_by_zone = {r[0]: r[1] for r in zone_rows}

        recent = conn.execute(
            "SELECT timestamp FROM alerts ORDER BY timestamp DESC LIMIT 1"
        ).fetchone()
        last_alert_at = recent[0] if recent else None

    return {
        "total_alerts"      : total_alerts,
        "total_predictions" : total_predictions,
        "severity_breakdown": severity_counts,
        "alerts_by_zone"    : alerts_by_zone,
        "worst_zone"        : worst_zone,
        "last_alert_at"     : last_alert_at,
    }


# ---------------------------------------------------------------------------
# Private
# ---------------------------------------------------------------------------
def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    # WAL mode: concurrent reads during writes, 3× faster for demo workloads
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")  # safe + fast (not OFF)
    return conn


@contextmanager
def _db():
    """
    Context manager that opens a connection, yields it, commits on success,
    rolls back on error, and always closes — preventing connection leaks.
    """
    conn = _connect()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
