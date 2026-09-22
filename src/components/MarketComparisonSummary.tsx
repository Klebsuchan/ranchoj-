import React, { useState } from 'react';
import { ShoppingListItem, SupermarketName } from '../types';
import { 
  DollarSign, 
  TrendingDown, 
  Share2, 
  Check, 
  Store, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Copy,
  MessageCircle
} from 'lucide-react';
import { ShareRanchoModal } from './ShareRanchoModal';
import { copyTextToClipboard } from '../utils/shareRancho';

interface MarketComparisonSummaryProps {
  items: ShoppingListItem[];
  budgetLimit: number;
}

export const MarketComparisonSummary: React.FC<MarketComparisonSummaryProps> = ({
  items,
  budgetLimit,
}) => {
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (items.length === 0) return null;

  // Calculate totals per market
  const totals: Record<SupermarketName, number> = {
    'Stock Center': 0,
    'Supermercado Boqueirão': 0,
    'Atacadão': 0,
    'Zaffari': 0,
    'Bourbon': 0,
    'Coqueiros': 0,
  };

  let splitOptimizedTotal = 0;

  items.forEach((item) => {
    const prices = item.prices || {};
    
    // Fallback if price for that market is missing
    const stok = (prices['Stock Center'] || item.unitPrice) * item.quantity;
    const boqueirao = (prices['Supermercado Boqueirão'] || item.unitPrice * 1.02) * item.quantity;
    const atacadao = (prices['Atacadão'] || item.unitPrice) * item.quantity;
    const zaffari = (prices['Zaffari'] || item.unitPrice) * item.quantity;
    const bourbon = (prices['Bourbon'] || item.unitPrice) * item.quantity;
    const coqueiros = (prices['Coqueiros'] || item.unitPrice * 1.04) * item.quantity;

    totals['Stock Center'] += stok;
    totals['Supermercado Boqueirão'] += boqueirao;
    totals['Atacadão'] += atacadao;
    totals['Zaffari'] += zaffari;
    totals['Bourbon'] += bourbon;
    totals['Coqueiros'] += coqueiros;

    const validVals = [stok, boqueirao, atacadao, zaffari, bourbon, coqueiros].filter(v => v > 0);
    const minVal = validVals.length > 0 ? Math.min(...validVals) : item.unitPrice * item.quantity;
    splitOptimizedTotal += minVal;
  });

  const marketEntries = (Object.entries(totals) as [SupermarketName, number][]).sort(
    (a, b) => a[1] - b[1]
  );
  const cheapestSingleMarket = marketEntries[0];
  const mostExpensiveMarket = marketEntries[marketEntries.length - 1];
  const totalMaxSavings = mostExpensiveMarket[1] - splitOptimizedTotal;
  const percentSaved = mostExpensiveMarket[1] > 0 
    ? Math.round((totalMaxSavings / mostExpensiveMarket[1]) * 100) 
    : 0;

  // WhatsApp share generator
  const handleCopyWhatsApp = async () => {
    // Group items by cheapest market
    const grouped: Record<string, string[]> = {
      'Stock Center': [],
      'Supermercado Boqueirão': [],
      'Atacadão': [],
      'Zaffari': [],
      'Bourbon': [],
      'Coqueiros': [],
    };

    items.forEach((item) => {
      const prices = item.prices || {};
      const validPrices = Object.entries(prices).filter(([_, p]) => typeof p === 'number' && p > 0);
      const minEntry = validPrices.sort((a, b) => (a[1] as number) - (b[1] as number))[0];
      const bestMkt = minEntry ? minEntry[0] : 'Stock Center';
      const bestPrice = minEntry ? (minEntry[1] as number) : item.unitPrice;

      if (!grouped[bestMkt]) grouped[bestMkt] = [];
      grouped[bestMkt].push(`• ${item.quantity}x ${item.name} (~R$ ${(bestPrice * item.quantity).toFixed(2)})`);
    });

    let text = `🛒 *MEU RANCHO ECONÔMICO - PASSO FUNDO*\n`;
    text += `💰 Teto de Orçamento: R$ ${budgetLimit.toFixed(2)}\n`;
    text += `📉 Custo Otimizado: R$ ${splitOptimizedTotal.toFixed(2)} (Economia de R$ ${totalMaxSavings.toFixed(2)})\n\n`;

    Object.entries(grouped).forEach(([mkt, list]) => {
      if (list.length > 0) {
        text += `🏬 *Comprar no ${mkt}:*\n`;
        text += list.join('\n') + '\n\n';
      }
    });

    text += `Gerado com Comparador de Rancho Passo Fundo.`;

    const success = await copyTextToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200/80 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600" />
            Comparativo Geral de Custo em Passo Fundo
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Veja quanto custará a sua lista inteira em cada rede ou no rancho dividido inteligente.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-2xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar Rancho</span>
          </button>

          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Supermarkets Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {marketEntries.map(([market, total], idx) => {
          const isCheapest = idx === 0;
          const diffFromLowest = total - splitOptimizedTotal;

          return (
            <div
              key={market}
              className={`rounded-xl p-3.5 border transition-all ${
                isCheapest
                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700">{market}</span>
                {isCheapest && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                    1º Lugar
                  </span>
                )}
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900">
                R$ {total.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {isCheapest ? (
                  <span className="text-emerald-700 font-semibold">Melhor rede única</span>
                ) : (
                  <span>+ R$ {diffFromLowest.toFixed(2)} mais caro</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Optimized Split Card */}
        <div className="rounded-xl p-3.5 border bg-slate-900 text-white border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Rancho Dividido
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950">
                Máxima Economia
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              R$ {splitOptimizedTotal.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-300 mt-1">
              Comprando cada produto no mercado com a melhor oferta.
            </p>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            Economia de R$ {totalMaxSavings.toFixed(2)} ({percentSaved}%)
          </div>
        </div>
      </div>

      <ShareRanchoModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        items={items}
        budgetLimit={budgetLimit}
      />
    </div>
  );
};
