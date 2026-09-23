import React from 'react';
import { 
  Banknote, 
  Store, 
  Layers, 
  ShoppingCart, 
  Check, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';

export type ShoppingStep = 'orcamento' | 'promocoes' | 'comparador' | 'carrinho';

interface StepProgressBarProps {
  currentStep: ShoppingStep;
  onSelectStep: (step: ShoppingStep) => void;
  itemsCount: number;
  totalRancho: number;
  budgetLimit: number;
}

interface StepInfo {
  id: ShoppingStep;
  number: number;
  title: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepInfo[] = [
  { id: 'orcamento', number: 1, title: 'Orçamento', shortLabel: '1. Teto', icon: Banknote },
  { id: 'promocoes', number: 2, title: 'Ofertas', shortLabel: '2. Ofertas', icon: Store },
  { id: 'comparador', number: 3, title: 'Comparar', shortLabel: '3. Comparar', icon: Layers },
  { id: 'carrinho', number: 4, title: 'No Mercado', shortLabel: '4. Carrinho', icon: ShoppingCart },
];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  onSelectStep,
  itemsCount,
  totalRancho,
  budgetLimit,
}) => {
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-2xs mb-3">
      {/* 4 Steps Navigation Row - iFood Style */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = idx < currentIdx;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep(step.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition relative active:scale-95 ${
                isActive
                  ? 'bg-red-600 text-white shadow-xs'
                  : isCompleted
                  ? 'bg-red-50 text-red-900 hover:bg-red-100/70 border border-red-200/60'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-100'
              }`}
            >
              {/* Top Step Number or Check */}
              <div className="flex items-center gap-1">
                <span
                  className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
                    isActive
                      ? 'bg-white text-red-700'
                      : isCompleted
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : step.number}
                </span>

                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-100' : isCompleted ? 'text-red-700' : 'text-slate-400'}`} />
              </div>

              {/* Step Label */}
              <span className={`text-[11px] font-bold mt-1 tracking-tight truncate max-w-full ${
                isActive ? 'text-white' : isCompleted ? 'text-red-950' : 'text-slate-600'
              }`}>
                {step.title}
              </span>

              {/* Extra Badge for Cart items count */}
              {step.id === 'carrinho' && itemsCount > 0 && (
                <span
                  className={`absolute -top-1.5 -right-1 text-[9px] font-black min-w-[17px] h-4 rounded-full flex items-center justify-center px-1 shadow-xs ${
                    isActive
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {itemsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Slim Progress Meter between steps */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="font-extrabold text-slate-900">
            Etapa {currentIdx + 1} de 4:
          </span>
          <span className="text-slate-500 truncate">
            {currentStep === 'orcamento' && 'Defina seu teto e renda'}
            {currentStep === 'promocoes' && `${itemsCount} ${itemsCount === 1 ? 'item' : 'itens'} no rancho`}
            {currentStep === 'comparador' && 'Ranking dos mercados'}
            {currentStep === 'carrinho' && 'Checklist no supermercado'}
          </span>
        </div>

        {/* Mini Budget badge */}
        {budgetLimit > 0 && (
          <div className="flex items-center gap-1 font-mono text-[10px] shrink-0">
            <span className="text-slate-400">Total:</span>
            <span className={`font-bold ${totalRancho > budgetLimit ? 'text-rose-600 font-extrabold' : 'text-red-600'}`}>
              R$ {totalRancho.toFixed(2)}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">R$ {budgetLimit.toFixed(0)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
