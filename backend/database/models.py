"""
backend/database/models.py

SQLAlchemy declarative table schemas.
These are NOT used for runtime queries (we use plain sqlite3 in db.py for speed),
but they serve as the canonical schema documentation and can be used for
migrations or ORM-based features in future iterations.
"""
from __future__ import annotations

from datetime import datetime
from sqlalchemy import (
    Column, Integer, Float, String, Text, DateTime, create_engine
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Alert(Base):
    __tablename__ = "alerts"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    zone          = Column(String(64), nullable=False)
    predicted_aqi = Column(Float,     nullable=False)
    severity      = Column(String(32), nullable=False)
    explanation   = Column(Text)
    alerted       = Column(Integer,   default=1)
    timestamp     = Column(DateTime,  default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Alert zone={self.zone} aqi={self.predicted_aqi} severity={self.severity}>"


class Prediction(Base):
    __tablename__ = "predictions"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    zone             = Column(String(64), nullable=False)
    predicted_aqi    = Column(Float,     nullable=False)
    actual_aqi       = Column(Float,     nullable=True)
    wind_speed       = Column(Float,     nullable=True)
    boundary_layer   = Column(Float,     nullable=True)
    humidity         = Column(Float,     nullable=True)
    aqi_trend        = Column(String(16), nullable=True)
    timestamp        = Column(DateTime,  default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Prediction zone={self.zone} aqi={self.predicted_aqi}>"
