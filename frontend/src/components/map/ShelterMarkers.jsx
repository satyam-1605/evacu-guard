import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const createShelterIcon = (pct) => {
  const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="38" viewBox="0 0 32 38">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M16 0 C7.16 0 0 7.16 0 16 C0 27 16 38 16 38 C16 38 32 27 32 16 C32 7.16 24.84 0 16 0Z"
        fill="${color}" fill-opacity="0.9" filter="url(#glow)"/>
      <circle cx="16" cy="16" r="9" fill="rgba(0,0,0,0.5)"/>
      <text x="16" y="20" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="JetBrains Mono, monospace">S</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -40],
  });
};

export default function ShelterMarkers({ shelters, onNavigate }) {
  return shelters.map(shelter => {
    const pct = Math.round((shelter.current_occupancy / shelter.capacity) * 100);
    const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981';
    const available = shelter.capacity - shelter.current_occupancy;

    return (
      <Marker
        key={shelter.id}
        position={[shelter.lat, shelter.lng]}
        icon={createShelterIcon(pct)}
      >
        <Popup>
          <div style={{ fontFamily: "'Exo 2', sans-serif", color: '#f0f0f5', minWidth: 210 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>
              🏛 {shelter.name}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: '#8888a0' }}>Available</span>
              <span style={{ color: color, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{available} spaces</span>
              <span style={{ color: '#8888a0' }}>Capacity</span>
              <span style={{ color: '#f0f0f5', fontFamily: "'JetBrains Mono',monospace" }}>{shelter.current_occupancy}/{shelter.capacity}</span>
              <span style={{ color: '#8888a0' }}>Distance</span>
              <span style={{ color: '#f0f0f5', fontFamily: "'JetBrains Mono',monospace" }}>{shelter.distance_km} km</span>
            </div>
            {/* Capacity bar */}
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', marginBottom: 10 }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: color }} />
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
              {shelter.amenities.slice(0, 3).map(a => (
                <span key={a} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 6px', borderRadius: 6, fontSize: 10 }}>{a}</span>
              ))}
            </div>
            <button
              onClick={() => onNavigate?.(shelter)}
              style={{ width: '100%', padding: '6px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: "'Exo 2', sans-serif" }}
            >
              Navigate Here
            </button>
          </div>
        </Popup>
      </Marker>
    );
  });
}
