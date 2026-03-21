import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { mockStats } from '../../data/mockData';
import { fetchStats } from '../../services/api';
import AnimatedNumber from '../shared/AnimatedNumber';

export default function StatsBar() {
  const [stats, setStats] = useState(mockStats);
  const { t } = useTranslation();

  useEffect(() => {
    fetchStats().then(data => setStats(data));
    const id = setInterval(() => fetchStats().then(data => setStats(data)), 10000);
    return () => clearInterval(id);
  }, []);

  const items = [
    { label: t('statsBar.activeHazardZones'), value: stats.active_zones, accent: '#ef4444', suffix: '', pulse: true },
    { label: t('statsBar.shelterCapacity'), value: stats.occupied_capacity, suffix: `/${stats.total_shelter_capacity}`, accent: '#10b981' },
    { label: t('statsBar.avgEvacuationTime'), value: stats.avg_evacuation_time, suffix: ` ${t('statsBar.min')}`, accent: '#3b82f6', decimals: 1 },
    { label: t('statsBar.citizenReports'), value: stats.active_reports, suffix: ` ${t('statsBar.active')}`, accent: '#f59e0b' },
  ];

  return (
    <div
      className="flex items-stretch gap-0 flex-shrink-0"
      style={{ background: 'var(--bg-secondary)', borderTop: '1px solid rgba(255,255,255,0.06)', height: 64 }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 px-4 relative"
          style={{ borderRight: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
        >
          {/* Top accent */}
          <div className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-b" style={{ background: item.accent, opacity: 0.4 }} />

          <div className="flex items-center gap-1.5">
            {item.pulse && (
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: item.accent, animation: 'pulseDot 1.5s ease-in-out infinite', boxShadow: `0 0 6px ${item.accent}` }} />
            )}
            <span className="text-lg font-bold" style={{ color: item.accent, fontFamily: "'JetBrains Mono', monospace" }}>
              <AnimatedNumber value={item.value} suffix={item.suffix} decimals={item.decimals || 0} />
            </span>
          </div>
          <span className="text-xs tracking-wide" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
