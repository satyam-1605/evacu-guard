import { motion } from 'framer-motion';
import { Radio, Brain, Map, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STEP_ICONS = [Radio, Brain, Map, ShieldCheck];
const STEP_ACCENTS = ['#3b82f6', '#9333ea', '#f59e0b', '#10b981'];
const STEP_NUMS = ['01', '02', '03', '04'];
const STEP_KEYS = [
  ['step1Title', 'step1Desc'],
  ['step2Title', 'step2Desc'],
  ['step3Title', 'step3Desc'],
  ['step4Title', 'step4Desc'],
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = STEP_KEYS.map(([titleKey, descKey], i) => ({
    num: STEP_NUMS[i],
    icon: STEP_ICONS[i],
    title: t(`howItWorks.${titleKey}`),
    desc: t(`howItWorks.${descKey}`),
    accent: STEP_ACCENTS[i],
  }));

  return (
    <section id="how-it-works" className="relative py-28 px-6 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-widest uppercase text-emerald-400 mb-4 font-jetbrains" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {t('howItWorks.sectionLabel')}
          </p>
          <h2
            className="text-5xl font-bold mb-4"
            style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}
          >
            {t('howItWorks.title')}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-32 bg-gradient-to-r from-transparent to-emerald-500/40" />
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="h-px w-32 bg-gradient-to-l from-transparent to-emerald-500/40" />
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="relative grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={i} variants={itemVariants} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-12 left-[calc(100%)] w-full h-px z-0"
                    style={{
                      background: `linear-gradient(90deg, ${step.accent}40, ${steps[i + 1].accent}40)`,
                      width: 'calc(100% - 2rem)',
                      left: 'calc(50% + 2rem)',
                    }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: steps[i + 1].accent }} />
                  </div>
                )}

                <div
                  className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group cursor-default h-full"
                  style={{ borderColor: `${step.accent}20` }}
                >
                  {/* Big faded step number */}
                  <span
                    className="absolute -top-4 -right-2 text-8xl font-black opacity-5 select-none"
                    style={{ fontFamily: "'Orbitron', sans-serif", color: step.accent }}
                  >
                    {step.num}
                  </span>

                  {/* Top glow line */}
                  <div
                    className="absolute top-0 left-0 w-full h-0.5 rounded-t-2xl transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${step.accent}80, transparent)` }}
                  />

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${step.accent}15`, border: `1px solid ${step.accent}30` }}
                  >
                    <Icon size={22} color={step.accent} />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
