import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import SystemStatus from '../components/admin/SystemStatus';
import ScenarioSimulator from '../components/admin/ScenarioSimulator';
import HazardManager from '../components/admin/HazardManager';
import ShelterManager from '../components/admin/ShelterManager';
import AlertBroadcast from '../components/admin/AlertBroadcast';
import GlowButton from '../components/shared/GlowButton';

export default function AdminPanel() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar activeKey="admin" onNavChange={() => navigate('/dashboard')} onSOS={() => {}} />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center gap-4 px-6 py-3 flex-shrink-0"
          style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(255,255,255,0.06)', height: 60 }}
        >
          <GlowButton variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
            Dashboard
          </GlowButton>
          <div className="flex items-center gap-2">
            <Shield size={16} color="#9333ea" />
            <span className="font-bold text-sm" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
              Admin Control Panel
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(147,51,234,0.1)', border: '1px solid rgba(147,51,234,0.25)' }}>
            <span className="w-2 h-2 rounded-full bg-purple-400" style={{ animation: 'pulseDot 1.5s ease-in-out infinite' }} />
            <span className="text-xs font-bold" style={{ color: '#9333ea', fontFamily: "'JetBrains Mono', monospace" }}>
              ADMIN MODE
            </span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="p-6 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <SystemStatus />
          </motion.div>

          {/* Scenario Simulator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <ScenarioSimulator />
          </motion.div>

          {/* Alert Broadcast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <AlertBroadcast />
          </motion.div>

          {/* Hazard Manager */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <HazardManager />
          </motion.div>

          {/* Shelter Manager */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <ShelterManager />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
