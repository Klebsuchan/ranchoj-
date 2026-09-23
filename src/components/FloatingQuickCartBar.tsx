import React from 'react';
import { ShoppingBag, ArrowRight, MessageCircle, ChevronRight } from 'lucide-react';

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
  if (itemCount === 0 || activeTab === 'carrinho') {
    return null;
  }

  const isOverBudget = budgetLimit > 0 && totalPrice > budgetLimit;

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+58px)] sm:bottom-6 left-0 right-0 z-35 px-3 sm:px-4 pointer-events-none flex justify-center animate-in slide-in-from-bottom-3 duration-300">
      <div className="pointer-events-auto w-full max-w-lg bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-xl shadow-red-600/30 p-2.5 sm:p-3 flex items-center justify-between gap-2.5 transition active:scale-98 border border-red-500/40">
        {/* Info Left */}
        <div className="flex items-center gap-2.5 min-w-0" onClick={onOpenShoppingMode} role="button">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black">
              <ShoppingBag className="w-5 h-5 fill-current" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-white text-red-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
              {itemCount}
            </span>
          </div>

          <div className="min-w-0 cursor-pointer">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-white">
                R$ {totalPrice.toFixed(2)}
              </span>
              {budgetLimit > 0 && (
                <span className={`text-[10px] font-bold ${isOverBudget ? 'text-amber-200' : 'text-red-100'}`}>
                  / R$ {budgetLimit}
                </span>
              )}
            </div>
            <div className="text-[11px] text-red-100 truncate">
              {bestMarket ? (
                <>Mais barato no <strong>{bestMarket}</strong></>
              ) : (
                <>{itemCount} {itemCount === 1 ? 'item na sacola' : 'itens na sacola'}</>
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
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition active:scale-95"
              title="Mandar lista no WhatsApp"
              aria-label="Compartilhar no WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenShoppingMode}
            className="py-2 px-3 rounded-xl bg-white text-red-600 font-extrabold text-xs flex items-center gap-1 shadow-sm transition active:scale-95 hover:bg-red-50"
          >
            <span>Ver sacola</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
