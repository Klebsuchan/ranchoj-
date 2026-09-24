import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight, MessageCircle, ChevronRight, Sparkles, Store } from 'lucide-react';

interface FloatingQuickCartBarProps {
  itemCount: number;
  totalPrice: number;
  budgetLimit: number;
  bestMarket?: string;
  onOpenShoppingMode: () => void;
  onShareWhatsApp?: () => void;
  activeTab: string;
}

export const FloatingQuickCartBar: React.FC<FloatingQuickCartBarProps> = ({
  itemCount,
  totalPrice,
  budgetLimit,
  bestMarket,
  onOpenShoppingMode,
  onShareWhatsApp,
  activeTab,
}) => {
  const [animateBounce, setAnimateBounce] = useState(false);

  useEffect(() => {
    if (itemCount > 0) {
      setAnimateBounce(true);
      const t = setTimeout(() => setAnimateBounce(false), 300);
      return () => clearTimeout(t);
    }
  }, [itemCount]);

  if (itemCount === 0 || activeTab === 'carrinho') {
    return null;
  }

  const isOverBudget = budgetLimit > 0 && totalPrice > budgetLimit;

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+68px)] sm:bottom-20 left-0 right-0 z-35 px-3 sm:px-4 pointer-events-none flex justify-center animate-in slide-in-from-bottom-4 duration-300">
      <div className={`pointer-events-auto w-full max-w-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-2xl shadow-2xl shadow-red-600/50 p-3 flex items-center justify-between gap-2.5 transition active:scale-98 border-2 border-red-300/80 ${
        animateBounce ? 'scale-[1.02]' : 'scale-100'
      }`}>
        {/* Info Left */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer" onClick={onOpenShoppingMode} role="button">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-black shadow-inner">
              <ShoppingBag className="w-6 h-6 fill-current" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-white text-red-600 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pop-in">
              {itemCount}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white tracking-tight">
                R$ {totalPrice.toFixed(2)}
              </span>
              {budgetLimit > 0 && (
                <span className={`text-xs font-bold ${isOverBudget ? 'text-amber-200' : 'text-red-100'}`}>
                  / R$ {budgetLimit}
                </span>
              )}
            </div>
            <div className="text-[11px] text-red-100 truncate font-semibold flex items-center gap-1">
              {bestMarket ? (
                <>
                  <Store className="w-3 h-3 shrink-0 text-amber-300" />
                  <span className="truncate">Mais barato no <strong>{bestMarket}</strong></span>
                </>
              ) : (
                <>{itemCount} {itemCount === 1 ? 'item pronto' : 'itens prontos'}</>
              )}
            </div>
          </div>
        </div>

        {/* Buttons Right */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onShareWhatsApp && (
            <button
              type="button"
              onClick={onShareWhatsApp}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-90 shadow-md flex items-center justify-center"
              title="Mandar lista no WhatsApp"
              aria-label="Compartilhar no WhatsApp"
            >
              <MessageCircle className="w-5 h-5 fill-current text-white" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenShoppingMode}
            className="py-2.5 px-3 rounded-xl bg-white text-red-700 font-black text-xs sm:text-sm flex items-center gap-1 shadow-md transition active:scale-95 hover:bg-red-50"
          >
            <span>Ver Carrinho</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};

