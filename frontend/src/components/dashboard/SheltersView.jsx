import { motion } from 'framer-motion';
import { Navigation, Users, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockShelters } from '../../data/mockData';
import GlowButton from '../shared/GlowButton';

function CapacityBar({ current, total }) {
  const { t } = useTranslation();
  const pct = Math.round((current / total) * 100);
  const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
        <span>{t('sheltersView.occupancy', { current, total })}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ background: color, boxShadow: `0 0 10px ${color}50` }}
        />
      </div>
    </div>
  );
}

export default function SheltersView({ onNavigate }) {
  const { t } = useTranslation();
  const operationalCount = mockShelters.filter(s => s.status === 'open').length;
  const availableSpaces = mockShelters.reduce((a, s) => a + (s.capacity - s.current_occupancy), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
            {t('sheltersView.title')}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
            {t('sheltersView.subtitle', { count: operationalCount })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span className="text-xs font-bold" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>
            {t('sheltersView.spacesAvailable', { count: availableSpaces })}
          </span>
        </div>
      </div>

      {/* Shelter grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockShelters.map((shelter, i) => {
          const statusColor = shelter.status === 'open' ? '#10b981' : shelter.status === 'limited' ? '#f59e0b' : '#ef4444';

          return (
            <motion.div
              key={shelter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                    {shelter.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} color="var(--text-muted)" />
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {t('sheltersView.kmAway', { km: shelter.distance_km })}
                    </span>
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                  style={{
                    background: `${statusColor}15`,
                    color: statusColor,
                    border: `1px solid ${statusColor}30`,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '9px',
                  }}
                >
                  {shelter.status.toUpperCase()}
                </span>
              </div>

              {/* Capacity */}
              <CapacityBar current={shelter.current_occupancy} total={shelter.capacity} />

              {/* Amenities */}
              <div className="flex flex-wrap gap-1.5">
                {shelter.amenities.map((a) => (
                  <span
                    key={a}
                    className="text-xs px-2 py-0.5 rounded-md"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Exo 2', sans-serif" }}
                  >
                    {a}
                  </span>
                ))}
              </div>

              {/* Contact + Navigate */}
              <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-1.5">
                  <Phone size={11} color="var(--text-muted)" />
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {shelter.contact}
                  </span>
                </div>
                <GlowButton
                  variant="primary"
                  size="sm"
                  icon={Navigation}
                  onClick={() => onNavigate?.(shelter)}
                >
                  {t('sheltersView.navigate')}
                </GlowButton>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
