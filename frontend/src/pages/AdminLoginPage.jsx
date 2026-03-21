import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageToggle from '../components/shared/LanguageToggle';


// ─── Background blobs ─────────────────────────────────────────────────────────
const BLOBS = [
  {
    key: 'a',
    style: {
      top: '-10%',
      left: '-5%',
      width: 480,
      height: 480,
      background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
    },
  },
  {
    key: 'b',
    style: {
      bottom: '-8%',
      right: '-8%',
      width: 520,
      height: 520,
      background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
    },
  },
  {
    key: 'c',
    style: {
      top: '40%',
      left: '60%',
      width: 320,
      height: 320,
      background: 'radial-gradient(circle, rgba(220,38,38,0.04) 0%, transparent 70%)',
    },
  },
];

// ─── Input field ──────────────────────────────────────────────────────────────
function InputField({ icon: Icon, rightIcon, type, placeholder, value, onChange }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Left icon */}
      <div
        style={{
          position: 'absolute',
          left: 14,
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <Icon size={16} color="rgba(239,68,68,0.6)" />
      </div>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '13px 44px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          color: 'rgba(255,255,255,0.9)',
          fontFamily: "'Exo 2', sans-serif",
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.25s, box-shadow 0.25s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'rgba(239,68,68,0.4)';
          e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.08)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(255,255,255,0.08)';
          e.target.style.boxShadow = 'none';
        }}
      />

      {/* Right icon slot */}
      {rightIcon && (
        <div
          style={{
            position: 'absolute',
            right: 14,
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          {rightIcon}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(false);
    try {
      const user = await login(username, password);
      if (user?.role !== 'admin') {
        setError(true);
        setShakeKey(k => k + 1);
        return;
      }
      setTimeout(() => navigate('/admin'), 400);
    } catch {
      setError(true);
      setShakeKey(k => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Background blobs ─────────────────────────────────────────────── */}
      {BLOBS.map((blob) => (
        <div
          key={blob.key}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(80px)',
            pointerEvents: 'none',
            ...blob.style,
          }}
        />
      ))}

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: 448,
          width: '100%',
          margin: '0 16px',
          background: 'rgba(17,17,24,0.9)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 24,
          padding: 40,
          position: 'relative',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            borderRadius: '24px 24px 0 0',
            background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)',
          }}
        />

        {/* ── Logo row ───────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={18} color="#ef4444" />
          </div>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #ffffff 30%, #ef4444 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            EvacuGuard
          </span>
        </div>

        {/* Admin Access label */}
        <p
          style={{
            textAlign: 'center',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: '#ef4444',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: '0 0 6px',
          }}
        >
          {t('adminLogin.adminAccess')}
        </p>

        {/* Restricted notice */}
        <p
          style={{
            textAlign: 'center',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: 12.5,
            color: 'rgba(255,255,255,0.3)',
            margin: '0 0 6px',
          }}
        >
          {t('adminLogin.restricted')}
        </p>

        {/* Language toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <LanguageToggle />
        </div>

        {/* ── Form ───────────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
          noValidate
        >
          {/* Email */}
          <InputField
            icon={User}
            type="email"
            placeholder={t('adminLogin.email')}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(false);
            }}
          />

          {/* Password */}
          <InputField
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('adminLogin.password')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 2,
                  color: 'rgba(255,255,255,0.35)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(239,68,68,0.7)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                key={shakeKey}
                initial={{ opacity: 0, y: -6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  x: [0, -10, 10, -10, 10, 0],
                }}
                exit={{ opacity: 0, y: -6 }}
                transition={{
                  opacity: { duration: 0.2 },
                  y: { duration: 0.2 },
                  x: { duration: 0.4, ease: 'easeInOut' },
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 16px',
                  borderRadius: 10,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                }}
              >
                <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                <span
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: 13,
                    color: 'rgba(239,68,68,0.9)',
                  }}
                >
                  {t('adminLogin.invalidCredentials')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign In button */}
          <motion.button
            type="submit"
            whileHover={{
              boxShadow: '0 0 20px rgba(239,68,68,0.25)',
              borderColor: 'rgba(239,68,68,0.6)',
            }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 12,
              background: loading
                ? 'rgba(239,68,68,0.08)'
                : 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: loading ? 'rgba(239,68,68,0.4)' : '#ef4444',
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.25s, color 0.25s',
              marginTop: 4,
            }}
          >
            {loading ? t('adminLogin.authenticating') : t('adminLogin.signIn')}
          </motion.button>
        </form>

        {/* ── Back link ──────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <motion.button
            whileHover={{ color: 'rgba(255,255,255,0.6)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 13,
              color: 'rgba(255,255,255,0.3)',
              transition: 'color 0.2s',
              padding: '4px 8px',
            }}
          >
            {t('adminLogin.backToDashboard')}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
