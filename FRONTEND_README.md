# AirGuardian AI — Frontend
### React Interface for the Predict. Explain. Act. System.

---

## Design Philosophy First

Most AI dashboards look the same — dark sidebar, purple gradients,
Inter font, card grid, generic chart. Judges have seen 40 of them
today before yours. Yours looks like none of them.

**AirGuardian's visual identity:**

> Industrial Crisis Command — the aesthetic of a real-time emergency
> operations center. Not a startup SaaS dashboard. Not a data science
> notebook. A live system that knows something dangerous is coming
> and makes you feel the urgency of that.

**What that means in practice:**

- Background: near-black with a subtle green atmospheric tint —
  the color of smog at night
- Typography: Sharp, monospaced numerics for AQI values —
  they feel like readings, not labels
- AQI zones pulse with a slow breathing animation when in danger
- The EXPLAIN panel appears like a decoded intelligence report,
  not a chatbot bubble
- Alert history scrolls like a live ops log, not a notification list
- Zero rounded cards. Hard edges. Real tension.

**Fonts:**
- Display / AQI numbers: `DM Mono` — technical, precise, unambiguous
- Headings: `Syne` — sharp, authoritative, not seen on every AI app
- Body / labels: `Inter` only for smallest UI text — controlled use only

**Color Palette:**

```
--bg-base:        #0A0F0A   /* Near-black with green undertone */
--bg-surface:     #111711   /* Card/panel background */
--bg-raised:      #182018   /* Elevated element */
--border:         #1E2E1E   /* Subtle green-tinted border */

--aqi-good:       #22C55E   /* Green — safe */
--aqi-moderate:   #EAB308   /* Amber — caution */
--aqi-poor:       #F97316   /* Orange — poor */
--aqi-very-poor:  #EF4444   /* Red — very poor */
--aqi-hazardous:  #DC2626   /* Deep red — hazardous */

--accent-primary: #4ADE80   /* Bright green — primary actions */
--accent-glow:    #16A34A   /* Glow color for pulsing elements */

--text-primary:   #F0FDF4   /* Near-white with green tint */
--text-secondary: #86EFAC   /* Muted green text */
--text-muted:     #4ADE8066 /* Very muted labels */

--alert-red:      #FF3B3B   /* Alert state color */
--alert-glow:     #FF3B3B33 /* Alert glow */
```

---

## Project Setup

```bash
# Create Vite + React project (faster than CRA, no bloat)
npm create vite@latest airguardian-frontend -- --template react
cd airguardian-frontend

# Install all dependencies in one go
npm install \
  leaflet react-leaflet \
  recharts \
  framer-motion \
  axios \
  clsx \
  @fontsource/syne \
  @fontsource/dm-mono \
  date-fns

# Dev dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base:     "#0A0F0A",
        surface:  "#111711",
        raised:   "#182018",
        border:   "#1E2E1E",
        good:     "#22C55E",
        moderate: "#EAB308",
        poor:     "#F97316",
        verypoor: "#EF4444",
        hazard:   "#DC2626",
        accent:   "#4ADE80",
        muted:    "#86EFAC",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        mono:    ["DM Mono", "monospace"],
        body:    ["Inter", "sans-serif"],
      },
      animation: {
        "pulse-slow" : "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "breathe"    : "breathe 4s ease-in-out infinite",
        "slide-up"   : "slideUp 0.4s ease-out",
        "fade-in"    : "fadeIn 0.3s ease-out",
      },
      keyframes: {
        breathe: {
          "0%,100%": { opacity: "0.6", transform: "scale(1)" },
          "50%":     { opacity: "1",   transform: "scale(1.02)" },
        },
        slideUp: {
          "0%":   { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}
```

### index.css

```css
@import "@fontsource/syne/400.css";
@import "@fontsource/syne/700.css";
@import "@fontsource/dm-mono/400.css";
@import "@fontsource/dm-mono/500.css";
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: #0A0F0A;
  color: #F0FDF4;
  font-family: "Syne", sans-serif;
  overflow-x: hidden;
}

/* Leaflet dark map override */
.leaflet-container { background: #0A0F0A !important; }
.leaflet-tile {
  filter: invert(1) hue-rotate(180deg) brightness(0.85) saturate(0.7);
}
.leaflet-popup-content-wrapper,
.leaflet-popup-tip { background: transparent !important; box-shadow: none !important; }

/* Custom scrollbar */
::-webkit-scrollbar       { width: 4px; }
::-webkit-scrollbar-track { background: #0A0F0A; }
::-webkit-scrollbar-thumb { background: #1E2E1E; border-radius: 2px; }

/* AQI glow helpers */
.aqi-glow-green  { text-shadow: 0 0 24px #22C55E66; }
.aqi-glow-amber  { text-shadow: 0 0 24px #EAB30866; }
.aqi-glow-orange { text-shadow: 0 0 24px #F9731666; }
.aqi-glow-red    { text-shadow: 0 0 24px #EF444466; }

/* Zone pulse ring — used on alert markers */
.zone-ring {
  box-shadow: 0 0 0 0 currentColor;
  animation: zonePulse 2.5s infinite;
}
@keyframes zonePulse {
  0%   { box-shadow: 0 0 0 0 currentColor; }
  70%  { box-shadow: 0 0 0 10px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
```

---

## Full Project Structure

```
src/
│
├── main.jsx
├── App.jsx
│
├── api/
│   └── airguardian.js        # All backend calls — single file
│
├── hooks/
│   ├── useZones.js           # Polls /api/zones every 60s
│   ├── useAlertHistory.js    # Polls /api/alerts/history every 30s
│   └── usePredict.js         # On-demand single zone call
│
├── pages/
│   └── Dashboard.jsx         # Single page — everything lives here
│
├── components/
│   │
│   ├── layout/
│   │   ├── TopBar.jsx        # Logo + live status + last updated time
│   │   └── StatusPill.jsx    # LIVE / OFFLINE indicator
│   │
│   ├── map/
│   │   ├── CampusMap.jsx     # Leaflet map with dark tile filter
│   │   ├── ZoneMarker.jsx    # Custom pulsing colored marker
│   │   └── MapLegend.jsx     # AQI color scale overlay
│   │
│   ├── zones/
│   │   ├── ZoneGrid.jsx      # 2x3 responsive grid
│   │   └── ZoneCard.jsx      # Zone name + AQI number + severity + pulse
│   │
│   ├── prediction/
│   │   ├── ForecastChart.jsx # Recharts AreaChart — 6hr forecast
│   │   └── ChartTooltip.jsx  # Styled tooltip matching palette
│   │
│   ├── explain/
│   │   ├── ExplainPanel.jsx  # Container for AI explanation
│   │   └── ExplainText.jsx   # Typewriter effect — the wow moment
│   │
│   ├── alerts/
│   │   ├── AlertLog.jsx      # Ops-log style scrolling history
│   │   └── AlertRow.jsx      # One alert entry with explanation
│   │
│   └── shared/
│       ├── AQIBadge.jsx      # Severity label pill — reused everywhere
│       ├── Skeleton.jsx      # Loading skeleton
│       └── EmptyState.jsx    # Consistent empty state component
│
└── utils/
    ├── aqi.js                # AQI → color, label, severity helpers
    └── time.js               # Date formatting utilities
```

---

## Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  TOPBAR — ● AIRGUARDIAN AI    [LIVE]    Updated 2 min ago         │
├───────────────────────────────┬──────────────────────────────────┤
│                               │                                  │
│                               │  ZONE GRID (2 × 3)              │
│   CAMPUS MAP                  │  ┌───────────┐  ┌───────────┐   │
│   (Leaflet full height)       │  │ Main Gate │  │ Hostel A  │   │
│                               │  │   198     │  │   267 ●   │   │
│   Zones glow in               │  └───────────┘  └───────────┘   │
│   severity color              │  ┌───────────┐  ┌───────────┐   │
│   Clicking a zone             │  │Acad Block │  │  Library  │   │
│   selects it everywhere       │  │   143     │  │    91     │   │
│                               │  └───────────┘  └───────────┘   │
│                               │  ┌───────────┐  ┌───────────┐   │
│                               │  │Sports Gnd │  │  Parking  │   │
│                               │  │  287 ●●   │  │   223     │   │
│                               │  └───────────┘  └───────────┘   │
├───────────────────────────────┴──────────────────────────────────┤
│ FORECAST CHART (6hr area chart)  │  EXPLAIN PANEL (LLM output)   │
│                                  │  Types itself in real time    │
├──────────────────────────────────┴──────────────────────────────┤
│  ALERT LOG — scrolling ops timeline — auto-refreshes 30s         │
└──────────────────────────────────────────────────────────────────┘
```

---

## API Layer

```javascript
// src/api/airguardian.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const api  = axios.create({ baseURL: BASE, timeout: 8000 });

export const fetchZones        = ()        => api.get("/zones").then(r => r.data);
export const fetchPredict      = (zone)    => api.get("/predict", { params: { zone } }).then(r => r.data);
export const fetchAlertHistory = (limit=10)=> api.get("/alerts/history", { params: { limit } }).then(r => r.data);
export const fetchHealth       = ()        => api.get("/health").then(r => r.data);
export const triggerAlert      = (zone)    => api.post("/alert/trigger", null, { params: { zone } }).then(r => r.data);
```

---

## Hooks

```javascript
// src/hooks/useZones.js
import { useState, useEffect, useCallback } from "react";
import { fetchZones } from "../api/airguardian";

export function useZones(intervalMs = 60000) {
  const [zones,       setZones]       = useState({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchZones();
      setZones(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError("Backend unreachable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);

  return { zones, loading, error, lastUpdated, refresh: load };
}
```

```javascript
// src/hooks/useAlertHistory.js
import { useState, useEffect } from "react";
import { fetchAlertHistory } from "../api/airguardian";

export function useAlertHistory(limit = 10, intervalMs = 30000) {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try   { setAlerts(await fetchAlertHistory(limit)); }
      finally { setLoading(false); }
    };
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [limit, intervalMs]);

  return { alerts, loading };
}
```

---

## AQI Utility

```javascript
// src/utils/aqi.js
export const AQI_LEVELS = [
  { max: 50,       label: "Good",         color: "#22C55E", bg: "#052E16", glow: "#22C55E33" },
  { max: 100,      label: "Satisfactory", color: "#84CC16", bg: "#1A2E05", glow: "#84CC1633" },
  { max: 200,      label: "Moderate",     color: "#EAB308", bg: "#2D2505", glow: "#EAB30833" },
  { max: 300,      label: "Poor",         color: "#F97316", bg: "#2D1505", glow: "#F9731633" },
  { max: 400,      label: "Very Poor",    color: "#EF4444", bg: "#2D0505", glow: "#EF444433" },
  { max: 500,      label: "Severe",       color: "#DC2626", bg: "#250505", glow: "#DC262633" },
  { max: Infinity, label: "Hazardous",    color: "#FF3B3B", bg: "#1F0000", glow: "#FF3B3B55" },
];

export const getAQILevel  = (aqi) => AQI_LEVELS.find(l => aqi <= l.max) || AQI_LEVELS.at(-1);
export const getAQIColor  = (aqi) => getAQILevel(aqi).color;
export const getAQILabel  = (aqi) => getAQILevel(aqi).label;
export const getAQIBg     = (aqi) => getAQILevel(aqi).bg;
export const getAQIGlow   = (aqi) => getAQILevel(aqi).glow;
export const isAlert      = (aqi) => aqi > 200;
```

---

## Key Components — Full Code

### TopBar.jsx

```jsx
import { formatDistanceToNow } from "date-fns";

export default function TopBar({ lastUpdated, isLive, error }) {
  return (
    <header className="flex items-center justify-between px-6 py-3
                       border-b border-[#1E2E1E] bg-[#0A0F0A]
                       sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
        <span className="font-display font-bold text-lg tracking-widest
                         text-accent uppercase">
          AirGuardian
        </span>
        <span className="text-muted font-mono text-xs tracking-wider opacity-60">
          AI / v1.0
        </span>
      </div>

      <p className="hidden md:block font-mono text-xs text-muted
                    tracking-widest uppercase opacity-50">
        Predict · Explain · Act
      </p>

      <div className="flex items-center gap-4">
        {lastUpdated && (
          <span className="font-mono text-xs text-muted opacity-50">
            {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
        )}

        {error ? (
          <span className="flex items-center gap-1.5 px-3 py-1
                           bg-red-950 border border-red-800
                           font-mono text-xs text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            OFFLINE
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1
                           bg-[#052E16] border border-[#166534]
                           font-mono text-xs text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
            LIVE
          </span>
        )}
      </div>
    </header>
  );
}
```

### ZoneCard.jsx

```jsx
import { motion } from "framer-motion";
import { getAQIColor, getAQIBg, getAQIGlow, isAlert } from "../../utils/aqi";
import AQIBadge from "../shared/AQIBadge";

export default function ZoneCard({ zoneName, data, selected, onClick }) {
  const { predicted_aqi } = data;
  const color  = getAQIColor(predicted_aqi);
  const bg     = getAQIBg(predicted_aqi);
  const glow   = getAQIGlow(predicted_aqi);
  const alert  = isAlert(predicted_aqi);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(zoneName)}
      style={{
        backgroundColor: selected ? bg      : "#111711",
        borderColor:     selected ? color   : "#1E2E1E",
        boxShadow:       selected ? `0 0 20px ${glow}` : "none",
      }}
      className="relative cursor-pointer border p-4
                 transition-all duration-300 group"
    >
      {/* Alert pulse ring — only shows when AQI > 200 */}
      {alert && (
        <span style={{ color }}
              className="absolute top-2 right-2 w-2 h-2
                         rounded-full bg-current zone-ring" />
      )}

      <p className="font-mono text-[10px] uppercase tracking-[0.2em]
                    text-muted mb-2 group-hover:text-accent transition-colors">
        {zoneName}
      </p>

      <p style={{ color, textShadow: `0 0 24px ${glow}` }}
         className="font-mono font-medium text-4xl leading-none mb-2">
        {Math.round(predicted_aqi)}
      </p>

      <AQIBadge aqi={predicted_aqi} />

      <p className="mt-2 font-mono text-[10px] text-muted opacity-50">
        6-hr forecast
      </p>
    </motion.div>
  );
}
```

### CampusMap.jsx

```jsx
import { MapContainer, TileLayer } from "react-leaflet";
import ZoneMarker from "./ZoneMarker";
import MapLegend  from "./MapLegend";
import "leaflet/dist/leaflet.css";

const CENTER = [21.1458, 79.0882];

export default function CampusMap({ zones, selectedZone, onZoneClick }) {
  return (
    <div className="relative h-full w-full border border-[#1E2E1E]">
      <MapContainer center={CENTER} zoom={15}
                    className="h-full w-full"
                    zoomControl={false}
                    attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {Object.entries(zones).map(([name, data]) => (
          <ZoneMarker key={name} zoneName={name} data={data}
                      selected={selectedZone === name}
                      onClick={onZoneClick} />
        ))}
      </MapContainer>

      <MapLegend />

      <div className="absolute top-3 left-3 z-[1000] font-mono text-[10px]
                      text-muted tracking-widest uppercase
                      bg-[#0A0F0AEE] px-2 py-1 border border-[#1E2E1E]">
        Campus AQI — 6hr Forecast
      </div>
    </div>
  );
}
```

### ZoneMarker.jsx

```jsx
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getAQIColor, getAQILabel } from "../../utils/aqi";

function makeIcon(aqi, selected) {
  const color = getAQIColor(aqi);
  const size  = selected ? 18 : 13;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};border:2px solid #0A0F0A;
      border-radius:50%;
      box-shadow:0 0 14px ${color}99;
      animation:zonePulse 2.5s infinite;">
    </div>`,
  });
}

export default function ZoneMarker({ zoneName, data, selected, onClick }) {
  const { predicted_aqi, lat, lon } = data;
  const color = getAQIColor(predicted_aqi);

  return (
    <Marker position={[lat, lon]} icon={makeIcon(predicted_aqi, selected)}
            eventHandlers={{ click: () => onClick(zoneName) }}>
      <Popup>
        <div style={{ background:"#111711", border:`1px solid ${color}`,
                      padding:"8px 12px", minWidth:"130px", fontFamily:"DM Mono" }}>
          <p style={{ fontSize:"10px", color:"#86EFAC", letterSpacing:"0.15em",
                      textTransform:"uppercase", marginBottom:"4px" }}>
            {zoneName}
          </p>
          <p style={{ fontSize:"28px", color, lineHeight:1, marginBottom:"4px" }}>
            {Math.round(predicted_aqi)}
          </p>
          <p style={{ fontSize:"10px", color }}>
            {getAQILabel(predicted_aqi)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}
```

### ExplainText.jsx — The Wow Moment

```jsx
import { useEffect, useState } from "react";

export default function ExplainText({ text }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    // 18ms per char — feels like the AI is thinking
    const id = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text]);

  return (
    <p className="font-mono text-sm leading-relaxed text-[#D1FAE5]
                  whitespace-pre-wrap">
      {displayed}
      {/* Blinking cursor — makes it feel live */}
      <span className="inline-block w-0.5 h-4 bg-accent animate-pulse
                       ml-0.5 align-text-bottom" />
    </p>
  );
}
```

### ExplainPanel.jsx

```jsx
import { AnimatePresence, motion } from "framer-motion";
import ExplainText from "./ExplainText";

export default function ExplainPanel({ explanation, zone }) {
  return (
    <div className="h-full flex flex-col border border-[#1E2E1E]
                    bg-[#111711] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
        <p className="font-mono text-[10px] text-muted uppercase tracking-widest">
          AI Analysis
        </p>
        {zone && (
          <span className="ml-auto font-mono text-[10px] text-accent">
            {zone}
          </span>
        )}
      </div>
      <div className="h-px bg-[#1E2E1E] mb-4" />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {explanation ? (
            <motion.div key={explanation.slice(0,20)}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}>
              <ExplainText text={explanation} />
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center
                                   h-full text-center gap-2 py-8">
              <div className="w-8 h-8 border border-[#1E2E1E] rounded-full
                              flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-muted opacity-30" />
              </div>
              <p className="font-mono text-[11px] text-muted opacity-60">
                Select an alert zone<br />to view AI analysis
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

### AlertLog.jsx

```jsx
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { getAQIColor } from "../../utils/aqi";

export default function AlertLog({ alerts, loading }) {
  return (
    <div className="border-t border-[#1E2E1E] bg-[#0A0F0A]">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#1E2E1E]">
        <span className="w-1.5 h-1.5 rounded-full bg-verypoor animate-pulse-slow" />
        <p className="font-mono text-[10px] text-muted uppercase tracking-widest">
          Alert Log
        </p>
        <span className="ml-auto font-mono text-[10px] text-muted opacity-40">
          auto-refresh 30s
        </span>
      </div>

      <div className="max-h-36 overflow-y-auto">
        {loading ? (
          <p className="font-mono text-[11px] text-muted text-center py-4 opacity-40">
            Loading...
          </p>
        ) : alerts.length === 0 ? (
          <p className="font-mono text-[11px] text-muted text-center py-4 opacity-40">
            No alerts triggered yet
          </p>
        ) : (
          <AnimatePresence>
            {alerts.map((alert, i) => (
              <AlertRow key={`${alert.timestamp}-${alert.zone}`}
                        alert={alert} index={i} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function AlertRow({ alert, index }) {
  const color = getAQIColor(alert.predicted_aqi);
  const time  = format(new Date(alert.timestamp), "HH:mm · dd/MM");

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-start gap-3 px-4 py-3
                 border-b border-[#1E2E1E] last:border-0
                 hover:bg-[#111711] transition-colors group"
    >
      <span style={{ backgroundColor: color }}
            className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-mono text-[11px] text-muted uppercase tracking-wider">
            {alert.zone}
          </span>
          <span style={{ color }} className="font-mono text-[11px] font-medium">
            AQI {Math.round(alert.predicted_aqi)}
          </span>
          <span style={{ color }} className="font-mono text-[10px] opacity-60">
            {alert.severity}
          </span>
        </div>
        {alert.explanation && (
          <p className="font-mono text-[10px] text-muted opacity-70 leading-relaxed
                        line-clamp-1 group-hover:line-clamp-none transition-all">
            {alert.explanation}
          </p>
        )}
      </div>

      <span className="flex-shrink-0 font-mono text-[10px] text-muted opacity-40 mt-0.5">
        {time}
      </span>
    </motion.div>
  );
}
```

### AQIBadge.jsx

```jsx
import { getAQIColor, getAQILabel, getAQIBg } from "../../utils/aqi";

export default function AQIBadge({ aqi }) {
  const color = getAQIColor(aqi);
  const bg    = getAQIBg(aqi);
  const label = getAQILabel(aqi);

  return (
    <span style={{ color, backgroundColor: bg, borderColor: `${color}33` }}
          className="inline-block border px-1.5 py-0.5
                     font-mono text-[10px] uppercase tracking-wider">
      {label}
    </span>
  );
}
```

---

## Dashboard.jsx — Full Page Assembly

```jsx
import { useState } from "react";
import { useZones }        from "../hooks/useZones";
import { useAlertHistory } from "../hooks/useAlertHistory";

import TopBar        from "../components/layout/TopBar";
import CampusMap     from "../components/map/CampusMap";
import ZoneCard      from "../components/zones/ZoneCard";
import ForecastChart from "../components/prediction/ForecastChart";
import ExplainPanel  from "../components/explain/ExplainPanel";
import AlertLog      from "../components/alerts/AlertLog";

export default function Dashboard() {
  const [selectedZone, setSelectedZone] = useState("Sports Ground");
  const { zones, loading, error, lastUpdated } = useZones(60000);
  const { alerts, loading: alertLoading }      = useAlertHistory(10, 30000);

  const selectedData      = zones[selectedZone];
  const latestExplanation = alerts.find(a => a.zone === selectedZone)?.explanation;

  return (
    <div className="min-h-screen bg-base flex flex-col">

      <TopBar lastUpdated={lastUpdated} isLive={!loading} error={error} />

      {/* TOP — Map + Zone Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px]
                      border-b border-[#1E2E1E]">

        {/* Map — left */}
        <div className="h-[55vh] lg:h-[420px] border-r border-[#1E2E1E]">
          {!loading && (
            <CampusMap zones={zones} selectedZone={selectedZone}
                       onZoneClick={setSelectedZone} />
          )}
        </div>

        {/* Zone Grid — right */}
        <div className="p-4">
          <p className="font-mono text-[10px] text-muted uppercase
                        tracking-widest mb-3 opacity-60">
            Zone Predictions · 6hr Ahead
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(zones).map(([name, data]) => (
              <ZoneCard key={name} zoneName={name} data={data}
                        selected={selectedZone === name}
                        onClick={setSelectedZone} />
            ))}
          </div>
        </div>
      </div>

      {/* MIDDLE — Chart + Explain */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]
                      border-b border-[#1E2E1E]"
           style={{ height: "220px" }}>
        <div className="p-4 border-r border-[#1E2E1E]">
          <ForecastChart selectedZone={selectedZone} zoneData={selectedData} />
        </div>
        <ExplainPanel explanation={latestExplanation} zone={selectedZone} />
      </div>

      {/* BOTTOM — Alert Log */}
      <AlertLog alerts={alerts} loading={alertLoading} />
    </div>
  );
}
```

---

## .env

```bash
VITE_API_URL=http://localhost:8000/api
```

---

## Run

```bash
npm run dev      # http://localhost:5173
npm run build    # production build to /dist
```

---

## UX Rules — Non-Negotiable

**1 — Numbers are the hero.**
AQI values are 4xl DM Mono with color-matched glow. Raw, unrounded.
They look like instrument readings, not UI labels.

**2 — Map is always visible.**
On every screen size, the map is the dominant element. It's what
makes the system feel real rather than theoretical.

**3 — Alert state is felt, not just colored.**
When a zone crosses AQI 200: the card gets a pulsing ring,
the map marker grows and glows, the ExplainPanel activates,
the AlertLog shows a new entry. The UI is in a different mode.

**4 — ExplainText types itself.**
18ms per character. The typewriter effect makes a cached LLM
response feel live. This is your most memorable interface moment.
Do not skip this.

**5 — Every state is designed.**
Empty AlertLog. Loading skeletons. Offline TopBar. Map before
data loads. Every state is handled so no judge ever sees
a blank panel or a JS error.

**6 — No rounded corners on primary surfaces.**
Hard edges are intentional. They say "instrument," not "app."
Use `rounded-sm` maximum on badges only.

---

## The Demo in 90 Seconds

```
0–15s  "Every AQI system shows you now.
        AirGuardian shows you 6 hours from now."

15–35s  Show map. Sports Ground is RED.
        "Predicted AQI 287 at 6 AM tomorrow."

35–55s  Click Sports Ground.
        ExplainPanel types the AI paragraph live.
        "This is why. Generated automatically."

55–70s  Phone buzzes.
        "That WhatsApp just fired on its own.
        No one pressed anything."

70–90s  "Free public data. No hardware.
        Deployable on any campus in India today.
        AirGuardian — 6 hours before."

        Stop talking.
```

---

*AirGuardian AI Frontend · React + Vite + Leaflet + Recharts + Framer Motion*
*AMD Slingshot 2025 · Sustainable AI & Green Tech*
