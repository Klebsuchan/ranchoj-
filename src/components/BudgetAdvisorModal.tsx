import React from 'react';
import { BudgetAnalysis } from '../types';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Lightbulb, 
  Scissors, 
  ArrowRight, 
  ShieldCheck,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface BudgetAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: BudgetAnalysis | null;
  isLoading: boolean;
  onApplyCuts: (itemNamesToRemove: string[]) => void;
}

export const BudgetAdvisorModal: React.FC<BudgetAdvisorModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isLoading,
  onApplyCuts,
}) => {
  if (!isOpen) return null;

  const handleCutAll = () => {
    if (!analysis || !analysis.cannotBuyItems) return;
    const names = analysis.cannotBuyItems.map((i) => i.name);
    onApplyCuts(names);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Guia do Rancho: O Que Posso e Não Posso Comprar
              </h3>
              <p className="text-xs text-slate-500">
                Auditoria financeira de sobrevivência baseada no seu teto de gastos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="font-bold text-sm text-slate-800">
                Avaliando itens do seu rancho com IA...
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Cruzando preços do Stok Center, Bourbon, Zaffari e Atacadão com o seu limite financeiro.
              </p>
            </div>
          ) : !analysis ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Adicione itens ao seu rancho para executar a auditoria de orçamento.
            </div>
          ) : (
            <>
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  analysis.status === 'estourado'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : analysis.status === 'alerta'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                {analysis.status === 'estourado' ? (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                ) : analysis.status === 'alerta' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                )}

                <div>
                  <div className="font-bold text-sm">
                    {analysis.status === 'estourado'
                      ? 'Atenção: Rancho ultrapassou o teto estipulado!'
                      : analysis.status === 'alerta'
                      ? 'Atenção: Rancho próximo do limite!'
                      : 'Parabéns: Rancho 100% dentro do orçamento!'}
                  </div>
                  <div className="text-xs mt-1">
                    Custo total: <span className="font-bold">R$ {analysis.totalCost.toFixed(2)}</span> de um teto de{' '}
                    <span className="font-bold">R$ {analysis.ranchoBudget.toFixed(2)}</span> ({analysis.percentageUsed}% do limite).
                  </div>
                </div>
              </div>

              {/* Two Column Grid: Pode Comprar vs Não Deve Comprar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* O QUE PODE COMPRAR */}
                <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-200/80">
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Você PODE Comprar ({analysis.canBuyItems?.length || 0})
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Prioridade
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {analysis.canBuyItems && analysis.canBuyItems.length > 0 ? (
                      analysis.canBuyItems.map((item, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-200/60 shadow-2xs">
                          <div className="flex justify-between items-baseline text-xs font-bold text-slate-800">
                            <span>{item.name}</span>
                            <span className="text-emerald-700 shrink-0 ml-2">R$ {item.cost.toFixed(2)}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.reason}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Nenhum item aprovado ainda.</p>
                    )}
                  </div>
                </div>

                {/* O QUE NÃO DEVE COMPRAR / CORTAR */}
                <div className="bg-rose-50/40 border border-rose-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-200/80">
                      <span className="font-bold text-xs uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        NÃO Deve Comprar ({analysis.cannotBuyItems?.length || 0})
                      </span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        Corte
                      </span>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {analysis.cannotBuyItems && analysis.cannotBuyItems.length > 0 ? (
                        analysis.cannotBuyItems.map((item, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-xl border border-rose-200/60 shadow-2xs">
                            <div className="flex justify-between items-baseline text-xs font-bold text-slate-800">
                              <span className="text-rose-900">{item.name}</span>
                              <span className="text-rose-600 shrink-0 ml-2">R$ {item.cost.toFixed(2)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.reason}</p>
                            {item.substitute && (
                              <div className="mt-1.5 pt-1 border-t border-slate-100 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded font-medium flex items-center gap-1">
                                <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span><strong>Troca inteligente:</strong> {item.substitute}</span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-500">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                          Excelente! Não há itens supérfluos ou excessivos na sua lista.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cut button if there are items to cut */}
                  {analysis.cannotBuyItems && analysis.cannotBuyItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCutAll}
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      Remover Todos os {analysis.cannotBuyItems.length} Itens Reprovados
                    </button>
                  )}
                </div>

              </div>

              {/* Economic Tips for Passo Fundo */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Dicas Práticas para Economizar em Passo Fundo
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {analysis.recommendations.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
