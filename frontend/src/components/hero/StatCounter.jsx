import { motion } from 'framer-motion';
import AnimatedNumber from '../shared/AnimatedNumber';

export default function StatCounter({ value, label, prefix = '', suffix = '', accent = '#10b981', pulse = false, index = 0, decimals = 0 }) {
  return (
    <motion.div
      className="glass-card px-6 py-5 flex flex-col gap-2 relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 + index * 0.15, duration: 0.6, ease: 'easeOut' }}
      style={{ animation: `float ${6 + index}s ease-in-out ${index * 0.5}s infinite` }}
    >
      {/* Inner glow */}
      <div
        className="absolute top-0 left-0 w-full h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }}
      />

      <div className="flex items-center gap-2">
        {pulse && (
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}`, animation: 'pulseDot 1.5s ease-in-out infinite' }}
          />
        )}
        <span
          className="text-3xl font-bold"
          style={{ color: accent, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 20px ${accent}60` }}
        >
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} duration={1600} />
        </span>
      </div>

      <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
        {label}
      </span>
    </motion.div>
  );
}
