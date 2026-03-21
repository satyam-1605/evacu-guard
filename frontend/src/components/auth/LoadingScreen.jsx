import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Zap size={28} color="#10b981" />
        </div>
        <span className="text-2xl font-black" style={{ fontFamily: "'Orbitron', sans-serif", background: 'linear-gradient(135deg, #f0f0f5 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          EvacuGuard
        </span>
        <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{t('loading.loading')}</p>
      </motion.div>
    </div>
  );
}
