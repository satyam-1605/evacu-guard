import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ShieldCheck, Clock, Users, Zap, Navigation2, Bell, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import StatsBar from '../components/dashboard/StatsBar';
import AlertFeed from '../components/dashboard/AlertFeed';
import ShelterPanel from '../components/dashboard/ShelterPanel';
import RiskGauge from '../components/dashboard/RiskGauge';
import EvacuationMap from '../components/map/EvacuationMap';
import ReportHazardModal from '../components/dashboard/ReportHazardModal';
import SheltersView from '../components/dashboard/SheltersView';
import AlertsView from '../components/dashboard/AlertsView';
import { useLocation } from '../hooks/useLocation';
import { mockStats, mockAlerts, mockShelters } from '../data/mockData';

export default function CitizenDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [searchTarget, setSearchTarget] = useState(null);
  const { location, loading: locLoading, error: locError, refresh: refreshLocation } = useLocation();

  const handleNavChange = (key) => {
    if (key === 'report') {
      setReportModalOpen(true);
    } else {
      setActiveNav(key);
    }
  };

  const handleSOS = () => {
    alert('🚨 Emergency SOS activated! Contacting Jaipur Emergency Services: 112');
  };

  const renderMainContent = () => {
    // Overview dashboard
    if (activeNav === 'dashboard') {
      const stats = mockStats;
      const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');
      const openShelters = mockShelters.filter(s => s.status === 'open');
      const statCards = [
        { label: 'Active Hazard Zones', value: stats.active_zones, icon: AlertTriangle, color: '#ef4444', suffix: ' zones' },
        { label: 'Open Shelters', value: openShelters.length, icon: ShieldCheck, color: '#10b981', suffix: ` / ${mockShelters.length}` },
        { label: 'Avg Evacuation Time', value: `${stats.avg_evacuation_time} min`, icon: Clock, color: '#3b82f6', suffix: '' },
        { label: 'Citizens Affected', value: `${(stats.citizens_affected / 1000).toFixed(0)}K`, icon: Users, color: '#f59e0b', suffix: '' },
        { label: 'Shelter Capacity', value: stats.occupied_capacity, icon: MapPin, color: '#a855f7', suffix: `/${stats.total_shelter_capacity}` },
        { label: 'Citizen Reports', value: stats.active_reports, icon: Zap, color: '#f97316', suffix: ' active' },
      ];

      return (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex overflow-hidden"
        >
          {/* Left: scrollable main content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5" style={{ minWidth: 0 }}>
            {/* Heading */}
            <div>
              <h1 className="text-xl font-bold mb-0.5" style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif" }}>
                Command Overview
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
                Real-time situational awareness — Jaipur, Rajasthan
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {statCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl p-4 flex flex-col gap-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${card.color}18`, border: `1px solid ${card.color}30` }}>
                        <Icon size={15} color={card.color} />
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: card.color, boxShadow: `0 0 5px ${card.color}`, animation: 'pulseDot 1.5s ease-in-out infinite' }} />
                    </div>
                    <div>
                      <p className="text-xl font-black leading-none" style={{ color: card.color, fontFamily: "'JetBrains Mono', monospace" }}>
                        {card.value}{card.suffix}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{card.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Alert feed */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ height: 340, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <AlertFeed />
              </div>
            </div>

            {/* Shelter panel */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <ShelterPanel onNavigate={(s) => { setSelectedShelter(s); setActiveNav('map'); }} />
            </div>
          </div>

          {/* Right: fixed sidebar panel */}
          <div
            className="flex-shrink-0 flex flex-col gap-4 p-4 overflow-y-auto"
            style={{ width: 300, background: 'var(--bg-secondary)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Risk gauge */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <RiskGauge score={72} />
            </div>

            {/* Quick actions */}
            <div className="flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveNav('map')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981', fontFamily: "'Exo 2', sans-serif" }}
              >
                <Navigation2 size={14} />
                Open Evacuation Map
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveNav('alerts')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontFamily: "'Exo 2', sans-serif" }}
              >
                <Bell size={14} />
                View All Alerts
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveNav('shelters')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', color: '#3b82f6', fontFamily: "'Exo 2', sans-serif" }}
              >
                <ShieldCheck size={14} />
                View All Shelters
              </motion.button>
            </div>

            {/* Alert level badge */}
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>Current Alert Level</p>
              <p className="text-lg font-black" style={{ color: '#f59e0b', fontFamily: "'Orbitron', sans-serif" }}>LEVEL 2</p>
              <p className="text-xs font-bold tracking-widest" style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>WARNING</p>
            </div>
          </div>
        </motion.div>
      );
    }

    // Shelters full view
    if (activeNav === 'shelters') {
      return (
        <motion.div
          key="shelters"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-6"
        >
          <SheltersView onNavigate={(shelter) => { setSelectedShelter(shelter); setActiveNav('map'); }} />
        </motion.div>
      );
    }

    // Alerts full view
    if (activeNav === 'alerts') {
      return (
        <motion.div
          key="alerts"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-6"
        >
          <AlertsView />
        </motion.div>
      );
    }

    // Evacuation Map view (key='map' or default)
    return (
      <motion.div
        key="map"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex overflow-hidden"
      >
        {/* Map area */}
        <div className="flex-1 relative overflow-hidden" style={{ minWidth: 0 }}>
          <EvacuationMap
            location={location}
            locationLoading={locLoading}
            searchTarget={searchTarget}
            onRouteRequest={setSelectedShelter}
            selectedShelter={selectedShelter}
          />
        </div>

        {/* Right panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col overflow-hidden flex-shrink-0"
          style={{
            width: 340,
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
            <div
              className="rounded-2xl p-4 flex flex-col"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', minHeight: 280, maxHeight: 320 }}
            >
              <AlertFeed />
            </div>

            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <ShelterPanel onNavigate={setSelectedShelter} />
            </div>

            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <RiskGauge score={72} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar activeKey={activeNav} onNavChange={handleNavChange} onSOS={handleSOS} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          location={location}
          locationLoading={locLoading}
          locationError={locError}
          onLocate={refreshLocation}
          onSearchSelect={(target) => { setSearchTarget(target); if (target) setActiveNav('map'); }}
        />

        <div className="flex-1 flex overflow-hidden">
          <AnimatePresence mode="wait">
            {renderMainContent()}
          </AnimatePresence>
        </div>

        <StatsBar />
      </div>

      <ReportHazardModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </div>
  );
}
