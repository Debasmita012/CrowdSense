import { useNavigate } from "react-router-dom";

const DASH_TILES = [
  { to: "/monitor", label: "Live Feed", icon: "◉", color: "#22c55e", desc: "Real-time surveillance" },
  { to: "/graph", label: "Crowd Graph", icon: "◈", color: "#00d4ff", desc: "Behavioral analytics" },
  { to: "/predictions", label: "Forecaster", icon: "⟰", color: "#8b5cf6", desc: "30s threat prediction" },
  { to: "/alerts", label: "Incidents", icon: "⚠", color: "#ff2e63", desc: "Alert history & reports" },
  { to: "/flow", label: "Flow Metrics", icon: "⇌", color: "#eab308", desc: "Zone entry/exit flow rates" },
  { to: "/dwell", label: "Dwell Monitor", icon: "⏱", color: "#ec4899", desc: "Stationary target detection" },
  { to: "/replay", label: "Alert Replay", icon: "⏮", color: "#14b8a6", desc: "60-second incident log" },
  { to: "/capacity", label: "Safe Capacity", icon: "▤", color: "#3b82f6", desc: "Zone capacity tracking" },
  { to: "/confidence", label: "AI Confidence", icon: "★", color: "#f59e0b", desc: "Anomaly scoring breakdown" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Hero Section */}
      <section style={{ textAlign: "center", padding: "60px 0 40px", position: "relative" }}>
        <div className="feature-pill" style={{ marginBottom: "24px", color: "var(--accent-primary)", border: "1px solid var(--accent-primary)", display: "inline-block", padding: "6px 16px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Security Intelligence v2.0</div>
        <h1 className="page-title" style={{ fontFamily: "var(--font-serif)", fontSize: "3.5rem", color: "var(--text-bright)", marginBottom: "16px", fontWeight: "600" }}>
          Unified Crowd Dashboard
        </h1>
        <p className="readable-text" style={{ maxWidth: "700px", margin: "0 auto 40px" }}>
          Welcome to your central security hub. Monitor live feeds, analyze crowd proximity graphs, 
          and receive AI-driven incident reports in plain English.
        </p>
        
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-action" onClick={() => navigate("/monitor")}>
            🚀 Start Live Monitoring
          </button>
          <button className="btn-ghost" onClick={() => navigate("/alerts")}>
            📄 View Incident Reports
          </button>
        </div>
      </section>

      {/* Visible Feature Hub (New "Command Center") */}
      <div className="dashboard-grid">
        {DASH_TILES.map((tile) => (
          <div key={tile.to} className="dash-tile" onClick={() => navigate(tile.to)}>
            <span className="tile-icon" style={{ color: tile.color }}>{tile.icon}</span>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", color: "var(--text-bright)", fontFamily: "var(--font-serif)" }}>{tile.label}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>{tile.desc}</p>
            <div style={{ marginTop: "20px", fontSize: "0.8rem", fontWeight: "700", color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Open Module →
            </div>
          </div>
        ))}
      </div>

      {/* Feature Deep Dive (Professional Copy) */}
      <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        <div className="glass-card" style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", padding: "32px", borderRadius: "20px", boxShadow: "0 4px 20px rgba(140, 115, 98, 0.05)" }}>
          <span className="info-label" style={{ color: "var(--accent-secondary)" }}>Proximity Analysis</span>
          <h3 style={{ marginBottom: "12px", color: "var(--text-bright)", fontFamily: "var(--font-serif)", fontSize: "1.8rem" }}>Graph Neural Networks</h3>
          <p className="readable-text" style={{ fontSize: "0.95rem" }}>
            The system maps every individual as a node in a spatial graph. By analyzing the "social fabric" 
            of the crowd, we can detect turbulent flows and freeze waves before they escalate.
          </p>
        </div>
        <div className="glass-card" style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", padding: "32px", borderRadius: "20px", boxShadow: "0 4px 20px rgba(140, 115, 98, 0.05)" }}>
          <span className="info-label" style={{ color: "var(--accent-secondary)" }}>Predictive Intelligence</span>
          <h3 style={{ marginBottom: "12px", color: "var(--text-bright)", fontFamily: "var(--font-serif)", fontSize: "1.8rem" }}>LSTM Flow Forecasting</h3>
          <p className="readable-text" style={{ fontSize: "0.95rem" }}>
            Our neural network analyzes 20+ frames of density history to forecast crowd movement 30 seconds into the future, 
            identifying potential bottlenecks early.
          </p>
        </div>
      </div>
    </div>
  );
}
