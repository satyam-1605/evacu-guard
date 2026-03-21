import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Phone, MapPin, Edit2, Save, X, FileText, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import PublicLayout from '../components/layout/PublicLayout';

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
}

const GRADIENTS = [
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #a855f7, #6366f1)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
];

export default function ProfilePage() {
  const { user, updateProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [editing, setEditing] = useState(false);
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', emergency_contact_name: '', emergency_contact_phone: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  const gradient = GRADIENTS[(user?.full_name?.charCodeAt(0) || 0) % GRADIENTS.length];

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || '', phone: user.phone || '', address: user.address || '', emergency_contact_name: user.emergency_contact_name || '', emergency_contact_phone: user.emergency_contact_phone || '' });
    }
  }, [user]);

  useEffect(() => {
    api.get('/api/auth/me').then(res => {
      // Fetch reports if needed
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setEditing(false);
    } catch {}
    finally { setSaving(false); }
  };

  const glassCard = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '24px' };

  if (!user) return null;

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-8 pt-24 flex flex-col gap-6">

        {/* User Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={glassCard}>
          <div className="flex items-center gap-5">
            <div style={{ width: 72, height: 72, borderRadius: 18, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Exo 2', sans-serif", fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
              {getInitials(user.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{user.full_name}</h1>
              <p style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif", fontSize: 13, marginBottom: 8 }}>{user.email}</p>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, fontFamily: "'JetBrains Mono', monospace",
                background: isAdmin ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                color: isAdmin ? '#ef4444' : '#10b981',
                border: `1px solid ${isAdmin ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
              }}>
                {isAdmin ? t('profile.admin') : t('profile.citizen')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
          {['profile', 'reports'].map(tabKey => (
            <button key={tabKey} onClick={() => setActiveTab(tabKey)}
              style={{ flex: 1, padding: '8px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: "'Exo 2', sans-serif", fontSize: 13, fontWeight: 600,
                background: activeTab === tabKey ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: activeTab === tabKey ? '#10b981' : 'var(--text-secondary)' }}>
              {tabKey === 'profile' ? t('profile.personalInfo') : t('profile.myReports')}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={glassCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700 }}>{t('profile.personalInformation')}</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 12px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Exo 2', sans-serif", fontSize: 12 }}>
                  <Edit2 size={12} /> {t('profile.edit')}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleSave} disabled={saving} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '5px 12px', color: '#10b981', cursor: 'pointer', fontFamily: "'Exo 2', sans-serif", fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Save size={12} /> {saving ? t('profile.saving') : t('profile.save')}
                  </button>
                  <button onClick={() => setEditing(false)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 12px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: "'Exo 2', sans-serif", fontSize: 12 }}>
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: User, label: t('profile.labels.fullName'), field: 'full_name' },
                { icon: Phone, label: t('profile.labels.phone'), field: 'phone' },
                { icon: MapPin, label: t('profile.labels.address'), field: 'address' },
                { icon: User, label: t('profile.labels.emergencyContact'), field: 'emergency_contact_name' },
                { icon: Phone, label: t('profile.labels.emergencyPhone'), field: 'emergency_contact_phone' },
              ].map(({ icon: Icon, label, field }) => (
                <div key={field}>
                  <p style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
                  {editing ? (
                    <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  ) : (
                    <p style={{ color: form[field] ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", fontSize: 14 }}>
                      {form[field] || '—'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={glassCard}>
            <h2 style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{t('profile.yourHazardReports')}</h2>
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
              <FileText size={32} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14 }}>{t('profile.noReportsYet')}</p>
              <button onClick={() => navigate('/report')}
                style={{ marginTop: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '8px 16px', color: '#10b981', cursor: 'pointer', fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}>
                {t('profile.reportAHazard')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Sign out */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <button onClick={() => { logout(); navigate('/'); }}
            style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontFamily: "'Exo 2', sans-serif", fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LogOut size={14} /> {t('profile.signOut')}
          </button>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
