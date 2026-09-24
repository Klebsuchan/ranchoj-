import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  UserProfile, 
  SupermarketStore, 
  PassoFundoNeighborhood,
  SupermarketName,
  StoreCategoryType
} from '../types';
import { 
  PASSO_FUNDO_NEIGHBORHOODS, 
  getAllPassoFundoStores,
  saveCustomStoreToStorage,
  removeCustomStoreFromStorage,
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
  Info,
  Plus,
  X,
  Building2,
  Home,
  Zap,
  Trash2
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

  // Store data state
  const [storesList, setStoresList] = useState<SupermarketStore[]>(() => getAllPassoFundoStores());
  const [selectedStoreId, setSelectedStoreId] = useState<string>('stok-boqueirao');
  const [onlyNearbyFiltered, setOnlyNearbyFiltered] = useState<boolean>(
    selectedMarketFilter === 'nearby'
  );
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'bairro' | 'rede_atacarejo' | 'independente'>('all');

  // Modal for registering a new market
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreNeighborhood, setNewStoreNeighborhood] = useState<string>(userProfile.neighborhood || 'Boqueirão');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreType, setNewStoreType] = useState<StoreCategoryType>('bairro');
  const [newStorePromo, setNewStorePromo] = useState('');
  const [formError, setFormError] = useState('');

  // User coordinates fallback
  const userLat = userProfile.coordinates?.lat ?? -28.2685;
  const userLng = userProfile.coordinates?.lng ?? -52.4310;

  // Calculate distances for all stores
  const storesWithDistance = storesList.map((store) => {
    const dist = calculateDistanceKm(userLat, userLng, store.lat, store.lng);
    const etaMinutes = Math.max(2, Math.round((dist / 25) * 60));
    return {
      ...store,
      distanceKm: dist,
      etaMinutes,
      isNearby: dist <= (userProfile.radiusKm || 3.5),
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  // Filtered stores by category and nearby
  const visibleStores = storesWithDistance.filter((store) => {
    if (onlyNearbyFiltered && !store.isNearby) {
      return false;
    }
    if (categoryFilter === 'bairro') {
      return store.storeType === 'bairro';
    }
    if (categoryFilter === 'rede_atacarejo') {
      return store.storeType === 'atacarejo' || store.storeType === 'rede';
    }
    if (categoryFilter === 'independente') {
      return store.storeType === 'independente';
    }
    return true;
  });

  // Category counts
  const counts = {
    all: storesWithDistance.length,
    bairro: storesWithDistance.filter((s) => s.storeType === 'bairro').length,
    rede_atacarejo: storesWithDistance.filter((s) => s.storeType === 'atacarejo' || s.storeType === 'rede').length,
    independente: storesWithDistance.filter((s) => s.storeType === 'independente').length,
  };

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

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

    markersGroup.clearLayers();

    // 1. Add User Location Marker
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
    visibleStores.forEach((store) => {
      const isSelected = selectedStoreId === store.id;

      let badgeBg = '#0284c7'; // default sky-600 (bairro)
      let typeIconEmoji = '🏠';

      if (store.storeType === 'atacarejo') {
        badgeBg = '#ea1d2c'; // ifood red
        typeIconEmoji = '🏢';
      } else if (store.storeType === 'rede') {
        badgeBg = '#7c3aed'; // violet-600
        typeIconEmoji = '🏬';
      } else if (store.storeType === 'independente') {
        badgeBg = '#d97706'; // amber-600
        typeIconEmoji = '⚡';
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
          <span>${typeIconEmoji}</span>
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
        map.panTo([store.lat, store.lng], { animate: true });
      });

      marker.bindPopup(`
        <div style="font-family: system-ui; font-size: 12px; max-width: 230px;">
          <b style="font-size: 13px; color: #0f172a;">${store.name}</b><br/>
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; background: ${badgeBg}20; color: ${badgeBg}; margin: 2px 0;">
            ${store.storeType === 'bairro' ? '🏠 Mercado de Bairro' : store.storeType === 'independente' ? '⚡ Mercado Único / Promoção' : store.storeType === 'atacarejo' ? '🏢 Atacarejo' : '🏬 Grande Rede'}
          </span><br/>
          <span style="color: #059669; font-weight: 600;">Distância: ${store.distanceKm.toFixed(1)} km (~${store.etaMinutes} min)</span><br/>
          <span style="color: #64748b; font-size: 11px;">${store.address}</span><br/>
          <div style="margin-top: 6px; padding: 4px 6px; background: #ecfdf5; border-radius: 6px; color: #065f46; font-size: 11px;">
            ${store.highlightPromo}
          </div>
        </div>
      `);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, [userLat, userLng, userProfile.neighborhood, selectedStoreId, visibleStores]);

  // Quick neighborhood change
  const handleNeighborhoodChange = (bairro: PassoFundoNeighborhood) => {
    onUpdateNeighborhood(bairro);
    const found = PASSO_FUNDO_NEIGHBORHOODS.find((n) => n.neighborhood === bairro);
    if (found && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([found.lat, found.lng], 14, { duration: 1 });
    }
  };

  const selectedStore = visibleStores.find((s) => s.id === selectedStoreId) || visibleStores[0] || storesWithDistance[0];

  const handleToggleNearbyFilter = () => {
    const nextState = !onlyNearbyFiltered;
    setOnlyNearbyFiltered(nextState);
    if (onSelectSupermarketFilter) {
      onSelectSupermarketFilter(nextState ? 'nearby' : 'all');
    }
  };

  // Handle adding custom neighborhood market
  const handleSaveNewStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) {
      setFormError('Por favor, informe o nome do mercado.');
      return;
    }

    const nCoord = PASSO_FUNDO_NEIGHBORHOODS.find(n => n.neighborhood.toLowerCase() === newStoreNeighborhood.toLowerCase());
    // Small random jitter around neighborhood center to simulate exact location
    const lat = (nCoord?.lat || userLat) + (Math.random() - 0.5) * 0.006;
    const lng = (nCoord?.lng || userLng) + (Math.random() - 0.5) * 0.006;

    const created = saveCustomStoreToStorage({
      name: newStoreName.trim(),
      chain: newStoreName.trim(),
      neighborhood: newStoreNeighborhood,
      address: newStoreAddress.trim() || `${newStoreNeighborhood}, Passo Fundo - RS`,
      lat,
      lng,
      openHours: 'Seg a Sáb: 08:00 às 20:00 • Dom: 08:00 às 12:30',
      highlightPromo: newStorePromo.trim() || 'Ofertas locais e atendimento de bairro perto de você',
      storeType: newStoreType,
      tagline: newStoreType === 'bairro' ? 'Mercado de bairro perto de casa' : newStoreType === 'independente' ? 'Mercado único com super ofertas' : 'Filial de rede',
      specialties: ['Produtos frescos', 'Conveniência de bairro', 'Básico da semana'],
    });

    const refreshed = getAllPassoFundoStores();
    setStoresList(refreshed);
    setSelectedStoreId(created.id);
    setIsAddStoreOpen(false);
    setNewStoreName('');
    setNewStoreAddress('');
    setNewStorePromo('');
    setFormError('');

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1 });
    }
  };

  const handleDeleteCustomStore = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeCustomStoreFromStorage(id);
    const refreshed = getAllPassoFundoStores();
    setStoresList(refreshed);
  };

  return (
    <div id="secao-mapa-passo-fundo" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Top Banner with GPS Neighborhood Selector */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                <Compass className="w-3.5 h-3.5" /> Geolocalização Passo Fundo
              </span>
              <span className="text-xs text-slate-400">
                Bairro Detectado: <strong className="text-white font-bold">{userProfile.neighborhood}</strong>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-red-500" />
              Mercados Próximos de Você: Grandes Redes, Bairro e Únicos
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              O aplicativo compara grandes atacarejos, mercados de bairro da sua esquina e mercados independentes com super ofertas. Sem rodar à toa e sem gastar gasolina!
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
              Toque no pin para ver detalhes, distância e ofertas
            </p>
          </div>

          {/* Map Footer Bar with Proximity Filter */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Info className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>{storesWithDistance.filter((s) => s.distanceKm <= 3.5).length} mercados</strong> a menos de 3.5 km de você.
              </span>
            </div>

            <div className="flex items-center gap-2">
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
                {onlyNearbyFiltered ? 'Exibindo Só Próximos' : 'Filtrar Só Próximos'}
              </button>

              <button
                type="button"
                onClick={() => setIsAddStoreOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                + Cadastrar Mercado
              </button>
            </div>
          </div>
        </div>

        {/* Right / Bottom: Nearby Stores List & Active Store Card (5 cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-4 h-4 text-red-600" />
                Todos os Mercados da Região:
              </h4>
              <span className="text-[11px] font-semibold text-slate-500">
                Ponto: {userProfile.neighborhood}
              </span>
            </div>

            {/* Market Type Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 text-xs scrollbar-none">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 text-[11px] ${
                  categoryFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Todos ({counts.all})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('bairro')}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 text-[11px] flex items-center gap-1 ${
                  categoryFilter === 'bairro'
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
                }`}
              >
                <Home className="w-3 h-3" />
                Bairro ({counts.bairro})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('rede_atacarejo')}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 text-[11px] flex items-center gap-1 ${
                  categoryFilter === 'rede_atacarejo'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                }`}
              >
                <Building2 className="w-3 h-3" />
                Redes & Atacado ({counts.rede_atacarejo})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('independente')}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 text-[11px] flex items-center gap-1 ${
                  categoryFilter === 'independente'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Zap className="w-3 h-3" />
                Mercados Únicos ({counts.independente})
              </button>
            </div>

            {/* Scrollable list of closest stores */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
              {visibleStores.map((store, index) => {
                const isSelected = selectedStore?.id === store.id;
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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isNearest && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            MAIS PERTO
                          </span>
                        )}

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          store.storeType === 'bairro'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : store.storeType === 'independente'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : store.storeType === 'atacarejo'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {store.storeType === 'bairro' ? '🏠 Bairro' : store.storeType === 'independente' ? '⚡ Único/Promo' : store.storeType === 'atacarejo' ? '🏢 Atacarejo' : '🏬 Rede'}
                        </span>

                        <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {store.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{store.address}</p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {store.distanceKm < 1 ? `${Math.round(store.distanceKm * 1000)} m` : `${store.distanceKm.toFixed(1)} km`}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          ~{store.etaMinutes} min
                        </div>
                      </div>

                      {store.isUserAdded && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomStore(store.id, e)}
                          title="Remover mercado cadastrado"
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Store Card details */}
          {selectedStore && (
            <div className="mt-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {selectedStore.neighborhood}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      selectedStore.storeType === 'bairro'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : selectedStore.storeType === 'independente'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : selectedStore.storeType === 'atacarejo'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {selectedStore.storeType === 'bairro' ? '🏠 Mercado de Bairro' : selectedStore.storeType === 'independente' ? '⚡ Mercado Único / Super Ofertas' : selectedStore.storeType === 'atacarejo' ? '🏢 Grande Atacarejo' : '🏬 Grande Rede de Supermercados'}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm mt-1">{selectedStore.name}</h5>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                    {selectedStore.distanceKm.toFixed(1)} km
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-2">{selectedStore.address}</p>
              
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 text-xs text-slate-700">
                <strong className="text-slate-900 block mb-0.5">Destaque de Preço / Oferta:</strong>
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
          )}
        </div>

      </div>

      {/* Modal: Cadastrar Novo Mercado */}
      {isAddStoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setIsAddStoreOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-emerald-600">
              <Plus className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Cadastrar Mercado</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Adicione qualquer mercado perto de você: seja um minimercado da sua rua, uma grande filial ou um mercado único com grandes promoções.
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveNewStore} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome do Mercado *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mercado da Esquina do Seu Zé"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tipo de Mercado
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStoreType('bairro')}
                    className={`p-2 rounded-xl border font-bold text-center transition ${
                      newStoreType === 'bairro'
                        ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🏠 Bairro
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStoreType('independente')}
                    className={`p-2 rounded-xl border font-bold text-center transition ${
                      newStoreType === 'independente'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ⚡ Único/Promo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStoreType('atacarejo')}
                    className={`p-2 rounded-xl border font-bold text-center transition ${
                      newStoreType === 'atacarejo'
                        ? 'bg-red-50 border-red-500 text-red-800 ring-2 ring-red-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🏢 Filial/Rede
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bairro</label>
                  <select
                    value={newStoreNeighborhood}
                    onChange={(e) => setNewStoreNeighborhood(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs"
                  >
                    {(['Boqueirão', 'Centro', 'Petrópolis', 'São Cristóvão', 'Vera Cruz', 'Vergueiro', 'Lucas Araújo', 'Integração'] as PassoFundoNeighborhood[]).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rua / Endereço</label>
                  <input
                    type="text"
                    placeholder="Ex: Rua Uruguai, 150"
                    value={newStoreAddress}
                    onChange={(e) => setNewStoreAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Oferta Especial / Destaque
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pão quentinho às 18h, carne moída fresca e cerveja gelada"
                  value={newStorePromo}
                  onChange={(e) => setNewStorePromo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddStoreOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar Mercado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
