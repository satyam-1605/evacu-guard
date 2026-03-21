import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { mockHazards, severityConfig } from '../../data/mockData';
import { Plus, X, Loader2, CheckCircle } from 'lucide-react';
import GlowButton from '../shared/GlowButton';
import { upsertHazard } from '../../services/api';

const ZONE_TYPES = ['flood', 'waterlogging', 'landslide', 'fire', 'structural', 'other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const RISK_SCORE_MAP = { low: 25, medium: 55, high: 78, critical: 92 };

function AddZoneModal({ onAdd, onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', type: 'flood', severity: 'medium', population: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError(t('hazardManager.zoneNameRequired'));
    setLoading(true);
    setError('');
    try {
      await upsertHazard({ name: form.name, type: form.type, severity: form.severity, polygon: null });
    } catch { /* backend optional — add locally regardless */ }
    onAdd({
      id: `hz-custom-${Date.now()}`,
      name: form.name,
      type: form.type,
      severity: form.severity,
      risk_score: RISK_SCORE_MAP[form.severity],
      affected_population: parseInt(form.population, 10) || 0,
    });
    setLoading(false);
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontFamily: "'Exo 2', sans-serif",
    fontSize: 13,
    outline: 'none',
    width: '100%',
    padding: '8px 12px',
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-sm rounded-2xl p-6"
        initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
        style={{ background: 'rgba(17,17,24,0.98)', border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)' }} />

        <div className="flex items-center justify-between mb-5">
          <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif" }}>
            {t('hazardManager.addHazardZone')}
          </h4>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{t('hazardManager.zoneName')}</label>
            <input value={form.name} onChange={set('name')} placeholder={t('hazardManager.zoneNamePlaceholder')} style={inputStyle} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{t('hazardManager.type')}</label>
              <select value={form.type} onChange={set('type')} style={inputStyle}>
                {ZONE_TYPES.map(zoneType => <option key={zoneType} value={zoneType} style={{ background: '#111118' }}>{zoneType.charAt(0).toUpperCase() + zoneType.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{t('hazardManager.severity')}</label>
              <select value={form.severity} onChange={set('severity')} style={{ ...inputStyle, color: severityConfig[form.severity]?.color || 'var(--text-primary)' }}>
                {SEVERITIES.map(s => <option key={s} value={s} style={{ background: '#111118' }}>{s.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{t('hazardManager.affectedPopulation')}</label>
            <input type="number" min="0" value={form.population} onChange={set('population')} placeholder={t('hazardManager.populationPlaceholder')} style={inputStyle} />
          </div>

          {error && <p className="text-xs" style={{ color: '#ef4444', fontFamily: "'Exo 2', sans-serif" }}>{error}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
              {t('hazardManager.cancel')}
            </button>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontFamily: "'Exo 2', sans-serif" }}>
              {loading ? <><Loader2 size={13} className="animate-spin" /> {t('hazardManager.adding')}</> : <><CheckCircle size={13} /> {t('hazardManager.addZoneBtn')}</>}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function HazardManager() {
  const { t } = useTranslation();
  const [zones, setZones] = useState(
    mockHazards.features.map(f => ({ ...f.properties, id: f.properties.id }))
  );
  const [showModal, setShowModal] = useState(false);

  const updateSeverity = (id, newSev) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, severity: newSev } : z));
  };

  const updatePopulation = (id, val) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
    setZones(prev => prev.map(z => z.id === id ? { ...z, affected_population: isNaN(num) ? 0 : num } : z));
  };

  const removeZone = (id) => setZones(prev => prev.filter(z => z.id !== id));

  const handleAdd = (zone) => {
    setZones(prev => [...prev, zone]);
    setShowModal(false);
  };

  return (
    <div>
      <AnimatePresence>
        {showModal && <AddZoneModal onAdd={handleAdd} onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
          {t('hazardManager.title')}
        </h3>
        <GlowButton variant="primary" size="sm" icon={Plus} onClick={() => setShowModal(true)}>{t('hazardManager.addZone')}</GlowButton>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[t('hazardManager.columns.zoneName'), t('hazardManager.columns.severity'), t('hazardManager.columns.type'), t('hazardManager.columns.riskScore'), t('hazardManager.columns.population'), ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((zone, i) => (
              <motion.tr
                key={zone.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                    {zone.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={zone.severity}
                    onChange={e => updateSeverity(zone.id, e.target.value)}
                    className="text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                    style={{
                      background: severityConfig[zone.severity]?.bg || 'rgba(255,255,255,0.05)',
                      border: `1px solid ${severityConfig[zone.severity]?.border || 'rgba(255,255,255,0.1)'}`,
                      color: severityConfig[zone.severity]?.color || 'var(--text-secondary)',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {['low', 'medium', 'high', 'critical'].map(s => (
                      <option key={s} value={s} style={{ background: '#111118' }}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
                    {zone.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${zone.risk_score}%`,
                          background: zone.risk_score >= 75 ? '#ef4444' : zone.risk_score >= 50 ? '#f59e0b' : '#10b981',
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {zone.risk_score}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={zone.affected_population?.toLocaleString() ?? '0'}
                    onChange={e => updatePopulation(zone.id, e.target.value)}
                    className="text-xs w-24 px-2 py-1 rounded-lg outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--text-primary)',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </td>
                <td className="px-4 py-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeZone(zone.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.45)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
                    title="Remove zone"
                  >
                    <X size={12} />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
