import { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Navigation2 } from 'lucide-react';
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

export default function EvacuationMap({ onRouteRequest, selectedShelter }) {
  const [layers, setLayers] = useState({
    hazards: true,
    shelters: true,
    routes: false,
    crowd: false,
  });

  const {
    route,
    routeOptions,
    selectedOptionIndex,
    loading,
    requestRoute,
    selectOption,
    clearRoute,
  } = useEvacuation();

  const toggleLayer = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  const handleGetRoute = async () => {
    await requestRoute({});
    setLayers(prev => ({ ...prev, routes: true }));
  };

  const handleSelectOption = (index) => {
    selectOption(index);
    setLayers(prev => ({ ...prev, routes: true }));
  };

  return (
    <div className="relative w-full h-full" style={{ minHeight: 400 }}>
      <MapContainer
        center={[26.9124, 75.7873]}
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

        {layers.hazards && <HazardOverlay data={mockHazards} />}
        {layers.shelters && <ShelterMarkers shelters={mockShelters} onNavigate={onRouteRequest} />}
        {layers.routes && route && <RouteLayer route={route} />}
        {layers.crowd && <CrowdHeatmap visible />}

        <MapControls layers={layers} onToggle={toggleLayer} />
      </MapContainer>

      {/* Legend */}
      <MapLegend />

      {/* Route comparison panel */}
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
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm"
          style={{
            background: loading ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.15)',
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
