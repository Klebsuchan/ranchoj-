import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Wallet, 
  User, 
  Users, 
  ShoppingCart, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Wheat, 
  Drumstick, 
  SprayCan, 
  Smile, 
  Flame,
  Info
} from 'lucide-react';
import { BASIC_RANCHO_ANALYSIS, buildBasicRanchoItems } from '../utils/basicRanchoPresets';
import { ShoppingListItem } from '../types';
import { BasicRanchoAnalysisModal } from './BasicRanchoAnalysisModal';

interface BasicRanchoColinhaCardProps {
  onApplyPreset: (household: 'solo' | 'casal', items: ShoppingListItem[], budget: number) => void;
  currentHousehold?: 'solo' | 'casal';
  variant?: 'featured' | 'compact';
}

export const BasicRanchoColinhaCard: React.FC<BasicRanchoColinhaCardProps> = ({
  onApplyPreset,
  currentHousehold = 'solo',
  variant = 'featured',
}) => {
  const [activeTab, setActiveTab] = useState<'solo' | 'casal'>(currentHousehold);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [successHousehold, setSuccessHousehold] = useState<'solo' | 'casal' | null>(null);

  const soloData = BASIC_RANCHO_ANALYSIS.solo;
  const casalData = BASIC_RANCHO_ANALYSIS.casal;

  const handleApply = (household: 'solo' | 'casal') => {
    const items = buildBasicRanchoItems(household);
    const budget = BASIC_RANCHO_ANALYSIS[household].ranchoBudget;
    onApplyPreset(household, items, budget);
    setSuccessHousehold(household);
    setTimeout(() => setSuccessHousehold(null), 3500);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-red-950 via-slate-900 to-slate-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-red-500/20 shadow-lg mb-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Colinha do Rancho Básico
              </span>
              <span className="text-[11px] text-slate-400">
                Base Realista: Salário Mínimo R$ 1.410 - Aluguel e Contas
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
              Aperte em cima e monte o rancho básico essencial com 1 clique
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Calculado para a sobra real da renda: <strong>R$ 400 para 1 pessoa</strong> ou <strong>R$ 800 para casal</strong>. Já inclui carne, arroz, massa, hortifrúti e <strong>material de limpeza e higiene pessoal completa</strong> (não é só comida!).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAnalysisModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition self-start md:self-center shrink-0"
          >
            <Info className="w-4 h-4 text-red-400" />
            <span>Ver Análise dos R$ 1.410</span>
          </button>
        </div>

        {/* Quick Summary Pill preview */}
        <div className="relative z-10 py-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300">
          <span className="text-[11px] text-slate-400 font-medium">O que entra na colinha:</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-200 text-[11px]">
            <Wheat className="w-3 h-3 text-amber-400" /> Arroz 5kg, Feijão & Massas
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-200 text-[11px]">
            <Drumstick className="w-3 h-3 text-rose-400" /> Ovos (30un), Frango & Carne
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-200 text-[11px]">
            <Flame className="w-3 h-3 text-red-400" /> Batata, Cebola & Banana
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-200 text-[11px]">
            <SprayCan className="w-3 h-3 text-sky-400" /> Detergente, Sabão & Água Sanitária
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-200 text-[11px]">
            <Smile className="w-3 h-3 text-indigo-400" /> Papel Higiênico, Sabonete & Pasta
          </span>
        </div>

        {/* Two Preset Cards: Solo (R$ 400) and Casal (R$ 800) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          
          {/* Preset 1: Sozinho (R$ 400) */}
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-red-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-300">
                  <User className="w-3.5 h-3.5" />
                  Moro Sozinho (1 Pessoa)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-700/50 font-semibold">
                  Teto: R$ 400,00
                </span>
              </div>

              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">
                    R$ {soloData.estimatedCostStokCenter.toFixed(2)}
                  </span>
                  <span className="text-xs text-red-400 font-semibold">
                    no Stok Center PF
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Sobra <strong>R$ {(400 - soloData.estimatedCostStokCenter).toFixed(2)} de folga</strong> no teto de R$ 400. Lista com 22 itens balanceados de alimentação, limpeza e higiene para 30 dias.
                </p>
              </div>
            </div>

            <button
              id="btn-montar-rancho-solo-400"
              type="button"
              onClick={() => handleApply('solo')}
              className={`mt-4 w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-md ${
                successHousehold === 'solo'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {successHousehold === 'solo' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Rancho de 1 Pessoa Montado!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Aperte Aqui: Montar Rancho Solo (R$ 400)</span>
                </>
              )}
            </button>
          </div>

          {/* Preset 2: Casal (R$ 800) */}
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-red-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-300">
                  <Users className="w-3.5 h-3.5" />
                  Em Casal (2 Pessoas)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-700/50 font-semibold">
                  Teto: R$ 800,00 estourando
                </span>
              </div>

              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">
                    R$ {casalData.estimatedCostStokCenter.toFixed(2)}
                  </span>
                  <span className="text-xs text-red-400 font-semibold">
                    no Stok Center PF
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Sobra <strong>R$ {(800 - casalData.estimatedCostStokCenter).toFixed(2)} de margem</strong> no teto de R$ 800. Quantidades ampliadas para 2 adultos (60 ovos, 10kg arroz, carnes, limpeza pesada e higiene).
                </p>
              </div>
            </div>

            <button
              id="btn-montar-rancho-casal-800"
              type="button"
              onClick={() => handleApply('casal')}
              className={`mt-4 w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-md ${
                successHousehold === 'casal'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {successHousehold === 'casal' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Rancho de Casal Montado!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Aperte Aqui: Montar Rancho Casal (R$ 800)</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      <BasicRanchoAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        onApplyBasicRancho={onApplyPreset}
        initialHousehold={activeTab}
      />
    </>
  );
};
