import { useStream } from "../context/StreamContext";

export default function DwellPage() {
  const { dwelledIds, alerts } = useStream();
  
  const dwellAlerts = alerts.filter(a => a.type === "DWELL WARNING");

  return (
    <div className="page">
      <h1 className="page-title" style={{ fontFamily: "var(--font-serif)", color: "var(--text-bright)", fontSize: "2.5rem" }}>Dwell Time Detection</h1>
      <p className="readable-text" style={{ marginBottom: "24px" }}>
        Monitoring stationary individuals (30+ seconds) in high-density zones as a crush precursor signal.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div className="glass-card" style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", boxShadow: "0 4px 15px rgba(140, 115, 98, 0.05)" }}>
          <h3 style={{ color: "var(--text-bright)", fontFamily: "var(--font-serif)" }}>Stationary Targets</h3>
          <div style={{ fontSize: "3rem", fontWeight: "900", color: dwelledIds?.length > 3 ? "var(--accent-danger)" : "var(--accent-primary)", margin: "20px 0" }}>
            {dwelledIds?.length || 0}
          </div>
          <p className="readable-text" style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>
            Active targets flagged for minimal movement over the last 30 seconds.
          </p>
          
          {dwelledIds?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
              {dwelledIds.map(id => (
                <span key={id} style={{ background: "rgba(217, 83, 79, 0.1)", color: "var(--accent-danger)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700" }}>
                  ID: {id}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="glass-card" style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", boxShadow: "0 4px 15px rgba(140, 115, 98, 0.05)" }}>
          <h3 style={{ color: "var(--text-bright)", fontFamily: "var(--font-serif)" }}>Dwell Warning Logs</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {dwellAlerts.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>No dwell warnings triggered yet.</div>
            ) : (
              dwellAlerts.map((a, i) => (
                <div key={i} style={{ padding: "12px", background: "rgba(217, 83, 79, 0.05)", borderLeft: "3px solid var(--accent-danger)", borderRadius: "0 8px 8px 0" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>{a.timestamp}</div>
                  <div style={{ fontSize: "0.85rem", marginTop: "4px", color: "var(--text-bright)" }}>{a.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
