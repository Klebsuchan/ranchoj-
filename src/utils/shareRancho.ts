import { ShoppingListItem, SupermarketName } from '../types';

export interface RanchoSharePayload {
  items: Array<{
    n: string; // name
    q: number; // quantity
    u: string; // unit
    p: number; // unitPrice
    m: string; // selectedMarket
    c?: string; // category
    b?: string; // brand
    e?: number; // isEssential
    pr?: Partial<Record<string, number>>; // prices
  }>;
  budget?: number;
  household?: 'solo' | 'casal';
  date?: string;
}

export interface FormatRanchoOptions {
  items: ShoppingListItem[];
  budgetLimit?: number;
  householdType?: 'solo' | 'casal';
  neighborhood?: string;
  includePrices?: boolean;
  includeStores?: boolean;
  includeOnlyPending?: boolean;
  shareUrl?: string;
}

/**
 * Format the shopping list into a rich, structured text for WhatsApp, Telegram, SMS, or Social Media.
 */
export function formatRanchoForSharing({
  items,
  budgetLimit = 450,
  householdType = 'solo',
  neighborhood = 'Passo Fundo - RS',
  includePrices = true,
  includeStores = true,
  includeOnlyPending = false,
  shareUrl,
}: FormatRanchoOptions): string {
  const filteredItems = includeOnlyPending ? items.filter((i) => !i.isBought) : items;
  const total = filteredItems.reduce((acc, i) => acc + i.totalPrice, 0);
  const boughtCount = items.filter((i) => i.isBought).length;
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Group by category or list linearly
  const lines: string[] = [];

  lines.push(`🛒 *MEU RANCHO - RANCHOJÁ* 🛒`);
  lines.push(`📍 *Local:* ${neighborhood}`);
  lines.push(`📅 *Data:* ${today} | 👥 *Perfil:* ${householdType === 'solo' ? 'Individual (Solo)' : 'Casal'}`);
  lines.push(`💰 *Total Estimado:* R$ ${total.toFixed(2).replace('.', ',')} (Teto orçamentário: R$ ${budgetLimit.toFixed(2).replace('.', ',')})`);
  
  if (budgetLimit > 0) {
    const diff = budgetLimit - total;
    if (diff >= 0) {
      lines.push(`🟢 *Saldo livre:* R$ ${diff.toFixed(2).replace('.', ',')} restante`);
    } else {
      lines.push(`🔴 *Atenção:* Excedeu o teto em R$ ${Math.abs(diff).toFixed(2).replace('.', ',')}`);
    }
  }

  if (items.some((i) => i.isBought)) {
    lines.push(`📊 *Progresso no Carrinho:* ${boughtCount} de ${items.length} itens comprados`);
  }

  lines.push('');
  lines.push(`📋 *ITENS DA LISTA DE COMPRAS:*`);

  filteredItems.forEach((item, index) => {
    const checkMark = item.isBought ? '☑️' : '⬜';
    let line = `${checkMark} ${item.quantity}x ${item.name}`;

    if (item.brand) {
      line += ` (${item.brand})`;
    }

    if (includePrices) {
      line += ` - R$ ${item.totalPrice.toFixed(2).replace('.', ',')}`;
      if (item.quantity > 1) {
        line += ` (R$ ${item.unitPrice.toFixed(2).replace('.', ',')}/${item.unit})`;
      }
    }

    if (includeStores) {
      const storeName = item.selectedMarket === 'best' ? 'Melhor Oferta' : item.selectedMarket;
      line += ` [${storeName}]`;
    }

    lines.push(line);
  });

  // Summary of recommended markets
  if (includeStores) {
    const marketCounts: Record<string, number> = {};
    filteredItems.forEach((i) => {
      const mkt = i.selectedMarket === 'best' ? 'Mais Barato' : i.selectedMarket;
      marketCounts[mkt] = (marketCounts[mkt] || 0) + 1;
    });

    const marketSummary = Object.entries(marketCounts)
      .map(([mkt, count]) => `${mkt}: ${count} itens`)
      .join(' | ');

    if (marketSummary) {
      lines.push('');
      lines.push(`🏪 *Distribuição por Mercado em Passo Fundo:*`);
      lines.push(marketSummary);
    }
  }

  if (shareUrl) {
    lines.push('');
    lines.push(`🔗 *Abra ou edite esta lista no RanchoJá:*`);
    lines.push(shareUrl);
  }

  lines.push('');
  lines.push(`_Gerado pelo RanchoJá - Seu Gestor de Rancho e Economia_`);

  return lines.join('\n');
}

/**
 * Encodes items into a compact, URL-safe Base64 string.
 */
export function encodeRanchoToUrl(
  items: ShoppingListItem[],
  budgetLimit?: number,
  householdType?: 'solo' | 'casal'
): string {
  try {
    const payload: RanchoSharePayload = {
      items: items.map((item) => ({
        n: item.name,
        q: item.quantity,
        u: item.unit,
        p: item.unitPrice,
        m: item.selectedMarket,
        c: item.category,
        b: item.brand,
        e: item.isEssential ? 1 : 0,
        pr: item.prices,
      })),
      budget: budgetLimit,
      household: householdType,
      date: new Date().toISOString(),
    };

    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error('Falha ao codificar lista do rancho para URL:', error);
    return '';
  }
}

/**
 * Decodes a share string back into a ShoppingListItem array and metadata.
 */
export function decodeRanchoFromUrl(shareCode: string): {
  items: ShoppingListItem[];
  budget?: number;
  household?: 'solo' | 'casal';
} | null {
  try {
    let base64 = shareCode.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const payload = JSON.parse(json) as RanchoSharePayload;

    if (!payload || !Array.isArray(payload.items)) {
      return null;
    }

    const items: ShoppingListItem[] = payload.items.map((raw, idx) => ({
      id: `shared-item-${idx}-${Date.now()}`,
      name: raw.n,
      category: (raw.c as any) || 'cesta_basica',
      quantity: raw.q || 1,
      unit: raw.u || 'un',
      brand: raw.b,
      prices: raw.pr || {
        'Stock Center': raw.p,
        'Supermercado Boqueirão': raw.p,
        'Atacadão': raw.p,
        'Zaffari': raw.p,
        'Bourbon': raw.p,
        'Coqueiros': raw.p,
      },
      selectedMarket: (raw.m as any) || 'best',
      unitPrice: raw.p || 0,
      totalPrice: Number(((raw.p || 0) * (raw.q || 1)).toFixed(2)),
      isEssential: raw.e !== 0,
      priority: raw.e !== 0 ? 'essencial' : 'importante',
      isBought: false,
    }));

    return {
      items,
      budget: payload.budget,
      household: payload.household,
    };
  } catch (error) {
    console.error('Falha ao decodificar lista do rancho compartilhada:', error);
    return null;
  }
}

/**
 * Copy text to clipboard with modern navigator.clipboard and robust fallback.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn('navigator.clipboard falhou, tentando fallback textarea:', e);
  }

  // Fallback for iframes or non-secure contexts
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback execCommand falhou:', err);
    return false;
  }
}

/**
 * Create a shortened link by saving the list on the server.
 * Falls back to base64 encoding if offline or server fails.
 */
export async function createShortShareLink(
  items: ShoppingListItem[],
  budgetLimit?: number,
  householdType?: 'solo' | 'casal',
  cityName?: string
): Promise<{ shortUrl: string; shortCode: string; isFallback: boolean }> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  try {
    const res = await fetch('/api/share-rancho', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        budget: budgetLimit,
        household: householdType,
        cityName,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.shortCode) {
        return {
          shortUrl: `${origin}${pathname}?r=${data.shortCode}`,
          shortCode: data.shortCode,
          isFallback: false,
        };
      }
    }
  } catch (err) {
    console.warn('API /api/share-rancho falhou, utilizando fallback local:', err);
  }

  // Fallback: URL encoded base64
  const code = encodeRanchoToUrl(items, budgetLimit, householdType);
  return {
    shortUrl: `${origin}${pathname}?share_rancho=${code}`,
    shortCode: code,
    isFallback: true,
  };
}

/**
 * Fetch a shared rancho by short code from server.
 */
export async function fetchShortRancho(code: string): Promise<{
  items: ShoppingListItem[];
  budget?: number;
  household?: 'solo' | 'casal';
  cityName?: string;
} | null> {
  try {
    const res = await fetch(`/api/share-rancho/${encodeURIComponent(code)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        return {
          items: data.items,
          budget: data.budget,
          household: data.household,
          cityName: data.cityName,
        };
      }
    }
  } catch (err) {
    console.warn('Falha ao obter rancho encurtado:', err);
  }
  return null;
}

