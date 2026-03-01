/* ── ExplainPanel — AI explanation with typewriter animation ── */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AlertEntry } from "../../types";

interface Props {
  selectedZone: string | null;
  alerts: AlertEntry[];
}

/** Typewriter hook — streams text character by character */
function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return displayed;
}

export default function ExplainPanel({ selectedZone, alerts }: Props) {
  const explanation = useMemo(() => {
    if (!selectedZone || !alerts.length) return null;
    return alerts.find((a) => a.zone === selectedZone)?.explanation ?? null;
  }, [selectedZone, alerts]);

  const displayed = useTypewriter(explanation ?? "", 14);

  return (
    <div className="h-full flex flex-col px-5 py-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full"
          style={{ background: "var(--color-accent)" }}
        />
        <span
          className="text-[12px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-display)" }}
        >
          AI Analysis
        </span>
        {selectedZone && (
          <span
            className="text-[11px] px-2 py-0.5 rounded-full ml-auto"
            style={{
              background: "var(--color-accent-light)",
              color: "var(--color-accent)",
              fontFamily: "var(--font-body)",
            }}
          >
            {selectedZone}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {explanation ? (
            <motion.p
              key={selectedZone}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}
            >
              {displayed}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="inline-block ml-0.5 w-[2px] h-3.5 align-text-bottom rounded-full"
                style={{ background: "var(--color-accent)" }}
              />
            </motion.p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-3 py-8"
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
                  strokeLinecap="round"
                >
                  <path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4z" />
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                </svg>
              </div>
              <p
                className="text-xs text-center"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}
              >
                {selectedZone
                  ? "No AI explanation available yet."
                  : "Select a zone to view AI analysis."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
