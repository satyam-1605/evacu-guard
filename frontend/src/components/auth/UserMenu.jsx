import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, FileText, Shield, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #a855f7, #6366f1)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #06b6d4, #10b981)',
];

export default function UserMenu() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { t } = useTranslation();

  const gradient = AVATAR_GRADIENTS[(user?.full_name?.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Avatar trigger */}
      <button onClick={() => setOpen(v => !v)}
        style={{ width: 38, height: 38, borderRadius: 10, background: gradient, border: '2px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Exo 2', sans-serif", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
        {getInitials(user?.full_name)}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 240, background: 'rgba(17,17,24,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, backdropFilter: 'blur(20px)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', overflow: 'hidden', zIndex: 99999 }}
          >
            {/* User info */}
            <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{user?.full_name}</p>
              <p style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", fontSize: 12, marginBottom: 8 }}>{user?.email}</p>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, fontFamily: "'JetBrains Mono', monospace",
                background: isAdmin ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                color: isAdmin ? '#ef4444' : '#10b981',
                border: `1px solid ${isAdmin ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
              }}>
                {isAdmin ? t('userMenu.admin') : t('userMenu.citizen')}
              </span>
            </div>

            {/* Menu items */}
            <div style={{ padding: '6px 0' }}>
              {[
                { icon: User, label: t('userMenu.myProfile'), action: () => { navigate('/profile'); setOpen(false); } },
                { icon: FileText, label: t('userMenu.myReports'), action: () => { navigate('/profile?tab=reports'); setOpen(false); } },
                ...(isAdmin ? [{ icon: Shield, label: t('userMenu.adminPanel'), action: () => { navigate('/admin'); setOpen(false); }, red: true }] : []),
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <button key={i} onClick={item.action}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', color: item.red ? '#ef4444' : 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif", fontSize: 13, textAlign: 'left', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '6px 0' }}>
              <button onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <LogOut size={14} />
                {t('userMenu.signOut')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
