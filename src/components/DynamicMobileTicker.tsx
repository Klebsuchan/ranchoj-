import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingDown, Store, Flame, Zap, CheckCircle2, ChevronRight } from 'lucide-react';

interface DynamicMobileTickerProps {
  onSelectHighlight?: (filterKey: string) => void;
}

const TICKER_ITEMS = [
  {
    icon: '🟢',
    badge: 'Ao Vivo',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    text: 'Preços em Passo Fundo atualizados hoje!',
    highlight: '6 Mercados Monitorados',
    filterKey: 'all',
  },
  {
    icon: '🥇',
    badge: 'Menor Preço',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    text: 'Stok Center lidera em Arroz, Feijão e Óleo',
    highlight: 'Até 22% mais barato',
    filterKey: 'cesta_basica',
  },
  {
    icon: '⚡',
    badge: 'Feirão Atacadão',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    text: 'Ovos 30 un e Leite UHT com preço de atacado',
    highlight: 'Aproveite hoje',
    filterKey: 'laticinios_frios',
  },
  {
    icon: '🥩',
    badge: 'Açougue em Oferta',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    text: 'Cortes bovinos e frango com desconto em Passo Fundo',
    highlight: 'Ver carnes',
    filterKey: 'carnes_proteinas',
  },
  {
    icon: '💰',
    badge: 'Super Economia',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    text: 'Economize até R$ 86,50 montando o Rancho Pronto',
    highlight: 'Comparar agora',
    filterKey: 'promos',
  },
];

export const DynamicMobileTicker: React.FC<DynamicMobileTickerProps> = ({ onSelectHighlight }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const current = TICKER_ITEMS[currentIndex];

  return (
    <div 
      className="mb-3 rounded-2xl bg-slate-900 text-white py-3 px-3.5 sm:p-3.5 shadow-md border border-slate-800 relative overflow-hidden transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Subtle background glow */}
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-red-600/15 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between gap-2.5 relative z-10">
        <div 
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
          onClick={() => onSelectHighlight && onSelectHighlight(current.filterKey)}
        >
          {/* Animated pulsing live dot or icon */}
          <div className="relative flex items-center justify-center shrink-0">
            <span className="text-base sm:text-lg leading-none select-none">{current.icon}</span>
          </div>

          <div className="min-w-0 flex-1 py-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0 ${current.badgeColor}`}>
                {current.badge}
              </span>
              <span className="text-xs font-bold text-slate-200 leading-snug">
                {current.text}
              </span>
            </div>
          </div>
        </div>

        {/* Dots indicator & Jump action */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1">
            {TICKER_ITEMS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                aria-label={`Ir para destaque ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-3.5 bg-red-500' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => onSelectHighlight && onSelectHighlight(current.filterKey)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 transition shrink-0"
            title="Ver detalhes da oferta"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
