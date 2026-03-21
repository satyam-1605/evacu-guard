import { motion } from 'framer-motion';

export default function RiskGauge({ score = 72 }) {
  const radius = 55;
  const stroke = 10;
  const circ = Math.PI * radius; // half circle
  const offset = circ * (1 - score / 100);

  const color = score >= 75 ? '#ef4444' : score >= 50 ? '#f59e0b' : score >= 25 ? '#f97316' : '#10b981';
  const label = score >= 75 ? 'HIGH RISK' : score >= 50 ? 'MEDIUM RISK' : score >= 25 ? 'LOW RISK' : 'SAFE';

  return (
    <div>
      <h3 className="text-sm font-bold tracking-wide uppercase mb-3" style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif" }}>
        Current Area Risk
      </h3>

      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: 140, height: 80 }}>
          <svg width="140" height="80" viewBox="0 0 140 80" className="overflow-visible">
            {/* Background arc */}
            <path
              d="M 15,75 A 55,55 0 0,1 125,75"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            {/* Colored arc */}
            <motion.path
              d="M 15,75 A 55,55 0 0,1 125,75"
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
            />
            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((tick, i) => {
              const angle = -180 + (tick / 100) * 180;
              const rad = (angle * Math.PI) / 180;
              const x = 70 + 55 * Math.cos(rad);
              const y = 75 + 55 * Math.sin(rad);
              return (
                <circle key={i} cx={x} cy={y} r="2" fill="rgba(255,255,255,0.2)" />
              );
            })}
          </svg>

          {/* Center value */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <motion.span
              className="text-3xl font-black"
              style={{ color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 20px ${color}60` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
          </div>
        </div>

        <div
          className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase"
          style={{ background: `${color}15`, border: `1px solid ${color}30`, color, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {label}
        </div>

        {/* Sub-indicators */}
        <div className="mt-4 w-full grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Elevation', value: 'Low', color: '#ef4444' },
            { label: 'Rainfall', value: '45mm', color: '#f59e0b' },
            { label: 'Drainage', value: 'Poor', color: '#f97316' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{item.label}</span>
              <span className="text-xs font-bold" style={{ color: item.color, fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
