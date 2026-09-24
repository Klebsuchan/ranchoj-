import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  TrendingDown, 
  Lightbulb, 
  Check, 
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DailyTip, ShoppingListItem, BudgetProfile, UserProfile, RanchoHistoryEntry } from '../types';

interface DailyTipsCarouselProps {
  shoppingList: ShoppingListItem[];
  history: RanchoHistoryEntry[];
  profile: BudgetProfile;
  userProfile: UserProfile;
  currentTotal: number;
  onNavigateToOffers?: () => void;
  onNavigateToRancho?: () => void;
}

const STORAGE_KEY = 'rancho_daily_tips_cache_v1';

const INITIAL_FALLBACK_TIPS: DailyTip[] = [
  {
    id: 'tip-init-1',
    title: 'Quarta & Quinta da Feira',
    category: 'timing',
    icon: '🥬',
    tag: 'Dia Certo',
    shortText: 'No Stok Center e atacarejos da região, quartas e quintas concentram os maiores descontos em hortifrúti fresco.',
    actionableAdvice: 'Concentre a compra de frutas, legumes e ovos nesses dias para pagar até 35% menos no quilo.',
    potentialSavings: 'R$ 15 a R$ 25',
    badgeColor: 'emerald',
  },
  {
    id: 'tip-init-2',
    title: 'Proteína Custo-Benefício',
    category: 'substituicao',
    icon: '🥩',
    tag: 'Troca Inteligente',
    shortText: 'Alternar carne bovina nobre com acém moído, filé de frango ou ovos mantém os nutrientes e reduz o total.',
    actionableAdvice: 'Substitua metade das carnes da semana por sobrecoxa ou ovos e sinta o alívio imediato no caixa.',
    potentialSavings: 'R$ 20 a R$ 38',
    badgeColor: 'amber',
  },
  {
    id: 'tip-init-3',
    title: 'Limpeza em Galões de 3L a 5L',
    category: 'atacado',
    icon: '🧼',
    tag: 'Volume Econômico',
    shortText: 'Produtos de limpeza em galões e fardos chegam a custar 30% menos por litro do que frascos de 500ml.',
    actionableAdvice: 'Compre sabão líquido e amaciante concentrado uma vez ao mês em atacarejos como Atacadão ou Stok.',
    potentialSavings: 'R$ 12 a R$ 20',
    badgeColor: 'blue',
  },
  {
    id: 'tip-init-4',
    title: 'Cálculo Real por Litro e Quilo',
    category: 'alerta',
    icon: '🏷️',
    tag: 'Atenção à Gôndola',
    shortText: 'Nem todo combo "leve 3 pague 2" compensa. Sempre compare o preço fracionado por 100g ou 1kg.',
    actionableAdvice: 'Use o comparador de embalagens do RanchoJá para verificar se a embalagem maior realmente é mais barata.',
    potentialSavings: 'R$ 8 a R$ 16',
    badgeColor: 'purple',
  },
];

export const DailyTipsCarousel: React.FC<DailyTipsCarouselProps> = ({
  shoppingList,
  history,
  profile,
  userProfile,
  currentTotal,
  onNavigateToOffers,
  onNavigateToRancho,
}) => {
  const [tips, setTips] = useState<DailyTip[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read cached tips:', e);
    }
    return INITIAL_FALLBACK_TIPS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<any>(null);

  // Fetch tips from Gemini server endpoint
  const fetchGeminiTips = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/daily-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shoppingList,
          history,
          profile,
          userProfile,
          currentTotal,
        }),
      });

      if (!res.ok) throw new Error('Erro ao buscar dicas de IA');
      const data = await res.json();
      if (data.success && Array.isArray(data.tips) && data.tips.length > 0) {
        setTips(data.tips);
        setIsAiGenerated(Boolean(data.isAiGenerated));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.tips));
        } catch (e) {
          console.warn('Failed to cache tips:', e);
        }
        if (isManualRefresh) {
          setCurrentIndex(0);
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          }
        }
      }
    } catch (err) {
      console.error('Falha ao carregar dicas rápidas do Gemini:', err);
    } finally {
      setIsLoading(false);
    }
  }, [shoppingList, history, profile, userProfile, currentTotal]);

  // Initial load if not loaded or if user purchases change significantly
  useEffect(() => {
    const hasCached = Boolean(localStorage.getItem(STORAGE_KEY));
    if (!hasCached) {
      fetchGeminiTips(false);
    }
  }, [fetchGeminiTips]);

  // Auto-play carousel slides
  useEffect(() => {
    if (isCollapsed || tips.length <= 1) return;

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tips.length);
    }, 8500);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [tips.length, isCollapsed]);

  // Sync scroll position when currentIndex changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cardWidth = container.clientWidth;
    container.scrollTo({
      left: currentIndex * cardWidth,
      behavior: 'smooth',
    });
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tips.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const handleCopyTip = (tip: DailyTip) => {
    const textToCopy = `💡 Dica RanchoJá (${tip.tag}): ${tip.title}\n${tip.shortText}\n👉 ${tip.actionableAdvice}${tip.potentialSavings ? ` (Economia: ${tip.potentialSavings})` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(tip.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Color theme helpers
  const getColorStyles = (color?: string) => {
    switch (color) {
      case 'emerald':
        return {
          bgBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          accent: 'text-emerald-700',
          savingsBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          indicator: 'bg-emerald-600',
        };
      case 'amber':
        return {
          bgBadge: 'bg-amber-50 text-amber-800 border-amber-200',
          accent: 'text-amber-700',
          savingsBg: 'bg-amber-50 text-amber-800 border-amber-200',
          indicator: 'bg-amber-600',
        };
      case 'blue':
        return {
          bgBadge: 'bg-sky-50 text-sky-800 border-sky-200',
          accent: 'text-sky-700',
          savingsBg: 'bg-sky-50 text-sky-800 border-sky-200',
          indicator: 'bg-sky-600',
        };
      case 'purple':
        return {
          bgBadge: 'bg-purple-50 text-purple-800 border-purple-200',
          accent: 'text-purple-700',
          savingsBg: 'bg-purple-50 text-purple-800 border-purple-200',
          indicator: 'bg-purple-600',
        };
      case 'rose':
      default:
        return {
          bgBadge: 'bg-red-50 text-red-800 border-red-200',
          accent: 'text-red-700',
          savingsBg: 'bg-red-50 text-red-800 border-red-200',
          indicator: 'bg-red-600',
        };
    }
  };

  const currentTip = tips[currentIndex] || tips[0];
  const activeStyles = getColorStyles(currentTip?.badgeColor);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden mb-3 transition-all duration-200">
      {/* Header bar */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
            <h3 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Dicas Rápidas do Dia</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-500/30 text-red-200 border border-red-400/30">
                IA Gemini
              </span>
            </h3>
          </div>
        </div>

        {/* Action buttons: Refresh with Gemini & Collapse */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => fetchGeminiTips(true)}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-slate-200 text-[11px] font-bold transition disabled:opacity-50"
            title="Pedir novas dicas personalizadas à IA"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-amber-300' : 'text-slate-300'}`} />
            <span className="hidden sm:inline">{isLoading ? 'Analisando...' : 'Atualizar'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title={isCollapsed ? 'Expandir carrossel' : 'Recolher carrossel'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Carousel Body */}
      {!isCollapsed && (
        <div className="relative p-3 sm:p-3.5">
          {/* Slides Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-hidden scroll-smooth flex snap-x snap-mandatory scrollbar-none"
          >
            {tips.map((tip, idx) => {
              const styles = getColorStyles(tip.badgeColor);
              return (
                <div
                  key={tip.id || idx}
                  className="w-full shrink-0 snap-center pr-0.5"
                >
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex flex-col justify-between gap-2.5">
                    {/* Top Row: Icon + Category Badge + Savings Chip */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xl shrink-0" role="img" aria-label={tip.title}>
                          {tip.icon || '💡'}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.bgBadge}`}>
                          {tip.tag}
                        </span>
                      </div>

                      {tip.potentialSavings && (
                        <div className={`flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full border ${styles.savingsBg}`}>
                          <TrendingDown className="w-3 h-3 shrink-0" />
                          <span>Eco: {tip.potentialSavings}</span>
                        </div>
                      )}
                    </div>

                    {/* Title & Short Text */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                        {tip.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {tip.shortText}
                      </p>
                    </div>

                    {/* Actionable Advice Box */}
                    <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 text-xs text-slate-700 flex items-start justify-between gap-2 shadow-2xs">
                      <div className="flex items-start gap-1.5 min-w-0">
                        <Lightbulb className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${styles.accent}`} />
                        <span className="text-[11px] sm:text-xs font-semibold leading-snug">
                          {tip.actionableAdvice}
                        </span>
                      </div>

                      {/* Quick copy tip button */}
                      <button
                        type="button"
                        onClick={() => handleCopyTip(tip)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
                        title="Copiar dica para WhatsApp ou notas"
                      >
                        {copiedId === tip.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls bar: Prev, Dots, Next */}
          <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition active:scale-95 shadow-2xs"
                title="Dica anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition active:scale-95 shadow-2xs"
                title="Próxima dica"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Indicator Dots */}
            <div className="flex items-center gap-1.5">
              {tips.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`transition-all duration-300 rounded-full ${
                    currentIndex === dotIdx
                      ? `w-4 h-1.5 ${activeStyles.indicator}`
                      : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Ir para dica ${dotIdx + 1}`}
                />
              ))}
            </div>

            {/* Quick Link or Counter */}
            <div className="text-[11px] text-slate-400 font-bold">
              {currentIndex + 1} de {tips.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
