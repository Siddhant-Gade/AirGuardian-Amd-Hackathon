"""
tests/conftest.py

Shared pytest fixtures and setup for the AirGuardian test suite.
Ensures the SQLite database tables exist before any test runs.
"""
from backend.database.db import init_db


def pytest_configure(config):
    """Called once before test collection begins — ensures DB tables exist."""
    init_db()
