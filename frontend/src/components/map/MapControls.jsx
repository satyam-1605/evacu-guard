/**
 * MapControls — layer toggle pills + custom zoom buttons.
 * Drop-in for EvacuationMap's inline controls.
 */
import { motion } from 'framer-motion';
import { AlertTriangle, Home, Route, Users } from 'lucide-react';
import { useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';

const LAYER_KEYS = [
  { key: 'hazards',  color: '#ef4444', Icon: AlertTriangle },
  { key: 'shelters', color: '#10b981', Icon: Home          },
  { key: 'routes',   color: '#3b82f6', Icon: Route         },
  { key: 'crowd',    color: '#f59e0b', Icon: Users         },
];

function ZoomButton({ label, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, background: 'rgba(16,185,129,0.15)' }}
      whileTap={{ scale: 0.95 }}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold transition-colors"
      style={{
        background: 'rgba(17,17,24,0.92)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'var(--text-primary)',
        backdropFilter: 'blur(12px)',
        fontFamily: "'JetBrains Mono', monospace",
        cursor: 'pointer',
      }}
    >
      {label}
    </motion.button>
  );
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <ZoomButton label="+" onClick={() => map.zoomIn()} />
      <ZoomButton label="−" onClick={() => map.zoomOut()} />
    </div>
  );
}

function LayerToggles({ layers, onToggle }) {
  const { t } = useTranslation();
  const LAYER_DEFS = LAYER_KEYS.map(({ key, color, Icon }) => ({
    key,
    label: t(`mapControls.${key}`),
    color,
    Icon,
  }));

  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-wrap gap-2 max-w-xs">
      {LAYER_DEFS.map(({ key, label, color, Icon }) => {
        const active = layers[key];
        return (
          <motion.button
            key={key}
            onClick={() => onToggle(key)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: active ? `rgba(${hexToRgb(color)}, 0.18)` : 'rgba(17,17,24,0.85)',
              border: `1px solid ${active ? color + '60' : 'rgba(255,255,255,0.10)'}`,
              color: active ? color : 'var(--text-secondary)',
              backdropFilter: 'blur(12px)',
              boxShadow: active ? `0 0 12px rgba(${hexToRgb(color)}, 0.25)` : 'none',
              fontFamily: "'Exo 2', sans-serif",
              cursor: 'pointer',
            }}
          >
            <Icon size={12} />
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * MapControls wraps both sub-components.
 * Must be rendered *inside* a <MapContainer>.
 */
export default function MapControls({ layers, onToggle }) {
  return (
    <>
      <LayerToggles layers={layers} onToggle={onToggle} />
      <ZoomControls />
    </>
  );
}
