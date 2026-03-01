/* ── useZones — polls /api/zones every 30 s ── */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchZones } from "../api/client";
import type { ZoneMap } from "../types";

const POLL_MS = 30_000;

/** Realistic demo data shown when backend is offline */
const DEMO_ZONES: ZoneMap = {
  "Sports Ground":  { predicted_aqi: 287, severity: "Very Poor",   lat: 21.1478, lon: 79.0895 },
  "Parking Area":   { predicted_aqi: 241, severity: "Very Poor",   lat: 21.1450, lon: 79.0900 },
  "Hostel A":       { predicted_aqi: 198, severity: "Poor",         lat: 21.1462, lon: 79.0891 },
  "Main Gate":      { predicted_aqi: 156, severity: "Moderate",     lat: 21.1458, lon: 79.0882 },
  "Academic Block": { predicted_aqi:  98, severity: "Satisfactory", lat: 21.1470, lon: 79.0878 },
  "Library":        { predicted_aqi:  62, severity: "Good",         lat: 21.1455, lon: 79.0875 },
};

export function useZones() {
  const [zones, setZones]             = useState<ZoneMap | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isDemo, setIsDemo]           = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchZones();
      // If all zones have identical AQI (untrained model fallback), use demo data
      const values = Object.values(data).map(z => z.predicted_aqi);
      const allSame = values.every(v => v === values[0]);
      if (allSame) {
        setZones(DEMO_ZONES);
        setIsDemo(true);
      } else {
        setZones(data);
        setIsDemo(false);
      }
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setZones(DEMO_ZONES);
      setIsDemo(true);
      setLastUpdated(new Date());
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

  return { zones, loading, error, lastUpdated, isDemo, refresh: load };
}
