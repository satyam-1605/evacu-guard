import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Send } from 'lucide-react';
import GlowButton from '../shared/GlowButton';

const hazardTypes = ['Flooding', 'Road Block', 'Waterlogging', 'Fire', 'Tree Fall', 'Power Outage', 'Other'];
const severities = ['low', 'medium', 'high', 'critical'];

export default function ReportHazardModal({ open, onClose }) {
  const [form, setForm] = useState({ type: 'Flooding', severity: 'medium', description: '', location: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); onClose(); }, 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative glass-card p-6 w-full max-w-md z-10"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, transparent, #f59e0b60, transparent)' }} />

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} color="#f59e0b" />
                <h3 className="text-base font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
                  Report Hazard
                </h3>
              </div>
              <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="text-4xl mb-3">✅</div>
                <p className="text-emerald-400 font-bold" style={{ fontFamily: "'Exo 2', sans-serif" }}>Report Submitted!</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Authorities have been notified.</p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Hazard type */}
                <div>
                  <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>Hazard Type</label>
                  <div className="flex flex-wrap gap-2">
                    {hazardTypes.map(t => (
                      <button
                        key={t}
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className="px-3 py-1.5 rounded-lg text-xs transition-all"
                        style={{
                          background: form.type === t ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${form.type === t ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: form.type === t ? '#f59e0b' : 'var(--text-secondary)',
                          fontFamily: "'Exo 2', sans-serif",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>Severity</label>
                  <div className="flex gap-2">
                    {severities.map(s => {
                      const colors = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
                      const c = colors[s];
                      return (
                        <button
                          key={s}
                          onClick={() => setForm(f => ({ ...f, severity: s }))}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
                          style={{
                            background: form.severity === s ? `${c}20` : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${form.severity === s ? `${c}50` : 'rgba(255,255,255,0.08)'}`,
                            color: form.severity === s ? c : 'var(--text-secondary)',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>Location</label>
                  <input
                    placeholder="e.g. Near Mansarovar bridge..."
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the hazard in detail..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}
                  />
                </div>

                <GlowButton variant="primary" size="md" icon={Send} fullWidth onClick={handleSubmit}>
                  Submit Report
                </GlowButton>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
