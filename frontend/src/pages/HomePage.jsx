import { useNavigate } from "react-router-dom";

const DASH_TILES = [
  { to: "/monitor", label: "Live Feed", icon: "◉", color: "#22c55e", desc: "Real-time surveillance" },
  { to: "/graph", label: "Crowd Graph", icon: "◈", color: "#00d4ff", desc: "Behavioral analytics" },
  { to: "/predictions", label: "Forecaster", icon: "⟰", color: "#8b5cf6", desc: "30s threat prediction" },
  { to: "/alerts", label: "Incidents", icon: "⚠", color: "#ff2e63", desc: "Alert history & reports" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Hero Section */}
      <section style={{ textAlign: "center", padding: "60px 0 40px", position: "relative" }}>
        <div className="feature-pill" style={{ marginBottom: "24px" }}>Security Intelligence v2.0</div>
        <h1 className="page-title">
          <span className="gradient-text">Unified Crowd Dashboard</span>
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
            <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", color: "#fff" }}>{tile.label}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>{tile.desc}</p>
            <div style={{ marginTop: "20px", fontSize: "0.8rem", fontWeight: "700", color: tile.color }}>
              Open Module →
            </div>
          </div>
        ))}
      </div>

      {/* Feature Deep Dive (Professional Copy) */}
      <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        <div className="glass-card">
          <span className="info-label">Proximity Analysis</span>
          <h3 style={{ marginBottom: "12px" }}>Graph Neural Networks</h3>
          <p className="readable-text" style={{ fontSize: "0.95rem" }}>
            The system maps every individual as a node in a spatial graph. By analyzing the "social fabric" 
            of the crowd, we can detect turbulent flows and freeze waves before they escalate.
          </p>
        </div>
        <div className="glass-card">
          <span className="info-label">Predictive Intelligence</span>
          <h3 style={{ marginBottom: "12px" }}>LSTM Flow Forecasting</h3>
          <p className="readable-text" style={{ fontSize: "0.95rem" }}>
            Our neural network analyzes 20+ frames of density history to forecast crowd movement 30 seconds into the future, 
            identifying potential bottlenecks early.
          </p>
        </div>
      </div>
    </div>
  );
}
