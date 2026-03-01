/* ═══════════════════════════════════════════════════════════════
   Home — AirGuardian AI Landing Page
   IQAir-inspired professional UI · Smooth scroll transitions
   Glass-morphism · AQI color system · Scroll-linked nav
   ═══════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import styles from "./HomePage.module.css";
import HamburgerMenu from "../components/layout/HamburgerMenu";
import { useTheme } from "../hooks/useTheme";

/* ── Section nav items ── */
const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "pipeline", label: "Pipeline" },
  { id: "model", label: "ML Model" },
  { id: "features", label: "Features" },
  { id: "tech", label: "Tech Stack" },
];

/* ── AQI Legend items (IQAir-style) ── */
const AQI_LEVELS = [
  { label: "Good", cls: "aqiGood" },
  { label: "Moderate", cls: "aqiModerate" },
  { label: "Unhealthy for sensitive", cls: "aqiSensitive" },
  { label: "Unhealthy", cls: "aqiUnhealthy" },
  { label: "Very unhealthy", cls: "aqiVeryUnhealthy" },
  { label: "Hazardous", cls: "aqiHazardous" },
] as const;

/* ── Smooth bezier for all animations ── */
const smoothEase = [0.22, 1, 0.36, 1] as const;

/* ── Reusable animated-section wrapper ── */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: smoothEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger container ── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/* ── Active section detection hook ── */
function useActiveSection() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return active;
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const activeSection = useActiveSection();
  const pageRef = useRef<HTMLDivElement>(null);
  const [theme, toggleTheme] = useTheme();

  /* ── Scroll progress ── */
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  /* ── Nav collapse on scroll ── */
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 90);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Auto-dismiss splash ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      /* Switch body background from splash-black to app-light */
      document.documentElement.classList.add("loaded");
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.page} ref={pageRef}>
      {/* ── Scroll Progress Bar ── */}
      <motion.div className={styles.scrollProgress} style={{ width: progressWidth }} />

      {/* ── Netflix-style Splash ── */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className={styles.splash}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: smoothEase }}
          >
            <div className={styles.splashBlob}>
              <div className={styles.splashGlow} />
              <spline-viewer
                url="https://prod.spline.design/3frQ4VuBSekeqU8q/scene.splinecode"
                loading-anim-type="none"
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                } as React.CSSProperties}
              />
              {/* Watermark cover — matches splash bg */}
              <div className={styles.splashWatermarkCover} />
            </div>

            <motion.div
              className={styles.splashBrand}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 1, ease: smoothEase }}
            >
              <motion.span
                className={styles.splashDot}
                animate={{ opacity: [0, 1, 0.4, 1] }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
              <motion.h1
                className={styles.splashTitle}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1, ease: smoothEase }}
              >
                <span className={styles.splashGreen}>Air</span>Guardian
              </motion.h1>
              <motion.p
                className={styles.splashSub}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.8 }}
              >
                Predict · Explain · Act
              </motion.p>
            </motion.div>

            <motion.button
              className={styles.splashSkip}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              onClick={() => {
                setShowSplash(false);
                document.documentElement.classList.add("loaded");
              }}
            >
              Skip →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sticky Nav — IQAir-style ── */}
      <AnimatePresence mode="wait">
        {!navScrolled ? (
          /* ── Full-width nav (not scrolled) ── */
          <motion.nav
            key="fullnav"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.45, ease: smoothEase }}
            className={styles.nav}
          >
            <HamburgerMenu />
            <div className={styles.navBrand}>
              <motion.span
                className={styles.navDot}
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className={styles.navLogo}>AirGuardian</span>
            </div>
            <div className={styles.navLinks}>
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  className={`${styles.navLink} ${activeSection === s.id ? styles.navLinkActive : ""}`}
                  onClick={() => scrollTo(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={styles.navThemeToggle}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <Link to="/dashboard" className={styles.navCta} style={{ textDecoration: "none" }}>
              Open Dashboard →
            </Link>
          </motion.nav>
        ) : (
          /* ── Collapsed floating pill (scrolled) ── */
          <motion.nav
            key="pillnav"
            initial={{ y: -24, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.4, ease: smoothEase }}
            className={styles.navPill}
          >
            {/* Brand */}
            <div
              className={styles.navPillBrand}
              onClick={() => scrollTo("hero")}
              title="Back to top"
            >
              <motion.span
                className={styles.navDot}
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className={styles.navPillLogoText}>AirGuardian</span>
            </div>

            <div className={styles.navPillSep} />

            {/* Section indicator dots */}
            <div className={styles.navPillDots}>
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  className={`${styles.navPillDot} ${activeSection === s.id ? styles.navPillDotActive : ""}`}
                  onClick={() => scrollTo(s.id)}
                  title={s.label}
                  aria-label={s.label}
                />
              ))}
            </div>

            <div className={styles.navPillSep} />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={styles.navThemeToggle}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {/* Dashboard icon CTA */}
            <Link
              to="/dashboard"
              className={styles.navPillCta}
              title="Open Dashboard"
              style={{ textDecoration: "none" }}
            >
              →
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Hero — Full-height with mesh gradient ── */}
      <section id="hero" className={styles.hero}>
        {/* Animated mesh gradient orbs */}
        <div className={styles.heroMesh}>
          <div className={styles.heroMeshOrb1} />
          <div className={styles.heroMeshOrb2} />
          <div className={styles.heroMeshOrb3} />
        </div>



        <motion.div
          className={styles.heroInner}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: smoothEase }}
        >
          {/* Live indicator */}
          <motion.div
            className={styles.liveIndicator}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <span className={styles.liveDot} />
            <span className={styles.liveText}>Air Quality Monitoring Active</span>
            <span className={styles.liveTime}>Real-time</span>
          </motion.div>

          <motion.span
            className={styles.heroBadge}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55, ease: smoothEase }}
          >
            AMD Slingshot 2026 · Sustainable AI
          </motion.span>

          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: smoothEase }}
          >
            <span className={styles.heroGreen}>Air</span>Guardian AI
          </motion.h1>

          <motion.p
            className={styles.heroSub}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: smoothEase }}
          >
            Predicts dangerous AQI spikes <strong>6 hours</strong> before they arrive,
            explains why in plain English, and automatically alerts the right people —
            before anyone is exposed.
          </motion.p>

          <motion.div
            className={styles.heroBtns}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: smoothEase }}
          >
            <Link to="/dashboard" className={styles.heroPrimary} style={{ textDecoration: "none" }}>
              Open Live Dashboard
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <button className={styles.heroSecondary} onClick={() => scrollTo("overview")}>
              Learn More
            </button>
          </motion.div>

          {/* AQI Legend — IQAir-style severity bands */}
          <motion.div
            className={styles.aqiLegend}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6, ease: smoothEase }}
          >
            {AQI_LEVELS.map((level, i) => (
              <motion.span
                key={level.label}
                className={`${styles.aqiLegendItem} ${styles[level.cls]}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.06, duration: 0.4, ease: smoothEase }}
              >
                {level.label}
              </motion.span>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            className={styles.heroStats}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.65, ease: smoothEase }}
          >
            {[
              { val: "0", unit: "Hardware Required" },
              { val: "$0", unit: "Cloud Cost" },
              { val: "100%", unit: "Free Public Data" },
            ].map((s, i) => (
              <>
                {i > 0 && <div key={`div-${i}`} className={styles.heroStatDivider} />}
                <motion.div
                  key={s.unit}
                  className={styles.heroStat}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 + i * 0.12, duration: 0.5, ease: smoothEase }}
                >
                  <span className={styles.heroStatVal}>{s.val}</span>
                  <span className={styles.heroStatUnit}>{s.unit}</span>
                </motion.div>
              </>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── System Overview ── */}
      <section id="overview" className={styles.section}>
        <div className={styles.container}>
          <Reveal>
            <span className={styles.sectionTag}>System Overview</span>
            <h2 className={styles.sectionTitle}>Three Layers of Intelligence</h2>
            <p className={styles.sectionSub}>
              AirGuardian is a pure software AI system — no sensors, no paid APIs,
              entirely built on free public data.
            </p>
          </Reveal>

          <motion.div
            className={styles.layerGrid}
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                cls: styles.layerPurple,
                name: "Prediction",
                desc: "GRU neural network forecasts AQI 6 hours ahead using 24-hour lookback windows. Trained on CPCB + Open-Meteo data, achieves MAE < 20 AQI units.",
                tech: "PyTorch · pandas · GRU 64 units",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ),
                cls: styles.layerGreen,
                name: "Explanation",
                desc: "LLM (Llama 3.3 70B via Groq) converts predictions into plain English alerts for campus administrators. No jargon, just actionable insights.",
                tech: "Groq API · Llama 3.3 70B · Cache fallback",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                ),
                cls: styles.layerAmber,
                name: "Intervention",
                desc: "Auto-trigger WhatsApp alerts when AQI exceeds 200. Scheduler runs every 30 minutes, logging all predictions to SQLite.",
                tech: "Twilio · FastAPI · APScheduler",
              },
            ].map((layer) => (
              <motion.div key={layer.name} variants={fadeUp} className={styles.layerCard}>
                <div className={`${styles.layerIcon} ${layer.cls}`}>{layer.icon}</div>
                <h3 className={styles.layerName}>{layer.name}</h3>
                <p className={styles.layerDesc}>{layer.desc}</p>
                <div className={styles.layerTech}>{layer.tech}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section id="architecture" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <Reveal>
            <span className={styles.sectionTag}>Architecture</span>
            <h2 className={styles.sectionTitle}>End-to-End Pipeline</h2>
          </Reveal>

          <div className={styles.archFlow}>
            {[
              { step: "1", title: "Data Sources",    desc: "CPCB API (AQI) + Open-Meteo (Weather) + OpenAQ fallback",                 color: "#22c55e" },
              { step: "2", title: "Data Integration", desc: "Feature merger + IDW spatial interpolation for campus zones",             color: "#6366f1" },
              { step: "3", title: "ML Engine",        desc: "Data cleaning → Feature scaling → Sequence generation → GRU inference",  color: "#8b5cf6" },
              { step: "4", title: "FastAPI Backend",  desc: "REST endpoints for predictions, alerts, zone maps + health checks",       color: "#f59e0b" },
              { step: "5", title: "LLM Explainer",    desc: "Groq Llama 3.3 70B generates plain-English alert explanations",          color: "#ec4899" },
              { step: "6", title: "Alert & Frontend", desc: "Twilio WhatsApp alerts + React dashboard with live map & charts",        color: "#ef4444" },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className={styles.archStep}>
                  <div className={styles.archNum} style={{ background: item.color }}>{item.step}</div>
                  <div className={styles.archContent}>
                    <h4 className={styles.archTitle}>{item.title}</h4>
                    <p className={styles.archDesc}>{item.desc}</p>
                  </div>
                  {i < 5 && <div className={styles.archLine} />}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data Pipeline ── */}
      <section id="pipeline" className={styles.section}>
        <div className={styles.container}>
          <Reveal>
            <span className={styles.sectionTag}>Data Pipeline</span>
            <h2 className={styles.sectionTitle}>From Raw Data to Prediction</h2>
            <p className={styles.sectionSub}>AirGuardian is a pure software AI system — no sensors, no paid APIs, entirely built on free public data.</p>
          </Reveal>

          <motion.div
            className={styles.pipeGrid}
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {[
              {
                emoji: "📡", title: "CPCB AQI Data", subhead: "Primary Source",
                avatarBg: "#ede9fe", avatarColor: "#7c3aed",
                desc: "Historical AQI readings from India's Central Pollution Control Board — PM2.5, PM10, NO2 and AQI columns for Nagpur station, 2010–2023.",
                items: ["data.gov.in · Kaggle mirror", "CSV · hourly readings", "PM2.5 · PM10 · NO2 · AQI"],
                btnLabel: "View Dataset",
              },
              {
                emoji: "🌤️", title: "Open-Meteo Weather", subhead: "No API Key Required",
                avatarBg: "#dbeafe", avatarColor: "#2563eb",
                desc: "Free historical weather archive — temperature, humidity, wind speed and boundary layer height for Nagpur, no signup needed.",
                items: ["archive-api.open-meteo.com", "No key · free to use", "Boundary layer · wind · temp"],
                btnLabel: "View API",
              },
              {
                emoji: "🔄", title: "Feature Engineering", subhead: "Data Preparation",
                avatarBg: "#dcfce7", avatarColor: "#16a34a",
                desc: "Timestamp-aligned merge of AQI and weather data, forward-fill for gaps ≤ 3 hours, StandardScaler normalization before feeding the GRU.",
                items: ["Timestamp-aligned merge", "Forward fill ≤ 3 hr gaps", "24-hr sliding sequences"],
                btnLabel: "View Code",
              },
              {
                emoji: "🗺️", title: "IDW Spatial Engine", subhead: "Campus Coverage",
                avatarBg: "#fef3c7", avatarColor: "#d97706",
                desc: "Inverse Distance Weighting interpolates model predictions from CPCB stations to all 6 campus zones — zero physical sensors required.",
                items: ["6 campus zone coverage", "No sensors required", "Real-time zone-level AQI"],
                btnLabel: "View Engine",
              },
            ].map((card, i) => (
              <motion.div key={card.title} variants={fadeUp} className={styles.pipeCard}>
                {/* Header */}
                <div className={styles.pipeHeader}>
                  <div className={styles.pipeAvatar} style={{ background: card.avatarBg, color: card.avatarColor }}>
                    {card.emoji}
                  </div>
                  <div className={styles.pipeHeaderText}>
                    <span className={styles.pipeHeaderTitle}>{card.title}</span>
                    <span className={styles.pipeHeaderSub}>{card.subhead}</span>
                  </div>
                  <span className={styles.pipeStep}>{String(i + 1).padStart(2, "0")}</span>
                </div>

                {/* Body */}
                <div className={styles.pipeBody}>
                  <p className={styles.pipeDesc}>{card.desc}</p>
                  <ul className={styles.pipeList}>
                    {card.items.map((it) => <li key={it}>{it}</li>)}
                  </ul>
                  <div className={styles.pipeActions}>
                    <button className={styles.pipeBtnSec}>Details</button>
                    <button className={styles.pipeBtnPri} style={{ background: card.avatarColor }}>
                      {card.btnLabel} →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ML Model ── */}
      <section id="model" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <Reveal>
            <span className={styles.sectionTag}>ML Model</span>
            <h2 className={styles.sectionTitle}>GRU Neural Network</h2>
          </Reveal>

          <Reveal delay={0.15}>
            <div className={styles.modelGrid}>
              <div className={styles.modelInfo}>
                <div className={styles.modelSpec}>
                  {[
                    ["Architecture", "Single-layer GRU"],
                    ["Hidden Units", "64"],
                    ["Input Shape", "(batch, 24, 6)"],
                    ["Lookback", "24 hours"],
                    ["Horizon", "6 hours ahead"],
                    ["Loss Function", "Huber Loss (δ=1.0)"],
                    ["Optimizer", "Adam (lr=0.001)"],
                    ["Target MAE", "< 20 AQI units"],
                  ].map(([label, value]) => (
                    <div key={label} className={styles.specItem}>
                      <span className={styles.specLabel}>{label}</span>
                      <span className={styles.specValue}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.modelWhy}>
                <h3>Why GRU?</h3>
                <p>
                  Single-layer GRU provides equivalent performance to LSTM on this dataset size
                  with fewer parameters. Huber loss handles AQI spike outliers better than MSE.
                  Gradient clipping (max norm 1.0) prevents training instability from sudden AQI jumps.
                </p>
                <h3>Features Used</h3>
                <div className={styles.featurePills}>
                  {["PM2.5", "Temperature", "Humidity", "Wind Speed", "Boundary Layer Height", "AQI (historical)"].map((f) => (
                    <span key={f} className={styles.featurePill}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className={`${styles.section} ${styles.featureSection}`}>
        <div className={styles.container}>
          <Reveal>
            <span className={styles.sectionTag}>Features</span>
            <h2 className={styles.sectionTitle}>Our Palette of Expertise</h2>
            <p className={styles.sectionSub}>Everything AirGuardian does — distilled into six core capabilities.</p>
          </Reveal>

          <motion.div
            className={styles.featureGrid}
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {[
              { icon: "🗺️", title: "Interactive Campus Map", desc: "Leaflet map with color-coded AQI markers for 6 campus zones. Click any zone to see its forecast.", accent: true },
              { icon: "📊", title: "6-Hour Forecast Chart", desc: "Recharts AreaChart showing predicted AQI trend. Color-coded by severity level.", accent: false },
              { icon: "🤖", title: "AI Explanation Panel", desc: "LLM typewriter effect shows real-time analysis. Like an intelligence briefing, not a chatbot.", accent: false },
              { icon: "🔔", title: "WhatsApp Auto-Alert", desc: "Twilio integration sends formatted alerts when AQI > 200. Runs every 30 minutes.", accent: false },
              { icon: "📋", title: "Alert Operations Log", desc: "Scrolling ops-log with severity badges, timestamps, and expandable explanations.", accent: false },
              { icon: "🌱", title: "Fully Sustainable", desc: "Zero cloud cost. 100% free public data. No sensors. No paid APIs. Pure software intelligence.", accent: false },
            ].map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className={`${styles.featureCard}${f.accent ? ` ${styles.featureCardAccent}` : ""}`}
              >
                <div className={styles.featureIconWrap}>{f.icon}</div>
                <h4 className={styles.featureTitle}>{f.title}</h4>
                <p className={styles.featureDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section id="tech" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <Reveal>
            <span className={styles.sectionTag}>Tech Stack</span>
            <h2 className={styles.sectionTitle}>Built With</h2>
          </Reveal>

          <motion.div
            className={styles.techGrid}
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {[
              { cat: "ML & AI", items: ["PyTorch", "GRU Neural Network", "Huber Loss", "StandardScaler", "Groq (Llama 3.3 70B)"] },
              { cat: "Backend", items: ["FastAPI", "APScheduler", "SQLite", "Pydantic"] },
              { cat: "Data Sources", items: ["CPCB (data.gov.in)", "Open-Meteo API", "OpenAQ (fallback)", "IDW Interpolation"] },
              { cat: "Frontend", items: ["React 19 + TypeScript", "Vite", "Recharts", "Leaflet.js", "framer-motion"] },
            ].map((group) => (
              <motion.div key={group.cat} variants={fadeUp} className={styles.techGroup}>
                <h4 className={styles.techCat}>{group.cat}</h4>
                <div className={styles.techItems}>
                  {group.items.map((item) => (
                    <span key={item} className={styles.techItem}>{item}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <Reveal delay={0.2}>
            <div className={styles.zonesSection}>
              <h3 className={styles.zonesTitle}>6 Monitored Campus Zones</h3>
              <div className={styles.zonesGrid}>
                {["Main Gate", "Hostel A", "Academic Block", "Library", "Sports Ground", "Parking Area"].map((z) => (
                  <motion.div
                    key={z}
                    className={styles.zoneChip}
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {z}
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <Reveal>
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>Ready to see it in action?</h2>
            <p className={styles.ctaSub}>
              Explore real-time AQI predictions, AI-powered explanations, and campus zone monitoring.
            </p>
            <Link to="/dashboard" className={styles.ctaBtn} style={{ textDecoration: "none" }}>
              Open Live Dashboard
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </Reveal>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogo}>
            <span className={styles.footerDot} />
            <span className={styles.footerLogoText}>AirGuardian AI</span>
          </div>
          <p className={styles.footerTagline}>Predict · Explain · Act</p>
        </div>

        <div className={styles.footerLinks}>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={styles.footerLink}
              onClick={() => scrollTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className={styles.footerMeta}>
          <span className={styles.footerBadge}>AMD Slingshot 2026</span>
          <span className={styles.footerBadge}>Sustainable AI</span>
          <p className={styles.footerCopy}>© 2026 AirGuardian · Free Public Data · No Sensors</p>
        </div>
      </footer>
    </div>
  );
}
