import React, { useState } from 'react';
import { ShoppingListItem, SupermarketName, UserProfile } from '../types';
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
  MessageCircle,
  Fuel,
  Clock,
  MapPin
} from 'lucide-react';
import { ShareRanchoModal } from './ShareRanchoModal';
import { copyTextToClipboard } from '../utils/shareRancho';
import { PASSO_FUNDO_STORES, calculateDistanceKm, calculateFuelAndTrip, FuelTripEstimate } from '../utils/passoFundoLocations';

interface MarketComparisonSummaryProps {
  items: ShoppingListItem[];
  budgetLimit: number;
  userProfile?: UserProfile;
}

export const MarketComparisonSummary: React.FC<MarketComparisonSummaryProps> = ({
  items,
  budgetLimit,
  userProfile,
}) => {
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (items.length === 0) return null;

  // Calculate distance for each supermarket chain in Passo Fundo
  const userLat = userProfile?.coordinates?.lat || -28.2618;
  const userLng = userProfile?.coordinates?.lng || -52.4080;

  const getMarketProximity = (market: SupermarketName) => {
    const stores = PASSO_FUNDO_STORES.filter(s => s.chain === market);
    if (stores.length === 0) return { distanceKm: 3.0, fuel: calculateFuelAndTrip(3.0) };
    
    // Find closest branch of this chain
    let minD = Infinity;
    for (const s of stores) {
      const d = calculateDistanceKm(userLat, userLng, s.lat, s.lng);
      if (d < minD) minD = d;
    }
    return {
      distanceKm: minD,
      fuel: calculateFuelAndTrip(minD),
    };
  };

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
            <Store className="w-5 h-5 text-red-600" />
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-2xs"
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
                <Check className="w-4 h-4 text-red-600" />
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

      {/* Vertical Ranking of Supermarkets in Passo Fundo - Mobile First & Senior Legible */}
      <div className="space-y-3">
        {/* Winner Highlight Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
              🏆
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-200 block">
                Mercado Mais Barato de Passo Fundo
              </span>
              <h4 className="text-lg sm:text-xl font-black text-white leading-tight">
                {cheapestSingleMarket[0]}
              </h4>
              <p className="text-xs text-red-100 mt-0.5 font-medium">
                Total do seu rancho: <strong>R$ {cheapestSingleMarket[1].toFixed(2)}</strong> (Economia de até <strong>{percentSaved}%</strong>)
              </p>
            </div>
          </div>
        </div>

        {/* Stacked Ranking List */}
        <div className="space-y-2.5">
          {marketEntries.map(([market, total], idx) => {
            const isCheapest = idx === 0;
            const diffFromLowest = total - cheapestSingleMarket[1];
            const proximity = getMarketProximity(market);
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;

            return (
              <div
                key={market}
                className={`p-3.5 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                  isCheapest
                    ? 'bg-red-50/90 border-red-400 ring-2 ring-red-500/20 shadow-xs'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${
                    isCheapest ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {medal}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-black text-slate-900 truncate">
                        {market}
                      </h4>
                      {isCheapest && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-wider">
                          Mais Barato
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        {proximity.distanceKm} km
                      </span>
                      {diffFromLowest > 0 ? (
                        <span className="text-rose-600 font-bold">
                          + R$ {diffFromLowest.toFixed(2)} mais caro
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">
                          Melhor preço total
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    R$ {total.toFixed(2)}
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    {items.length} itens
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Split Optimized Rancho Option */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  Divisão Inteligente de Mercados
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pegando cada item onde ele está mais barato:
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-black text-emerald-400">
              R$ {splitOptimizedTotal.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-300 font-bold block">
              Economiza R$ {totalMaxSavings.toFixed(2)} ({percentSaved}%)
            </span>
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
