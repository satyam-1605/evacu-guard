import { motion } from 'framer-motion';
import { Wifi, Brain, CloudSun, Radio } from 'lucide-react';

const services = [
  { name: 'API Server', icon: Wifi, status: 'online', latency: '12ms', uptime: '99.8%' },
  { name: 'ML Model', icon: Brain, status: 'online', latency: '45ms', uptime: '100%' },
  { name: 'Weather Service', icon: CloudSun, status: 'online', latency: '280ms', uptime: '98.1%' },
  { name: 'WebSocket', icon: Radio, status: 'online', latency: '3ms', uptime: '99.9%' },
];

export default function SystemStatus() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
        System Status
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((svc, i) => {
          const Icon = svc.icon;
          const online = svc.status === 'online';
          const color = online ? '#10b981' : '#ef4444';

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${online ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}` }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />

              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon size={17} color={color} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: color, animation: 'pulseDot 1.5s ease-in-out infinite', boxShadow: `0 0 6px ${color}` }} />
                  <span className="text-xs font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {online ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                {svc.name}
              </p>

              <div className="flex gap-4">
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>Latency</p>
                  <p className="text-xs font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{svc.latency}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>Uptime</p>
                  <p className="text-xs font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{svc.uptime}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
