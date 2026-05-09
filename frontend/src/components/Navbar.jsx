import { NavLink } from "react-router-dom";
import { useStream } from "../context/StreamContext";

const NAV_ITEMS = [
  { to: "/", label: "COMMAND HUB", icon: "⬡" },
  { to: "/monitor", label: "LIVE MONITOR", icon: "◉" },
  { to: "/graph", label: "CROWD GRAPH", icon: "◈" },
  { to: "/predictions", label: "THREAT FORECAST", icon: "⟰" },
  { to: "/alerts", label: "INCIDENT LOGS", icon: "⚠" },
];

export default function Navbar() {
  const { isStreaming, alerts } = useStream();

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <nav className="sidebar">
        <div className="sidebar-brand" style={{ marginBottom: "50px" }}>
          <div className="brand-icon" style={{ boxShadow: "0 0 20px var(--accent-primary)" }}>C</div>
          <div>
            <div className="brand-name" style={{ letterSpacing: "1px" }}>CROWDSENSE</div>
            <div className="brand-sub">AI SECURITY OS</div>
          </div>
        </div>

        <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--text-soft)", marginBottom: "16px", paddingLeft: "16px", letterSpacing: "2px" }}>
          MODULES
        </div>

        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.to === "/alerts" && alerts.length > 0 && (
                <span style={{ background: "var(--accent-danger)", color: "#fff", fontSize: "0.65rem", padding: "2px 6px", borderRadius: "10px", marginLeft: "auto", fontWeight: "900" }}>
                  {alerts.length}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div className={`live-chip ${isStreaming ? "live" : ""}`} style={{ marginTop: "auto", padding: "16px", background: "rgba(0,0,0,0.3)", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span className="live-dot" />
            <span style={{ fontSize: "0.8rem", fontWeight: "800", color: isStreaming ? "var(--accent-secondary)" : "var(--text-soft)" }}>
              {isStreaming ? "AI ONLINE" : "OFFLINE"}
            </span>
          </div>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>
            Edge detection active
          </div>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
          >
            <div className="nav-btn-icon">
              {item.icon}
              {item.to === "/alerts" && alerts.length > 0 && (
                <div style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "var(--accent-danger)", border: "2px solid var(--bg-deep)" }} />
              )}
            </div>
            <span style={{ fontSize: "0.6rem", fontWeight: "700", marginTop: "2px" }}>{item.label.split(" ")[0]}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
