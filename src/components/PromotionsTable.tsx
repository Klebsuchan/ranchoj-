import React, { useState, useMemo, useEffect } from 'react';
import { 
  PromotionItem, 
  ProductCategory, 
  SupermarketName, 
  ShoppingListItem, 
  UserProfile,
  PriceAlert
} from '../types';
import { 
  Search, 
  RefreshCw, 
  Plus, 
  Minus,
  Check, 
  TrendingDown, 
  Flame, 
  ExternalLink, 
  ShieldCheck, 
  Store, 
  ChevronDown, 
  Scale, 
  Sparkles, 
  MapPin, 
  Navigation,
  Lightbulb,
  ArrowRight,
  BadgePercent,
  Star,
  Bell,
  BellRing,
  LayoutGrid,
  Table as TableIcon,
  X,
  Volume2
} from 'lucide-react';
import { extractProductPackageInfo, calculateUnitPrice } from '../utils/unitPriceCalculator';
import { PackageComparisonModal } from './PackageComparisonModal';
import { SubstitutesExplorerModal } from './SubstitutesExplorerModal';
import { PriceAlertModal } from './PriceAlertModal';
import { getAllPassoFundoStores, calculateDistanceKm } from '../utils/passoFundoLocations';
import { 
  getSubstitutesForProduct, 
  ProductSubstitute 
} from '../utils/productSubstitutes';
import { 
  getStoredPriceAlerts, 
  savePriceAlert, 
  removePriceAlert, 
  evaluatePriceAlerts 
} from '../utils/priceAlerts';
import { normalizeSearchText, generateOrEstimateProduct } from '../utils/catalogueData';

interface PromotionsTableProps {
  items: PromotionItem[];
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: string;
  shoppingList: ShoppingListItem[];
  onAddToRancho: (item: PromotionItem) => void;
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemoveItem?: (id: string) => void;
  onAddSubstituteToRancho?: (sub: ProductSubstitute, replaceOriginalName?: string) => void;
  onAddCustomProduct?: (item: PromotionItem) => void;
  sources: { title: string; uri: string }[];
  userProfile?: UserProfile;
  initialOnlyNearby?: boolean;
}

const categoryLabels: Record<ProductCategory, string> = {
  cesta_basica: "Cesta Básica",
  carnes_proteinas: "Carnes & Ovos",
  hortifruti: "Hortifrúti / Feira",
  laticinios_frios: "Laticínios & Frios",
  limpeza_higiene: "Limpeza & Higiene",
  outros: "Supérfluos & Doces",
};

export const PromotionsTable: React.FC<PromotionsTableProps> = ({
  items,
  isLoading,
  onRefresh,
  lastUpdated,
  shoppingList,
  onAddToRancho,
  onUpdateQuantity,
  onRemoveItem,
  onAddSubstituteToRancho,
  onAddCustomProduct,
  sources,
  userProfile,
  initialOnlyNearby = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyEssentials, setOnlyEssentials] = useState(false);
  const [onlyPromos, setOnlyPromos] = useState(false);
  const [onlySubstitutes, setOnlySubstitutes] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyNearby, setOnlyNearby] = useState(initialOnlyNearby);
  const [showSources, setShowSources] = useState(false);
  const [showUnitPrice, setShowUnitPrice] = useState(true);
  
  // Dynamic Mobile Features
  const [sortBy, setSortBy] = useState<'cheapest' | 'savings' | 'alpha' | 'promo'>('cheapest');
  const [priceUnder10, setPriceUnder10] = useState(false);
  const [expandedCardMarketId, setExpandedCardMarketId] = useState<string | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const handleAddWithFeedback = (item: PromotionItem) => {
    onAddToRancho(item);
    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === item.id ? null : curr));
    }, 1500);
  };
  
  // Mobile-first view mode: 'cards' is optimal for smartphones, 'table' for wide desktops
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Modals & Expansion states
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [substitutesModalOpen, setSubstitutesModalOpen] = useState(false);
  const [expandedSubstituteItemId, setExpandedSubstituteItemId] = useState<string | null>(null);
  const [priceAlertModalItem, setPriceAlertModalItem] = useState<PromotionItem | null>(null);
  const [dismissedNotification, setDismissedNotification] = useState(false);

  // Price Alerts from localStorage
  const [priceAlerts, setPriceAlerts] = useState<Record<string, PriceAlert>>(() => getStoredPriceAlerts());

  const [comparisonItem, setComparisonItem] = useState<{
    name: string;
    amountA: number;
    unitA: 'kg' | 'g' | 'L' | 'ml' | 'un';
    priceA: number;
  } | null>(null);

  // Evaluate price alerts whenever items or priceAlerts change
  const { activeCount, triggeredAlerts } = useMemo(() => {
    return evaluatePriceAlerts(items, priceAlerts);
  }, [items, priceAlerts]);

  // Handle saving new price alert
  const handleSaveAlert = (item: PromotionItem, targetPrice: number) => {
    const isTriggered = item.lowestPrice <= targetPrice;
    const newAlert: PriceAlert = {
      itemId: item.id,
      itemName: item.name,
      targetPrice,
      currentLowestPrice: item.lowestPrice,
      cheapestMarket: item.cheapestMarket,
      isTriggered,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };
    const updated = savePriceAlert(newAlert);
    setPriceAlerts(updated);
    setDismissedNotification(false);
  };

  // Handle removing price alert
  const handleRemoveAlert = (itemId: string) => {
    const updated = removePriceAlert(itemId);
    setPriceAlerts(updated);
  };

  // Supermarket category filter
  const [selectedMarketTypeFilter, setSelectedMarketTypeFilter] = useState<'all' | 'bairro' | 'atacarejo' | 'independente'>('all');

  // User location & supermarket distances
  const userLat = userProfile?.coordinates?.lat ?? -28.2685;
  const userLng = userProfile?.coordinates?.lng ?? -52.4310;
  const userLocationLabel = userProfile?.city 
    ? `${userProfile.city} (${userProfile.neighborhood})` 
    : (userProfile?.neighborhood || 'Boqueirão');

  const allStores = useMemo(() => getAllPassoFundoStores(), []);

  // Calculate distance to closest branch of each supermarket
  const marketDistances = useMemo(() => {
    const map: Record<string, { distanceKm: number; etaMinutes: number; address: string; name: string }> = {};

    allStores.forEach((store) => {
      const d = calculateDistanceKm(userLat, userLng, store.lat, store.lng);
      const chain = store.chain;
      if (!map[chain] || d < map[chain].distanceKm) {
        map[chain] = {
          distanceKm: d,
          etaMinutes: Math.max(2, Math.round((d / 25) * 60)),
          address: store.address,
          name: store.name,
        };
      }
    });

    return map;
  }, [allStores, userLat, userLng]);

  // Dynamically collect all unique markets
  const allMarkets: SupermarketName[] = useMemo(() => {
    const set = new Set<string>();
    allStores.forEach((s) => set.add(s.chain));
    items.forEach((it) => {
      it.prices.forEach((p) => set.add(p.supermarket));
    });
    return Array.from(set) as SupermarketName[];
  }, [allStores, items]);

  const closestMarket = useMemo(() => {
    if (allMarkets.length === 0) return null;
    const sorted = [...allMarkets].sort((a, b) => {
      const distA = marketDistances[a]?.distanceKm ?? 999;
      const distB = marketDistances[b]?.distanceKm ?? 999;
      return distA - distB;
    });
    const top = sorted[0];
    const info = marketDistances[top];
    return { name: top, distanceKm: info?.distanceKm ?? 0 };
  }, [allMarkets, marketDistances]);

  const activeMarkets = useMemo(() => {
    let list = allMarkets;

    if (selectedMarketTypeFilter === 'bairro') {
      const bairroChains = new Set(allStores.filter(s => s.storeType === 'bairro').map(s => s.chain));
      const filtered = list.filter(m => bairroChains.has(m));
      if (filtered.length > 0) list = filtered;
    } else if (selectedMarketTypeFilter === 'atacarejo') {
      const atacarejoChains = new Set(allStores.filter(s => s.storeType === 'atacarejo' || s.storeType === 'rede').map(s => s.chain));
      const filtered = list.filter(m => atacarejoChains.has(m));
      if (filtered.length > 0) list = filtered;
    } else if (selectedMarketTypeFilter === 'independente') {
      const indepChains = new Set(allStores.filter(s => s.storeType === 'independente').map(s => s.chain));
      const filtered = list.filter(m => indepChains.has(m));
      if (filtered.length > 0) list = filtered;
    }

    if (onlyNearby) {
      const threshold = userProfile?.radiusKm || 5.0;
      const filtered = list.filter((m) => (marketDistances[m]?.distanceKm ?? 99) <= threshold);
      if (filtered.length > 0) list = filtered;
    }

    return list.slice(0, 8);
  }, [allMarkets, allStores, selectedMarketTypeFilter, onlyNearby, marketDistances, userProfile?.radiusKm]);

  const itemsWithSubstitutesCount = useMemo(() => {
    return items.filter((item) => getSubstitutesForProduct(item).length > 0).length;
  }, [items]);

  const handleOpenComparison = (item?: PromotionItem) => {
    if (item) {
      const info = extractProductPackageInfo(item.name, item.unit);
      setComparisonItem({
        name: item.name,
        amountA: info.packageAmount,
        unitA: (info.standardUnit as any) || 'kg',
        priceA: item.lowestPrice,
      });
    } else {
      setComparisonItem(null);
    }
    setComparisonModalOpen(true);
  };

  const handleApplySubstitute = (sub: ProductSubstitute, originalItemName: string) => {
    if (onAddSubstituteToRancho) {
      onAddSubstituteToRancho(sub, originalItemName);
    } else {
      const subItem: PromotionItem = {
        id: `sub-item-${Date.now()}`,
        name: sub.substituteName,
        category: sub.category as any,
        unit: sub.substituteUnit,
        brand: sub.substituteBrand,
        lowestPrice: sub.estimatedPrice,
        cheapestMarket: sub.market,
        highestPrice: sub.estimatedPrice * 1.2,
        savingsAmount: sub.savingsAmount,
        savingsPercent: sub.savingsPercent,
        isEssential: true,
        verifiedDate: new Date().toISOString(),
        prices: [
          {
            supermarket: sub.market,
            price: sub.estimatedPrice,
            isPromo: true,
            unit: sub.substituteUnit,
          },
        ],
      };
      onAddToRancho(subItem);
    }
  };

  const handleAddSearchedItemDirectly = (term: string) => {
    const estimated = generateOrEstimateProduct(term, userProfile?.city || 'Passo Fundo');
    if (onAddCustomProduct) {
      onAddCustomProduct(estimated);
    } else {
      onAddToRancho(estimated);
    }
  };

  // Filtered and dynamically sorted items
  const filteredItems = useMemo(() => {
    const list = items.filter((item) => {
      // If user typed a search query, prioritize finding the searched query across all products
      if (searchQuery.trim()) {
        const q = normalizeSearchText(searchQuery);
        const matchName = normalizeSearchText(item.name).includes(q);
        const matchBrand = normalizeSearchText(item.brand || '').includes(q);
        const matchCategory = normalizeSearchText(categoryLabels[item.category] || '').includes(q);
        if (!matchName && !matchBrand && !matchCategory) {
          return false;
        }
      } else {
        // Only apply category filter when not explicitly searching
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }
      }

      if (onlyEssentials && !item.isEssential) {
        return false;
      }
      if (onlyPromos) {
        const hasPromo = item.prices.some((p) => p.isPromo);
        if (!hasPromo) return false;
      }
      if (priceUnder10 && item.lowestPrice > 10.0) {
        return false;
      }
      if (onlySubstitutes) {
        const subs = getSubstitutesForProduct(item);
        if (subs.length === 0) return false;
      }
      if (onlyFavorites) {
        if (!priceAlerts[item.id]) return false;
      }

      return true;
    });

    // Dynamic sorting
    return list.sort((a, b) => {
      if (sortBy === 'cheapest') {
        return a.lowestPrice - b.lowestPrice;
      }
      if (sortBy === 'savings') {
        return (b.savingsAmount || 0) - (a.savingsAmount || 0);
      }
      if (sortBy === 'alpha') {
        return a.name.localeCompare(b.name, 'pt-BR');
      }
      if (sortBy === 'promo') {
        const aPromo = a.prices.some((p) => p.isPromo) ? 1 : 0;
        const bPromo = b.prices.some((p) => p.isPromo) ? 1 : 0;
        return bPromo - aPromo;
      }
      return 0;
    });
  }, [items, searchQuery, selectedCategory, onlyEssentials, onlyPromos, priceUnder10, onlySubstitutes, onlyFavorites, priceAlerts, sortBy]);

  const isItemInRancho = (itemName: string) => {
    return shoppingList.some((s) => s.name.toLowerCase() === itemName.toLowerCase());
  };

  const getShoppingItem = (itemName: string) => {
    return shoppingList.find((s) => s.name.toLowerCase() === itemName.toLowerCase());
  };

  const getPriceForMarket = (item: PromotionItem, market: SupermarketName) => {
    return item.prices.find((p) => p.supermarket === market);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-8">
      {/* Header with Title, Live Status and Refresh */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-display">
                Tabela de Promoções & Alertas
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Ao Vivo da Internet
              </span>
              {activeCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{activeCount} Favoritos</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Comparativo em tempo real entre <strong className="text-slate-700">Stock Center</strong>, <strong className="text-slate-700">Atacadão</strong>, <strong className="text-slate-700">Boqueirão</strong>, <strong className="text-slate-700">Bourbon</strong>, <strong className="text-slate-700">Zaffari</strong> e <strong className="text-slate-700">Coqueiros</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              id="btn-atualizar-promocoes"
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-2xs disabled:opacity-50 active:scale-95"
              title="Buscar dados mais recentes da web via Gemini com Google Search"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-red-600 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Verificando...' : 'Atualizar Preços'}
            </button>
            <span className="text-[11px] text-slate-400 hidden lg:inline">
              Última checagem: {lastUpdated}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NOTIFICATION SYSTEM: Triggered Price Alerts stored in localStorage */}
        {/* ========================================================================= */}
        {triggeredAlerts.length > 0 && !dismissedNotification && (
          <div className="mt-4 p-4 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-red-700 text-white shadow-md border border-amber-300/40 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/25 mt-0.5">
                  <BellRing className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                      <span>Alerta de Preço Disparado no LocalStorage!</span>
                    </h4>
                    <span className="bg-white/25 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                      {triggeredAlerts.length} {triggeredAlerts.length === 1 ? 'meta atingida' : 'metas atingidas'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-100 leading-relaxed">
                    Itens que você favoritou caíram abaixo do limite de preço que você definiu:
                  </p>

                  {/* List of triggered products with quick 1-click addition */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {triggeredAlerts.map((alert) => {
                      const itemObj = items.find((i) => i.id === alert.itemId);
                      const isAdded = itemObj ? isItemInRancho(itemObj.name) : false;
                      return (
                        <div 
                          key={alert.itemId} 
                          className="bg-white/95 text-slate-800 p-2.5 rounded-xl border border-white/40 shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-slate-900 truncate">{alert.itemName}</span>
                              <span className="text-[10px] font-black text-red-600 bg-red-100 px-1.5 py-0.2 rounded">
                                R$ {alert.currentLowestPrice.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              no <strong>{alert.cheapestMarket}</strong> • Sua meta era R$ {alert.targetPrice.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-red-700 font-bold">
                              Economia: R$ {(alert.targetPrice - alert.currentLowestPrice).toFixed(2)} abaixo da meta
                            </span>
                            {itemObj && (
                              <button
                                type="button"
                                onClick={() => onAddToRancho(itemObj)}
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                                  isAdded 
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-2xs'
                                }`}
                              >
                                {isAdded ? <Check className="w-3 h-3 text-red-600" /> : <Plus className="w-3 h-3" />}
                                <span>{isAdded ? 'No Rancho' : '+ Rancho'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDismissedNotification(true)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
                title="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Unified Search & Category Controls */}
        <div className="mt-3 space-y-2.5">
          {/* Main Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-busca-produtos"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos ou marcas (ex: Arroz, Leite, Café, Carne...)"
              className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                title="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Unified Category & Feature Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setOnlyPromos(false);
                setOnlyFavorites(false);
                setOnlySubstitutes(false);
                setPriceUnder10(false);
                setOnlyNearby(false);
                setSelectedMarketTypeFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 shrink-0 ${
                selectedCategory === 'all' && !onlyPromos && !onlyFavorites && !onlySubstitutes && !priceUnder10 && !onlyNearby && selectedMarketTypeFilter === 'all'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Todos ({items.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setOnlyPromos(!onlyPromos);
                if (selectedCategory !== 'all') setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 shrink-0 flex items-center gap-1 ${
                onlyPromos
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>⚡</span>
              <span>Ofertas</span>
            </button>

            {[
              { key: 'cesta_basica', label: 'Cesta Básica', icon: '🌾' },
              { key: 'carnes_proteinas', label: 'Carnes & Ovos', icon: '🥩' },
              { key: 'hortifruti', label: 'Hortifrúti', icon: '🥦' },
              { key: 'laticinios_frios', label: 'Laticínios', icon: '🥛' },
              { key: 'limpeza_higiene', label: 'Limpeza', icon: '🧼' },
              { key: 'outros', label: 'Supérfluos', icon: '🥤' },
            ].map(({ key, label, icon }) => {
              const isSelected = selectedCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? 'all' : key)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}

            {/* Quick Favorites Pill */}
            <button
              id="btn-toggle-favoritos"
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 shrink-0 flex items-center gap-1 ${
                onlyFavorites
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white text-white' : 'fill-amber-500 text-amber-500'}`} />
              <span>Favoritos {activeCount > 0 ? `(${activeCount})` : ''}</span>
            </button>

            {/* Quick Substitutes Pill */}
            <button
              id="btn-toggle-substitutos"
              type="button"
              onClick={() => setOnlySubstitutes(!onlySubstitutes)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 shrink-0 flex items-center gap-1 ${
                onlySubstitutes
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
              <span>Substitutos Baratos</span>
            </button>

            {/* Under R$ 10 */}
            <button
              id="btn-toggle-under10"
              type="button"
              onClick={() => setPriceUnder10(!priceUnder10)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 shrink-0 flex items-center gap-1 ${
                priceUnder10
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>💰</span>
              <span>Até R$ 10</span>
            </button>

            {/* Proximity Filter */}
            <button
              id="btn-filtrar-proximos-tabela"
              type="button"
              onClick={() => setOnlyNearby(!onlyNearby)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 shrink-0 flex items-center gap-1 ${
                onlyNearby
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>Mais Próximos</span>
            </button>

            {(selectedCategory !== 'all' || onlyPromos || priceUnder10 || onlyFavorites || onlySubstitutes || onlyNearby || searchQuery || selectedMarketTypeFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setOnlyPromos(false);
                  setPriceUnder10(false);
                  setOnlyFavorites(false);
                  setOnlySubstitutes(false);
                  setOnlyNearby(false);
                  setSelectedMarketTypeFilter('all');
                  setSearchQuery('');
                }}
                className="px-2.5 py-1.5 text-red-600 hover:text-red-800 font-bold whitespace-nowrap text-xs transition"
              >
                ✕ Limpar
              </button>
            )}
          </div>

          {/* Quick Supermarket Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Tipo:</span>
            {[
              { id: 'all', label: 'Todos os Mercados' },
              { id: 'atacarejo', label: '🏢 Atacarejos (Stok / Atacadão)' },
              { id: 'bairro', label: '🏠 Mercados de Bairro' },
              { id: 'independente', label: '⚡ Ofertas Especiais' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMarketTypeFilter(m.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 text-[11px] ${
                  selectedMarketTypeFilter === m.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOBILE-FIRST CARDS VIEW (Optimized for touchscreens & smartphones) */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="p-3 sm:p-5">
          {/* Dynamic Sort & Live Items Count Bar */}
          <div className="mb-3 p-2.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="font-extrabold text-slate-800 truncate">
                {filteredItems.length} {filteredItems.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </span>
            </div>

            {/* Dynamic Fast Sort Chips */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Ordenar:</span>
              <button
                type="button"
                onClick={() => setSortBy('cheapest')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition shrink-0 ${
                  sortBy === 'cheapest' ? 'bg-red-600 text-white shadow-2xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                ⚡ Menor Preço
              </button>
              <button
                type="button"
                onClick={() => setSortBy('savings')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition shrink-0 ${
                  sortBy === 'savings' ? 'bg-red-600 text-white shadow-2xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                💥 Maior Economia
              </button>
              <button
                type="button"
                onClick={() => setSortBy('promo')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition shrink-0 ${
                  sortBy === 'promo' ? 'bg-red-600 text-white shadow-2xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                🔥 Ofertas
              </button>
              <button
                type="button"
                onClick={() => setSortBy('alpha')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition shrink-0 ${
                  sortBy === 'alpha' ? 'bg-red-600 text-white shadow-2xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                🔤 A-Z
              </button>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-8 px-4 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl my-2">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {searchQuery.trim() ? `Comparar preços de "${searchQuery}"?` : 'Nenhum produto encontrado com os filtros atuais.'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {searchQuery.trim()
                  ? 'Clique abaixo para comparar preços no Stok Center, Boqueirão, Atacadão, Bourbon e Zaffari e adicionar ao rancho!'
                  : 'Limpe a busca ou ative todas as categorias para visualizar ofertas.'}
              </p>
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddSearchedItemDirectly(searchQuery)}
                  className="mt-3.5 px-4 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar "{searchQuery}" com Preços Comparados</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredItems.map((item) => {
                const alreadyAdded = isItemInRancho(item.name);
                const shopItem = getShoppingItem(item.name);
                const packageInfo = extractProductPackageInfo(item.name, item.unit);
                const bestUnitCalc = calculateUnitPrice(item.lowestPrice, packageInfo);
                const substitutes = getSubstitutesForProduct(item);
                const bestSub = substitutes[0] || null;
                const isPromo = item.prices.some((p) => p.isPromo);
                const alert = priceAlerts[item.id];
                const isAlertTriggered = alert && item.lowestPrice <= alert.targetPrice;
                const isDetailsExpanded = expandedCardMarketId === item.id;
                const isRecentlyAdded = recentlyAddedId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border transition shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
                      isAlertTriggered
                        ? 'border-2 border-amber-500 ring-2 ring-amber-400/20 bg-amber-50/20'
                        : alert
                        ? 'border-amber-300'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Top Row: Category, Essential, and Favorite Button */}
                    <div className="p-3.5 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.isEssential ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Essencial
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                              Supérfluo
                            </span>
                          )}
                          {isPromo ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <Flame className="w-2.5 h-2.5 text-amber-600" /> Oferta
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500">
                              Sem oferta
                            </span>
                          )}
                        </div>

                        {/* Favorite & Price Alert button */}
                        <button
                          type="button"
                          onClick={() => setPriceAlertModalItem(item)}
                          className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-xl transition border ${
                            isAlertTriggered
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs animate-pulse'
                              : alert
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-50 text-slate-400 hover:text-amber-500 border-slate-200 hover:bg-amber-50'
                          }`}
                          title={alert ? `Alerta ativo: R$ ${alert.targetPrice.toFixed(2)}` : 'Definir alerta de preço (favoritar)'}
                        >
                          <Star className={`w-4 h-4 ${alert ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Product Name & Brand */}
                      <div className="mt-2">
                        <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          {item.brand ? `Marca: ${item.brand} • ` : ''}{categoryLabels[item.category]} • {item.unit}
                        </p>
                      </div>

                      {/* Alert Trigger Badge */}
                      {alert && (
                        <div className={`mt-2 p-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                          isAlertTriggered
                            ? 'bg-red-100 text-red-950 border border-red-300'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <Bell className="w-4 h-4 text-amber-600" />
                            <span>Meta salva: <strong>R$ {alert.targetPrice.toFixed(2)}</strong></span>
                          </div>
                          {isAlertTriggered && (
                            <span className="text-[11px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black">
                              Atingida!
                            </span>
                          )}
                        </div>
                      )}

                      {/* Main Price & Lowest Market Card */}
                      <div className="mt-3 p-3 rounded-2xl bg-red-50/90 border-2 border-red-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-red-800 block">
                            Melhor Preço
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="font-black text-2xl text-red-700">
                              R$ {item.lowestPrice.toFixed(2)}
                            </span>
                            {showUnitPrice && (
                              <span className="text-xs font-bold text-red-600">
                                R$ {bestUnitCalc.shortLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-black shadow-xs">
                            <Store className="w-3.5 h-3.5" />
                            {item.cheapestMarket}
                          </span>
                          {item.savingsAmount > 0 && (
                            <span className="text-xs font-bold text-emerald-700 block mt-1">
                              Economia: R$ {item.savingsAmount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dynamic Interactive Market Comparison Drawer */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setExpandedCardMarketId(isDetailsExpanded ? null : item.id)}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-extrabold text-[11px] flex items-center justify-between transition active:scale-98"
                        >
                          <span className="flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-red-600" />
                            <span>Preço nos Mercados ({item.prices.length})</span>
                          </span>
                          <span className="text-red-600 font-black">
                            {isDetailsExpanded ? 'Recolher ▲' : 'Comparar ▼'}
                          </span>
                        </button>

                        {isDetailsExpanded ? (
                          <div className="mt-2 space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80 animate-in fade-in duration-150">
                            {activeMarkets.map((mkt) => {
                              const p = getPriceForMarket(item, mkt);
                              const isCheapest = item.cheapestMarket === mkt;
                              const diff = p ? p.price - item.lowestPrice : 0;
                              return (
                                <div 
                                  key={mkt} 
                                  className={`p-2 rounded-lg flex items-center justify-between text-xs ${
                                    isCheapest 
                                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold' 
                                      : 'bg-white border border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="font-bold truncate">{mkt}</span>
                                    {isCheapest && (
                                      <span className="text-[10px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded-md">
                                        🥇 Campeão
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="font-black text-slate-900">
                                      {p ? `R$ ${p.price.toFixed(2)}` : 'Indisponível'}
                                    </div>
                                    {!isCheapest && p && diff > 0 && (
                                      <span className="text-[10px] text-rose-600 font-bold block">
                                        +R$ {diff.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-1 text-[11px] mt-1.5">
                            {activeMarkets.slice(0, 4).map((mkt) => {
                              const p = getPriceForMarket(item, mkt);
                              const isCheapest = item.cheapestMarket === mkt;
                              return (
                                <div 
                                  key={mkt} 
                                  className={`p-1.5 rounded-lg flex items-center justify-between ${
                                    isCheapest ? 'bg-red-100/80 font-black text-red-950' : 'bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <span className="truncate pr-1">{mkt}:</span>
                                  <span className="font-bold shrink-0">{p ? `R$ ${p.price.toFixed(2)}` : '-'}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Substitute Recommendation Pill */}
                      {bestSub && (
                        <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1 text-[11px]">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                              Substituto: {bestSub.substituteName}
                            </span>
                            <span className="font-black text-red-700 text-[11px]">
                              R$ {bestSub.estimatedPrice.toFixed(2)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplySubstitute(bestSub, item.name)}
                            className="mt-1.5 w-full py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition shadow-2xs"
                          >
                            + Usar Substituto (-R$ {bestSub.savingsAmount.toFixed(2)})
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action: Big Touch-Friendly Button for Mobile (Senior friendly >= 48px) */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenComparison(item)}
                        className="min-h-[48px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                        title="Calcular preço por kg/litro"
                      >
                        <Scale className="w-4 h-4 text-red-600" />
                        <span>Medida</span>
                      </button>

                      {shopItem ? (
                        <div className="flex-1 flex items-center justify-between bg-red-100/80 border-2 border-red-300 rounded-xl p-1 shadow-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (shopItem.quantity <= 1 && onRemoveItem) {
                                onRemoveItem(shopItem.id);
                              } else if (onUpdateQuantity) {
                                onUpdateQuantity(shopItem.id, -1);
                              }
                            }}
                            className="min-h-[44px] w-12 rounded-lg bg-white hover:bg-red-50 text-red-700 font-black text-xl flex items-center justify-center transition border border-red-200 active:scale-90 shadow-2xs"
                            title="Diminuir quantidade"
                          >
                            <Minus className="w-5 h-5 stroke-[3]" />
                          </button>
                          
                          <div className="px-2 text-center">
                            <span className="font-black text-base text-red-950 block leading-none">
                              {shopItem.quantity} un
                            </span>
                            <span className="text-[10px] text-red-700 font-extrabold uppercase leading-none mt-0.5 block">
                              no carrinho
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onUpdateQuantity) {
                                onUpdateQuantity(shopItem.id, 1);
                              } else {
                                handleAddWithFeedback(item);
                              }
                            }}
                            className="min-h-[44px] w-12 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-xl flex items-center justify-center transition shadow-xs active:scale-90"
                            title="Aumentar quantidade"
                          >
                            <Plus className="w-5 h-5 stroke-[3]" />
                          </button>
                        </div>
                      ) : isRecentlyAdded ? (
                        <button
                          type="button"
                          className="min-h-[48px] flex-1 rounded-xl font-black text-sm bg-emerald-600 text-white shadow-xs transition flex items-center justify-center gap-2 animate-pop-in"
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                          <span>✓ Adicionado ao Rancho!</span>
                        </button>
                      ) : (
                        <button
                          id={`btn-adicionar-${item.id}`}
                          type="button"
                          onClick={() => handleAddWithFeedback(item)}
                          className="min-h-[48px] flex-1 rounded-xl font-black text-sm bg-red-600 hover:bg-red-700 text-white shadow-xs shadow-red-600/30 active:scale-95 transition flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5 stroke-[3]" />
                          <span>+ Adicionar ao Rancho</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TABLE VIEW (Desktop Full Comparison Grid) */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3 px-3 w-10 text-center">⭐</th>
                <th className="py-3 px-4">
                  <div>Produto & Embalagem</div>
                  {showUnitPrice && (
                    <div className="text-[10px] text-red-700 font-semibold lowercase">
                      com cálculo de R$/kg ou un
                    </div>
                  )}
                </th>
                {activeMarkets.map((mkt) => {
                  const info = marketDistances[mkt] || { distanceKm: 4.5, etaMinutes: 10, address: '', name: mkt };
                  const isNearest = closestMarket?.name === mkt;
                  return (
                    <th key={mkt} className="py-3 px-3 text-center min-w-[115px]">
                      <div className="font-bold text-slate-900 flex items-center justify-center gap-1">
                        <span>{mkt}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isNearest 
                            ? 'bg-red-100 text-red-900 border border-red-300 shadow-2xs' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {info.distanceKm < 1 ? `${Math.round(info.distanceKm * 1000)}m` : `${info.distanceKm.toFixed(1)} km`}
                          {isNearest ? ' (mais perto)' : ''}
                        </span>
                      </div>
                    </th>
                  );
                })}
                <th className="py-3 px-4 text-center">
                  <div>Melhor Preço</div>
                  {showUnitPrice && (
                    <div className="text-[10px] text-red-600 font-bold lowercase">
                      menor R$/medida
                    </div>
                  )}
                </th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={activeMarkets.length + 4} className="py-10 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-medium text-slate-700">
                        {searchQuery.trim() ? `Comparar preços de "${searchQuery}"?` : 'Nenhum produto encontrado com os filtros atuais.'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {searchQuery.trim()
                          ? 'Clique abaixo para comparar preços e adicionar à sua lista de compras imediatamente!'
                          : 'Tente limpar os termos de busca ou selecionar outra categoria.'}
                      </p>
                      {searchQuery.trim() && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleAddSearchedItemDirectly(searchQuery)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Adicionar "{searchQuery}" com Preços Comparados</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const alreadyAdded = isItemInRancho(item.name);
                  const shopItem = getShoppingItem(item.name);
                  const packageInfo = extractProductPackageInfo(item.name, item.unit);
                  const bestUnitCalc = calculateUnitPrice(item.lowestPrice, packageInfo);
                  const substitutes = getSubstitutesForProduct(item);
                  const hasSubstitutes = substitutes.length > 0;
                  const isExpanded = expandedSubstituteItemId === item.id;
                  const bestSub = substitutes[0] || null;
                  const isPromo = item.prices.some((p) => p.isPromo);
                  const alert = priceAlerts[item.id];
                  const isAlertTriggered = alert && item.lowestPrice <= alert.targetPrice;

                  return (
                    <React.Fragment key={item.id}>
                      <tr 
                        className={`hover:bg-slate-50/80 transition-colors group ${
                          isAlertTriggered ? 'bg-amber-50/40' : isExpanded ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Star / Price Alert Button */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setPriceAlertModalItem(item)}
                            className={`p-1.5 rounded-lg transition ${
                              isAlertTriggered
                                ? 'text-amber-500 animate-pulse'
                                : alert
                                ? 'text-amber-500'
                                : 'text-slate-300 hover:text-amber-400'
                            }`}
                            title={alert ? `Alerta ativo: R$ ${alert.targetPrice.toFixed(2)}` : 'Definir alerta de preço'}
                          >
                            <Star className={`w-4 h-4 ${alert ? 'fill-current' : ''}`} />
                          </button>
                        </td>

                        {/* Product info */}
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-2.5">
                            <div>
                              <div className="font-semibold text-slate-900 group-hover:text-red-600 flex items-center gap-1.5 flex-wrap">
                                {item.name}
                                {item.isEssential ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    Essencial
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                    Supérfluo
                                  </span>
                                )}

                                {!isPromo && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    Sem oferta
                                  </span>
                                )}

                                {alert && (
                                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    isAlertTriggered 
                                      ? 'bg-red-100 text-red-900 border border-red-300' 
                                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                                  }`}>
                                    <Bell className="w-2.5 h-2.5" />
                                    Meta: R$ {alert.targetPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                {item.brand && <span>Marca: {item.brand}</span>}
                                <span>•</span>
                                <span>{categoryLabels[item.category]}</span>
                              </div>

                              {/* Measure & Substitutes buttons */}
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenComparison(item)}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-900 hover:border-red-300 px-2 py-0.5 rounded-md border border-slate-200 transition"
                                >
                                  <Scale className="w-3 h-3 text-red-600" />
                                  <span>Embalagem: <strong>{packageInfo.displayMeasure}</strong></span>
                                </button>

                                {hasSubstitutes && bestSub && (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedSubstituteItemId(isExpanded ? null : item.id)}
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border transition ${
                                      isExpanded
                                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                        : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                    }`}
                                  >
                                    <Lightbulb className={`w-3 h-3 ${isExpanded ? 'text-amber-200' : 'text-amber-600'}`} />
                                    <span>Substituto: -R$ {bestSub.savingsAmount.toFixed(2)} (-{bestSub.savingsPercent}%)</span>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Supermarket price cells */}
                        {activeMarkets.map((mkt) => {
                          const p = getPriceForMarket(item, mkt);
                          const isCheapest = item.cheapestMarket === mkt;

                          return (
                            <td 
                              key={mkt} 
                              className={`py-3 px-3 text-center ${isCheapest ? 'bg-red-50/60 font-bold' : ''}`}
                            >
                              <div className="text-slate-900 font-semibold">
                                R$ {p ? p.price.toFixed(2) : '-'}
                              </div>
                              {p && showUnitPrice && (
                                <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                                  R$ {calculateUnitPrice(p.price, packageInfo).shortLabel}
                                </div>
                              )}
                              {p?.isPromo && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-100 text-amber-800 mt-0.5">
                                  <Flame className="w-2.5 h-2.5 text-amber-600" />
                                  Oferta
                                </span>
                              )}
                            </td>
                          );
                        })}

                        {/* Best Price */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-block bg-red-100 text-red-900 px-2.5 py-1 rounded-lg">
                            <div className="font-extrabold text-sm text-red-600">R$ {item.lowestPrice.toFixed(2)}</div>
                            {showUnitPrice && (
                              <div className="text-[10px] font-black text-red-800">
                                R$ {bestUnitCalc.shortLabel}
                              </div>
                            )}
                            <div className="text-[10px] font-semibold text-red-700 flex items-center justify-center gap-0.5 mt-0.5">
                              <Store className="w-2.5 h-2.5" />
                              {item.cheapestMarket}
                            </div>
                          </div>
                        </td>

                        {/* Add to Rancho button */}
                        <td className="py-3 px-4 text-right">
                          {shopItem ? (
                            <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200/90 rounded-lg p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => {
                                  if (shopItem.quantity <= 1 && onRemoveItem) {
                                    onRemoveItem(shopItem.id);
                                  } else if (onUpdateQuantity) {
                                    onUpdateQuantity(shopItem.id, -1);
                                  }
                                }}
                                className="w-7 h-7 rounded bg-white text-red-600 font-black flex items-center justify-center hover:bg-red-100 transition active:scale-90"
                                title="Diminuir"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-black text-xs text-red-950 px-1.5 min-w-[22px] text-center">
                                {shopItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateQuantity) {
                                    onUpdateQuantity(shopItem.id, 1);
                                  } else {
                                    onAddToRancho(item);
                                  }
                                }}
                                className="w-7 h-7 rounded bg-red-600 text-white font-black flex items-center justify-center hover:bg-red-700 shadow-2xs transition active:scale-90"
                                title="Aumentar"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`btn-adicionar-${item.id}`}
                              type="button"
                              onClick={() => onAddToRancho(item)}
                              className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-2xs transition active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Rancho</span>
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Cheaper Substitute Comparison Row */}
                      {isExpanded && bestSub && (
                        <tr className="bg-amber-50/50 border-b border-amber-200/80 animate-in fade-in duration-200">
                          <td colSpan={activeMarkets.length + 4} className="p-4 sm:p-5">
                            <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1.5 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                      <Lightbulb className="w-3 h-3 text-amber-600" />
                                      Substituto Inteligente Recomendado
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                                    <span className="text-slate-500 line-through font-semibold">
                                      {item.name}: R$ {item.lowestPrice.toFixed(2)}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                                    <span className="font-extrabold text-slate-900 text-sm">
                                      {bestSub.substituteName}
                                    </span>
                                    <span className="font-extrabold text-red-700 text-sm bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                                      R$ {bestSub.estimatedPrice.toFixed(2)}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                    <strong>Por que compensa:</strong> {bestSub.reason}
                                  </p>
                                </div>

                                <div className="flex flex-row md:flex-col gap-2 shrink-0 self-start md:self-center">
                                  <button
                                    type="button"
                                    onClick={() => handleApplySubstitute(bestSub, item.name)}
                                    className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-xs shadow-sm transition"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Adicionar Substituto</span>
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => setExpandedSubstituteItemId(null)}
                                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
                                  >
                                    Fechar
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grounding & Web Sources footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Fontes Oficiais:</span>
            <span className="text-slate-500">Encartes, folhetos e sites consultados pela IA</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSources(!showSources)}
            className="inline-flex items-center gap-1 text-red-700 hover:text-red-800 font-semibold"
          >
            {showSources ? 'Ocultar Links' : `Ver ${sources.length} Fontes de Encartes`}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSources ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showSources && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {sources.map((source, index) => (
              <a
                key={index}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/50 transition group"
              >
                <span className="truncate font-medium text-slate-700 group-hover:text-red-900 text-[11px]">
                  {source.title}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-red-600 shrink-0 ml-1.5" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Price Alert & Favorite Modal */}
      <PriceAlertModal
        isOpen={Boolean(priceAlertModalItem)}
        onClose={() => setPriceAlertModalItem(null)}
        item={priceAlertModalItem}
        existingAlert={priceAlertModalItem ? priceAlerts[priceAlertModalItem.id] : undefined}
        onSaveAlert={handleSaveAlert}
        onRemoveAlert={handleRemoveAlert}
      />

      {/* Package Comparison Calculator Modal */}
      <PackageComparisonModal
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        initialProductName={comparisonItem?.name || 'Ex: Arroz'}
        initialAmountA={comparisonItem?.amountA || 5}
        initialUnitA={comparisonItem?.unitA || 'kg'}
        initialPriceA={comparisonItem?.priceA || 24.90}
      />

      {/* Substitutes Explorer Modal */}
      <SubstitutesExplorerModal
        isOpen={substitutesModalOpen}
        onClose={() => setSubstitutesModalOpen(false)}
        items={items}
        shoppingList={shoppingList}
        onApplySubstitute={handleApplySubstitute}
      />
    </div>
  );
};
