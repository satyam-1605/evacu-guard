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
          <p className="text-xs tracking-widest uppercase text-emerald-400 mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
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
          className="relative grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch"
        >
          {/* Connector line spanning all cards */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px z-0"
            style={{ background: 'linear-gradient(90deg, #3b82f640, #9333ea40, #f59e0b40, #10b98140)' }}
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={i} variants={itemVariants} className="relative flex flex-col">
                {/* Connector dot on the line */}
                <div
                  className="hidden md:block absolute top-[34px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-10"
                  style={{ background: step.accent, boxShadow: `0 0 10px ${step.accent}80` }}
                />

                <div
                  className="flex flex-col gap-5 relative overflow-hidden h-full mt-8 rounded-2xl p-6"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${step.accent}30`,
                    boxShadow: `0 0 0 0 ${step.accent}00`,
                    transition: 'box-shadow 0.3s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 24px ${step.accent}18`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 0 0 ${step.accent}00`}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${step.accent}, transparent)` }}
                  />

                  {/* Step number badge + icon row */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${step.accent}18`,
                        border: `1px solid ${step.accent}40`,
                        boxShadow: `0 0 16px ${step.accent}20`,
                      }}
                    >
                      <Icon size={22} color={step.accent} />
                    </div>
                    <span
                      className="text-3xl font-black"
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        color: step.accent,
                        opacity: 0.25,
                        lineHeight: 1,
                      }}
                    >
                      {step.num}
                    </span>
                  </div>

                  {/* Text */}
                  <div>
                    <h3
                      className="text-base font-bold mb-2"
                      style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}
                    >
                      {step.desc}
                    </p>
                  </div>

                  {/* Bottom step indicator */}
                  <div className="mt-auto pt-4 flex items-center gap-2" style={{ borderTop: `1px solid ${step.accent}15` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: step.accent }} />
                    <span className="text-xs font-bold" style={{ color: step.accent, fontFamily: "'JetBrains Mono', monospace", opacity: 0.7 }}>
                      STEP {step.num}
                    </span>
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
