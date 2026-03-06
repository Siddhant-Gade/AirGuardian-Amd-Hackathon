/* ── useZones — polls /api/zones every 30 s ── */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchZones } from "../api/client";
import type { ZoneMap } from "../types";

const POLL_MS = 30_000;

export function useZones() {
  const [zones, setZones]             = useState<ZoneMap | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchZones();
      setZones(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch zones";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    timer.current = setInterval(load, POLL_MS);
    return () => clearInterval(timer.current);
  }, [load]);

  return { zones, loading, error, lastUpdated, refresh: load };
}
