import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart2, MapPin, Zap } from 'lucide-react';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Globe3D from './Globe3D';
import TypewriterText from './TypewriterText';
import ParticleBackground from './ParticleBackground';
import StatCounter from './StatCounter';
import GlowButton from '../shared/GlowButton';
import { useLocation } from '../../hooks/useLocation';

export default function HeroSection() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { location } = useLocation();
  const heroRef = useRef(null);
  const { t } = useTranslation();

  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  }, []);

  const stats = [
    { value: 12, label: t('hero.stats.activeHazardZones'), accent: '#ef4444', pulse: true, suffix: '' },
    { value: 2150, label: t('hero.stats.shelterCapacity'), accent: '#10b981', suffix: '' },
    { value: 2.8, label: t('hero.stats.minResponseTime'), accent: '#3b82f6', prefix: '<', suffix: ' min', decimals: 1 },
    { value: 3, label: t('hero.stats.scenariosReady'), accent: '#f59e0b', suffix: '' },
  ];

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden gradient-mesh"
      onMouseMove={handleMouseMove}
    >
      {/* Particle field */}
      <ParticleBackground />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Radial spotlight from center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at ${50 + mousePos.x * 5}% ${40 + mousePos.y * 5}%, rgba(16,185,129,0.06) 0%, transparent 70%)`,
          transition: 'background 0.3s ease',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6 pt-20 pb-10 gap-12">

        {/* Left: Text content */}
        <div className="flex-1 flex flex-col items-start gap-6 max-w-2xl">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-card-sm"
          >
            <Zap size={13} color="#10b981" />
            <span className="text-xs tracking-widest uppercase font-jetbrains" style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
              {t('hero.badge')}
            </span>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h1
              className="text-7xl xl:text-8xl font-black leading-none tracking-tighter"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background: 'linear-gradient(135deg, #f0f0f5 0%, #10b981 50%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 30px rgba(16,185,129,0.3))',
              }}
            >
              EvacuGuard
            </h1>
          </motion.div>

          {/* Subtitle typewriter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-xl xl:text-2xl font-light"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}
          >
            <TypewriterText
              text={t('hero.subtitle')}
              delay={50}
            />
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-base leading-relaxed max-w-lg"
            style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}
          >
            {t('hero.description')}
          </motion.p>

          {/* Location badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-2"
          >
            <MapPin size={14} color="#10b981" />
            <span className="text-sm font-jetbrains" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>
              {location
                ? location.isFallback
                  ? '26.9124°N, 75.7873°E — Jaipur, Rajasthan'
                  : `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E — ${t('hero.yourLocation')}`
                : '26.9124°N, 75.7873°E — Jaipur, Rajasthan'
              }
            </span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="flex gap-4 flex-wrap"
          >
            <GlowButton
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconRight
              onClick={() => navigate('/dashboard')}
            >
              {t('hero.launchDashboard')}
            </GlowButton>
            <GlowButton
              variant="secondary"
              size="lg"
              icon={BarChart2}
              onClick={() => navigate('/analytics')}
            >
              {t('hero.viewAnalytics')}
            </GlowButton>
          </motion.div>
        </div>

        {/* Right: 3D Globe */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex-shrink-0 relative"
          style={{ width: 420, height: 420 }}
        >
          {/* Glow rings behind globe */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.06) 50%, transparent 70%)',
              animation: 'glowPulse 3s ease-in-out infinite',
            }}
          />
          <div
            className="absolute inset-4 rounded-full border"
            style={{ borderColor: 'rgba(16,185,129,0.15)', animation: 'spin 30s linear infinite' }}
          />
          <div
            className="absolute inset-8 rounded-full border"
            style={{ borderColor: 'rgba(59,130,246,0.1)', animation: 'spin 45s linear infinite reverse' }}
          />

          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-2 border-emerald-500/30 animate-pulse" />
            </div>
          }>
            <Globe3D mouseX={mousePos.x} mouseY={mousePos.y} />
          </Suspense>

          {/* Floating label */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-card-sm px-4 py-2 flex items-center gap-2 whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ animation: 'pulseDot 1.5s ease-in-out infinite' }} />
            <span className="text-xs font-jetbrains text-emerald-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {t('hero.liveMonitor')}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Stat counters */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.7 }}
        className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mx-auto px-6 pb-16"
      >
        {stats.map((s, i) => (
          <StatCounter key={i} index={i} {...s} />
        ))}
      </motion.div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0a0a0f)' }}
      />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 rounded-full border border-white/15 flex items-center justify-center">
          <div className="w-1 h-2 rounded-full bg-emerald-400 opacity-60" />
        </div>
      </motion.div>
    </div>
  );
}
