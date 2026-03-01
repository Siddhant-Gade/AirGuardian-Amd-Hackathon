/* ── ForecastChart — AQI trend area chart with animated entrance ── */

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ZoneData } from "../../types";
import { getSeverityColor } from "../../types";

interface Props {
  selectedZone: string | null;
  zoneData: ZoneData | null;
}

/** Generate mock forecast points (the backend returns single prediction;
 *  we simulate a 6-hour trend for demonstration). */
function buildChartData(zoneData: ZoneData) {
  const base = zoneData.predicted_aqi;
  return Array.from({ length: 7 }, (_, i) => ({
    hour: `+${i}h`,
    aqi: Math.round(base + (Math.random() - 0.5) * 30),
  }));
}

export default function ForecastChart({ selectedZone, zoneData }: Props) {
  if (!selectedZone || !zoneData) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-3"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--color-accent-light)" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Select a zone to view forecast
        </p>
      </div>
    );
  }

  const data = buildChartData(zoneData);
  const colors = getSeverityColor(zoneData.severity);

  return (
    <motion.div
      key={selectedZone}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full flex flex-col px-4 py-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
        >
          {selectedZone}
        </span>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
        >
          {zoneData.severity}
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.dot} stopOpacity={0.3} />
                <stop offset="100%" stopColor={colors.dot} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke={colors.dot}
              strokeWidth={2}
              fill="url(#aqiGrad)"
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
