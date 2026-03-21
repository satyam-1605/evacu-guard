import { useState } from 'react';
import { Search, Crosshair, Bell, ChevronDown } from 'lucide-react';
import { mockStats, mockAlerts } from '../../data/mockData';

export default function TopBar({ onLocate }) {
  const [query, setQuery] = useState('');
  const stats = mockStats;
  const unread = mockAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;

  const alertLevelConfig = {
    WARNING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
    WATCH: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
    NORMAL: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  };
  const lvlCfg = alertLevelConfig[stats.current_alert_level] || alertLevelConfig.WARNING;

  return (
    <div
      className="flex items-center gap-4 px-5 py-3 flex-shrink-0"
      style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(255,255,255,0.06)', height: 60 }}
    >
      {/* Search */}
      <div className="flex-1 relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search location in Jaipur..."
          className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-primary)',
            fontFamily: "'Exo 2', sans-serif",
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.4)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* Alert Level Badge */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-xl"
        style={{ background: lvlCfg.bg, border: `1px solid ${lvlCfg.border}` }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: lvlCfg.color, animation: 'pulseDot 1.5s ease-in-out infinite', boxShadow: `0 0 6px ${lvlCfg.color}` }}
        />
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: lvlCfg.color, fontFamily: "'JetBrains Mono', monospace" }}
        >
          LEVEL {stats.alert_level_num}: {stats.current_alert_level}
        </span>
      </div>

      {/* Locate button */}
      <button
        onClick={onLocate}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
        title="Use my location"
      >
        <Crosshair size={16} />
      </button>

      {/* Notification bell */}
      <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
        <Bell size={16} />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
            style={{ background: '#ef4444', color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px' }}
          >
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
