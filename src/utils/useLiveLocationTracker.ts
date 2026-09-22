import { useState, useEffect, useRef, useCallback } from 'react';
import { PassoFundoNeighborhood, SupermarketStore, UserProfile } from '../types';
import {
  findNearestPassoFundoNeighborhood,
  getStoresSortedByDistance,
  calculateDistanceKm,
  detectLocationContext,
  PASSO_FUNDO_NEIGHBORHOODS,
  PASSO_FUNDO_STORES,
} from './passoFundoLocations';

export interface LiveLocationState {
  isTracking: boolean;
  isSimulation: boolean;
  coords: { lat: number; lng: number };
  accuracy: number | null; // meters
  speed: number | null; // km/h
  heading: number | null; // degrees
  neighborhood: PassoFundoNeighborhood | string;
  cityName?: string;
  statusMessage: string;
  lastUpdated: string | null;
  nearestStore: (SupermarketStore & { distanceKm: number; etaMinutes: number }) | null;
  sortedStores: (SupermarketStore & { distanceKm: number; etaMinutes: number })[];
  error: string | null;
}

// Waypoints in Passo Fundo along Av. Brasil (Boqueirão -> Centro -> Petrópolis) for testing/simulation
const PASSO_FUNDO_SIMULATION_ROUTE = [
  { lat: -28.2685, lng: -52.4310, name: 'Av. Brasil Oeste - Boqueirão (Próximo Stok Center)' },
  { lat: -28.2670, lng: -52.4250, name: 'Av. Brasil Oeste - Boqueirão Central' },
  { lat: -28.2650, lng: -52.4180, name: 'Av. Brasil Oeste - Cruzamento Cel. Chicuta (Vergueiro)' },
  { lat: -28.2620, lng: -52.4100, name: 'Praça Marechal Floriano - Centro' },
  { lat: -28.2580, lng: -52.4010, name: 'Av. Brasil Leste - Saída para Petrópolis' },
  { lat: -28.2520, lng: -52.3830, name: 'Av. Brasil Leste - Em frente ao Stok Center Petrópolis' },
  { lat: -28.2435, lng: -52.3780, name: 'Trevo BR-285 - Ao lado do Atacadão' },
  { lat: -28.2725, lng: -52.3995, name: 'Av. Pres. Vargas - Passo Fundo Shopping (Bourbon)' },
  { lat: -28.2740, lng: -52.3965, name: 'Av. Pres. Vargas - Supermercado Coqueiros (São Cristóvão)' },
];

export function useLiveLocationTracker(
  userProfile: UserProfile,
  onProfileChange?: (updated: UserProfile) => void
) {
  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<any>(null);
  const simStepRef = useRef(0);

  const initialLat = userProfile.coordinates?.lat || -28.2685;
  const initialLng = userProfile.coordinates?.lng || -52.4310;
  const initialSorted = getStoresSortedByDistance(initialLat, initialLng);

  const [state, setState] = useState<LiveLocationState>({
    isTracking: Boolean(userProfile.isLiveTracking),
    isSimulation: false,
    coords: { lat: initialLat, lng: initialLng },
    accuracy: userProfile.liveAccuracyMeters || null,
    speed: userProfile.liveSpeedKmh || null,
    heading: userProfile.liveHeading || null,
    neighborhood: userProfile.neighborhood || 'Boqueirão',
    statusMessage: userProfile.isLiveTracking
      ? 'Rastreamento em tempo real ativo via GPS.'
      : 'Rastreamento parado.',
    lastUpdated: userProfile.locationUpdatedAt || null,
    nearestStore: initialSorted[0] || null,
    sortedStores: initialSorted,
    error: null,
  });

  // Helper to compute metrics given coords
  const processNewCoords = useCallback(
    (
      lat: number,
      lng: number,
      accuracy?: number | null,
      speed?: number | null,
      heading?: number | null,
      customStatus?: string
    ) => {
      // Detect location context anywhere in Brazil or the world
      const context = detectLocationContext(lat, lng);
      let detectedNeighborhood: string = userProfile.neighborhood || 'Boqueirão';
      let effectiveLat = lat;
      let effectiveLng = lng;

      if (context.isPassoFundo && context.detectedNeighborhood) {
        detectedNeighborhood = context.detectedNeighborhood;
      } else if (!state.isSimulation) {
        // Outside Passo Fundo: maintain real coordinates and location name
        detectedNeighborhood = `${context.cityName} (${context.stateName})`;
      }

      const sorted = getStoresSortedByDistance(effectiveLat, effectiveLng);
      const nearestStore = sorted[0] || null;
      const nowStr = new Date().toLocaleTimeString('pt-BR');

      const speedKmh = speed != null ? Math.round(speed * 3.6) : null;

      const locationSummary = context.isPassoFundo
        ? `Passo Fundo (${detectedNeighborhood})`
        : `${context.cityName}, ${context.stateName} (${Math.round(context.distanceToPassoFundoKm)}km de PF)`;

      setState((prev) => ({
        ...prev,
        coords: { lat: effectiveLat, lng: effectiveLng },
        accuracy: accuracy ?? prev.accuracy,
        speed: speedKmh,
        heading: heading ?? prev.heading,
        neighborhood: detectedNeighborhood,
        cityName: context.cityName,
        lastUpdated: nowStr,
        nearestStore,
        sortedStores: sorted,
        error: null,
        statusMessage:
          customStatus ||
          `GPS ativo em ${locationSummary}. Mais próximo agora: ${nearestStore ? `${nearestStore.name} (${nearestStore.distanceKm} km)` : 'Calculando...'}`,
      }));

      // Notify parent profile
      if (onProfileChange) {
        onProfileChange({
          ...userProfile,
          city: context.cityName,
          state: context.stateName,
          coordinates: { lat: effectiveLat, lng: effectiveLng },
          neighborhood: detectedNeighborhood,
          locationMode: 'gps',
          locationUpdatedAt: nowStr,
          isLiveTracking: true,
          liveAccuracyMeters: accuracy ?? undefined,
          liveSpeedKmh: speedKmh,
          liveHeading: heading ?? undefined,
          nearestMarketName: nearestStore?.chain,
          nearestMarketDistanceKm: nearestStore?.distanceKm,
        });
      }
    },
    [userProfile, onProfileChange, state.isSimulation]
  );

  // Start real GPS tracking using navigator.geolocation.watchPosition
  const startRealTimeTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocalização não é suportada por este dispositivo/navegador.',
        statusMessage: 'Geolocalização indisponível.',
      }));
      return;
    }

    // Clear simulation if running
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isTracking: true,
      isSimulation: false,
      statusMessage: 'Conectando ao receptor GPS em tempo real...',
      error: null,
    }));

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        processNewCoords(
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
          `GPS fixado em tempo real (precisão ±${Math.round(accuracy || 10)}m)`
        );
      },
      (err) => {
        console.warn('Geolocation watchPosition error:', err);
        // Fallback gracefully without breaking
        setState((prev) => ({
          ...prev,
          error:
            err.code === 1
              ? 'Permissão de GPS negada pelo navegador. Ative a permissão ou use o modo Simulação em Passo Fundo.'
              : 'Sinal de GPS fraco ou indisponível.',
          statusMessage: 'Aguardando permissão ou sinal de GPS.',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    watchIdRef.current = id;
  }, [processNewCoords]);

  // Stop real-time tracking
  const stopRealTimeTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isTracking: false,
      isSimulation: false,
      statusMessage: 'Rastreamento em tempo real pausado.',
    }));

    if (onProfileChange) {
      onProfileChange({
        ...userProfile,
        isLiveTracking: false,
      });
    }
  }, [userProfile, onProfileChange]);

  // Start simulation of moving along Passo Fundo supermarkets
  const startSimulation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
    }

    setState((prev) => ({
      ...prev,
      isTracking: true,
      isSimulation: true,
      statusMessage: 'Modo Simulação Passo Fundo: percorrendo Av. Brasil e mercados...',
      error: null,
    }));

    simStepRef.current = 0;
    const step = PASSO_FUNDO_SIMULATION_ROUTE[0];
    processNewCoords(
      step.lat,
      step.lng,
      8,
      8.3, // ~30 km/h
      90,
      `Simulação ativa: ${step.name}`
    );

    simIntervalRef.current = setInterval(() => {
      simStepRef.current = (simStepRef.current + 1) % PASSO_FUNDO_SIMULATION_ROUTE.length;
      const currentPt = PASSO_FUNDO_SIMULATION_ROUTE[simStepRef.current];
      processNewCoords(
        currentPt.lat,
        currentPt.lng,
        5 + Math.random() * 5,
        7 + Math.random() * 3, // ~25-36 km/h
        Math.floor(Math.random() * 360),
        `Simulação ativa: ${currentPt.name}`
      );
    }, 3500);
  }, [processNewCoords]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startRealTimeTracking,
    stopRealTimeTracking,
    startSimulation,
  };
}
