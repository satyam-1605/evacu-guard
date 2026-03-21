import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Send, CheckCircle, AlertTriangle, Zap,
  Droplets, Home, Flame, Radio, HelpCircle, Navigation
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../components/layout/PublicLayout';

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const JAIPUR_CENTER = [26.9124, 75.7873];

const MOCK_HAZARD_PINS = [
  { lat: 26.924,  lng: 75.797, label: 'Waterlogging – Mansarovar' },
  { lat: 26.8897, lng: 75.806, label: 'Road Block – Tonk Road' },
  { lat: 26.9456, lng: 75.764, label: 'Structural Damage – Vaishali Nagar' },
];

const HAZARD_TYPES = [
  { id: 'waterlogging',      label: 'Waterlogging',      Icon: Droplets,      color: '#3b82f6' },
  { id: 'road_blockage',     label: 'Road Blockage',     Icon: AlertTriangle, color: '#f59e0b' },
  { id: 'structural_damage', label: 'Structural Damage', Icon: Home,          color: '#ef4444' },
  { id: 'fire',              label: 'Fire',               Icon: Flame,         color: '#ef4444' },
  { id: 'power_outage',      label: 'Power Outage',      Icon: Zap,           color: '#f59e0b' },
  { id: 'other',             label: 'Other',              Icon: HelpCircle,    color: '#6b7280' },
];

const SEVERITIES = [
  { id: 'low',    label: 'Low',    sub: 'Minor, passable',       color: '#10b981' },
  { id: 'medium', label: 'Medium', sub: 'Significant, caution',  color: '#f59e0b' },
  { id: 'high',   label: 'High',   sub: 'Dangerous, avoid area', color: '#ef4444' },
];

// Internal component: handles map click events
function MapClickHandler({ pickMode, onPick }) {
  useMapEvents({
    click(e) {
      if (pickMode) {
        onPick(e.latlng);
      }
    },
  });
  return null;
}

export default function ReportHazardPage() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType]         = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const [location, setLocation]                 = useState('Jaipur, Rajasthan');
  const [description, setDescription]           = useState('');
  const [pickMode, setPickMode]                 = useState(false);
  const [pickedLatLng, setPickedLatLng]         = useState(null);
  const [submitted, setSubmitted]               = useState(false);

  const handlePick = (latlng) => {
    setPickedLatLng(latlng);
    setLocation(`Picked location (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`);
    setPickMode(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedType || !selectedSeverity) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedType(null);
      setSelectedSeverity(null);
      setLocation('Jaipur, Rajasthan');
      setDescription('');
      setPickedLatLng(null);
    }, 4000);
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 14,
    fontFamily: "'Exo 2', sans-serif",
    outline: 'none',
    width: '100%',
    padding: '10px 14px',
    transition: 'border-color 0.2s',
  };

  return (
    <PublicLayout>
      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex gap-6" style={{ alignItems: 'flex-start' }}>

          {/* ── Left: Form ── */}
          <div
            className="flex-1 rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h1
              className="font-black mb-1"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 28,
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('reportHazard.title')}
            </h1>
            <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Exo 2', sans-serif" }}>
              {t('reportHazard.subtitle')}
            </p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <CheckCircle size={60} style={{ color: '#10b981' }} className="mb-4" />
                  </motion.div>
                  <p className="text-xl font-bold mb-2" style={{ color: '#10b981', fontFamily: "'Orbitron', sans-serif" }}>
                    {t('reportHazard.reportSubmitted')}
                  </p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 300 }}>
                    {t('reportHazard.autoEscalate')}
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-6"
                >
                  {/* Hazard type grid */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {t('reportHazard.hazardType')}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {HAZARD_TYPES.map(({ id, label, Icon, color }) => {
                        const translatedLabel = t(`reportHazard.hazardTypes.${id}`);
                        const active = selectedType === id;
                        return (
                          <button
                            type="button"
                            key={id}
                            onClick={() => setSelectedType(id)}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                            style={{
                              background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
                              border: active
                                ? `1px solid ${color}`
                                : '1px solid rgba(255,255,255,0.07)',
                              boxShadow: active ? `0 0 12px ${color}44` : 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <Icon size={22} style={{ color: active ? color : 'rgba(255,255,255,0.4)' }} />
                            <span className="text-xs font-medium" style={{ color: active ? color : 'rgba(255,255,255,0.5)' }}>
                              {translatedLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Severity */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {t('reportHazard.severity')}
                    </p>
                    <div className="flex gap-3">
                      {SEVERITIES.map(({ id, label, sub, color }) => {
                        const tLabel = t(`reportHazard.severities.${id}`);
                        const tSub = t(`reportHazard.severities.${id}Sub`);
                        const active = selectedSeverity === id;
                        return (
                          <button
                            type="button"
                            key={id}
                            onClick={() => setSelectedSeverity(id)}
                            className="flex-1 p-3 rounded-xl transition-all text-left"
                            style={{
                              background: active ? `${color}15` : 'rgba(255,255,255,0.03)',
                              border: active
                                ? `1px solid ${color}`
                                : '1px solid rgba(255,255,255,0.07)',
                              boxShadow: active ? `0 0 10px ${color}33` : 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <p className="text-sm font-bold" style={{ color: active ? color : 'rgba(255,255,255,0.7)' }}>
                              {tLabel}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{tSub}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {t('reportHazard.location')}
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder={t('reportHazard.locationPlaceholder')}
                        style={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => setPickMode(p => !p)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: pickMode ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                          border: pickMode ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                          color: pickMode ? '#3b82f6' : 'rgba(255,255,255,0.5)',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                        }}
                      >
                        <Navigation size={12} />
                        {t('reportHazard.pickOnMap')}
                      </button>
                    </div>
                    {pickMode && (
                      <p className="mt-1.5 text-xs" style={{ color: '#3b82f6', fontFamily: "'JetBrains Mono', monospace" }}>
                        {t('reportHazard.clickMapInstruction')}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {t('reportHazard.description')}
                    </p>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder={t('reportHazard.descriptionPlaceholder')}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!selectedType || !selectedSeverity}
                    className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 14,
                      letterSpacing: '0.05em',
                      background: selectedType && selectedSeverity
                        ? 'rgba(16,185,129,0.15)'
                        : 'rgba(255,255,255,0.04)',
                      border: selectedType && selectedSeverity
                        ? '1px solid #10b981'
                        : '1px solid rgba(255,255,255,0.07)',
                      color: selectedType && selectedSeverity ? '#10b981' : 'rgba(255,255,255,0.25)',
                      boxShadow: selectedType && selectedSeverity ? '0 0 20px rgba(16,185,129,0.3)' : 'none',
                      cursor: selectedType && selectedSeverity ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Send size={16} />
                    {t('reportHazard.submitReport')}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: Map ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              flex: 1,
              minHeight: 600,
              border: '1px solid rgba(255,255,255,0.07)',
              cursor: pickMode ? 'crosshair' : 'default',
              position: 'sticky',
              top: 96,
            }}
          >
            <MapContainer
              center={JAIPUR_CENTER}
              zoom={12}
              style={{ width: '100%', height: 600 }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              />

              <MapClickHandler pickMode={pickMode} onPick={handlePick} />

              {/* Picked pin */}
              {pickedLatLng && (
                <Marker position={[pickedLatLng.lat, pickedLatLng.lng]} icon={blueIcon} />
              )}

              {/* Existing hazard pins */}
              {MOCK_HAZARD_PINS.map((pin, i) => (
                <Marker key={i} position={[pin.lat, pin.lng]} icon={orangeIcon} />
              ))}
            </MapContainer>

            {pickMode && (
              <div
                className="absolute top-3 left-3 right-3 text-center py-2 rounded-xl text-xs font-bold z-[1000]"
                style={{
                  background: 'rgba(59,130,246,0.85)',
                  color: '#fff',
                  pointerEvents: 'none',
                  fontFamily: "'JetBrains Mono', monospace",
                  backdropFilter: 'blur(8px)',
                }}
              >
                {t('reportHazard.clickMapInstruction2')}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
