import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const CATEGORIES = [
  {
    label: 'Backend',
    color: '#3b82f6',
    items: ['Python 3.11', 'FastAPI', 'SQLite', 'WebSocket', 'GeoJSON', 'OSRM'],
  },
  {
    label: 'ML & Data',
    color: '#f59e0b',
    items: ['scikit-learn', 'Random Forest', 'NetworkX', 'Shapely', 'Open-Meteo'],
  },
  {
    label: 'Frontend',
    color: '#10b981',
    items: ['React 18', 'Tailwind CSS', 'Framer Motion', 'Leaflet', 'Recharts'],
  },
  {
    label: 'Graphics',
    color: '#9333ea',
    items: ['Three.js', 'React Three Fiber', 'CartoDB', 'Lucide Icons'],
  },
];

function TechBadge({ name, color }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}28`,
        color: 'rgba(255,255,255,0.75)',
        fontFamily: "'Exo 2', sans-serif",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      {name}
    </div>
  );
}

export default function TechStack() {
  const { t } = useTranslation();

  return (
    <section id="tech-stack" className="py-24 px-6 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs tracking-widest uppercase mb-3"
            style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {t('techStack.poweredBy')}
          </p>
          <h2
            className="text-4xl font-bold"
            style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}
          >
            {t('techStack.title')}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-emerald-500/40" />
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-emerald-500/40" />
          </div>
        </motion.div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, ci) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: ci * 0.1 }}
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: `1px solid ${cat.color}22`,
              }}
            >
              {/* Category header */}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2 h-6 rounded-full"
                  style={{ background: cat.color, boxShadow: `0 0 10px ${cat.color}60` }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: cat.color, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {cat.label}
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {cat.items.map((name) => (
                  <TechBadge key={name} name={name} color={cat.color} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
