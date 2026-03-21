export default function MapLegend() {
  const items = [
    { color: '#10b981', label: 'Safe', dot: true },
    { color: '#f59e0b', label: 'Medium', dot: true },
    { color: '#f97316', label: 'High', dot: true },
    { color: '#ef4444', label: 'Critical', dot: true },
    { color: '#10b981', label: 'Shelter', icon: 'S' },
    { color: '#3b82f6', label: 'Route', line: true },
    { color: '#ef4444', label: 'Blocked Road', icon: '✕' },
    { color: '#3b82f6', label: 'You', dot: true },
  ];

  return (
    <div
      className="absolute bottom-6 left-4 z-[1000] flex flex-col gap-1.5 p-3 rounded-xl"
      style={{ background: 'rgba(17,17,24,0.9)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
    >
      <span className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
        Legend
      </span>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {item.line ? (
            <div style={{ width: 20, height: 2, background: item.color, borderRadius: 1, boxShadow: `0 0 4px ${item.color}60` }} />
          ) : item.icon ? (
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: 'white', fontWeight: 700 }}>{item.icon}</div>
          ) : (
            <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, opacity: 0.8, boxShadow: `0 0 4px ${item.color}50` }} />
          )}
          <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
