/* ── useAlertHistory — polls /api/alerts/history every 60 s ── */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchAlertHistory } from "../api/client";
import type { AlertEntry } from "../types";

const POLL_MS = 60_000;

export function useAlertHistory() {
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAlertHistory(30);
      setAlerts(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch alerts";
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

  return { alerts, loading, error, refresh: load };
}
