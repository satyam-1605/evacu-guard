import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertTriangle, CloudRain, MapPin, Clock,
  Filter, Zap, Shield, Radio
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAlerts } from '../hooks/useAlerts';
import PublicLayout from '../components/layout/PublicLayout';

const CATEGORY_META = {
  weather:        { label: 'Weather',        color: '#3b82f6', icon: CloudRain },
  flood:          { label: 'Flood',           color: '#06b6d4', icon: Zap },
  road_block:     { label: 'Road Block',      color: '#f59e0b', icon: AlertTriangle },
  shelter:        { label: 'Shelter',         color: '#a855f7', icon: Shield },
  infrastructure: { label: 'Infrastructure',  color: '#ef4444', icon: Zap },
  rescue:         { label: 'Rescue',          color: '#10b981', icon: Radio },
};

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high:     '#f97316',
  warning:  '#f59e0b',
  info:     '#3b82f6',
};

const PILL_CATEGORIES = ['all', 'weather', 'flood', 'road_block', 'shelter', 'infrastructure', 'rescue'];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function isWithin30Min(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) < 30 * 60 * 1000;
}

function isWithin24H(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) < 24 * 60 * 60 * 1000;
}

function AlertCard({ alert, index }) {
  const { i18n } = useTranslation();
  const isHindi = i18n.language?.startsWith('hi');
  const meta = CATEGORY_META[alert.type] || CATEGORY_META.weather;
  const Icon = meta.icon;
  const severityColor = SEVERITY_COLORS[alert.severity] || '#3b82f6';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group relative flex gap-4 p-4 rounded-2xl cursor-default"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `4px solid ${severityColor}`,
        transition: 'box-shadow 0.2s',
      }}
      whileHover={{ boxShadow: `0 0 16px ${severityColor}44` }}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${meta.color}22` }}
      >
        <Icon size={20} style={{ color: meta.color }} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-white text-sm leading-tight">{isHindi ? (alert.title_hi || alert.title || alert.message) : (alert.title || alert.message)}</p>
          <span
            className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{
              background: `${severityColor}22`,
              color: severityColor,
              border: `1px solid ${severityColor}44`,
            }}
          >
            {alert.severity}
          </span>
        </div>

        {alert.description && (
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {isHindi ? (alert.description_hi || alert.description) : alert.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-4 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.4)' }}>
          {alert.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {alert.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={11} /> {timeAgo(alert.timestamp || alert.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AlertCenterPage() {
  const { alerts = [] } = useAlerts();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? alerts
    : alerts.filter(a => a.type === activeCategory);

  const nowAlerts     = filtered.filter(a => isWithin30Min(a.timestamp || a.created_at));
  const earlierAlerts = filtered.filter(a => !isWithin30Min(a.timestamp || a.created_at) && isWithin24H(a.timestamp || a.created_at));

  const countBySeverity = ['critical', 'high', 'warning', 'info'].map(sev => ({
    name: sev.charAt(0).toUpperCase() + sev.slice(1),
    value: alerts.filter(a => a.severity === sev).length,
    color: SEVERITY_COLORS[sev],
  })).filter(d => d.value > 0);

  const locationCounts = alerts.reduce((acc, a) => {
    if (a.location) acc[a.location] = (acc[a.location] || 0) + 1;
    return acc;
  }, {});
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const maxLocationCount = topLocations[0]?.[1] || 1;

  const totalCount    = alerts.length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount     = alerts.filter(a => a.severity === 'high').length;

  return (
    <PublicLayout>
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h1
              className="text-4xl font-black"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('alertCenter.title')}
            </h1>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="text-red-400 text-xs font-bold tracking-widest uppercase">{t('alertCenter.live')}</span>
              <span
                className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                {totalCount}
              </span>
            </div>
          </div>
          <p
            className="mt-1 text-xs"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.35)' }}
          >
            {t('alertCenter.lastUpdated')}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {[
            { label: t('alertCenter.stats.total'), value: totalCount,    color: '#3b82f6' },
            { label: t('alertCenter.stats.critical'), value: criticalCount, color: '#ef4444' },
            { label: t('alertCenter.stats.high'),     value: highCount,     color: '#f97316' },
            { label: t('alertCenter.stats.resolved'), value: 0,              color: '#10b981' },
          ].map(stat => (
            <div
              key={stat.label}
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{
                background: `${stat.color}11`,
                border: `1px solid ${stat.color}33`,
              }}
            >
              <span className="text-xl font-black" style={{ color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>
                {stat.value}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {PILL_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            const meta = CATEGORY_META[cat];
            const color = meta?.color || '#10b981';
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize"
                style={isActive
                  ? { background: color, color: '#000', boxShadow: `0 0 12px ${color}66` }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.6)',
                    }
                }
              >
                {t(`alertCenter.categories.${cat}`)}
              </button>
            );
          })}
        </div>

        {/* Main layout */}
        <div className="flex gap-6" style={{ alignItems: 'flex-start' }}>

          {/* Left: Timeline */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {nowAlerts.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>
                  {t('alertCenter.now')}
                </p>
                <div className="flex flex-col gap-3">
                  {nowAlerts.map((alert, i) => (
                    <AlertCard key={alert.id || i} alert={alert} index={i} />
                  ))}
                </div>
              </div>
            )}

            {earlierAlerts.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {t('alertCenter.earlierToday')}
                </p>
                <div className="flex flex-col gap-3">
                  {earlierAlerts.map((alert, i) => (
                    <AlertCard key={alert.id || i} alert={alert} index={i} />
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div
                className="flex flex-col items-center justify-center py-20 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Bell size={40} style={{ color: 'rgba(255,255,255,0.15)' }} className="mb-3" />
                <p style={{ color: 'rgba(255,255,255,0.35)' }} className="text-sm">{t('alertCenter.noAlerts')}</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4" style={{ width: 280, flexShrink: 0 }}>

            {/* Pie chart */}
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-sm font-bold mb-4" style={{ fontFamily: "'Orbitron', sans-serif", color: 'rgba(255,255,255,0.8)' }}>
                {t('alertCenter.alertDistribution')}
              </p>
              {countBySeverity.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={countBySeverity}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {countBySeverity.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#111',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8,
                          color: '#fff',
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {countBySeverity.map(d => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{d.name}</span>
                        </div>
                        <span style={{ color: d.color, fontFamily: "'JetBrains Mono', monospace" }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.25)' }}>{t('alertCenter.noData')}</p>
              )}
            </div>

            {/* Hotspot areas */}
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-sm font-bold mb-4" style={{ fontFamily: "'Orbitron', sans-serif", color: 'rgba(255,255,255,0.8)' }}>
                {t('alertCenter.hotspotAreas')}
              </p>
              {topLocations.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {topLocations.map(([loc, count], i) => (
                    <div key={loc}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          <MapPin size={10} /> {loc}
                        </span>
                        <span style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${(count / maxLocationCount) * 100}%`,
                            background: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#f59e0b',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-center py-4" style={{ color: 'rgba(255,255,255,0.25)' }}>{t('alertCenter.noLocationData')}</p>
              )}
            </div>

            {/* Quick Report */}
            <a href="/report">
              <button
                className="w-full py-3 rounded-2xl text-sm font-bold transition-all"
                style={{
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.35)',
                  color: '#10b981',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: '0.05em',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(16,185,129,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                {t('alertCenter.quickReport')}
              </button>
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
