import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function CitizenDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState(null);

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

    // Dashboard / Map view (default)
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
        <TopBar />

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
