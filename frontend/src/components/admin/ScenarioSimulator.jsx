import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, CloudLightning, AlertTriangle, Play, CheckCircle, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockScenarios } from '../../data/mockData';
import GlowButton from '../shared/GlowButton';
import { activateScenario } from '../../services/api';

const iconMap = { monsoon_flood: Waves, cloudburst: CloudLightning, multi_hazard: AlertTriangle };
const accentMap = {
  info:     { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
  critical: { color: '#9333ea', bg: 'rgba(147,51,234,0.1)', border: 'rgba(147,51,234,0.25)' },
  danger:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
};

function ConfirmModal({ scenario, onConfirm, onCancel }) {
  const { t } = useTranslation();
  const Icon = iconMap[scenario.id] || AlertTriangle;
  const cfg = accentMap[scenario.accent] || accentMap.danger;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        className="relative glass-card p-6 w-full max-w-sm z-10"
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        style={{ borderColor: cfg.border }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}60, transparent)` }} />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon size={18} color={cfg.color} />
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif" }}>{t('scenarioSimulator.confirmActivation')}</span>
          </div>
          <button onClick={onCancel} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <p className="text-sm mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
          {t('scenarioSimulator.activateScenario')} <strong style={{ color: cfg.color }}>{scenario.name}</strong>?
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
          {t('scenarioSimulator.willEscalate', { zones: scenario.zones_affected, evacuees: scenario.estimated_evacuees.toLocaleString() })}
        </p>

        <div className="flex gap-3">
          <GlowButton variant="ghost" size="sm" onClick={onCancel} className="flex-1">{t('scenarioSimulator.cancel')}</GlowButton>
          <GlowButton variant="danger" size="sm" icon={Play} onClick={onConfirm} className="flex-1">{t('scenarioSimulator.activate')}</GlowButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ScenarioSimulator() {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(null);
  const [active, setActive] = useState(null);
  const [progress, setProgress] = useState(0);
  const [apiStatus, setApiStatus] = useState(null); // 'live' | 'simulated' | null

  const handleActivate = async (scenario) => {
    setConfirming(null);
    setActive(scenario);
    setProgress(0);
    setApiStatus(null);

    // Animate progress bar over scenario duration
    const totalMs = scenario.duration_sec * 1000;
    const stepMs = 200;
    const increment = (stepMs / totalMs) * 100;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return Math.min(prev + increment, 100);
      });
    }, stepMs);

    // Call real backend API
    const result = await activateScenario(scenario.id);
    setApiStatus(result.status === 'activated' ? 'live' : 'simulated');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
          {t('scenarioSimulator.title')}
        </h3>
        <span
          className="text-xs px-2 py-1 rounded-lg"
          style={{
            background: apiStatus === 'live' ? 'rgba(16,185,129,0.1)' : 'rgba(147,51,234,0.1)',
            color: apiStatus === 'live' ? '#10b981' : '#9333ea',
            border: `1px solid ${apiStatus === 'live' ? 'rgba(16,185,129,0.2)' : 'rgba(147,51,234,0.2)'}`,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {apiStatus === 'live' ? t('scenarioSimulator.live') : apiStatus === 'simulated' ? t('scenarioSimulator.simulated') : t('scenarioSimulator.ready')}
        </span>
      </div>

      {/* Active scenario progress */}
      <AnimatePresence>
        {active && progress < 100 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {t('scenarioSimulator.activating', { name: active.name.toUpperCase() })}
              </span>
              <span className="text-xs text-red-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.2)' }}>
              <motion.div
                className="h-full rounded-full bg-red-400"
                style={{ width: `${progress}%`, boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
              {apiStatus === 'live'
                ? t('scenarioSimulator.escalating', { zones: active.zones_affected })
                : t('scenarioSimulator.simulating', { zones: active.zones_affected })}
            </p>
          </motion.div>
        )}
        {active && progress >= 100 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-2xl flex items-center gap-2"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <CheckCircle size={14} color="#10b981" />
            <span className="text-xs text-emerald-400 font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {t('scenarioSimulator.fullyActivated', { name: active.name })}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockScenarios.map((scenario, i) => {
          const Icon = iconMap[scenario.id] || AlertTriangle;
          const cfg = accentMap[scenario.accent] || accentMap.danger;
          const isActive = active?.id === scenario.id && progress >= 100;
          const isRunning = active?.id === scenario.id && progress < 100;

          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl flex flex-col relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${cfg.bg}, rgba(10,10,15,0.6))`,
                border: `1px solid ${cfg.border}`,
                boxShadow: isActive ? `0 0 24px ${cfg.color}20` : 'none',
              }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}80, transparent)` }} />

              {/* Card body */}
              <div className="p-5 flex flex-col gap-3 flex-1">
                {/* Icon + status */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}35`, boxShadow: `0 0 16px ${cfg.color}20` }}>
                    <Icon size={22} color={cfg.color} />
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                      style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                      <CheckCircle size={11} color={cfg.color} />
                      <span className="text-xs font-bold" style={{ color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>ACTIVE</span>
                    </div>
                  )}
                  {isRunning && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <Loader2 size={11} color="#ef4444" className="animate-spin" />
                      <span className="text-xs font-bold" style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>RUNNING</span>
                    </div>
                  )}
                </div>

                {/* Name + subtitle */}
                <div>
                  <h4 className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                    {scenario.name}
                  </h4>
                  <p className="text-xs font-semibold mb-2" style={{ color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {scenario.subtitle}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
                    {scenario.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 mt-auto" style={{ borderTop: `1px solid ${cfg.color}15` }}>
                  <div className="rounded-lg p-2" style={{ background: `${cfg.color}08` }}>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{t('scenarioSimulator.zones')}</p>
                    <p className="text-base font-black leading-none" style={{ color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>{scenario.zones_affected}</p>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: `${cfg.color}08` }}>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{t('scenarioSimulator.evacuees')}</p>
                    <p className="text-base font-black leading-none" style={{ color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>{(scenario.estimated_evacuees / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>

              {/* Activate button */}
              <div className="px-5 pb-5">
                <motion.button
                  whileHover={!isActive && !isRunning ? { scale: 1.02, boxShadow: `0 0 20px ${cfg.color}40` } : {}}
                  whileTap={!isActive && !isRunning ? { scale: 0.98 } : {}}
                  disabled={isActive || isRunning}
                  onClick={() => setConfirming(scenario)}
                  className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: isActive ? `${cfg.color}10` : `${cfg.color}20`,
                    border: `1px solid ${isActive ? `${cfg.color}25` : `${cfg.color}50`}`,
                    color: isActive ? `${cfg.color}80` : cfg.color,
                    fontFamily: "'Exo 2', sans-serif",
                    cursor: isActive || isRunning ? 'not-allowed' : 'pointer',
                    boxShadow: !isActive && !isRunning ? `inset 0 1px 0 ${cfg.color}20` : 'none',
                  }}
                >
                  {isActive ? <><CheckCircle size={14} /> {t('scenarioSimulator.active')}</> : isRunning ? <><Loader2 size={14} className="animate-spin" /> {t('scenarioSimulator.running')}...</> : <><Play size={14} /> {t('scenarioSimulator.activate')}</>}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirming && (
          <ConfirmModal
            scenario={confirming}
            onConfirm={() => handleActivate(confirming)}
            onCancel={() => setConfirming(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
