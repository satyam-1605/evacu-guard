import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminPanel from './pages/AdminPanel';
import AdminLoginPage from './pages/AdminLoginPage';
import SheltersPage from './pages/SheltersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertCenterPage from './pages/AlertCenterPage';
import ReportHazardPage from './pages/ReportHazardPage';
import PreparednessPage from './pages/PreparednessPage';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<CitizenDashboard />} />
          <Route path="/shelters" element={<SheltersPage />} />
          <Route path="/alerts" element={<AlertCenterPage />} />
          <Route path="/report" element={<ProtectedRoute><ReportHazardPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/preparedness" element={<PreparednessPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
