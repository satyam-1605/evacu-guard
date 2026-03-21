import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Cell,
} from 'recharts';
import {
  Brain, Database, Cpu, GitBranch, TrendingUp, TrendingDown,
  Minus, Activity, Shield, Map, Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../components/layout/PublicLayout';

// ─── Design tokens ────────────────────────────────────────────────────────────

const EMERALD  = '#10b981';
const AMBER    = '#f59e0b';
const RED      = '#ef4444';
const BLUE     = '#3b82f6';
const PURPLE   = '#a855f7';

const CARD_STYLE = {
  background:   'rgba(255,255,255,0.03)',
  border:       '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
};

// ─── Feature importance data ──────────────────────────────────────────────────

const featureData = [
  { feature: 'Rainfall',          importance: 38, color: EMERALD },
  { feature: 'Elevation',         importance: 27, color: BLUE },
  { feature: 'Water Distance',    importance: 19, color: '#06b6d4' },
  { feature: 'Historical Floods', importance: 8,  color: AMBER },
  { feature: 'Soil Drainage',     importance: 5,  color: PURPLE },
  { feature: 'Population Density',importance: 3,  color: '#f97316' },
];

// ─── Zone risk data ───────────────────────────────────────────────────────────

const zoneData = [
  { zone: 'Mansarovar',    score: 92, severity: 'critical', factor: 'Rainfall',    trend: 'up' },
  { zone: 'Sanganer',      score: 88, severity: 'critical', factor: 'Overflow',    trend: 'up' },
  { zone: 'Pratap Nagar',  score: 78, severity: 'high',     factor: 'Elevation',   trend: 'flat' },
  { zone: 'Sindhi Camp',   score: 74, severity: 'high',     factor: 'Waterlog',    trend: 'up' },
  { zone: 'Walled City',   score: 58, severity: 'medium',   factor: 'Drainage',    trend: 'flat' },
  { zone: 'Jagatpura',     score: 62, severity: 'medium',   factor: 'Low-lying',   trend: 'down' },
  { zone: 'Malviya Nagar', score: 38, severity: 'low',      factor: 'Waterlog',    trend: 'down' },
];

// ─── 24-hour risk trend data ──────────────────────────────────────────────────

function generateTrend(base, noise, hours = 24) {
  return Array.from({ length: hours }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    value: Math.min(100, Math.max(0, Math.round(base + noise * Math.sin(h / 3.5 + 1) + (Math.random() - 0.5) * noise * 0.6))),
  }));
}

const mansarovarTrend = generateTrend(88, 10);
const sanaganerTrend  = generateTrend(80, 12);
const walledCityTrend = generateTrend(52, 8);

const trendData = mansarovarTrend.map((d, i) => ({
  hour:       d.hour,
  mansarovar: d.value,
  sanganer:   sanaganerTrend[i].value,
  walledCity: walledCityTrend[i].value,
}));

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  whileInView:{ opacity: 1, y: 0 },
  viewport:   { once: true },
  transition: { duration: 0.45, delay },
});

// ─── Trend icon ───────────────────────────────────────────────────────────────

function TrendIcon({ trend }) {
  if (trend === 'up')   return <TrendingUp  size={14} color={RED} />;
  if (trend === 'down') return <TrendingDown size={14} color={EMERALD} />;
  return <Minus size={14} color="#6b7280" />;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,10,15,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px' }}>
      <p style={{ color: '#94a3b8', fontSize: 11, fontFamily: "'Exo 2', sans-serif", marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", margin: '2px 0' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const severityStyles = {
    critical: { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   color: RED,    label: t('analytics.severityLabels.critical') },
    high:     { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  color: AMBER,  label: t('analytics.severityLabels.high') },
    medium:   { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',  color: BLUE,   label: t('analytics.severityLabels.medium') },
    low:      { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)', color: EMERALD, label: t('analytics.severityLabels.low') },
  };

  const statCards = [
    { label: t('analytics.statLabels.modelAccuracy'),     value: '94.2%', icon: Brain,    color: EMERALD },
    { label: t('analytics.statLabels.zonesAnalyzed'),     value: '7',     icon: Map,      color: BLUE },
    { label: t('analytics.statLabels.activePredictions'), value: '12',    icon: Activity, color: AMBER },
    { label: t('analytics.statLabels.dataPoints'),        value: '500+',  icon: Database, color: PURPLE },
  ];

  const pipelineStages = [
    {
      icon: Database,
      title: t('analytics.pipeline.stages.dataCollection.title'),
      color: BLUE,
      points: t('analytics.pipeline.stages.dataCollection.points', { returnObjects: true }),
    },
    {
      icon: Zap,
      title: t('analytics.pipeline.stages.featureEngineering.title'),
      color: PURPLE,
      points: t('analytics.pipeline.stages.featureEngineering.points', { returnObjects: true }),
    },
    {
      icon: Brain,
      title: t('analytics.pipeline.stages.randomForest.title'),
      color: EMERALD,
      points: t('analytics.pipeline.stages.randomForest.points', { returnObjects: true }),
    },
    {
      icon: Shield,
      title: t('analytics.pipeline.stages.riskClassification.title'),
      color: AMBER,
      points: t('analytics.pipeline.stages.riskClassification.points', { returnObjects: true }),
    },
  ];

  const tableColumns = [
    t('analytics.zoneRiskAssessment.columns.zone'),
    t('analytics.zoneRiskAssessment.columns.score'),
    t('analytics.zoneRiskAssessment.columns.severity'),
    t('analytics.zoneRiskAssessment.columns.primaryFactor'),
    t('analytics.zoneRiskAssessment.columns.trend'),
  ];

  return (
    <PublicLayout>
      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">

        {/* ══ Header ══════════════════════════════════════════════════════════ */}
        <motion.div {...fadeUp(0)} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <h1
              className="text-4xl font-black"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background: 'linear-gradient(135deg, #f0f0f5 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('analytics.title')}
            </h1>

            {/* LIVE badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)' }}
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-2 h-2 rounded-full"
                style={{ background: RED }}
              />
              <span style={{ color: RED, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700 }}>
                {t('analytics.live')}
              </span>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", fontSize: 15, maxWidth: 540 }}>
            {t('analytics.subtitle')}
          </p>
        </motion.div>

        {/* ══ Stat cards ══════════════════════════════════════════════════════ */}
        <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                whileHover={{ scale: 1.03, y: -2 }}
                className="p-5 flex flex-col gap-3"
                style={CARD_STYLE}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${card.color}1a`, border: `1px solid ${card.color}40` }}
                >
                  <Icon size={17} color={card.color} />
                </div>
                <div>
                  <div
                    className="text-3xl font-bold mb-0.5"
                    style={{ color: card.color, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {card.value}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}>
                    {card.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ══ Feature importance + Zone matrix ════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Feature importance chart */}
          <motion.div {...fadeUp(0.1)} className="p-6" style={CARD_STYLE}>
            <h3
              className="text-base font-bold mb-1"
              style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)', fontSize: 14 }}
            >
              {t('analytics.featureImportance.title')}
            </h3>
            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
              {t('analytics.featureImportance.subtitle')}
            </p>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart layout="vertical" data={featureData} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <XAxis
                  type="number"
                  domain={[0, 45]}
                  tickFormatter={v => `${v}%`}
                  tick={{ fill: '#6b7280', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="feature"
                  type="category"
                  width={110}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: "'Exo 2', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="importance" radius={[0, 6, 6, 0]} name="Importance %">
                  {featureData.map((entry) => (
                    <Cell key={entry.feature} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Zone risk matrix */}
          <motion.div {...fadeUp(0.12)} className="p-6 flex flex-col" style={CARD_STYLE}>
            <h3
              className="text-base font-bold mb-1"
              style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)', fontSize: 14 }}
            >
              {t('analytics.zoneRiskAssessment.title')}
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
              {t('analytics.zoneRiskAssessment.subtitle')}
            </p>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
                <thead>
                  <tr>
                    {tableColumns.map(col => (
                      <th
                        key={col}
                        className="pb-2 text-left text-xs font-semibold"
                        style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", paddingRight: 12 }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {zoneData.map((row, i) => {
                    const sev = severityStyles[row.severity];
                    return (
                      <motion.tr
                        key={row.zone}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <td className="py-1.5 pr-3" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif", fontSize: 12, fontWeight: 500 }}>
                          {row.zone}
                        </td>
                        <td className="py-1.5 pr-3" style={{ color: sev.color, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700 }}>
                          {row.score}
                        </td>
                        <td className="py-1.5 pr-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: sev.bg, border: `1px solid ${sev.border}`, color: sev.color, fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {sev.label}
                          </span>
                        </td>
                        <td className="py-1.5 pr-3" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", fontSize: 12 }}>
                          {row.factor}
                        </td>
                        <td className="py-1.5">
                          <TrendIcon trend={row.trend} />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* ══ 24-hour risk trend ═══════════════════════════════════════════════ */}
        <motion.div {...fadeUp(0.15)} className="p-6 mb-8" style={CARD_STYLE}>
          <h3
            className="text-base font-bold mb-1"
            style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)', fontSize: 14 }}
          >
            {t('analytics.trendChart.title')}
          </h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
            {t('analytics.trendChart.subtitle')}
          </p>

          {/* Legend */}
          <div className="flex items-center gap-6 mb-4">
            {[
              { label: 'Mansarovar', color: RED },
              { label: 'Sanganer',   color: AMBER },
              { label: 'Walled City',color: BLUE },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 rounded" style={{ background: l.color }} />
                <span style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", fontSize: 12 }}>{l.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-4 h-0 border-t-2 border-dashed" style={{ borderColor: '#ef4444' }} />
              <span style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", fontSize: 12 }}>
                {t('analytics.trendChart.highRiskThreshold')}
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="hour"
                tick={{ fill: '#6b7280', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                interval={3}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine
                y={70}
                stroke={RED}
                strokeDasharray="5 3"
                strokeOpacity={0.7}
                label={{ value: t('analytics.trendChart.highRiskThreshold'), fill: RED, fontSize: 10, fontFamily: "'Exo 2', sans-serif", position: 'insideTopRight' }}
              />
              <Line dataKey="mansarovar" name="Mansarovar" stroke={RED}   strokeWidth={2} dot={false} type="monotone" />
              <Line dataKey="sanganer"   name="Sanganer"   stroke={AMBER} strokeWidth={2} dot={false} type="monotone" />
              <Line dataKey="walledCity" name="Walled City" stroke={BLUE} strokeWidth={2} dot={false} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ══ ML Pipeline ══════════════════════════════════════════════════════ */}
        <motion.div {...fadeUp(0.18)}>
          <h3
            className="text-base font-bold mb-1 text-center"
            style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)', fontSize: 14 }}
          >
            {t('analytics.pipeline.title')}
          </h3>
          <p className="text-xs mb-6 text-center" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
            {t('analytics.pipeline.subtitle')}
          </p>

          <div className="flex items-stretch gap-3">
            {pipelineStages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={stage.title} className="flex items-center flex-1 gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.18 + i * 0.1 }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    className="flex-1 p-5 flex flex-col gap-3"
                    style={{
                      ...CARD_STYLE,
                      borderColor: `${stage.color}30`,
                    }}
                  >
                    {/* Step number + icon */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${stage.color}18`, border: `1px solid ${stage.color}35` }}
                      >
                        <Icon size={15} color={stage.color} />
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        0{i + 1}
                      </span>
                    </div>

                    <h4
                      className="font-bold"
                      style={{ color: stage.color, fontFamily: "'Orbitron', sans-serif", fontSize: 12 }}
                    >
                      {stage.title}
                    </h4>

                    <ul className="flex flex-col gap-1.5">
                      {stage.points.map(pt => (
                        <li
                          key={pt}
                          className="flex items-start gap-1.5 text-xs"
                          style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}
                        >
                          <span style={{ color: stage.color, marginTop: 1 }}>›</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Arrow between stages */}
                  {i < pipelineStages.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.25 + i * 0.1 }}
                      className="flex-shrink-0 flex items-center"
                      style={{ color: 'rgba(255,255,255,0.18)', fontSize: 20, fontWeight: 300 }}
                    >
                      →
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </PublicLayout>
  );
}
