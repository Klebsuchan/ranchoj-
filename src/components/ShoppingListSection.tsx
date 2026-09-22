import React, { useState } from 'react';
import { ShoppingListItem, SupermarketName } from '../types';
import { generateRanchoPdf } from '../utils/generateRanchoPdf';
import { 
  Trash2, 
  Plus, 
  Minus, 
  CheckSquare, 
  Square, 
  ShoppingCart, 
  Store, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Filter, 
  FileDown, 
  CheckCircle2, 
  Loader2,
  Lightbulb,
  TrendingDown,
  Share2,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';
import { getSubstitutesForProduct, ProductSubstitute } from '../utils/productSubstitutes';
import { ShareRanchoModal } from './ShareRanchoModal';
import { formatRanchoForSharing, copyTextToClipboard } from '../utils/shareRancho';

interface ShoppingListSectionProps {
  items: ShoppingListItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onToggleBought: (id: string) => void;
  onChangeMarket: (id: string, market: 'best' | SupermarketName) => void;
  onClearList: () => void;
  onSwapWithSubstitute?: (originalId: string, sub: ProductSubstitute) => void;
  budgetLimit?: number;
  householdType?: 'solo' | 'casal';
  neighborhood?: string;
}

const marketsList: SupermarketName[] = [
  'Stock Center',
  'Supermercado Boqueirão',
  'Atacadão',
  'Zaffari',
  'Bourbon',
  'Coqueiros',
];

export const ShoppingListSection: React.FC<ShoppingListSectionProps> = ({
  items,
  onUpdateQuantity,
  onSetQuantity,
  onRemoveItem,
  onToggleBought,
  onChangeMarket,
  onClearList,
  onSwapWithSubstitute,
  budgetLimit = 450,
  householdType = 'solo',
  neighborhood = 'Passo Fundo - RS',
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [quickCopied, setQuickCopied] = useState(false);

  const handleExportPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateRanchoPdf({
        items,
        householdType,
        budgetLimit,
        neighborhood,
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (e) {
      console.error('Erro ao gerar PDF do rancho:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleQuickCopy = async () => {
    const formatted = formatRanchoForSharing({
      items,
      budgetLimit,
      householdType,
      neighborhood,
      includePrices: true,
      includeStores: true,
    });
    const success = await copyTextToClipboard(formatted);
    if (success) {
      setQuickCopied(true);
      setTimeout(() => setQuickCopied(false), 3000);
    }
  };

  const handleQuickWhatsApp = () => {
    const formatted = formatRanchoForSharing({
      items,
      budgetLimit,
      householdType,
      neighborhood,
      includePrices: true,
      includeStores: true,
    });
    const encoded = encodeURIComponent(formatted);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const total = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const boughtCount = items.filter((i) => i.isBought).length;

  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
          <ShoppingCart className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 font-display">Seu Rancho está vazio</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
          Selecione itens da tabela de promoções acima ou adicione itens essenciais para calcular o melhor supermercado em Passo Fundo.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              Lista do Meu Rancho
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {boughtCount} de {items.length} itens marcados como comprados no carrinho • Total: <strong className="text-slate-800">R$ {total.toFixed(2)}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {/* Share Modal Trigger */}
          <button
            id="btn-abrir-compartilhar-rancho"
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-xs active:scale-98"
            title="Compartilhar lista via WhatsApp, redes sociais ou link direto"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartilhar</span>
          </button>

          {/* Quick WhatsApp Send */}
          <button
            id="btn-whatsapp-rancho-rapido"
            type="button"
            onClick={handleQuickWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs active:scale-98"
            title="Enviar lista formatada direto no WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Quick Copy */}
          <button
            id="btn-copiar-rancho-rapido"
            type="button"
            onClick={handleQuickCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition shadow-2xs active:scale-98 ${
              quickCopied
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="Copiar lista formatada para a área de transferência"
          >
            {quickCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar</span>
              </>
            )}
          </button>

          {/* PDF Export Button */}
          <button
            id="btn-baixar-pdf-rancho"
            type="button"
            onClick={handleExportPdf}
            disabled={isGeneratingPdf || items.length === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              pdfSuccess
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 active:scale-98 disabled:opacity-50'
            }`}
            title="Exportar documento PDF pronto para levar às compras ou imprimir"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Gerando...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>PDF Baixado!</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-slate-600" />
                <span>PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClearList}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 transition"
            title="Limpar todos os itens da lista"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* List Items */}
      <div className="divide-y divide-slate-200/70">
        {items.map((item) => {
          const prices = item.prices || {};
          const stokP = prices['Stock Center'];
          const boqueiraoP = prices['Supermercado Boqueirão'];
          const atacadaoP = prices['Atacadão'];
          const zaffariP = prices['Zaffari'];
          const bourbonP = prices['Bourbon'];
          const coqueirosP = prices['Coqueiros'];

          // Determine lowest among existing
          const validPrices = Object.entries(prices).filter(([_, p]) => typeof p === 'number' && p > 0);
          const minEntry = validPrices.sort((a, b) => (a[1] as number) - (b[1] as number))[0];
          const cheapestMkt = minEntry ? minEntry[0] : 'Stock Center';

          // Cheaper substitute recommendation
          const substitutes = getSubstitutesForProduct({
            id: item.id,
            name: item.name,
            category: item.category,
            unit: item.unit,
            brand: item.brand,
            lowestPrice: item.unitPrice,
            cheapestMarket: 'Stock Center',
            prices: [],
            highestPrice: item.unitPrice,
            isEssential: item.isEssential,
            savingsAmount: 0,
            savingsPercent: 0,
            verifiedDate: '',
          });
          const bestSub = substitutes[0] || null;

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 transition-colors ${
                item.isBought ? 'bg-slate-50/90 opacity-75' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Checkbox and Product details */}
                <div className="flex items-start gap-3 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleBought(item.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition shrink-0"
                    title={item.isBought ? 'Desmarcar' : 'Marcar como comprado'}
                  >
                    {item.isBought ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm sm:text-base ${item.isBought ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {item.name}
                      </span>
                      {item.isEssential ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Essencial
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Supérfluo
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Unitário base: R$ {item.unitPrice.toFixed(2)} / {item.unit}</span>
                      {item.brand && <span>• {item.brand}</span>}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-medium text-slate-600">Qtd:</span>
                      <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={item.quantity}
                          onChange={(e) => onSetQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-10 text-center text-xs font-bold text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Cheaper Substitute in Rancho Prompt */}
                    {bestSub && onSwapWithSubstitute && !item.isBought && (
                      <div className="mt-2 p-2 rounded-xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-amber-950">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            Substituto econômico: <strong>{bestSub.substituteName}</strong> no {bestSub.market} por <strong>R$ {bestSub.estimatedPrice.toFixed(2)}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSwapWithSubstitute(item.id, bestSub)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs transition self-start sm:self-auto shrink-0"
                          title="Substituir este produto pela marca alternativa e recalcular valor total"
                        >
                          <TrendingDown className="w-3 h-3" />
                          <span>Trocar (-R$ {(bestSub.savingsAmount * item.quantity).toFixed(2)})</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comparative Prices Across Passo Fundo Markets */}
                <div className="bg-slate-100/70 p-2.5 rounded-xl border border-slate-200/80 self-stretch lg:self-auto">
                  <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    Comparativo Passo Fundo (1 un):
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-xs">
                    <div className={`p-1.5 rounded bg-white border ${cheapestMkt === 'Stock Center' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'}`}>
                      <div className="text-[9px] font-semibold text-slate-500 truncate">Stok Center</div>
                      <div className="font-extrabold text-slate-900 text-[11px]">
                        R$ {stokP ? (stokP as number).toFixed(2) : '-'}
                      </div>
                    </div>
                    <div className={`p-1.5 rounded bg-white border ${cheapestMkt === 'Supermercado Boqueirão' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'}`}>
                      <div className="text-[9px] font-semibold text-slate-500 truncate">Boqueirão</div>
                      <div className="font-extrabold text-slate-900 text-[11px]">
                        R$ {boqueiraoP ? (boqueiraoP as number).toFixed(2) : '-'}
                      </div>
                    </div>
                    <div className={`p-1.5 rounded bg-white border ${cheapestMkt === 'Atacadão' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'}`}>
                      <div className="text-[9px] font-semibold text-slate-500 truncate">Atacadão</div>
                      <div className="font-extrabold text-slate-900 text-[11px]">
                        R$ {atacadaoP ? (atacadaoP as number).toFixed(2) : '-'}
                      </div>
                    </div>
                    <div className={`p-1.5 rounded bg-white border ${cheapestMkt === 'Zaffari' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'}`}>
                      <div className="text-[9px] font-semibold text-slate-500 truncate">Zaffari</div>
                      <div className="font-extrabold text-slate-900 text-[11px]">
                        R$ {zaffariP ? (zaffariP as number).toFixed(2) : '-'}
                      </div>
                    </div>
                    <div className={`p-1.5 rounded bg-white border ${cheapestMkt === 'Bourbon' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'}`}>
                      <div className="text-[9px] font-semibold text-slate-500 truncate">Bourbon</div>
                      <div className="font-extrabold text-slate-900 text-[11px]">
                        R$ {bourbonP ? (bourbonP as number).toFixed(2) : '-'}
                      </div>
                    </div>
                    <div className={`p-1.5 rounded bg-white border ${cheapestMkt === 'Coqueiros' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'}`}>
                      <div className="text-[9px] font-semibold text-slate-500 truncate">Coqueiros</div>
                      <div className="font-extrabold text-slate-900 text-[11px]">
                        R$ {coqueirosP ? (coqueirosP as number).toFixed(2) : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total and Market Selection */}
                <div className="flex items-center justify-between lg:justify-end gap-4 min-w-[200px]">
                  <div className="text-right">
                    <label className="text-[10px] font-medium text-slate-500 block mb-0.5">
                      Onde Comprar:
                    </label>
                    <select
                      value={item.selectedMarket}
                      onChange={(e) => onChangeMarket(item.id, e.target.value as any)}
                      className="text-xs font-semibold bg-white border border-slate-300 rounded-lg py-1 px-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[190px]"
                    >
                      <option value="best">✨ Mais Barato ({cheapestMkt})</option>
                      <option value="Stock Center">Stock Center (R$ {(stokP || item.unitPrice).toFixed(2)})</option>
                      <option value="Supermercado Boqueirão">Boqueirão (R$ {(boqueiraoP || item.unitPrice).toFixed(2)})</option>
                      <option value="Atacadão">Atacadão (R$ {(atacadaoP || item.unitPrice).toFixed(2)})</option>
                      <option value="Zaffari">Zaffari (R$ {(zaffariP || item.unitPrice).toFixed(2)})</option>
                      <option value="Bourbon">Bourbon (R$ {(bourbonP || item.unitPrice).toFixed(2)})</option>
                      <option value="Coqueiros">Coqueiros (R$ {(coqueirosP || item.unitPrice).toFixed(2)})</option>
                    </select>

                    <div className="mt-1">
                      <span className="text-xs text-slate-500">Total do item: </span>
                      <span className="text-base font-extrabold text-slate-900">
                        R$ {item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Remover do rancho"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Quick Sharing & Totals Bar */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">
              Valor Total Estimado do Rancho ({items.length} {items.length === 1 ? 'item' : 'itens'}):
            </div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              R$ {total.toFixed(2)}{' '}
              {budgetLimit > 0 && (
                <span className={`text-xs font-semibold ml-2 px-2.5 py-0.5 rounded-full ${
                  total <= budgetLimit 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {total <= budgetLimit ? 'Dentro do teto' : `Excedeu R$ ${(total - budgetLimit).toFixed(2)}`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition active:scale-98"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar Rancho</span>
          </button>

          <button
            type="button"
            onClick={handleQuickWhatsApp}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-98"
            title="Enviar no WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleQuickCopy}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs border transition active:scale-98 ${
              quickCopied
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {quickCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{quickCopied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Share Rancho Modal */}
      <ShareRanchoModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        items={items}
        budgetLimit={budgetLimit}
        householdType={householdType}
        neighborhood={neighborhood}
      />
    </div>
  );
};

