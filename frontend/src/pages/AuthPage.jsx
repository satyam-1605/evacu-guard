import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, ChevronDown, ChevronUp, Zap, Loader2, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageToggle from '../components/shared/LanguageToggle';

const INPUT_STYLE = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: 'var(--text-primary)',
  fontFamily: "'Exo 2', sans-serif",
  fontSize: 14,
  outline: 'none',
  width: '100%',
  padding: '11px 12px 11px 40px',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

function GlassInput({ icon: Icon, rightIcon, placeholder, type = 'text', value, onChange, error, onFocus, onBlur }) {
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{ ...INPUT_STYLE, borderColor: error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)', paddingRight: rightIcon ? 40 : 12 }}
      />
      {rightIcon && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{rightIcon}</div>}
      {error && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontFamily: "'Exo 2', sans-serif" }}>{error}</p>}
    </div>
  );
}

function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, []);
  const color = type === 'success' ? '#10b981' : '#ef4444';
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, padding: '12px 20px', borderRadius: 12, background: 'rgba(17,17,24,0.97)', border: `1px solid ${color}40`, color, fontFamily: "'Exo 2', sans-serif", fontSize: 14, fontWeight: 600, boxShadow: `0 4px 20px rgba(0,0,0,0.5)` }}
    >
      {message}
    </motion.div>
  );
}

function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      onSuccess(user);
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.invalidEmail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <GlassInput icon={Mail} placeholder={t('auth.emailAddress')} type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <GlassInput
        icon={Lock} placeholder={t('auth.password')} type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
        rightIcon={<button type="button" onClick={() => setShowPass(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
      />
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', fontFamily: "'Exo 2', sans-serif" }}>
          {error}
        </motion.p>
      )}
      <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02 } : {}} whileTap={{ scale: 0.98 }}
        style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontFamily: "'Exo 2', sans-serif", fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
        {loading ? <><Loader2 size={16} className="animate-spin" /> {t('auth.signingIn')}</> : t('auth.signIn')}
      </motion.button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{t('common.or')}</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
      </div>
      <motion.button type="button" onClick={() => onSuccess(null)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif", fontSize: 13, cursor: 'pointer' }}>
        {t('auth.continueAsGuest')}
      </motion.button>
    </form>
  );
}

function PasswordStrength({ password }) {
  const { t } = useTranslation();
  const score = password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3
    : password.length >= 8 ? 2
    : password.length >= 6 ? 1 : 0;
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#10b981'];
  const labels = [t('auth.strength.tooShort'), t('auth.strength.weak'), t('auth.strength.good'), t('auth.strength.strong')];
  if (!password) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < score ? colors[score] : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: score > 0 ? colors[score] : 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{password ? labels[score] : ''}</p>
    </div>
  );
}

function SignupForm({ onSuccess }) {
  const { signup } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '', address: '', emergency_contact_name: '', emergency_contact_phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = t('auth.nameRequired');
    if (!form.email.includes('@')) errs.email = t('auth.validEmailRequired');
    if (form.password.length < 6) errs.password = t('auth.minPassword');
    if (form.password !== form.confirm) errs.confirm = t('auth.passwordsNoMatch');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setLoading(true);
    try {
      const user = await signup({
        full_name: form.full_name, email: form.email, password: form.password,
        phone: form.phone || undefined, address: form.address || undefined,
        emergency_contact_name: form.emergency_contact_name || undefined,
        emergency_contact_phone: form.emergency_contact_phone || undefined,
      });
      onSuccess(user);
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = form.confirm && form.password === form.confirm;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <GlassInput icon={User} placeholder={t('auth.fullName')} value={form.full_name} onChange={set('full_name')} error={errors.full_name} />
      <GlassInput icon={Mail} placeholder={t('auth.emailAddress')} type="email" value={form.email} onChange={set('email')} error={errors.email} />
      <GlassInput icon={Phone} placeholder={t('auth.phone')} value={form.phone} onChange={set('phone')} />
      <div>
        <GlassInput
          icon={Lock} placeholder={t('auth.password')} type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} error={errors.password}
          rightIcon={<button type="button" onClick={() => setShowPass(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
        />
        <PasswordStrength password={form.password} />
      </div>
      <div style={{ position: 'relative' }}>
        <GlassInput
          icon={Lock} placeholder={t('auth.confirmPassword')} type="password" value={form.confirm} onChange={set('confirm')} error={errors.confirm}
          rightIcon={form.confirm ? (passwordsMatch ? <Check size={14} color="#10b981" /> : <X size={14} color="#ef4444" />) : null}
        />
      </div>
      <GlassInput icon={MapPin} placeholder={t('auth.address')} value={form.address} onChange={set('address')} />

      {/* Emergency contact collapsible */}
      <button type="button" onClick={() => setShowEmergency(v => !v)}
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 14px', color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif", fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {t('auth.addEmergencyContact')}
        {showEmergency ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      <AnimatePresence>
        {showEmergency && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <GlassInput icon={User} placeholder={t('auth.emergencyContactName')} value={form.emergency_contact_name} onChange={set('emergency_contact_name')} />
            <GlassInput icon={Phone} placeholder={t('auth.emergencyContactPhone')} value={form.emergency_contact_phone} onChange={set('emergency_contact_phone')} />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', fontFamily: "'Exo 2', sans-serif" }}>
          {error}
        </motion.p>
      )}
      <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02 } : {}} whileTap={{ scale: 0.98 }}
        style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontFamily: "'Exo 2', sans-serif", fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
        {loading ? <><Loader2 size={16} className="animate-spin" /> {t('auth.creatingAccount')}</> : t('auth.createAccount')}
      </motion.button>
    </form>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [tab, setTab] = useState(searchParams.get('tab') === 'signup' ? 'signup' : 'login');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated]);

  const handleSuccess = (user) => {
    if (!user) { navigate('/dashboard'); return; }
    setToast({ message: `Welcome, ${user.full_name.split(' ')[0]}!`, type: 'success' });
    const redirect = searchParams.get('redirect');
    setTimeout(() => navigate(redirect || '/dashboard', { replace: true }), 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 520, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="#10b981" />
            </div>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg, #f0f0f5 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EvacuGuard
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif", fontSize: 14 }}>
            {t('auth.tagline')}
          </p>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
            <LanguageToggle />
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(17,17,24,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '28px 32px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          {/* Tab toggle */}
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 12, marginBottom: 24 }}>
            {[{ key: 'login', label: t('auth.signIn') }, { key: 'signup', label: t('auth.createAccount') }].map(tabItem => (
              <button key={tabItem.key} onClick={() => setTab(tabItem.key)}
                style={{ flex: 1, padding: '8px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: "'Exo 2', sans-serif", fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                  background: tab === tabItem.key ? 'rgba(16,185,129,0.2)' : 'transparent',
                  color: tab === tabItem.key ? '#10b981' : 'var(--text-secondary)',
                  boxShadow: tab === tabItem.key ? '0 0 12px rgba(16,185,129,0.15)' : 'none',
                }}>
                {tabItem.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <LoginForm onSuccess={handleSuccess} />
              </motion.div>
            ) : (
              <motion.div key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <SignupForm onSuccess={handleSuccess} />
                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
                  {t('auth.alreadyHaveAccount')}{' '}
                  <button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 600 }}>{t('auth.signIn')}</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('auth.backToHome')}</Link>
        </p>
      </motion.div>
    </div>
  );
}
