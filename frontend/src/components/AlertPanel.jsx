export default function AlertPanel({ alerts, videoId }) {
  const handleGenerateReport = () => {
    if (!videoId) return;
    window.open(`http://127.0.0.1:8000/report/${videoId}`, '_blank');
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Live Alerts</h2>
        <button 
          onClick={handleGenerateReport} 
          disabled={!videoId}
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', boxShadow: 'none' }}
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
                background: isHigh ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                borderLeft: `4px solid ${isHigh ? 'var(--accent-red)' : 'var(--accent-amber)'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ color: isHigh ? '#fca5a5' : '#fcd34d' }}>{alert.type}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Frame: {alert.frame_idx}</span>
              </div>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>{alert.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}