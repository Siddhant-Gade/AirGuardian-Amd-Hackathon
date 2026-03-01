/* ── ZoneCard — horizontal list row ── */

import { motion } from "framer-motion";
import type { ZoneData } from "../../types";
import { getSeverityColor } from "../../types";

interface Props {
  name: string;
  data: ZoneData;
  selected: boolean;
  index: number;
  onSelect: (name: string) => void;
}

export default function ZoneCard({ name, data, selected, index, onSelect }: Props) {
  const colors = getSeverityColor(data.severity);
  const aqi = Math.round(data.predicted_aqi);

  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(name)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 12px",
        borderRadius: 8,
        border: selected ? `1.5px solid ${colors.dot}` : "1.5px solid transparent",
        background: selected ? `${colors.dot}0d` : "var(--color-surface-2)",
        cursor: "pointer",
        outline: "none",
        textAlign: "left",
        transition: "background 0.15s, border 0.15s",
      }}
    >
      {/* Color bar */}
      <div
        style={{
          width: 3,
          alignSelf: "stretch",
          borderRadius: 99,
          background: colors.dot,
          flexShrink: 0,
        }}
      />

      {/* Name + badge */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.2,
            marginBottom: 3,
          }}
          title={name}
        >
          {name}
        </div>
        <span
          className={`${colors.bg} ${colors.text}`}
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "2px 6px",
            borderRadius: 4,
            display: "inline-block",
          }}
        >
          {data.severity}
        </span>
      </div>

      {/* AQI */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: colors.dot,
            display: "block",
          }}
        >
          {aqi}
        </span>
        <span style={{ fontSize: 10, color: "var(--color-faint)", fontWeight: 600, letterSpacing: "0.06em" }}>
          AQI
        </span>
      </div>
    </motion.button>
  );
}
