import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Zap, Menu, X, AlertTriangle, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../auth/UserMenu';
import LanguageToggle from '../shared/LanguageToggle';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const PUBLIC_LINKS = [
    { label: t('nav.dashboard'),    to: '/dashboard' },
    { label: t('nav.shelters'),     to: '/shelters' },
    { label: t('nav.alerts'),       to: '/alerts' },
    { label: t('nav.report'),       to: '/report' },
    { label: t('nav.analytics'),    to: '/analytics' },
    { label: t('nav.preparedness'), to: '/preparedness' },
    { label: t('nav.about'),        to: '/about' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-[9000] flex items-center justify-between px-6 lg:px-10"
        style={{
          height: 64,
          background: scrolled ? 'rgba(10,10,15,0.95)' : 'rgba(10,10,15,0.7)',
          backdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <Zap size={16} color="#10b981" />
          </div>
          <span
            className="text-lg font-black tracking-tight"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: 'linear-gradient(135deg, #f0f0f5 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            EvacuGuard
          </span>
        </button>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-0.5">
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:bg-white/5"
              style={{
                color: isActive(link.to) ? '#10b981' : 'var(--text-secondary)',
                fontFamily: "'Exo 2', sans-serif",
                borderBottom: isActive(link.to) ? '1px solid rgba(16,185,129,0.5)' : '1px solid transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right side — auth-aware */}
        <div className="hidden lg:flex items-center gap-2">
          <LanguageToggle />
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <motion.button
                  onClick={() => navigate('/admin')}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 16px rgba(239,68,68,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444',
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 11,
                    letterSpacing: '0.06em',
                  }}
                >
                  <Shield size={12} />
                  {t('nav.admin')}
                </motion.button>
              )}
              <UserMenu />
            </>
          ) : (
            <>
              <motion.button
                onClick={() => navigate('/auth')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: 13,
                }}
              >
                {t('nav.signIn')}
              </motion.button>
              <motion.button
                onClick={() => navigate('/auth?tab=signup')}
                whileHover={{ scale: 1.03, boxShadow: '0 0 16px rgba(16,185,129,0.25)' }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.4)',
                  color: '#10b981',
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: 13,
                }}
              >
                {t('nav.signUp')}
              </motion.button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-4 right-4 z-[8999] rounded-2xl p-4 flex flex-col gap-1.5"
            style={{
              background: 'rgba(17,17,24,0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors block"
                style={{
                  color: isActive(link.to) ? '#10b981' : 'var(--text-secondary)',
                  background: isActive(link.to) ? 'rgba(16,185,129,0.08)' : 'transparent',
                  fontFamily: "'Exo 2', sans-serif",
                }}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px my-1" style={{ background: 'rgba(255,255,255,0.06)' }} />

            <div className="flex justify-center">
              <LanguageToggle />
            </div>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}
                  >
                    <Shield size={13} />
                    {t('nav.adminPanel')}
                  </button>
                )}
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}
                >
                  {t('nav.myProfile')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}
                >
                  {t('nav.signIn')}
                </button>
                <button
                  onClick={() => navigate('/auth?tab=signup')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}
                >
                  {t('nav.signUp')}
                </button>
                <button
                  onClick={() => navigate('/alerts')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontFamily: "'Orbitron', sans-serif", fontSize: 12, letterSpacing: '0.08em' }}
                >
                  <AlertTriangle size={13} />
                  {t('nav.sosAlerts')}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
