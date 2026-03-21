import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Send, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlowButton from '../shared/GlowButton';
import { formatTimeAgo } from '../../data/mockData';

const recentBroadcasts = [
  { msg: 'IMD Orange Alert: Heavy rainfall expected in next 6 hours. All Jaipur residents on alert.', severity: 'warning', time: new Date(Date.now() - 15 * 60000).toISOString() },
  { msg: 'Dravyavati river water level critical. Mansarovar residents evacuate immediately.', severity: 'critical', time: new Date(Date.now() - 45 * 60000).toISOString() },
  { msg: 'SMS Stadium shelter now operational. 500 capacity available. Food and medical aid provided.', severity: 'info', time: new Date(Date.now() - 90 * 60000).toISOString() },
];

const SEVERITY_KEYS = ['info', 'warning', 'critical', 'emergency'];
const SEVERITY_COLORS = { info: '#3b82f6', warning: '#f59e0b', critical: '#ef4444', emergency: '#9333ea' };

export default function AlertBroadcast() {
  const [msg, setMsg] = useState('');
  const [severity, setSeverity] = useState('warning');
  const [broadcasts, setBroadcasts] = useState(recentBroadcasts);
  const [sent, setSent] = useState(false);
  const { t } = useTranslation();

  const severities = SEVERITY_KEYS.map(key => ({
    key,
    label: t(`alertBroadcast.severityLabels.${key}`),
    color: SEVERITY_COLORS[key],
  }));

  const handleSend = () => {
    if (!msg.trim()) return;
    const newBroadcast = { msg: msg.trim(), severity, time: new Date().toISOString() };
    setBroadcasts(prev => [newBroadcast, ...prev]);
    setMsg('');
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Megaphone size={16} color="#ef4444" />
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
          {t('alertBroadcast.title')}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="p-5 rounded-2xl flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Severity picker */}
          <div>
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{t('alertBroadcast.severity')}</label>
            <div className="flex gap-2">
              {severities.map(s => (
                <button
                  key={s.key}
                  onClick={() => setSeverity(s.key)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
                  style={{
                    background: severity === s.key ? `${s.color}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${severity === s.key ? `${s.color}50` : 'rgba(255,255,255,0.08)'}`,
                    color: severity === s.key ? s.color : 'var(--text-muted)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{t('alertBroadcast.emergencyMessage')}</label>
            <textarea
              rows={4}
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder={t('alertBroadcast.messagePlaceholder')}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{msg.length}/500</p>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-3 rounded-xl text-center text-sm font-bold"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontFamily: "'Exo 2', sans-serif" }}
              >
                {t('alertBroadcast.broadcastSent')}
              </motion.div>
            ) : (
              <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GlowButton variant="danger" size="md" icon={Send} fullWidth onClick={handleSend} disabled={!msg.trim()}>
                  {t('alertBroadcast.broadcastToAll')}
                </GlowButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent broadcasts */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              {t('alertBroadcast.recentBroadcasts')}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {broadcasts.slice(0, 4).map((b, i) => {
                const c = severities.find(s => s.key === b.severity) || severities[0];
                return (
                  <motion.div
                    key={`${b.time}-${i}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-xl"
                    style={{ background: `${c.color}08`, border: `1px solid ${c.color}20`, borderLeft: `3px solid ${c.color}` }}
                  >
                    <p className="text-xs mb-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
                      {b.msg}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase" style={{ color: c.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '9px' }}>
                        {c.label}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatTimeAgo(b.time)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
