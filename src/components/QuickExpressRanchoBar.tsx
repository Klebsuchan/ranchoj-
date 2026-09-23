import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Sparkles, 
  MapPin, 
  Store, 
  ShoppingCart, 
  Check, 
  Share2, 
  ArrowRight, 
  ThumbsUp, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  HelpCircle,
  DollarSign
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

interface QuickExpressRanchoBarProps {
  userProfile: UserProfile;
  promotions: PromotionItem[];
  currentItemsCount: number;
  currentTotal: number;
  budgetLimit: number;
  onApplyRancho: (items: ShoppingListItem[], budget: number, optionTitle: string) => void;
  onQuickAddItem: (item: ShoppingListItem) => void;
  onGoToShoppingMode: () => void;
  onOpenMap?: () => void;
  className?: string;
}

const POPULAR_STAPLES = [
  { name: 'Arroz Branco 5kg', category: 'cesta_basica', unit: '5kg', price: 24.90, market: 'Stock Center' as SupermarketName, icon: '🍚' },
  { name: 'Feijão Preto 1kg', category: 'cesta_basica', unit: '1kg', price: 5.79, market: 'Stock Center' as SupermarketName, icon: '🫘' },
  { name: 'Leite Integral 1L', category: 'cesta_basica', unit: '1L', price: 4.19, market: 'Stock Center' as SupermarketName, icon: '🥛' },
  { name: 'Ovos Brancos (30un)', category: 'carnes_proteinas', unit: '30 un', price: 16.90, market: 'Stock Center' as SupermarketName, icon: '🥚' },
  { name: 'Peito de Frango (kg)', category: 'carnes_proteinas', unit: 'kg', price: 12.99, market: 'Stock Center' as SupermarketName, icon: '🍗' },
  { name: 'Café Torrado 500g', category: 'cesta_basica', unit: '500g', price: 17.90, market: 'Stock Center' as SupermarketName, icon: '☕' },
  { name: 'Batata Inglesa (kg)', category: 'hortifruti', unit: 'kg', price: 4.49, market: 'Stock Center' as SupermarketName, icon: '🥔' },
  { name: 'Banana Prata (kg)', category: 'hortifruti', unit: 'kg', price: 3.99, market: 'Stock Center' as SupermarketName, icon: '🍌' },
  { name: 'Papel Higiênico (12un)', category: 'limpeza_higiene', unit: '12 un', price: 14.90, market: 'Stock Center' as SupermarketName, icon: '🧻' },
  { name: 'Detergente Líquido 500ml', category: 'limpeza_higiene', unit: '500ml', price: 2.19, market: 'Stock Center' as SupermarketName, icon: '🧼' },
  { name: 'Sabão em Pó Omo/Tixan 1kg', category: 'limpeza_higiene', unit: '1kg', price: 10.90, market: 'Stock Center' as SupermarketName, icon: '🧺' },
];

export const QuickExpressRanchoBar: React.FC<QuickExpressRanchoBarProps> = ({
  userProfile,
  promotions,
  currentItemsCount,
  currentTotal,
  budgetLimit,
  onApplyRancho,
  onQuickAddItem,
  onGoToShoppingMode,
  onOpenMap,
  className = '',
}) => {
  const [selectedBudget, setSelectedBudget] = useState<number>(350);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [justApplied, setJustApplied] = useState<boolean>(false);

  // Generate options based on selected budget
  const options = useMemo(() => {
    return generateRanchoProntoOptions({
      budget: selectedBudget,
      householdType: 'solo',
      userCoords: userProfile.coordinates,
      userNeighborhood: userProfile.neighborhood,
      availablePromotions: promotions,
    });
  }, [selectedBudget, userProfile.coordinates, userProfile.neighborhood, promotions]);

  const bestOption = options[0]; // Máxima economia perto do usuário

  const handleApplyNow = (option: RanchoProntoOption) => {
    onApplyRancho(option.items, option.targetBudget, option.title);
    setJustApplied(true);
    setTimeout(() => {
      setJustApplied(false);
      onGoToShoppingMode();
    }, 600);
  };

  const handleQuickAddStaple = (staple: typeof POPULAR_STAPLES[0]) => {
    const newItem: ShoppingListItem = {
      id: `staple-quick-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: staple.name,
      category: staple.category as any,
      quantity: 1,
      unit: staple.unit,
      prices: {
        [staple.market]: staple.price,
      },
      selectedMarket: staple.market,
      unitPrice: staple.price,
      totalPrice: staple.price,
      isEssential: true,
      priority: 'essencial',
      isBought: false,
    };
    onQuickAddItem(newItem);
    setAddedItemNotice(staple.name);
    setTimeout(() => setAddedItemNotice(null), 1800);
  };

  const handleShareToWhatsApp = () => {
    const text = `🛒 *MEU RANCHO JÁ*\n` +
      `🎯 Teto: R$ ${selectedBudget.toFixed(2)}\n` +
      `💰 Total: R$ ${bestOption.totalPrice.toFixed(2)} (Economia estimada: R$ ${bestOption.savingsAmount.toFixed(2)})\n` +
      `🏪 Onde comprar mais barato: *${bestOption.stores[0].name}* (${bestOption.stores[0].distanceKm} km)\n\n` +
      `📋 *Lista de Itens (${bestOption.itemCount}):*\n` +
      bestOption.items.slice(0, 10).map((i) => `• ${i.quantity}x ${i.name} - R$ ${i.totalPrice.toFixed(2)}`).join('\n') +
      (bestOption.items.length > 10 ? `\n...e mais ${bestOption.items.length - 10} itens!` : '') +
      `\n\nGerado no RanchoJá: https://ranchoja.app/`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className={`rounded-3xl border border-red-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-red-950 text-white shadow-xl overflow-hidden ${className}`}>
      {/* Top Banner Header with Quick Toggle */}
      <div className="p-3.5 sm:p-4 bg-red-950/80 border-b border-red-500/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center font-black shadow-xs shrink-0 animate-pulse">
            <Zap className="w-4 h-4 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-red-300">
                Modo Expresso (1 Toque)
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-red-600 text-white">
                Rápido
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Monte seu rancho completo balanceado em 1 clique sem perder tempo:
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Minimizar ou expandir modo expresso"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-3.5 sm:p-5 space-y-4">
          {/* 1. Passo: Quanto quer gastar? Big visual buttons */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-extrabold text-slate-200 uppercase tracking-wide flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-red-400" />
                1. Escolha quanto quer gastar no rancho:
              </span>
              <span className="text-[11px] text-red-400 font-bold">
                Teto: R$ {selectedBudget}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[
                { val: 150, label: 'R$ 150', tag: 'Salva-Mês' },
                { val: 250, label: 'R$ 250', tag: 'Básico' },
                { val: 350, label: 'R$ 350', tag: 'Mais Pedido ⭐' },
                { val: 500, label: 'R$ 500', tag: 'Família' },
              ].map((btn) => {
                const isSelected = selectedBudget === btn.val;
                return (
                  <button
                    key={btn.val}
                    type="button"
                    onClick={() => setSelectedBudget(btn.val)}
                    className={`py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 border ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-400 shadow-lg font-black scale-[1.02]'
                        : 'bg-slate-800/90 text-slate-300 border-slate-700/80 hover:bg-slate-750 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-black tracking-tight">{btn.label}</span>
                    <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-red-100 font-bold' : 'text-slate-400'}`}>
                      {btn.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Resposta Instantânea: Onde é mais barato perto de você */}
          {bestOption && (
            <div className="rounded-2xl p-3.5 bg-slate-900/90 border border-red-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Melhor Escolha Hoje
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400" />
                  {userProfile.neighborhood || userProfile.city || 'Sua Região'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-black text-white">
                      {bestOption.stores[0].name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      A {bestOption.stores[0].distanceKm} km
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {bestOption.itemCount} itens essenciais completos (Arroz, feijão, frango, leite, ovos 30un, limpeza)
                  </p>
                </div>

                <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-right shrink-0">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total a pagar</div>
                  <div className="text-lg font-black text-red-400 leading-tight">
                    R$ {bestOption.totalPrice.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Sobra R$ {bestOption.remainingAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Botão Gigante de Ação em 1 Toque */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyNow(bestOption)}
                  disabled={justApplied}
                  className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg active:scale-95 ${
                    justApplied
                      ? 'bg-red-400 text-white font-black'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                  }`}
                >
                  {justApplied ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span>Rancho Carregado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white text-white" />
                      <span>MONTAR ESTE RANCHO AGORA (1 CLIQUE)</span>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareToWhatsApp}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition active:scale-95 shrink-0"
                  title="Enviar lista formatada para o WhatsApp da família"
                >
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Seção Adição Rápida de 1 Toque (Os Mais Comprados) */}
          <div className="pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <span>➕ Quer só os essenciais avulsos? Toque para adicionar:</span>
              </span>
              {addedItemNotice && (
                <span className="text-[11px] font-bold text-red-400 animate-bounce">
                  {addedItemNotice} adicionado!
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {POPULAR_STAPLES.map((staple) => (
                <button
                  key={staple.name}
                  type="button"
                  onClick={() => handleQuickAddStaple(staple)}
                  className="shrink-0 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-red-600 text-slate-200 hover:text-white border border-slate-700 hover:border-red-500 text-xs font-bold transition-all active:scale-90 flex items-center gap-1.5 shadow-xs"
                >
                  <span className="text-sm">{staple.icon}</span>
                  <span className="truncate max-w-[110px]">{staple.name}</span>
                  <span className="text-[10px] text-red-400 hover:text-white font-extrabold">
                    R$ {staple.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
