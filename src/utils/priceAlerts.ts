import { PriceAlert, PromotionItem } from '../types';

const STORAGE_KEY = 'rancho_price_alerts';

/**
 * Loads all saved price alert preferences from localStorage
 */
export function getStoredPriceAlerts(): Record<string, PriceAlert> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao carregar alertas de preço do localStorage:', e);
    return {};
  }
}

/**
 * Saves or updates a price alert in localStorage
 */
export function savePriceAlert(alert: PriceAlert): Record<string, PriceAlert> {
  const current = getStoredPriceAlerts();
  const updated = {
    ...current,
    [alert.itemId]: alert,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Erro ao salvar alerta no localStorage:', e);
  }
  return updated;
}

/**
 * Removes a price alert from localStorage
 */
export function removePriceAlert(itemId: string): Record<string, PriceAlert> {
  const current = getStoredPriceAlerts();
  delete current[itemId];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Erro ao remover alerta do localStorage:', e);
  }
  return { ...current };
}

/**
 * Evaluates current promotion items against user saved price alerts
 */
export function evaluatePriceAlerts(
  items: PromotionItem[],
  alerts: Record<string, PriceAlert>
): {
  activeCount: number;
  triggeredAlerts: PriceAlert[];
  updatedAlerts: Record<string, PriceAlert>;
} {
  const updatedAlerts = { ...alerts };
  const triggeredAlerts: PriceAlert[] = [];

  items.forEach((item) => {
    const alert = updatedAlerts[item.id];
    if (alert) {
      const isTriggered = item.lowestPrice <= alert.targetPrice;
      const updated = {
        ...alert,
        currentLowestPrice: item.lowestPrice,
        cheapestMarket: item.cheapestMarket,
        isTriggered,
      };
      updatedAlerts[item.id] = updated;
      if (isTriggered) {
        triggeredAlerts.push(updated);
      }
    }
  });

  return {
    activeCount: Object.keys(alerts).length,
    triggeredAlerts,
    updatedAlerts,
  };
}
