/* ── useAlertHistory — polls /api/alerts/history every 60 s ── */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchAlertHistory } from "../api/client";
import type { AlertEntry } from "../types";

const POLL_MS = 60_000;

/** Demo alerts shown when backend is offline */
const DEMO_ALERTS: AlertEntry[] = [
  {
    id: 1,
    zone: "Sports Ground",
    predicted_aqi: 287,
    severity: "Very Poor",
    explanation: "AirGuardian has predicted AQI 287 (Very Poor) at the Sports Ground between 6–9 AM. Tonight\u2019s northwest wind at 18 km/h will carry emissions from the Butibori industrial corridor while the atmospheric boundary layer compresses to 380 m, trapping pollutants near ground level. Recommended action: Reschedule morning PT to the indoor gymnasium and send a mask advisory before 6 AM.",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    zone: "Parking Area",
    predicted_aqi: 241,
    severity: "Very Poor",
    explanation: "AirGuardian predicts AQI 241 at the Parking Area in the next 6 hours driven by vehicle exhaust accumulation under a low boundary layer of 420 m. Restrict non-essential vehicle idling and advise staff to use alternate entry routes.",
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    zone: "Hostel A",
    predicted_aqi: 198,
    severity: "Poor",
    explanation: "Hostel A is forecast at AQI 198 (Poor) due to proximity to the Sports Ground pollution plume. Students with respiratory conditions should stay indoors and keep windows closed until AQI drops below 150.",
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    zone: "Sports Ground",
    predicted_aqi: 312,
    severity: "Severe",
    explanation: "Earlier severe spike of AQI 312 at Sports Ground was triggered by combined industrial emissions and near-zero boundary layer height at dawn. All outdoor activities were suspended and campus-wide alert was broadcast.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export function useAlertHistory() {
  const [alerts, setAlerts]   = useState<AlertEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [isDemo, setIsDemo]   = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAlertHistory(30);
      if (data.length === 0) {
        setAlerts(DEMO_ALERTS);
        setIsDemo(true);
      } else {
        setAlerts(data);
        setIsDemo(false);
      }
      setError(null);
    } catch {
      setAlerts(DEMO_ALERTS);
      setIsDemo(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    timer.current = setInterval(load, POLL_MS);
    return () => clearInterval(timer.current);
  }, [load]);

  return { alerts, loading, error, isDemo, refresh: load };
}
