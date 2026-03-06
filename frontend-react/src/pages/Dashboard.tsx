/* ── Dashboard ── */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import TopBar from "../components/layout/TopBar";
import CampusMap from "../components/map/CampusMap";
import ZoneCard from "../components/zones/ZoneCard";
import ForecastChart from "../components/prediction/ForecastChart";
import ExplainPanel from "../components/explain/ExplainPanel";
import AlertLog from "../components/alerts/AlertLog";
import { useZones } from "../hooks/useZones";
import { useAlertHistory } from "../hooks/useAlertHistory";
import type { ZoneData } from "../types";
import { getSeverityColor } from "../types";

/* ── Stat card ── */
function StatCard({
  label, value, sub, color, delay = 0, accent,
}: {
  label: string; value: string; sub?: string;
  color?: string; delay?: number; accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "var(--shadow-xs)",
        borderTop: `3px solid ${accent || "var(--color-accent)"}`,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-muted)" }}>
        {label}
      </span>
      <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, color: color || "var(--color-text)" }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: 14, color: "var(--color-muted)" }}>{sub}</span>}
    </motion.div>
  );
}

/* ── Panel header ── */
function PanelHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "13px 16px",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-2)" }}>
        {title}
      </span>
      {action}
    </div>
  );
}

export default function Dashboard() {
  const { zones, loading: zonesLoading, lastUpdated } = useZones();
  const { alerts, loading: alertsLoading } = useAlertHistory();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const zoneEntries = zones ? Object.entries(zones) : [];
  const selectedZoneData: ZoneData | null =
    selectedZone && zones ? zones[selectedZone] ?? null : null;

  /* ── Compute summary stats ── */
  const stats = useMemo(() => {
    if (!zoneEntries.length)
      return { avgAqi: 0, worstZone: "—", worstAqi: 0, worstSeverity: "Moderate" };
    let total = 0;
    let worst = { name: "", aqi: 0, severity: "Moderate" };
    for (const [name, data] of zoneEntries) {
      total += data.predicted_aqi;
      if (data.predicted_aqi > worst.aqi) {
        worst = { name, aqi: data.predicted_aqi, severity: data.severity };
      }
    }
    return {
      avgAqi: Math.round(total / zoneEntries.length),
      worstZone: worst.name || "—",
      worstAqi: Math.round(worst.aqi),
      worstSeverity: worst.severity,
    };
  }, [zoneEntries]);

  const worstColors = getSeverityColor(stats.worstSeverity);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-base)" }}>
      <TopBar lastUpdated={lastUpdated} />

      <main
        style={{
          flex: 1,
          padding: "20px 20px 32px",
          maxWidth: 1520,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >


        {/* ── Page heading ── */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 4 }}>
          <div>
            <h1 style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)", lineHeight: 1.1 }}>
              Air Quality Dashboard
            </h1>
            <p style={{ fontSize: 15, color: "var(--color-muted)", marginTop: 4 }}>
              Real-time monitoring across {zoneEntries.length} city zones
            </p>
          </div>
          {lastUpdated && (
            <span style={{ fontSize: 14, color: "var(--color-faint)" }}>
              Refreshed {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <StatCard label="Zones Monitored" value={zoneEntries.length.toString()} sub="Active stations" delay={0} accent="var(--color-accent)" />
          <StatCard label="Average AQI" value={stats.avgAqi ? stats.avgAqi.toString() : "—"} sub="Across all zones" delay={0.04} accent="#2563eb" />
          <StatCard label="Highest Risk Zone" value={stats.worstZone} sub={stats.worstAqi ? `AQI ${stats.worstAqi} · ${stats.worstSeverity}` : ""} color={worstColors.dot} delay={0.08} accent={worstColors.dot} />
          <StatCard label="Alerts" value={alerts.length.toString()} sub="Last 30 entries" delay={0.12} accent="#d97706" />
        </div>

        {/* ── Map + Zones row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14 }}>

          {/* Map */}
          <motion.div
            id="map"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <PanelHeader title="Nagpur City Map" />
            <div style={{ height: "clamp(320px, 44vh, 480px)" }}>
              {zonesLoading && !zones ? (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="skeleton" style={{ height: 14, width: 200 }} />
                    <div className="skeleton" style={{ height: 14, width: 160 }} />
                    <div className="skeleton" style={{ height: 14, width: 120 }} />
                  </div>
                </div>
              ) : (
                <CampusMap zones={zones} selectedZone={selectedZone} onSelectZone={setSelectedZone} />
              )}
            </div>
          </motion.div>

          {/* Zone list */}
          <motion.div
            id="zones"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              boxShadow: "var(--shadow-xs)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <PanelHeader
              title="Zone Overview"
              action={
                selectedZone ? (
                  <button
                    onClick={() => setSelectedZone(null)}
                    style={{
                      fontSize: 13, color: "var(--color-muted)",
                      background: "none", border: "none",
                      cursor: "pointer", textDecoration: "underline",
                    }}
                  >
                    Clear
                  </button>
                ) : undefined
              }
            />
            <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
              {zonesLoading && !zones ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 64, borderRadius: 8 }} />
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {zoneEntries.map(([name, data], index) => (
                    <ZoneCard
                      key={name} name={name} data={data}
                      selected={selectedZone === name}
                      index={index} onSelect={setSelectedZone}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Forecast + Analysis row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14 }}>

          <motion.div
            id="forecast"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <PanelHeader title={selectedZone ? `Forecast · ${selectedZone}` : "6-Hour AQI Forecast"} />
            <div style={{ height: 260 }}>
              <ForecastChart selectedZone={selectedZone} zoneData={selectedZoneData} />
            </div>
          </motion.div>

          <motion.div
            id="analysis"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              boxShadow: "var(--shadow-xs)",
              minHeight: 260,
            }}
          >
            <ExplainPanel selectedZone={selectedZone} alerts={alerts} />
          </motion.div>
        </div>

        {/* ── Alert log ── */}
        <motion.div
          id="alerts"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <AlertLog alerts={alerts} loading={alertsLoading} />
        </motion.div>

      </main>
    </div>
  );
}
