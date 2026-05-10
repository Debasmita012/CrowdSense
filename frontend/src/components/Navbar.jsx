import { NavLink } from "react-router-dom";
import { useStream } from "../context/StreamContext";

const NAV_ITEMS = [
  { to: "/", label: "COMMAND HUB", icon: "⬡" },
  { to: "/monitor", label: "LIVE MONITOR", icon: "◉" },
  { to: "/graph", label: "CROWD GRAPH", icon: "◈" },
  { to: "/predictions", label: "THREAT FORECAST", icon: "⟰" },
  { to: "/alerts", label: "INCIDENT LOGS", icon: "⚠" },
  { to: "/flow", label: "FLOW METRICS", icon: "⇌" },
  { to: "/dwell", label: "DWELL TIME", icon: "⏱" },
  { to: "/replay", label: "ALERT REPLAY", icon: "⏮" },
  { to: "/capacity", label: "SAFE CAPACITY", icon: "▤" },
  { to: "/confidence", label: "CONFIDENCE", icon: "★" },
];

export default function Navbar() {
  const { isStreaming, alerts } = useStream();

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <nav className="sidebar">
        <div className="sidebar-brand" style={{ marginBottom: "50px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="brand-icon" style={{ 
            boxShadow: "0 4px 15px rgba(140, 115, 98, 0.2)", 
            background: "var(--accent-primary)", 
            color: "#fff", 
            width: "40px", height: "40px", 
            borderRadius: "12px", 
            display: "flex", justifyContent: "center", alignItems: "center", 
            fontSize: "1.2rem", fontWeight: "800", fontFamily: "var(--font-serif)" 
          }}>C</div>
          <div>
            <div className="brand-name" style={{ letterSpacing: "1px", fontFamily: "var(--font-serif)", fontSize: "1.2rem", color: "var(--text-bright)", fontWeight: "700" }}>CROWDSENSE</div>
            <div className="brand-sub" style={{ color: "var(--text-muted)", fontSize: "0.7rem", letterSpacing: "2px" }}>AI SECURITY OS</div>
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

        <div className={`live-chip ${isStreaming ? "live" : ""}`} style={{ marginTop: "auto", padding: "16px", background: "rgba(140, 115, 98, 0.05)", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span className="live-dot" style={{ background: isStreaming ? "#22c55e" : "var(--text-muted)", width: "8px", height: "8px", borderRadius: "50%" }} />
            <span style={{ fontSize: "0.8rem", fontWeight: "800", color: isStreaming ? "var(--text-bright)" : "var(--text-muted)" }}>
              {isStreaming ? "AI ONLINE" : "OFFLINE"}
            </span>
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-soft)" }}>
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
            style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "60px", textDecoration: "none", color: "var(--text-soft)" }}
          >
            <div className="nav-btn-icon" style={{ fontSize: "1.4rem", position: "relative", color: "inherit" }}>
              {item.icon}
              {item.to === "/alerts" && alerts.length > 0 && (
                <div style={{ position: "absolute", top: -2, right: -4, width: 8, height: 8, borderRadius: "50%", background: "var(--accent-danger)" }} />
              )}
            </div>
            <span style={{ fontSize: "0.6rem", fontWeight: "700", marginTop: "4px", color: "inherit" }}>{item.label.split(" ")[0]}</span>
          </NavLink>
        ))}
      </nav>
      
      <style>{`
        .nav-btn.active { color: var(--accent-primary) !important; }
      `}</style>
    </>
  );
}
