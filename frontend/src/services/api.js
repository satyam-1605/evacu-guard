/**
 * EvacuGuard API Service
 * All calls fall back to mockData if backend is unreachable.
 */
import axios from 'axios';
import {
  mockShelters,
  mockHazards,
  mockAlerts,
  mockWeather,
  mockStats,
  mockRoute,
} from '../data/mockData';

// In production use VITE_API_URL env var; in dev use Vite proxy (empty string)
const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('evacu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('evacu_refresh');
      if (refresh) {
        try {
          const res = await axios.post('/api/auth/refresh', { refresh_token: refresh });
          const newToken = res.data.access_token;
          localStorage.setItem('evacu_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('evacu_token');
          localStorage.removeItem('evacu_refresh');
          window.location.href = '/auth';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Hazards ──────────────────────────────────────────────────────────────────

export async function fetchHazards() {
  try {
    const { data } = await api.get('/api/hazards');
    return data;
  } catch {
    return mockHazards;
  }
}

// ── Shelters ─────────────────────────────────────────────────────────────────

export async function fetchShelters(lat = null, lng = null) {
  try {
    const params = lat && lng ? { lat, lng } : {};
    const { data } = await api.get('/api/shelters', { params });
    return data;
  } catch {
    return mockShelters;
  }
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function computeRoute({ lat, lng, shelter_id = null }) {
  try {
    const { data } = await api.post('/api/route', { lat, lng, shelter_id });
    return data;
  } catch {
    return mockRoute;
  }
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export async function fetchAlerts() {
  try {
    const { data } = await api.get('/api/alerts');
    return data;
  } catch {
    return mockAlerts;
  }
}

// ── Weather ───────────────────────────────────────────────────────────────────

export async function fetchWeather() {
  try {
    const { data } = await api.get('/api/weather');
    return data;
  } catch {
    return mockWeather;
  }
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function fetchStats() {
  try {
    const { data } = await api.get('/api/stats');
    return data;
  } catch {
    return mockStats;
  }
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function submitReport(reportData) {
  try {
    const { data } = await api.post('/api/reports', reportData);
    return { success: true, ...data };
  } catch (err) {
    console.warn('Report submit fallback (offline mode):', err.message);
    return { success: true, status: 'queued', alert_triggered: false };
  }
}

// ── Admin: hazard ─────────────────────────────────────────────────────────────

export async function upsertHazard(hazardData) {
  try {
    const { data } = await api.post('/api/admin/hazard', hazardData);
    return data;
  } catch (err) {
    console.warn('Hazard upsert failed:', err.message);
    return { status: 'error', message: err.message };
  }
}

// ── Admin: scenario ───────────────────────────────────────────────────────────

export async function activateScenario(scenarioId) {
  try {
    const { data } = await api.post('/api/admin/scenario', { scenario: scenarioId });
    return data;
  } catch (err) {
    console.warn('Scenario activation fallback:', err.message);
    return { status: 'simulated', stages: [] };
  }
}

// ── Admin: broadcast ──────────────────────────────────────────────────────────

export async function broadcastAlert(message, severity) {
  try {
    const { data } = await api.post('/api/admin/broadcast', { message, severity });
    return data;
  } catch (err) {
    console.warn('Broadcast fallback:', err.message);
    return { status: 'error', message: err.message };
  }
}

// ── Health check ──────────────────────────────────────────────────────────────

export async function checkBackendHealth() {
  try {
    const { data } = await api.get('/health', { timeout: 3000 });
    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}

export default api;
