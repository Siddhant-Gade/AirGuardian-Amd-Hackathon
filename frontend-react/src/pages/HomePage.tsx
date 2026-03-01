import React, { useRef } from "react";
import styles from "./HomePage.module.css";

interface Props {
  onOpenDashboard: () => void;
}

/* ── Section nav items for internal scroll ── */
const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "pipeline", label: "Pipeline" },
  { id: "model", label: "ML Model" },
  { id: "features", label: "Features" },
  { id: "tech", label: "Tech Stack" },
];

const HomePage: React.FC<Props> = ({ onOpenDashboard }) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.page}>
      {/* ── Sticky top nav ── */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.navDot} />
          <span className={styles.navLogo}>AirGuardian</span>
        </div>
        <div className={styles.navLinks}>
          {SECTIONS.map((s) => (
            <button key={s.id} className={styles.navLink} onClick={() => scrollTo(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
        <button className={styles.navCta} onClick={onOpenDashboard}>
          Open Dashboard →
        </button>
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroBadge}>AMD Slingshot 2025 · Sustainable AI</span>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroGreen}>Air</span>Guardian AI
          </h1>
          <p className={styles.heroSub}>
            Predicts dangerous AQI spikes <strong>6 hours</strong> before they arrive,
            explains why in plain English, and automatically alerts the right people —
            before anyone is exposed.
          </p>
          <div className={styles.heroBtns}>
            <button className={styles.heroPrimary} onClick={onOpenDashboard}>
              Open Live Dashboard
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
            <button className={styles.heroSecondary} onClick={() => scrollTo("overview")}>
              Learn More
            </button>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>0</span>
              <span className={styles.heroStatUnit}>Hardware Required</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>$0</span>
              <span className={styles.heroStatUnit}>Cloud Cost</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>100%</span>
              <span className={styles.heroStatUnit}>Free Public Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── System Overview ── */}
      <section id="overview" className={styles.section}>
        <div className={styles.container}>
          <span className={styles.sectionTag}>System Overview</span>
          <h2 className={styles.sectionTitle}>Three Layers of Intelligence</h2>
          <p className={styles.sectionSub}>
            AirGuardian is a pure software AI system — no sensors, no paid APIs,
            entirely built on free public data.
          </p>
          <div className={styles.layerGrid}>
            <div className={styles.layerCard}>
              <div className={`${styles.layerIcon} ${styles.layerPurple}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              </div>
              <h3 className={styles.layerName}>Prediction</h3>
              <p className={styles.layerDesc}>
                GRU neural network forecasts AQI 6 hours ahead using 24-hour lookback windows.
                Trained on CPCB + Open-Meteo data, achieves MAE &lt; 20 AQI units.
              </p>
              <div className={styles.layerTech}>PyTorch · pandas · GRU 64 units</div>
            </div>
            <div className={styles.layerCard}>
              <div className={`${styles.layerIcon} ${styles.layerGreen}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              </div>
              <h3 className={styles.layerName}>Explanation</h3>
              <p className={styles.layerDesc}>
                LLM (Llama 3.3 70B via Groq) converts predictions into plain English
                alerts for campus administrators. No jargon, just actionable insights.
              </p>
              <div className={styles.layerTech}>Groq API · Llama 3.3 70B · Cache fallback</div>
            </div>
            <div className={styles.layerCard}>
              <div className={`${styles.layerIcon} ${styles.layerAmber}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              </div>
              <h3 className={styles.layerName}>Intervention</h3>
              <p className={styles.layerDesc}>
                Auto-trigger WhatsApp alerts when AQI exceeds 200. Scheduler runs
                every 30 minutes, logging all predictions to SQLite.
              </p>
              <div className={styles.layerTech}>Twilio · FastAPI · APScheduler</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section id="architecture" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <span className={styles.sectionTag}>Architecture</span>
          <h2 className={styles.sectionTitle}>End-to-End Pipeline</h2>
          <div className={styles.archFlow}>
            {[
              { step: "1", title: "Data Sources", desc: "CPCB API (AQI) + Open-Meteo (Weather) + OpenAQ fallback", color: "#22c55e" },
              { step: "2", title: "Data Integration", desc: "Feature merger + IDW spatial interpolation for campus zones", color: "#6366f1" },
              { step: "3", title: "ML Engine", desc: "Data cleaning → Feature scaling → Sequence generation → GRU inference", color: "#8b5cf6" },
              { step: "4", title: "FastAPI Backend", desc: "REST endpoints for predictions, alerts, zone maps + health checks", color: "#f59e0b" },
              { step: "5", title: "LLM Explainer", desc: "Groq Llama 3.3 70B generates plain-English alert explanations", color: "#ec4899" },
              { step: "6", title: "Alert & Frontend", desc: "Twilio WhatsApp alerts + React dashboard with live map & charts", color: "#ef4444" },
            ].map((item, i) => (
              <div key={i} className={styles.archStep}>
                <div className={styles.archNum} style={{ background: item.color }}>{item.step}</div>
                <div className={styles.archContent}>
                  <h4 className={styles.archTitle}>{item.title}</h4>
                  <p className={styles.archDesc}>{item.desc}</p>
                </div>
                {i < 5 && <div className={styles.archLine} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data Pipeline ── */}
      <section id="pipeline" className={styles.section}>
        <div className={styles.container}>
          <span className={styles.sectionTag}>Data Pipeline</span>
          <h2 className={styles.sectionTitle}>From Raw Data to Prediction</h2>
          <div className={styles.dataGrid}>
            <div className={styles.dataCard}>
              <div className={styles.dataHeader}>
                <span className={styles.dataEmoji}>📡</span>
                <h4>CPCB AQI Data</h4>
              </div>
              <ul className={styles.dataList}>
                <li>Source: data.gov.in (Kaggle mirror)</li>
                <li>Format: CSV, hourly readings</li>
                <li>Columns: PM2.5, PM10, NO2, AQI</li>
                <li>Nagpur station, 2010–2023</li>
              </ul>
            </div>
            <div className={styles.dataCard}>
              <div className={styles.dataHeader}>
                <span className={styles.dataEmoji}>🌤️</span>
                <h4>Open-Meteo Weather</h4>
              </div>
              <ul className={styles.dataList}>
                <li>Source: archive-api.open-meteo.com</li>
                <li>No API key needed</li>
                <li>Temperature, humidity, wind speed</li>
                <li>Boundary layer height (key feature)</li>
              </ul>
            </div>
            <div className={styles.dataCard}>
              <div className={styles.dataHeader}>
                <span className={styles.dataEmoji}>🔄</span>
                <h4>Feature Engineering</h4>
              </div>
              <ul className={styles.dataList}>
                <li>Merge on timestamp alignment</li>
                <li>Forward fill gaps ≤ 3 hours</li>
                <li>StandardScaler on all features</li>
                <li>24-hour sliding window sequences</li>
              </ul>
            </div>
            <div className={styles.dataCard}>
              <div className={styles.dataHeader}>
                <span className={styles.dataEmoji}>🗺️</span>
                <h4>IDW Spatial Engine</h4>
              </div>
              <ul className={styles.dataList}>
                <li>Inverse Distance Weighting</li>
                <li>Interpolates for 6 campus zones</li>
                <li>No physical sensors required</li>
                <li>Real-time zone-level AQI</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── ML Model ── */}
      <section id="model" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <span className={styles.sectionTag}>ML Model</span>
          <h2 className={styles.sectionTitle}>GRU Neural Network</h2>
          <div className={styles.modelGrid}>
            <div className={styles.modelInfo}>
              <div className={styles.modelSpec}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Architecture</span>
                  <span className={styles.specValue}>Single-layer GRU</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Hidden Units</span>
                  <span className={styles.specValue}>64</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Input Shape</span>
                  <span className={styles.specValue}>(batch, 24, 6)</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Lookback</span>
                  <span className={styles.specValue}>24 hours</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Horizon</span>
                  <span className={styles.specValue}>6 hours ahead</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Loss Function</span>
                  <span className={styles.specValue}>Huber Loss (δ=1.0)</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Optimizer</span>
                  <span className={styles.specValue}>Adam (lr=0.001)</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Target MAE</span>
                  <span className={styles.specValue}>&lt; 20 AQI units</span>
                </div>
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
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className={styles.section}>
        <div className={styles.container}>
          <span className={styles.sectionTag}>Features</span>
          <h2 className={styles.sectionTitle}>What Makes It Different</h2>
          <div className={styles.featureGrid}>
            {[
              { icon: "🗺️", title: "Interactive Campus Map", desc: "Leaflet map with color-coded AQI markers for 6 campus zones. Click any zone to see its forecast." },
              { icon: "📊", title: "6-Hour Forecast Chart", desc: "Recharts AreaChart showing predicted AQI trend. Color-coded by severity level." },
              { icon: "🤖", title: "AI Explanation Panel", desc: "LLM typewriter effect shows real-time analysis. Like an intelligence briefing, not a chatbot." },
              { icon: "🔔", title: "WhatsApp Auto-Alert", desc: "Twilio integration sends formatted alerts when AQI > 200. Runs every 30 minutes." },
              { icon: "📋", title: "Alert Operations Log", desc: "Scrolling ops-log with severity badges, timestamps, and expandable explanations." },
              { icon: "🌱", title: "Fully Sustainable", desc: "Zero cloud cost. 100% free public data. No sensors. No paid APIs. Pure software intelligence." },
            ].map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <span className={styles.featureEmoji}>{f.icon}</span>
                <h4 className={styles.featureTitle}>{f.title}</h4>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section id="tech" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <span className={styles.sectionTag}>Tech Stack</span>
          <h2 className={styles.sectionTitle}>Built With</h2>
          <div className={styles.techGrid}>
            {[
              { cat: "ML & AI", items: ["PyTorch", "GRU Neural Network", "Huber Loss", "StandardScaler", "Groq (Llama 3.3 70B)"] },
              { cat: "Backend", items: ["FastAPI", "APScheduler", "SQLite", "Twilio WhatsApp", "Pydantic"] },
              { cat: "Data Sources", items: ["CPCB (data.gov.in)", "Open-Meteo API", "OpenAQ (fallback)", "IDW Interpolation"] },
              { cat: "Frontend", items: ["React 19 + TypeScript", "Vite", "Recharts", "Leaflet.js", "CSS Modules"] },
            ].map((group, i) => (
              <div key={i} className={styles.techGroup}>
                <h4 className={styles.techCat}>{group.cat}</h4>
                <div className={styles.techItems}>
                  {group.items.map((item) => (
                    <span key={item} className={styles.techItem}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Campus Zones ── */}
          <div className={styles.zonesSection}>
            <h3 className={styles.zonesTitle}>6 Monitored Campus Zones</h3>
            <div className={styles.zonesGrid}>
              {["Main Gate", "Hostel A", "Academic Block", "Library", "Sports Ground", "Parking Area"].map((z) => (
                <div key={z} className={styles.zoneChip}>{z}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to see it in action?</h2>
          <p className={styles.ctaSub}>
            Explore real-time AQI predictions, AI-powered explanations, and campus zone monitoring.
          </p>
          <button className={styles.ctaBtn} onClick={onOpenDashboard}>
            Open Live Dashboard
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span>AirGuardian AI · GRU Neural Network · Free Public Data</span>
        <span>AMD Slingshot 2025 · Sustainable AI · Green Tech</span>
      </footer>
    </div>
  );
};

export default HomePage;
