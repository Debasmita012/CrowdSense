import { useStream } from "../context/StreamContext";

export default function PredictionsPage() {
  const { predictions, isStreaming, totalDensity } = useStream();

  const maxPred = new Array(100).fill(0);
  if (predictions && predictions.length > 0) {
    for (let i = 0; i < 100; i++) {
      maxPred[i] = Math.max(...predictions.map((step) => step[i] || 0));
    }
  }

  const riskZones = maxPred.filter(v => v >= 5).length;
  const peakVal = Math.max(...maxPred, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="feature-pill" style={{ color: "var(--accent-secondary)" }}>Temporal Forecast</div>
          <h1 className="page-title">Threat Forecaster</h1>
        </div>
      </div>

      {/* AI Strategy Panel */}
      <div className="glass-card" style={{ padding: "30px", marginBottom: "40px", background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, transparent 100%)", borderLeft: "4px solid var(--accent-secondary)" }}>
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
          <div style={{ fontSize: "3rem", background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "24px" }}>⟰</div>
          <div>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "10px" }}>30-Second Predictive Intelligence</h3>
            <p className="readable-text">
              Our Long Short-Term Memory (LSTM) network observes the density history of 100 spatial zones. 
              By training incrementally on every frame, it generates a <strong>30-second forecast</strong> 
              allowing security teams to intercept bottlenecks before they become dangerous.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Metric Pills */}
      <div className="stats-row">
        <div className="stat-card" style={{ background: "rgba(0,212,255,0.05)", borderColor: "rgba(0,212,255,0.2)" }}>
          <span className="sc-val" style={{ color: "var(--accent-secondary)" }}>{totalDensity}</span>
          <span className="sc-lbl">Current People</span>
        </div>
        <div className="stat-card" style={{ background: "rgba(255,46,99,0.05)", borderColor: "rgba(255,46,99,0.2)" }}>
          <span className="sc-val" style={{ color: "var(--accent-danger)" }}>{riskZones}</span>
          <span className="sc-lbl">At-Risk Zones</span>
        </div>
        <div className="stat-card" style={{ background: "rgba(124, 58, 237, 0.05)", borderColor: "rgba(124, 58, 237, 0.2)" }}>
          <span className="sc-val" style={{ color: "var(--accent-primary)" }}>{peakVal.toFixed(1)}</span>
          <span className="sc-lbl">Peak Predicted</span>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: "24px", fontWeight: "800" }}>Forecast Timeline</h3>
        
        {!isStreaming || !predictions || predictions.length === 0 ? (
          <div className="empty-state" style={{ height: "200px" }}>
            <span style={{ fontSize: "3rem", opacity: 0.2 }}>⏳</span>
            <p>Gathering density history for forecast...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {predictions.map((step, si) => {
              const peak = Math.max(...step, 0);
              const isCrit = peak >= 8;
              const isWarn = peak >= 5 && peak < 8;
              
              return (
                <div key={si} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "24px", 
                  padding: "20px", 
                  background: "rgba(255,255,255,0.03)", 
                  borderRadius: "20px",
                  border: isCrit ? "1px solid var(--accent-danger)" : isWarn ? "1px solid var(--accent-warning)" : "1px solid transparent"
                }}>
                  <div style={{ 
                    width: "60px", 
                    height: "60px", 
                    borderRadius: "50%", 
                    background: isCrit ? "var(--accent-danger)" : isWarn ? "var(--accent-warning)" : "var(--glass-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: "800",
                    flexShrink: 0
                  }}>
                    +{(si + 1) * 6}s
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "700", color: isCrit ? "var(--accent-danger)" : "#fff" }}>
                        {isCrit ? "CRITICAL RISK" : isWarn ? "POTENTIAL WARNING" : "SAFE FLOW"}
                      </span>
                      <span style={{ fontWeight: "800", opacity: 0.6 }}>Peak: {peak.toFixed(1)}</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ 
                        height: "100%", 
                        width: `${Math.min(100, (peak / 12) * 100)}%`, 
                        background: isCrit ? "var(--accent-danger)" : isWarn ? "var(--accent-warning)" : "var(--accent-secondary)",
                        transition: "width 0.5s ease"
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <p style={{ color: "var(--text-soft)", fontSize: "0.8rem" }}>
          * Forecasts are updated every 5 processed frames based on current spatial trajectory.
        </p>
      </div>
    </div>
  );
}
