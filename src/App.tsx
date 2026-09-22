import React, { useState, useEffect, useMemo } from 'react';
import { 
  BudgetProfile, 
  PromotionItem, 
  ShoppingListItem, 
  SupermarketName, 
  BudgetAnalysis,
  RanchoHistoryEntry,
  UserProfile,
  PassoFundoNeighborhood
} from './types';
import { BudgetProfileBar } from './components/BudgetProfileBar';
import { PromotionsTable } from './components/PromotionsTable';
import { ProductSearchAdd } from './components/ProductSearchAdd';
import { ShoppingListSection } from './components/ShoppingListSection';
import { MarketComparisonSummary } from './components/MarketComparisonSummary';
import { SingleMarketShoppingMode } from './components/SingleMarketShoppingMode';
import { ShareRanchoModal } from './components/ShareRanchoModal';
import { BudgetAdvisorModal } from './components/BudgetAdvisorModal';
import { RanchoHistoryChart } from './components/RanchoHistoryChart';
import { PassoFundoMap } from './components/PassoFundoMap';
import { UserProfileModal } from './components/UserProfileModal';
import { RanchoJaLogo } from './components/RanchoJaLogo';
import { GoogleAuthButton } from './components/GoogleAuthButton';
import { initFirebaseAuthListener } from './utils/googleAuth';
import { PASSO_FUNDO_NEIGHBORHOODS } from './utils/passoFundoLocations';
import { ProductSubstitute } from './utils/productSubstitutes';
import { decodeRanchoFromUrl, fetchShortRancho } from './utils/shareRancho';
import { StepProgressBar, ShoppingStep } from './components/StepProgressBar';
import { BudgetStepView } from './components/BudgetStepView';
import { CompactBudgetHeader } from './components/CompactBudgetHeader';
import { DailySuggestionCard } from './components/DailySuggestionCard';
import { 
  ShoppingCart, 
  Sparkles, 
  Store, 
  Layers, 
  CheckCircle2, 
  MapPin, 
  ArrowDownCircle,
  HelpCircle,
  TrendingDown,
  LineChart as LineChartIcon,
  Compass,
  UserCheck,
  Navigation,
  Share2,
  ArrowRight,
  Banknote,
  ChevronLeft
} from 'lucide-react';

const DEFAULT_PROFILE: BudgetProfile = {
  householdType: 'solo',
  monthlyIncome: 1800,
  ranchoBudget: 450,
  cycleDays: 30,
};

const INITIAL_HISTORY: RanchoHistoryEntry[] = [
  {
    id: 'hist-1',
    monthYear: 'Mai/2026',
    date: '2026-05-28',
    totalSpent: 420.50,
    budgetLimit: 450.00,
    itemCount: 16,
    householdType: 'solo',
    stokCenterTotal: 420.50,
    atacadaoTotal: 435.20,
    zaffariTotal: 478.90,
    bourbonTotal: 495.00,
    savingsAchieved: 74.50,
    notes: 'Rancho focado no Stok Center (feira e cesta básica)',
  },
  {
    id: 'hist-2',
    monthYear: 'Jun/2026',
    date: '2026-06-25',
    totalSpent: 445.80,
    budgetLimit: 450.00,
    itemCount: 18,
    householdType: 'solo',
    stokCenterTotal: 445.80,
    atacadaoTotal: 452.00,
    zaffariTotal: 512.40,
    bourbonTotal: 530.00,
    savingsAchieved: 84.20,
    notes: 'Quase no limite, cortou refrigerante e doces supérfluos',
  },
  {
    id: 'hist-3',
    monthYear: 'Jul/2026',
    date: '2026-07-27',
    totalSpent: 398.20,
    budgetLimit: 450.00,
    itemCount: 15,
    householdType: 'solo',
    stokCenterTotal: 398.20,
    atacadaoTotal: 410.50,
    zaffariTotal: 460.00,
    bourbonTotal: 482.30,
    savingsAchieved: 84.10,
    notes: 'Aproveitou feirão de ovos e frango do Atacadão e Stok',
  },
  {
    id: 'hist-4',
    monthYear: 'Ago/2026',
    date: '2026-08-26',
    totalSpent: 438.90,
    budgetLimit: 450.00,
    itemCount: 17,
    householdType: 'solo',
    stokCenterTotal: 438.90,
    atacadaoTotal: 446.70,
    zaffariTotal: 504.10,
    bourbonTotal: 525.60,
    savingsAchieved: 86.70,
    notes: 'Compras divididas entre Stok e Atacadão Passo Fundo',
  },
  {
    id: 'hist-5',
    monthYear: 'Set/2026',
    date: '2026-09-20',
    totalSpent: 412.30,
    budgetLimit: 450.00,
    itemCount: 16,
    householdType: 'solo',
    stokCenterTotal: 412.30,
    atacadaoTotal: 425.00,
    zaffariTotal: 479.50,
    bourbonTotal: 498.90,
    savingsAchieved: 86.60,
    notes: 'Rancho econômico de setembro dentro do teto',
  },
];

export default function App() {
  // 1. Profile State with LocalStorage
  const [profile, setProfile] = useState<BudgetProfile>(() => {
    try {
      const saved = localStorage.getItem('pf_rancho_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PROFILE;
  });

  // 2. Shopping List State with LocalStorage
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(() => {
    try {
      const saved = localStorage.getItem('pf_rancho_items');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // 3. History State with LocalStorage
  const [history, setHistory] = useState<RanchoHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('pf_rancho_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_HISTORY;
  });

  // 4. User Profile & Geolocation State with Google Sync
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const savedGoogle = localStorage.getItem('ranchoja_google_user');
      if (savedGoogle) {
        const gu = JSON.parse(savedGoogle);
        return {
          id: gu.id,
          name: gu.name,
          email: gu.email,
          avatarUrl: gu.photoUrl,
          isConnectedWithGoogle: true,
          connectedAt: gu.signedInAt,
          neighborhood: 'Boqueirão',
          city: 'Passo Fundo',
          coordinates: { lat: -28.2685, lng: -52.4310 },
          locationMode: 'gps',
          radiusKm: 5,
        };
      }
      const saved = localStorage.getItem('pf_rancho_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'user-default',
      name: 'Braian Camargo',
      email: 'braian.kleber.camargo@gmail.com',
      isConnectedWithGoogle: false,
      neighborhood: 'Boqueirão',
      city: 'Passo Fundo',
      coordinates: { lat: -28.2685, lng: -52.4310 },
      locationMode: 'gps',
      connectedAt: 'Hoje',
      radiusKm: 5,
    };
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync Google Auth and Firebase Auth changes across components in realtime
  useEffect(() => {
    const unsubscribeFirebase = initFirebaseAuthListener((user) => {
      if (user) {
        setUserProfile((prev) => ({
          ...prev,
          id: user.id,
          isConnectedWithGoogle: true,
          name: user.name,
          email: user.email,
          avatarUrl: user.photoUrl,
          connectedAt: user.signedInAt,
        }));
      } else {
        setUserProfile((prev) => ({
          ...prev,
          isConnectedWithGoogle: false,
          avatarUrl: undefined,
        }));
      }
    });

    const handleAuthChange = (e: any) => {
      const user = e.detail;
      if (user) {
        setUserProfile((prev) => ({
          ...prev,
          id: user.id || prev.id,
          isConnectedWithGoogle: true,
          name: user.name,
          email: user.email,
          avatarUrl: user.photoUrl,
          connectedAt: user.signedInAt,
        }));
      } else {
        setUserProfile((prev) => ({
          ...prev,
          isConnectedWithGoogle: false,
          avatarUrl: undefined,
        }));
      }
    };

    window.addEventListener('ranchoja_auth_change', handleAuthChange);
    return () => {
      unsubscribeFirebase();
      window.removeEventListener('ranchoja_auth_change', handleAuthChange);
    };
  }, []);

  // 5. Promotions Data State
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('Carregando...');
  const [activeTab, setActiveTab] = useState<'orcamento' | 'promocoes' | 'comparador' | 'carrinho' | 'rancho' | 'mapa' | 'historico'>('orcamento');
  const [ranchoViewMode, setRanchoViewMode] = useState<'single_market' | 'comparator'>('single_market');

  // 6. Budget Advisor State
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isAnalyzingBudget, setIsAnalyzingBudget] = useState(false);
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null);

  // 7. Shared Link Import & Modal State
  const [previousSavedList, setPreviousSavedList] = useState<ShoppingListItem[] | null>(null);
  const [importedShareBanner, setImportedShareBanner] = useState<{
    count: number;
    total: number;
  } | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Read short code (?r=...) or full base64 (?share_rancho=...) from URL query parameters on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const processIncomingShareLink = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const shortCode = urlParams.get('r');
        const shareCode = urlParams.get('share_rancho');

        if (!shortCode && !shareCode) return;

        let decodedItems: ShoppingListItem[] | null = null;
        let decodedBudget: number | undefined;
        let decodedHousehold: 'solo' | 'casal' | undefined;

        // 1. Try resolving short link code from server first
        if (shortCode) {
          const shortData = await fetchShortRancho(shortCode);
          if (shortData && Array.isArray(shortData.items) && shortData.items.length > 0) {
            decodedItems = shortData.items;
            decodedBudget = shortData.budget;
            decodedHousehold = shortData.household;
            if (shortData.cityName) {
              setUserProfile((prev) => ({ ...prev, city: shortData.cityName }));
            }
          }
        }

        // 2. Fallback to base64 encoding parameter if no short code data
        if (!decodedItems && shareCode) {
          const decoded = decodeRanchoFromUrl(shareCode);
          if (decoded && decoded.items.length > 0) {
            decodedItems = decoded.items;
            decodedBudget = decoded.budget;
            decodedHousehold = decoded.household;
          }
        }

        if (decodedItems && decodedItems.length > 0) {
          // Backup previous local items if any
          const currentSaved = localStorage.getItem('pf_rancho_items');
          if (currentSaved) {
            try {
              const parsed = JSON.parse(currentSaved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setPreviousSavedList(parsed);
              }
            } catch {}
          }

          setShoppingList(decodedItems);
          if (decodedBudget && decodedBudget > 0) {
            setProfile((p) => ({ ...p, ranchoBudget: decodedBudget! }));
          }
          if (decodedHousehold) {
            setProfile((p) => ({ ...p, householdType: decodedHousehold! }));
          }

          const total = decodedItems.reduce(
            (acc, i) => acc + (i.totalPrice || (i.unitPrice * i.quantity) || 0),
            0
          );
          setImportedShareBanner({ count: decodedItems.length, total });
          setActiveTab('carrinho');

          // Clean up URL without reloading the page
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } catch (e) {
        console.error('Erro ao ler lista do rancho na URL:', e);
      }
    };

    processIncomingShareLink();
  }, []);

  const handleRestorePreviousList = () => {
    if (previousSavedList) {
      setShoppingList(previousSavedList);
      setPreviousSavedList(null);
      setImportedShareBanner(null);
    }
  };

  // Sync user profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pf_rancho_user_profile', JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  // Sync profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pf_rancho_profile', JSON.stringify(profile));
    } catch {}
  }, [profile]);

  // Sync shopping list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pf_rancho_items', JSON.stringify(shoppingList));
    } catch {}
  }, [shoppingList]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pf_rancho_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  // Fetch promotions on initial load or when city changes
  const loadPromotions = async (forceRefresh = false, cityOverride?: string) => {
    setIsLoadingPromotions(true);
    try {
      const city = cityOverride || userProfile.city || 'Passo Fundo';
      const params = new URLSearchParams();
      if (forceRefresh) params.set('refresh', 'true');
      params.set('city', city);
      const url = `/api/promotions?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao carregar dados de promoções.');
      const data = await res.json();
      if (data.items) {
        setPromotions(data.items);
        setLastUpdated(data.updatedAt || new Date().toLocaleTimeString('pt-BR'));
        setSources(data.sources || []);
      }
    } catch (err) {
      console.error('Failed to load promotions:', err);
    } finally {
      setIsLoadingPromotions(false);
    }
  };

  useEffect(() => {
    loadPromotions(false, userProfile.city);
  }, [userProfile.city]);

  // Compute total current cost of the shopping list
  const totalRancho = useMemo(() => {
    return shoppingList.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [shoppingList]);

  // Handle adding an item to the shopping list
  const handleAddToRancho = (promoItem: PromotionItem, supermarket?: SupermarketName) => {
    setShoppingList((prev) => {
      const existing = prev.find((p) => p.name.toLowerCase() === promoItem.name.toLowerCase());
      
      const pricesMap: Partial<Record<SupermarketName, number>> = {};
      promoItem.prices.forEach((p) => {
        pricesMap[p.supermarket] = p.price;
      });

      const effectivePrice = supermarket && pricesMap[supermarket] !== undefined
        ? pricesMap[supermarket]!
        : promoItem.lowestPrice;

      if (existing) {
        // Increment quantity
        return prev.map((item) => {
          if (item.id === existing.id) {
            const newQty = item.quantity + 1;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            };
          }
          return item;
        });
      }

      // Add new
      const newItem: ShoppingListItem = {
        id: `shop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: promoItem.name,
        category: promoItem.category,
        quantity: 1,
        unit: promoItem.unit,
        brand: promoItem.brand,
        prices: pricesMap,
        selectedMarket: supermarket || 'best',
        unitPrice: effectivePrice,
        totalPrice: effectivePrice * 1,
        isEssential: promoItem.isEssential,
        priority: promoItem.isEssential ? 'essencial' : 'superfluo',
        isBought: false,
      };

      return [newItem, ...prev];
    });
  };

  // Add custom item created directly in shopping mode
  const handleAddCustomShoppingItem = (customItem: ShoppingListItem) => {
    setShoppingList((prev) => [customItem, ...prev]);
  };

  // Add substitute directly or replace original in Rancho
  const handleAddSubstituteToRancho = (sub: ProductSubstitute, replaceOriginalName?: string) => {
    setShoppingList((prev) => {
      let filtered = prev;
      if (replaceOriginalName) {
        const cleanName = replaceOriginalName.toLowerCase().split('(')[0].trim();
        const hasExisting = prev.some((item) => item.name.toLowerCase().includes(cleanName));
        if (hasExisting) {
          filtered = prev.filter((item) => !item.name.toLowerCase().includes(cleanName));
        }
      }

      const newItem: ShoppingListItem = {
        id: `shop-sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: sub.substituteName,
        category: (sub.category as any) || 'cesta_basica',
        quantity: 1,
        unit: sub.substituteUnit,
        brand: sub.substituteBrand,
        prices: {
          [sub.market]: sub.estimatedPrice,
        },
        selectedMarket: sub.market,
        unitPrice: sub.estimatedPrice,
        totalPrice: sub.estimatedPrice,
        isEssential: true,
        priority: 'essencial',
        isBought: false,
      };

      return [newItem, ...filtered];
    });
  };

  const handleSwapSubstituteInRancho = (originalId: string, sub: ProductSubstitute) => {
    setShoppingList((prev) =>
      prev.map((item) => {
        if (item.id === originalId) {
          return {
            ...item,
            name: sub.substituteName,
            brand: sub.substituteBrand,
            unit: sub.substituteUnit,
            unitPrice: sub.estimatedPrice,
            totalPrice: Number((sub.estimatedPrice * item.quantity).toFixed(2)),
            selectedMarket: sub.market,
            prices: {
              ...item.prices,
              [sub.market]: sub.estimatedPrice,
            },
          };
        }
        return item;
      })
    );
  };

  // Quantity updates
  const handleUpdateQuantity = (id: string, delta: number) => {
    setShoppingList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return {
            ...item,
            quantity: newQty,
            totalPrice: Number((item.unitPrice * newQty).toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const handleSetQuantity = (id: string, qty: number) => {
    setShoppingList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, qty);
          return {
            ...item,
            quantity: newQty,
            totalPrice: Number((item.unitPrice * newQty).toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  // Change selected market for item
  const handleChangeMarket = (id: string, market: 'best' | SupermarketName) => {
    setShoppingList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          let price = item.unitPrice;
          if (market === 'best') {
            const vals = Object.values(item.prices).filter((v) => typeof v === 'number' && v > 0) as number[];
            price = vals.length > 0 ? Math.min(...vals) : item.unitPrice;
          } else if (item.prices[market]) {
            price = item.prices[market] as number;
          }

          return {
            ...item,
            selectedMarket: market,
            unitPrice: price,
            totalPrice: Number((price * item.quantity).toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleBought = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isBought: !item.isBought } : item))
    );
  };

  const handleClearList = () => {
    if (confirm('Tem certeza que deseja esvaziar sua lista de rancho?')) {
      setShoppingList([]);
    }
  };

  // Run AI Budget Advisor
  const runBudgetAdvisor = async () => {
    if (shoppingList.length === 0) {
      alert('Adicione pelo menos 1 item ao seu rancho antes de rodar a análise financeira.');
      return;
    }

    setIsAdvisorOpen(true);
    setIsAnalyzingBudget(true);

    try {
      const res = await fetch('/api/budget-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...profile,
            familyMembers: profile.familyMembers || (profile.householdType === 'casal' ? 2 : 1),
          },
          city: userProfile.city || 'Passo Fundo',
          items: shoppingList.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
            isEssential: i.isEssential,
            selectedMarket: i.selectedMarket,
          })),
        }),
      });

      if (!res.ok) throw new Error('Falha ao rodar consultor financeiro.');
      const data = await res.json();
      setBudgetAnalysis({
        status: data.status,
        ranchoBudget: profile.ranchoBudget,
        totalCost: totalRancho,
        remainingBalance: profile.ranchoBudget - totalRancho,
        percentageUsed: Math.min(Math.round((totalRancho / profile.ranchoBudget) * 100), 100),
        canBuyCount: data.canBuyItems?.length || 0,
        cannotBuyCount: data.cannotBuyItems?.length || 0,
        canBuyItems: data.canBuyItems || [],
        cannotBuyItems: data.cannotBuyItems || [],
        recommendations: data.recommendations || [],
        projectedDays: profile.cycleDays,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingBudget(false);
    }
  };

  // Remove items flagged by the advisor
  const handleApplyCuts = (itemNamesToRemove: string[]) => {
    setShoppingList((prev) =>
      prev.filter((item) => !itemNamesToRemove.some((name) => item.name.toLowerCase().includes(name.toLowerCase())))
    );
  };

  // Save current rancho into history
  const handleSaveCurrentRancho = (monthYear: string, notes?: string) => {
    let stok = 0;
    let atacadao = 0;
    let zaffari = 0;
    let bourbon = 0;

    shoppingList.forEach((item) => {
      const p = item.prices || {};
      stok += (p['Stock Center'] || item.unitPrice) * item.quantity;
      atacadao += (p['Atacadão'] || item.unitPrice) * item.quantity;
      zaffari += (p['Zaffari'] || item.unitPrice) * item.quantity;
      bourbon += (p['Bourbon'] || item.unitPrice) * item.quantity;
    });

    const maxCost = Math.max(stok, atacadao, zaffari, bourbon, totalRancho);
    const savings = Math.max(0, maxCost - totalRancho);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    setHistory((prev) => {
      const existingIdx = prev.findIndex(
        (h) => h.monthYear.toLowerCase() === monthYear.toLowerCase()
      );
      const newEntry: RanchoHistoryEntry = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `hist-${Date.now()}`,
        monthYear,
        date: dateStr,
        totalSpent: Number(totalRancho.toFixed(2)),
        budgetLimit: profile.ranchoBudget,
        itemCount: shoppingList.length,
        householdType: profile.householdType,
        stokCenterTotal: Number(stok.toFixed(2)),
        atacadaoTotal: Number(atacadao.toFixed(2)),
        zaffariTotal: Number(zaffari.toFixed(2)),
        bourbonTotal: Number(bourbon.toFixed(2)),
        savingsAchieved: Number(savings.toFixed(2)),
        notes: notes || undefined,
      };

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newEntry;
        return updated;
      }
      return [...prev, newEntry];
    });
  };

  const handleDeleteHistoryEntry = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 text-slate-800 relative flex flex-col shadow-2xl sm:border-x sm:border-slate-200 pb-28">
      {/* Top Application Header - Mobile Native Style */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <RanchoJaLogo size="sm" showText={true} />
            <div className="hidden sm:block border-l border-slate-200 pl-2">
              <p className="text-[10px] text-slate-500 leading-none">
                {userProfile.city || 'Sua Região'}
              </p>
            </div>
          </div>

          {/* Quick Header actions: Google Login & Location */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="btn-abrir-perfil-usuario"
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1 py-1 px-2 rounded-full border border-slate-200 hover:border-emerald-300 bg-slate-50 active:bg-slate-100 text-slate-700 text-[11px] font-bold transition active:scale-95"
              title="Localização e raio de mercados"
            >
              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[85px] text-[11px]">
                {userProfile.city ? userProfile.city : (userProfile.neighborhood || 'Passo Fundo')}
              </span>
            </button>

            {/* Google Sign In / User Status Button */}
            <GoogleAuthButton onOpenProfile={() => setIsProfileModalOpen(true)} variant="header" />
          </div>
        </div>
      </header>

      {/* Main Content Container - Optimized Mobile Width & Spacing */}
      <main className="px-3 pt-3 flex-1">
        {/* Step Progress Bar (4 Etapas Principais) */}
        <StepProgressBar
          currentStep={
            activeTab === 'orcamento' ? 'orcamento' :
            activeTab === 'promocoes' ? 'promocoes' :
            activeTab === 'comparador' ? 'comparador' :
            'carrinho'
          }
          onSelectStep={(step) => {
            setActiveTab(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          itemsCount={shoppingList.length}
          totalRancho={totalRancho}
          budgetLimit={profile.ranchoBudget}
        />

        {/* Banner if loaded from a share link */}
        {importedShareBanner && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span>Lista de Rancho Compartilhada Carregada!</span>
                  <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded-full text-emerald-200">Via Link</span>
                </h4>
                <p className="text-[11px] text-emerald-200 mt-0.5">
                  Importamos {importedShareBanner.count} {importedShareBanner.count === 1 ? 'item' : 'itens'} (Total estimado: R$ {importedShareBanner.total.toFixed(2)}).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {previousSavedList && previousSavedList.length > 0 && (
                <button
                  type="button"
                  onClick={handleRestorePreviousList}
                  className="px-2.5 py-1 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-[11px] font-semibold transition"
                >
                  Restaurar ({previousSavedList.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setImportedShareBanner(null)}
                className="px-3 py-1 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-[11px] shadow-xs transition"
              >
                OK, Manter
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 1: Planejamento Orçamentário */}
        {activeTab === 'orcamento' && (
          <BudgetStepView
            profile={profile}
            onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
            totalRancho={totalRancho}
            onNextStep={() => {
              setActiveTab('promocoes');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAdvisor={runBudgetAdvisor}
            isAnalyzingAdvisor={isAnalyzingBudget}
          />
        )}

        {/* ETAPA 2: Ofertas & Catálogo de Produtos */}
        {activeTab === 'promocoes' && (
          <div className="space-y-3">
            <CompactBudgetHeader
              totalRancho={totalRancho}
              budgetLimit={profile.ranchoBudget}
              onAdjustBudget={() => {
                setActiveTab('orcamento');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Card: Sugestão do Dia com base no histórico de compras e maior economia */}
            <DailySuggestionCard
              promotions={promotions}
              shoppingList={shoppingList}
              history={history}
              onAddToRancho={handleAddToRancho}
              cityName={userProfile.city || 'Passo Fundo'}
            />

            <ProductSearchAdd 
              onAddCustomProduct={handleAddToRancho} 
              cityName={userProfile.city || 'Passo Fundo'}
            />

            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-2 text-xs text-emerald-950">
              <div className="flex items-center gap-1.5 min-w-0">
                <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  Bairro <strong>{userProfile.neighborhood}</strong> • Mercados mais próximos priorizados
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('mapa')}
                className="font-bold text-emerald-700 hover:text-emerald-900 underline whitespace-nowrap text-[11px] shrink-0"
              >
                Ver Mapa →
              </button>
            </div>

            <PromotionsTable
              items={promotions}
              isLoading={isLoadingPromotions}
              onRefresh={() => loadPromotions(true)}
              lastUpdated={lastUpdated}
              shoppingList={shoppingList}
              onAddToRancho={handleAddToRancho}
              onAddSubstituteToRancho={handleAddSubstituteToRancho}
              sources={sources}
              userProfile={userProfile}
            />

            <div className="pt-3 pb-6 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('orcamento');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                ← Etapa 1: Teto
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('comparador');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <span>Avançar: Comparar Mercados (Etapa 3)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 3: Comparador de Preços dos Mercados */}
        {activeTab === 'comparador' && (
          <div className="space-y-3.5">
            <CompactBudgetHeader
              totalRancho={totalRancho}
              budgetLimit={profile.ranchoBudget}
              onAdjustBudget={() => {
                setActiveTab('orcamento');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-0.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Etapa 3 de 4 • Onde comprar mais barato</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Comparativo de Preços em {userProfile.city || 'Passo Fundo'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Veja onde a sua lista de {shoppingList.length} {shoppingList.length === 1 ? 'item' : 'itens'} fica mais barata no total.
              </p>
            </div>

            {shoppingList.length === 0 ? (
              <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Sua lista está vazia</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Adicione produtos na Etapa 2 para ver a comparação de preços entre Stock Center, Atacadão, Boqueirão e outros.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('promocoes');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                >
                  ← Ir para as Ofertas (Etapa 2)
                </button>
              </div>
            ) : (
              <>
                <MarketComparisonSummary
                  items={shoppingList}
                  budgetLimit={profile.ranchoBudget}
                />

                <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Deseja ver a localização dos mercados no mapa?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('mapa')}
                    className="font-bold text-emerald-700 hover:underline shrink-0"
                  >
                    Ver no Mapa →
                  </button>
                </div>
              </>
            )}

            <div className="pt-2 pb-6 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('promocoes');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                ← Etapa 2: Produtos
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('carrinho');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <span>Ir para as Compras (Etapa 4)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 4: No Mercado & Carrinho */}
        {(activeTab === 'carrinho' || activeTab === 'rancho') && (
          <div className="space-y-3.5">
            {/* Top Bar with 'Compartilhar Lista' button */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Etapa 4 de 4 • No Mercado
                    </h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {shoppingList.length} {shoppingList.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {shoppingList.length > 0
                      ? `Total estimado: R$ ${totalRancho.toFixed(2)} • Teto: R$ ${profile.ranchoBudget.toFixed(2)}`
                      : 'Adicione itens para calcular custos e acompanhar na gôndola'}
                  </p>
                </div>
              </div>

              {/* Botão de Compartilhar Lista */}
              <button
                id="btn-compartilhar-lista-topo"
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                disabled={shoppingList.length === 0}
                className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-xs active:scale-95 shrink-0 ${
                  shoppingList.length === 0
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/30'
                }`}
                title={
                  shoppingList.length === 0
                    ? 'Adicione itens à lista para compartilhar'
                    : 'Gerar link encurtado para importar em outro navegador'
                }
              >
                <Share2 className="w-4 h-4 text-emerald-100" />
                <span>Compartilhar Lista</span>
                <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded text-white">
                  Link
                </span>
              </button>
            </div>

            <SingleMarketShoppingMode
              promotions={promotions}
              shoppingList={shoppingList}
              onAddToRancho={handleAddToRancho}
              onAddCustomShoppingItem={handleAddCustomShoppingItem}
              onUpdateQuantity={handleUpdateQuantity}
              onSetQuantity={handleSetQuantity}
              onRemoveItem={handleRemoveItem}
              onToggleBought={handleToggleBought}
              onChangeMarket={handleChangeMarket}
              onClearList={handleClearList}
              budgetLimit={profile.ranchoBudget}
              monthlyIncome={profile.monthlyIncome}
              familyMembers={profile.familyMembers || (profile.householdType === 'casal' ? 2 : 1)}
              cityName={userProfile.city || 'Passo Fundo'}
              availableMarkets={[
                'Stock Center',
                'Atacadão',
                'Supermercado Boqueirão',
                'Zaffari',
                'Bourbon',
                'Coqueiros',
                'Carrefour',
                'Assaí'
              ]}
              onSaveToHistory={() => {
                handleSaveCurrentRancho(
                  new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                );
                setActiveTab('historico');
              }}
              onSwitchToComparator={() => setActiveTab('comparador')}
              onOpenShareModal={() => setIsShareModalOpen(true)}
            />

            <div className="pt-2 pb-6 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('comparador');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                ← Etapa 3: Comparar
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSaveCurrentRancho(
                    new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                  );
                  setActiveTab('historico');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <span>Finalizar & Ver Histórico</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          </div>
        )}

        {/* View Extra: Mapa */}
        {activeTab === 'mapa' && (
          <div className="space-y-4 pb-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('comparador')}
                className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Comparador (Etapa 3)</span>
              </button>
            </div>

            <PassoFundoMap
              userProfile={userProfile}
              onUpdateNeighborhood={(neighborhood: PassoFundoNeighborhood) => {
                const nh = PASSO_FUNDO_NEIGHBORHOODS.find((n) => n.neighborhood === neighborhood);
                setUserProfile((prev) => ({
                  ...prev,
                  neighborhood,
                  coordinates: nh ? { lat: nh.lat, lng: nh.lng } : prev.coordinates,
                }));
              }}
            />
          </div>
        )}

        {/* View Extra: Histórico */}
        {activeTab === 'historico' && (
          <div className="space-y-4 pb-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('carrinho')}
                className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Carrinho (Etapa 4)</span>
              </button>
            </div>

            <RanchoHistoryChart
              history={history}
              onSaveCurrentRancho={handleSaveCurrentRancho}
              onDeleteEntry={handleDeleteHistoryEntry}
              currentRanchoTotal={totalRancho}
              currentBudgetLimit={profile.ranchoBudget}
              currentItemsCount={shoppingList.length}
            />
          </div>
        )}
      </main>

      {/* Floating Indicator when on 'promocoes' with items */}
      {activeTab === 'promocoes' && shoppingList.length > 0 && (
        <div className="fixed bottom-[64px] left-0 right-0 z-30 px-3 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              id="btn-floating-ver-rancho"
              type="button"
              onClick={() => { setActiveTab('comparador'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white flex items-center justify-between shadow-xl border border-slate-700/60 active:scale-98 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                  {shoppingList.length}
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-bold text-white">
                    Rancho: R$ {totalRancho.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    {profile.ranchoBudget > 0 ? `${Math.round((totalRancho / profile.ranchoBudget) * 100)}% do teto mensal` : 'Toque para comparar mercados'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-white/10 px-2 py-1 rounded-xl">
                <span>Comparar (Etapa 3)</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Navigation Bar (4 Etapas + Histórico) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg pb-[calc(env(safe-area-inset-bottom,0px)+4px)] pt-1 px-1">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-0.5">
          {/* 1. Teto / Orçamento */}
          <button
            id="mobile-nav-orcamento"
            type="button"
            onClick={() => { setActiveTab('orcamento'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`min-h-[46px] flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'orcamento'
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-semibold'
            }`}
          >
            <Banknote className={`w-5 h-5 ${activeTab === 'orcamento' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">1. Teto</span>
          </button>

          {/* 2. Ofertas & Produtos */}
          <button
            id="mobile-nav-promocoes"
            type="button"
            onClick={() => { setActiveTab('promocoes'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`min-h-[46px] flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'promocoes'
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-semibold'
            }`}
          >
            <Store className={`w-5 h-5 ${activeTab === 'promocoes' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">2. Ofertas</span>
          </button>

          {/* 3. Comparador Multi-Mercados */}
          <button
            id="mobile-nav-comparador"
            type="button"
            onClick={() => { setActiveTab('comparador'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`min-h-[46px] flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'comparador'
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-semibold'
            }`}
          >
            <Layers className={`w-5 h-5 ${activeTab === 'comparador' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">3. Comparar</span>
          </button>

          {/* 4. No Mercado / Carrinho */}
          <button
            id="mobile-nav-carrinho"
            type="button"
            onClick={() => { setActiveTab('carrinho'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`min-h-[46px] relative flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'carrinho' || activeTab === 'rancho'
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-semibold'
            }`}
          >
            <div className="relative">
              <ShoppingCart className={`w-5 h-5 ${activeTab === 'carrinho' || activeTab === 'rancho' ? 'stroke-[2.5]' : ''}`} />
              {shoppingList.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-emerald-600 text-white font-black text-[9px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 shadow-xs animate-in zoom-in">
                  {shoppingList.length}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">4. Carrinho</span>
          </button>

          {/* 5. Histórico */}
          <button
            id="mobile-nav-historico"
            type="button"
            onClick={() => { setActiveTab('historico'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`min-h-[46px] flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'historico'
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-semibold'
            }`}
          >
            <LineChartIcon className={`w-5 h-5 ${activeTab === 'historico' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">Histórico</span>
          </button>
        </div>
      </nav>

      {/* 5. Budget Advisor Modal ("O que pode e não pode comprar") */}
      <BudgetAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        analysis={budgetAnalysis}
        isLoading={isAnalyzingBudget}
        onApplyCuts={handleApplyCuts}
      />

      {/* 6. User Profile & Passo Fundo Geolocation Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onUpdateProfile={(updated: UserProfile) => setUserProfile(updated)}
      />

      {/* 7. Share Rancho Modal with Shortened Link */}
      <ShareRanchoModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        items={shoppingList}
        budgetLimit={profile.ranchoBudget}
        householdType={profile.householdType}
        neighborhood={userProfile.neighborhood || userProfile.city || 'Passo Fundo - RS'}
        cityName={userProfile.city || 'Passo Fundo'}
      />
    </div>
  );
}
