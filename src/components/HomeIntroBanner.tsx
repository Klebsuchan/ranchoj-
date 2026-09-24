import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingDown, 
  Zap, 
  HelpCircle, 
  X,
  ChevronRight
} from 'lucide-react';

interface HomeIntroBannerProps {
  onGoToRanchoPronto: () => void;
  onGoToMap: () => void;
  onGoToOffers?: () => void;
}

export const HomeIntroBanner: React.FC<HomeIntroBannerProps> = ({
  onGoToRanchoPronto,
  onGoToMap,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ranchoja_intro_dismissed');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ranchoja_intro_dismissed', JSON.stringify(isDismissed));
    } catch {
      // ignore
    }
  }, [isDismissed]);

  if (isDismissed) {
    return (
      <div className="mb-2.5 flex items-center justify-between px-2.5 py-1.5 bg-slate-100/90 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
        <div className="flex items-center gap-1.5 truncate">
          <HelpCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span className="truncate font-medium">O que é o RanchoJá Passo Fundo?</span>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="text-red-600 font-bold hover:underline shrink-0 ml-2 text-[11px]"
        >
          Ver resumo
        </button>
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-2xl bg-gradient-to-r from-red-50 via-white to-amber-50/40 border border-red-200/90 p-3 shadow-2xs relative">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 fill-amber-300 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                O que é o RanchoJá?
              </h3>
              <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                Passo Fundo
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-snug font-medium">
              Comparador de preços dos supermercados de Passo Fundo (Stok Center, Boqueirão, Atacadão, Zaffari e Bourbon).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-slate-600 p-1.5 -mr-1 -mt-1 rounded-lg transition"
          title="Fechar introdução"
          aria-label="Fechar introdução"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Por que é útil - Versão direta e enxuta para mobile */}
      <div className="mt-2.5 pt-2 border-t border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Economia:</strong> Poupe até <strong>30%</strong> no rancho do mês comprando no lugar certo.
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={onGoToRanchoPronto}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1 shadow-xs transition active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Rancho Rápido</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onGoToMap}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
          >
            Mercados
          </button>
        </div>
      </div>
    </div>
  );
};
