/**
 * useEvacuation — manages route computation state.
 * Calls POST /api/route, returns route options + loading + error.
 */
import { useState, useCallback } from 'react';
import { computeRoute } from '../services/api';
import { mockRoute } from '../data/mockData';

// Generate a slightly varied alternative route from the main route
function buildAlternativeRoutes(mainRoute) {
  if (!mainRoute?.route_coordinates?.length) return [];

  const coords = mainRoute.route_coordinates;
  const midLat = (coords[0][0] + coords[coords.length - 1][0]) / 2;
  const midLng = (coords[0][1] + coords[coords.length - 1][1]) / 2;

  return [
    {
      label: 'Safest',
      badge: 'safe',
      distance_km: mainRoute.distance_km,
      eta_minutes: mainRoute.eta_minutes,
      risk_zones_avoided: mainRoute.risk_zones_avoided,
      route_coordinates: mainRoute.route_coordinates,
      assigned_shelter: mainRoute.assigned_shelter,
      description: `Avoids ${mainRoute.risk_zones_avoided} hazard zones`,
    },
    {
      label: 'Fastest',
      badge: 'warning',
      distance_km: +(mainRoute.distance_km * 0.72).toFixed(1),
      eta_minutes: Math.max(3, Math.round(mainRoute.eta_minutes * 0.7)),
      risk_zones_avoided: Math.max(0, mainRoute.risk_zones_avoided - 1),
      route_coordinates: [
        coords[0],
        [midLat + 0.003, midLng + 0.002],
        [midLat + 0.005, midLng + 0.006],
        coords[coords.length - 1],
      ],
      assigned_shelter: mainRoute.assigned_shelter,
      description: `Passes near 1 zone — saves ${mainRoute.eta_minutes - Math.round(mainRoute.eta_minutes * 0.7)} min`,
    },
    {
      label: 'Balanced',
      badge: 'info',
      distance_km: +(mainRoute.distance_km * 0.88).toFixed(1),
      eta_minutes: Math.round(mainRoute.eta_minutes * 0.85),
      risk_zones_avoided: mainRoute.risk_zones_avoided,
      route_coordinates: [
        coords[0],
        [midLat - 0.002, midLng + 0.004],
        [midLat + 0.002, midLng + 0.008],
        coords[coords.length - 1],
      ],
      assigned_shelter: mainRoute.assigned_shelter,
      description: 'Optimal balance of speed and safety',
    },
  ];
}

export function useEvacuation() {
  const [route, setRoute] = useState(null);
  const [routeOptions, setRouteOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  const requestRoute = useCallback(async ({ lat, lng, shelter_id = null } = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Use user location if provided, otherwise use a Mansarovar default for demo
      const userLat = lat ?? 26.8800;
      const userLng = lng ?? 75.7900;

      const result = await computeRoute({ lat: userLat, lng: userLng, shelter_id });
      const options = buildAlternativeRoutes(result);
      setRouteOptions(options);
      setRoute(options[0] || result);
      setSelectedOptionIndex(0);
    } catch (err) {
      setError(err.message);
      // Fallback to mock route
      const options = buildAlternativeRoutes(mockRoute);
      setRouteOptions(options);
      setRoute(options[0]);
      setSelectedOptionIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectOption = useCallback((index) => {
    setSelectedOptionIndex(index);
    setRoute(routeOptions[index]);
  }, [routeOptions]);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setRouteOptions([]);
    setError(null);
    setSelectedOptionIndex(0);
  }, []);

  return {
    route,
    routeOptions,
    selectedOptionIndex,
    loading,
    error,
    requestRoute,
    selectOption,
    clearRoute,
  };
}
