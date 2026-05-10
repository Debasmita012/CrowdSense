import { useState } from "react";
import { useStream } from "../context/StreamContext";

const SEV_UI = {
  HIGH: { color: "var(--accent-danger)", bg: "rgba(217, 83, 79, 0.1)", icon: "🔴", label: "CRITICAL" },
  MEDIUM: { color: "var(--accent-warning)", bg: "rgba(212, 175, 55, 0.1)", icon: "🟡", label: "WARNING" },
  LOW: { color: "var(--accent-primary)", bg: "rgba(140, 115, 98, 0.1)", icon: "🔵", label: "INFO" },
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
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div>
          <div className="feature-pill" style={{ color: "var(--accent-primary)", border: "1px solid var(--accent-primary)", display: "inline-block", padding: "6px 16px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Audit Trail</div>
          <h1 className="page-title" style={{ fontFamily: "var(--font-serif)", color: "var(--text-bright)", fontSize: "2.5rem" }}>Incident Logs</h1>
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
      <div className="glass-card" style={{ padding: "30px", marginBottom: "40px", background: "var(--bg-card)", borderLeft: "4px solid var(--accent-danger)", boxShadow: "0 4px 15px rgba(140, 115, 98, 0.05)" }}>
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
          <div style={{ fontSize: "3rem", background: "rgba(140, 115, 98, 0.05)", padding: "20px", borderRadius: "24px" }}>🤖</div>
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
      <div className="stats-row" style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
        <div className="stat-card" style={{ flex: 1, background: "rgba(217, 83, 79, 0.05)", border: "1px solid rgba(217, 83, 79, 0.2)", padding: "20px", borderRadius: "16px", textAlign: "center" }}>
          <span className="sc-val" style={{ display: "block", fontSize: "2.5rem", fontWeight: "800", color: "var(--accent-danger)" }}>{highCount}</span>
          <span className="sc-lbl" style={{ fontSize: "0.85rem", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "1px" }}>Critical Events</span>
        </div>
        <div className="stat-card" style={{ flex: 1, background: "rgba(212, 175, 55, 0.05)", border: "1px solid rgba(212, 175, 55, 0.2)", padding: "20px", borderRadius: "16px", textAlign: "center" }}>
          <span className="sc-val" style={{ display: "block", fontSize: "2.5rem", fontWeight: "800", color: "var(--accent-warning)" }}>{medCount}</span>
          <span className="sc-lbl" style={{ fontSize: "0.85rem", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "1px" }}>Warning Events</span>
        </div>
        <div className="stat-card" style={{ flex: 1, background: "var(--bg-card)", border: "1px solid var(--glass-border)", padding: "20px", borderRadius: "16px", textAlign: "center" }}>
          <span className="sc-val" style={{ display: "block", fontSize: "2.5rem", fontWeight: "800", color: "var(--text-bright)" }}>{alerts.length}</span>
          <span className="sc-lbl" style={{ fontSize: "0.85rem", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "1px" }}>Total Logged</span>
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
                  background: i === 0 ? "rgba(140, 115, 98, 0.05)" : "transparent"
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
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "8px", fontWeight: "700", color: "var(--text-bright)" }}>{alert.type.replace(/_/g, " ")}</h4>
                    <p className="readable-text" style={{ fontSize: "0.95rem", color: "var(--text-soft)" }}>{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Premium PDF Section */}
      <div className="glass-card" style={{ marginTop: "40px", padding: "40px", textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--glass-border)" }}>
        <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📄</div>
        <h3 style={{ fontSize: "1.6rem", marginBottom: "12px", fontWeight: "800", color: "var(--text-bright)", fontFamily: "var(--font-serif)" }}>Export Tactical Report</h3>
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
