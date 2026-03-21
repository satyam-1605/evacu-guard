import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function RiskGauge() {
  const [score, setScore] = useState(20);
  const [label, setLabel] = useState('LOW RISK');
  const [rainfall, setRainfall] = useState(0);
  const [live, setLive] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Fetch real weather via Vite proxy
        const wxRes = await fetch('/api/weather');
        const wx = await wxRes.json();
        const rain = wx.rainfall_mm ?? 0;

        if (!cancelled) setRainfall(rain);

        // Run ML risk prediction with real rainfall
        const riskRes = await fetch('/api/risk/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elevation_m: 431,
            dist_to_water_km: 1.8,
            rainfall_mm: rain,
            soil_drainage: 2,
            historical_floods: 3,
            population_density: 12000,
          }),
        });
        const risk = await riskRes.json();

        if (!cancelled) {
          setScore(risk.risk_score ?? 20);
          setLabel(risk.label ? risk.label.toUpperCase() + ' RISK' : 'LOW RISK');
          setLive(true);
        }
      } catch {
        // backend offline — keep defaults
      }
    }

    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const radius = 55;
  const stroke = 10;
  const circ = Math.PI * radius;
  const offset = circ * (1 - score / 100);
  const color = score >= 75 ? '#ef4444' : score >= 50 ? '#f59e0b' : score >= 25 ? '#f97316' : '#10b981';
  const rainfallColor = rainfall > 50 ? '#ef4444' : rainfall > 25 ? '#f59e0b' : '#10b981';

  const metricItems = [
    { label: t('riskGauge.elevation'), value: '431m', color: '#3b82f6' },
    { label: t('riskGauge.rainfall'), value: `${rainfall}mm`, color: rainfallColor },
    { label: t('riskGauge.drainage'), value: t('riskGauge.poor'), color: '#f97316' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold tracking-wide uppercase" style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif" }}>
          {t('riskGauge.title')}
        </h3>
        {live && (
          <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px' }}>
            {t('riskGauge.mlLive')}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: 140, height: 80 }}>
          <svg width="140" height="80" viewBox="0 0 140 80" className="overflow-visible">
            <path d="M 15,75 A 55,55 0 0,1 125,75" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} strokeLinecap="round" />
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
            {[0, 25, 50, 75, 100].map((tick, i) => {
              const angle = -180 + (tick / 100) * 180;
              const rad = (angle * Math.PI) / 180;
              const x = 70 + 55 * Math.cos(rad);
              const y = 75 + 55 * Math.sin(rad);
              return <circle key={i} cx={x} cy={y} r="2" fill="rgba(255,255,255,0.2)" />;
            })}
          </svg>
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

        <div className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase"
          style={{ background: `${color}15`, border: `1px solid ${color}30`, color, fontFamily: "'JetBrains Mono', monospace" }}>
          {label}
        </div>

        <div className="mt-4 w-full grid grid-cols-3 gap-2 text-center">
          {metricItems.map((item, i) => (
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
