import { Github, Zap } from 'lucide-react';

export default function Footer() {
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
          AI-Powered Evacuation Route Planning & Crowd Movement System.<br />
          Built for Jaipur, Rajasthan — protecting lives through intelligent disaster response.
        </p>

        {/* Hackathon badge */}
        <div className="flex items-center gap-2 px-5 py-2 rounded-xl glass-card-sm">
          <span className="text-xs tracking-widest uppercase font-jetbrains" style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
            Built for&nbsp;
          </span>
          <span className="text-xs font-bold text-emerald-400 font-jetbrains" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Hackerz Street 4.0
          </span>
          <span className="text-xs tracking-widest uppercase font-jetbrains" style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
            &nbsp;·&nbsp;Manipal University Jaipur&nbsp;·&nbsp;IEEE Computer Society
          </span>
        </div>

        {/* Divider */}
        <div className="w-32 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <p className="text-xs font-jetbrains" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
          Disaster Management Track · Problem #3: Evacuation Route Planning & Crowd Movement
        </p>
      </div>
    </footer>
  );
}
