/**
 * RouteComparison — slides up from the bottom after a route is computed.
 * Shows 2–3 route options (Safest / Balanced / Fastest) with stats.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Route, Shield, Zap, Scale, X, ChevronRight } from 'lucide-react';

const BADGE_CONFIG = {
  safe:    { color: '#10b981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.35)',  Icon: Shield },
  info:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.35)',  Icon: Scale  },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.35)',  Icon: Zap   },
};

function RouteOptionCard({ option, index, isSelected, onSelect }) {
  const cfg = BADGE_CONFIG[option.badge] || BADGE_CONFIG.safe;
  const BadgeIcon = cfg.Icon;

  return (
    <motion.button
      onClick={() => onSelect(index)}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative flex-1 min-w-[160px] rounded-2xl p-4 text-left transition-all cursor-pointer"
      style={{
        background: isSelected ? cfg.bg : 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${isSelected ? cfg.border : 'rgba(255,255,255,0.08)'}`,
        boxShadow: isSelected ? `0 0 20px ${cfg.bg}` : 'none',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Label pill */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            color: cfg.color,
            fontFamily: "'Exo 2', sans-serif",
          }}
        >
          <BadgeIcon size={11} />
          {option.label}
        </div>
        {isSelected && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: cfg.color }}
          >
            <ChevronRight size={12} color="#000" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Route size={12} style={{ color: cfg.color }} />
          <span
            className="text-base font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {option.distance_km} km
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={12} style={{ color: cfg.color }} />
          <span
            className="text-base font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {option.eta_minutes} min
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={12} color="#10b981" />
          <span
            className="text-xs"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}
          >
            Avoids {option.risk_zones_avoided} zones
          </span>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-xs mt-3 leading-relaxed"
        style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}
      >
        {option.description}
      </p>

      {/* Shelter name */}
      {option.assigned_shelter?.name && (
        <div
          className="text-xs mt-2 truncate"
          style={{ color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}
        >
          → {option.assigned_shelter.name}
        </div>
      )}
    </motion.button>
  );
}

export default function RouteComparison({ options = [], selectedIndex = 0, onSelect, onClose, visible }) {
  return (
    <AnimatePresence>
      {visible && options.length > 0 && (
        <motion.div
          key="route-comparison"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="absolute bottom-20 left-4 right-4 z-[1100] rounded-2xl p-4"
          style={{
            background: 'rgba(10, 10, 20, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3
                className="text-sm font-semibold tracking-wide"
                style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif" }}
              >
                Choose Route
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}
              >
                {options.length} options computed — tap to activate
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)',
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Options row */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {options.map((opt, i) => (
              <RouteOptionCard
                key={i}
                option={opt}
                index={i}
                isSelected={i === selectedIndex}
                onSelect={onSelect}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
