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
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 shadow-2xs mb-3 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <PiggyBank className="w-4 h-4 text-red-600 shrink-0" />
            <span>Gasto: <strong className="text-slate-900 font-black text-sm sm:text-base">R$ {totalRancho.toFixed(2)}</strong></span>
            <span className="text-slate-500 font-semibold">/ R$ {budgetLimit.toFixed(0)}</span>
          </div>

          <div className="text-xs font-black">
            {isOver ? (
              <span className="text-rose-600 flex items-center gap-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Passou R$ {Math.abs(remaining).toFixed(2)}
              </span>
            ) : (
              <span className="text-emerald-700">
                Livre: R$ {remaining.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-300 ${
              isOver ? 'bg-rose-500' : percentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onAdjustBudget}
        className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shrink-0 transition active:scale-95"
        title="Alterar o teto do rancho"
      >
        Ajustar
      </button>
    </div>
  );
};
