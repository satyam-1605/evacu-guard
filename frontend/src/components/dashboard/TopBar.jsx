import { useState, useEffect, useRef } from 'react';
import { Search, Crosshair, Bell, Loader2, MapPin, X } from 'lucide-react';
import { mockStats, mockAlerts } from '../../data/mockData';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

async function searchJaipur(query) {
  const url = `${NOMINATIM}?q=${encodeURIComponent(query + ', Jaipur')}&format=json&limit=6&addressdetails=1&countrycodes=in`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export default function TopBar({ onLocate, location, locationLoading, locationError, onSearchSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const stats = mockStats;
  const unread = mockAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;

  const alertLevelConfig = {
    WARNING:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
    CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
    WATCH:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)'  },
    NORMAL:   { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)'  },
  };
  const lvlCfg = alertLevelConfig[stats.current_alert_level] || alertLevelConfig.WARNING;

  // Debounced Nominatim search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchJaipur(query);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch (err) {
        console.error('[Search] Nominatim error:', err);
        setSuggestions([]);
        setOpen(false);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Position dropdown using fixed positioning relative to input (avoids z-index stacking context)
  const openDropdown = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
    });
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reposition when open
  useEffect(() => {
    if (open) openDropdown();
  }, [open]);

  const handleSelect = (result) => {
    const name = result.display_name.split(',').slice(0, 2).join(',').trim();
    setQuery(result.display_name.split(',')[0]);
    setOpen(false);
    setSuggestions([]);
    onSearchSelect?.({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name,
    });
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    onSearchSelect?.(null);
  };

  return (
    <div
      className="flex items-center gap-4 px-5 py-3 flex-shrink-0"
      style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(255,255,255,0.06)', height: 60 }}
    >
      {/* Search */}
      <div ref={wrapperRef} className="flex-1 relative max-w-md">
        {searching
          ? <Loader2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: '#10b981' }} />
          : <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        }
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search location in Jaipur..."
          autoComplete="off"
          spellCheck={false}
          className="w-full pl-9 pr-8 py-2 rounded-xl text-sm outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${open ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: 'var(--text-primary)',
            fontFamily: "'Exo 2', sans-serif",
          }}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={13} />
          </button>
        )}

        {/* Dropdown rendered with fixed position to escape all stacking contexts */}
        {open && suggestions.length > 0 && (
          <div
            style={{
              ...dropdownStyle,
              background: 'rgba(17,17,24,0.99)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
              overflow: 'hidden',
            }}
          >
            {suggestions.map((result, i) => {
              const primary = result.display_name.split(',')[0];
              const secondary = result.display_name.split(',').slice(1, 3).join(',').trim();
              return (
                <button
                  key={result.place_id}
                  onMouseDown={e => { e.preventDefault(); handleSelect(result); }}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                  style={{ borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <MapPin size={13} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                      {primary}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
                      {secondary}
                    </p>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {parseFloat(result.lat).toFixed(3)}°N
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Alert Level Badge */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0"
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

      {/* Live coordinates */}
      {location && (
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl flex-shrink-0"
          style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: location.isFallback ? '#f59e0b' : '#10b981',
              boxShadow: `0 0 6px ${location.isFallback ? '#f59e0b' : '#10b981'}`,
              animation: 'pulseDot 1.5s ease-in-out infinite',
            }}
          />
          <span className="text-xs" style={{ color: location.isFallback ? '#f59e0b' : '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>
            {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
          </span>
          {location.accuracy && (
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              ±{location.accuracy}m
            </span>
          )}
        </div>
      )}

      {/* Locate button */}
      <button
        onClick={onLocate}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
        style={{
          background: locationLoading ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${locationLoading ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
          color: locationLoading ? '#10b981' : 'var(--text-secondary)',
        }}
        title={locationError ? `GPS error: ${locationError}` : 'Refresh my location'}
      >
        {locationLoading
          ? <Loader2 size={16} className="animate-spin" />
          : <Crosshair size={16} style={{ color: locationError ? '#f59e0b' : undefined }} />
        }
      </button>

      {/* Notification bell */}
      <button
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
            style={{ background: '#ef4444', color: '#fff', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
