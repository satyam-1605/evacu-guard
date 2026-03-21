/**
 * useAlerts — live alert feed via WebSocket with REST fallback.
 * Reconnects automatically on disconnect.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchAlerts } from '../services/api';
import { mockAlerts } from '../data/mockData';

const WS_URL = `ws://${window.location.host}/ws/alerts`;
const RECONNECT_DELAY_MS = 4000;
const MAX_ALERTS = 50;

export function useAlerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const unmounted = useRef(false);

  // Load initial alerts from REST
  useEffect(() => {
    unmounted.current = false;
    fetchAlerts().then((data) => {
      if (!unmounted.current && data?.length) {
        setAlerts(data);
      }
      setLoading(false);
    });
  }, []);

  const connect = useCallback(() => {
    if (unmounted.current) return;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!unmounted.current) setConnected(true);
      };

      ws.onmessage = (event) => {
        if (unmounted.current) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'alert' && msg.data) {
            setAlerts((prev) => {
              const updated = [msg.data, ...prev];
              return updated.slice(0, MAX_ALERTS);
            });
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (unmounted.current) return;
        setConnected(false);
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // WebSocket not available (backend offline) — stay on mock data
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    unmounted.current = false;
    connect();
    return () => {
      unmounted.current = true;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAll = useCallback(() => setAlerts([]), []);

  return { alerts, connected, loading, dismissAlert, clearAll };
}
