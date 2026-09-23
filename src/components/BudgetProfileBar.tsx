import React, { useState } from 'react';
import { BudgetProfile } from '../types';
import { 
  Users, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Banknote,
  PiggyBank,
  Check
} from 'lucide-react';

interface BudgetProfileBarProps {
  profile: BudgetProfile;
  onUpdateProfile: (updated: Partial<BudgetProfile>) => void;
  totalRancho: number;
  onOpenAdvisor: () => void;
  isAnalyzing?: boolean;
}

export const BudgetProfileBar: React.FC<BudgetProfileBarProps> = ({
  profile,
  onUpdateProfile,
  totalRancho,
  onOpenAdvisor,
  isAnalyzing = false,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const numPersons = profile.familyMembers || (profile.householdType === 'casal' ? 2 : 1);
  const tetoTotal = profile.ranchoBudget || 0;
  const salario = profile.monthlyIncome || 0;
  const remaining = tetoTotal - totalRancho;
  const percentage = tetoTotal > 0 ? Math.min(Math.round((totalRancho / tetoTotal) * 100), 100) : 0;
  const isOver = totalRancho > tetoTotal;
  const isNearLimit = !isOver && percentage >= 85;

  // Metrics per person & salary percentage
  const tetoPorPessoa = numPersons > 0 ? tetoTotal / numPersons : tetoTotal;
  const gastoPorPessoa = numPersons > 0 ? totalRancho / numPersons : totalRancho;
  const percentOfSalary = salario > 0 ? Math.round((tetoTotal / salario) * 100) : 0;

  // Quick salary presets
  const salaryPresets = [1518, 2000, 2500, 3200, 4500, 6000];

  // Quick budget percentage presets based on current salary
  const applyPercentOfSalary = (pct: number) => {
    if (salario > 0) {
      const calculated = Math.round((salario * pct) / 100);
      onUpdateProfile({ ranchoBudget: calculated });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-3.5 mb-4">
      {/* Mobile-first Budget Meter & Status */}
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span className="text-xs font-bold text-slate-800">
                Teto da Compra do Mês / Rancho
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {numPersons === 1 ? '1 Pessoa' : `${numPersons} Pessoas`} • {profile.cycleDays || 30} dias
              {salario > 0 && ` • ${percentOfSalary}% da renda`}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-black text-slate-900">
              R$ {totalRancho.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Meta: R$ {tetoTotal.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Highlight Card: Rancho por Pessoa */}
        <div className="bg-red-50/70 border border-red-100/90 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-red-900 font-semibold">
            <Users className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="text-[11px]">Rancho por Pessoa:</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-extrabold text-red-800">
              R$ {gastoPorPessoa.toFixed(2)}
            </span>
            <span className="text-[10px] text-red-600 font-medium ml-1">
              / R$ {tetoPorPessoa.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOver 
                ? 'bg-rose-500' 
                : isNearLimit 
                ? 'bg-amber-400' 
                : 'bg-red-600'
            }`}
            style={{ width: `${Math.min(100, (totalRancho / (tetoTotal || 1)) * 100)}%` }}
          />
        </div>

        {/* Status Indicators & Free Balance */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-semibold">
            {isOver ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="text-rose-600 text-[11px]">Estourou R$ {Math.abs(remaining).toFixed(2)}</span>
              </>
            ) : isNearLimit ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-amber-700 text-[11px]">Resta R$ {remaining.toFixed(2)} (Atenção)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="text-red-700 text-[11px]">Resta R$ {remaining.toFixed(2)} livre</span>
              </>
            )}
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {percentage}% usado
          </span>
        </div>

        {/* Quick Mobile Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="btn-analisar-rancho"
            type="button"
            onClick={onOpenAdvisor}
            disabled={isAnalyzing}
            className="min-h-[44px] py-2 px-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">{isAnalyzing ? "Analisando..." : "Consultor IA"}</span>
          </button>

          <button
            id="btn-ajustar-teto-salario"
            type="button"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="min-h-[44px] py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-200"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{isConfigOpen ? 'Fechar Ajuste' : 'Ajustar Salário & Teto'}</span>
            {isConfigOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Expandable Configuration Drawer: Salário, Pessoas e Teto */}
      {isConfigOpen && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3.5 animate-in fade-in duration-150">
          
          {/* 1. Salário / Renda Líquida */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input-renda" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-red-600" />
                Seu Salário / Renda Mensal (R$)
              </label>
              {salario > 0 && (
                <span className="text-[10px] text-red-700 bg-red-100/70 font-semibold px-2 py-0.5 rounded-full">
                  Definido
                </span>
              )}
            </div>

            <div className="relative mb-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
              <input
                id="input-renda"
                type="number"
                min={0}
                step={50}
                value={salario || ''}
                onChange={(e) => onUpdateProfile({ monthlyIncome: Number(e.target.value) || 0 })}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ex: 2500"
              />
            </div>

            {/* Quick salary buttons */}
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-slate-400 self-center mr-1">Atalhos:</span>
              {salaryPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onUpdateProfile({ monthlyIncome: val })}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition ${
                    salario === val
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  R$ {val}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Divisão por Pessoas */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Quantas pessoas dividem este rancho?
            </label>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((count) => {
                const isSelected = numPersons === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => onUpdateProfile({ 
                      familyMembers: count, 
                      householdType: count === 1 ? 'solo' : 'casal' 
                    })}
                    className={`py-2 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{count === 5 ? '5+' : count}</span>
                    <span className="text-[9px] font-normal opacity-80">
                      {count === 1 ? 'pessoa' : 'pessoas'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Teto para o Rancho / Compra do Mês */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="input-teto-rancho" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <PiggyBank className="w-3.5 h-3.5 text-amber-600" />
                Teto Estipulado para o Rancho (R$)
              </label>
              
              {/* Cycle: 15d ou 30d */}
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={() => onUpdateProfile({ cycleDays: 15 })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    profile.cycleDays === 15 
                      ? 'bg-red-600 text-white' 
                      : 'text-slate-600 bg-white border border-slate-200'
                  }`}
                  title="Para 15 dias (quinzena)"
                >
                  15 dias
                </button>
                <button 
                  type="button"
                  onClick={() => onUpdateProfile({ cycleDays: 30 })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    profile.cycleDays === 30 || !profile.cycleDays
                      ? 'bg-red-600 text-white' 
                      : 'text-slate-600 bg-white border border-slate-200'
                  }`}
                  title="Para o mês inteiro (30 dias)"
                >
                  30 dias
                </button>
              </div>
            </div>

            <div className="relative mb-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
              <input
                id="input-teto-rancho"
                type="number"
                min={50}
                step={25}
                value={tetoTotal || ''}
                onChange={(e) => onUpdateProfile({ ranchoBudget: Number(e.target.value) || 0 })}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ex: 600"
              />
            </div>

            {/* Smart salary % suggestion chips */}
            {salario > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 block">
                  Sugestões baseadas no seu salário de R$ {salario}:
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { pct: 20, label: 'Econômico (20%)' },
                    { pct: 25, label: 'Ideal (25%)' },
                    { pct: 30, label: 'Médio (30%)' },
                    { pct: 35, label: 'Família (35%)' },
                  ].map(({ pct, label }) => {
                    const suggestedVal = Math.round((salario * pct) / 100);
                    const isCurrent = tetoTotal === suggestedVal;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => applyPercentOfSalary(pct)}
                        className={`p-1.5 rounded-lg text-center transition flex flex-col items-center ${
                          isCurrent
                            ? 'bg-red-600 text-white'
                            : 'bg-white border border-slate-200 hover:border-red-300 text-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-bold">R$ {suggestedVal}</span>
                        <span className="text-[9px] opacity-75">{pct}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Calculated per person summary */}
            <div className="mt-2.5 pt-2 border-t border-slate-200 text-center">
              <span className="text-[11px] text-slate-600">
                Seu teto por pessoa fica em: <strong className="text-red-700">R$ {tetoPorPessoa.toFixed(2)}</strong> / pessoa
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsConfigOpen(false)}
            className="w-full py-2 rounded-xl bg-slate-900 text-white font-bold text-xs active:scale-98 transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Salvar Ajustes do Orçamento</span>
          </button>
        </div>
      )}
    </div>
  );
};
