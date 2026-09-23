import React from 'react';
import { PiggyBank, ArrowUpRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CompactBudgetHeaderProps {
  totalRancho: number;
  budgetLimit: number;
  onAdjustBudget: () => void;
}

export const CompactBudgetHeader: React.FC<CompactBudgetHeaderProps> = ({
  totalRancho,
  budgetLimit,
  onAdjustBudget,
}) => {
  const remaining = budgetLimit - totalRancho;
  const isOver = totalRancho > budgetLimit && budgetLimit > 0;
  const percentage = budgetLimit > 0 ? Math.min(Math.round((totalRancho / budgetLimit) * 100), 100) : 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 shadow-2xs mb-3 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <PiggyBank className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Gasto: <strong className="text-slate-900 font-extrabold">R$ {totalRancho.toFixed(2)}</strong></span>
            <span className="text-slate-400 font-normal">/ R$ {budgetLimit.toFixed(0)}</span>
          </div>

          <div className="text-[11px] font-bold">
            {isOver ? (
              <span className="text-rose-600 flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />
                Estourou R$ {Math.abs(remaining).toFixed(2)}
              </span>
            ) : (
              <span className="text-red-700">
                Restam R$ {remaining.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isOver ? 'bg-rose-500' : percentage > 85 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onAdjustBudget}
        className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition"
        title="Voltar para a Etapa 1 e alterar o teto"
      >
        Ajustar
      </button>
    </div>
  );
};
