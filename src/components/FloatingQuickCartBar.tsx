import React from 'react';
import { ShoppingCart, ArrowRight, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { SupermarketName } from '../types';

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
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+64px)] left-0 right-0 z-35 px-3 pointer-events-none flex justify-center animate-in slide-in-from-bottom-3 duration-300">
      <div className="pointer-events-auto w-full max-w-md bg-slate-900/95 backdrop-blur-md text-white border border-emerald-500/40 rounded-2xl shadow-2xl p-2.5 flex items-center justify-between gap-2.5">
        {/* Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
              {itemCount}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-white">
                R$ {totalPrice.toFixed(2)}
              </span>
              {budgetLimit > 0 && (
                <span className={`text-[10px] font-bold ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                  / R$ {budgetLimit}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              {bestMarket ? (
                <>🏆 Mais barato no <strong className="text-emerald-400">{bestMarket}</strong></>
              ) : (
                <>{itemCount} itens prontos na sua lista</>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onShareWhatsApp && (
            <button
              type="button"
              onClick={onShareWhatsApp}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-700 text-emerald-400 hover:text-white transition active:scale-95 border border-slate-700"
              title="Mandar lista no WhatsApp"
              aria-label="Compartilhar no WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenShoppingMode}
            className="py-2.5 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
          >
            <span>Ver Lista / Comprar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
