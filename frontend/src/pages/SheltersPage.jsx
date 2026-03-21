import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Navigation, Users, ChevronUp, ChevronDown, Minus, Loader2 } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import { mockShelters } from '../data/mockData';
import { computeRoute } from '../services/api';

const AMENITY_COLORS = {
  Food:        { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', color: '#f59e0b' },
  Water:       { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', color: '#3b82f6' },
  Medical:     { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.35)',  color: '#ef4444' },
  Electricity: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.35)',color: '#a855f7' },
  Toilets:     { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)', color: '#94a3b8' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function occupancyPct(s) {
  return Math.round((s.current_occupancy / s.capacity) * 100);
}

function barColor(pct) {
  if (pct >= 80) return '#ef4444';
  if (pct >= 50) return '#f59e0b';
  return '#10b981';
}

function statusBadge(status) {
  const map = {
    open:    { label: 'OPEN',    bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#10b981' },
    limited: { label: 'LIMITED', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', color: '#f59e0b' },
    full:    { label: 'FULL',    bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  color: '#ef4444' },
  };
  return map[status] || map.open;
}

function makeMarkerIcon(selected) {
  const color = selected ? '#10b981' : '#22c55e';
  const glow = selected ? '0 0 12px #10b981' : 'none';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${selected ? 18 : 14}px;
      height:${selected ? 18 : 14}px;
      border-radius:50%;
      background:${color};
      border:2px solid rgba(255,255,255,0.8);
      box-shadow:${glow};
      transition:all 0.2s;
    "></div>`,
    iconSize:   [selected ? 18 : 14, selected ? 18 : 14],
    iconAnchor: [selected ? 9 : 7, selected ? 9 : 7],
  });
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 16, { duration: 1.2 });
  }, [target, map]);
  return null;
}

function sortShelters(list, sort) {
  const copy = [...list];
  if (sort === 'distance')     return copy.sort((a, b) => a.distance_km - b.distance_km);
  if (sort === 'capacity')     return copy.sort((a, b) => b.capacity - a.capacity);
  if (sort === 'availability') return copy.sort((a, b) => (a.current_occupancy / a.capacity) - (b.current_occupancy / b.capacity));
  return copy;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

const totalCapacity  = mockShelters.reduce((s, x) => s + x.capacity, 0);
const totalOccupied  = mockShelters.reduce((s, x) => s + x.current_occupancy, 0);
const totalAvailable = totalCapacity - totalOccupied;

// ─── Component ───────────────────────────────────────────────────────────────

export default function SheltersPage() {
  const navigate          = useNavigate();
  const { t } = useTranslation();
  const [selectedId,    setSelectedId]    = useState(null);
  const [flyTarget,     setFlyTarget]     = useState(null);
  const [routeCoords,   setRouteCoords]   = useState(null);
  const [routeLoading,  setRouteLoading]  = useState(false);
  const [userLocation,  setUserLocation]  = useState(null);
  const [search,        setSearch]        = useState('');
  const [activeFilter,  setFilter]        = useState('all');
  const [sort,          setSort]          = useState('distance');
  const cardRefs = useRef({});

  // Get user location on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation({ lat: 26.8800, lng: 75.7900 }), // Jaipur fallback
    );
  }, []);

  const handleGetDirections = async (shelter) => {
    setSelectedId(shelter.id);
    setFlyTarget({ lat: shelter.lat, lng: shelter.lng });
    setRouteCoords(null);
    setRouteLoading(true);
    try {
      const lat = userLocation?.lat ?? 26.8800;
      const lng = userLocation?.lng ?? 75.7900;
      const result = await computeRoute({ lat, lng, shelter_id: shelter.id });
      const coords = result.route_coordinates ?? result.graph_path ?? [];
      setRouteCoords(coords);
    } catch {
      // fallback: draw straight line
      const lat = userLocation?.lat ?? 26.8800;
      const lng = userLocation?.lng ?? 75.7900;
      setRouteCoords([[lat, lng], [shelter.lat, shelter.lng]]);
    } finally {
      setRouteLoading(false);
    }
  };

  // Scroll right panel to selected card
  useEffect(() => {
    if (selectedId && cardRefs.current[selectedId]) {
      cardRefs.current[selectedId].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  // Filter + search + sort
  const filtered = sortShelters(
    mockShelters.filter(s => {
      const matchSearch  = s.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter  = activeFilter === 'all' || s.amenities.map(a => a.toLowerCase()).includes(activeFilter.toLowerCase());
      return matchSearch && matchFilter;
    }),
    sort,
  );

  return (
    <PublicLayout>
      {/* ── Full-screen split layout ── */}
      <div
        className="flex pt-16"
        style={{ height: '100vh', minHeight: 0, overflow: 'hidden' }}
      >
        {/* ── LEFT: Map (55%) ── */}
        <div className="relative flex-shrink-0" style={{ width: '55%', height: '100%' }}>
          <MapContainer
            center={[26.9124, 75.7873]}
            zoom={12}
            style={{ width: '100%', height: '100%', background: '#0a0a0f' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
              maxZoom={20}
            />
            <FlyTo target={flyTarget} />
            {routeCoords && (
              <Polyline
                positions={routeCoords}
                pathOptions={{ color: '#10b981', weight: 4, opacity: 0.85, dashArray: null }}
              />
            )}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={makeMarkerIcon(false)} />
            )}
            {mockShelters.map(s => (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={makeMarkerIcon(selectedId === s.id)}
                eventHandlers={{ click: () => setSelectedId(s.id) }}
              >
                <Popup>
                  <div style={{ fontFamily: "'Exo 2', sans-serif", minWidth: 160 }}>
                    <strong style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13 }}>{s.name}</strong>
                    <div style={{ marginTop: 4, color: '#6b7280', fontSize: 12 }}>
                      {s.current_occupancy}/{s.capacity} spaces · {s.distance_km} km
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map overlay label */}
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-bold z-[500]"
            style={{
              background: 'rgba(10,10,15,0.85)',
              border: '1px solid rgba(16,185,129,0.3)',
              backdropFilter: 'blur(8px)',
              color: '#10b981',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '0.08em',
            }}
          >
            {t('sheltersPage.liveMap')}
          </div>
        </div>

        {/* ── RIGHT: Shelter list (45%) ── */}
        <div
          className="flex flex-col flex-1 overflow-hidden"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Header */}
          <div
            className="flex-shrink-0 px-5 pt-5 pb-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}
              >
                {t('sheltersPage.emergencyShelters')}
              </h2>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {filtered.length} / {mockShelters.length}
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={t('sheltersPage.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                  fontFamily: "'Exo 2', sans-serif",
                }}
              />
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap mb-2">
              {[
                { key: 'all', label: t('sheltersPage.filters.all') },
                { key: 'water', label: t('sheltersPage.filters.water') },
                { key: 'medical', label: t('sheltersPage.filters.medical') },
                { key: 'food', label: t('sheltersPage.filters.food') },
                { key: 'electricity', label: t('sheltersPage.filters.electricity') },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    background:   activeFilter === f.key ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
                    border:       activeFilter === f.key ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color:        activeFilter === f.key ? '#10b981' : 'var(--text-muted)',
                  }}
                >
                  {f.label}
                </button>
              ))}

              {/* Sort buttons */}
              <div className="ml-auto flex gap-1">
                {[
                  { key: 'distance', label: t('sheltersPage.sortOptions.distance') },
                  { key: 'capacity', label: t('sheltersPage.sortOptions.capacity') },
                  { key: 'availability', label: t('sheltersPage.sortOptions.availability') },
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSort(s.key)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{
                      fontFamily: "'Exo 2', sans-serif",
                      background: sort === s.key ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                      border:     sort === s.key ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.07)',
                      color:      sort === s.key ? '#3b82f6' : 'var(--text-muted)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable card list */}
          <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((shelter, i) => {
                const pct      = occupancyPct(shelter);
                const color    = barColor(pct);
                const badge    = statusBadge(shelter.status);
                const selected = selectedId === shelter.id;

                return (
                  <motion.div
                    key={shelter.id}
                    ref={el => { cardRefs.current[shelter.id] = el; }}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.22, delay: i * 0.04 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    onClick={() => setSelectedId(shelter.id)}
                    className="rounded-2xl p-4 cursor-pointer transition-shadow"
                    style={{
                      background:  'rgba(255,255,255,0.03)',
                      border:      selected
                        ? '1px solid rgba(16,185,129,0.55)'
                        : '1px solid rgba(255,255,255,0.07)',
                      boxShadow:   selected ? '0 0 20px rgba(16,185,129,0.12)' : 'none',
                    }}
                  >
                    {/* Row 1: name + status + distance */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className="font-bold text-sm leading-snug"
                        style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}
                      >
                        {shelter.name}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    {/* Distance */}
                    <div className="flex items-center gap-1 mb-3">
                      <Navigation size={11} style={{ color: 'var(--text-muted)' }} />
                      <span
                        className="text-xs"
                        style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {shelter.distance_km} {t('sheltersPage.kmAway')}
                      </span>
                    </div>

                    {/* Capacity bar */}
                    <div className="mb-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
                          {t('sheltersPage.occupancy')}
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color, fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {shelter.current_occupancy}/{shelter.capacity} {t('sheltersPage.spaces')}
                        </span>
                      </div>
                      <div
                        className="w-full rounded-full overflow-hidden"
                        style={{ height: 5, background: 'rgba(255,255,255,0.06)' }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.05 }}
                          style={{ height: '100%', borderRadius: 999, background: color }}
                        />
                      </div>
                    </div>

                    {/* Amenity pills */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {shelter.amenities.map(a => {
                        const style = AMENITY_COLORS[a] || AMENITY_COLORS.Toilets;
                        return (
                          <span
                            key={a}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.color, fontFamily: "'Exo 2', sans-serif" }}
                          >
                            {a}
                          </span>
                        );
                      })}
                    </div>

                    {/* Directions button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={e => { e.stopPropagation(); handleGetDirections(shelter); }}
                      className="mt-3 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      style={{
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        color: '#10b981',
                        fontFamily: "'Exo 2', sans-serif",
                      }}
                    >
                      {routeLoading && selectedId === shelter.id
                        ? <><Loader2 size={12} className="animate-spin" /> {t('sheltersPage.routing')}</>
                        : <><Navigation size={12} /> {t('sheltersPage.getDirections')}</>
                      }
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-4xl">🔍</span>
                <p style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", fontSize: 14 }}>
                  {t('sheltersPage.noShelters')}
                </p>
              </div>
            )}
          </div>

          {/* ── Bottom Stats Bar ── */}
          <div
            className="flex-shrink-0 flex items-center justify-around px-5 py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)' }}
          >
            {[
              { label: t('sheltersPage.bottomStats.totalShelters'),  value: mockShelters.length, color: '#3b82f6' },
              { label: t('sheltersPage.bottomStats.totalCapacity'),  value: totalCapacity.toLocaleString(), color: '#a855f7' },
              { label: t('sheltersPage.bottomStats.available'),       value: totalAvailable.toLocaleString(), color: '#10b981' },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5">
                <span
                  className="text-base font-bold"
                  style={{ color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
