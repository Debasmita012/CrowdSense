import { useStream } from "../context/StreamContext";

export default function FlowPage() {
  const { flowStats } = useStream();

  return (
    <div className="page">
      <h1 className="page-title" style={{ fontFamily: "var(--font-serif)", color: "var(--text-bright)", fontSize: "2.5rem" }}>Zone Flow Analytics</h1>
      <p className="readable-text" style={{ marginBottom: "24px", color: "var(--text-soft)" }}>
        Real-time entry, exit, and flow rate metrics per zone using DeepSORT persistent IDs.
      </p>

      <div className="glass-card">
        {Object.keys(flowStats || {}).length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Waiting for flow data...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "16px" }}>
            {Object.entries(flowStats).map(([zoneId, stats]) => {
              if (stats.entries === 0 && stats.exits === 0) return null;
              return (
                <div key={zoneId} style={{ background: "var(--bg-deep)", padding: "16px", borderRadius: "8px", border: "1px solid var(--glass-border)", boxShadow: "0 2px 8px rgba(140, 115, 98, 0.05)" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>ZONE {zoneId}</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent-primary)" }}>{stats.flow_rate}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-soft)" }}>Flow Rate (ops)</div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "0.8rem", fontWeight: "600" }}>
                    <span style={{ color: "var(--accent-secondary)" }}>IN: {stats.entries}</span>
                    <span style={{ color: "var(--accent-danger)" }}>OUT: {stats.exits}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
