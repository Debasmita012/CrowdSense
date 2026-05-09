import { useEffect, useRef } from "react";
import { useStream } from "../context/StreamContext";
import UploadPanel from "../components/UploadPanel";

export default function MonitorPage() {
  const { videoId, isStreaming, frame, heatmap, totalDensity, alerts } = useStream();
  const canvasRef = useRef(null);
  const heatmapRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    heatmapRef.current = heatmap;
  }, [heatmap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const animate = (timestamp) => {
      const hm = heatmapRef.current;
      if (!hm || hm.length === 0) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const breathe = 0.75 + 0.25 * Math.sin(timestamp * 0.002);
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const cW = W / 10;
      const cH = H / 10;

      for (let i = 0; i < 100; i++) {
        const val = hm[i];
        if (val <= 0) continue;

        const x = (i % 10) * cW;
        const y = Math.floor(i / 10) * cH;

        let r, g;
        if (val > 4) {
          r = 255; g = Math.max(0, 255 - (val - 4) * 30);
        } else {
          r = Math.round(val * 60); g = 255;
        }

        const alpha = Math.min(0.8, (val / 10) * 0.8 + 0.15);
        ctx.fillStyle = `rgba(${r}, ${g}, 0, ${alpha * breathe})`;
        ctx.fillRect(x, y, cW, cH);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: "40px" }}>
        <div>
          <div className="feature-pill" style={{ color: "var(--accent-secondary)" }}>Live Analysis</div>
          <h1 className="page-title">Neural Monitor</h1>
        </div>
        {isStreaming && (
          <div style={{ padding: "10px 20px", background: "rgba(0,0,0,0.3)", borderRadius: "40px", border: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="live-dot" />
            <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{totalDensity} IN FRAME</span>
          </div>
        )}
      </div>

      {!videoId ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "40px" }}>
          <UploadPanel />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
          {/* Main Feed Card */}
          <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
            <div className="video-container">
              {frame ? (
                <img src={frame} alt="Live Stream" className="video-feed" />
              ) : (
                <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-soft)" }}>
                  Synchronizing Neural Engine...
                </div>
              )}
              <canvas ref={canvasRef} width="960" height="540" className="heatmap-canvas" />
              
              <div style={{ position: "absolute", bottom: "20px", left: "20px", display: "flex", gap: "10px" }}>
                <div style={{ padding: "6px 12px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "700" }}>
                  960×540 • 5.2 FPS
                </div>
              </div>
            </div>
          </div>

          {/* Alert Ticker for Mobile */}
          {alerts.length > 0 && (
            <div className="glass-card">
              <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>⚠</span> Incident Timeline
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {alerts.slice(-3).reverse().map((a, i) => (
                  <div key={i} style={{ padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", borderLeft: `4px solid ${a.severity === 'HIGH' ? 'var(--accent-danger)' : 'var(--accent-warning)'}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <strong style={{ fontSize: "0.85rem" }}>{a.type}</strong>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-soft)" }}>{a.timestamp}</span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-soft)", margin: 0 }}>{a.message.substring(0, 80)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
