import { Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="relative py-16 px-6 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Grid lines */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3), rgba(59,130,246,0.2), transparent)' }} />

      <div className="relative max-w-7xl mx-auto flex flex-col items-center gap-6 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Zap size={20} color="#10b981" />
          <span className="text-xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
            EvacuGuard
          </span>
        </div>

        {/* Description */}
        <p className="text-sm max-w-lg" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", lineHeight: 1.7 }}>
          {t('footer.description').split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </p>

        {/* Punchline badge */}
        <div className="flex items-center gap-2 px-5 py-2 rounded-xl glass-card-sm">
          <span className="text-xs tracking-widest uppercase font-jetbrains" style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
            {t('footer.smarter')} ·&nbsp;
          </span>
          <span className="text-xs font-bold text-emerald-400 font-jetbrains" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {t('footer.faster')}
          </span>
          <span className="text-xs tracking-widest uppercase font-jetbrains" style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
            &nbsp;· {t('footer.safer')}
          </span>
        </div>

        {/* Divider */}
        <div className="w-32 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <p className="text-xs font-jetbrains" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
          {t('footer.tagline')}
        </p>
      </div>
    </footer>
  );
}
