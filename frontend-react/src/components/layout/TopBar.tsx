/* ── TopBar — Clean editorial header ── */

import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import HamburgerMenu from "./HamburgerMenu";
import { useTheme } from "../../hooks/useTheme";

interface Props {
  lastUpdated: Date | null;
}

export default function TopBar({ lastUpdated }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [theme, toggleTheme] = useTheme();

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 px-4 lg:px-6"
      style={{
        height: "52px",
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        zIndex: 1100,
      }}
    >
      <HamburgerMenu />

      {!isHome && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center"
          style={{
            width: 28, height: 28,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-2)",
          }}
          aria-label="Go back"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 no-underline" style={{ marginRight: 4 }}>
        <div
          style={{
            width: 28, height: 28,
            borderRadius: "var(--radius-sm)",
            background: "var(--color-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
            <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
          </svg>
        </div>
        <span
          className="hidden sm:block"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--color-text)",
            letterSpacing: "-0.01em",
          }}
        >
          AirGuardian
        </span>
      </Link>

      {/* Page title pill */}
      <div
        style={{
          height: 22,
          width: 1,
          background: "var(--color-border)",
          margin: "0 2px",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--color-muted)",
        }}
        className="hidden sm:block"
      >
        Nagpur Air Quality
      </span>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {lastUpdated && (
          <span
            style={{
              fontSize: 12,
              color: "var(--color-muted)",
              display: "none",
            }}
            className="md:block"
          >
            {format(lastUpdated, "HH:mm:ss")}
          </span>
        )}

        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="flex items-center gap-1.5"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--color-green)",
            background: "rgba(22,163,74,0.08)",
            padding: "3px 10px 3px 8px",
            borderRadius: 99,
            border: "1px solid rgba(22,163,74,0.15)",
          }}
        >
          <span
            style={{
              width: 6, height: 6,
              borderRadius: "50%",
              background: "var(--color-green)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          Live
        </motion.div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            width: 30, height: 30,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 14, flexShrink: 0,
          }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <Link
          to="/"
          className="flex items-center justify-center no-underline"
          style={{
            width: 30, height: 30,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            background: isHome ? "var(--color-accent-light)" : "var(--color-surface-2)",
          }}
          aria-label="Home"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isHome ? "var(--color-accent)" : "var(--color-muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
