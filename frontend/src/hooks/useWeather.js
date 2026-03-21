// useWeather — polls /api/weather every 5 minutes. Falls back to mockWeather when backend is offline.
import { useState, useEffect, useRef } from 'react';
import { fetchWeather } from '../services/api';
import { mockWeather } from '../data/mockData';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useWeather() {
  const [weather, setWeather] = useState(mockWeather);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);
  const unmounted = useRef(false);

  async function load() {
    try {
      const data = await fetchWeather();
      if (!unmounted.current) {
        setWeather(data);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      if (!unmounted.current) {
        setError(err.message);
      }
    } finally {
      if (!unmounted.current) setLoading(false);
    }
  }

  useEffect(() => {
    unmounted.current = false;
    load();
    timerRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      unmounted.current = true;
      clearInterval(timerRef.current);
    };
  }, []);

  const refresh = () => {
    setLoading(true);
    load();
  };

  return { weather, loading, error, lastUpdated, refresh };
}
