/**
 * useLocation — real GPS location via browser Geolocation API.
 * Falls back to Jaipur city center if permission denied or unavailable.
 */
import { useState, useEffect, useCallback } from 'react';

const JAIPUR_FALLBACK = { lat: 26.9124, lng: 75.7873, accuracy: null, isFallback: true };

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolve = useCallback((position) => {
    setLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: Math.round(position.coords.accuracy),
      isFallback: false,
    });
    setLoading(false);
    setError(null);
  }, []);

  const reject = useCallback((err) => {
    setError(err.message);
    setLocation(JAIPUR_FALLBACK);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      setLocation(JAIPUR_FALLBACK);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  }, [resolve, reject]);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) return;
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, [resolve, reject]);

  return { location, loading, error, refresh };
}
