import { motion } from 'framer-motion';
import { Sparkles, Trophy, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../components/layout/PublicLayout';

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const viewportOnce = { once: true, amount: 0.2 };

const TECH_STACK = [
  { emoji: '⚡', name: 'FastAPI',        use: 'REST API & WebSocket server' },
  { emoji: '⚛️', name: 'React 18',       use: 'Reactive UI with live updates' },
  { emoji: '🗺️', name: 'Leaflet',        use: 'Interactive emergency maps' },
  { emoji: '🤖', name: 'scikit-learn',   use: 'Random Forest risk ML model' },
  { emoji: '🌤️', name: 'Open-Meteo',     use: 'Real-time Jaipur weather' },
  { emoji: '🔗', name: 'NetworkX',       use: 'Shortest safe path routing' },
  { emoji: '🎞️', name: 'Framer Motion',  use: 'Smooth emergency UI animations' },
  { emoji: '🎨', name: 'Tailwind CSS',   use: 'Rapid utility-first styling' },
  { emoji: '🌑', name: 'CartoDB',        use: 'Dark disaster-ready map tiles' },
];


const glassCard = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
};

export default function AboutPage() {
  const { t } = useTranslation();

  const techStack = [
    { emoji: '⚡', name: 'FastAPI',        use: t('about.techStack.usedFor') + ' REST API & WebSocket server' },
    { emoji: '⚛️', name: 'React 18',       use: t('about.techStack.usedFor') + ' Reactive UI with live updates' },
    { emoji: '🗺️', name: 'Leaflet',        use: t('about.techStack.usedFor') + ' Interactive emergency maps' },
    { emoji: '🤖', name: 'scikit-learn',   use: t('about.techStack.usedFor') + ' Random Forest risk ML model' },
    { emoji: '🌤️', name: 'Open-Meteo',     use: t('about.techStack.usedFor') + ' Real-time Jaipur weather' },
    { emoji: '🔗', name: 'NetworkX',       use: t('about.techStack.usedFor') + ' Shortest safe path routing' },
    { emoji: '🎞️', name: 'Framer Motion',  use: t('about.techStack.usedFor') + ' Smooth emergency UI animations' },
    { emoji: '🎨', name: 'Tailwind CSS',   use: t('about.techStack.usedFor') + ' Rapid utility-first styling' },
    { emoji: '🌑', name: 'CartoDB',        use: t('about.techStack.usedFor') + ' Dark disaster-ready map tiles' },
  ];

return (
    <PublicLayout>
      <div className="pt-24 pb-16 max-w-5xl mx-auto px-6 flex flex-col gap-16">

        {/* ── Section 1: About ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <h1
            className="text-5xl font-black mb-10"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('about.title')}
          </h1>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Problem */}
            <div style={glassCard} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.15)' }}
                >
                  <Cpu size={16} style={{ color: '#ef4444' }} />
                </div>
                <h2
                  className="text-base font-bold"
                  style={{ fontFamily: "'Orbitron', sans-serif", color: '#ef4444' }}
                >
                  {t('about.problem.title')}
                </h2>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Exo 2', sans-serif" }}>
                {t('about.problem.p1')}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Exo 2', sans-serif" }}>
                {t('about.problem.p2')}
              </p>
            </div>

            {/* Solution */}
            <div style={glassCard} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.15)' }}
                >
                  <Sparkles size={16} style={{ color: '#10b981' }} />
                </div>
                <h2
                  className="text-base font-bold"
                  style={{ fontFamily: "'Orbitron', sans-serif", color: '#10b981' }}
                >
                  {t('about.solution.title')}
                </h2>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Exo 2', sans-serif" }}>
                {t('about.solution.p1')}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Exo 2', sans-serif" }}>
                {t('about.solution.p2')}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── Section 2: Architecture ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <h2
            className="text-2xl font-black mb-8"
            style={{ fontFamily: "'Orbitron', sans-serif", color: 'rgba(255,255,255,0.9)' }}
          >
            {t('about.architecture.title')}
          </h2>

          <div style={glassCard} className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">

              {/* Data Sources */}
              <div
                className="flex-1 min-w-[180px] rounded-xl p-4"
                style={{
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.3)',
                }}
              >
                <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: '#3b82f6', fontFamily: "'Orbitron', sans-serif" }}>
                  {t('about.architecture.dataSources')}
                </p>
                {t('about.architecture.dataSourceItems', { returnObjects: true }).map(item => (
                  <div key={item} className="flex items-center gap-2 mb-1.5 last:mb-0">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#3b82f6' }} />
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center text-2xl font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>
                →
              </div>

              {/* Backend (center, larger) */}
              <div
                className="flex-[1.4] min-w-[220px] rounded-xl p-4"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.4)',
                  boxShadow: '0 0 24px rgba(16,185,129,0.1)',
                }}
              >
                <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: '#10b981', fontFamily: "'Orbitron', sans-serif" }}>
                  {t('about.architecture.backend')}
                </p>
                {t('about.architecture.backendItems', { returnObjects: true }).map(item => (
                  <div key={item} className="flex items-center gap-2 mb-1.5 last:mb-0">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#10b981' }} />
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center text-2xl font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>
                →
              </div>

              {/* Frontend */}
              <div
                className="flex-1 min-w-[180px] rounded-xl p-4"
                style={{
                  background: 'rgba(168,85,247,0.08)',
                  border: '1px solid rgba(168,85,247,0.3)',
                }}
              >
                <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: '#a855f7', fontFamily: "'Orbitron', sans-serif" }}>
                  {t('about.architecture.frontend')}
                </p>
                {t('about.architecture.frontendItems', { returnObjects: true }).map(item => (
                  <div key={item} className="flex items-center gap-2 mb-1.5 last:mb-0">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#a855f7' }} />
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Section 3: Tech Stack ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <h2
            className="text-2xl font-black mb-8"
            style={{ fontFamily: "'Orbitron', sans-serif", color: 'rgba(255,255,255,0.9)' }}
          >
            {t('about.techStack.title')}
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {techStack.map(({ emoji, name, use }) => (
              <motion.div
                key={name}
                style={glassCard}
                className="p-4 flex items-start gap-3"
                whileHover={{
                  background: 'rgba(255,255,255,0.055)',
                  borderColor: 'rgba(255,255,255,0.14)',
                  transition: { duration: 0.15 },
                }}
              >
                <span className="text-2xl flex-shrink-0" role="img" aria-label={name}>{emoji}</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#fff', fontFamily: "'Orbitron', sans-serif" }}>
                    {name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Exo 2', sans-serif" }}>
                    {use}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

{/* ── Section 5: Mission Banner ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.35)',
              boxShadow: '0 0 40px rgba(16,185,129,0.1)',
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Trophy size={22} style={{ color: '#10b981' }} />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {t('about.mission.ourMission')}
              </span>
            </div>

            <h3
              className="text-3xl font-black mb-2"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('about.mission.title')}
            </h3>

            <p className="text-base mb-1" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Exo 2', sans-serif" }}>
              {t('about.mission.tagline')}
            </p>

            <p
              className="text-sm font-semibold mb-2"
              style={{ color: '#10b981', fontFamily: "'Exo 2', sans-serif" }}
            >
              {t('about.mission.subtitle')}
            </p>

            <p
              className="text-xs"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              {t('about.mission.badge')}
            </p>
          </div>
        </motion.section>

      </div>
    </PublicLayout>
  );
}
