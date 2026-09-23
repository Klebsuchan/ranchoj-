import { 
  ShoppingListItem, 
  SupermarketName, 
  PassoFundoNeighborhood, 
  ProductCategory,
  PromotionItem 
} from '../types';
import { 
  PASSO_FUNDO_STORES, 
  PASSO_FUNDO_NEIGHBORHOODS, 
  calculateDistanceKm,
  calculateFuelAndTrip,
  FuelTripEstimate
} from './passoFundoLocations';
import { BASE_CATALOGUE_RAW } from './catalogueData';

export interface StoreNearbyInfo {
  id: string;
  name: SupermarketName;
  neighborhood: string;
  address: string;
  distanceKm: number;
  dealCount: number;
  role: string;
  openHours?: string;
  highlightPromo?: string;
}

export interface RanchoProntoOption {
  id: 'maxima-economia' | 'mais-proximo' | 'combo-inteligente';
  title: string;
  subtitle: string;
  badge: string;
  badgeType: 'red' | 'blue' | 'purple';
  description: string;
  strategy: string;
  targetBudget: number;
  totalPrice: number;
  remainingAmount: number;
  savingsAmount: number;
  itemCount: number;
  stores: StoreNearbyInfo[];
  items: ShoppingListItem[];
  highlights: string[];
  fuelEstimate: FuelTripEstimate;
  netSavings: number;
}

interface ItemConfig {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string;
  brand: string;
  baseQty: number; // For budget around R$ 400
  prices: Record<string, number>;
}

// Master essential grocery staples with realistic prices in Passo Fundo
const ESSENTIAL_STAPLES: ItemConfig[] = [
  {
    id: 'arroz-5kg',
    name: 'Arroz Branco Tipo 1 (5kg)',
    category: 'cesta_basica',
    unit: '5kg',
    brand: 'Tio João / Prato Fino / Blue Ville',
    baseQty: 1,
    prices: {
      'Stock Center': 24.90,
      'Atacadão': 25.49,
      'Supermercado Boqueirão': 26.89,
      'Zaffari': 28.90,
      'Bourbon': 29.90,
      'Coqueiros': 27.50,
    },
  },
  {
    id: 'feijao-1kg',
    name: 'Feijão Preto Tipo 1 (1kg)',
    category: 'cesta_basica',
    unit: '1kg',
    brand: 'Caldo Nobre / Kicaldo',
    baseQty: 1,
    prices: {
      'Stock Center': 5.79,
      'Atacadão': 5.95,
      'Supermercado Boqueirão': 6.19,
      'Zaffari': 6.89,
      'Bourbon': 7.20,
      'Coqueiros': 6.49,
    },
  },
  {
    id: 'massa-500g',
    name: 'Massa Espaguete Sêmola (500g)',
    category: 'cesta_basica',
    unit: '500g',
    brand: 'Isabela / Orquídea',
    baseQty: 2,
    prices: {
      'Stock Center': 3.49,
      'Atacadão': 3.65,
      'Supermercado Boqueirão': 3.89,
      'Zaffari': 4.19,
      'Bourbon': 4.49,
      'Coqueiros': 3.99,
    },
  },
  {
    id: 'oleo-900ml',
    name: 'Óleo de Soja Refinado (900ml)',
    category: 'cesta_basica',
    unit: '900ml',
    brand: 'Soya / Liza',
    baseQty: 1,
    prices: {
      'Stock Center': 5.89,
      'Atacadão': 5.99,
      'Supermercado Boqueirão': 6.29,
      'Zaffari': 6.59,
      'Bourbon': 6.79,
      'Coqueiros': 6.39,
    },
  },
  {
    id: 'farinha-1kg',
    name: 'Farinha de Trigo Tipo 1 (1kg)',
    category: 'cesta_basica',
    unit: '1kg',
    brand: 'Orquídea / Rosa Branca',
    baseQty: 1,
    prices: {
      'Stock Center': 3.89,
      'Atacadão': 3.99,
      'Supermercado Boqueirão': 4.19,
      'Zaffari': 4.69,
      'Bourbon': 4.89,
      'Coqueiros': 4.29,
    },
  },
  {
    id: 'cafe-500g',
    name: 'Café Torrado e Moído (500g)',
    category: 'cesta_basica',
    unit: '500g',
    brand: 'Melitta / Pilão / Caboclo',
    baseQty: 1,
    prices: {
      'Stock Center': 17.90,
      'Atacadão': 18.20,
      'Supermercado Boqueirão': 19.20,
      'Zaffari': 20.80,
      'Bourbon': 21.90,
      'Coqueiros': 19.90,
    },
  },
  {
    id: 'leite-1l',
    name: 'Leite UHT Integral (1 Litro)',
    category: 'cesta_basica',
    unit: '1L',
    brand: 'Elegê / Piracanjuba / Piá',
    baseQty: 3,
    prices: {
      'Stock Center': 4.19,
      'Atacadão': 4.25,
      'Supermercado Boqueirão': 4.49,
      'Zaffari': 4.89,
      'Bourbon': 4.99,
      'Coqueiros': 4.69,
    },
  },
  {
    id: 'ovos-30un',
    name: 'Ovos Brancos Médios (Bandeja 30un)',
    category: 'carnes_proteinas',
    unit: '30 un',
    brand: 'Granja Local PF / Naturovos',
    baseQty: 1,
    prices: {
      'Stock Center': 16.90,
      'Atacadão': 17.50,
      'Supermercado Boqueirão': 18.50,
      'Zaffari': 20.90,
      'Bourbon': 21.90,
      'Coqueiros': 19.90,
    },
  },
  {
    id: 'frango-kg',
    name: 'Peito de Frango Congelado (kg)',
    category: 'carnes_proteinas',
    unit: 'kg',
    brand: 'Seara / Sadia / Aurora',
    baseQty: 2,
    prices: {
      'Stock Center': 12.99,
      'Atacadão': 13.49,
      'Supermercado Boqueirão': 13.90,
      'Zaffari': 15.90,
      'Bourbon': 16.90,
      'Coqueiros': 14.80,
    },
  },
  {
    id: 'carne-moida-kg',
    name: 'Carne Moída de Segunda / Acém (kg)',
    category: 'carnes_proteinas',
    unit: 'kg',
    brand: 'Açougue Fresco PF',
    baseQty: 1.5,
    prices: {
      'Stock Center': 22.90,
      'Atacadão': 23.50,
      'Supermercado Boqueirão': 24.90,
      'Zaffari': 27.50,
      'Bourbon': 28.90,
      'Coqueiros': 25.90,
    },
  },
  {
    id: 'batata-kg',
    name: 'Batata Inglesa Lavada (kg)',
    category: 'hortifruti',
    unit: 'kg',
    brand: 'Produtor Regional RS',
    baseQty: 2,
    prices: {
      'Stock Center': 4.49,
      'Atacadão': 4.89,
      'Supermercado Boqueirão': 4.99,
      'Zaffari': 5.99,
      'Bourbon': 6.49,
      'Coqueiros': 5.29,
    },
  },
  {
    id: 'cebola-kg',
    name: 'Cebola Nacional (kg)',
    category: 'hortifruti',
    unit: 'kg',
    brand: 'Hortifrúti Regional',
    baseQty: 1,
    prices: {
      'Stock Center': 3.89,
      'Atacadão': 4.19,
      'Supermercado Boqueirão': 4.39,
      'Zaffari': 4.99,
      'Bourbon': 5.49,
      'Coqueiros': 4.50,
    },
  },
  {
    id: 'banana-kg',
    name: 'Banana Prata / Caturra (kg)',
    category: 'hortifruti',
    unit: 'kg',
    brand: 'Feira Regional',
    baseQty: 2,
    prices: {
      'Stock Center': 3.99,
      'Atacadão': 4.29,
      'Supermercado Boqueirão': 4.69,
      'Zaffari': 5.49,
      'Bourbon': 5.99,
      'Coqueiros': 4.59,
    },
  },
  {
    id: 'detergente-500ml',
    name: 'Detergente Líquido Lava-Louças (500ml)',
    category: 'limpeza_higiene',
    unit: '500ml',
    brand: 'Ypê / Limpol / Minuano',
    baseQty: 2,
    prices: {
      'Stock Center': 2.19,
      'Atacadão': 2.29,
      'Supermercado Boqueirão': 2.49,
      'Zaffari': 2.79,
      'Bourbon': 2.89,
      'Coqueiros': 2.59,
    },
  },
  {
    id: 'sabao-po-1kg',
    name: 'Sabão em Pó / Líquido para Roupas (1kg)',
    category: 'limpeza_higiene',
    unit: '1kg',
    brand: 'Tixan Ypê / Omo / Brilhante',
    baseQty: 1,
    prices: {
      'Stock Center': 10.90,
      'Atacadão': 11.20,
      'Supermercado Boqueirão': 12.50,
      'Zaffari': 13.80,
      'Bourbon': 14.50,
      'Coqueiros': 12.90,
    },
  },
  {
    id: 'agua-sanitaria-1l',
    name: 'Água Sanitária Cloro Ativo (1L)',
    category: 'limpeza_higiene',
    unit: '1L',
    brand: 'QBoa / Ypê',
    baseQty: 1,
    prices: {
      'Stock Center': 3.49,
      'Atacadão': 3.69,
      'Supermercado Boqueirão': 3.99,
      'Zaffari': 4.29,
      'Bourbon': 4.59,
      'Coqueiros': 3.89,
    },
  },
  {
    id: 'papel-higienico-12un',
    name: 'Papel Higiênico Folha Dupla (12un)',
    category: 'limpeza_higiene',
    unit: '12 un',
    brand: 'Personal / Neve / Sublime',
    baseQty: 1,
    prices: {
      'Stock Center': 14.90,
      'Atacadão': 15.30,
      'Supermercado Boqueirão': 16.90,
      'Zaffari': 18.90,
      'Bourbon': 19.90,
      'Coqueiros': 17.50,
    },
  },
  {
    id: 'sabonete-90g',
    name: 'Sabonete em Barra Hidratante (90g)',
    category: 'limpeza_higiene',
    unit: '90g',
    brand: 'Palmolive / Protex / Francis',
    baseQty: 3,
    prices: {
      'Stock Center': 2.19,
      'Atacadão': 2.29,
      'Supermercado Boqueirão': 2.49,
      'Zaffari': 2.89,
      'Bourbon': 2.99,
      'Coqueiros': 2.69,
    },
  },
  {
    id: 'creme-dental-90g',
    name: 'Creme Dental Anticáries (90g)',
    category: 'limpeza_higiene',
    unit: '90g',
    brand: 'Sorriso / Colgate',
    baseQty: 1,
    prices: {
      'Stock Center': 3.89,
      'Atacadão': 4.09,
      'Supermercado Boqueirão': 4.39,
      'Zaffari': 4.79,
      'Bourbon': 4.99,
      'Coqueiros': 4.30,
    },
  },
];

/**
 * Returns user coordinates based on GPS or neighborhood fallback
 */
function resolveCoordinates(
  userCoords?: { lat: number; lng: number },
  userNeighborhood?: string
): { lat: number; lng: number; neighborhood: string } {
  if (userCoords && userCoords.lat && userCoords.lng) {
    return {
      lat: userCoords.lat,
      lng: userCoords.lng,
      neighborhood: userNeighborhood || 'Sua Localização GPS',
    };
  }

  const match = PASSO_FUNDO_NEIGHBORHOODS.find(
    (n) => n.neighborhood.toLowerCase() === (userNeighborhood || '').toLowerCase()
  );

  if (match) {
    return { lat: match.lat, lng: match.lng, neighborhood: match.neighborhood };
  }

  // Default to Centro
  const centro = PASSO_FUNDO_NEIGHBORHOODS[1];
  return { lat: centro.lat, lng: centro.lng, neighborhood: 'Centro' };
}

/**
 * Generates 3 curated Rancho Pronto options based on selected budget and nearby promo density
 */
export function generateRanchoProntoOptions({
  budget,
  householdType = 'solo',
  familyMembers,
  userCoords,
  userNeighborhood,
  availablePromotions = [],
}: {
  budget: number;
  householdType?: 'solo' | 'casal' | 'familia';
  familyMembers?: number;
  userCoords?: { lat: number; lng: number };
  userNeighborhood?: string;
  availablePromotions?: PromotionItem[];
}): RanchoProntoOption[] {
  // Ensure valid minimum budget
  const safeBudget = Math.max(100, Math.round(budget || 350));
  const persons = familyMembers || (householdType === 'casal' ? 2 : householdType === 'familia' ? 3 : 1);
  const userLoc = resolveCoordinates(userCoords, userNeighborhood);

  // Calculate distance from user location to all Passo Fundo supermarkets
  const storesWithDistance = PASSO_FUNDO_STORES.map((store) => {
    const dist = calculateDistanceKm(userLoc.lat, userLoc.lng, store.lat, store.lng);
    // Count promos active
    const promoCount = availablePromotions.filter((p) =>
      p.prices.some((pr) => pr.supermarket === store.chain && pr.isPromo)
    ).length || (store.chain === 'Stock Center' ? 24 : store.chain === 'Atacadão' ? 20 : 15);

    return {
      ...store,
      distanceKm: dist,
      dealCount: promoCount,
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  // 1. Identify Nearest Wholesale Store (Stok Center or Atacadão)
  const nearestWholesale = storesWithDistance.find(
    (s) => s.chain === 'Stock Center' || s.chain === 'Atacadão'
  ) || storesWithDistance[0];

  // 2. Identify Strictly Closest Supermarket (Regardless of chain)
  const strictlyClosest = storesWithDistance[0];

  // 3. Identify Complementary Fresh/Quality Store (Zaffari or Supermercado Boqueirão)
  const complementaryStore = storesWithDistance.find(
    (s) => (s.chain === 'Zaffari' || s.chain === 'Supermercado Boqueirão') && s.id !== nearestWholesale.id
  ) || storesWithDistance[1] || storesWithDistance[0];

  // Helper to build items fitting under or up to target budget
  const scaleRatio = safeBudget / 400; // 400 is our baseline solo basket
  const multiplier = Math.max(0.4, Math.min(2.5, scaleRatio * (persons >= 2 ? 0.9 : 1)));

  // Helper function to build grocery list for given target store(s)
  const buildItemsList = (
    primaryMarket: SupermarketName,
    secondaryMarket?: SupermarketName,
    useComboSplit = false
  ): { items: ShoppingListItem[]; total: number; savings: number } => {
    let currentTotal = 0;
    const resultItems: ShoppingListItem[] = [];

    // Prioritized list order: staples first, then proteins, produce, cleaning, hygiene
    const sortedStaples = [...ESSENTIAL_STAPLES];

    for (const staple of sortedStaples) {
      // Decide which market supplies this item
      let marketToUse = primaryMarket;
      if (useComboSplit && secondaryMarket) {
        // In combo: produce & meats at secondaryMarket (fresh store), staples & cleaning at primary (wholesale)
        if (staple.category === 'hortifruti' || staple.category === 'carnes_proteinas') {
          marketToUse = secondaryMarket;
        }
      }

      const unitPrice = staple.prices[marketToUse] || staple.prices['Stock Center'] || 5.0;
      const highestRef = Math.max(...Object.values(staple.prices));

      // Calculate quantity adapted to budget
      let qty = staple.baseQty;
      if (multiplier > 1.3) {
        qty = Math.round(staple.baseQty * multiplier);
      } else if (multiplier < 0.7) {
        qty = Math.max(1, Math.floor(staple.baseQty * multiplier));
      }

      // Quantity adjustments for unit types
      if (staple.unit === 'kg' && qty < 1) qty = 1;
      if (staple.unit === '30 un' && qty > 1 && safeBudget < 500) qty = 1;

      const itemCost = Number((unitPrice * qty).toFixed(2));

      // If budget is tight, check if adding this exceeds budget
      if (currentTotal + itemCost > safeBudget) {
        // Try with qty 1 if was > 1
        if (qty > 1) {
          const reducedCost = Number((unitPrice * 1).toFixed(2));
          if (currentTotal + reducedCost <= safeBudget) {
            qty = 1;
            const finalCost = reducedCost;
            currentTotal += finalCost;
            resultItems.push({
              id: `rancho-item-${staple.id}-${marketToUse.toLowerCase().replace(/\s+/g, '-')}`,
              name: staple.name,
              category: staple.category,
              quantity: qty,
              unit: staple.unit,
              brand: staple.brand,
              prices: staple.prices,
              selectedMarket: marketToUse,
              unitPrice,
              totalPrice: finalCost,
              isEssential: true,
              priority: 'essencial',
              isBought: false,
            });
          }
        }
        continue;
      }

      currentTotal += itemCost;
      resultItems.push({
        id: `rancho-item-${staple.id}-${marketToUse.toLowerCase().replace(/\s+/g, '-')}`,
        name: staple.name,
        category: staple.category,
        quantity: qty,
        unit: staple.unit,
        brand: staple.brand,
        prices: staple.prices,
        selectedMarket: marketToUse,
        unitPrice,
        totalPrice: itemCost,
        isEssential: true,
        priority: 'essencial',
        isBought: false,
      });
    }

    // Calculate realistic savings vs average market
    const avgTotal = resultItems.reduce((acc, it) => {
      const priceValues = Object.values(it.prices).filter((p): p is number => typeof p === 'number');
      const avgPrice = priceValues.length > 0
        ? priceValues.reduce((s: number, p: number) => s + p, 0) / priceValues.length
        : it.unitPrice;
      return acc + (avgPrice * it.quantity);
    }, 0);

    const savings = Math.max(0, Number((avgTotal - currentTotal).toFixed(2)));

    return {
      items: resultItems,
      total: Number(currentTotal.toFixed(2)),
      savings,
    };
  };

  // --- OPÇÃO 1: MÁXIMA ECONOMIA (ATACAREJO MAIS BARATO PERTO) ---
  const opt1Data = buildItemsList(nearestWholesale.chain);
  const fuel1 = calculateFuelAndTrip(nearestWholesale.distanceKm);
  const savings1 = opt1Data.savings || Number((safeBudget * 0.22).toFixed(2));
  const netSavings1 = Math.max(0, Number((savings1 - fuel1.fuelCost).toFixed(2)));

  const opt1StoreInfo: StoreNearbyInfo = {
    id: nearestWholesale.id,
    name: nearestWholesale.chain,
    neighborhood: nearestWholesale.neighborhood,
    address: nearestWholesale.address,
    distanceKm: nearestWholesale.distanceKm,
    dealCount: nearestWholesale.dealCount,
    role: 'Atacarejo campeão de preços em Passo Fundo com maior volume de fardos e alimentos',
    openHours: nearestWholesale.openHours,
    highlightPromo: nearestWholesale.highlightPromo,
  };

  const option1: RanchoProntoOption = {
    id: 'maxima-economia',
    title: `Rancho no Atacarejo • ${nearestWholesale.chain}`,
    subtitle: `Apenas ${nearestWholesale.distanceKm} km • Economia real sem rodar à toa`,
    badge: 'Maior Economia',
    badgeType: 'red',
    description: `Concentra 100% das compras no maior atacarejo perto de você (${nearestWholesale.name}). Você faz 1 única viagem, gasta menos de R$ ${fuel1.fuelCost.toFixed(2)} em gasolina e garante o menor custo nos itens essenciais do mês.`,
    strategy: 'Economia Extrema em 1 Único Lugar (Economiza Gasolina)',
    targetBudget: safeBudget,
    totalPrice: opt1Data.total,
    remainingAmount: Number((safeBudget - opt1Data.total).toFixed(2)),
    savingsAmount: savings1,
    netSavings: netSavings1,
    fuelEstimate: fuel1,
    itemCount: opt1Data.items.length,
    stores: [opt1StoreInfo],
    items: opt1Data.items,
    highlights: [
      `1 única parada: ${nearestWholesale.name} a ${nearestWholesale.distanceKm} km (~${fuel1.driveTimeMinutes} min)`,
      `Gasto de gasolina: apenas R$ ${fuel1.fuelCost.toFixed(2)} (${fuel1.roundTripKm} km ida e volta)`,
      `Economia líquida de R$ ${netSavings1.toFixed(2)} já descontando o combustível`,
      `${opt1Data.items.length} itens essenciais completos para durar os 30 dias do mês`,
    ],
  };

  // --- OPÇÃO 2: MAIS PRÓXIMO / RÁPIDO (MENOR DESLOCAMENTO) ---
  const opt2Data = buildItemsList(strictlyClosest.chain);
  const fuel2 = calculateFuelAndTrip(strictlyClosest.distanceKm);
  const savings2 = opt2Data.savings;
  const netSavings2 = Math.max(0, Number((savings2 - fuel2.fuelCost).toFixed(2)));

  const opt2StoreInfo: StoreNearbyInfo = {
    id: strictlyClosest.id,
    name: strictlyClosest.chain,
    neighborhood: strictlyClosest.neighborhood,
    address: strictlyClosest.address,
    distanceKm: strictlyClosest.distanceKm,
    dealCount: strictlyClosest.dealCount,
    role: `Supermercado mais perto do seu bairro (${strictlyClosest.neighborhood})`,
    openHours: strictlyClosest.openHours,
    highlightPromo: strictlyClosest.highlightPromo,
  };

  const option2: RanchoProntoOption = {
    id: 'mais-proximo',
    title: `Rancho Prático • ${strictlyClosest.name}`,
    subtitle: `Apenas ${strictlyClosest.distanceKm} km • Menor tempo e mínimo de gasolina`,
    badge: 'Mais Perto de Você',
    badgeType: 'blue',
    description: `O mercado mais perto da sua localização atual (${strictlyClosest.name}). Ideal para quem não quer perder tempo no trânsito nem gastar combustível rodando pela cidade.`,
    strategy: 'Conveniência & Proximidade Imediata',
    targetBudget: safeBudget,
    totalPrice: opt2Data.total,
    remainingAmount: Number((safeBudget - opt2Data.total).toFixed(2)),
    savingsAmount: savings2,
    netSavings: netSavings2,
    fuelEstimate: fuel2,
    itemCount: opt2Data.items.length,
    stores: [opt2StoreInfo],
    items: opt2Data.items,
    highlights: [
      `Vizinho à sua casa: ${strictlyClosest.name} a ${strictlyClosest.distanceKm} km (~${fuel2.driveTimeMinutes} min)`,
      `Mínimo consumo: R$ ${fuel2.fuelCost.toFixed(2)} de combustível (${fuel2.roundTripKm} km)`,
      'Chegue rápido, compre sem estresse e volte em menos de 40 min',
      `Sobra de R$ ${(safeBudget - opt2Data.total).toFixed(2)} no seu bolso`,
    ],
  };

  // --- OPÇÃO 3: COMBO INTELIGENTE (2 MELHORES VIZINHOS) ---
  const opt3Data = buildItemsList(nearestWholesale.chain, complementaryStore.chain, true);
  const combinedDistance = Number(((nearestWholesale.distanceKm + complementaryStore.distanceKm) * 0.75).toFixed(2));
  const fuel3 = calculateFuelAndTrip(combinedDistance);
  const savings3 = Number((opt3Data.savings + 14.5).toFixed(2));
  const netSavings3 = Math.max(0, Number((savings3 - fuel3.fuelCost).toFixed(2)));

  const opt3Store1: StoreNearbyInfo = {
    id: nearestWholesale.id,
    name: nearestWholesale.chain,
    neighborhood: nearestWholesale.neighborhood,
    address: nearestWholesale.address,
    distanceKm: nearestWholesale.distanceKm,
    dealCount: nearestWholesale.dealCount,
    role: 'Básicos de mercearia, arroz, grãos e produtos de limpeza pesada',
  };
  const opt3Store2: StoreNearbyInfo = {
    id: complementaryStore.id,
    name: complementaryStore.chain,
    neighborhood: complementaryStore.neighborhood,
    address: complementaryStore.address,
    distanceKm: complementaryStore.distanceKm,
    dealCount: complementaryStore.dealCount,
    role: 'Açougue, carnes frescas, hortifrúti selecionado e feira da semana',
  };

  const option3: RanchoProntoOption = {
    id: 'combo-inteligente',
    title: `Combo Duplo • ${nearestWholesale.chain} + ${complementaryStore.chain}`,
    subtitle: `Melhor Custo x Benefício • 2 mercados próximos`,
    badge: 'Combo Inteligente',
    badgeType: 'purple',
    description: `Combinação estratégica: mercearia e limpeza no atacarejo (${nearestWholesale.chain}) e hortifrúti/carnes no mercado mais próximo (${complementaryStore.chain}). Só vale se a economia cobrir o combustível.`,
    strategy: 'Divisão Inteligente dos Melhores Setores',
    targetBudget: safeBudget,
    totalPrice: opt3Data.total,
    remainingAmount: Number((safeBudget - opt3Data.total).toFixed(2)),
    savingsAmount: savings3,
    netSavings: netSavings3,
    fuelEstimate: fuel3,
    itemCount: opt3Data.items.length,
    stores: [opt3Store1, opt3Store2],
    items: opt3Data.items,
    highlights: [
      `Arroz, feijão e limpeza no ${nearestWholesale.chain} (${nearestWholesale.distanceKm} km)`,
      `Carnes e feira fresca no ${complementaryStore.chain} (${complementaryStore.distanceKm} km)`,
      `Combustível total do trajeto: R$ ${fuel3.fuelCost.toFixed(2)} (${fuel3.roundTripKm} km)`,
      `Economia líquida de R$ ${netSavings3.toFixed(2)} (a economia compensa o trajeto)`,
    ],
  };

  return [option1, option2, option3];
}
