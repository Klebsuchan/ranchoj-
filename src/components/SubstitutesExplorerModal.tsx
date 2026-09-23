import React from 'react';
import { PromotionItem, ShoppingListItem } from '../types';
import { ProductSubstitute, getSubstitutesForProduct } from '../utils/productSubstitutes';
import { 
  X, 
  Sparkles, 
  TrendingDown, 
  Store, 
  ArrowRight, 
  Check, 
  Plus, 
  RefreshCw,
  Lightbulb,
  ShieldCheck
} from 'lucide-react';

interface SubstitutesExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PromotionItem[];
  shoppingList: ShoppingListItem[];
  onApplySubstitute: (sub: ProductSubstitute, originalItemName: string) => void;
}

export const SubstitutesExplorerModal: React.FC<SubstitutesExplorerModalProps> = ({
  isOpen,
  onClose,
  items,
  shoppingList,
  onApplySubstitute,
}) => {
  if (!isOpen) return null;

  // Gather all items that have cheaper substitutes
  const substitutePairs = items
    .map((item) => {
      const subs = getSubstitutesForProduct(item);
      return {
        item,
        bestSubstitute: subs[0] || null,
        allSubstitutes: subs,
      };
    })
    .filter((pair) => pair.bestSubstitute !== null);

  const totalPotentialSavings = substitutePairs.reduce(
    (acc, curr) => acc + (curr.bestSubstitute?.savingsAmount || 0),
    0
  );

  const isSubstituteInRancho = (subName: string) => {
    return shoppingList.some((s) => s.name.toLowerCase().includes(subName.toLowerCase().split('(')[0].trim()));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-linear-to-br from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display">Substitutos Econômicos Inteligentes</h2>
              <p className="text-xs text-slate-300">Troque marcas caras ou itens fora de promoção por opções equivalentes em Passo Fundo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Banner */}
        <div className="p-4 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              Economia potencial total identificada: <strong className="text-red-700 font-extrabold text-sm">R$ {totalPotentialSavings.toFixed(2)}</strong> em marcas alternativas.
            </span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 shrink-0">
            {substitutePairs.length} produtos sugeridos
          </span>
        </div>

        {/* Content List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {substitutePairs.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p className="font-semibold">Nenhum substituto necessário no momento!</p>
              <p className="text-xs">Todos os itens exibidos já estão nos menores preços possíveis.</p>
            </div>
          ) : (
            substitutePairs.map(({ item, bestSubstitute }) => {
              if (!bestSubstitute) return null;
              const alreadyAdded = isSubstituteInRancho(bestSubstitute.substituteName);

              return (
                <div 
                  key={item.id} 
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-xs transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left: Original vs Substitute Comparison */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-500 line-through">
                          {item.name}
                        </span>
                        <span className="text-slate-400 font-semibold">R$ {item.lowestPrice.toFixed(2)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-bold text-slate-900 text-sm">
                          {bestSubstitute.substituteName}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {bestSubstitute.reason}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-red-800 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                          <Store className="w-3 h-3 text-red-600" />
                          {bestSubstitute.market}: R$ {bestSubstitute.estimatedPrice.toFixed(2)}
                        </span>
                        <span className="inline-flex items-center gap-0.5 font-bold text-red-700 bg-red-100/70 px-2 py-0.5 rounded-md">
                          <TrendingDown className="w-3 h-3" />
                          Economia: R$ {bestSubstitute.savingsAmount.toFixed(2)} ({bestSubstitute.savingsPercent}%)
                        </span>
                        {bestSubstitute.substituteBrand && (
                          <span className="text-slate-500 text-[11px]">
                            Marca: {bestSubstitute.substituteBrand}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => onApplySubstitute(bestSubstitute, item.name)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs ${
                          alreadyAdded
                            ? 'bg-red-100 text-red-900 border border-red-300'
                            : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
                        }`}
                      >
                        {alreadyAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-red-700" />
                            <span>No Rancho</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Trocar no Rancho</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Marcas disponíveis no Stock Center, Atacadão, Boqueirão e Zaffari.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
