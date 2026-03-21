import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Phone,
  Copy,
  Check,
  Download,
  Shield,
  Droplets,
  AlertTriangle,
  Heart,
  Users,
  Home,
  HelpingHand,
  FileText,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../components/layout/PublicLayout';

// ─── Data ────────────────────────────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  { id: 0, text: 'Know your nearest shelter location' },
  { id: 1, text: 'Save emergency contacts (112, 108, 101)' },
  { id: 2, text: 'Prepare emergency kit (water, food, medicine)' },
  { id: 3, text: 'Identify your primary evacuation route' },
  { id: 4, text: 'Waterproof important documents' },
  { id: 5, text: 'Keep phone charged + portable battery' },
  { id: 6, text: 'Follow official weather updates daily' },
  { id: 7, text: 'Register for EvacuGuard emergency alerts' },
];

const SAFETY_TIPS = [
  {
    id: 0,
    title: 'During Flooding',
    icon: Droplets,
    preview: 'Stay away from flood waters and move to higher ground immediately.',
    bullets: [
      'Stay away from all flood waters — even shallow water can knock you down',
      'Move to higher ground immediately and do not wait for instructions',
      'Do not drive through flooded roads — turn around, don\'t drown',
      'Avoid storm drains, ditches, and streams during heavy rain',
    ],
  },
  {
    id: 1,
    title: 'Evacuation Tips',
    icon: AlertTriangle,
    preview: 'Follow designated routes and take your emergency kit with you.',
    bullets: [
      'Follow only designated official evacuation routes',
      'Always take your pre-packed emergency kit with you',
      'Keep your family together and account for everyone before leaving',
      'Lock your home, turn off utilities, and leave early to avoid traffic',
    ],
  },
  {
    id: 2,
    title: 'First Aid Basics',
    icon: Heart,
    preview: 'Keep a first aid kit accessible and know CPR basics.',
    bullets: [
      'Keep a fully stocked first aid kit at home and in your vehicle',
      'Learn CPR basics — it can save a life in the critical minutes before help arrives',
      'Treat wounds immediately to prevent infection',
      'Know the location of your nearest emergency medical center',
    ],
  },
  {
    id: 3,
    title: 'Communication Plan',
    icon: Users,
    preview: 'Designate a family meeting point and share your location.',
    bullets: [
      'Designate a clear family meeting point outside your home',
      'Share your real-time location with a trusted contact during emergencies',
      'Have backup contacts — one local and one out-of-city',
      'Agree on a single point of contact for all family members to check in with',
    ],
  },
  {
    id: 4,
    title: 'After a Disaster',
    icon: Home,
    preview: 'Avoid standing water and check for structural damage before re-entering.',
    bullets: [
      'Avoid walking through standing water — it may be contaminated or electrically charged',
      'Check for structural damage before re-entering any building',
      'Report hazards such as downed power lines or gas leaks immediately',
      'Use bottled or boiled water until tap water is declared safe',
    ],
  },
  {
    id: 5,
    title: 'Helping Others',
    icon: HelpingHand,
    preview: 'Assist elderly and disabled neighbors safely and responsibly.',
    bullets: [
      'Assist elderly and disabled neighbors in evacuating if it is safe to do so',
      'Do not enter unsafe or structurally damaged buildings',
      'Contact NDRF (National Disaster Response Force) for professional rescue',
      'Provide emotional support — disasters are traumatic for everyone involved',
    ],
  },
];

const EMERGENCY_CONTACTS = [
  { service: 'Disaster Helpline', number: '1078' },
  { service: 'National Emergency', number: '112' },
  { service: 'Fire Brigade', number: '101' },
  { service: 'Ambulance', number: '108' },
  { service: 'Police', number: '100' },
  { service: 'Jaipur Municipal', number: '181' },
  { service: 'District Collector', number: '0141-2227253' },
  { service: 'NDRF Helpline', number: '011-24363260' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AnimatedCheckmark({ checked }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        flexShrink: 0,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        animate={{
          scale: checked ? 1 : 0.85,
          opacity: checked ? 1 : 0.4,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: `2px solid ${checked ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
          background: checked ? 'rgba(16,185,129,0.15)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.3s, background 0.3s',
        }}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              key="check"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <motion.path
                d="M2.5 7L5.5 10L11.5 4"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ChecklistItem({ item, isChecked, onToggle }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      onClick={() => onToggle(item.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 18px',
        borderRadius: 12,
        cursor: 'pointer',
        background: isChecked
          ? 'rgba(16,185,129,0.06)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${
          isChecked ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)'
        }`,
        boxShadow: isChecked ? '0 0 12px rgba(16,185,129,0.08)' : 'none',
        transition:
          'background 0.3s, border-color 0.3s, box-shadow 0.3s',
        userSelect: 'none',
      }}
    >
      <AnimatedCheckmark checked={isChecked} />
      <span
        style={{
          fontFamily: "'Exo 2', sans-serif",
          fontSize: 15,
          color: isChecked
            ? 'rgba(255,255,255,0.5)'
            : 'rgba(255,255,255,0.85)',
          textDecoration: isChecked ? 'line-through' : 'none',
          transition: 'color 0.3s',
        }}
      >
        {item.text}
      </span>
    </motion.div>
  );
}

function SafetyCard({ tip }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = tip.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015 }}
      onClick={() => setExpanded((p) => !p)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '20px 22px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={18} color="#10b981" />
          </div>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {tip.title}
          </span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} color="rgba(255,255,255,0.4)" />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {!expanded && (
          <motion.p
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 13,
              color: 'rgba(255,255,255,0.45)',
              marginTop: 10,
              marginBottom: 0,
            }}
          >
            {tip.preview}
          </motion.p>
        )}
        {expanded && (
          <motion.ul
            key="bullets"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: 14,
              paddingLeft: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {tip.bullets.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: 13.5,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.55,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#10b981',
                    marginTop: 7,
                    flexShrink: 0,
                  }}
                />
                {b}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PreparednessPage() {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('evacuguard_checklist') || '[]');
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);
  const [showPdfTooltip, setShowPdfTooltip] = useState(false);

  // Build translated data inside component so it re-renders on language change
  const checklistItems = CHECKLIST_ITEMS.map(item => ({ ...item, text: t(`preparedness.checklist.items.${item.id}`) }));
  const safetyTipKeys = ['flooding', 'evacuation', 'firstAid', 'communication', 'afterDisaster', 'helpingOthers'];
  const safetyTipIcons = [Droplets, AlertTriangle, Heart, Users, Home, HelpingHand];
  const safetyTips = safetyTipKeys.map((key, i) => ({
    id: i,
    title: t(`preparedness.safetyTips.${key}.title`),
    icon: safetyTipIcons[i],
    preview: t(`preparedness.safetyTips.${key}.preview`),
    bullets: [0, 1, 2, 3].map(bi => t(`preparedness.safetyTips.${key}.bullets.${bi}`)).filter(b => b && !b.startsWith('preparedness.')),
  }));
  const emergencyContacts = [
    { service: t('preparedness.emergencyContacts.services.disasterHelpline'), number: '1078' },
    { service: t('preparedness.emergencyContacts.services.nationalEmergency'), number: '112' },
    { service: t('preparedness.emergencyContacts.services.fireBrigade'), number: '101' },
    { service: t('preparedness.emergencyContacts.services.ambulance'), number: '108' },
    { service: t('preparedness.emergencyContacts.services.police'), number: '100' },
    { service: t('preparedness.emergencyContacts.services.jaipurMunicipal'), number: '181' },
    { service: t('preparedness.emergencyContacts.services.districtCollector'), number: '0141-2227253' },
    { service: t('preparedness.emergencyContacts.services.ndrf'), number: '011-24363260' },
  ];

  const toggleItem = (id) => {
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem('evacuguard_checklist', JSON.stringify(next));
      return next;
    });
  };

  const handleCopyAll = () => {
    const text = emergencyContacts.map((c) => `${c.service}: ${c.number}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const progress = checked.length;
  const total = checklistItems.length;
  const progressPct = Math.round((progress / total) * 100);

  return (
    <PublicLayout>
      <div
        style={{
          paddingTop: 96,
          paddingBottom: 64,
          maxWidth: 1152,
          margin: '0 auto',
          padding: '96px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 48,
        }}
      >
        {/* ── Section 1: Hero Banner ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderLeft: '4px solid #10b981',
            borderRadius: 16,
            padding: '36px 40px',
          }}
        >
          <h1
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              marginBottom: 12,
            }}
          >
            {t('preparedness.heroBanner.title1')}{' '}
            <span style={{ color: '#10b981' }}>{t('preparedness.heroBanner.title2')}</span>
          </h1>
          <p
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 16,
              color: 'rgba(255,255,255,0.6)',
              margin: 0,
              maxWidth: 560,
              lineHeight: 1.65,
            }}
          >
            {t('preparedness.heroBanner.desc')}
          </p>
        </motion.div>

        {/* ── Section 2: Emergency Checklist ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 20,
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: 20,
              marginTop: 0,
            }}
          >
            {t('preparedness.checklist.title')}
          </h2>

          {/* Progress bar */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {t('preparedness.checklist.completed', { done: progress, total })}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: '#10b981',
                }}
              >
                {progressPct}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: 6,
                borderRadius: 99,
                background: 'rgba(255,255,255,0.07)',
                overflow: 'hidden',
              }}
            >
              <motion.div
                animate={{ width: `${progressPct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                style={{
                  height: '100%',
                  borderRadius: 99,
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  boxShadow: '0 0 8px rgba(16,185,129,0.5)',
                }}
              />
            </div>
          </div>

          {/* Checklist items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {checklistItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ChecklistItem
                  item={item}
                  isChecked={checked.includes(item.id)}
                  onToggle={toggleItem}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Section 3: Safety Tips ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 20,
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: 20,
              marginTop: 0,
            }}
          >
            {t('preparedness.safetyGuidelines')}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
            }}
          >
            {safetyTips.map((tip, i) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
              >
                <SafetyCard tip={tip} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Section 4: Emergency Contacts ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <h2
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 20,
                fontWeight: 600,
                color: '#ffffff',
                margin: 0,
              }}
            >
              {t('preparedness.emergencyContacts.title')}
            </h2>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleCopyAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 10,
                background: copied
                  ? 'rgba(16,185,129,0.12)'
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${
                  copied ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.1)'
                }`,
                color: copied ? '#10b981' : 'rgba(255,255,255,0.7)',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{ display: 'flex' }}
                  >
                    <Check size={14} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{ display: 'flex' }}
                  >
                    <Copy size={14} />
                  </motion.span>
                )}
              </AnimatePresence>
              {copied ? t('preparedness.emergencyContacts.copied') : t('preparedness.emergencyContacts.copyAll')}
            </motion.button>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {emergencyContacts.map((contact, i) => (
              <motion.div
                key={contact.service}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 22px',
                  borderBottom:
                    i < emergencyContacts.length - 1
                      ? '1px solid rgba(255,255,255,0.05)'
                      : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Phone size={14} color="#10b981" />
                  <span
                    style={{
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.75)',
                    }}
                  >
                    {contact.service}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#f59e0b',
                    letterSpacing: '0.04em',
                  }}
                >
                  {contact.number}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Section 5: Download Guide ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '2px dashed rgba(16,185,129,0.3)',
            borderRadius: 16,
            padding: '32px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={22} color="#10b981" />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#ffffff',
                  margin: 0,
                  marginBottom: 4,
                }}
              >
                {t('preparedness.downloadGuide.title')}
              </h3>
              <p
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.45)',
                  margin: 0,
                }}
              >
                {t('preparedness.downloadGuide.subtitle')}
              </p>
            </div>
          </div>

          {/* Download button with tooltip */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onMouseEnter={() => setShowPdfTooltip(true)}
              onMouseLeave={() => setShowPdfTooltip(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 24px',
                borderRadius: 10,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#10b981',
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={16} />
              {t('preparedness.downloadGuide.downloadPdf')}
            </motion.button>

            <AnimatePresence>
              {showPdfTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 10px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(17,17,24,0.95)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 8,
                    padding: '6px 14px',
                    whiteSpace: 'nowrap',
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: 12,
                    color: '#f59e0b',
                    pointerEvents: 'none',
                  }}
                >
                  {t('preparedness.downloadGuide.comingSoon')}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
