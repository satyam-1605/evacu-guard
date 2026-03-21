const techs = [
  { name: 'Python 3.11', color: '#3b82f6' },
  { name: 'FastAPI', color: '#10b981' },
  { name: 'scikit-learn', color: '#f59e0b' },
  { name: 'NetworkX', color: '#9333ea' },
  { name: 'React 18', color: '#3b82f6' },
  { name: 'Tailwind CSS', color: '#06b6d4' },
  { name: 'Framer Motion', color: '#f97316' },
  { name: 'Leaflet', color: '#10b981' },
  { name: 'Three.js', color: '#ffffff' },
  { name: 'Open-Meteo', color: '#3b82f6' },
  { name: 'OSRM', color: '#ef4444' },
  { name: 'NetworkX', color: '#9333ea' },
  { name: 'Recharts', color: '#f59e0b' },
  { name: 'SQLite', color: '#10b981' },
  { name: 'WebSocket', color: '#f97316' },
  { name: 'GeoJSON', color: '#3b82f6' },
  { name: 'Random Forest', color: '#10b981' },
  { name: 'Shapely', color: '#9333ea' },
];

function TechBadge({ name, color }) {
  return (
    <div
      className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide inline-flex items-center gap-2 mx-2"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}25`,
        color,
        fontFamily: "'Exo 2', sans-serif",
        boxShadow: `0 0 12px ${color}10`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {name}
    </div>
  );
}

export default function TechStack() {
  const doubled = [...techs, ...techs];

  return (
    <section className="py-20 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      <div className="mb-12 text-center">
        <p className="text-xs tracking-widest uppercase mb-3 font-jetbrains" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
          — Powered by —
        </p>
        <h2 className="text-3xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
          Tech Stack
        </h2>
      </div>

      {/* Marquee row 1 */}
      <div className="relative overflow-hidden mb-4">
        <div className="flex" style={{ animation: 'marquee 30s linear infinite', width: 'max-content' }}>
          {doubled.map((t, i) => <TechBadge key={i} {...t} />)}
        </div>
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-32 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--bg-secondary), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-32 pointer-events-none" style={{ background: 'linear-gradient(-90deg, var(--bg-secondary), transparent)' }} />
      </div>

      {/* Marquee row 2 reverse */}
      <div className="relative overflow-hidden">
        <div className="flex" style={{ animation: 'marquee 25s linear infinite reverse', width: 'max-content' }}>
          {[...doubled].reverse().map((t, i) => <TechBadge key={i} {...t} />)}
        </div>
        <div className="absolute inset-y-0 left-0 w-32 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--bg-secondary), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-32 pointer-events-none" style={{ background: 'linear-gradient(-90deg, var(--bg-secondary), transparent)' }} />
      </div>
    </section>
  );
}
