import { useState, useEffect } from "react";
import { useStream } from "../context/StreamContext";
import API_BASE from "../config";

export default function ReplayPage() {
  const { videoId } = useStream();
  const [replayData, setReplayData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchReplay = async () => {
    if (!videoId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/replay/${videoId}`);
      const data = await res.json();
      if (data.replay) {
        setReplayData(data.replay);
        setCurrentIndex(Math.max(0, data.replay.length - 1));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReplay();
    // Auto refresh every 10s if we want
    const intv = setInterval(fetchReplay, 10000);
    return () => clearInterval(intv);
  }, [videoId]);

  const currentFrame = replayData[currentIndex];

  return (
    <div className="page">
      <h1 className="page-title" style={{ fontFamily: "var(--font-serif)", color: "var(--text-bright)", fontSize: "2.5rem" }}>Alert Replay</h1>
      <p className="readable-text" style={{ marginBottom: "24px" }}>
        Review the last 60 seconds of density heatmaps and alert logs.
      </p>

      {!videoId ? (
        <div className="glass-card" style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)" }}>No active session. Please upload a video first.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)", border: "1px solid var(--glass-border)" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "600" }}>
              Frames Captured: {replayData.length}
            </span>
            <button className="btn-ghost" onClick={fetchReplay} disabled={loading}>
              {loading ? "Syncing..." : "Sync Latest Buffer"}
            </button>
          </div>

          {replayData.length > 0 && currentFrame && (
            <div className="glass-card" style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)" }}>
              <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", color: "var(--text-soft)" }}>
                <span>Timestamp: <strong style={{ color: "var(--text-bright)" }}>{currentFrame.timestamp}</strong></span>
                <span>Frame: {currentIndex + 1} / {replayData.length}</span>
              </div>
              
              <input 
                type="range" 
                min="0" 
                max={replayData.length - 1} 
                value={currentIndex}
                onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                style={{ width: "100%", marginBottom: "24px", cursor: "pointer", accentColor: "var(--accent-primary)" }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div>
                  <h4 style={{ marginBottom: "12px", color: "var(--text-bright)", fontFamily: "var(--font-serif)" }}>Mini Heatmap</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "2px", width: "100%", aspectRatio: "16/9", background: "var(--bg-deep)", padding: "4px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                    {currentFrame.heatmap.map((val, i) => (
                      <div key={i} style={{ 
                        background: val > 0 ? `rgba(217, 83, 79, ${Math.min(1, val * 0.15)})` : "rgba(140, 115, 98, 0.05)",
                        borderRadius: "2px"
                      }} />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ marginBottom: "12px", color: "var(--text-bright)", fontFamily: "var(--font-serif)" }}>Alerts at this Frame</h4>
                  {currentFrame.alerts && currentFrame.alerts.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {currentFrame.alerts.map((a, i) => (
                        <div key={i} style={{ padding: "8px", background: "rgba(217, 83, 79, 0.05)", borderLeft: "3px solid var(--accent-danger)", fontSize: "0.8rem", color: "var(--text-bright)" }}>
                          <strong style={{ color: "var(--accent-danger)" }}>{a.type}</strong>: {a.message}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontStyle: "italic" }}>No alerts detected in this frame.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
