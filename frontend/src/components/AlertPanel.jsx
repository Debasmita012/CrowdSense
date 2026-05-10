export default function AlertPanel({ alerts, videoId }) {
  const handleGenerateReport = () => {
    if (!videoId) return;
    window.open(`http://127.0.0.1:8000/report/${videoId}`, '_blank');
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: "var(--font-serif)", color: "var(--text-bright)" }}>Live Alerts</h2>
        <button 
          className="btn-ghost"
          onClick={handleGenerateReport} 
          disabled={!videoId}
          style={{ padding: "8px 16px", fontSize: "0.85rem" }}
        >
          📄 Generate Incident Report (PDF)
        </button>
      </div>

      {(!alerts || alerts.length === 0) && (
        <p style={{ color: 'var(--text-muted)' }}>No alerts detected yet. Monitoring crowd flow...</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
        {alerts && alerts.map((alert, index) => {
          const isHigh = alert.severity === 'HIGH';
          return (
            <div 
              key={index} 
              style={{ 
                padding: '12px 16px', 
                borderRadius: '8px', 
                background: isHigh ? 'rgba(217, 83, 79, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                borderLeft: `4px solid ${isHigh ? 'var(--accent-danger)' : 'var(--accent-warning)'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ color: isHigh ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>{alert.type}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Frame: {alert.frame_idx}</span>
              </div>
              <p style={{ fontSize: '0.9rem', margin: 0, color: "var(--text-soft)" }}>{alert.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}