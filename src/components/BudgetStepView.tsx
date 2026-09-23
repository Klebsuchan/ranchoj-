import React, { useState } from 'react';
import { BudgetProfile, UserProfile, PromotionItem, ShoppingListItem } from '../types';
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
  TrendingDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RanchoProntoSelector } from './RanchoProntoSelector';

interface BudgetStepViewProps {
  profile: BudgetProfile;
  onUpdateProfile: (updated: Partial<BudgetProfile>) => void;
  totalRancho: number;
  onNextStep: () => void;
  onOpenAdvisor: () => void;
  isAnalyzingAdvisor?: boolean;
  userProfile?: UserProfile;
  promotions?: PromotionItem[];
  onApplyRanchoPronto?: (items: ShoppingListItem[], budget: number, optionTitle: string) => void;
  onOpenMap?: () => void;
}

const SALARY_PRESETS = [1518, 2200, 3000, 4200, 6000];

export const BudgetStepView: React.FC<BudgetStepViewProps> = ({
  profile,
  onUpdateProfile,
  totalRancho,
  onNextStep,
  onOpenAdvisor,
  isAnalyzingAdvisor = false,
  userProfile,
  promotions = [],
  onApplyRanchoPronto,
  onOpenMap,
}) => {
  const [showManualBudget, setShowManualBudget] = useState(false);
  const numPersons = profile.familyMembers || (profile.householdType === 'casal' ? 2 : 1);
  const teto = profile.ranchoBudget || 350;
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
    <div className="space-y-5 pb-6">
      {/* 1. SEÇÃO PRINCIPAL: Rancho Pronto Básico por Valor & 3 Opções Perto de Você */}
      {userProfile && onApplyRanchoPronto && (
        <RanchoProntoSelector
          userProfile={userProfile}
          promotions={promotions}
          initialBudget={teto}
          onApplyRancho={(items, budget, optionTitle) => {
            onUpdateProfile({ ranchoBudget: budget });
            onApplyRanchoPronto(items, budget, optionTitle);
          }}
          onOpenMap={onOpenMap}
        />
      )}

      {/* Accordion / Toggle for Manual Custom Planning */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-0.5">
              <PiggyBank className="w-4 h-4 text-emerald-600" />
              <span>Personalizar Teto e Renda Familiar</span>
            </div>
            <p className="text-xs text-slate-500">
              Ajuste sua renda mensal ou defina um teto manual personalizado.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowManualBudget(!showManualBudget)}
            className="py-1 px-2.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1"
          >
            <span>{showManualBudget ? 'Ocultar' : 'Ajustar Detalhes'}</span>
            {showManualBudget ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showManualBudget && (
          <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in">
            {/* 1. Salário & Renda Familiar */}
            <div className="space-y-2">
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
            <div className="space-y-2">
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

            {/* 3. Slider Teto */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Teto Máximo para as Compras:
                </label>
                <span className="text-base font-black text-emerald-700">
                  R$ {teto.toFixed(2)}
                </span>
              </div>

              <input
                type="range"
                min={100}
                max={3000}
                step={25}
                value={teto}
                onChange={(e) => onUpdateProfile({ ranchoBudget: Number(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Por Pessoa</div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">
                    R$ {tetoPorPessoa.toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">% da Renda</div>
                  <div className="text-sm font-black text-emerald-700 mt-0.5">
                    {salario > 0 ? `${percentOfSalary}%` : '—'}
                  </div>
                </div>
              </div>
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
              Avalia se seu teto de R$ {teto.toFixed(2)} comporta o que é essencial em Passo Fundo
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
          <span>Avançar para Ofertas & Catálogo (Etapa 2)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
