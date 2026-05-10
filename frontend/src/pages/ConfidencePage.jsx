import { useStream } from "../context/StreamContext";

export default function ConfidencePage() {
  const { alerts } = useStream();

  // Deduplicate alerts for display or just show latest 20
  const recentAlerts = [...alerts].reverse().slice(0, 20);

  const getConfidenceColor = (score) => {
    if (score >= 90) return "var(--accent-danger)"; // Red
    if (score >= 70) return "var(--accent-warning)"; // Amber
    if (score >= 40) return "var(--accent-primary)"; // Blue/Taupe
    return "var(--text-soft)"; // Green/Muted
  };

  return (
    <div className="page">
      <h1 className="page-title" style={{ fontFamily: "var(--font-serif)", color: "var(--text-bright)", fontSize: "2.5rem" }}>Anomaly Confidence Scores</h1>
      <p className="readable-text" style={{ marginBottom: "24px", color: "var(--text-soft)" }}>
        AI confidence scoring based on the convergence of multiple anomaly signals (Density, Turbulence, Freeze, Dwell).
      </p>

      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{width: 10, height: 10, borderRadius: "50%", background: "var(--accent-primary)"}}/> 40: Single Signal</span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{width: 10, height: 10, borderRadius: "50%", background: "var(--accent-warning)"}}/> 70: Two Signals</span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{width: 10, height: 10, borderRadius: "50%", background: "var(--accent-danger)"}}/> 95: Three+ Signals</span>
      </div>

      <div className="glass-card">
        {recentAlerts.length === 0 ? (
          <div style={{ color: "var(--text-soft)" }}>No alerts recorded yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {recentAlerts.map((a, i) => (
              <div key={i} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "24px", 
                padding: "16px", 
                background: "var(--bg-card)", 
                borderRadius: "8px",
                border: "1px solid var(--glass-border)",
                borderLeft: `4px solid ${getConfidenceColor(a.confidence || 0)}`,
                boxShadow: "0 2px 10px rgba(140, 115, 98, 0.05)"
              }}>
                
                <div style={{ textAlign: "center", minWidth: "80px" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "900", color: getConfidenceColor(a.confidence || 0) }}>
                    {a.confidence || 0}
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Confidence</div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "1.1rem", color: "var(--text-bright)", fontFamily: "var(--font-serif)" }}>{a.type}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}>{a.timestamp}</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: "1.5" }}>
                    {a.message}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
