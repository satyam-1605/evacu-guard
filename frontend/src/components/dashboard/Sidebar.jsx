import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Building2, AlertTriangle,
  ChevronLeft, ChevronRight, Zap, CloudRain, Droplets, Thermometer, Home
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../hooks/useWeather';

export default function Sidebar({ activeKey, onNavChange, onSOS }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { weather } = useWeather();
  const { t } = useTranslation();

  const navItems = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/dashboard', key: 'dashboard' },
    { icon: Map, label: t('sidebar.evacuationMap'), path: '/dashboard', key: 'map' },
    { icon: Building2, label: t('sidebar.shelters'), path: '/dashboard', key: 'shelters' },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-full flex-shrink-0 overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Top: Logo */}
      <div className="flex items-center justify-between p-4 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Zap size={18} color="#10b981" />
              <span className="font-bold text-base" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
                EvacuGuard
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && <Zap size={18} color="#10b981" className="mx-auto" />}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavChange?.(item.key)}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group w-full text-left"
              style={{
                background: isActive ? 'rgba(16,185,129,0.1)' : 'transparent',
                color: isActive ? '#10b981' : 'var(--text-secondary)',
                borderLeft: isActive ? '2px solid #10b981' : '2px solid transparent',
              }}
            >
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ fontFamily: "'Exo 2', sans-serif" }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && !collapsed && (
                <span
                  className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: '#ef4444', color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {item.badge}
                </span>
              )}
              {item.badge && collapsed && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ background: '#ef4444' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Weather widget */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
                {t('sidebar.jaipurWeather')}
              </span>
              <CloudRain size={13} color="#3b82f6" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center">
                <Thermometer size={12} color="#f59e0b" />
                <span className="text-xs font-bold mt-0.5" style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>{weather.temperature}°C</span>
              </div>
              <div className="flex flex-col items-center">
                <CloudRain size={12} color="#3b82f6" />
                <span className="text-xs font-bold mt-0.5" style={{ color: '#3b82f6', fontFamily: "'JetBrains Mono', monospace" }}>{weather.rainfall_mm}mm</span>
              </div>
              <div className="flex flex-col items-center">
                <Droplets size={12} color="#8888a0" />
                <span className="text-xs font-bold mt-0.5" style={{ color: '#8888a0', fontFamily: "'JetBrains Mono', monospace" }}>{weather.humidity}%</span>
              </div>
            </div>
            <div className="mt-2 px-2 py-1 rounded-lg text-center text-xs font-bold" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
              {t('sidebar.imdAlert', { level: weather.alert_level })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Home button */}
      <div className="px-3 pb-2">
        <button
          onClick={() => navigate('/')}
          className="w-full py-2 rounded-xl flex items-center justify-center gap-2 transition-all"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'var(--text-muted)',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: 12,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          title={t('sidebar.backToLanding')}
        >
          <Home size={14} />
          {!collapsed && t('sidebar.landingPage')}
        </button>
      </div>

      {/* SOS Button */}
      <div className="p-3 pt-0">
        <button
          onClick={onSOS}
          className="w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all"
          style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#ef4444',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: collapsed ? '10px' : '12px',
            animation: 'sosPulse 1.5s ease-in-out infinite',
          }}
        >
          <AlertTriangle size={14} />
          {!collapsed && t('sidebar.emergencySos')}
        </button>
      </div>
    </motion.aside>
  );
}
