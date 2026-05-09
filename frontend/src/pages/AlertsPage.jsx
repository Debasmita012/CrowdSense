import { useState } from "react";
import { useStream } from "../context/StreamContext";

const SEV_UI = {
  HIGH: { color: "var(--accent-danger)", bg: "rgba(255,46,99,0.1)", icon: "🔴", label: "CRITICAL" },
  MEDIUM: { color: "var(--accent-warning)", bg: "rgba(245,158,11,0.1)", icon: "🟡", label: "WARNING" },
  LOW: { color: "var(--accent-secondary)", bg: "rgba(0,212,255,0.1)", icon: "🔵", label: "INFO" },
};

export default function AlertsPage() {
  const { alerts, videoId } = useStream();
  const [pdfStatus, setPdfStatus] = useState("idle");

  const highCount = alerts.filter(a => a.severity === "HIGH").length;
  const medCount = alerts.filter(a => a.severity === "MEDIUM").length;

  const handleGeneratePDF = async () => {
    if (!videoId) return;
    setPdfStatus("loading");
    try {
      const res = await fetch(`http://127.0.0.1:8000/report/${videoId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `CrowdSense_Incident_Report.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPdfStatus("done"); setTimeout(() => setPdfStatus("idle"), 3000);
    } catch (err) {
      setPdfStatus("error"); setTimeout(() => setPdfStatus("idle"), 3000);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="feature-pill" style={{ color: "var(--accent-secondary)" }}>Audit Trail</div>
          <h1 className="page-title">Incident Logs</h1>
        </div>
        <button 
          className={`btn-action ${pdfStatus}`} 
          onClick={handleGeneratePDF} 
          disabled={!videoId || pdfStatus === "loading"}
          style={{ padding: "12px 24px", fontSize: "0.85rem" }}
        >
          {pdfStatus === "loading" ? "📁 ARCHIVING..." : "📄 EXPORT INCIDENT PDF"}
        </button>
      </div>

      {/* Intelligence Box */}
      <div className="glass-card" style={{ padding: "30px", marginBottom: "40px", background: "linear-gradient(135deg, rgba(255, 46, 99, 0.05) 0%, transparent 100%)", borderLeft: "4px solid var(--accent-danger)" }}>
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
          <div style={{ fontSize: "3rem", background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "24px" }}>🤖</div>
          <div>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "10px" }}>AI Incident Narrative</h3>
            <p className="readable-text">
              The AI Narrator analyzes every anomaly to produce a <strong>Plain-English summary</strong>. 
              It doesn't just show data; it explains the risk (e.g., "Turbulent Flow") and provides 
              an immediate action checklist for security personnel.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="stats-row">
        <div className="stat-card" style={{ background: "rgba(255,46,99,0.05)", borderColor: "rgba(255,46,99,0.2)" }}>
          <span className="sc-val" style={{ color: "var(--accent-danger)" }}>{highCount}</span>
          <span className="sc-lbl">Critical Events</span>
        </div>
        <div className="stat-card" style={{ background: "rgba(245,158,11,0.05)", borderColor: "rgba(245,158,11,0.2)" }}>
          <span className="sc-val" style={{ color: "var(--accent-warning)" }}>{medCount}</span>
          <span className="sc-lbl">Warning Events</span>
        </div>
        <div className="stat-card">
          <span className="sc-val">{alerts.length}</span>
          <span className="sc-lbl">Total Logged</span>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="glass-card" style={{ padding: "10px" }}>
        <h3 style={{ padding: "20px", fontWeight: "800" }}>Chronological Timeline</h3>
        
        {alerts.length === 0 ? (
          <div className="empty-state" style={{ padding: "60px 0" }}>
            <span style={{ fontSize: "3rem", opacity: 0.2 }}>📋</span>
            <p>No incidents detected in the current stream.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[...alerts].reverse().map((alert, i) => {
              const ui = SEV_UI[alert.severity] || SEV_UI.LOW;
              return (
                <div key={i} style={{ 
                  padding: "24px", 
                  borderBottom: "1px solid var(--glass-border)",
                  display: "flex",
                  gap: "24px",
                  background: i === 0 ? "rgba(255,255,255,0.02)" : "transparent"
                }}>
                  <div style={{ 
                    width: "50px", 
                    height: "50px", 
                    borderRadius: "16px", 
                    background: ui.bg, 
                    color: ui.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    flexShrink: 0
                  }}>
                    {ui.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "800", color: ui.color, fontSize: "0.75rem", letterSpacing: "1px" }}>
                        {ui.label}
                      </span>
                      <span style={{ fontSize: "0.75rem", opacity: 0.5 }}>{alert.timestamp} • Frame {alert.frame_idx}</span>
                    </div>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "8px", fontWeight: "700" }}>{alert.type.replace(/_/g, " ")}</h4>
                    <p className="readable-text" style={{ fontSize: "0.95rem", color: "#e2e8f0" }}>{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Premium PDF Section */}
      <div className="glass-card" style={{ marginTop: "40px", padding: "40px", textAlign: "center", background: "linear-gradient(rgba(124, 58, 237, 0.1), rgba(0,0,0,0.3))" }}>
        <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📄</div>
        <h3 style={{ fontSize: "1.6rem", marginBottom: "12px", fontWeight: "800" }}>Export Tactical Report</h3>
        <p className="readable-text" style={{ maxWidth: "500px", margin: "0 auto 32px" }}>
          Generate a comprehensive PDF documentation including density charts, alert distribution graphs, 
          and AI-narrated incident analysis for legal and security audits.
        </p>
        <button 
          className={`btn-action ${pdfStatus}`} 
          onClick={handleGeneratePDF} 
          disabled={!videoId || pdfStatus === "loading"}
        >
          {pdfStatus === "loading" ? "⏳ PROCESSING..." : "📥 DOWNLOAD FULL REPORT"}
        </button>
      </div>
    </div>
  );
}
