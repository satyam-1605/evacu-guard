import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

function AccessDenied() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="p-8 rounded-3xl text-center max-w-sm" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <p className="text-4xl mb-3">🚫</p>
        <h2 className="text-xl font-black mb-2" style={{ color: '#ef4444', fontFamily: "'Orbitron', sans-serif" }}>{t('adminRoute.accessDenied')}</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)', fontFamily: "'Exo 2', sans-serif" }}>{t('adminRoute.noAdminPrivileges')}</p>
        <a href="/dashboard" className="px-5 py-2 rounded-xl text-sm font-bold"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981', fontFamily: "'Exo 2', sans-serif" }}>
          {t('adminRoute.goToDashboard')}
        </a>
      </div>
    </div>
  );
}

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <AccessDenied />;
  return children;
}
