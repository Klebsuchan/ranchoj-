import React, { useState, useMemo } from 'react';
import { PromotionItem, ShoppingListItem, SupermarketName, BudgetProfile } from '../types';
import { 
  Store, 
  Search, 
  Plus, 
  Check, 
  Trash2, 
  AlertCircle, 
  ShieldCheck, 
  Tag, 
  Share2, 
  PiggyBank, 
  ChevronRight, 
  ShoppingBag, 
  PlusCircle, 
  Sparkles,
  Info,
  TrendingDown,
  ArrowRight,
  Filter,
  CheckCircle2,
  FileDown,
  Printer
} from 'lucide-react';
import { generateRanchoPdf } from '../utils/generateRanchoPdf';

interface SingleMarketShoppingModeProps {
  promotions: PromotionItem[];
  shoppingList: ShoppingListItem[];
  onAddToRancho: (item: PromotionItem, supermarket?: SupermarketName) => void;
  onAddCustomShoppingItem: (item: ShoppingListItem) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onToggleBought: (id: string) => void;
  onChangeMarket: (id: string, market: 'best' | SupermarketName) => void;
  onClearList: () => void;
  budgetLimit: number;
  monthlyIncome: number;
  familyMembers?: number;
  cityName: string;
  availableMarkets?: string[];
  onSaveToHistory?: () => void;
  onSwitchToComparator?: () => void;
  onOpenShareModal?: () => void;
  onExportPdf?: () => void;
}

export const SingleMarketShoppingMode: React.FC<SingleMarketShoppingModeProps> = ({
  promotions,
  shoppingList,
  onAddToRancho,
  onAddCustomShoppingItem,
  onUpdateQuantity,
  onSetQuantity,
  onRemoveItem,
  onToggleBought,
  onChangeMarket,
  onClearList,
  budgetLimit,
  monthlyIncome,
  familyMembers = 1,
  cityName,
  availableMarkets = ["Stock Center", "Atacadão", "Supermercado Boqueirão", "Zaffari", "Bourbon", "Coqueiros"],
  onSaveToHistory,
  onSwitchToComparator,
  onOpenShareModal,
  onExportPdf
}) => {
  // Current chosen supermarket - default to Stock Center as highlighted by the user!
  const [selectedMarket, setSelectedMarket] = useState<string>("Stock Center");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  
  // Custom item quick form
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customQty, setCustomQty] = useState(1);

  // Export physical PDF list ready for printing
  const handleExportPdf = () => {
    if (onExportPdf) {
      onExportPdf();
      return;
    }
    generateRanchoPdf({
      items: marketListItems.map((item) => ({
        ...item,
        selectedMarket: selectedMarket as SupermarketName,
      })),
      budgetLimit,
      householdType: familyMembers > 1 ? 'casal' : 'solo',
      neighborhood: cityName,
      cityName,
      selectedMarket,
    });
  };

  // Helper to extract the price for this specific market from an item
  const getItemPriceInSelectedMarket = (item: ShoppingListItem): number => {
    if (item.prices) {
      const keys = Object.keys(item.prices);
      const match = keys.find((k) => 
        k.toLowerCase().includes(selectedMarket.toLowerCase()) ||
        (selectedMarket.toLowerCase().includes("stock") && k.toLowerCase().includes("stok")) ||
        (selectedMarket.toLowerCase().includes("stok") && k.toLowerCase().includes("stock"))
      );
      if (match && item.prices[match as SupermarketName] !== undefined) {
        return item.prices[match as SupermarketName]!;
      }
    }
    return item.unitPrice || 0;
  };

  // Map shopping list items to have the price from the selected market
  const marketListItems = useMemo(() => {
    return shoppingList.map((item) => {
      const marketPrice = getItemPriceInSelectedMarket(item);
      const itemTotal = marketPrice * item.quantity;
      return {
        ...item,
        marketPrice,
        itemTotal,
      };
    });
  }, [shoppingList, selectedMarket]);

  // Totals & Math
  const totalListEstimate = marketListItems.reduce((acc, curr) => acc + curr.itemTotal, 0);
  const totalBoughtInCart = marketListItems
    .filter((i) => i.isBought)
    .reduce((acc, curr) => acc + curr.itemTotal, 0);
  
  const totalItemsCount = marketListItems.length;
  const boughtItemsCount = marketListItems.filter((i) => i.isBought).length;

  const perPersonTotal = familyMembers > 0 ? totalListEstimate / familyMembers : totalListEstimate;
  const perPersonBudget = familyMembers > 0 ? budgetLimit / familyMembers : budgetLimit;
  const remaining = budgetLimit - totalListEstimate;
  const isOverBudget = totalListEstimate > budgetLimit && budgetLimit > 0;
  const budgetUsagePercent = budgetLimit > 0 ? Math.min(Math.round((totalListEstimate / budgetLimit) * 100), 100) : 0;

  // Promotions available in the selected market
  const marketPromotions = useMemo(() => {
    return promotions.map((item) => {
      const priceObj = item.prices?.find((p) => 
        p.supermarket.toLowerCase().includes(selectedMarket.toLowerCase()) ||
        (selectedMarket.toLowerCase().includes("stock") && p.supermarket.toLowerCase().includes("stok")) ||
        (selectedMarket.toLowerCase().includes("stok") && p.supermarket.toLowerCase().includes("stock"))
      );
      const priceInMarket = priceObj ? priceObj.price : item.lowestPrice;
      const isPromoInMarket = priceObj ? priceObj.isPromo : false;
      const promoNoteInMarket = priceObj?.promoNote;
      const isInList = shoppingList.some((s) => s.id === item.id || s.name.toLowerCase() === item.name.toLowerCase());

      return {
        ...item,
        priceInMarket,
        isPromoInMarket,
        promoNoteInMarket,
        isInList,
      };
    });
  }, [promotions, selectedMarket, shoppingList]);

  // Filtered promotions based on search & category
  const filteredPromos = useMemo(() => {
    return marketPromotions.filter((item) => {
      const matchesSearch = 
        !searchQuery.trim() || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === "todos" || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [marketPromotions, searchQuery, selectedCategory]);

  // Handle adding custom shelf item
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const priceNum = parseFloat(customPrice.replace(',', '.')) || 0;
    
    const newItem: ShoppingListItem = {
      id: `custom-shelf-${Date.now()}`,
      name: customName.trim(),
      category: 'cesta_basica',
      unit: 'un',
      quantity: customQty,
      unitPrice: priceNum,
      totalPrice: priceNum * customQty,
      selectedMarket: selectedMarket as SupermarketName,
      isBought: false,
      isEssential: true,
      priority: 'essencial',
      prices: {
        [selectedMarket]: priceNum
      }
    };

    onAddCustomShoppingItem(newItem);
    setCustomName("");
    setCustomPrice("");
    setCustomQty(1);
    setShowAddCustom(false);
  };

  // WhatsApp share generator
  const handleShareWhatsApp = () => {
    const lines = [
      `🛒 *Minha Compra do Mês / Rancho no ${selectedMarket}*`,
      `📍 Cidade: ${cityName}`,
      `👥 Pessoas: ${familyMembers} (R$ ${perPersonTotal.toFixed(2)}/pessoa)`,
      `💰 *Total Previsto: R$ ${totalListEstimate.toFixed(2)}* (Teto: R$ ${budgetLimit.toFixed(2)})`,
      '',
      `*Itens da Lista:*`,
      ...marketListItems.map((i) => 
        `${i.isBought ? '✅' : '⬜'} ${i.quantity}x ${i.name} - R$ ${i.itemTotal.toFixed(2)}`
      ),
      '',
      `_Gerado pelo RanchoJá - Seu aplicativo para economizar_`
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Header & Supermarket Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>Rancho & Compra do Mês</span>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  No {selectedMarket}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Selecione os itens em promoção e controle seu teto sem estourar
              </p>
            </div>
          </div>

          {onSwitchToComparator && (
            <button
              type="button"
              onClick={onSwitchToComparator}
              className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-0.5 shrink-0"
              title="Comparar preços entre todos os supermercados"
            >
              <span>Ver Comparador Multi-Mercados</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Supermarket Selection Chips */}
        <div>
          <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
            Onde você vai fazer o rancho hoje?
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {availableMarkets.map((market) => {
              const isSelected = selectedMarket.toLowerCase() === market.toLowerCase();
              const isStockCenter = market.toLowerCase().includes("stock") || market.toLowerCase().includes("stok");
              return (
                <button
                  key={market}
                  type="button"
                  onClick={() => setSelectedMarket(market)}
                  className={`min-h-[38px] px-3 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs scale-100'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{market}</span>
                  {isStockCenter && (
                    <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                      Preferido
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Real-time Budget Thermometer & Cart Summary */}
      <div className={`rounded-2xl p-3.5 border transition ${
        isOverBudget 
          ? 'bg-rose-50/90 border-rose-200 text-rose-950' 
          : 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md'
      }`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <ShoppingBag className={`w-4 h-4 ${isOverBudget ? 'text-rose-600' : 'text-red-400'}`} />
              <span className="text-xs font-extrabold uppercase tracking-wide">
                Total Previsto no {selectedMarket}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-2xl font-black ${isOverBudget ? 'text-rose-700' : 'text-white'}`}>
                R$ {totalListEstimate.toFixed(2)}
              </span>
              <span className={`text-xs ${isOverBudget ? 'text-rose-600' : 'text-slate-300'}`}>
                (R$ {perPersonTotal.toFixed(2)} / pessoa)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[10px] font-semibold block ${isOverBudget ? 'text-rose-700' : 'text-slate-400'}`}>
              Teto Máximo
            </span>
            <span className={`text-sm font-extrabold ${isOverBudget ? 'text-rose-800' : 'text-red-400'}`}>
              R$ {budgetLimit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Progress Bar of Budget */}
        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-rose-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
          />
        </div>

        {/* Status Metrics */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
          <div className="flex items-center gap-1.5 font-medium">
            {isOverBudget ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="font-bold text-rose-700">
                  Estourou em R$ {Math.abs(remaining).toFixed(2)}
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className={isOverBudget ? 'text-rose-700' : 'text-red-200'}>
                  Resta R$ {remaining.toFixed(2)} livre no seu teto
                </span>
              </>
            )}
          </div>

          <div className="text-[11px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
            {budgetUsagePercent}% do orçamento
          </div>
        </div>

        {/* Physical Cart Checklist progress */}
        {totalItemsCount > 0 && (
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] opacity-90">
            <span>
              Carrinho Físico na Loja: <strong>{boughtItemsCount} de {totalItemsCount}</strong> itens no carrinho
            </span>
            <span className="font-bold">
              Subtotal colocado: R$ {totalBoughtInCart.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* 3. Search & Quick Add Section for Selected Supermarket */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-red-600" />
            <span>Pesquisar Promoções no {selectedMarket}</span>
          </label>

          <button
            type="button"
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{showAddCustom ? 'Fechar' : '+ Item Avulso'}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar arroz, feijão, café, frango no ${selectedMarket}...`}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {[
            { id: "todos", label: "Todas Ofertas" },
            { id: "cesta_basica", label: "Cesta Básica" },
            { id: "carnes_proteinas", label: "Carnes & Ovos" },
            { id: "hortifruti", label: "Hortifrúti" },
            { id: "laticinios_frios", label: "Laticínios" },
            { id: "limpeza_higiene", label: "Limpeza" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Custom shelf item drawer */}
        {showAddCustom && (
          <form onSubmit={handleAddCustom} className="p-3 bg-red-50/60 border border-red-200 rounded-xl space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-950">
                Adicionar Item da Gôndola / Prateleira
              </span>
              <span className="text-[10px] text-red-600">Preço no {selectedMarket}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Nome do produto (ex: Detergente Ypê)"
                  className="w-full px-3 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Preço R$ (ex: 2.39)"
                  className="w-full px-2.5 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 transition"
                >
                  + Adicionar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Promotion Search Results Carousel / List */}
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {filteredPromos.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              Nenhuma oferta encontrada com este termo no {selectedMarket}.
            </div>
          ) : (
            filteredPromos.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/80 transition flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </span>
                    {item.isPromoInMarket && (
                      <span className="bg-red-100 text-red-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
                        Promoção
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span className="font-black text-red-600 text-xs">
                      R$ {item.priceInMarket.toFixed(2)}
                    </span>
                    <span>• {item.unit}</span>
                    {item.promoNoteInMarket && (
                      <span className="truncate text-slate-400 text-[10px]">
                        ({item.promoNoteInMarket})
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAddToRancho(item, selectedMarket as SupermarketName)}
                  className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                    item.isInList
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-2xs active:scale-95'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{item.isInList ? '+1' : 'Pôr na Lista'}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. The Digital Shopping List (Replaces Note Pad / Paper) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Sua Lista de Compras no {selectedMarket}</span>
              <span className="text-slate-400 font-medium">({totalItemsCount} itens)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Conforme for pegando na gôndola, marque para acompanhar o carrinho físico
            </p>
          </div>

          {marketListItems.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPdf}
                className="py-1 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 text-[11px] font-bold flex items-center gap-1 transition shadow-2xs active:scale-95"
                title="Exportar arquivo PDF para imprimir e levar às compras offline"
              >
                <FileDown className="w-3.5 h-3.5 text-red-600" />
                <span>Exportar PDF</span>
              </button>
              <button
                type="button"
                onClick={onClearList}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
              >
                Limpar Lista
              </button>
            </div>
          )}
        </div>

        {marketListItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-3">
            <PiggyBank className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-700">
              Sua lista de compras no {selectedMarket} está vazia.
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Sem tempo de escolher item por item? Você pode gerar uma lista pronta balanceada com 1 toque!
            </p>
            {onSwitchToComparator && (
              <button
                type="button"
                onClick={onSwitchToComparator}
                className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-sm transition active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>⚡ Montar Rancho Pronto em 1 Toque</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {marketListItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                  item.isBought
                    ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-70'
                    : 'bg-white border-slate-200 hover:border-red-300 text-slate-800 shadow-2xs'
                }`}
              >
                {/* Checkbox for physical cart checklist */}
                <button
                  type="button"
                  onClick={() => onToggleBought(item.id)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition ${
                    item.isBought
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-slate-300 bg-white hover:border-red-500'
                  }`}
                  title={item.isBought ? "No carrinho (toque para desmarcar)" : "Marcar como colocado no carrinho"}
                >
                  {item.isBought && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                {/* Item Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold truncate ${item.isBought ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">
                      R$ {item.marketPrice.toFixed(2)} / un
                    </span>
                    <span>• Total: <strong className="text-red-600">R$ {item.itemTotal.toFixed(2)}</strong></span>
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-7 text-center text-xs font-extrabold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Remover item da lista"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Actions: Exportar PDF, Compartilhar Lista & Salvar no Histórico */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleExportPdf}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs active:scale-98"
                title="Gerar arquivo PDF formatado pronto para imprimir e levar ao supermercado sem internet"
              >
                <FileDown className="w-3.5 h-3.5 text-red-400" />
                <span>Exportar PDF</span>
              </button>

              <button
                type="button"
                onClick={onOpenShareModal || handleShareWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs active:scale-98"
                title="Compartilhar lista por link encurtado ou WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar</span>
              </button>

              {onSaveToHistory && (
                <button
                  type="button"
                  onClick={onSaveToHistory}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-98 border border-slate-200"
                >
                  <Check className="w-3.5 h-3.5 text-red-600" />
                  <span>Salvar no Histórico</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
