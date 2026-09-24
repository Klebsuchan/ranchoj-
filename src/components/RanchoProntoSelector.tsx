import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Store, 
  DollarSign, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  Navigation, 
  TrendingDown, 
  Layers, 
  ShoppingCart, 
  Info, 
  Wheat, 
  Drumstick, 
  SprayCan, 
  Smile, 
  ArrowRight,
  CheckCircle2,
  X,
  Fuel,
  Clock,
  Plus,
  Minus,
  FileDown,
  MessageCircle,
  Copy,
  Sliders,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { 
  UserProfile, 
  PromotionItem, 
  ShoppingListItem, 
  SupermarketName,
  ProductCategory
} from '../types';
import { 
  generateRanchoProntoOptions, 
  RanchoProntoOption,
  ESSENTIAL_STAPLES
} from '../utils/ranchoProntoGenerator';
import { generateRanchoPdf } from '../utils/generateRanchoPdf';
import { copyTextToClipboard } from '../utils/shareRancho';

interface RanchoProntoSelectorProps {
  userProfile: UserProfile;
  promotions: PromotionItem[];
  onApplyRancho: (items: ShoppingListItem[], budget: number, optionTitle: string) => void;
  onOpenMap?: () => void;
  onNavigateToCart?: () => void;
  initialBudget?: number;
  className?: string;
}

const BUDGET_PRESETS_BY_HOUSEHOLD: Record<'solo' | 'casal' | 'familia', number[]> = {
  solo: [350, 480, 600, 750],
  casal: [650, 850, 1050, 1350],
  familia: [980, 1350, 1750, 2200],
};

type CategoryFilter = 'todas' | 'cesta_basica' | 'carnes_proteinas' | 'hortifruti' | 'limpeza_higiene';

export const RanchoProntoSelector: React.FC<RanchoProntoSelectorProps> = ({
  userProfile,
  promotions,
  onApplyRancho,
  onOpenMap,
  onNavigateToCart,
  initialBudget = 480,
  className = '',
}) => {
  const [household, setHousehold] = useState<'solo' | 'casal' | 'familia'>('solo');
  const [selectedBudget, setSelectedBudget] = useState<number>(initialBudget);
  const [customInputValue, setCustomInputValue] = useState<string>(String(initialBudget));
  const [selectedOptionId, setSelectedOptionId] = useState<'maxima-economia' | 'mais-proximo' | 'combo-inteligente'>('maxima-economia');
  const [appliedOptionId, setAppliedOptionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('todas');

  // Generate 3 options dynamically based on budget and user location
  const options = useMemo(() => {
    return generateRanchoProntoOptions({
      budget: selectedBudget,
      householdType: household,
      familyMembers: household === 'casal' ? 2 : household === 'familia' ? 4 : 1,
      userCoords: userProfile.coordinates,
      userNeighborhood: userProfile.neighborhood,
      availablePromotions: promotions,
    });
  }, [selectedBudget, household, userProfile.coordinates, userProfile.neighborhood, promotions]);

  const currentOption = useMemo(() => {
    return options.find((o) => o.id === selectedOptionId) || options[0];
  }, [options, selectedOptionId]);

  // Local editable copy of the selected option's items so the user can tweak quantities or toggle off items
  const [itemsState, setItemsState] = useState<ShoppingListItem[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  // Reset itemsState when currentOption changes
  useEffect(() => {
    if (currentOption && currentOption.items) {
      setItemsState(currentOption.items.map(item => ({ ...item })));
      setExcludedIds(new Set());
    }
  }, [currentOption]);

  const handlePresetClick = (amount: number) => {
    setSelectedBudget(amount);
    setCustomInputValue(String(amount));
  };

  const handleHouseholdSelect = (type: 'solo' | 'casal' | 'familia') => {
    setHousehold(type);
    const defaultBudget = type === 'solo' ? 480 : type === 'casal' ? 850 : 1350;
    // Auto-adjust budget if current value is far out of realistic range for the selected profile
    if (
      (type === 'casal' && selectedBudget < 550) ||
      (type === 'familia' && selectedBudget < 900) ||
      (type === 'solo' && selectedBudget > 850)
    ) {
      setSelectedBudget(defaultBudget);
      setCustomInputValue(String(defaultBudget));
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInputValue(val);
    const num = Number(val);
    if (!isNaN(num) && num >= 50 && num <= 5000) {
      setSelectedBudget(num);
    }
  };

  // Toggle item in/out of the rancho
  const handleToggleItem = (itemId: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Stepper increment/decrement
  const handleUpdateItemQty = (itemId: string, delta: number) => {
    setItemsState((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(1, Number((item.quantity + delta).toFixed(1)));
          const newTotal = Number((item.unitPrice * newQty).toFixed(2));
          return {
            ...item,
            quantity: newQty,
            totalPrice: newTotal,
          };
        }
        return item;
      })
    );
  };

  // Filtered active items
  const activeItems = useMemo(() => {
    return itemsState.filter((item) => !excludedIds.has(item.id));
  }, [itemsState, excludedIds]);

  const activeTotalCost = useMemo(() => {
    return Number(activeItems.reduce((acc, item) => acc + item.totalPrice, 0).toFixed(2));
  }, [activeItems]);

  const remainingBudget = Number((selectedBudget - activeTotalCost).toFixed(2));

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      cesta_basica: 0,
      carnes_proteinas: 0,
      hortifruti: 0,
      limpeza_higiene: 0,
    };
    itemsState.forEach((item) => {
      if (counts[item.category as keyof typeof counts] !== undefined) {
        counts[item.category as keyof typeof counts]++;
      }
    });
    return counts;
  }, [itemsState]);

  // Display items filtered by category
  const displayedItems = useMemo(() => {
    if (categoryFilter === 'todas') return itemsState;
    return itemsState.filter((item) => item.category === categoryFilter);
  }, [itemsState, categoryFilter]);

  // Apply to main shopping list
  const handleApplyCurrentRancho = () => {
    onApplyRancho(activeItems, selectedBudget, currentOption.title);
    setAppliedOptionId(currentOption.id);
    setTimeout(() => {
      setAppliedOptionId(null);
      if (onNavigateToCart) {
        onNavigateToCart();
      }
    }, 900);
  };

  // WhatsApp formatted message
  const handleShareWhatsApp = async () => {
    const lines = [
      `🛒 *MEU RANCHO DO MÊS - ${currentOption.title.toUpperCase()}*`,
      `📍 *Passo Fundo* (${userProfile.neighborhood || 'Bairro'})`,
      `👥 Perfil: *${household === 'solo' ? '1 Pessoa (Solo)' : household === 'casal' ? 'Casal (2 pessoas)' : 'Família (4 pessoas)'}*`,
      `💰 Total: *R$ ${activeTotalCost.toFixed(2)}* (Teto: R$ ${selectedBudget.toFixed(2)})`,
      `⛽ Combustível Estimado: *~R$ ${currentOption.fuelEstimate.fuelCost.toFixed(2)}* (${currentOption.fuelEstimate.roundTripKm} km ida/volta)`,
      `⏱️ Deslocamento: *~${currentOption.fuelEstimate.driveTimeMinutes} min* no ${currentOption.stores.map(s => s.name).join(' + ')}`,
      '',
      `📋 *ITENS ESSENCIAIS SELECIONADOS (${activeItems.length}):*`,
    ];

    activeItems.forEach((item) => {
      lines.push(`• [ ] ${item.quantity} ${item.unit} - ${item.name} (~R$ ${item.totalPrice.toFixed(2)} no ${item.selectedMarket})`);
    });

    lines.push('');
    lines.push('✨ Gerado pelo *RanchoJá Passo Fundo*');

    await copyTextToClipboard(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // PDF Export
  const handleExportPdf = () => {
    generateRanchoPdf({
      items: activeItems,
      budgetLimit: selectedBudget,
      householdType: household,
      neighborhood: userProfile.neighborhood,
      cityName: userProfile.city || 'Passo Fundo',
      selectedMarket: currentOption.stores.map(s => s.name).join(' + '),
    });
  };

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-900 to-red-950 text-white rounded-3xl p-4 sm:p-6 border border-red-500/30 shadow-xl relative overflow-hidden ${className}`}>
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 space-y-3 pb-4 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-300 border border-red-500/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              Rancho do Mês (30 Dias)
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Calculado para durar o mês todo sem faltar comida
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60">
            <Navigation className="w-3 h-3 text-red-400 shrink-0" />
            <span className="text-[11px]">
              Local: <strong>{userProfile.neighborhood || 'Passo Fundo'}</strong>
            </span>
            {onOpenMap && (
              <button
                type="button"
                onClick={onOpenMap}
                className="text-[10px] text-red-400 hover:text-red-300 underline ml-1 font-bold"
              >
                Ajustar
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
            Monte seu Rancho do Mês com Inteligência e Rapidez
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1">
            Escolha o tamanho da sua casa e quanto deseja gastar. Já calculamos a quantidade certa de <strong>arroz, feijão, carnes, ovos, limpeza e higiene</strong> nos mercados mais próximos, poupando tempo e combustível.
          </p>
        </div>

        {/* 1. Value / Budget Selector and Household Profile */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Teto:</span>
            {BUDGET_PRESETS_BY_HOUSEHOLD[household].map((amount) => {
              const isSelected = selectedBudget === amount;
              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handlePresetClick(amount)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 border ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-500 shadow-md font-black'
                      : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  R$ {amount}
                </button>
              );
            })}

            <div className="relative ml-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                R$
              </span>
              <input
                type="number"
                min={50}
                max={5000}
                step={25}
                value={customInputValue}
                onChange={handleCustomInputChange}
                className="w-24 pl-7 pr-2 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-black text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                placeholder="Outro"
              />
            </div>
          </div>

          {/* Household size selector - Senior friendly touch buttons */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900 rounded-xl p-1 border border-slate-700/80 w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleHouseholdSelect('solo')}
              className={`min-h-[44px] px-2.5 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1 active:scale-95 ${
                household === 'solo'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>👤 1 Pessoa</span>
            </button>
            <button
              type="button"
              onClick={() => handleHouseholdSelect('casal')}
              className={`min-h-[44px] px-2.5 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1 active:scale-95 ${
                household === 'casal'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>👥 Casal</span>
            </button>
            <button
              type="button"
              onClick={() => handleHouseholdSelect('familia')}
              className={`min-h-[44px] px-2.5 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1 active:scale-95 ${
                household === 'familia'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>👨‍👩‍👧 Família</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Three Dynamic Strategy Cards (Highlighting Gas, Time and Net Savings) */}
      <div className="relative z-10 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
          <span className="text-xs uppercase tracking-wider font-extrabold text-slate-300">
            Onde comprar seu Rancho (3 opções calculadas):
          </span>
          <div className="flex items-center justify-between sm:justify-end gap-2 text-[11px] text-red-300 font-semibold">
            <span className="flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              <span>Combustível em tempo real</span>
            </span>
            <span className="md:hidden text-[10px] text-slate-400 font-normal">
              (deslize para os lados)
            </span>
          </div>
        </div>

        {/* Swipeable Carousel on Mobile / 3-Col Grid on Desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none -mx-1 px-1">
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const borderStyles = isSelected
              ? 'border-red-500 ring-2 ring-red-500/50 bg-slate-800 shadow-xl'
              : 'border-slate-800 bg-slate-800/60 hover:border-slate-700 hover:bg-slate-800/80';

            const badgeStyles = {
              red: 'bg-red-500/20 text-red-300 border-red-500/30',
              blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
              purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            }[option.badgeType];

            return (
              <div
                key={option.id}
                onClick={() => setSelectedOptionId(option.id)}
                className={`w-[85vw] max-w-[320px] sm:w-[320px] md:w-auto md:max-w-none shrink-0 snap-center rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99] ${borderStyles}`}
              >
                <div>
                  {/* Top Badge & Option Title */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyles}`}>
                      {option.id === 'maxima-economia' && <TrendingDown className="w-3 h-3 text-red-400" />}
                      {option.id === 'mais-proximo' && <MapPin className="w-3 h-3 text-blue-400" />}
                      {option.id === 'combo-inteligente' && <Layers className="w-3 h-3 text-purple-400" />}
                      <span>{option.badge}</span>
                    </span>

                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-400 bg-red-950/70 px-2 py-0.5 rounded-full border border-red-500/40">
                        <Check className="w-3 h-3" />
                        Opção Ativa
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-extrabold text-white leading-snug">
                    {option.title}
                  </h4>
                  
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mt-1">
                    <Store className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{option.stores.map((s) => `${s.name} (${s.distanceKm} km)`).join(' + ')}</span>
                  </div>

                  {/* Financial & Fuel Highlights Box */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Rancho Completo
                        </div>
                        <div className="text-xl font-black text-white">
                          R$ {option.totalPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                          Sobra do Teto
                        </div>
                        <div className="text-xs font-bold text-red-300">
                          + R$ {option.remainingAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Proximity & Gas Metric Bar */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1 text-amber-300 font-medium">
                        <Fuel className="w-3 h-3 text-amber-400" />
                        Gasolina: ~R$ {option.fuelEstimate.fuelCost.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3 h-3 text-slate-400" />
                        ~{option.fuelEstimate.driveTimeMinutes} min
                      </span>
                    </div>

                    <div className="pt-1 text-[11px] text-red-400 font-semibold flex items-center justify-between">
                      <span>Economia Líquida Real:</span>
                      <span className="font-bold text-white">R$ {option.netSavings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <ul className="mt-3 space-y-1 text-[11px] text-slate-300">
                  {option.highlights.slice(0, 2).map((hl, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. The Interactive 30-Day Checklist: Open, Dynamic and Categorized */}
      <div className="relative z-10 mt-6 pt-5 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base sm:text-lg font-black text-white">
                Itens do Rancho do Mês ({currentOption.title})
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-red-600 text-white">
                {activeItems.length} selecionados
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Já calculamos a proporção correta para 30 dias. Se você já tiver algum item em casa, basta desmarcar para economizar!
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleExportPdf}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              title="Exportar arquivo PDF para levar ao mercado"
            >
              <FileDown className="w-3.5 h-3.5 text-red-400" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              title="Copiar lista para o WhatsApp"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-red-400" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setCategoryFilter('todas')}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition ${
              categoryFilter === 'todas'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos os Itens ({itemsState.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('cesta_basica')}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 ${
              categoryFilter === 'cesta_basica'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 text-amber-400" />
            <span>Despensa ({categoryCounts.cesta_basica})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('carnes_proteinas')}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 ${
              categoryFilter === 'carnes_proteinas'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Drumstick className="w-3.5 h-3.5 text-rose-400" />
            <span>Carnes & Ovos ({categoryCounts.carnes_proteinas})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('hortifruti')}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 ${
              categoryFilter === 'hortifruti'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hortifrúti ({categoryCounts.hortifruti})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('limpeza_higiene')}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 ${
              categoryFilter === 'limpeza_higiene'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <SprayCan className="w-3.5 h-3.5 text-cyan-400" />
            <span>Limpeza & Higiene ({categoryCounts.limpeza_higiene})</span>
          </button>
        </div>

        {/* Item Rows List */}
        <div className="mt-3 space-y-2 max-h-[480px] sm:max-h-[580px] overflow-y-auto pr-1">
          {displayedItems.map((item) => {
            const isExcluded = excludedIds.has(item.id);
            const stapleConfig = ESSENTIAL_STAPLES.find((s) => item.id.includes(s.id));

            return (
              <div
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  isExcluded
                    ? 'bg-slate-900/50 border-slate-800/80 opacity-50'
                    : 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Left: Checkbox + Name + Brand + Monthly rationale */}
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleItem(item.id);
                    }}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 active:scale-90 ${
                      isExcluded
                        ? 'border border-slate-600 bg-slate-900 text-transparent'
                        : 'bg-red-600 text-white shadow-xs'
                    }`}
                    title={isExcluded ? "Incluir no rancho" : "Tirar do rancho (já tenho em casa)"}
                  >
                    {!isExcluded && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs sm:text-sm font-extrabold ${isExcluded ? 'line-through text-slate-400' : 'text-white'}`}>
                        {item.name}
                      </span>
                      {item.isEssential && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-500/30">
                          Básico 30d
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-red-400 font-semibold">{item.selectedMarket}</span>
                      <span>•</span>
                      <span>{item.brand || 'Marca líder/regional'}</span>
                      {item.unit && (
                        <>
                          <span>•</span>
                          <span className="text-slate-300 font-medium">Qtd: {item.quantity} {item.unit}</span>
                        </>
                      )}
                    </div>

                    {stapleConfig?.portionDesc && (
                      <div className="text-[10px] sm:text-[11px] text-amber-300/90 font-medium mt-1 flex items-center gap-1">
                        <span>📅</span>
                        <span>{stapleConfig.portionDesc}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Quantity Stepper + Total Price */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {/* Quantity Stepper */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center bg-slate-900 rounded-xl border border-slate-700/80 p-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => handleUpdateItemQty(item.id, -1)}
                      disabled={item.quantity <= 1 || isExcluded}
                      className="min-w-[32px] min-h-[32px] w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Diminuir quantidade"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateItemQty(item.id, 1)}
                      disabled={isExcluded}
                      className="min-w-[32px] min-h-[32px] w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Aumentar quantidade"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price info */}
                  <div className="text-right min-w-[75px]">
                    <div className="text-sm font-black text-white">
                      R$ {item.totalPrice.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      R$ {item.unitPrice.toFixed(2)} / un
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Bottom Sticky Summary Bar & Primary Action Button */}
      <div className="relative z-10 mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-700/60">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs uppercase font-extrabold text-slate-400">
              Total Selecionado:
            </span>
            <span className="text-2xl font-black text-white">
              R$ {activeTotalCost.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              ({activeItems.length} itens para 30 dias)
            </span>
          </div>

          <div className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-3 flex-wrap">
            <span className="text-red-400 font-bold">
              {remainingBudget >= 0 ? `Sobra: R$ ${remainingBudget.toFixed(2)} do teto` : `Passou R$ ${Math.abs(remainingBudget).toFixed(2)} do teto`}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-300">
              <Fuel className="w-3 h-3 text-amber-400" />
              Gasolina estimada: R$ {currentOption.fuelEstimate.fuelCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApplyCurrentRancho}
            className={`w-full sm:w-auto py-3 px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-lg ${
              appliedOptionId
                ? 'bg-red-500 text-white font-black'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {appliedOptionId ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Rancho Salvo com Sucesso!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Levar Rancho para a Lista de Compras</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
