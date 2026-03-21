import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Navigation2, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import HazardOverlay from './HazardOverlay';
import ShelterMarkers from './ShelterMarkers';
import RouteLayer from './RouteLayer';
import MapLegend from './MapLegend';
import MapControls from './MapControls';
import CrowdHeatmap from './CrowdHeatmap';
import RouteComparison from './RouteComparison';
import { useEvacuation } from '../../hooks/useEvacuation';
import { mockHazards, mockShelters } from '../../data/mockData';
import { fetchHazards } from '../../services/api';

const JAIPUR_CENTER = [26.9124, 75.7873];
const HAZARD_POLL_MS = 5000;

// Known blocked road locations in Jaipur (flood-prone underpasses/low-lying roads)
const BLOCKED_ROADS = [
  { id: 'br-1', label: 'MI Road Underpass', lat: 26.9118, lng: 75.8148 },
  { id: 'br-2', label: 'JLN Marg Underpass', lat: 26.9041, lng: 75.8059 },
  { id: 'br-3', label: 'Tonk Road Low-lying', lat: 26.8728, lng: 75.8013 },
];

const userIcon = L.divIcon({
  html: `<div style="position:relative;width:20px;height:20px">
    <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:sosPulse 1.8s ease-in-out infinite"></div>
    <div style="position:absolute;inset:4px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 0 12px rgba(59,130,246,0.8)"></div>
  </div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const searchIcon = L.divIcon({
  html: `<div style="position:relative;width:24px;height:32px">
    <div style="width:24px;height:24px;border-radius:50% 50% 50% 0;background:#10b981;transform:rotate(-45deg);border:2px solid white;box-shadow:0 0 14px rgba(16,185,129,0.8)"></div>
  </div>`,
  className: '',
  iconSize: [24, 32],
  iconAnchor: [12, 32],
});

const blockedIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50%;background:rgba(239,68,68,0.15);border:2px solid #ef4444;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(239,68,68,0.5);animation:sosPulse 2s ease-in-out infinite">
    <span style="color:#ef4444;font-size:13px;font-weight:900;line-height:1">✕</span>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function FlyToSearch({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 15, { duration: 1.4 });
  }, [target, map]);
  return null;
}

function FlyToUser({ location }) {
  const map = useMap();
  const flown = useRef(false);
  useEffect(() => {
    if (location && !location.isFallback && !flown.current) {
      flown.current = true;
      map.flyTo([location.lat, location.lng], 14, { duration: 1.8 });
    }
  }, [location, map]);
  return null;
}

export default function EvacuationMap({ location, locationLoading, searchTarget, onRouteRequest, selectedShelter }) {
  const [layers, setLayers] = useState({
    hazards: true,
    shelters: true,
    routes: false,
    crowd: false,
    blocked: true,
  });
  const [liveHazards, setLiveHazards] = useState(mockHazards);

  const {
    route, routeOptions, selectedOptionIndex,
    loading, requestRoute, selectOption, clearRoute,
  } = useEvacuation();

  // Poll backend hazards every 5s so map updates live when scenario escalates zones
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      const data = await fetchHazards();
      if (alive && data?.features) setLiveHazards(data);
    };
    poll();
    const id = setInterval(poll, HAZARD_POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const toggleLayer = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  const handleGetRoute = async () => {
    const lat = location?.lat ?? JAIPUR_CENTER[0];
    const lng = location?.lng ?? JAIPUR_CENTER[1];
    await requestRoute({ lat, lng });
    setLayers(prev => ({ ...prev, routes: true }));
  };

  const handleSelectOption = (index) => {
    selectOption(index);
    setLayers(prev => ({ ...prev, routes: true }));
  };

  return (
    <div className="relative w-full h-full" style={{ minHeight: 400 }}>
      <MapContainer
        center={JAIPUR_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%', borderRadius: 0 }}
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        <FlyToUser location={location} />
        <FlyToSearch target={searchTarget} />

        {/* User GPS marker */}
        {location && !locationLoading && (
          <>
            <Marker position={[location.lat, location.lng]} icon={userIcon} />
            {location.accuracy && (
              <Circle
                center={[location.lat, location.lng]}
                radius={location.accuracy}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 1, dashArray: '4 4' }}
              />
            )}
          </>
        )}

        {/* Live hazard zones (polls backend every 5s) */}
        {layers.hazards && <HazardOverlay data={liveHazards} />}

        {/* Shelter markers */}
        {layers.shelters && <ShelterMarkers shelters={mockShelters} onNavigate={onRouteRequest} />}

        {/* Computed evacuation route */}
        {layers.routes && route && <RouteLayer route={route} />}

        {/* Crowd density heatmap */}
        {layers.crowd && <CrowdHeatmap visible />}

        {/* Search result pin */}
        {searchTarget && (
          <Marker position={[searchTarget.lat, searchTarget.lng]} icon={searchIcon} />
        )}

        {/* Blocked road markers */}
        {layers.blocked && BLOCKED_ROADS.map(road => (
          <Marker
            key={road.id}
            position={[road.lat, road.lng]}
            icon={blockedIcon}
          >
          </Marker>
        ))}

        <MapControls layers={layers} onToggle={toggleLayer} />
      </MapContainer>

      {/* Search target label */}
      {searchTarget && (
        <div
          className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(10,10,15,0.9)',
            border: '1px solid rgba(16,185,129,0.5)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <MapPin size={12} color="#10b981" />
          <span className="text-xs font-semibold" style={{ color: '#10b981', fontFamily: "'Exo 2', sans-serif" }}>
            {searchTarget.name}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            {searchTarget.lat.toFixed(4)}°N, {searchTarget.lng.toFixed(4)}°E
          </span>
        </div>
      )}

      {/* GPS status badge */}
      {location && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(10,10,15,0.85)',
            border: `1px solid ${location.isFallback ? 'rgba(245,158,11,0.4)' : 'rgba(59,130,246,0.4)'}`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: location.isFallback ? '#f59e0b' : '#3b82f6',
              animation: 'pulseDot 1.5s ease-in-out infinite',
            }}
          />
          <span className="text-xs" style={{ color: location.isFallback ? '#f59e0b' : '#3b82f6', fontFamily: "'JetBrains Mono', monospace" }}>
            {location.isFallback
              ? 'GPS unavailable — showing Jaipur center'
              : `${location.lat.toFixed(5)}°N, ${location.lng.toFixed(5)}°E${location.accuracy ? ` ±${location.accuracy}m` : ''}`}
          </span>
        </div>
      )}

      <MapLegend />

      <RouteComparison
        options={routeOptions}
        selectedIndex={selectedOptionIndex}
        onSelect={handleSelectOption}
        onClose={clearRoute}
        visible={routeOptions.length > 0}
      />

      {/* Get Route FAB */}
      <div className="absolute bottom-6 right-4 z-[1000]">
        <motion.button
          onClick={handleGetRoute}
          disabled={loading || locationLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm"
          style={{
            background: (loading || locationLoading) ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.4)',
            color: '#10b981',
            backdropFilter: 'blur(12px)',
            fontFamily: "'Exo 2', sans-serif",
            boxShadow: '0 0 25px rgba(16,185,129,0.25)',
          }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
              Computing Route...
            </>
          ) : (
            <>
              <Navigation2 size={16} />
              Get Evacuation Route
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
