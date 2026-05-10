import { useState } from "react";
import { useStream } from "../context/StreamContext";
import API_BASE from "../config";

export default function CapacityPage() {
  const { videoId, zoneCapacity, heatmap } = useStream();
  const [selectedZone, setSelectedZone] = useState("0");
  const [newCapacity, setNewCapacity] = useState("");

  const handleUpdate = async () => {
    if (!videoId || !newCapacity) return;
    try {
      await fetch(`${API_BASE}/capacity/${videoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone_id: selectedZone, capacity: parseInt(newCapacity) })
      });
      setNewCapacity("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title" style={{ fontFamily: "var(--font-serif)", color: "var(--text-bright)", fontSize: "2.5rem" }}>Safe Capacity</h1>
      <p className="readable-text" style={{ marginBottom: "24px" }}>
        Set and monitor maximum safe capacity per zone. View live fill percentages.
      </p>

      {!videoId ? (
        <div className="glass-card" style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)" }}>No active session. Please upload a video first.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
          
          <div className="glass-card" style={{ alignSelf: "start", background: "var(--bg-card)", border: "1px solid var(--glass-border)" }}>
            <h3 style={{ marginBottom: "16px", color: "var(--text-bright)", fontFamily: "var(--font-serif)" }}>Configure Zone</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Select Zone ID (0-99)</label>
              <input 
                type="number" 
                min="0" max="99" 
                value={selectedZone} 
                onChange={(e) => setSelectedZone(e.target.value)}
                style={{ background: "var(--bg-deep)", border: "1px solid var(--glass-border)", color: "var(--text-bright)", padding: "8px", borderRadius: "4px" }}
              />
              
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "8px", fontWeight: "600" }}>New Max Capacity</label>
              <input 
                type="number" 
                min="1" 
                value={newCapacity} 
                onChange={(e) => setNewCapacity(e.target.value)}
                style={{ background: "var(--bg-deep)", border: "1px solid var(--glass-border)", color: "var(--text-bright)", padding: "8px", borderRadius: "4px" }}
                placeholder={`Current: ${zoneCapacity[selectedZone] || 50}`}
              />
              
              <button className="btn-action" onClick={handleUpdate} style={{ marginTop: "16px" }}>
                Update Capacity
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)" }}>
            <h3 style={{ marginBottom: "16px", color: "var(--text-bright)", fontFamily: "var(--font-serif)" }}>Live Capacity Monitor</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", maxHeight: "60vh", overflowY: "auto", paddingRight: "8px" }}>
              {Object.entries(zoneCapacity).map(([zId, maxCap]) => {
                const currentPop = heatmap[parseInt(zId)] || 0;
                const fillPerc = Math.min(100, (currentPop / maxCap) * 100);
                
                let color = "var(--accent-secondary)";
                if (fillPerc > 75) color = "var(--accent-warning)";
                if (fillPerc > 90) color = "var(--accent-danger)";

                if (currentPop === 0) return null; // Only show active zones to save space

                return (
                  <div key={zId} style={{ background: "var(--bg-deep)", padding: "12px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                      <span>Z{zId}</span>
                      <span>{currentPop} / {maxCap}</span>
                    </div>
                    
                    <div style={{ width: "100%", height: "6px", background: "rgba(140, 115, 98, 0.1)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${fillPerc}%`, height: "100%", background: color, transition: "width 0.3s ease, background 0.3s ease" }} />
                    </div>
                  </div>
                );
              })}
              {heatmap.every(v => v === 0) && (
                <div style={{ gridColumn: "1 / -1", color: "var(--text-soft)", fontSize: "0.85rem" }}>
                  Awaiting crowd data...
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
