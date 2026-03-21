import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, CloudLightning, AlertTriangle, Play, CheckCircle, X, Loader2 } from 'lucide-react';
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
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif" }}>Confirm Activation</span>
          </div>
          <button onClick={onCancel} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <p className="text-sm mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
          Activate scenario: <strong style={{ color: cfg.color }}>{scenario.name}</strong>?
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
          This will escalate {scenario.zones_affected} zones and alert ~{scenario.estimated_evacuees.toLocaleString()} residents via all channels.
        </p>

        <div className="flex gap-3">
          <GlowButton variant="ghost" size="sm" onClick={onCancel} className="flex-1">Cancel</GlowButton>
          <GlowButton variant="danger" size="sm" icon={Play} onClick={onConfirm} className="flex-1">Activate</GlowButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ScenarioSimulator() {
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
          Scenario Simulator
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
          {apiStatus === 'live' ? '● LIVE' : apiStatus === 'simulated' ? 'SIMULATED' : 'READY'}
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
                ⚡ ACTIVATING: {active.name.toUpperCase()}
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
                ? `⚡ Live — escalating ${active.zones_affected} zones, broadcasting WebSocket alerts...`
                : `Simulating ${active.zones_affected} zone escalations...`}
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
              {active.name} scenario fully activated
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockScenarios.map((scenario, i) => {
          const Icon = iconMap[scenario.id] || AlertTriangle;
          const cfg = accentMap[scenario.accent] || accentMap.danger;
          const isActive = active?.id === scenario.id && progress >= 100;

          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden"
              style={{
                background: isActive ? cfg.bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? cfg.border : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}50, transparent)` }} />

              {isActive && (
                <div className="absolute top-3 right-3">
                  <CheckCircle size={14} color={cfg.color} />
                </div>
              )}

              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <Icon size={20} color={cfg.color} />
              </div>

              <div>
                <h4 className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                  {scenario.name}
                </h4>
                <p className="text-xs mb-2" style={{ color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {scenario.subtitle}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
                  {scenario.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 py-2 border-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Zones</p>
                  <p className="text-sm font-bold" style={{ color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>{scenario.zones_affected}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Evacuees</p>
                  <p className="text-sm font-bold" style={{ color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>{(scenario.estimated_evacuees / 1000).toFixed(0)}K</p>
                </div>
              </div>

              <GlowButton
                variant={isActive ? 'ghost' : 'danger'}
                size="sm"
                icon={isActive ? CheckCircle : Play}
                fullWidth
                disabled={isActive}
                onClick={() => setConfirming(scenario)}
              >
                {isActive ? 'Active' : 'Activate'}
              </GlowButton>
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
