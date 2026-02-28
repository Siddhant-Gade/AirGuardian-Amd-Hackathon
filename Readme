# AirGuardian AI 🌍
### Predictive Air Quality Intelligence — Predict. Explain. Act.

> AirGuardian predicts dangerous AQI spikes 6 hours before they arrive, explains why in plain English, and automatically alerts the right people — before anyone is exposed.

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Pipeline](#data-pipeline)
- [ML Model](#ml-model)
- [Backend API](#backend-api)
- [Spatial Intelligence Layer](#spatial-intelligence-layer)
- [LLM Explanation Engine](#llm-explanation-engine)
- [Alert System](#alert-system)
- [Database Schema](#database-schema)
- [Environment Setup](#environment-setup)
- [Running the System](#running-the-system)
- [API Reference](#api-reference)
- [Datasets Used](#datasets-used)
- [Team Ownership Map](#team-ownership-map)

---

## System Overview

AirGuardian is a **pure software AI system** that operates on three layers:

| Layer | What It Does | Technology |
|---|---|---|
| **Prediction** | GRU model forecasts AQI 6 hours ahead | PyTorch, pandas |
| **Explanation** | LLM converts prediction into plain English | Groq (Llama 3.3 70B) |
| **Intervention** | Auto-alert triggers when threshold crossed | Twilio, FastAPI |

**No hardware. No sensors. No paid APIs. Entirely free public data.**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA SOURCES (FREE)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │  CPCB API   │  │ Open-Meteo  │  │  OpenAQ (Fallback)   │ │
│  │  data.gov   │  │   API       │  │  api.openaq.org      │ │
│  │  (AQI data) │  │ (Weather)   │  │  (No key needed)     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬───────────┘ │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          └────────────────┼────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                DATA INTEGRATION LAYER                        │
│                    (Member 3)                                │
│                                                              │
│   cpcb_fetcher.py ──┐                                        │
│   weather_fetcher.py─┼──► feature_merger.py ► feature_vector│
│   idw_engine.py ────┘                                        │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  ML PREDICTION ENGINE                        │
│                     (Member 1)                               │
│                                                              │
│   merged_dataset.csv                                         │
│         ↓                                                    │
│   data_cleaner.py ──► feature_scaler.py ──► sequence_gen.py │
│         ↓                                                    │
│   model.py (GRU 64 units, 24hr lookback, 6hr output)        │
│         ↓                                                    │
│   model.pt + scaler.pkl ──► predict.py                      │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND                            │
│                    (Member 2)                                │
│                                                              │
│   /predict ──► model_service.py ──► predicted_aqi           │
│                      │                                       │
│                      ▼                                       │
│            explanation_service.py (Groq LLM)                │
│                      │                                       │
│                      ▼                                       │
│            whatsapp_service.py (Twilio)                      │
│                      │                                       │
│                      ▼                                       │
│                SQLite Logging                                │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (NEXT PHASE)                      │
│         React + Leaflet.js + Recharts + Tailwind             │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
airguardian/
│
├── README.md
├── requirements.txt
├── .env.example
├── config.py                      # Central config — all constants here
│
├── ml/                            # MEMBER 1 — ML & Data Intelligence
│   ├── data_loader.py             # Loads raw CSVs
│   ├── data_cleaner.py            # Cleaning + gap filling
│   ├── feature_scaler.py          # StandardScaler fit + save
│   ├── sequence_generator.py      # Builds (X, y) sequences
│   ├── model.py                   # GRU architecture
│   ├── train.py                   # Full training loop
│   ├── predict.py                 # Inference function (used by backend)
│   └── artifacts/
│       ├── model.pt               # Saved model weights
│       ├── scaler.pkl             # Saved StandardScaler
│       └── feature_columns.json  # Feature order — critical for inference
│
├── backend/                       # MEMBER 2 — Backend Systems
│   ├── main.py                    # FastAPI app entry point
│   ├── routes/
│   │   ├── predict.py             # GET /predict?zone=SportsGround
│   │   ├── alert.py               # POST /alert
│   │   ├── zones.py               # GET /zones — all zone predictions
│   │   └── health.py              # GET /health — system status check
│   ├── services/
│   │   ├── model_service.py       # Loads model, runs inference
│   │   ├── explanation_service.py # Groq API call + fallback cache
│   │   ├── whatsapp_service.py    # Twilio WhatsApp sender
│   │   └── scheduler_service.py  # APScheduler — runs every 30 min
│   └── database/
│       ├── db.py                  # SQLite connection
│       └── models.py              # Table schemas
│
├── data_integration/              # MEMBER 3 — GIS & Live Data
│   ├── cpcb_fetcher.py            # Pulls live CPCB station data
│   ├── weather_fetcher.py         # Pulls Open-Meteo forecast
│   ├── feature_merger.py          # Merges AQI + weather on timestamp
│   ├── idw_engine.py              # IDW spatial interpolation
│   └── zone_orchestrator.py      # Loops all zones, returns zone map
│
├── data/                          # Raw + processed datasets
│   ├── raw/
│   │   ├── cpcb_nagpur.csv        # Downloaded CPCB data
│   │   └── weather_nagpur.csv     # Downloaded Open-Meteo data
│   └── processed/
│       └── merged_dataset.csv     # Final training-ready CSV
│
├── cache/                         # LLM fallback responses
│   └── explanations.json          # Pre-generated explanation cache
│
└── tests/
    ├── test_model.py
    ├── test_api.py
    └── test_idw.py
```

---

## Data Pipeline

### Step 1 — Raw Data Sources

**CPCB AQI Data (Primary)**
```
Dataset : Air Quality Data India 2010–2023
Source  : kaggle.com/datasets/abhisheksjha/time-series-air-quality-data-of-india-2010-2023
Format  : CSV, hourly
Columns : StationId, Dates, PM2.5, PM10, NO2, AQI
Download: Free, instant, no API key
```

**Open-Meteo Weather Data**
```
Source  : archive-api.open-meteo.com
Format  : CSV via API, no key needed
URL     : https://archive-api.open-meteo.com/v1/archive
          ?latitude=21.15&longitude=79.09
          &start_date=2015-01-01&end_date=2024-12-31
          &hourly=temperature_2m,relative_humidity_2m,
                  wind_speed_10m,wind_direction_10m,
                  boundary_layer_height
          &format=csv
```

### Step 2 — data_cleaner.py

```python
import pandas as pd
from sklearn.preprocessing import StandardScaler
import pickle

def clean_aqi_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw CPCB AQI dataframe.
    Rules:
     - Drop rows where AQI is null
     - Forward fill gaps under 3 hours
     - Drop gaps over 3 hours
     - Ensure datetime index, sorted ascending
    """
    df['timestamp'] = pd.to_datetime(df['Dates'])
    df = df.set_index('timestamp').sort_index()

    # Drop null AQI rows — these cannot be imputed
    df = df.dropna(subset=['AQI'])

    # Forward fill gaps of 3 hours or less
    df = df.resample('H').asfreq()
    df['gap'] = df['AQI'].isna()
    df['gap_group'] = (df['gap'] != df['gap'].shift()).cumsum()
    gap_sizes = df[df['gap']].groupby('gap_group').size()
    long_gaps = gap_sizes[gap_sizes > 3].index
    df.loc[df['gap_group'].isin(long_gaps), 'AQI'] = None
    df['AQI'] = df['AQI'].fillna(method='ffill', limit=3)
    df = df.dropna(subset=['AQI'])

    return df[['AQI', 'PM2.5', 'temperature', 
               'humidity', 'wind_speed', 'boundary_layer_height']]


def scale_features(df: pd.DataFrame, fit: bool = True):
    """
    Scales all features EXCEPT AQI target.
    Saves scaler to artifacts/scaler.pkl when fit=True.
    Loads existing scaler when fit=False (inference mode).
    """
    feature_cols = ['PM2.5', 'temperature', 'humidity', 
                    'wind_speed', 'boundary_layer_height']

    if fit:
        scaler = StandardScaler()
        df[feature_cols] = scaler.fit_transform(df[feature_cols])
        with open('ml/artifacts/scaler.pkl', 'wb') as f:
            pickle.dump(scaler, f)
    else:
        with open('ml/artifacts/scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
        df[feature_cols] = scaler.transform(df[feature_cols])

    return df, scaler
```

### Step 3 — sequence_generator.py

```python
import numpy as np

LOOKBACK = 24    # Use last 24 hours as input
HORIZON  = 6     # Predict 6 hours ahead

def build_sequences(df):
    """
    Input  : Clean merged dataframe
    Output : X shape (samples, 24, 6)
             y shape (samples,)
    
    CRITICAL: AQI column is kept raw (not scaled) in y.
    """
    feature_cols = ['PM2.5', 'temperature', 'humidity', 
                    'wind_speed', 'boundary_layer_height', 'AQI']
    target_col   = 'AQI'

    data = df[feature_cols].values
    aqi  = df[target_col].values

    X, y = [], []
    for i in range(LOOKBACK, len(data) - HORIZON):
        X.append(data[i - LOOKBACK : i])        # 24 rows, 6 features
        y.append(aqi[i + HORIZON])              # AQI 6 hours ahead
    
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)
```

---

## ML Model

### model.py

```python
import torch
import torch.nn as nn

class AQIPredictor(nn.Module):
    """
    Single-layer GRU for 6-hour AQI forecasting.
    
    Input  : (batch_size, 24, 6)  — 24hr lookback, 6 features
    Output : (batch_size, 1)      — predicted AQI scalar
    
    Architecture choices:
    - Single GRU layer (not 2) — faster training, equivalent performance
      on this dataset size, easier to debug at hackathon
    - Huber loss — handles AQI spike outliers better than MSE
    - No Dropout at inference — keep it clean for demo
    """
    def __init__(self, input_size=6, hidden_size=64):
        super(AQIPredictor, self).__init__()
        self.gru = nn.GRU(
            input_size  = input_size,
            hidden_size = hidden_size,
            num_layers  = 1,
            batch_first = True,
            dropout     = 0.0
        )
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.gru(x)         # out: (batch, 24, 64)
        out    = out[:, -1, :]       # Take last timestep: (batch, 64)
        return self.fc(out).squeeze(-1)  # (batch,)
```

### train.py

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import json

def train_model(X_train, y_train, X_val, y_val, epochs=50):
    """
    Full training loop. Saves model.pt + feature_columns.json.
    Target: MAE < 20 AQI units on validation set.
    Expected training time: ~15 minutes on CPU, ~3 min on GPU.
    """
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Training on: {device}")

    model     = AQIPredictor().to(device)
    criterion = nn.HuberLoss(delta=1.0)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    scheduler = torch.optim.lr_scheduler.StepLR(
                    optimizer, step_size=20, gamma=0.5)

    X_t = torch.FloatTensor(X_train).to(device)
    y_t = torch.FloatTensor(y_train).to(device)
    X_v = torch.FloatTensor(X_val).to(device)
    y_v = torch.FloatTensor(y_val).to(device)

    train_loader = DataLoader(
        TensorDataset(X_t, y_t), batch_size=64, shuffle=True
    )

    best_val_loss = float('inf')

    for epoch in range(epochs):
        model.train()
        train_loss = 0
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            pred = model(X_batch)
            loss = criterion(pred, y_batch)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            train_loss += loss.item()

        model.eval()
        with torch.no_grad():
            val_pred = model(X_v)
            val_mae  = torch.mean(torch.abs(val_pred - y_v)).item()
            val_loss = criterion(val_pred, y_v).item()

        scheduler.step()

        if epoch % 10 == 0:
            print(f"Epoch {epoch:3d} | "
                  f"Train Loss: {train_loss/len(train_loader):.3f} | "
                  f"Val MAE: {val_mae:.2f} AQI units")

        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), 'ml/artifacts/model.pt')

    # Save feature column order — critical for inference
    feature_columns = ['PM2.5', 'temperature', 'humidity',
                       'wind_speed', 'boundary_layer_height', 'AQI']
    with open('ml/artifacts/feature_columns.json', 'w') as f:
        json.dump(feature_columns, f)

    print(f"\nTraining complete. Best Val MAE: {val_mae:.2f}")
    print("Saved: model.pt | scaler.pkl | feature_columns.json")
    return model
```

### predict.py

```python
import torch
import pickle
import json
import numpy as np
import pandas as pd
from ml.model import AQIPredictor

# Load once at startup — do NOT reload per request
model  = AQIPredictor()
model.load_state_dict(torch.load('ml/artifacts/model.pt', 
                                  map_location='cpu'))
model.eval()

with open('ml/artifacts/scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

with open('ml/artifacts/feature_columns.json') as f:
    feature_columns = json.load(f)

FEATURE_COLS = ['PM2.5', 'temperature', 'humidity',
                'wind_speed', 'boundary_layer_height', 'AQI']

def predict_aqi(last_24_hours_df: pd.DataFrame) -> dict:
    """
    Takes a DataFrame of last 24 hourly rows.
    Returns predicted AQI 6 hours from now.
    
    Backend calls this function — it does NOT touch model internals.
    
    Returns:
    {
        "predicted_aqi": 247.3,
        "severity": "Very Poor",
        "trigger_alert": True,
        "features": {
            "wind_speed": 14.2,
            "boundary_layer_height": 420,
            "humidity": 78
        }
    }
    """
    df = last_24_hours_df[FEATURE_COLS].copy()

    # Scale features (not AQI)
    scale_cols = ['PM2.5', 'temperature', 'humidity',
                  'wind_speed', 'boundary_layer_height']
    df[scale_cols] = scaler.transform(df[scale_cols])

    x = torch.FloatTensor(df.values).unsqueeze(0)  # (1, 24, 6)

    with torch.no_grad():
        predicted = model(x).item()

    predicted = round(max(0, predicted), 1)

    severity_map = [
        (50,  "Good"),
        (100, "Satisfactory"),
        (200, "Moderate"),
        (300, "Poor"),
        (400, "Very Poor"),
        (500, "Severe"),
    ]
    severity = "Hazardous"
    for threshold, label in severity_map:
        if predicted <= threshold:
            severity = label
            break

    return {
        "predicted_aqi"  : predicted,
        "severity"       : severity,
        "trigger_alert"  : predicted > 200,
        "features"       : {
            "wind_speed"           : float(last_24_hours_df['wind_speed'].iloc[-1]),
            "boundary_layer_height": float(last_24_hours_df['boundary_layer_height'].iloc[-1]),
            "humidity"             : float(last_24_hours_df['humidity'].iloc[-1]),
            "aqi_trend"            : "rising" if last_24_hours_df['AQI'].iloc[-1] > 
                                                 last_24_hours_df['AQI'].iloc[-6] 
                                              else "falling"
        }
    }
```

---

## Backend API

### main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import predict, alert, zones, health
from backend.services.scheduler_service import start_scheduler
from backend.database.db import init_db

app = FastAPI(
    title       = "AirGuardian AI",
    description = "6-hour AQI spike prediction and intervention system",
    version     = "1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins  = ["*"],   # Tighten in production
    allow_methods  = ["*"],
    allow_headers  = ["*"],
)

app.include_router(health.router,  prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(alert.router,   prefix="/api")
app.include_router(zones.router,   prefix="/api")

@app.on_event("startup")
async def startup():
    init_db()
    start_scheduler()
    print("AirGuardian AI is running.")
```

### services/model_service.py

```python
from ml.predict import predict_aqi
from data_integration.cpcb_fetcher import get_latest_station_data
from data_integration.weather_fetcher import get_latest_weather
from data_integration.feature_merger import merge_features

def get_prediction(zone: str) -> dict:
    """
    Full prediction pipeline for one zone.
    Called by routes and scheduler both.
    """
    # 1. Pull latest 24 hours of raw data
    aqi_data     = get_latest_station_data(zone=zone, hours=24)
    weather_data = get_latest_weather(hours=24)

    # 2. Merge into feature DataFrame
    feature_df = merge_features(aqi_data, weather_data)

    # 3. Run model inference
    result = predict_aqi(feature_df)
    result['zone'] = zone

    return result
```

### services/explanation_service.py

```python
import os
import json
from openai import OpenAI

client = OpenAI(
    api_key  = os.environ["GROQ_API_KEY"],
    base_url = "https://api.groq.com/openai/v1"
)

# Fallback cache — pre-generate before hackathon
FALLBACK_CACHE = "cache/explanations.json"

def generate_explanation(zone: str, prediction: dict) -> str:
    """
    Calls Groq Llama 3.3 70B to generate a plain-English
    explanation for campus administrators.
    Falls back to cached response if API fails.
    """
    prompt = f"""
You are AirGuardian AI. Write an alert for a campus administrator.
Maximum 3 sentences. No technical jargon. Be specific and actionable.

Predicted AQI   : {prediction['predicted_aqi']} ({prediction['severity']}) 
Location        : {zone}
Time horizon    : 6 hours from now
Wind speed      : {prediction['features']['wind_speed']} km/h
Boundary layer  : {prediction['features']['boundary_layer_height']}m
                  (below 500m = pollutants trapped near ground)
Humidity        : {prediction['features']['humidity']}%
AQI trend       : {prediction['features']['aqi_trend']}

Sentence 1: State the prediction and how serious it is.
Sentence 2: Explain the main cause in simple terms.
Sentence 3: Give one specific action they should take right now.
"""
    try:
        response = client.chat.completions.create(
            model       = "llama-3.3-70b-versatile",
            messages    = [{"role": "user", "content": prompt}],
            max_tokens  = 180,
            temperature = 0.3
        )
        explanation = response.choices[0].message.content
        _cache_explanation(zone, prediction['severity'], explanation)
        return explanation

    except Exception as e:
        print(f"Groq API failed: {e} — using cached fallback")
        return _get_cached_explanation(prediction['severity'])


def _cache_explanation(zone, severity, text):
    try:
        with open(FALLBACK_CACHE, 'r') as f:
            cache = json.load(f)
    except FileNotFoundError:
        cache = {}
    cache[severity] = text
    with open(FALLBACK_CACHE, 'w') as f:
        json.dump(cache, f, indent=2)


def _get_cached_explanation(severity: str) -> str:
    try:
        with open(FALLBACK_CACHE, 'r') as f:
            cache = json.load(f)
        return cache.get(severity, "AQI spike predicted. Take precautionary action.")
    except FileNotFoundError:
        return "AQI spike predicted. Please take precautionary action immediately."
```

### services/whatsapp_service.py

```python
import os
from twilio.rest import Client

def send_whatsapp_alert(zone: str, prediction: dict, explanation: str) -> bool:
    """
    Sends formatted WhatsApp alert via Twilio.
    Returns True if sent, False if failed.
    
    ⚠ Test this 5 times before demo day.
    """
    aqi      = prediction['predicted_aqi']
    severity = prediction['severity']

    severity_emoji = {
        "Good": "🟢", "Satisfactory": "🟡", "Moderate": "🟡",
        "Poor": "🟠", "Very Poor": "🔴", "Severe": "🔴", "Hazardous": "⛔"
    }
    emoji = severity_emoji.get(severity, "⚠️")

    message_body = f"""
{emoji} *AirGuardian Alert*

📍 Zone: {zone}
🔢 Predicted AQI (6hr): *{aqi}*
📊 Status: *{severity}*

{explanation}

─────────────────
_AirGuardian AI — Predict. Explain. Act._
    """.strip()

    try:
        client = Client(
            os.environ["TWILIO_ACCOUNT_SID"],
            os.environ["TWILIO_AUTH_TOKEN"]
        )
        client.messages.create(
            from_ = "whatsapp:+14155238886",
            to    = f"whatsapp:{os.environ['ALERT_PHONE_NUMBER']}",
            body  = message_body
        )
        print(f"WhatsApp alert sent for {zone} | AQI: {aqi}")
        return True
    except Exception as e:
        print(f"WhatsApp failed: {e}")
        return False
```

### services/scheduler_service.py

```python
from apscheduler.schedulers.background import BackgroundScheduler
from backend.services.model_service import get_prediction
from backend.services.explanation_service import generate_explanation
from backend.services.whatsapp_service import send_whatsapp_alert
from backend.database.db import save_alert

ZONES = [
    "Main Gate",
    "Hostel A",
    "Academic Block",
    "Library",
    "Sports Ground",
    "Parking Area"
]

AQI_ALERT_THRESHOLD = 200

def run_prediction_cycle():
    """
    Runs every 30 minutes automatically.
    For each zone:
      1. Predict
      2. If spike → Explain → Alert → Log
    """
    print("Running AirGuardian prediction cycle...")
    for zone in ZONES:
        try:
            prediction = get_prediction(zone)
            print(f"{zone}: Predicted AQI = {prediction['predicted_aqi']}")

            if prediction['trigger_alert']:
                explanation = generate_explanation(zone, prediction)
                send_whatsapp_alert(zone, prediction, explanation)
                save_alert(zone, prediction, explanation)

        except Exception as e:
            print(f"Prediction failed for {zone}: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        run_prediction_cycle,
        trigger    = 'interval',
        minutes    = 30,
        id         = 'aqi_prediction_cycle',
        max_instances = 1
    )
    scheduler.start()
    print("Scheduler started — predictions every 30 minutes.")
```

---

## Spatial Intelligence Layer

### data_integration/idw_engine.py

```python
import numpy as np

def idw_interpolate(
    zone_lat: float,
    zone_lon: float,
    station_predictions: list[dict],
    power: int = 2
) -> float:
    """
    Inverse Distance Weighting interpolation.
    Estimates AQI at any coordinate based on nearby CPCB stations.
    
    This is the same technique used in official meteorological
    mapping and GIS systems. Statistically valid, not fabricated.

    Args:
        zone_lat              : Target zone latitude
        zone_lon              : Target zone longitude
        station_predictions   : List of {"lat", "lon", "predicted_aqi"}
        power                 : IDW power parameter (2 = standard)

    Returns:
        Interpolated AQI float
    """
    if not station_predictions:
        return 0.0

    weights      = []
    aqi_values   = []

    for station in station_predictions:
        dist = np.sqrt(
            (zone_lat - station['lat'])**2 +
            (zone_lon - station['lon'])**2
        )
        if dist < 1e-10:        # Zone is exactly at station
            return station['predicted_aqi']
        
        weight = 1.0 / (dist ** power)
        weights.append(weight)
        aqi_values.append(station['predicted_aqi'])

    total_weight = sum(weights)
    interpolated = sum(w * v for w, v in zip(weights, aqi_values)) / total_weight

    return round(interpolated, 1)
```

### data_integration/zone_orchestrator.py

```python
from data_integration.idw_engine import idw_interpolate
from backend.services.model_service import get_prediction
import json

# Load zone coordinates from config
with open('config.py') as f:
    pass

ZONES = {
    "Main Gate"     : {"lat": 21.1458, "lon": 79.0882},
    "Hostel A"      : {"lat": 21.1462, "lon": 79.0891},
    "Academic Block": {"lat": 21.1470, "lon": 79.0878},
    "Library"       : {"lat": 21.1455, "lon": 79.0875},
    "Sports Ground" : {"lat": 21.1478, "lon": 79.0895},
    "Parking Area"  : {"lat": 21.1450, "lon": 79.0900},
}

STATIONS = {
    "Civil Lines" : {"lat": 21.1463, "lon": 79.0849},
    "Ambazari"    : {"lat": 21.1332, "lon": 79.0485},
}

def get_all_zone_predictions() -> dict:
    """
    1. Get model prediction for each CPCB station
    2. IDW interpolate to estimate AQI at each campus zone
    3. Return zone → predicted_aqi map for the frontend heatmap
    """
    station_predictions = []
    for name, coords in STATIONS.items():
        result = get_prediction(zone=name)
        station_predictions.append({
            "lat"          : coords["lat"],
            "lon"          : coords["lon"],
            "predicted_aqi": result["predicted_aqi"]
        })

    zone_results = {}
    for zone_name, coords in ZONES.items():
        zone_results[zone_name] = {
            "predicted_aqi": idw_interpolate(
                zone_lat             = coords["lat"],
                zone_lon             = coords["lon"],
                station_predictions  = station_predictions
            ),
            "lat": coords["lat"],
            "lon": coords["lon"]
        }

    return zone_results
```

---

## Database Schema

### database/db.py

```python
import sqlite3
from datetime import datetime

DB_PATH = "airguardian.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            zone          TEXT        NOT NULL,
            predicted_aqi REAL        NOT NULL,
            severity      TEXT        NOT NULL,
            explanation   TEXT,
            alerted       INTEGER     DEFAULT 0,
            timestamp     DATETIME    DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
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
        )
    """)
    conn.commit()
    conn.close()
    print("Database initialized.")

def save_alert(zone: str, prediction: dict, explanation: str):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        INSERT INTO alerts (zone, predicted_aqi, severity, explanation, alerted)
        VALUES (?, ?, ?, ?, 1)
    """, (zone, prediction['predicted_aqi'], prediction['severity'], explanation))
    conn.commit()
    conn.close()

def get_recent_alerts(limit: int = 10) -> list:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute("""
        SELECT zone, predicted_aqi, severity, explanation, timestamp
        FROM alerts ORDER BY timestamp DESC LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {"zone": r[0], "predicted_aqi": r[1], "severity": r[2],
         "explanation": r[3], "timestamp": r[4]}
        for r in rows
    ]
```

---

## API Reference

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/api/health` | System status check | `{status, model_loaded, scheduler_running}` |
| `GET` | `/api/predict?zone=SportsGround` | Predict AQI for one zone | `{zone, predicted_aqi, severity, trigger_alert, features}` |
| `GET` | `/api/zones` | All zone predictions (heatmap data) | `{zone_name: {predicted_aqi, lat, lon}}` |
| `POST` | `/api/alert` | Manually trigger alert for a zone | `{success, message_sid}` |
| `GET` | `/api/alerts/history` | Recent alert log | `[{zone, predicted_aqi, explanation, timestamp}]` |

### Sample Response — `/api/zones`

```json
{
  "Sports Ground" : { "predicted_aqi": 267.4, "severity": "Very Poor",
                      "lat": 21.1478, "lon": 79.0895 },
  "Library"       : { "predicted_aqi": 143.2, "severity": "Moderate",
                      "lat": 21.1455, "lon": 79.0875 },
  "Main Gate"     : { "predicted_aqi": 198.1, "severity": "Moderate",
                      "lat": 21.1458, "lon": 79.0882 },
  "Hostel A"      : { "predicted_aqi": 221.0, "severity": "Poor",
                      "lat": 21.1462, "lon": 79.0891 },
  "Academic Block": { "predicted_aqi": 165.3, "severity": "Moderate",
                      "lat": 21.1470, "lon": 79.0878 },
  "Parking Area"  : { "predicted_aqi": 283.7, "severity": "Very Poor",
                      "lat": 21.1450, "lon": 79.0900 }
}
```

---

## Environment Setup

### .env.example

```bash
# Groq LLM (free at console.groq.com — 2 min signup)
GROQ_API_KEY=your_groq_api_key_here

# Twilio WhatsApp (free tier at twilio.com)
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_token_here
ALERT_PHONE_NUMBER=+91XXXXXXXXXX

# Optional: OpenAQ fallback
OPENAQ_API_KEY=optional_not_required

# App config
DEBUG=True
DB_PATH=airguardian.db
```

### requirements.txt

```
fastapi==0.110.0
uvicorn==0.29.0
torch==2.2.1
pandas==2.2.1
numpy==1.26.4
scikit-learn==1.4.1
scipy==1.13.0
apscheduler==3.10.4
twilio==8.13.0
openai==1.25.0
httpx==0.27.0
python-dotenv==1.0.1
sqlalchemy==2.0.29
```

---

## Running the System

```bash
# 1. Clone and setup
git clone https://github.com/your-team/airguardian
cd airguardian
pip install -r requirements.txt
cp .env.example .env
# Fill in your .env keys

# 2. Download + process data (DO BEFORE HACKATHON)
python ml/data_loader.py
python ml/data_cleaner.py

# 3. Train the model
python ml/train.py
# Expected output:
# Training on: cpu
# Epoch  0 | Train Loss: 42.3 | Val MAE: 31.2 AQI units
# Epoch 20 | Train Loss: 18.7 | Val MAE: 19.4 AQI units
# Epoch 40 | Train Loss: 14.2 | Val MAE: 16.8 AQI units
# Saved: model.pt | scaler.pkl | feature_columns.json

# 4. Pre-generate LLM fallback cache
python -c "from backend.services.explanation_service import *; pre_generate_cache()"

# 5. Start the backend
uvicorn backend.main:app --reload --port 8000

# 6. Verify everything works
curl http://localhost:8000/api/health
curl http://localhost:8000/api/zones
```

---

## Datasets Used

| Dataset | Source | Years | Key Columns | Access |
|---|---|---|---|---|
| Time Series AQI India | Kaggle (abhisheksjha) | 2010–2023 | PM2.5, PM10, NO2, AQI | Free instant |
| AQI India 2015–2024 | Kaggle (ankushpanday1) | 2015–2024 | AQI, PM2.5, stations | Free instant |
| Historical Weather | Open-Meteo Archive API | 2000–now | temp, humidity, wind, boundary layer | Free, no key |
| Live AQI Fallback | OpenAQ API | Live | PM2.5 per station | Free, no key |

---

## Team Ownership Map

```
Member 1 — ML Lead         : ml/ folder entirely
                             Owns model.pt, scaler.pkl
                             Owns predict.py interface
                             DO NOT touch backend/

Member 2 — Backend Lead    : backend/ folder entirely
                             Calls predict.py as black box
                             Owns scheduler, alerts, API
                             DO NOT touch ml/ internals

Member 3 — Data & GIS Lead : data_integration/ folder entirely
                             Owns CPCB + weather fetchers
                             Owns IDW engine + zone orchestrator
                             Feeds clean DataFrames to Member 1
```

---

## Build Order (24 Hours)

```
Hours  0–4  : Member 1 trains model | Member 3 builds data fetchers
Hours  4–8  : Member 2 builds FastAPI + DB | Member 1 exposes predict.py
Hours  8–14 : Full pipeline integration — data → model → API → alert
Hours 14–18 : Member 3 builds IDW + zone map | All test /api/zones
Hours 18–22 : WhatsApp demo hardening | LLM cache generation | Bug fixes
Hours 22–24 : Demo rehearsal — 90 seconds, end-to-end, 3 full runs
```

---

## The Core Loop

```
Every 30 minutes, automatically:

  Fresh weather + AQI data pulled
          ↓
  GRU predicts AQI for each station
          ↓
  IDW interpolates for each campus zone
          ↓
  IF any zone > 200 AQI predicted:
      LLM generates plain-English explanation
      WhatsApp fires to registered number
      Alert logged to SQLite
          ↓
  Frontend polls /api/zones every 60 seconds
  Heatmap updates automatically
```

---

*AirGuardian AI — Predict. Explain. Act.*
*Built for AMD Slingshot 2026*
