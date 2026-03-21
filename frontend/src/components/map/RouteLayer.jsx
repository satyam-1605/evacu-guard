import { Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

const startIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 0 10px rgba(59,130,246,0.8)"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const endIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#10b981;border:2px solid white;box-shadow:0 0 10px rgba(16,185,129,0.8)"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FlyToRoute({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords?.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.flyToBounds(bounds, { padding: [60, 60], duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

export default function RouteLayer({ route }) {
  if (!route?.route_coordinates?.length) return null;

  const coords = route.route_coordinates.map(c => [c[0], c[1]]);
  const start = coords[0];
  const end = coords[coords.length - 1];

  return (
    <>
      <FlyToRoute coords={coords} />

      {/* Main route line */}
      <Polyline
        positions={coords}
        pathOptions={{
          color: '#3b82f6',
          weight: 4,
          opacity: 0.9,
          dashArray: '10 6',
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />

      {/* Glow layer underneath */}
      <Polyline
        positions={coords}
        pathOptions={{
          color: '#3b82f6',
          weight: 12,
          opacity: 0.15,
        }}
      />

      <Marker position={start} icon={startIcon} />
      <Marker position={end} icon={endIcon} />
    </>
  );
}
