import { motion, AnimatePresence } from 'framer-motion';
import { severityConfig, formatTimeAgo } from '../../data/mockData';
import { useAlerts } from '../../hooks/useAlerts';

export default function AlertFeed() {
  const { alerts, connected, loading } = useAlerts();

  const displayAlerts = alerts.slice(0, 8);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: connected ? '#10b981' : '#ef4444',
              animation: 'pulseDot 1.5s ease-in-out infinite',
              boxShadow: `0 0 8px ${connected ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.6)'}`,
            }}
          />
          <h3 className="text-sm font-bold tracking-wide uppercase" style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif" }}>
            Live Alerts
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-1.5 py-0.5 rounded font-bold"
            style={{
              background: connected ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
              color: connected ? '#10b981' : 'var(--text-muted)',
              border: `1px solid ${connected ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px',
            }}
          >
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-jetbrains"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {alerts.length} active
          </span>
        </div>
      </div>

      {/* Loading shimmer */}
      {loading && displayAlerts.length === 0 && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-xl shimmer" />
          ))}
        </div>
      )}

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
        <AnimatePresence initial={false}>
          {displayAlerts.map((alert, i) => {
            const cfg = severityConfig[alert.severity] || severityConfig.info;
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="rounded-xl p-3 relative overflow-hidden flex-shrink-0"
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderLeft: `3px solid ${cfg.color}`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-bold leading-tight flex-1" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                    {alert.title}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0"
                    style={{ background: `${cfg.color}20`, color: cfg.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '9px' }}
                  >
                    {(alert.severity || 'info').toUpperCase()}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
                  {alert.description?.slice(0, 90)}...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                    📍 {alert.location}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatTimeAgo(alert.created_at)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
