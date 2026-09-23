import React, { useState, useMemo } from 'react';
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
  Flame, 
  Wheat, 
  Drumstick, 
  SprayCan, 
  Smile, 
  ArrowRight,
  ExternalLink,
  Sliders,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  UserProfile, 
  PromotionItem, 
  ShoppingListItem, 
  SupermarketName 
} from '../types';
import { 
  generateRanchoProntoOptions, 
  RanchoProntoOption 
} from '../utils/ranchoProntoGenerator';

interface RanchoProntoSelectorProps {
  userProfile: UserProfile;
  promotions: PromotionItem[];
  onApplyRancho: (items: ShoppingListItem[], budget: number, optionTitle: string) => void;
  onOpenMap?: () => void;
  initialBudget?: number;
  className?: string;
}

const BUDGET_PRESETS = [150, 250, 350, 500, 800];

export const RanchoProntoSelector: React.FC<RanchoProntoSelectorProps> = ({
  userProfile,
  promotions,
  onApplyRancho,
  onOpenMap,
  initialBudget = 350,
  className = '',
}) => {
  const [selectedBudget, setSelectedBudget] = useState<number>(initialBudget);
  const [customInputValue, setCustomInputValue] = useState<string>(String(initialBudget));
  const [household, setHousehold] = useState<'solo' | 'casal' | 'familia'>('solo');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('maxima-economia');
  const [inspectOption, setInspectOption] = useState<RanchoProntoOption | null>(null);
  const [appliedOptionId, setAppliedOptionId] = useState<string | null>(null);

  // Generate 3 options dynamically based on budget and user location
  const options = useMemo(() => {
    return generateRanchoProntoOptions({
      budget: selectedBudget,
      householdType: household,
      familyMembers: household === 'casal' ? 2 : household === 'familia' ? 3 : 1,
      userCoords: userProfile.coordinates,
      userNeighborhood: userProfile.neighborhood,
      availablePromotions: promotions,
    });
  }, [selectedBudget, household, userProfile.coordinates, userProfile.neighborhood, promotions]);

  const handlePresetClick = (amount: number) => {
    setSelectedBudget(amount);
    setCustomInputValue(String(amount));
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInputValue(val);
    const num = Number(val);
    if (!isNaN(num) && num >= 50 && num <= 5000) {
      setSelectedBudget(num);
    }
  };

  const handleApply = (option: RanchoProntoOption) => {
    onApplyRancho(option.items, option.targetBudget, option.title);
    setAppliedOptionId(option.id);
    setTimeout(() => {
      setAppliedOptionId(null);
    }, 3000);
  };

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-4 sm:p-6 border border-emerald-500/30 shadow-xl relative overflow-hidden ${className}`}>
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 space-y-2 pb-4 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Rancho Pronto Básico
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              3 opções inteligentes perto de você
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60">
            <Navigation className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-[11px]">
              Local: <strong>{userProfile.neighborhood || 'Passo Fundo'}</strong>
            </span>
            {onOpenMap && (
              <button
                type="button"
                onClick={onOpenMap}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 underline ml-1 font-bold"
              >
                Ajustar
              </button>
            )}
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-black font-display text-white tracking-tight">
          Quanto você quer gastar no seu Rancho?
        </h3>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Selecione o valor inicial desejado. Geramos automaticamente <strong>3 opções completas de rancho básico</strong> (alimentos, carnes, hortifrúti e produtos de limpeza) nos locais com mais ofertas perto da sua casa.
        </p>

        {/* 1. Value / Budget Selector at the Beginning */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Teto:</span>
            {BUDGET_PRESETS.map((amount) => {
              const isSelected = selectedBudget === amount;
              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handlePresetClick(amount)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 border ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black'
                      : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  R$ {amount}
                </button>
              );
            })}
          </div>

          {/* Custom value input & Household toggle */}
          <div className="flex items-center gap-2">
            <div className="relative">
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
                className="w-24 sm:w-28 pl-7 pr-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-black text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                placeholder="Outro valor"
              />
            </div>

            <div className="flex bg-slate-800/90 rounded-xl p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setHousehold('solo')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  household === 'solo'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1 Pessoa
              </button>
              <button
                type="button"
                onClick={() => setHousehold('casal')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  household === 'casal'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Casal
              </button>
              <button
                type="button"
                onClick={() => setHousehold('familia')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  household === 'familia'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Família
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Options Display Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4">
        {options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const isApplied = appliedOptionId === option.id;

          const badgeStyles = {
            emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          }[option.badgeType];

          const borderStyles = isSelected
            ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-slate-800/90'
            : 'border-slate-800 bg-slate-800/60 hover:border-slate-700';

          return (
            <div
              key={option.id}
              onClick={() => setSelectedOptionId(option.id)}
              className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between cursor-pointer ${borderStyles}`}
            >
              <div>
                {/* Card Top Pill & Proximity Info */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyles}`}>
                    {option.id === 'maxima-economia' && <TrendingDown className="w-3 h-3" />}
                    {option.id === 'mais-proximo' && <MapPin className="w-3 h-3" />}
                    {option.id === 'combo-inteligente' && <Layers className="w-3 h-3" />}
                    <span>{option.badge}</span>
                  </span>

                  <span className="text-[11px] font-semibold text-slate-400">
                    Opção {idx + 1} de 3
                  </span>
                </div>

                {/* Title & Store name */}
                <h4 className="text-sm font-extrabold text-white leading-snug">
                  {option.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-1">
                  <Store className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{option.stores.map((s) => `${s.name} (${s.distanceKm} km)`).join(' + ')}</span>
                </div>

                {/* Financial Summary */}
                <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Total do Rancho
                      </div>
                      <div className="text-xl font-black text-white">
                        R$ {option.totalPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                        Sobra do Teto
                      </div>
                      <div className="text-xs font-bold text-emerald-300">
                        + R$ {option.remainingAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                    <span>{option.itemCount} itens essenciais</span>
                    <span className="text-emerald-400 font-semibold">
                      Economiza ~R$ {option.savingsAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Highlights bullet points */}
                <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                  {option.highlights.slice(0, 3).map((hl, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(option);
                  }}
                  className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md ${
                    isApplied
                      ? 'bg-emerald-400 text-slate-950 font-black'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Rancho Adicionado à Sua Lista!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Adicionar Este Rancho à Lista</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectOption(option);
                  }}
                  className="w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-700/60 transition flex items-center justify-center gap-1"
                >
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ver todos os {option.itemCount} itens e marcas</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Hint */}
      <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Preços baseados em pesquisas reais nos atacarejos e supermercados de Passo Fundo.
        </span>
        <span className="text-[11px] text-slate-400">
          Você pode remover, adicionar ou trocar itens a qualquer momento na lista.
        </span>
      </div>

      {/* Modal to inspect full items list of a selected option */}
      {inspectOption && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider">
                  Itens Detalhados do Rancho
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {inspectOption.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Total: <strong>R$ {inspectOption.totalPrice.toFixed(2)}</strong> ({inspectOption.itemCount} itens) • Teto: R$ {inspectOption.targetBudget.toFixed(2)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectOption(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Items List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-800/60">
              {inspectOption.items.map((item, idx) => (
                <div key={item.id || idx} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span>Qtd: {item.quantity} {item.unit}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">{item.selectedMarket}</span>
                      {item.brand && <span>• {item.brand}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-white">
                      R$ {item.totalPrice.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      R$ {item.unitPrice.toFixed(2)}/un
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60">
              <button
                type="button"
                onClick={() => setInspectOption(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() => {
                  handleApply(inspectOption);
                  setInspectOption(null);
                }}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Adicionar Este Rancho à Lista</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
