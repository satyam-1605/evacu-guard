import { useTranslation } from 'react-i18next';

export default function LanguageToggle({ className = '' }) {
  const { i18n } = useTranslation();
  const isHindi = i18n.language?.startsWith('hi');

  const toggle = () => {
    i18n.changeLanguage(isHindi ? 'en' : 'hi');
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${className}`}
      style={{
        background: isHindi ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)',
        border: isHindi ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.12)',
        color: isHindi ? '#10b981' : 'rgba(255,255,255,0.6)',
        fontFamily: isHindi ? "'Noto Sans Devanagari', sans-serif" : "'JetBrains Mono', monospace",
        cursor: 'pointer',
      }}
      title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
    >
      {isHindi ? 'EN' : 'हि'}
    </button>
  );
}
