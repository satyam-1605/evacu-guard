/**
 * CrowdHeatmap — simulates crowd density heatmap using
 * semi-transparent CircleMarkers. No external leaflet.heat needed.
 */
import { CircleMarker } from 'react-leaflet';

// Crowd density hotspots across Jaipur (lat, lng, intensity 0-1)
const CROWD_POINTS = [
  // Hazard zones — high crowd density due to evacuation
  { lat: 26.8800, lng: 75.7580, intensity: 0.95 }, // Mansarovar
  { lat: 26.8650, lng: 75.7700, intensity: 0.85 }, // Pratap Nagar
  { lat: 26.9200, lng: 75.7920, intensity: 0.80 }, // Sindhi Camp
  { lat: 26.9250, lng: 75.8200, intensity: 0.70 }, // Walled City
  { lat: 26.7950, lng: 75.7970, intensity: 0.92 }, // Sanganer
  { lat: 26.8150, lng: 75.8300, intensity: 0.65 }, // Jagatpura
  { lat: 26.8600, lng: 75.8100, intensity: 0.60 }, // Malviya Nagar

  // Shelter convergence points — high density
  { lat: 26.9024, lng: 75.8065, intensity: 0.88 }, // SMS Stadium
  { lat: 26.8936, lng: 75.8064, intensity: 0.75 }, // Birla Auditorium
  { lat: 26.9117, lng: 75.8194, intensity: 0.70 }, // Albert Hall
  { lat: 26.8893, lng: 75.8133, intensity: 0.65 }, // JKK
  { lat: 26.8585, lng: 75.7612, intensity: 0.55 }, // Raj Univ Hall

  // Evacuation route corridors
  { lat: 26.9000, lng: 75.7850, intensity: 0.72 }, // Civil Lines
  { lat: 26.9160, lng: 75.8120, intensity: 0.68 }, // MI Road
  { lat: 26.8900, lng: 75.8050, intensity: 0.60 }, // Jawahar Circle
  { lat: 26.8750, lng: 75.8000, intensity: 0.50 }, // Tonk Road junction
  { lat: 26.9050, lng: 75.8200, intensity: 0.45 }, // Sanganeri Gate

  // Scatter points for visual density
  { lat: 26.8720, lng: 75.7850, intensity: 0.40 },
  { lat: 26.8980, lng: 75.7760, intensity: 0.35 },
  { lat: 26.9100, lng: 75.7950, intensity: 0.42 },
  { lat: 26.8450, lng: 75.7900, intensity: 0.48 },
  { lat: 26.8300, lng: 75.8100, intensity: 0.38 },
];

function intensityToColor(intensity) {
  // Low: blue → Mid: amber → High: red
  if (intensity < 0.4) return { fill: '#3b82f6', opacity: 0.25 };
  if (intensity < 0.65) return { fill: '#f59e0b', opacity: 0.35 };
  if (intensity < 0.82) return { fill: '#ef4444', opacity: 0.40 };
  return { fill: '#ef4444', opacity: 0.55 };
}

function intensityToRadius(intensity) {
  // Radius 800m – 2200m depending on crowd density
  return 800 + intensity * 1400;
}

export default function CrowdHeatmap({ visible = true }) {
  if (!visible) return null;

  return (
    <>
      {CROWD_POINTS.map((pt, i) => {
        const { fill, opacity } = intensityToColor(pt.intensity);
        const radius = intensityToRadius(pt.intensity);
        return (
          <CircleMarker
            key={i}
            center={[pt.lat, pt.lng]}
            radius={0}                      // pixel radius — we use pathOptions weight instead
            pathOptions={{
              fillColor: fill,
              fillOpacity: opacity,
              color: 'transparent',
              weight: 0,
            }}
            // Use a large SVG circle via attribution trick:
            // react-leaflet CircleMarker radius is in pixels, not meters.
            // Override with a Canvas layer-style circle (meters).
          />
        );
      })}
      {/* Render as real meter-radius circles using SVGOverlay isn't available,
          so we layer two CircleMarkers per point: inner core + outer diffuse */}
      {CROWD_POINTS.map((pt, i) => {
        const { fill, opacity } = intensityToColor(pt.intensity);
        const pixRadius = Math.round(14 + pt.intensity * 22);
        return (
          <CircleMarker
            key={`core-${i}`}
            center={[pt.lat, pt.lng]}
            radius={pixRadius}
            pathOptions={{
              fillColor: fill,
              fillOpacity: opacity * 0.6,
              color: fill,
              weight: 1,
              opacity: opacity * 0.3,
            }}
          />
        );
      })}
    </>
  );
}
