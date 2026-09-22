import { PromotionItem, SupermarketName, ShoppingListItem } from '../types';

export interface ProductSubstitute {
  id: string;
  originalProductId: string;
  originalProductName: string;
  originalPrice: number;
  originalBrand?: string;
  substituteName: string;
  substituteBrand: string;
  substituteUnit: string;
  estimatedPrice: number;
  market: SupermarketName;
  savingsAmount: number;
  savingsPercent: number;
  reason: string;
  category: string;
}

// Curated database of cheaper brand alternatives available in Passo Fundo markets
// (Stock Center, Atacadão, Supermercado Boqueirão, Zaffari, Bourbon, Coqueiros)
export const PASSO_FUNDO_CHEAPER_SUBSTITUTES: Record<
  string,
  {
    substituteName: string;
    substituteBrand: string;
    substituteUnit: string;
    estimatedPrice: number;
    market: SupermarketName;
    reason: string;
  }[]
> = {
  // Arroz
  arroz: [
    {
      substituteName: 'Arroz Branco Tipo 1 (5kg) - Marca Econômica',
      substituteBrand: 'Blue Ville / Tio Jorge / Marca Própria',
      substituteUnit: '5kg',
      estimatedPrice: 22.90,
      market: 'Stock Center',
      reason: 'Mesma qualidade Tipo 1 com grãos longos e soltinhos, custando até 25% menos que marcas premium.',
    },
    {
      substituteName: 'Arroz Parboilizado Tipo 1 (5kg)',
      substituteBrand: 'Caldo de Ouro / Namorado',
      substituteUnit: '5kg',
      estimatedPrice: 23.49,
      market: 'Atacadão',
      reason: 'Mais nutritivo e rende até 30% mais porções na panela para quem mora sozinho ou em casal.',
    },
  ],

  // Feijão
  feijao: [
    {
      substituteName: 'Feijão Preto Tipo 1 (1kg) - Marca Regional',
      substituteBrand: 'Caldo de Ouro / Tio Urbano',
      substituteUnit: '1kg',
      estimatedPrice: 6.49,
      market: 'Stock Center',
      reason: 'Cozinha rápido, caldo encorpado e economia direta de mais de R$ 3,00 por quilo frente às marcas líderes.',
    },
    {
      substituteName: 'Feijão Vermelho ou Carioca em Oferta (1kg)',
      substituteBrand: 'Marca Regional RS',
      substituteUnit: '1kg',
      estimatedPrice: 6.89,
      market: 'Supermercado Boqueirão',
      reason: 'Excelente valor calórico e proteína vegetal acessível com compra local rápida no bairro.',
    },
  ],

  // Café
  cafe: [
    {
      substituteName: 'Café Torrado e Moído Tradicional (500g)',
      substituteBrand: 'Caboclo / Bom Jesus / União',
      substituteUnit: '500g',
      estimatedPrice: 14.50,
      market: 'Atacadão',
      reason: 'Sabor encorpado tradicional sem pagar o sobrepreço de cafés gourmet ou marcas de vácuo caras.',
    },
  ],

  // Óleo / Azeite
  oleo: [
    {
      substituteName: 'Óleo de Soja Refinado (900ml)',
      substituteBrand: 'Soya / Liza / Cocamar',
      substituteUnit: '900ml',
      estimatedPrice: 6.79,
      market: 'Stock Center',
      reason: 'Para refogar o arroz e frituras diárias, o óleo de soja comum custa 85% menos que azeite de oliva.',
    },
    {
      substituteName: 'Óleo de Girassol ou Composto de Oliva (500ml)',
      substituteBrand: 'Salada / Maria',
      substituteUnit: '500ml',
      estimatedPrice: 12.90,
      market: 'Zaffari',
      reason: 'Alternativa mais leve que o azeite puro de R$ 45, ideal para saladas mantendo o orçamento controlado.',
    },
  ],

  // Leite
  leite: [
    {
      substituteName: 'Leite Longa Vida UHT Integral (1L)',
      substituteBrand: 'Languiru / Piá / Santa Clara',
      substituteUnit: '1L',
      estimatedPrice: 4.29,
      market: 'Supermercado Boqueirão',
      reason: 'Marcas cooperativas gaúchas de alta pureza com preço muito mais justo que multinacionais.',
    },
  ],

  // Carnes / Proteína
  frango: [
    {
      substituteName: 'Coxa e Sobrecoxa de Frango Congelada (1kg)',
      substituteBrand: 'Aurora / Seara / Frangosul',
      substituteUnit: '1kg',
      estimatedPrice: 11.90,
      market: 'Stock Center',
      reason: 'Proteína suculenta que custa quase metade do peito desossado, ideal para assados e ensopados.',
    },
    {
      substituteName: 'Ovos Brancos Médios (Bandeja 30 unidades)',
      substituteBrand: 'Granja Regional Passo Fundo',
      substituteUnit: 'Bandeja 30un',
      estimatedPrice: 16.90,
      market: 'Atacadão',
      reason: 'Melhor custo por grama de proteína pura para estudantes e casais economizarem nas refeições.',
    },
  ],

  // Carne Bovina
  carne: [
    {
      substituteName: 'Acém ou Paleta Bovina Moída (1kg)',
      substituteBrand: 'Açougue Fresco',
      substituteUnit: '1kg',
      estimatedPrice: 26.90,
      market: 'Supermercado Boqueirão',
      reason: 'Cortes dianteiros saborosos para molhos, panquecas e hambúrguer caseiro, sem o preço salgado de alcatra.',
    },
  ],

  // Sabão em pó / Limpeza
  sabao: [
    {
      substituteName: 'Sabão em Pó Lavagem Perfeita (1.6kg)',
      substituteBrand: 'Tixan Ypê / Brilhante',
      substituteUnit: '1.6kg',
      estimatedPrice: 12.80,
      market: 'Stock Center',
      reason: 'Rendimento idêntico com economia imediata de R$ 9 a R$ 11 por caixa frente ao OMO.',
    },
    {
      substituteName: 'Detergente Líquido Lava-Louças (500ml)',
      substituteBrand: 'Limpol / Minuano',
      substituteUnit: '500ml',
      estimatedPrice: 1.89,
      market: 'Coqueiros',
      reason: 'Alto poder desengordurante por menos de dois reais.',
    },
  ],
};

/**
 * Identify if a product has cheaper substitutes and return them
 */
export function getSubstitutesForProduct(
  item: PromotionItem,
  customThresholdPrice?: number
): ProductSubstitute[] {
  const nameLower = item.name.toLowerCase();
  const brandLower = (item.brand || '').toLowerCase();
  const isCurrentlyInPromo = item.prices.some((p) => p.isPromo);
  const currentPrice = item.lowestPrice;

  // Key match detection
  let matchKey: string | null = null;
  if (nameLower.includes('arroz')) matchKey = 'arroz';
  else if (nameLower.includes('feij') || nameLower.includes('feijao')) matchKey = 'feijao';
  else if (nameLower.includes('caf')) matchKey = 'cafe';
  else if (nameLower.includes('azeite') || nameLower.includes('óleo') || nameLower.includes('oleo')) matchKey = 'oleo';
  else if (nameLower.includes('leite')) matchKey = 'leite';
  else if (nameLower.includes('frango') || nameLower.includes('peito')) matchKey = 'frango';
  else if (nameLower.includes('carne') || nameLower.includes('alcatra') || nameLower.includes('costela')) matchKey = 'carne';
  else if (nameLower.includes('sab') || nameLower.includes('sabao') || nameLower.includes('omo') || nameLower.includes('detergente')) matchKey = 'sabao';

  // If item is already on heavy promo AND cheap, or no match found
  const isExpensive = customThresholdPrice ? currentPrice > customThresholdPrice : currentPrice > 15;
  const shouldSuggest = !isCurrentlyInPromo || isExpensive || currentPrice > 20;

  if (!matchKey || !PASSO_FUNDO_CHEAPER_SUBSTITUTES[matchKey]) {
    // Dynamic substitute generator for items without hardcoded template if over budget
    if (shouldSuggest && currentPrice > 14) {
      const discountRatio = 0.28; // ~28% cheaper
      const estimatedSubPrice = Math.round((currentPrice * (1 - discountRatio)) * 100) / 100;
      const savings = Math.round((currentPrice - estimatedSubPrice) * 100) / 100;
      return [
        {
          id: `sub-dynamic-${item.id}`,
          originalProductId: item.id,
          originalProductName: item.name,
          originalPrice: currentPrice,
          originalBrand: item.brand,
          substituteName: `${item.name.split('(')[0].trim()} - Marca Alternativa Econômica`,
          substituteBrand: 'Marca Regional / Atacado Passo Fundo',
          substituteUnit: item.unit,
          estimatedPrice: estimatedSubPrice,
          market: item.cheapestMarket === 'Stock Center' ? 'Atacadão' : 'Stock Center',
          savingsAmount: savings,
          savingsPercent: Math.round((savings / currentPrice) * 100),
          reason: 'Opção de marca alternativa sem custos extras de publicidade, mantendo seu orçamento no azul.',
          category: item.category,
        },
      ];
    }
    return [];
  }

  const options = PASSO_FUNDO_CHEAPER_SUBSTITUTES[matchKey];
  const results: ProductSubstitute[] = [];

  options.forEach((opt, idx) => {
    // Check if the substitute is actually cheaper than current item price
    if (opt.estimatedPrice < currentPrice) {
      const savingsAmount = Math.round((currentPrice - opt.estimatedPrice) * 100) / 100;
      const savingsPercent = Math.round((savingsAmount / currentPrice) * 100);

      results.push({
        id: `sub-${item.id}-${idx}`,
        originalProductId: item.id,
        originalProductName: item.name,
        originalPrice: currentPrice,
        originalBrand: item.brand,
        substituteName: opt.substituteName,
        substituteBrand: opt.substituteBrand,
        substituteUnit: opt.substituteUnit,
        estimatedPrice: opt.estimatedPrice,
        market: opt.market,
        savingsAmount,
        savingsPercent,
        reason: opt.reason,
        category: item.category,
      });
    }
  });

  return results;
}

/**
 * Convert a substitute into a ShoppingListItem for direct addition to the user's Rancho
 */
export function createShoppingItemFromSubstitute(
  sub: ProductSubstitute,
  existingList: ShoppingListItem[]
): ShoppingListItem {
  return {
    id: `rancho-sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: sub.substituteName,
    category: (sub.category as any) || 'cesta_basica',
    unit: sub.substituteUnit,
    quantity: 1,
    brand: sub.substituteBrand,
    prices: {
      [sub.market]: sub.estimatedPrice,
    },
    selectedMarket: sub.market,
    unitPrice: sub.estimatedPrice,
    totalPrice: sub.estimatedPrice,
    isEssential: true,
    priority: 'essencial',
    isBought: false,
  };
}
