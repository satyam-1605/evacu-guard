import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockAlerts, severityConfig, formatTimeAgo } from '../../data/mockData';
import { Siren, Filter } from 'lucide-react';

const FILTERS = ['all', 'critical', 'high', 'warning', 'info'];

export default function AlertsView() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? mockAlerts
    : mockAlerts.filter(a => a.severity === filter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full bg-red-400"
            style={{ animation: 'pulseDot 1.5s ease-in-out infinite', boxShadow: '0 0 10px rgba(239,68,68,0.7)' }}
          />
          <div>
            <h2 className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
              Live Alert Feed
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
              Real-time emergency notifications · Jaipur District
            </p>
          </div>
        </div>
        <span
          className="text-xs px-3 py-1 rounded-full font-bold"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', fontFamily: "'JetBrains Mono', monospace" }}
        >
          {mockAlerts.length} ACTIVE
        </span>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-5">
        <Filter size={13} style={{ color: 'var(--text-muted)' }} />
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const cfg = f === 'all' ? null : severityConfig[f];
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-xs px-3 py-1 rounded-full font-bold transition-all"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: isActive
                    ? (cfg ? cfg.bg : 'rgba(255,255,255,0.1)')
                    : 'rgba(255,255,255,0.04)',
                  color: isActive
                    ? (cfg ? cfg.color : 'var(--text-primary)')
                    : 'var(--text-muted)',
                  border: `1px solid ${isActive ? (cfg ? cfg.border : 'rgba(255,255,255,0.2)') : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {f.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((alert, i) => {
            const cfg = severityConfig[alert.severity] || severityConfig.info;
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="rounded-2xl p-4"
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderLeft: `4px solid ${cfg.color}`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-sm font-bold leading-snug flex-1" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                    {alert.title}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded font-bold flex-shrink-0"
                    style={{ background: `${cfg.color}20`, color: cfg.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}
                  >
                    {(alert.severity || 'info').toUpperCase()}
                  </span>
                </div>

                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
                  {alert.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                    📍 {alert.location}
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {alert.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatTimeAgo(alert.created_at)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
            No {filter} alerts at this time
          </div>
        )}
      </div>
    </div>
  );
}
