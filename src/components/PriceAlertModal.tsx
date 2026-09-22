import React, { useState, useEffect } from 'react';
import { PromotionItem, PriceAlert } from '../types';
import { Bell, BellRing, Star, X, Check, Trash2, ArrowDown, Sparkles, Store } from 'lucide-react';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PromotionItem | null;
  existingAlert?: PriceAlert;
  onSaveAlert: (item: PromotionItem, targetPrice: number) => void;
  onRemoveAlert: (itemId: string) => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  item,
  existingAlert,
  onSaveAlert,
  onRemoveAlert,
}) => {
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      if (existingAlert) {
        setTargetPrice(existingAlert.targetPrice.toFixed(2));
      } else {
        // Default target is 10% below current lowest price
        const def = (item.lowestPrice * 0.9).toFixed(2);
        setTargetPrice(def);
      }
      setError(null);
    }
  }, [item, existingAlert]);

  if (!isOpen || !item) return null;

  const currentPrice = item.lowestPrice;

  const applyDiscount = (percent: number) => {
    const calculated = (currentPrice * (1 - percent / 100)).toFixed(2);
    setTargetPrice(calculated);
    setError(null);
  };

  const handleSave = () => {
    const parsed = parseFloat(targetPrice.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      setError('Por favor, informe um valor em R$ válido maior que zero.');
      return;
    }
    if (parsed > currentPrice * 1.5) {
      setError(`O limite não pode ser muito superior ao preço atual (R$ ${currentPrice.toFixed(2)}).`);
      return;
    }
    onSaveAlert(item, parsed);
    onClose();
  };

  const handleRemove = () => {
    onRemoveAlert(item.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <BellRing className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Alerta de Preço & Favorito</h3>
              <p className="text-xs text-amber-100">Notificação salva no seu dispositivo (localStorage)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-amber-100 hover:text-white transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-slate-700 text-xs sm:text-sm">
          {/* Item Summary Card */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base block">{item.name}</span>
                <span className="text-xs text-slate-500">Unidade: {item.unit} {item.brand ? `• ${item.brand}` : ''}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Favorito
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
              <span className="text-slate-600">Melhor preço atual:</span>
              <div className="text-right">
                <span className="font-black text-emerald-700 text-sm">R$ {currentPrice.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block">no {item.cheapestMarket}</span>
              </div>
            </div>
          </div>

          {/* Target Price Input */}
          <div>
            <label className="block font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">
              Avisar-me quando o preço cair para ou abaixo de:
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">R$</span>
              <input
                type="number"
                step="0.01"
                min="0.10"
                value={targetPrice}
                onChange={(e) => {
                  setTargetPrice(e.target.value);
                  setError(null);
                }}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-lg focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                autoFocus
              />
            </div>
            {error && <p className="text-rose-600 text-xs mt-1 font-medium">{error}</p>}
          </div>

          {/* Quick preset discount pills */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Atalhos rápidos de meta de desconto:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[5, 10, 15, 20].map((pct) => {
                const calculated = (currentPrice * (1 - pct / 100)).toFixed(2);
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyDiscount(pct)}
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800 text-center transition active:scale-95"
                  >
                    <span className="font-black text-xs block text-amber-800">-{pct}%</span>
                    <span className="text-[10px] text-slate-500 block">R$ {calculated}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              O alerta é verificado instantaneamente a cada checagem de encartes dos mercados. Você verá um banner no topo da tabela e destaque dourado no produto.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          {existingAlert ? (
            <button
              type="button"
              onClick={handleRemove}
              className="min-h-[44px] px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remover Alerta</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition"
            >
              Cancelar
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-98 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Alerta (R$ {targetPrice})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
