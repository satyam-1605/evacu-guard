import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Brain, CloudSun, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

export default function SystemStatus() {
  const [status, setStatus] = useState(null);
  const [pingMs, setPingMs] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchStatus() {
      const t0 = performance.now();
      try {
        const { data } = await api.get('/api/admin/status', { timeout: 4000 });
        setPingMs(Math.round(performance.now() - t0));
        setStatus(data);
      } catch {
        setPingMs(null);
        setStatus(null);
      }
    }
    fetchStatus();
    const id = setInterval(fetchStatus, 8000);
    return () => clearInterval(id);
  }, []);

  const apiOnline = !!status;
  const mlLoaded = status?.ml_model === true;
  const weatherOnline = status?.weather_service === 'online';
  const wsCount = status?.websocket_connections ?? 0;

  const services = [
    {
      name: t('systemStatus.apiServer'),
      icon: Wifi,
      online: apiOnline,
      meta1: { label: t('systemStatus.latency'), value: apiOnline ? `${pingMs ?? '—'}ms` : '—' },
      meta2: { label: t('systemStatus.status'), value: apiOnline ? (status?.api ?? t('systemStatus.online').toLowerCase()) : t('systemStatus.offline').toLowerCase() },
    },
    {
      name: t('systemStatus.mlModel'),
      icon: Brain,
      online: mlLoaded,
      meta1: { label: t('systemStatus.type'), value: t('systemStatus.randomForest') },
      meta2: { label: t('systemStatus.status'), value: mlLoaded ? t('systemStatus.loaded') : apiOnline ? t('systemStatus.fallback') : '—' },
    },
    {
      name: t('systemStatus.weatherService'),
      icon: CloudSun,
      online: weatherOnline,
      meta1: { label: t('systemStatus.source'), value: 'Open-Meteo' },
      meta2: { label: t('systemStatus.status'), value: weatherOnline ? t('systemStatus.live') : apiOnline ? t('systemStatus.cached') : '—' },
    },
    {
      name: t('systemStatus.websocket'),
      icon: Radio,
      online: apiOnline,
      meta1: { label: t('systemStatus.connections'), value: apiOnline ? `${wsCount}` : '—' },
      meta2: {
        label: t('systemStatus.scenarios'),
        value: status?.active_scenarios?.length ? status.active_scenarios.join(', ') : t('systemStatus.none'),
      },
    },
  ];

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
        {t('systemStatus.title')}
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((svc, i) => {
          const Icon = svc.icon;
          const color = svc.online ? '#10b981' : '#ef4444';

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${svc.online ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}` }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />

              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon size={17} color={color} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full"
                    style={{ background: color, animation: 'pulseDot 1.5s ease-in-out infinite', boxShadow: `0 0 6px ${color}` }} />
                  <span className="text-xs font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {svc.online ? t('systemStatus.online') : t('systemStatus.offline')}
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                {svc.name}
              </p>

              <div className="flex gap-3">
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{svc.meta1.label}</p>
                  <p className="text-xs font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{svc.meta1.value}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{svc.meta2.label}</p>
                  <p className="text-xs font-bold truncate" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{svc.meta2.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
