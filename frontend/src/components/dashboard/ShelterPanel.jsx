import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockShelters } from '../../data/mockData';
import { fetchShelters } from '../../services/api';
import GlowButton from '../shared/GlowButton';

function CapacityBar({ current, total }) {
  const { t } = useTranslation();
  const pct = Math.round((current / total) * 100);
  const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
        <span>{t('shelterPanel.capacity', { current, total })}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ background: color, boxShadow: `0 0 8px ${color}40` }}
        />
      </div>
    </div>
  );
}

export default function ShelterPanel({ onNavigate, location }) {
  const [shelters, setShelters] = useState(mockShelters);
  const { t } = useTranslation();

  useEffect(() => {
    fetchShelters(location?.lat ?? null, location?.lng ?? null)
      .then(data => setShelters(Array.isArray(data) ? data : mockShelters));
  }, [location?.lat, location?.lng]);

  const top3 = shelters.slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold tracking-wide uppercase" style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif" }}>
          {t('shelterPanel.title')}
        </h3>
        <Users size={14} style={{ color: 'var(--text-muted)' }} />
      </div>

      <div className="flex flex-col gap-3">
        {top3.map((shelter, i) => {
          const statusColor = shelter.status === 'open' ? '#10b981' : shelter.status === 'limited' ? '#f59e0b' : '#ef4444';
          return (
            <motion.div
              key={shelter.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                    {shelter.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {t('shelterPanel.kmAway', { km: shelter.distance_km })}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30`, fontFamily: "'JetBrains Mono', monospace", fontSize: '9px' }}
                >
                  {shelter.status.toUpperCase()}
                </span>
              </div>

              <CapacityBar current={shelter.current_occupancy} total={shelter.capacity} />

              <div className="mt-2">
                <GlowButton
                  variant="primary"
                  size="sm"
                  icon={Navigation}
                  fullWidth
                  onClick={() => onNavigate?.(shelter)}
                >
                  {t('shelterPanel.navigate')}
                </GlowButton>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
