import { severityConfig } from '../../data/mockData';

export default function RiskBadge({ severity, className = '', pulse = false }) {
  const config = severityConfig[severity] || severityConfig.low;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold tracking-widest font-jetbrains uppercase ${className}`}
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: config.color,
            boxShadow: config.glow,
            animation: 'pulseDot 1.5s ease-in-out infinite',
          }}
        />
      )}
      {config.label}
    </span>
  );
}
