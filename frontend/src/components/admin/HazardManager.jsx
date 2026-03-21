import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockHazards, severityConfig } from '../../data/mockData';
import RiskBadge from '../shared/RiskBadge';
import { Edit3, Plus } from 'lucide-react';
import GlowButton from '../shared/GlowButton';

export default function HazardManager() {
  const [zones, setZones] = useState(
    mockHazards.features.map(f => ({ ...f.properties, id: f.properties.id }))
  );

  const updateSeverity = (id, newSev) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, severity: newSev } : z));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
          Hazard Zone Manager
        </h3>
        <GlowButton variant="primary" size="sm" icon={Plus}>Add Zone</GlowButton>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Zone Name', 'Severity', 'Type', 'Risk Score', 'Population'].map(h => (
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
                  <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {zone.affected_population?.toLocaleString()}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
