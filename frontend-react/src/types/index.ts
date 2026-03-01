/* ── AirGuardian AI — Shared Types ── */

export interface ZoneData {
  predicted_aqi: number;
  severity: string;
  lat: number;
  lon: number;
  features?: {
    wind_speed?: number;
    boundary_layer_height?: number;
    humidity?: number;
    temperature?: number;
    aqi_trend?: string;
  };
  explanation?: string;
  timestamp?: string;
}

export type ZoneMap = Record<string, ZoneData>;

export interface AlertEntry {
  id?: number;
  zone: string;
  predicted_aqi: number;
  severity: string;
  explanation: string;
  timestamp: string;
  email_sent?: boolean;
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  scheduler_running: boolean;
  next_prediction_at: string | null;
  email_configured: boolean;
  groq_configured: boolean;
  alert_recipient: string;
  notification_mode: string;
  service: string;
}

export type SeverityLevel =
  | "Good"
  | "Satisfactory"
  | "Moderate"
  | "Poor"
  | "Very Poor"
  | "Severe";

/** Maps severity → tailwind-friendly colour tokens */
export const SEVERITY_COLORS: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  Good:         { bg: "bg-emerald-50",  text: "text-emerald-700",  ring: "ring-emerald-200", dot: "#22c55e" },
  Satisfactory: { bg: "bg-green-50",    text: "text-green-700",    ring: "ring-green-200",   dot: "#16a34a" },
  Moderate:     { bg: "bg-yellow-50",   text: "text-yellow-700",   ring: "ring-yellow-200",  dot: "#eab308" },
  Poor:         { bg: "bg-orange-50",   text: "text-orange-700",   ring: "ring-orange-200",  dot: "#f97316" },
  "Very Poor":  { bg: "bg-red-50",      text: "text-red-700",      ring: "ring-red-200",     dot: "#ef4444" },
  Severe:       { bg: "bg-rose-50",     text: "text-rose-700",     ring: "ring-rose-200",    dot: "#e11d48" },
};

export function getSeverityColor(severity: string) {
  return SEVERITY_COLORS[severity] ?? SEVERITY_COLORS["Moderate"];
}
