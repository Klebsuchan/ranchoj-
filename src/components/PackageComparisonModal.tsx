import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { compareTwoPackages, PackageComparisonResult } from '../utils/unitPriceCalculator';

interface PackageComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductName?: string;
  initialAmountA?: number;
  initialUnitA?: 'kg' | 'g' | 'L' | 'ml' | 'un';
  initialPriceA?: number;
}

export const PackageComparisonModal: React.FC<PackageComparisonModalProps> = ({
  isOpen,
  onClose,
  initialProductName = 'Ex: Arroz',
  initialAmountA = 5,
  initialUnitA = 'kg',
  initialPriceA = 24.90,
}) => {
  // Option A state
  const [productName, setProductName] = useState(initialProductName);
  const [amountA, setAmountA] = useState<number>(initialAmountA);
  const [unitA, setUnitA] = useState<'kg' | 'g' | 'L' | 'ml' | 'un'>(initialUnitA);
  const [priceA, setPriceA] = useState<number>(initialPriceA);

  // Option B state
  const [amountB, setAmountB] = useState<number>(1);
  const [unitB, setUnitB] = useState<'kg' | 'g' | 'L' | 'ml' | 'un'>('kg');
  const [priceB, setPriceB] = useState<number>(6.29);

  if (!isOpen) return null;

  const result: PackageComparisonResult = compareTwoPackages(
    amountA,
    unitA,
    priceA,
    amountB,
    unitB,
    priceB
  );

  // Quick Presets from Passo Fundo Supermarkets
  const applyPreset = (preset: {
    name: string;
    amtA: number;
    uA: 'kg' | 'g' | 'L' | 'ml' | 'un';
    pA: number;
    amtB: number;
    uB: 'kg' | 'g' | 'L' | 'ml' | 'un';
    pB: number;
  }) => {
    setProductName(preset.name);
    setAmountA(preset.amtA);
    setUnitA(preset.uA);
    setPriceA(preset.pA);
    setAmountB(preset.amtB);
    setUnitB(preset.uB);
    setPriceB(preset.pB);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Comparador Real de Preço por Quilo ou Unidade
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Descubra qual embalagem tem o menor custo real por kg, litro ou unidade
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Presets Chips */}
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
              Exemplos Frequentes em Passo Fundo:
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => applyPreset({
                  name: 'Arroz',
                  amtA: 5, uA: 'kg', pA: 24.90,
                  amtB: 1, uB: 'kg', pB: 6.29
                })}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                🌾 Arroz 5kg vs 1kg
              </button>
              <button
                type="button"
                onClick={() => applyPreset({
                  name: 'Ovos',
                  amtA: 30, uA: 'un', pA: 16.90,
                  amtB: 12, uB: 'un', pB: 8.90
                })}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                🥚 Ovos 30un vs 12un
              </button>
              <button
                type="button"
                onClick={() => applyPreset({
                  name: 'Café',
                  amtA: 500, uA: 'g', pA: 17.90,
                  amtB: 250, uB: 'g', pB: 10.49
                })}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                ☕ Café 500g vs 250g
              </button>
              <button
                type="button"
                onClick={() => applyPreset({
                  name: 'Detergente/Sabão',
                  amtA: 2, uA: 'L', pA: 14.50,
                  amtB: 500, uB: 'ml', pB: 4.80
                })}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                🧴 Sabão 2L vs 500ml
              </button>
            </div>
          </div>

          {/* Two Package Comparison Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Embalagem A */}
            <div className={`p-4 rounded-2xl border transition-all ${
              result.cheaperOption === 'A' 
                ? 'bg-red-50/70 border-red-400 ring-2 ring-red-500/20' 
                : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Embalagem A (Maior / Atacado)
                </span>
                {result.cheaperOption === 'A' && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white">
                    Mais Barata!
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Peso ou Quantidade:
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="input-amount-a"
                      type="number"
                      step="any"
                      min="0.01"
                      value={amountA || ''}
                      onChange={(e) => setAmountA(parseFloat(e.target.value) || 0)}
                      className="w-2/3 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <select
                      id="select-unit-a"
                      value={unitA}
                      onChange={(e) => setUnitA(e.target.value as any)}
                      className="w-1/3 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="L">L</option>
                      <option value="ml">ml</option>
                      <option value="un">un</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Preço da Embalagem (R$):
                  </label>
                  <input
                    id="input-price-a"
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceA || ''}
                    onChange={(e) => setPriceA(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-medium">Custo Real Calculado:</span>
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    R$ {result.pricePerUnitA.toFixed(2)} <span className="text-xs font-bold text-slate-500">/ {result.standardUnit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Embalagem B */}
            <div className={`p-4 rounded-2xl border transition-all ${
              result.cheaperOption === 'B' 
                ? 'bg-red-50/70 border-red-400 ring-2 ring-red-500/20' 
                : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Embalagem B (Menor / Tradicional)
                </span>
                {result.cheaperOption === 'B' && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white">
                    Mais Barata!
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Peso ou Quantidade:
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="input-amount-b"
                      type="number"
                      step="any"
                      min="0.01"
                      value={amountB || ''}
                      onChange={(e) => setAmountB(parseFloat(e.target.value) || 0)}
                      className="w-2/3 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <select
                      id="select-unit-b"
                      value={unitB}
                      onChange={(e) => setUnitB(e.target.value as any)}
                      className="w-1/3 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="L">L</option>
                      <option value="ml">ml</option>
                      <option value="un">un</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Preço da Embalagem (R$):
                  </label>
                  <input
                    id="input-price-b"
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceB || ''}
                    onChange={(e) => setPriceB(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-medium">Custo Real Calculado:</span>
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    R$ {result.pricePerUnitB.toFixed(2)} <span className="text-xs font-bold text-slate-500">/ {result.standardUnit}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Verdict Box */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Veredito da Economia Real
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-100">
                  {result.recommendation}
                </p>
                {result.savingsPercent > 0 && (
                  <p className="text-[11px] text-slate-300">
                    Às vezes a embalagem "tamanho família" parece vantajosa pelo volume, mas nem sempre é a mais barata. O cálculo por {result.standardUnit} garante que você nunca pague a mais!
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
