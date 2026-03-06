# AirGuardian AI 🌍

### AMD Slingshot 2026 — Hackathon Submission

---

## Slide 1 — Team Details

**Team Name:** AirGuardian AI

**Problem Statement:**
Build an AI system that predicts dangerous air quality spikes hours before they occur, explains the cause in plain language, and triggers automatic alerts — using only free public data.

**Team Members:**

| Name | Role |
|---|---|
| **Sidhant Gade** | ML & Data Intelligence Lead |
| **Satyam Shrivastav** | Backend Systems Lead |
| **Rushi Solanker** | Data Integration & GIS Lead |

---

## Slide 2 — Brief About the Idea

> **"6-hour early warning for air quality spikes — before anyone is exposed."**

AirGuardian is a predictive air quality intelligence system that forecasts hazardous AQI levels 6 hours in advance using a GRU neural network trained on 10+ years of historical data. It serves campus administrators, municipal bodies, and health agencies by converting raw environmental signals into plain-English alerts delivered automatically.

Unlike reactive monitoring dashboards, AirGuardian enables **pre-emptive action** — cancelling outdoor activities, issuing advisories, and protecting vulnerable populations *before* pollution spikes arrive.

---

## Slide 3 — Problem & Opportunity

India's AQI monitoring infrastructure reports current conditions but provides no forward warning. By the time AQI crosses dangerous thresholds, millions are already exposed. Existing systems are reactive — they inform *after* the damage begins, not before it arrives.

- **1.67 million deaths** annually in India linked to air pollution (Lancet, 2023)
- **Campus populations** — students, staff, outdoor workers — have zero advance warning
- **No free predictive tool** exists for hyper-local AQI forecasting in India
- **Health costs escalate** when exposure happens without precautionary action
- **Scalable to any Indian city** with CPCB stations and Open-Meteo coverage

---

## Slide 4 — Differentiation & USP

Existing solutions like SAFAR and IQAir provide real-time AQI dashboards but lack predictive capabilities at hyper-local granularity. Government tools report city-level averages; commercial APIs charge for forecasts and don't explain the reasoning behind predictions.

- **Predictive, not reactive** — 6-hour advance forecast vs. current readings
- **Hyper-local IDW interpolation** — zone-level estimates from sparse station data
- **LLM-powered explanations** — plain-English reasoning for non-technical users
- **Fully autonomous alert loop** — no manual monitoring required
- **Zero data cost** — built entirely on free public APIs and datasets

> **USP:** The only free, end-to-end system that predicts AQI spikes, explains *why* via LLM, and auto-alerts — without any paid API or hardware dependency.

---

## Slide 5 — Core Features

- **6-Hour AQI Forecasting** — GRU neural network trained on 10+ years of data
- **Spatial Zone Mapping** — IDW interpolation across 6 campus zones
- **LLM Explanation Engine** — Groq Llama 3.3 70B generates actionable summaries
- **Automated Email Alerting** — triggered when predicted AQI exceeds 200
- **Scheduled Prediction Cycles** — auto-runs every 30 minutes autonomously
- **RESTful API Layer** — `/predict`, `/zones`, `/alert`, `/health` endpoints

---

## Slide 6 — Process Flow / Use Case

Every 30 minutes, the system autonomously pulls fresh data, runs inference, and decides whether to alert — with no human intervention required.

```
📡 CPCB + Open-Meteo    →    🔄 Feature Merger    →    🧠 GRU Model
   (Live AQI & Weather)        (Align & Scale)          (24hr → 6hr Forecast)
                                                              │
                                                              ▼
📧 Auto Alert           ←    💬 LLM Explainer     ←    🗺️ IDW Engine
   (Email + Log)               (Plain English)          (Zone Interpolation)
```

**Trigger rule:** If any zone's predicted AQI exceeds 200, the LLM generates an explanation and email notifications are dispatched automatically.

---

## Slide 7 — Architecture Overview

AirGuardian follows a modular, layered architecture with clear ownership boundaries. Each layer operates independently and communicates through well-defined interfaces.

| Layer | Technology | Status |
|---|---|---|
| **Frontend** | React + Leaflet.js + Recharts | Under Development (UI Layer) |
| **Backend** | FastAPI + APScheduler + Uvicorn | ✅ Complete |
| **AI Engine** | PyTorch GRU (2-layer, 64 units) | ✅ Complete |
| **Database** | SQLite (alerts & predictions logging) | ✅ Complete |
| **External APIs** | Groq LLM, Open-Meteo, CPCB | ✅ Integrated |
| **Deployment** | Local / Cloud VM via Uvicorn ASGI | ✅ Ready |

---

## Slide 8 — Technology Stack

| Category | Technologies |
|---|---|
| **Frontend** *(Under Development)* | React, Leaflet.js, Recharts, Tailwind CSS |
| **Backend** | FastAPI, Uvicorn, APScheduler, SQLite |
| **AI / ML** | PyTorch, GRU Network, scikit-learn, Pandas, NumPy |
| **LLM / NLP** | Groq API, Llama 3.3 70B, OpenAI Client |
| **Data Sources** | CPCB / Kaggle, Open-Meteo API, OpenAQ (fallback) |
| **Notifications** | Gmail SMTP (Python built-in smtplib) |
| **Config / Env** | Pydantic Settings, python-dotenv |
| **Testing** | Pytest, pytest-asyncio |

---

## Slide 9 — Usage of AMD Products / Solutions

AirGuardian's GRU-based deep learning pipeline is computationally intensive during training — processing 10+ years of hourly data across multiple feature dimensions. AMD's high-performance computing solutions directly accelerate this workload, enabling faster experimentation and shorter iteration cycles.

- **AMD Ryzen Processors** — primary compute for model training, data preprocessing, and API hosting
- **ROCm / AMD GPU Acceleration** — PyTorch training on AMD GPUs via the ROCm stack
- **High-throughput inference** — AMD CPU architecture enables low-latency prediction serving under 100ms
- **Multi-threaded data pipeline** — AMD's multi-core advantage accelerates concurrent data fetching and feature engineering
- **Cost-effective scaling** — AMD-based cloud instances reduce deployment costs vs. alternatives

---

## Slide 10 — Implementation Feasibility

The backend, ML engine, and data integration layers are fully implemented and tested. The remaining work — frontend UI integration — is the final assembly step, with API contracts already defined and stable.

- **ML Engine** — model trained, validated, artifacts saved → `Complete ✅`
- **Backend API** — all endpoints live, scheduler running → `Complete ✅`
- **Data Pipeline** — fetchers, merger, IDW engine working → `Complete ✅`
- **Alert System** — email notifications functional → `Complete ✅`
- **Frontend UI** — under development, final integration step → `In Progress 🔶`
- **Infrastructure Cost** — $0 for APIs; hosting on free tiers possible

---

## Slide 11 — Prototype & Validation

**Working Components:**

- ✅ FastAPI backend serving predictions via REST API
- ✅ Trained GRU model — validated with MAE ~16–20 AQI units
- ✅ Automated 30-min prediction cycles running autonomously
- ✅ Groq LLM integration with fallback explanation cache
- ✅ Test suite — API, model, and IDW engine tests passing
- 🔶 Frontend UI layer — under development; API contracts stable

**Sample API Output:**

```json
{
  "zone": "Sports Ground",
  "predicted_aqi": 267.4,
  "severity": "Very Poor",
  "trigger_alert": true,
  "features": {
    "wind_speed": 14.2,
    "boundary_layer_height": 420,
    "humidity": 78,
    "aqi_trend": "rising"
  }
}
```

---

## Slide 12 — Future Scope

AirGuardian is designed as a modular platform. The core prediction engine and API layer can be extended to any Indian city with CPCB stations, and the architecture supports multi-tenant deployment for institutions, municipalities, and health organizations.

- **Multi-city expansion** — replicate to any city with CPCB monitoring coverage
- **Extended forecast horizon** — 12hr and 24hr predictions with ensemble models
- **Satellite data integration** — NASA MODIS / Sentinel-5P for regional coverage
- **Mobile app with push notifications** — personal AQI alerts for citizens
- **Institutional SaaS model** — subscription for campuses, hospitals, smart cities
- **Real-time dashboard** — interactive heatmap with historical trends and analytics

---

*AirGuardian AI — Predict. Explain. Act.*
*Built for AMD Slingshot 2026*
