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
import { PASSO_FUNDO_STORES, calculateDistanceKm } from '../utils/passoFundoLocations';
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

interface PromotionsTableProps {
  items: PromotionItem[];
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: string;
  shoppingList: ShoppingListItem[];
  onAddToRancho: (item: PromotionItem) => void;
  onAddSubstituteToRancho?: (sub: ProductSubstitute, replaceOriginalName?: string) => void;
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
  onAddSubstituteToRancho,
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

  // User location & supermarket distances
  const userLat = userProfile?.coordinates?.lat ?? -28.2685;
  const userLng = userProfile?.coordinates?.lng ?? -52.4310;
  const userLocationLabel = userProfile?.city 
    ? `${userProfile.city} (${userProfile.neighborhood})` 
    : (userProfile?.neighborhood || 'Boqueirão');

  // Calculate distance to closest branch of each supermarket chain
  const marketDistances = useMemo(() => {
    const map: Record<SupermarketName, { distanceKm: number; etaMinutes: number; address: string; name: string }> = {
      'Stock Center': { distanceKm: 99, etaMinutes: 99, address: '', name: '' },
      'Supermercado Boqueirão': { distanceKm: 99, etaMinutes: 99, address: '', name: '' },
      'Atacadão': { distanceKm: 99, etaMinutes: 99, address: '', name: '' },
      'Zaffari': { distanceKm: 99, etaMinutes: 99, address: '', name: '' },
      'Bourbon': { distanceKm: 99, etaMinutes: 99, address: '', name: '' },
      'Coqueiros': { distanceKm: 99, etaMinutes: 99, address: '', name: '' },
    };

    PASSO_FUNDO_STORES.forEach((store) => {
      const d = calculateDistanceKm(userLat, userLng, store.lat, store.lng);
      const chain = store.chain;
      if (d < map[chain].distanceKm) {
        map[chain] = {
          distanceKm: d,
          etaMinutes: Math.max(2, Math.round((d / 25) * 60)),
          address: store.address,
          name: store.name,
        };
      }
    });

    return map;
  }, [userLat, userLng]);

  const allMarkets: SupermarketName[] = [
    'Stock Center',
    'Supermercado Boqueirão',
    'Atacadão',
    'Zaffari',
    'Bourbon',
    'Coqueiros',
  ];

  const activeMarkets = useMemo(() => {
    if (!onlyNearby) return allMarkets;
    const threshold = userProfile?.radiusKm || 5.0;
    const filtered = allMarkets.filter((m) => marketDistances[m].distanceKm <= threshold);
    return filtered.length > 0 ? filtered : allMarkets.slice(0, 3);
  }, [onlyNearby, marketDistances, userProfile?.radiusKm]);

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

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (onlyEssentials && !item.isEssential) {
      return false;
    }
    if (onlyPromos) {
      const hasPromo = item.prices.some((p) => p.isPromo);
      if (!hasPromo) return false;
    }
    if (onlySubstitutes) {
      const subs = getSubstitutesForProduct(item);
      if (subs.length === 0) return false;
    }
    if (onlyFavorites) {
      if (!priceAlerts[item.id]) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchBrand = item.brand?.toLowerCase().includes(q);
      const matchCategory = categoryLabels[item.category]?.toLowerCase().includes(q);
      return matchName || matchBrand || matchCategory;
    }
    return true;
  });

  const isItemInRancho = (itemName: string) => {
    return shoppingList.some((s) => s.name.toLowerCase() === itemName.toLowerCase());
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
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
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
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
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
          <div className="mt-4 p-4 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-emerald-700 text-white shadow-md border border-amber-300/40 animate-in fade-in slide-in-from-top-2 duration-200">
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
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                R$ {alert.currentLowestPrice.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              no <strong>{alert.cheapestMarket}</strong> • Sua meta era R$ {alert.targetPrice.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-emerald-800 font-bold">
                              Economia: R$ {(alert.targetPrice - alert.currentLowestPrice).toFixed(2)} abaixo da meta
                            </span>
                            {itemObj && (
                              <button
                                type="button"
                                onClick={() => onAddToRancho(itemObj)}
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                                  isAdded 
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                }`}
                              >
                                {isAdded ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3" />}
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

        {/* Filter Controls */}
        <div className="mt-5 flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-busca-produtos"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar arroz, feijão, café, ovos, leite, frango..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Quick toggle pills - scrollable row for mobile thumbs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar -mx-1 px-1">

            {/* Favorite Filter Pill */}
            <button
              id="btn-toggle-favoritos"
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition border ${
                onlyFavorites
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/30'
                  : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
              }`}
              title="Filtrar produtos favoritados com alerta de preço"
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white text-white' : 'fill-amber-500 text-amber-500'}`} />
              <span>Favoritos & Alertas ({activeCount})</span>
              {triggeredAlerts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>

            {/* Substitutes filter pill */}
            <button
              id="btn-toggle-substitutos"
              type="button"
              onClick={() => setOnlySubstitutes(!onlySubstitutes)}
              className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition border ${
                onlySubstitutes
                  ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                  : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Substitutos ({itemsWithSubstitutesCount})</span>
            </button>

            {/* Unit price toggle */}
            <button
              id="btn-toggle-preco-medida"
              type="button"
              onClick={() => setShowUnitPrice(!showUnitPrice)}
              className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition border ${
                showUnitPrice
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Scale className={`w-3.5 h-3.5 ${showUnitPrice ? 'text-emerald-400' : 'text-slate-500'}`} />
              R$/Kg / Litro
            </button>

            {/* Package comparison modal button */}
            <button
              id="btn-abrir-comparador-embalagens"
              type="button"
              onClick={() => handleOpenComparison()}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition border bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Comparador
            </button>

            {/* Proximity filter button */}
            <button
              id="btn-filtrar-proximos-tabela"
              type="button"
              onClick={() => setOnlyNearby(!onlyNearby)}
              className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition border ${
                onlyNearby
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400/30'
                  : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{onlyNearby ? `Perto (${userProfile?.radiusKm || 5}km)` : 'Só Próximos'}</span>
            </button>
          </div>
        </div>

        {/* Location reference info */}
        <div className="mt-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Local de Referência: <strong className="text-slate-900">{userLocationLabel}</strong>
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Mercado mais perto: <strong className="text-emerald-700">
              {allMarkets.sort((a,b) => marketDistances[a].distanceKm - marketDistances[b].distanceKm)[0]} 
              {' '}({marketDistances[allMarkets.sort((a,b) => marketDistances[a].distanceKm - marketDistances[b].distanceKm)[0]].distanceKm.toFixed(1)} km)
            </strong>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todas as Categorias ({items.length})
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const count = items.filter((i) => i.category === key).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition ${
                  selectedCategory === key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOBILE-FIRST CARDS VIEW (Optimized for touchscreens & smartphones) */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="p-3 sm:p-5">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="font-medium text-slate-700">Nenhum produto encontrado com os filtros atuais.</p>
              <p className="text-xs mt-1">Limpe a busca ou ative todas as categorias.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredItems.map((item) => {
                const alreadyAdded = isItemInRancho(item.name);
                const packageInfo = extractProductPackageInfo(item.name, item.unit);
                const bestUnitCalc = calculateUnitPrice(item.lowestPrice, packageInfo);
                const substitutes = getSubstitutesForProduct(item);
                const bestSub = substitutes[0] || null;
                const isPromo = item.prices.some((p) => p.isPromo);
                const alert = priceAlerts[item.id];
                const isAlertTriggered = alert && item.lowestPrice <= alert.targetPrice;

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
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.brand ? `Marca: ${item.brand} • ` : ''}{categoryLabels[item.category]} • {item.unit}
                        </p>
                      </div>

                      {/* Alert Trigger Badge */}
                      {alert && (
                        <div className={`mt-2 p-1.5 rounded-lg text-[11px] font-bold flex items-center justify-between ${
                          isAlertTriggered
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}>
                          <div className="flex items-center gap-1">
                            <Bell className="w-3 h-3 text-amber-600" />
                            <span>Meta salva: <strong>R$ {alert.targetPrice.toFixed(2)}</strong></span>
                          </div>
                          {isAlertTriggered && (
                            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black">
                              Atingida!
                            </span>
                          )}
                        </div>
                      )}

                      {/* Main Price & Lowest Market Card */}
                      <div className="mt-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                            Melhor Preço
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-black text-xl text-emerald-950">
                              R$ {item.lowestPrice.toFixed(2)}
                            </span>
                            {showUnitPrice && (
                              <span className="text-xs font-bold text-emerald-700">
                                R$ {bestUnitCalc.shortLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold shadow-2xs">
                            <Store className="w-3 h-3" />
                            {item.cheapestMarket}
                          </span>
                          {item.savingsAmount > 0 && (
                            <span className="text-[10px] font-bold text-emerald-800 block mt-0.5">
                              Economia de R$ {item.savingsAmount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comparison Prices across all active supermarkets */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Nos Mercados:
                        </span>
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          {activeMarkets.map((mkt) => {
                            const p = getPriceForMarket(item, mkt);
                            const isCheapest = item.cheapestMarket === mkt;
                            return (
                              <div 
                                key={mkt}
                                className={`p-1.5 rounded-lg flex items-center justify-between ${
                                  isCheapest ? 'bg-emerald-100/70 font-bold text-emerald-950' : 'bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span className="truncate pr-1">{mkt}:</span>
                                <span className="font-bold shrink-0">{p ? `R$ ${p.price.toFixed(2)}` : '-'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Substitute Recommendation Pill */}
                      {bestSub && (
                        <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1 text-[11px]">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                              Substituto: {bestSub.substituteName}
                            </span>
                            <span className="font-black text-emerald-800 text-[11px]">
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

                    {/* Bottom Action: Big Touch-Friendly Button for Mobile */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenComparison(item)}
                        className="min-h-[44px] px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition"
                        title="Calcular preço por medida"
                      >
                        <Scale className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Medida</span>
                      </button>

                      <button
                        id={`btn-adicionar-${item.id}`}
                        type="button"
                        onClick={() => onAddToRancho(item)}
                        className={`min-h-[44px] flex-1 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 active:scale-98 shadow-sm ${
                          alreadyAdded
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {alreadyAdded ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-700" />
                            <span>Já no Rancho</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Adicionar ao Rancho</span>
                          </>
                        )}
                      </button>
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
                    <div className="text-[10px] text-emerald-700 font-semibold lowercase">
                      com cálculo de R$/kg ou un
                    </div>
                  )}
                </th>
                {activeMarkets.map((mkt) => {
                  const info = marketDistances[mkt];
                  const sortedByDist = [...allMarkets].sort((a,b) => marketDistances[a].distanceKm - marketDistances[b].distanceKm);
                  const isNearest = mkt === sortedByDist[0];
                  return (
                    <th key={mkt} className="py-3 px-3 text-center min-w-[115px]">
                      <div className="font-bold text-slate-900 flex items-center justify-center gap-1">
                        <span>{mkt}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isNearest 
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs' 
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
                    <div className="text-[10px] text-emerald-700 font-bold lowercase">
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
                  <td colSpan={activeMarkets.length + 4} className="py-12 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-medium text-slate-700">Nenhum produto encontrado com os filtros atuais.</p>
                      <p className="text-xs">Tente limpar os termos de busca ou selecionar outra categoria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const alreadyAdded = isItemInRancho(item.name);
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
                              <div className="font-semibold text-slate-900 group-hover:text-emerald-950 flex items-center gap-1.5 flex-wrap">
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
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
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
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 px-2 py-0.5 rounded-md border border-slate-200 transition"
                                >
                                  <Scale className="w-3 h-3 text-emerald-600" />
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
                              className={`py-3 px-3 text-center ${isCheapest ? 'bg-emerald-50/60 font-bold' : ''}`}
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
                          <div className="inline-block bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg">
                            <div className="font-extrabold text-sm">R$ {item.lowestPrice.toFixed(2)}</div>
                            {showUnitPrice && (
                              <div className="text-[10px] font-black text-emerald-800">
                                R$ {bestUnitCalc.shortLabel}
                              </div>
                            )}
                            <div className="text-[10px] font-semibold text-emerald-700 flex items-center justify-center gap-0.5 mt-0.5">
                              <Store className="w-2.5 h-2.5" />
                              {item.cheapestMarket}
                            </div>
                          </div>
                        </td>

                        {/* Add to Rancho button */}
                        <td className="py-3 px-4 text-right">
                          <button
                            id={`btn-adicionar-${item.id}`}
                            type="button"
                            onClick={() => onAddToRancho(item)}
                            className={`min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              alreadyAdded
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                            }`}
                          >
                            {alreadyAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>No Rancho</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Rancho</span>
                              </>
                            )}
                          </button>
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
                                    <span className="font-extrabold text-emerald-700 text-sm bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
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
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
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
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
              >
                <span className="truncate font-medium text-slate-700 group-hover:text-emerald-900 text-[11px]">
                  {source.title}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-1.5" />
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
