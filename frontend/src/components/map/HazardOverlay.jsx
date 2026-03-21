import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

const severityColors = {
  critical: { fillColor: '#ef4444', color: '#ef4444', fillOpacity: 0.28, weight: 2 },
  high:     { fillColor: '#f97316', color: '#f97316', fillOpacity: 0.22, weight: 1.5 },
  medium:   { fillColor: '#f59e0b', color: '#f59e0b', fillOpacity: 0.18, weight: 1 },
  low:      { fillColor: '#10b981', color: '#10b981', fillOpacity: 0.12, weight: 1 },
};

export default function HazardOverlay({ data }) {
  if (!data?.features) return null;

  const getStyle = (feature) => {
    const sev = feature.properties?.severity || 'low';
    return severityColors[sev] || severityColors.low;
  };

  const onEachFeature = (feature, layer) => {
    const p = feature.properties;
    if (!p) return;
    const sev = p.severity || 'low';
    const cfg = severityColors[sev] || severityColors.low;

    layer.bindPopup(`
      <div style="font-family:'Exo 2',sans-serif; color:#f0f0f5; min-width:200px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="width:10px;height:10px;border-radius:50%;background:${cfg.fillColor};display:inline-block;box-shadow:0 0 8px ${cfg.fillColor}"></span>
          <strong style="font-size:13px">${p.name}</strong>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
          <span style="color:#8888a0">Severity</span>
          <span style="color:${cfg.fillColor};font-family:'JetBrains Mono',monospace;font-weight:700">${(sev).toUpperCase()}</span>
          <span style="color:#8888a0">Risk Score</span>
          <span style="color:#f0f0f5;font-family:'JetBrains Mono',monospace">${p.risk_score}/100</span>
          <span style="color:#8888a0">Type</span>
          <span style="color:#f0f0f5">${p.type}</span>
          <span style="color:#8888a0">Affected Pop.</span>
          <span style="color:#f0f0f5;font-family:'JetBrains Mono',monospace">${p.affected_population?.toLocaleString()}</span>
        </div>
      </div>
    `);

    layer.on('mouseover', () => layer.setStyle({ fillOpacity: Math.min(cfg.fillOpacity + 0.1, 0.5), weight: cfg.weight + 1 }));
    layer.on('mouseout', () => layer.setStyle(cfg));
  };

  return (
    <GeoJSON
      key={JSON.stringify(data)}
      data={data}
      style={getStyle}
      onEachFeature={onEachFeature}
    />
  );
}
