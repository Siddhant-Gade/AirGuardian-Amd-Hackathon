/* ── AlertLog — Polished scrolling operations log ── */

import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import type { AlertEntry } from "../../types";
import { getSeverityColor } from "../../types";

interface Props {
  alerts: AlertEntry[];
  loading: boolean;
}

export default function AlertLog({ alerts, loading }: Props) {
  return (
    <div className="flex flex-col" style={{ maxHeight: "420px" }}>
      {/* Header row */}
      <div className="flex items-center gap-2 px-5 py-3">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ color: "var(--color-muted)" }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span
          className="text-[12px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-display)" }}
        >
          Alert Log
        </span>
        <span
          className="ml-auto text-[11px] px-2.5 py-1 rounded-full font-semibold"
          style={{
            background: "var(--color-accent-light)",
            color: "var(--color-accent)",
          }}
        >
          {alerts.length}
        </span>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {loading && !alerts.length ? (
          <div className="space-y-2 pt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--color-base)" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-muted)"
                strokeWidth="1.5"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              No alerts logged yet.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {alerts.map((alert, i) => {
              const colors = getSeverityColor(alert.severity);
              let ts = "";
              try {
                ts = format(parseISO(alert.timestamp), "dd MMM HH:mm");
              } catch {
                ts = alert.timestamp ?? "";
              }

              return (
                <motion.div
                  key={alert.id ?? `${alert.zone}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{
                    duration: 0.35,
                    delay: i * 0.03,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200"
                  style={{
                    background: "var(--color-base)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {/* Severity indicator */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${colors.dot}12` }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: colors.dot }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[13px] font-semibold truncate"
                        style={{
                          color: "var(--color-text)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {alert.zone}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-px rounded-full ${colors.bg} ${colors.text}`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    {alert.explanation && (
                      <p
                        className="text-[11px] mt-0.5 truncate"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {alert.explanation}
                      </p>
                    )}
                  </div>

                  {/* AQI + time */}
                  <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                    <span
                      className="text-base font-bold"
                      style={{ fontFamily: "var(--font-display)", color: colors.dot }}
                    >
                      {Math.round(alert.predicted_aqi)}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>
                      {ts}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
