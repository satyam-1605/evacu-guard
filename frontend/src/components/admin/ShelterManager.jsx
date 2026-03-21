import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockShelters } from '../../data/mockData';
import GlowButton from '../shared/GlowButton';
import { Building2 } from 'lucide-react';

export default function ShelterManager() {
  const [shelters, setShelters] = useState(mockShelters);

  const updateOccupancy = (id, value) => {
    setShelters(prev => prev.map(s => s.id === id ? { ...s, current_occupancy: Math.max(0, Math.min(s.capacity, parseInt(value) || 0)) } : s));
  };

  const toggleStatus = (id) => {
    setShelters(prev => prev.map(s => s.id === id ? {
      ...s,
      status: s.status === 'open' ? 'closed' : s.status === 'closed' ? 'limited' : 'open'
    } : s));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
            Shelter Manager
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {shelters.map((shelter, i) => {
          const pct = Math.round((shelter.current_occupancy / shelter.capacity) * 100);
          const barColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981';
          const statusColors = { open: '#10b981', limited: '#f59e0b', closed: '#ef4444' };
          const statusColor = statusColors[shelter.status] || '#10b981';

          return (
            <motion.div
              key={shelter.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-4 rounded-2xl flex flex-col gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                    {shelter.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {shelter.lat.toFixed(4)}, {shelter.lng.toFixed(4)}
                  </p>
                </div>
                <button
                  onClick={() => toggleStatus(shelter.id)}
                  className="text-xs font-bold px-2 py-1 rounded-lg transition-all"
                  style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}30`, color: statusColor, fontFamily: "'JetBrains Mono', monospace", fontSize: '9px' }}
                >
                  {shelter.status.toUpperCase()}
                </button>
              </div>

              {/* Capacity bar */}
              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>Occupancy</span>
                  <span style={{ color: barColor }}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 6px ${barColor}50` }} />
                </div>
              </div>

              {/* Editable occupancy */}
              <div className="flex items-center gap-2">
                <label className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", whiteSpace: 'nowrap' }}>Current:</label>
                <input
                  type="number"
                  value={shelter.current_occupancy}
                  onChange={e => updateOccupancy(shelter.id, e.target.value)}
                  className="flex-1 px-2 py-1 rounded-lg text-xs outline-none text-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                  / {shelter.capacity}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {shelter.amenities.map(a => (
                  <span key={a} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", fontSize: '10px' }}>
                    {a}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
