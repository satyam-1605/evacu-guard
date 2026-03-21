import { motion } from 'framer-motion';
import { useState } from 'react';
import { Map, Brain, Route, Globe2, Users, Building2 } from 'lucide-react';

function TiltCard({ children, className = '', style = {} }) {
  const [transform, setTransform] = useState('perspective(1000px)');

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale(1.02)`);
  };

  return (
    <div
      className={`glass-card relative overflow-hidden cursor-default ${className}`}
      style={{ transform, transition: 'transform 0.15s ease', ...style }}
      onMouseMove={handleMove}
      onMouseLeave={() => setTransform('perspective(1000px)')}
    >
      {children}
    </div>
  );
}

// Mini capacity bars animation
function CapacityBars() {
  const shelters = [
    { name: 'SMS Stadium', pct: 24, color: '#10b981' },
    { name: 'Birla Auditorium', pct: 60, color: '#f59e0b' },
    { name: 'JKK', pct: 24, color: '#10b981' },
    { name: 'Albert Hall', pct: 60, color: '#f59e0b' },
  ];
  return (
    <div className="flex flex-col gap-3 mt-3">
      {shelters.map((s, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
            <span>{s.name}</span>
            <span style={{ color: s.color }}>{s.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${s.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.15 }}
              style={{ background: s.color, boxShadow: `0 0 8px ${s.color}60` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Mini accuracy gauge
function AccuracyGauge() {
  const val = 94.2;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const features = [
    { label: 'Rainfall', pct: 88 },
    { label: 'Elevation', pct: 74 },
    { label: 'Drainage', pct: 51 },
    { label: 'History', pct: 42 },
  ];
  return (
    <div className="flex items-center gap-6 mt-3">
      <div className="relative flex-shrink-0">
        <svg width="100" height="100" className="-rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={radius}
            fill="none" stroke="#10b981" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference * (1 - val / 100) }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-emerald-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {val}%
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Accuracy</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {features.map((f, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              <span>{f.label}</span><span>{f.pct}%</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full bg-emerald-400"
                initial={{ width: 0 }}
                whileInView={{ width: `${f.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Animated route SVG
function RouteAnimation() {
  return (
    <div className="mt-3 relative h-28 rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <svg width="100%" height="100%" viewBox="0 0 280 110" preserveAspectRatio="xMidYMid meet">
        {/* Roads */}
        <line x1="0" y1="55" x2="280" y2="55" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <line x1="100" y1="0" x2="100" y2="110" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <line x1="200" y1="0" x2="200" y2="110" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        {/* Hazard zone */}
        <rect x="85" y="30" width="60" height="50" fill="rgba(239,68,68,0.15)" rx="4" />
        <text x="115" y="57" textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize="8">FLOOD</text>
        {/* Route path */}
        <motion.path
          d="M 20,55 L 60,55 L 60,20 L 200,20 L 200,55 L 260,55"
          fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.6))' }}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        {/* Start/end markers */}
        <circle cx="20" cy="55" r="5" fill="#3b82f6" style={{ filter: 'drop-shadow(0 0 4px #3b82f6)' }} />
        <circle cx="260" cy="55" r="5" fill="#10b981" style={{ filter: 'drop-shadow(0 0 4px #10b981)' }} />
        <text x="20" y="72" textAnchor="middle" fill="#3b82f6" fontSize="7" style={{ fontFamily: "'JetBrains Mono', monospace" }}>YOU</text>
        <text x="260" y="72" textAnchor="middle" fill="#10b981" fontSize="7" style={{ fontFamily: "'JetBrains Mono', monospace" }}>SAFE</text>
      </svg>
    </div>
  );
}

const features = [
  {
    id: 'map',
    icon: Map,
    title: 'Live Hazard Map',
    desc: 'CartoDB dark map with real-time flood zone overlays, shelter markers, and animated evacuation routes.',
    accent: '#3b82f6',
    span: 'md:col-span-2',
    content: <RouteAnimation />,
  },
  {
    id: 'ml',
    icon: Brain,
    title: 'ML Risk Prediction',
    desc: 'Random Forest with 6 features. Feature importances drive real-time risk classification.',
    accent: '#9333ea',
    span: '',
    content: <AccuracyGauge />,
  },
  {
    id: 'route',
    icon: Route,
    title: 'Dynamic Routing',
    desc: 'Dijkstra + OSRM. Hazard penalties weight roads: 1× safe → 100× critical.',
    accent: '#10b981',
    span: '',
    content: null,
  },
  {
    id: 'alerts',
    icon: Globe2,
    title: 'Multilingual Alerts',
    desc: 'Emergency broadcasts in Hindi and English with priority severity levels.',
    accent: '#f59e0b',
    span: '',
    content: (
      <div className="mt-3 space-y-2">
        <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontFamily: "'Exo 2', sans-serif" }}>
          ⚠ मानसरोवर में बाढ़ — तत्काल निकासी
        </div>
        <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', fontFamily: "'Exo 2', sans-serif" }}>
          ⚠ Mansarovar Flood Alert — Evacuate Now
        </div>
      </div>
    ),
  },
  {
    id: 'reports',
    icon: Users,
    title: 'Crowd Reports',
    desc: '3+ reports in 30 min auto-escalate zone risk. Citizens power the system.',
    accent: '#f97316',
    span: '',
    content: null,
  },
  {
    id: 'shelter',
    icon: Building2,
    title: 'Smart Shelter Match',
    desc: 'KNN scoring: 60% weight distance + 40% remaining capacity across 7 Jaipur shelters.',
    accent: '#10b981',
    span: '',
    content: <CapacityBars />,
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-28 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-widest uppercase text-blue-400 mb-4 font-jetbrains" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            — Core Capabilities —
          </p>
          <h2 className="text-5xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
            System Features
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-auto">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={f.span}
              >
                <TiltCard className="p-6 h-full" style={{ borderColor: `${f.accent}15` }}>
                  <div className="absolute top-0 left-0 w-full h-0.5 rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${f.accent}60, transparent)` }} />

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${f.accent}15`, border: `1px solid ${f.accent}25` }}>
                      <Icon size={18} color={f.accent} />
                    </div>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                      {f.title}
                    </h3>
                  </div>

                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
                    {f.desc}
                  </p>

                  {f.content}
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
