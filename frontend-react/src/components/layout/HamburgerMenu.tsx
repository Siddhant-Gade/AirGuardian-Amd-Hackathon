/* ═══════════════════════════════════════════════════════════════
   HamburgerMenu — Polished slide-out navigation drawer
   ═══════════════════════════════════════════════════════════════ */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

/* ── Navigation links ── */
const NAV_LINKS = [
  {
    label: "Home",
    path: "/",
    desc: "Landing page",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Dashboard",
    path: "/dashboard",
    desc: "Command center",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
];

/* ── Quick-jump sections (SVG icons for consistency) ── */
const SECTIONS = [
  {
    label: "Air Quality Map",
    id: "map",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="10" r="3" />
        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7Z" />
      </svg>
    ),
  },
  {
    label: "Zone Overview",
    id: "zones",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "AQI Forecast",
    id: "forecast",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: "AI Analysis",
    id: "analysis",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4z" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
  {
    label: "Alert Log",
    id: "alerts",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [theme] = useTheme();

  /* ── Theme-aware colour palette ── */
  const dark = theme === "dark";
  const c = {
    drawerBg:       dark ? "#0d1117" : "#ffffff",
    drawerBorder:   dark ? "#30363d" : "#e2e8f0",
    headerBorder:   dark ? "#21262d" : "#f1f5f9",
    divider:        dark ? "#21262d" : "#f1f5f9",
    footerBorder:   dark ? "#21262d" : "#f1f5f9",
    btnBg:          dark ? "#161b22" : "#ffffff",
    btnBorder:      dark ? "#30363d" : "#e2e8f0",
    barColor:       dark ? "#e6edf3" : "#0f172a",
    closeBtnBg:     dark ? "#21262d" : "#f8fafc",
    closeBtnBorder: dark ? "#30363d" : "#e2e8f0",
    brandTitle:     dark ? "#e6edf3" : "#0f172a",
    navLinkColor:   dark ? "#e6edf3" : "#0f172a",
    sectionLinkColor: dark ? "#adbac7" : "#334155",
    iconBg:         dark ? "#21262d" : "#f8fafc",
    iconBorder:     dark ? "#30363d" : "#f1f5f9",
    iconColor:      dark ? "#8b949e" : "#64748b",
    hoverBg:        dark ? "#161b22" : "#f8fafc",
    escBg:          dark ? "#21262d" : "#f8fafc",
    escBorder:      dark ? "#30363d" : "#e2e8f0",
    escColor:       dark ? "#8b949e" : "#94a3b8",
    footerText:     dark ? "#8b949e" : "#94a3b8",
    shadowColor:    dark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)",
    backdropBg:     dark ? "rgba(0,0,0,0.7)"  : "rgba(15, 23, 42, 0.5)",
  };

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ── Hamburger toggle ── */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Toggle navigation menu"
        style={{
          position: "relative",
          zIndex: 2200,
          width: 40,
          height: 40,
          display: open ? "none" : "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          borderRadius: 12,
          background: c.btnBg,
          border: `1.5px solid ${c.btnBorder}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          cursor: "pointer",
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        {[
          { open: { rotate: 45, y: 8.5 }, closed: { rotate: 0, y: 0 } },
          { open: { opacity: 0, scaleX: 0 }, closed: { opacity: 1, scaleX: 1 } },
          { open: { rotate: -45, y: -8.5 }, closed: { rotate: 0, y: 0 } },
        ].map((anim, i) => (
          <motion.span
            key={i}
            animate={open ? anim.open : anim.closed}
            transition={{ duration: i === 1 ? 0.2 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "block",
              width: 20,
              height: 2.5,
              borderRadius: 2,
              transformOrigin: "center",
              background: c.barColor,
              transition: "background 0.3s",
            }}
          />
        ))}
      </motion.button>

      {/* ── Overlay + Drawer — portalled to body to escape nav's backdrop-filter stacking context ── */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 2000,
                background: c.backdropBg,
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
            />

            {/* Drawer panel */}
            <motion.nav
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 2100,
                width: 300,
                display: "flex",
                flexDirection: "column",
                background: c.drawerBg,
                borderRight: `1px solid ${c.drawerBorder}`,
                boxShadow: `12px 0 48px ${c.shadowColor}`,
                transition: "background 0.3s, border-color 0.3s",
              }}
            >
              {/* ━━ Header ━━ */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "20px 20px 16px",
                  borderBottom: `1px solid ${c.headerBorder}`,
                  gap: 12,
                }}
              >
                {/* Brand icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2v6m0 12v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                </div>

                {/* Brand text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: "var(--font-display, 'Outfit', sans-serif)",
                      color: c.brandTitle,
                      lineHeight: 1.2,
                    }}
                  >
                    AirGuardian AI
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    Air Quality Monitor
                  </div>
                </div>

                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  style={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: c.closeBtnBg,
                    border: `1px solid ${c.closeBtnBorder}`,
                    cursor: "pointer",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dark ? "#8b949e" : "#64748b"} strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>

              </div>

              {/* ━━ Scrollable body ━━ */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px" }}>
                {/* Section label: Navigate */}
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.16em",
                    color: "#94a3b8",
                    padding: "0 10px 10px",
                  }}
                >
                  Navigate
                </div>

                {/* Page links */}
                {NAV_LINKS.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 10px",
                        marginBottom: 4,
                        borderRadius: 12,
                        textDecoration: "none",
                        background: active
                          ? "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))"
                          : "transparent",
                        border: active
                          ? "1px solid rgba(99,102,241,0.12)"
                          : "1px solid transparent",
                        color: active ? "#6366f1" : c.navLinkColor,
                        transition: "background 0.2s, border-color 0.2s",
                      }}
                    >
                      {/* Icon box — fixed size, perfectly centered */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          minWidth: 36,
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: active ? "rgba(99,102,241,0.1)" : c.iconBg,
                          border: active ? "none" : `1px solid ${c.iconBorder}`,
                          color: active ? "#6366f1" : c.iconColor,
                        }}
                      >
                        {item.icon}
                      </div>

                      {/* Label + desc */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            fontFamily: "var(--font-display, 'Outfit', sans-serif)",
                            lineHeight: 1.3,
                          }}
                        >
                          {item.label}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                          {item.desc}
                        </div>
                      </div>

                      {/* Active indicator dot */}
                      {active && (
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "#6366f1",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}

                {/* Divider */}
                <div
                  style={{
                    height: 1,
                    background: "#f1f5f9",
                    margin: "14px 10px 14px",
                  }}
                />

                {/* Section label: Quick Jump */}
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.16em",
                    color: "#94a3b8",
                    padding: "0 10px 10px",
                  }}
                >
                  Quick Jump
                </div>

                {/* Section links */}
                {SECTIONS.map((sec) => (
                  <Link
                    key={sec.id}
                    to={`/dashboard#${sec.id}`}
                    onClick={() => {
                      setOpen(false);
                      if (location.pathname === "/dashboard") {
                        setTimeout(() => {
                          document.getElementById(sec.id)?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }, 100);
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "9px 10px",
                      marginBottom: 2,
                      borderRadius: 10,
                      textDecoration: "none",
                      color: c.sectionLinkColor,
                      transition: "background 0.15s, color 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = c.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Icon box — consistent with nav icons */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: c.iconBg,
                        border: `1px solid ${c.iconBorder}`,
                        color: c.iconColor,
                      }}
                    >
                      {sec.icon}
                    </div>

                    {/* Label */}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                        flex: 1,
                      }}
                    >
                      {sec.label}
                    </span>

                    {/* Chevron */}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      style={{ flexShrink: 0 }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                ))}
              </div>

              {/* ━━ Footer ━━ */}
              <div
                style={{
                  padding: "14px 20px",
                  borderTop: `1px solid ${c.footerBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: 10, color: c.footerText, lineHeight: 1.6 }}>
                  AirGuardian AI v1.0
                  <br />
                  AMD Slingshot 2025
                </div>
                <div
                  style={{
                    fontSize: 10,
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: c.escBg,
                    color: c.escColor,
                    border: `1px solid ${c.escBorder}`,
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                >
                  ESC
                </div>
              </div>
            </motion.nav>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
