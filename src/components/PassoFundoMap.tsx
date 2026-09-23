import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  UserProfile, 
  SupermarketStore, 
  PassoFundoNeighborhood,
  SupermarketName 
} from '../types';
import { 
  PASSO_FUNDO_NEIGHBORHOODS, 
  PASSO_FUNDO_STORES, 
  calculateDistanceKm 
} from '../utils/passoFundoLocations';
import { 
  MapPin, 
  Navigation, 
  Store, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Fuel, 
  Compass, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

interface PassoFundoMapProps {
  userProfile: UserProfile;
  onUpdateNeighborhood: (neighborhood: PassoFundoNeighborhood) => void;
  onSelectSupermarketFilter?: (market: SupermarketName | 'all' | 'nearby') => void;
  selectedMarketFilter?: SupermarketName | 'all' | 'nearby';
}

export const PassoFundoMap: React.FC<PassoFundoMapProps> = ({
  userProfile,
  onUpdateNeighborhood,
  onSelectSupermarketFilter,
  selectedMarketFilter = 'all',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('stok-boqueirao');
  const [onlyNearbyFiltered, setOnlyNearbyFiltered] = useState<boolean>(
    selectedMarketFilter === 'nearby'
  );

  // User coordinates fallback
  const userLat = userProfile.coordinates?.lat ?? -28.2685;
  const userLng = userProfile.coordinates?.lng ?? -52.4310;

  // Calculate distances for all stores
  const storesWithDistance = PASSO_FUNDO_STORES.map((store) => {
    const dist = calculateDistanceKm(userLat, userLng, store.lat, store.lng);
    const etaMinutes = Math.max(2, Math.round((dist / 25) * 60));
    return {
      ...store,
      distanceKm: dist,
      etaMinutes,
      isNearby: dist <= (userProfile.radiusKm || 3.5),
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance if not existing
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      markersGroupRef.current = markersGroup;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Clear old markers
    markersGroup.clearLayers();

    // 1. Add User Location Marker with pulse
    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-red-500/40 animate-ping"></div>
        <div class="relative w-7 h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] shadow-lg border-2 border-white">
          VOCÊ
        </div>
      </div>
    `;

    const userMarkerIcon = L.divIcon({
      html: userIconHtml,
      className: 'user-map-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const userMarker = L.marker([userLat, userLng], { icon: userMarkerIcon }).addTo(markersGroup);
    userMarker.bindPopup(`
      <div style="font-family: system-ui; font-size: 12px; padding: 4px;">
        <strong style="color: #b91c1c;">Sua Localização Atual</strong><br/>
        Bairro: <b>${userProfile.neighborhood}</b>, Passo Fundo<br/>
        <span style="color: #64748b;">Mercados mais próximos destacados abaixo.</span>
      </div>
    `);

    // 2. Add Supermarket Markers
    storesWithDistance.forEach((store) => {
      const isSelected = selectedStoreId === store.id;
      const isClosest = store.distanceKm === storesWithDistance[0].distanceKm;

      let badgeBg = '#0f172a'; // slate-900
      let badgeLabel = store.chain;

      if (store.chain === 'Stock Center') {
        badgeBg = '#ea1d2c'; // ifood red
      } else if (store.chain === 'Supermercado Boqueirão') {
        badgeBg = '#0284c7'; // sky-600
      } else if (store.chain === 'Atacadão') {
        badgeBg = '#ea580c'; // orange-600
      } else if (store.chain === 'Bourbon' || store.chain === 'Zaffari') {
        badgeBg = '#7c3aed'; // violet-600
      } else if (store.chain === 'Coqueiros') {
        badgeBg = '#16a34a'; // green-600
      }

      const storeIconHtml = `
        <div style="
          background: ${badgeBg}; 
          color: white; 
          padding: 4px 8px; 
          border-radius: 9999px; 
          font-weight: 700; 
          font-size: 11px; 
          border: 2px solid ${isSelected ? '#facc15' : 'white'}; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          white-space: nowrap;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span>${store.name.split(' - ')[0]}</span>
          <span style="background: rgba(255,255,255,0.25); padding: 1px 4px; border-radius: 6px; font-size: 10px;">
            ${store.distanceKm < 1 ? `${Math.round(store.distanceKm * 1000)}m` : `${store.distanceKm.toFixed(1)}km`}
          </span>
        </div>
      `;

      const storeIcon = L.divIcon({
        html: storeIconHtml,
        className: 'store-map-pin',
        iconSize: [120, 28],
        iconAnchor: [60, 14],
      });

      const marker = L.marker([store.lat, store.lng], { icon: storeIcon }).addTo(markersGroup);
      marker.on('click', () => {
        setSelectedStoreId(store.id);
      });

      marker.bindPopup(`
        <div style="font-family: system-ui; font-size: 12px; max-width: 220px;">
          <b style="font-size: 13px; color: #0f172a;">${store.name}</b><br/>
          <span style="color: #059669; font-weight: 600;">Distância: ${store.distanceKm.toFixed(1)} km (~${store.etaMinutes} min de carro)</span><br/>
          <span style="color: #64748b; font-size: 11px;">${store.address}</span><br/>
          <div style="margin-top: 6px; padding: 4px 6px; background: #ecfdf5; border-radius: 6px; color: #065f46; font-size: 11px;">
            ${store.highlightPromo}
          </div>
        </div>
      `);
    });

    // Re-center gently
    map.panTo([userLat, userLng], { animate: true });

    return () => {
      // Clean up on component unmount
    };
  }, [userLat, userLng, userProfile.neighborhood, selectedStoreId]);

  // Handler for fast neighborhood switch
  const handleNeighborhoodChange = (bairro: PassoFundoNeighborhood) => {
    onUpdateNeighborhood(bairro);
    const found = PASSO_FUNDO_NEIGHBORHOODS.find((n) => n.neighborhood === bairro);
    if (found && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([found.lat, found.lng], 14, { duration: 1 });
    }
  };

  const selectedStore = storesWithDistance.find((s) => s.id === selectedStoreId) || storesWithDistance[0];

  const handleToggleNearbyFilter = () => {
    const nextState = !onlyNearbyFiltered;
    setOnlyNearbyFiltered(nextState);
    if (onSelectSupermarketFilter) {
      onSelectSupermarketFilter(nextState ? 'nearby' : 'all');
    }
  };

  return (
    <div id="secao-mapa-passo-fundo" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Top Banner with GPS Neighborhood Selector */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                <Compass className="w-3.5 h-3.5" /> Geolocalização Passo Fundo
              </span>
              <span className="text-xs text-slate-400">
                Bairro Detectado: <strong className="text-white font-bold">{userProfile.neighborhood}</strong>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-red-500" />
              Mercados Próximos da Sua Localização
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Calculamos a distância real até os supermercados de Passo Fundo para que você economize em compras perto de casa e não gaste à toa com combustível.
            </p>
          </div>

          {/* Quick Neighborhood Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <span className="text-[11px] font-semibold text-slate-400 px-2 py-1">Trocar Bairro:</span>
            {(['Boqueirão', 'Centro', 'Petrópolis', 'São Cristóvão', 'Vera Cruz'] as PassoFundoNeighborhood[]).map((b) => {
              const isCurrent = userProfile.neighborhood === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleNeighborhoodChange(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  {b === 'Boqueirão' ? '★ Boqueirão' : b}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Store Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Left / Top: Interactive Map Stage (7 cols) */}
        <div className="lg:col-span-7 relative flex flex-col bg-slate-100">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[360px] sm:h-[420px] z-10"
            style={{ minHeight: '360px' }}
          />

          {/* Map Overlay Badge */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl shadow-md border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
              <span className="font-bold text-slate-900">Passo Fundo - RS</span>
              <span className="text-slate-400">|</span>
              <span className="text-red-700 font-semibold">{userProfile.neighborhood}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Clique em qualquer mercado no mapa para ver ofertas
            </p>
          </div>

          {/* Map Footer Bar with Proximity Filter */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Info className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>{storesWithDistance.filter((s) => s.distanceKm <= 3.5).length} supermercados</strong> a menos de 3.5 km de você.
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleNearbyFilter}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition text-xs border ${
                onlyNearbyFiltered
                  ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {onlyNearbyFiltered ? 'Exibindo Mercados Próximos' : 'Filtrar Só Mercados Próximos'}
            </button>
          </div>
        </div>

        {/* Right / Bottom: Nearby Stores List & Active Store Card (5 cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-4 h-4 text-red-600" />
                Mercados Ordenados por Proximidade:
              </h4>
              <span className="text-[11px] font-semibold text-slate-500">
                Ponto: {userProfile.neighborhood}
              </span>
            </div>

            {/* Scrollable list of closest stores */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
              {storesWithDistance.map((store, index) => {
                const isSelected = selectedStore.id === store.id;
                const isNearest = index === 0;

                return (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => {
                      setSelectedStoreId(store.id);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([store.lat, store.lng], 15, { duration: 0.8 });
                      }
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition border flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-white border-red-500 shadow-sm ring-2 ring-red-500/20'
                        : 'bg-white/80 hover:bg-white border-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {isNearest && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            MAIS PERTO
                          </span>
                        )}
                        <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {store.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{store.address}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-900">
                        {store.distanceKm < 1 ? `${Math.round(store.distanceKm * 1000)} m` : `${store.distanceKm.toFixed(1)} km`}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        ~{store.etaMinutes} min
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Store Card details */}
          <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                  {selectedStore.chain} • {selectedStore.neighborhood}
                </span>
                <h5 className="font-bold text-slate-900 text-sm mt-1">{selectedStore.name}</h5>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                  {selectedStore.distanceKm.toFixed(1)} km
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-2.5">{selectedStore.address}</p>
            
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 text-xs text-slate-700">
              <strong className="text-slate-900 block mb-0.5">Destaque de Preço:</strong>
              {selectedStore.highlightPromo}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStore.lat},${selectedStore.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Traçar Rota no GPS
              </a>

              {selectedStore.phone && (
                <span className="text-xs text-slate-500 px-2 py-1 font-medium">
                  {selectedStore.phone}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
