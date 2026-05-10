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
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div>
          <div className="feature-pill" style={{ color: "var(--accent-primary)", border: "1px solid var(--accent-primary)", display: "inline-block", padding: "6px 16px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Temporal Forecast</div>
          <h1 className="page-title" style={{ fontFamily: "var(--font-serif)", color: "var(--text-bright)", fontSize: "2.5rem" }}>Threat Forecaster</h1>
        </div>
      </div>

      {/* AI Strategy Panel */}
      <div className="glass-card" style={{ padding: "30px", marginBottom: "40px", background: "var(--bg-card)", borderLeft: "4px solid var(--accent-primary)", boxShadow: "0 4px 15px rgba(140, 115, 98, 0.05)" }}>
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
          <div style={{ fontSize: "3rem", background: "rgba(140, 115, 98, 0.05)", padding: "20px", borderRadius: "24px" }}>⟰</div>
          <div>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "10px", color: "var(--text-bright)", fontFamily: "var(--font-serif)" }}>30-Second Predictive Intelligence</h3>
            <p className="readable-text" style={{ color: "var(--text-soft)" }}>
              Our Long Short-Term Memory (LSTM) network observes the density history of 100 spatial zones. 
              By training incrementally on every frame, it generates a <strong>30-second forecast</strong> 
              allowing security teams to intercept bottlenecks before they become dangerous.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Metric Pills */}
      <div className="stats-row" style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
        <div className="stat-card" style={{ flex: 1, background: "rgba(140, 115, 98, 0.05)", border: "1px solid rgba(140, 115, 98, 0.2)", padding: "20px", borderRadius: "16px", textAlign: "center" }}>
          <span className="sc-val" style={{ display: "block", fontSize: "2.5rem", fontWeight: "800", color: "var(--accent-primary)" }}>{totalDensity}</span>
          <span className="sc-lbl" style={{ fontSize: "0.85rem", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "1px" }}>Current People</span>
        </div>
        <div className="stat-card" style={{ flex: 1, background: "rgba(217, 83, 79, 0.05)", border: "1px solid rgba(217, 83, 79, 0.2)", padding: "20px", borderRadius: "16px", textAlign: "center" }}>
          <span className="sc-val" style={{ display: "block", fontSize: "2.5rem", fontWeight: "800", color: "var(--accent-danger)" }}>{riskZones}</span>
          <span className="sc-lbl" style={{ fontSize: "0.85rem", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "1px" }}>At-Risk Zones</span>
        </div>
        <div className="stat-card" style={{ flex: 1, background: "rgba(212, 175, 55, 0.05)", border: "1px solid rgba(212, 175, 55, 0.2)", padding: "20px", borderRadius: "16px", textAlign: "center" }}>
          <span className="sc-val" style={{ display: "block", fontSize: "2.5rem", fontWeight: "800", color: "var(--accent-warning)" }}>{peakVal.toFixed(1)}</span>
          <span className="sc-lbl" style={{ fontSize: "0.85rem", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "1px" }}>Peak Predicted</span>
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
                  background: "var(--bg-card)", 
                  borderRadius: "20px",
                  border: isCrit ? "1px solid var(--accent-danger)" : isWarn ? "1px solid var(--accent-warning)" : "1px solid var(--glass-border)"
                }}>
                  <div style={{ 
                    width: "60px", 
                    height: "60px", 
                    borderRadius: "50%", 
                    background: isCrit ? "rgba(217, 83, 79, 0.1)" : isWarn ? "rgba(212, 175, 55, 0.1)" : "rgba(140, 115, 98, 0.1)",
                    color: isCrit ? "var(--accent-danger)" : isWarn ? "var(--accent-warning)" : "var(--accent-primary)",
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
                      <span style={{ fontWeight: "700", color: isCrit ? "var(--accent-danger)" : "var(--text-bright)" }}>
                        {isCrit ? "CRITICAL RISK" : isWarn ? "POTENTIAL WARNING" : "SAFE FLOW"}
                      </span>
                      <span style={{ fontWeight: "800", color: "var(--text-soft)" }}>Peak: {peak.toFixed(1)}</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(140, 115, 98, 0.1)", borderRadius: "4px", overflow: "hidden" }}>
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
