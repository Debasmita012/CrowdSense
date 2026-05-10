import { useEffect, useRef, useState } from "react";
import AlertPanel from "./AlertPanel";
import CrowdGraph from "./CrowdGraph";
import API_BASE from "../config";

export default function LiveDashboard({ videoId }) {
  const [frame, setFrame] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [gcnScores, setGcnScores] = useState({});

  const canvasRef = useRef(null);
  // Store the last heatmap for the breathing animation
  const heatmapRef = useRef([]);
  const animFrameRef = useRef(null);
  const breathePhaseRef = useRef(0);

  // ── SSE stream ──────────────────────────────────────────────
  useEffect(() => {
    if (!videoId) return;

    const sse = new EventSource(`${API_BASE}/stream/${videoId}`);

    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.frame) setFrame(`data:image/jpeg;base64,${data.frame}`);
        if (data.alerts) setAlerts((prev) => [...prev, ...data.alerts]);
        if (data.predictions) setPredictions(data.predictions);
        if (data.heatmap) heatmapRef.current = data.heatmap;
        if (data.graph) setGraphData(data.graph);
        if (data.gcn_scores) setGcnScores(data.gcn_scores);
      } catch (err) {
        console.error("Error parsing SSE data", err);
      }
    };

    sse.onerror = () => {
      sse.close();
    };

    return () => sse.close();
  }, [videoId]);

  // ── Breathing heatmap animation loop ────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const animate = (timestamp) => {
      const heatmap = heatmapRef.current;
      if (!heatmap || heatmap.length === 0) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Breathing oscillator — sine wave [0.6 … 1.0]
      breathePhaseRef.current = timestamp * 0.002;
      const breathe = 0.7 + 0.3 * Math.sin(breathePhaseRef.current);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const cellW = width / 10;
      const cellH = height / 10;

      for (let i = 0; i < 100; i++) {
        const val = heatmap[i];
        if (val <= 0) continue;

        const x = (i % 10) * cellW;
        const y = Math.floor(i / 10) * cellH;

        let r, g;
        if (val > 4) {
          r = 255;
          g = Math.max(0, 255 - (val - 4) * 30);
        } else {
          r = Math.round(val * 60);
          g = 255;
        }

        // Alpha breathes between 0.1 and 0.8
        const baseAlpha = Math.min(0.8, (val / 10) * 0.8 + 0.15);
        const alpha = baseAlpha * breathe;

        ctx.fillStyle = `rgba(${r}, ${g}, 0, ${alpha})`;
        ctx.fillRect(x, y, cellW, cellH);

        // Soft inner glow on hot cells
        if (val > 6) {
          const grad = ctx.createRadialGradient(
            x + cellW / 2, y + cellH / 2, 0,
            x + cellW / 2, y + cellH / 2, cellW * 0.7
          );
          grad.addColorStop(0, `rgba(255, ${g}, 0, ${0.25 * breathe})`);
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, cellW, cellH);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ── LSTM prediction bars ─────────────────────────────────────
  const maxPredictions = new Array(100).fill(0);
  if (predictions && predictions.length > 0) {
    for (let i = 0; i < 100; i++) {
      maxPredictions[i] = Math.max(...predictions.map((p) => p[i] || 0));
    }
  }
  const DANGER_THRESHOLD = 8;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "32px" }}>

      {/* ── Video feed + breathing heatmap overlay ── */}
      <div
        className="glass-card"
        style={{ padding: "0", overflow: "hidden", position: "relative", border: "1px solid var(--glass-border)", background: "var(--bg-card)" }}
      >
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "var(--bg-deep)" }}>
          {frame ? (
            <img
              src={frame}
              alt="Live Stream"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--text-muted)",
              }}
            >
              Initializing AI Engine...
            </div>
          )}

          {/* Breathing heatmap canvas */}
          <canvas
            ref={canvasRef}
            width="960"
            height="540"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              mixBlendMode: "screen",
            }}
          />

          {/* Overlay badge */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(140, 115, 98, 0.2)",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "0.75rem",
              color: "var(--text-bright)",
              fontWeight: "600",
              boxShadow: "0 2px 10px rgba(140, 115, 98, 0.1)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                animation: "liveDot 1.5s ease-in-out infinite",
              }}
            />
            LIVE · Heatmap Active
          </div>
        </div>
      </div>

      {/* ── Live D3 Crowd Graph ── */}
      <CrowdGraph graphData={graphData} gcnScores={gcnScores} />

      {/* ── LSTM Flow Prediction ── */}
      <div className="glass-card">
        <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-bright)", fontFamily: "var(--font-serif)" }}>
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--accent-primary)",
            }}
          />
          LSTM Flow Prediction — Next 30s
        </h3>

        <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "8px" }}>
          {maxPredictions.map((val, idx) => {
            const isDanger = val >= DANGER_THRESHOLD;
            const isWarning = val >= DANGER_THRESHOLD - 3 && !isDanger;
            const heightPerc = Math.min(100, (val / 12) * 100);

            return (
              <div
                key={idx}
                title={`Zone ${idx}: Predicted ${val.toFixed(1)}`}
                style={{
                  minWidth: "12px",
                  height: "80px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "4px",
                  position: "relative",
                  border: isWarning
                    ? "1px solid rgba(245, 158, 11, 0.5)"
                    : isDanger
                    ? "1px solid rgba(239, 68, 68, 0.5)"
                    : "1px solid transparent",
                  boxShadow: isWarning
                    ? "0 0 8px rgba(245, 158, 11, 0.5)"
                    : isDanger
                    ? "0 0 8px rgba(239, 68, 68, 0.6)"
                    : "none",
                  animation: isWarning || isDanger ? "amberPulse 2s infinite" : "none",
                }}
              >
                {/* Danger line */}
                <div
                  style={{
                    position: "absolute",
                    bottom: `${(DANGER_THRESHOLD / 12) * 100}%`,
                    left: 0,
                    width: "100%",
                    height: "1px",
                    borderTop: "1px dashed var(--accent-red)",
                    opacity: 0.5,
                  }}
                />
                {/* Bar */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: `${heightPerc}%`,
                    background: isDanger
                      ? "var(--accent-danger)"
                      : isWarning
                      ? "var(--accent-warning)"
                      : "var(--accent-primary)",
                    borderRadius: "0 0 4px 4px",
                    transition: "height 0.3s ease, background 0.3s ease",
                  }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          <span>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--accent-primary)", marginRight: 4 }} />
            Normal
          </span>
          <span>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--accent-warning)", marginRight: 4 }} />
            Amber Pre-Alert
          </span>
          <span>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--accent-danger)", marginRight: 4 }} />
            Danger
          </span>
        </div>
      </div>

      {/* ── Alerts + PDF Report ── */}
      <AlertPanel alerts={alerts} videoId={videoId} />

      <style>{`
        @keyframes amberPulse {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        @keyframes liveDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}
