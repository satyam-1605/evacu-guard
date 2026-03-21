import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockAlerts, severityConfig, formatTimeAgo } from '../../data/mockData';
import { Siren } from 'lucide-react';

export default function AlertFeed() {
  const [alerts, setAlerts] = useState(mockAlerts.slice(0, 6));

  const getSeverityBorder = (sev) => {
    const cfg = severityConfig[sev] || severityConfig.info;
    return cfg.color;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full bg-red-400"
            style={{ animation: 'pulseDot 1.5s ease-in-out infinite', boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
          />
          <h3 className="text-sm font-bold tracking-wide uppercase" style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif" }}>
            Live Alerts
          </h3>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-jetbrains"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', fontFamily: "'JetBrains Mono', monospace" }}
        >
          {alerts.length} active
        </span>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
        <AnimatePresence>
          {alerts.map((alert, i) => {
            const borderColor = getSeverityBorder(alert.severity);
            const cfg = severityConfig[alert.severity] || severityConfig.info;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-xl p-3 relative overflow-hidden flex-shrink-0"
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderLeft: `3px solid ${borderColor}`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-bold leading-tight flex-1" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                    {alert.title}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0"
                    style={{ background: `${borderColor}20`, color: borderColor, fontFamily: "'JetBrains Mono', monospace", fontSize: '9px' }}
                  >
                    {(alert.severity || 'info').toUpperCase()}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
                  {alert.description.slice(0, 90)}...
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
