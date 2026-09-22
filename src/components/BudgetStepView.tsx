import React from 'react';
import { BudgetProfile } from '../types';
import { 
  Banknote, 
  Users, 
  User, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  PiggyBank,
  TrendingDown
} from 'lucide-react';

interface BudgetStepViewProps {
  profile: BudgetProfile;
  onUpdateProfile: (updated: Partial<BudgetProfile>) => void;
  totalRancho: number;
  onNextStep: () => void;
  onOpenAdvisor: () => void;
  isAnalyzingAdvisor?: boolean;
}

const SALARY_PRESETS = [1518, 2200, 3000, 4200, 6000];

export const BudgetStepView: React.FC<BudgetStepViewProps> = ({
  profile,
  onUpdateProfile,
  totalRancho,
  onNextStep,
  onOpenAdvisor,
  isAnalyzingAdvisor = false,
}) => {
  const numPersons = profile.familyMembers || (profile.householdType === 'casal' ? 2 : 1);
  const teto = profile.ranchoBudget || 450;
  const salario = profile.monthlyIncome || 0;
  const tetoPorPessoa = numPersons > 0 ? teto / numPersons : teto;
  const percentOfSalary = salario > 0 ? Math.round((teto / salario) * 100) : 0;

  const setPersons = (count: number) => {
    onUpdateProfile({
      familyMembers: count,
      householdType: count === 1 ? 'solo' : 'casal',
    });
  };

  const applySalaryPercent = (pct: number) => {
    if (salario > 0) {
      const calculated = Math.round((salario * pct) / 100);
      onUpdateProfile({ ranchoBudget: calculated });
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Etapa 1 de 4 • Planejamento Orçamentário</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold font-display text-white">
          Quanto você quer gastar no rancho?
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Defina seu teto financeiro para o mês. O RanchoJá vai monitorar cada produto colocado no carrinho para garantir que você não gaste além da sua meta.
        </p>
      </div>

      {/* 1. Salário & Renda Familiar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>Sua Renda / Salário Mensal</span>
          </label>
          <span className="text-[11px] text-slate-400">Opcional para cálculo de %</span>
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
            R$
          </span>
          <input
            type="number"
            min={0}
            step={50}
            value={salario || ''}
            onChange={(e) => onUpdateProfile({ monthlyIncome: Number(e.target.value) || 0 })}
            placeholder="Ex: 2500"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Quick Salary Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] text-slate-400 font-medium">Sugestões:</span>
          {SALARY_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onUpdateProfile({ monthlyIncome: preset })}
              className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border transition ${
                salario === preset
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              R$ {preset.toLocaleString('pt-BR')}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Pessoas na Casa */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Quantas pessoas consomem este rancho?</span>
        </label>

        <div className="grid grid-cols-4 gap-2">
          {[
            { count: 1, label: '1 pessoa', desc: 'Mora só' },
            { count: 2, label: '2 pessoas', desc: 'Casal' },
            { count: 3, label: '3 pessoas', desc: 'Família' },
            { count: 4, label: '4+ pessoas', desc: 'Grande' },
          ].map((item) => {
            const isSelected = numPersons === item.count;
            return (
              <button
                key={item.count}
                type="button"
                onClick={() => setPersons(item.count)}
                className={`py-2.5 px-2 rounded-xl text-center border transition flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <span className="text-xs font-extrabold">{item.label}</span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Teto do Rancho (Budget Target) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <PiggyBank className="w-4 h-4 text-emerald-600" />
            <span>Teto Máximo para as Compras</span>
          </label>
          <span className="text-base font-black text-emerald-700">
            R$ {teto.toFixed(2)}
          </span>
        </div>

        {/* Budget Slider */}
        <input
          type="range"
          min={150}
          max={3000}
          step={25}
          value={teto}
          onChange={(e) => onUpdateProfile({ ranchoBudget: Number(e.target.value) })}
          className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
        />

        {/* Per-person and % of salary indicators */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Por Pessoa</div>
            <div className="text-sm font-black text-slate-800 mt-0.5">
              R$ {tetoPorPessoa.toFixed(2)}
            </div>
            <div className="text-[9px] text-slate-400">mensal estimado</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold">% da Renda</div>
            <div className="text-sm font-black text-emerald-700 mt-0.5">
              {salario > 0 ? `${percentOfSalary}%` : '—'}
            </div>
            <div className="text-[9px] text-slate-400">
              {salario > 0 ? (percentOfSalary <= 25 ? 'Faixa Ideal' : 'Alerta Orçamentário') : 'Informe a renda'}
            </div>
          </div>
        </div>

        {/* Quick Percent Buttons if salary is entered */}
        {salario > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Recomendado:</span>
            <div className="flex gap-1.5">
              {[
                { pct: 15, label: '15% (Econômico)' },
                { pct: 20, label: '20% (Equilibrado)' },
                { pct: 25, label: '25% (Confortável)' },
              ].map((rec) => (
                <button
                  key={rec.pct}
                  type="button"
                  onClick={() => applySalaryPercent(rec.pct)}
                  className="text-[10px] font-bold py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition"
                >
                  {rec.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Advisor Callout (Consultor de Economia) */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white">Consultor de Economia Inteligente</div>
            <div className="text-[10px] text-slate-300 truncate">
              Avalia se seu teto comporta o que é essencial sem passar aperto
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAdvisor}
          disabled={isAnalyzingAdvisor}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] shrink-0 transition"
        >
          {isAnalyzingAdvisor ? 'Analisando...' : 'Consultar'}
        </button>
      </div>

      {/* Main Step Navigation Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onNextStep}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98"
        >
          <span>Continuar para Escolher Produtos (Etapa 2)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
