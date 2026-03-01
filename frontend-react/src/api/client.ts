/* ── AirGuardian AI — API Client ── */

import axios from "axios";
import type { ZoneMap, AlertEntry, HealthStatus } from "../types";

const api = axios.create({ baseURL: "/api", timeout: 15_000 });

/** Fetch all zone predictions (IDW-interpolated) */
export async function fetchZones(): Promise<ZoneMap> {
  const { data } = await api.get<ZoneMap>("/zones");
  return data;
}

/** Fetch prediction for a single zone */
export async function fetchPrediction(zone: string) {
  const { data } = await api.get("/predict", { params: { zone } });
  return data;
}

/** Fetch recent alert history */
export async function fetchAlertHistory(limit = 20): Promise<AlertEntry[]> {
  const { data } = await api.get<AlertEntry[]>("/alerts/history", { params: { limit } });
  return data;
}

/** Fetch system health */
export async function fetchHealth(): Promise<HealthStatus> {
  const { data } = await api.get<HealthStatus>("/health");
  return data;
}

/** Manually trigger an alert for a zone */
export async function triggerAlert(zone: string) {
  const { data } = await api.post("/alert", { zone });
  return data;
}
