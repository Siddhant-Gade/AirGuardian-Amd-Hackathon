"""
backend/main.py — AirGuardian AI FastAPI application entry point.

Hardened for hackathon demo:
  • Global exception handler with structured JSON errors
  • Request-ID middleware for tracing
  • Proper logging configuration
  • Modern lifespan context manager (replaces deprecated @on_event)
  • CORS, GZip compression
"""
from __future__ import annotations

import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from config import settings
from backend.routes import predict, alert, zones, health
from backend.services.scheduler_service import start_scheduler, stop_scheduler
from backend.database.db import init_db

# ---------------------------------------------------------------------------
# Logging — configured once at module level so every import inherits it
# ---------------------------------------------------------------------------
logging.basicConfig(
    level   = getattr(logging, settings.log_level.upper(), logging.INFO),
    format  = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt = "%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("airguardian")


# ---------------------------------------------------------------------------
# Lifespan (modern FastAPI — replaces deprecated @app.on_event)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── startup ──────────────────────────────────────────────────────────
    logger.info("AirGuardian AI starting up…")
    init_db()
    start_scheduler()
    logger.info("✅ AirGuardian AI is live and accepting requests.")
    yield
    # ── shutdown ─────────────────────────────────────────────────────────
    stop_scheduler()   # prevent background thread leak on uvicorn --reload
    logger.info("AirGuardian AI shutting down gracefully.")


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title       = "AirGuardian AI",
    description = (
        "6-hour AQI spike prediction and intervention system for campus zones. "
        "Uses GRU neural network + IDW spatial interpolation + Gmail notifications."
    ),
    version     = "1.1.0",
    docs_url    = "/docs",
    redoc_url   = "/redoc",
    lifespan    = lifespan,
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
# 1. CORS — open for hackathon demo; lock down origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins  = ["*"],
    allow_methods  = ["*"],
    allow_headers  = ["*"],
)

# 2. GZip — compress large /zones responses automatically
app.add_middleware(GZipMiddleware, minimum_size=500)


# 3. Request-ID + latency logging middleware
@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    request.state.request_id = request_id
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception as exc:  # pragma: no cover
        logger.error("[%s] Unhandled error: %s", request_id, exc, exc_info=True)
        raise
    elapsed = (time.perf_counter() - start) * 1000
    logger.info(
        "[%s] %s %s → %d (%.1f ms)",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        elapsed,
    )
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{elapsed:.1f}ms"
    return response


# ---------------------------------------------------------------------------
# Global exception handler — returns clean JSON instead of HTML 500 pages
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error("[%s] Unhandled exception on %s: %s", request_id, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error"     : "Internal server error",
            "detail"    : str(exc),
            "request_id": request_id,
        },
    )


# ---------------------------------------------------------------------------
# Router registration
# ---------------------------------------------------------------------------
app.include_router(health.router,  prefix="/api", tags=["Health"])
app.include_router(predict.router, prefix="/api", tags=["Predict"])
app.include_router(alert.router,   prefix="/api", tags=["Alerts"])
app.include_router(zones.router,   prefix="/api", tags=["Zones"])


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------
@app.get("/", include_in_schema=False)
def root():
    return {
        "service" : "AirGuardian AI",
        "version" : "1.1.0",
        "docs"    : "/docs",
        "health"  : "/api/health",
        "zones"   : "/api/zones",
        "predict" : "/api/predict?zone=Sports Ground",
        "notification": "Gmail SMTP (free)",
    }
