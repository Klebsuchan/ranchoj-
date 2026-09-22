import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingListItem } from '../types';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Link2, 
  Sparkles, 
  Eye, 
  Settings2, 
  ExternalLink,
  Smartphone,
  Send
} from 'lucide-react';
import { 
  formatRanchoForSharing, 
  encodeRanchoToUrl, 
  copyTextToClipboard,
  createShortShareLink
} from '../utils/shareRancho';
import { RanchoJaIcon } from './RanchoJaLogo';

interface ShareRanchoModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingListItem[];
  budgetLimit?: number;
  householdType?: 'solo' | 'casal';
  neighborhood?: string;
  cityName?: string;
}

export const ShareRanchoModal: React.FC<ShareRanchoModalProps> = ({
  isOpen,
  onClose,
  items,
  budgetLimit = 450,
  householdType = 'solo',
  neighborhood = 'Passo Fundo - RS',
  cityName = 'Passo Fundo',
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [includePrices, setIncludePrices] = useState(true);
  const [includeStores, setIncludeStores] = useState(true);
  const [includeLink, setIncludeLink] = useState(true);
  const [includeOnlyPending, setIncludeOnlyPending] = useState(false);
  const [shortUrl, setShortUrl] = useState<string>('');
  const [isGeneratingShortUrl, setIsGeneratingShortUrl] = useState(false);

  // Generate fallback shareable URL
  const fallbackShareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const shareCode = encodeRanchoToUrl(items, budgetLimit, householdType);
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?share_rancho=${shareCode}`;
  }, [items, budgetLimit, householdType]);

  // Request true shortened link from server on open or items change
  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    let isMounted = true;
    setIsGeneratingShortUrl(true);

    createShortShareLink(items, budgetLimit, householdType, cityName || neighborhood)
      .then((res) => {
        if (isMounted) {
          setShortUrl(res.shortUrl);
          setIsGeneratingShortUrl(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setShortUrl(fallbackShareUrl);
          setIsGeneratingShortUrl(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, items, budgetLimit, householdType, cityName, neighborhood, fallbackShareUrl]);

  const activeShareUrl = shortUrl || fallbackShareUrl;

  // Formatted text
  const formattedText = useMemo(() => {
    return formatRanchoForSharing({
      items,
      budgetLimit,
      householdType,
      neighborhood: cityName || neighborhood,
      includePrices,
      includeStores,
      includeOnlyPending,
      shareUrl: includeLink ? activeShareUrl : undefined,
    });
  }, [
    items,
    budgetLimit,
    householdType,
    neighborhood,
    cityName,
    includePrices,
    includeStores,
    includeOnlyPending,
    includeLink,
    activeShareUrl,
  ]);

  if (!isOpen) return null;

  const handleCopyText = async () => {
    const success = await copyTextToClipboard(formattedText);
    if (success) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyTextToClipboard(activeShareUrl);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(formattedText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Rancho - RanchoJá',
          text: formattedText,
          url: activeShareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Compartilhamento cancelado:', err);
      }
    } else {
      handleCopyText();
    }
  };

  const total = items.reduce((acc, i) => acc + i.totalPrice, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-emerald-950 via-slate-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RanchoJaIcon size={40} />
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display flex items-center gap-2">
                <span>Compartilhar Meu Rancho</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white">RanchoJá</span>
              </h2>
              <p className="text-xs text-slate-300">
                Gere um link encurtado para importar a lista em outro navegador ou envie no WhatsApp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-emerald-100 hover:text-white transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Row */}
        <div className="p-4 sm:p-5 bg-emerald-50/60 border-b border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* WhatsApp Primary Button */}
          <button
            id="btn-compartilhar-whatsapp"
            type="button"
            onClick={handleSendWhatsApp}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-98"
          >
            <MessageCircle className="w-4 h-4 fill-current text-white shrink-0" />
            <span>Enviar no WhatsApp</span>
          </button>

          {/* Copy Formatted Text Button */}
          <button
            id="btn-copiar-texto-rancho"
            type="button"
            onClick={handleCopyText}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm border transition shadow-2xs active:scale-98 ${
              copiedText
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Texto Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Copiar Mensagem</span>
              </>
            )}
          </button>

          {/* Copy Direct Share Link */}
          <button
            id="btn-copiar-link-rancho"
            type="button"
            onClick={handleCopyLink}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm border transition shadow-2xs active:scale-98 ${
              copiedLink
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'bg-white hover:bg-slate-50 text-emerald-800 border-emerald-300'
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Link Copiado!</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Copiar Link Encurtado</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Direct Short Link Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Encurtado para Importação:</span>
                {isGeneratingShortUrl ? (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-normal">
                    Gerando link...
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    Pronto para compartilhar
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-400">Qualquer pessoa pode importar</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={activeShareUrl}
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-mono select-all focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition shadow-2xs"
              >
                {copiedLink ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                type="button"
                onClick={() => window.open(activeShareUrl, '_blank')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 transition"
                title="Testar e abrir em nova aba"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
              <span>💡</span>
              <span>
                Ao abrir este link em qualquer navegador ou celular, o RanchoJá importará automaticamente os <strong>{items.length} itens</strong> do rancho.
              </span>
            </p>
          </div>

          {/* Configuration Toggles */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-slate-700">
              <Settings2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Opções de Formatação da Mensagem:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200/80 transition">
                <input
                  type="checkbox"
                  checked={includePrices}
                  onChange={(e) => setIncludePrices(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium text-[11px]">Incluir Preços</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200/80 transition">
                <input
                  type="checkbox"
                  checked={includeStores}
                  onChange={(e) => setIncludeStores(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium text-[11px]">Mercado Sugerido</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200/80 transition">
                <input
                  type="checkbox"
                  checked={includeLink}
                  onChange={(e) => setIncludeLink(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium text-[11px]">Link Interativo</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200/80 transition">
                <input
                  type="checkbox"
                  checked={includeOnlyPending}
                  onChange={(e) => setIncludeOnlyPending(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium text-[11px]">Só Não Comprados</span>
              </label>
            </div>
          </div>

          {/* Formatted Text Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                Prévia da Mensagem (Como chegará no WhatsApp / Celular):
              </span>
              <span className="text-[11px]">
                {items.length} itens • R$ {total.toFixed(2)}
              </span>
            </div>
            <div className="relative">
              <pre className="w-full p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-56 leading-relaxed border border-slate-800 whitespace-pre-wrap select-all">
                {formattedText}
              </pre>
              <button
                type="button"
                onClick={handleCopyText}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Copiar texto"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Dica: Ao enviar no WhatsApp, os emojis e formatações em negrito serão preservados.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mais Opções</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition w-full sm:w-auto"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
