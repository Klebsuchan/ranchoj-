import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Wallet, 
  Home, 
  ShoppingCart, 
  ShieldCheck, 
  HelpCircle, 
  Store, 
  ArrowRight, 
  Users, 
  User, 
  TrendingDown, 
  Flame, 
  Package, 
  SprayCan, 
  Smile, 
  Drumstick,
  Wheat
} from 'lucide-react';
import { BASIC_RANCHO_ANALYSIS, buildBasicRanchoItems } from '../utils/basicRanchoPresets';
import { ShoppingListItem } from '../types';

interface BasicRanchoAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBasicRancho: (household: 'solo' | 'casal', items: ShoppingListItem[], budget: number) => void;
  initialHousehold?: 'solo' | 'casal';
}

export const BasicRanchoAnalysisModal: React.FC<BasicRanchoAnalysisModalProps> = ({
  isOpen,
  onClose,
  onApplyBasicRancho,
  initialHousehold = 'solo',
}) => {
  const [selectedTab, setSelectedTab] = useState<'solo' | 'casal'>(initialHousehold);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const data = BASIC_RANCHO_ANALYSIS[selectedTab];

  const handleApply = () => {
    const items = buildBasicRanchoItems(selectedTab);
    const budget = data.ranchoBudget;
    onApplyBasicRancho(selectedTab, items, budget);
    setAppliedNotification(`Rancho de ${selectedTab === 'solo' ? '1 pessoa (R$ 400)' : 'casal (R$ 800)'} montado com sucesso!`);
    setTimeout(() => {
      setAppliedNotification(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-red-400">
                  Colinha de Economia Passo Fundo
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                  Análise da Base do Rancho de Sobrevivência
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition shrink-0"
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Household Selector Tabs */}
          <div className="flex gap-2 mt-5 p-1 bg-slate-800/90 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setSelectedTab('solo')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition ${
                selectedTab === 'solo'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Mora Sozinho (Sobra R$ 400)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('casal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition ${
                selectedTab === 'casal'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Em Casal (Sobra R$ 800)</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Notification banner if just applied */}
          {appliedNotification && (
            <div className="p-3 bg-red-100 text-red-900 border border-red-300 rounded-xl flex items-center gap-2 font-bold text-xs animate-in zoom-in-95">
              <Check className="w-4 h-4 text-red-600 shrink-0" />
              <span>{appliedNotification}</span>
            </div>
          )}

          {/* 1. The Math Reality in Passo Fundo */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-slate-700" />
              <span>A Realidade dos Números: Salário Mínimo e Contas Fixas</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block">Salário Mínimo</span>
                <span className="text-base font-extrabold text-slate-800">
                  R$ {data.minWage.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {selectedTab === 'solo' ? '1 pessoa trabalhando' : '2 pessoas trabalhando'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block">Aluguel + Luz + Água + Net</span>
                <span className="text-base font-extrabold text-rose-700">
                  - R$ {data.fixedExpenses.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Custos fixos inegociáveis
                </span>
              </div>

              <div className="bg-red-50 p-3 rounded-xl border border-red-300 shadow-2xs">
                <span className="text-[11px] text-red-800 font-bold block">Sobra Real para o Rancho</span>
                <span className="text-lg font-black text-red-700">
                  R$ {data.ranchoBudget.toFixed(2)}
                </span>
                <span className="text-[10px] text-red-600 block mt-0.5 font-medium">
                  {selectedTab === 'solo' ? 'Teto máximo cravado' : 'Estourando no limite'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-3.5 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-200/60">
              💡 <strong>Regra de Ouro:</strong> Com {selectedTab === 'solo' ? 'R$ 400' : 'R$ 800'}, não há margem para desperdício ou itens supérfluos (como refrigerantes caros, salgadinhos e carnes nobres). O rancho precisa cobrir <strong>sustento alimentar, proteína barata, hortifrúti fresco e indispensavelmente material de limpeza e higiene pessoal</strong>.
            </p>
          </div>

          {/* 2. Category Distribution */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-red-600" />
                <span>Divisão da Colinha: O que Deve Entrar</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Alimentos + Limpeza + Higiene
              </span>
            </div>

            <div className="space-y-2.5">
              {data.categories.map((cat, idx) => {
                const iconMap: Record<number, React.ReactNode> = {
                  0: <Wheat className="w-4 h-4 text-amber-600" />,
                  1: <Drumstick className="w-4 h-4 text-rose-600" />,
                  2: <Flame className="w-4 h-4 text-red-600" />,
                  3: <SprayCan className="w-4 h-4 text-sky-600" />,
                  4: <Smile className="w-4 h-4 text-indigo-600" />,
                };

                return (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                      <div className="flex items-center gap-2">
                        {iconMap[idx]}
                        <span>{cat.categoryName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {cat.percentage}%
                        </span>
                        <span className="text-red-700 font-extrabold">
                          ~R$ {cat.allocatedAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-6">
                      {cat.itemsSummary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Supermarkets Comparison in Passo Fundo */}
          <div className="p-4 rounded-2xl bg-red-950 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-red-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-300">
                  Onde este rancho sai mais barato em Passo Fundo?
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-red-400 bg-red-900/60 px-2 py-0.5 rounded-full border border-red-700/50">
                Economia de até R$ {data.estimatedSavings.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              <div className="p-2.5 rounded-xl bg-red-900/80 border border-red-500/50 text-center">
                <span className="text-[10px] text-red-300 block font-semibold">1º Stok Center</span>
                <span className="text-sm font-black text-white">R$ {data.estimatedCostStokCenter.toFixed(2)}</span>
                <span className="text-[9px] text-red-300 block mt-0.5">Mais barato!</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[10px] text-slate-300 block font-semibold">2º Atacadão</span>
                <span className="text-sm font-black text-white">R$ {data.estimatedCostAtacadao.toFixed(2)}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">+R$ {(data.estimatedCostAtacadao - data.estimatedCostStokCenter).toFixed(2)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[10px] text-slate-300 block font-semibold">3º Boqueirão</span>
                <span className="text-sm font-black text-white">R$ {data.estimatedCostBoqueirao.toFixed(2)}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Bairro / Rápido</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/50 text-center">
                <span className="text-[10px] text-rose-300 block font-semibold">Bourbon / Zaffari</span>
                <span className="text-sm font-black text-white">R$ {data.estimatedCostBourbon.toFixed(2)}</span>
                <span className="text-[9px] text-rose-400 block mt-0.5">Estoura teto</span>
              </div>
            </div>
          </div>

          {/* 4. Practical Passo Fundo Tips */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Dicas de Ouro dos Supermercados de Passo Fundo:</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-amber-900/90 list-disc list-inside">
              {data.passoFundoTips.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Total estimado no Stok Center: <strong className="text-red-700 text-sm font-extrabold">R$ {data.estimatedCostStokCenter.toFixed(2)}</strong> (cabe perfeitamente no teto de R$ {data.ranchoBudget.toFixed(2)}).
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 transition"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>Montar Este Rancho Básico</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
