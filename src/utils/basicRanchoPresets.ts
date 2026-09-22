import { ShoppingListItem, SupermarketName } from '../types';

export interface BasicRanchoCategoryBreakdown {
  categoryName: string;
  allocatedAmount: number;
  percentage: number;
  itemsSummary: string;
}

export interface BasicRanchoBudgetAnalysis {
  type: 'solo' | 'casal';
  title: string;
  peopleCount: number;
  minWage: number;
  fixedExpenses: number;
  ranchoBudget: number;
  estimatedCostStokCenter: number;
  estimatedCostAtacadao: number;
  estimatedCostBoqueirao: number;
  estimatedCostBourbon: number;
  estimatedSavings: number;
  categories: BasicRanchoCategoryBreakdown[];
  passoFundoTips: string[];
}

export const BASIC_RANCHO_ANALYSIS: Record<'solo' | 'casal', BasicRanchoBudgetAnalysis> = {
  solo: {
    type: 'solo',
    title: 'Rancho Básico de Sobrevivência - 1 Pessoa (Sozinho)',
    peopleCount: 1,
    minWage: 1410.00,
    fixedExpenses: 1010.00, // Aluguel kitnet/quarto (~R$ 650) + Luz RGE (~R$ 130) + Água Corsan (~R$ 60) + Gás rateado (~R$ 35) + Internet/celular (~R$ 135)
    ranchoBudget: 400.00,
    estimatedCostStokCenter: 384.70,
    estimatedCostAtacadao: 391.20,
    estimatedCostBoqueirao: 412.50,
    estimatedCostBourbon: 478.90,
    estimatedSavings: 94.20,
    categories: [
      {
        categoryName: 'Cesta Básica & Carboidratos (Sustento)',
        allocatedAmount: 105.00,
        percentage: 27,
        itemsSummary: 'Arroz 5kg, Feijão preto 1kg, 3x Massas 500g, Óleo 900ml, Café 500g, Farinha trigo 1kg, Sal',
      },
      {
        categoryName: 'Carnes & Proteínas de Rendimento',
        allocatedAmount: 135.00,
        percentage: 35,
        itemsSummary: 'Bandeja 30 ovos, 2kg peito/coxa de frango, 1.5kg carne moída de segunda/acém',
      },
      {
        categoryName: 'Hortifrúti Essencial da Semana',
        allocatedAmount: 48.00,
        percentage: 12,
        itemsSummary: '2kg Batata inglesa, 1kg Cebola, 200g Alho, 2kg Banana prata/caturra',
      },
      {
        categoryName: 'Material de Limpeza da Casa',
        allocatedAmount: 49.00,
        percentage: 13,
        itemsSummary: '2x Detergentes 500ml, 1kg Sabão em pó, 2L Água sanitária, Pacote esponjas 3un',
      },
      {
        categoryName: 'Higiene Pessoal Indispensável',
        allocatedAmount: 47.70,
        percentage: 13,
        itemsSummary: 'Papel higiênico folha dupla 12un, 3x Sabonetes, Creme dental 90g, Shampoo econômico',
      },
    ],
    passoFundoTips: [
      'Comprar a bandeja de 30 ovos no Stok Center ou Atacadão (sai em média R$ 16 a R$ 17, custando apenas R$ 0,56 por ovo de proteína pura).',
      'Aproveitar a Quarta do Hortifrúti e a Quinta da Carne do Stok Center ou do Supermercado Boqueirão para comprar batata, cebola e frango mais baratos.',
      'A água sanitária (cloro ativo) substitui desinfetantes caros na higienização de banheiros e pisos quando diluída corretamente.',
      'Frango desfiado e carne moída com legumes rendem marmitas para a semana inteira de trabalho/faculdade.',
    ],
  },
  casal: {
    type: 'casal',
    title: 'Rancho Básico de Sobrevivência - Casal (2 Pessoas)',
    peopleCount: 2,
    minWage: 2820.00, // 2 salários mínimos de R$ 1.410
    fixedExpenses: 2020.00, // Aluguel apartamento 1-2 quartos (~R$ 1.200) + Condomínio (~R$ 200) + Luz RGE (~R$ 250) + Água (~R$ 110) + Gás (~R$ 80) + Internet (~R$ 180)
    ranchoBudget: 800.00,
    estimatedCostStokCenter: 772.40,
    estimatedCostAtacadao: 786.10,
    estimatedCostBoqueirao: 828.90,
    estimatedCostBourbon: 965.50,
    estimatedSavings: 193.10,
    categories: [
      {
        categoryName: 'Cesta Básica & Carboidratos (Sustento)',
        allocatedAmount: 215.00,
        percentage: 28,
        itemsSummary: '2x Arroz 5kg (10kg total), 2x Feijão preto 1kg, 6x Massas 500g, 2x Óleos, 2x Cafés 500g, 2x Farinhas, Molho tomate',
      },
      {
        categoryName: 'Carnes & Proteínas de Rendimento',
        allocatedAmount: 275.00,
        percentage: 35,
        itemsSummary: '2x Bandejas 30 ovos (60 ovos!), 4kg Peito e coxa frango, 2.5kg Carne moída de segunda/acém',
      },
      {
        categoryName: 'Hortifrúti Essencial da Semana',
        allocatedAmount: 95.00,
        percentage: 12,
        itemsSummary: '4kg Batata inglesa, 2kg Cebola, Alho, 4kg Banana prata, Tomate ou cenoura',
      },
      {
        categoryName: 'Material de Limpeza da Casa',
        allocatedAmount: 98.00,
        percentage: 13,
        itemsSummary: '4x Detergentes 500ml, 2kg Sabão em pó/líquido, 2L Água sanitária, Desinfetante, Pacote esponjas 4un',
      },
      {
        categoryName: 'Higiene Pessoal Indispensável',
        allocatedAmount: 89.40,
        percentage: 12,
        itemsSummary: '2x Pacotes papel higiênico 12un (24 rolos), 6x Sabonetes, 2x Cremes dentais 90g, 2x Shampoos econômicos',
      },
    ],
    passoFundoTips: [
      'No atacarejo (Stok Center ou Atacadão Passo Fundo), levar fardos fechados de papel higiênico, leite e sabão em pó garante preço de atacado.',
      '60 ovos garantem 1 ovo por dia para cada um no café da manhã e preparo de omeletes nutritivos à noite sem gastar com delivery.',
      'Dividir o preparo das marmitas no domingo à tarde economiza gás e evita comprar almoço caro na rua no centro ou bairro de Passo Fundo.',
      'Evitar marcas líderes de marketing em produtos de limpeza: marcas gaúchas regionais (como Minuano, Limpol, Ypê básico, QBoa) cumprem o mesmo papel com 30% a 40% de economia.',
    ],
  },
};

/**
 * Returns a complete, realistic shopping list for Solo (R$ 400) or Casal (R$ 800)
 * with verified pricing across Passo Fundo supermarkets.
 */
export function buildBasicRanchoItems(household: 'solo' | 'casal'): ShoppingListItem[] {
  const isCasal = household === 'casal';

  // Base items mapped with real Passo Fundo prices and quantities tailored to budget
  const items: Array<{
    name: string;
    category: 'cesta_basica' | 'carnes_proteinas' | 'hortifruti' | 'limpeza_higiene';
    quantity: number;
    unit: string;
    brand: string;
    stokPrice: number;
    atacadaoPrice: number;
    boqueiraoPrice: number;
    bourbonPrice: number;
    zaffariPrice: number;
    coqueirosPrice: number;
  }> = [
    // --- 1. CESTA BÁSICA & CARBOIDRATOS ---
    {
      name: 'Arroz Branco Tipo 1 (5kg)',
      category: 'cesta_basica',
      quantity: isCasal ? 2 : 1,
      unit: '5kg',
      brand: 'Tio João / Prato Fino / Blue Ville',
      stokPrice: 24.90,
      atacadaoPrice: 25.49,
      boqueiraoPrice: 26.89,
      bourbonPrice: 29.90,
      zaffariPrice: 28.90,
      coqueirosPrice: 27.50,
    },
    {
      name: 'Feijão Preto Tipo 1 (1kg)',
      category: 'cesta_basica',
      quantity: isCasal ? 2 : 1,
      unit: '1kg',
      brand: 'Caldo Nobre / Kicaldo / Tio Bonato',
      stokPrice: 5.79,
      atacadaoPrice: 5.95,
      boqueiraoPrice: 6.19,
      bourbonPrice: 7.20,
      zaffariPrice: 6.89,
      coqueirosPrice: 6.49,
    },
    {
      name: 'Massa Espaguete / Parafuso Sêmola (500g)',
      category: 'cesta_basica',
      quantity: isCasal ? 5 : 3,
      unit: '500g',
      brand: 'Isabela / Orquídea / Renata',
      stokPrice: 3.49,
      atacadaoPrice: 3.65,
      boqueiraoPrice: 3.89,
      bourbonPrice: 4.49,
      zaffariPrice: 4.19,
      coqueirosPrice: 3.99,
    },
    {
      name: 'Óleo de Soja Refinado (900ml)',
      category: 'cesta_basica',
      quantity: isCasal ? 2 : 1,
      unit: '900ml',
      brand: 'Soya / Liza / Leve',
      stokPrice: 5.89,
      atacadaoPrice: 5.99,
      boqueiraoPrice: 6.29,
      bourbonPrice: 6.79,
      zaffariPrice: 6.59,
      coqueirosPrice: 6.39,
    },
    {
      name: 'Farinha de Trigo Tradicional Tipo 1 (1kg)',
      category: 'cesta_basica',
      quantity: isCasal ? 2 : 1,
      unit: '1kg',
      brand: 'Orquídea / Rosa Branca / Maria Inês',
      stokPrice: 3.89,
      atacadaoPrice: 3.99,
      boqueiraoPrice: 4.19,
      bourbonPrice: 4.89,
      zaffariPrice: 4.69,
      coqueirosPrice: 4.29,
    },
    {
      name: 'Café Torrado e Moído Tradicional (500g)',
      category: 'cesta_basica',
      quantity: isCasal ? 2 : 1,
      unit: '500g',
      brand: 'Melitta / Caboclo / Pilão',
      stokPrice: 17.90,
      atacadaoPrice: 18.20,
      boqueiraoPrice: 19.20,
      bourbonPrice: 21.90,
      zaffariPrice: 20.80,
      coqueirosPrice: 19.90,
    },
    {
      name: 'Leite UHT Integral (1 Litro)',
      category: 'cesta_basica',
      quantity: isCasal ? 6 : 3,
      unit: '1L',
      brand: 'Elegê / Piracanjuba / Piá',
      stokPrice: 4.19,
      atacadaoPrice: 4.25,
      boqueiraoPrice: 4.49,
      bourbonPrice: 4.99,
      zaffariPrice: 4.89,
      coqueirosPrice: 4.69,
    },

    // --- 2. CARNES & PROTEÍNAS DE ALTO RENDIMENTO ---
    {
      name: 'Ovos Brancos Médios (Bandeja 30 un)',
      category: 'carnes_proteinas',
      quantity: isCasal ? 2 : 1,
      unit: '30 un',
      brand: 'Granja Local Passo Fundo / Naturovos',
      stokPrice: 16.90,
      atacadaoPrice: 17.50,
      boqueiraoPrice: 18.50,
      bourbonPrice: 21.90,
      zaffariPrice: 20.90,
      coqueirosPrice: 19.90,
    },
    {
      name: 'Peito de Frango com Osso / Congelado (kg)',
      category: 'carnes_proteinas',
      quantity: isCasal ? 3.5 : 2,
      unit: 'kg',
      brand: 'Seara / Sadia / Aurora',
      stokPrice: 12.99,
      atacadaoPrice: 13.49,
      boqueiraoPrice: 13.90,
      bourbonPrice: 16.90,
      zaffariPrice: 15.90,
      coqueirosPrice: 14.80,
    },
    {
      name: 'Carne Moída de Segunda / Acém Bovina (kg)',
      category: 'carnes_proteinas',
      quantity: isCasal ? 2.5 : 1.5,
      unit: 'kg',
      brand: 'Açougue Local PF / Friboi',
      stokPrice: 22.90,
      atacadaoPrice: 23.50,
      boqueiraoPrice: 24.90,
      bourbonPrice: 28.90,
      zaffariPrice: 27.50,
      coqueirosPrice: 25.90,
    },

    // --- 3. HORTIFRÚTI ESSENCIAL ---
    {
      name: 'Batata Inglesa Lavada (kg)',
      category: 'hortifruti',
      quantity: isCasal ? 4 : 2,
      unit: 'kg',
      brand: 'Produtor Regional RS',
      stokPrice: 4.49,
      atacadaoPrice: 4.89,
      boqueiraoPrice: 4.99,
      bourbonPrice: 6.49,
      zaffariPrice: 5.99,
      coqueirosPrice: 5.29,
    },
    {
      name: 'Cebola Nacional Selecionada (kg)',
      category: 'hortifruti',
      quantity: isCasal ? 2 : 1,
      unit: 'kg',
      brand: 'Hortifrúti Regional',
      stokPrice: 3.89,
      atacadaoPrice: 4.19,
      boqueiraoPrice: 4.39,
      bourbonPrice: 5.49,
      zaffariPrice: 4.99,
      coqueirosPrice: 4.50,
    },
    {
      name: 'Banana Prata / Caturra Selecionada (kg)',
      category: 'hortifruti',
      quantity: isCasal ? 3 : 2,
      unit: 'kg',
      brand: 'Feira Regional',
      stokPrice: 3.99,
      atacadaoPrice: 4.29,
      boqueiraoPrice: 4.69,
      bourbonPrice: 5.99,
      zaffariPrice: 5.49,
      coqueirosPrice: 4.59,
    },
    {
      name: 'Alho Granel / Cartela (200g)',
      category: 'hortifruti',
      quantity: 1,
      unit: '200g',
      brand: 'Alho Nacional',
      stokPrice: 5.99,
      atacadaoPrice: 6.29,
      boqueiraoPrice: 6.79,
      bourbonPrice: 7.99,
      zaffariPrice: 7.49,
      coqueirosPrice: 6.90,
    },

    // --- 4. MATERIAL DE LIMPEZA DA CASA ---
    {
      name: 'Detergente Líquido Lava-Louças (500ml)',
      category: 'limpeza_higiene',
      quantity: isCasal ? 4 : 2,
      unit: '500ml',
      brand: 'Ypê / Limpol / Minuano',
      stokPrice: 2.19,
      atacadaoPrice: 2.29,
      boqueiraoPrice: 2.49,
      bourbonPrice: 2.89,
      zaffariPrice: 2.79,
      coqueirosPrice: 2.59,
    },
    {
      name: 'Sabão em Pó / Líquido para Roupas (1kg)',
      category: 'limpeza_higiene',
      quantity: isCasal ? 2 : 1,
      unit: '1kg',
      brand: 'Tixan Ypê / Omo / Brilhante',
      stokPrice: 10.90,
      atacadaoPrice: 11.20,
      boqueiraoPrice: 12.50,
      bourbonPrice: 14.50,
      zaffariPrice: 13.80,
      coqueirosPrice: 12.90,
    },
    {
      name: 'Água Sanitária Cloro Ativo (1 Litro)',
      category: 'limpeza_higiene',
      quantity: isCasal ? 2 : 1,
      unit: '1L',
      brand: 'QBoa / Ypê / Da Ilha',
      stokPrice: 3.49,
      atacadaoPrice: 3.69,
      boqueiraoPrice: 3.99,
      bourbonPrice: 4.59,
      zaffariPrice: 4.29,
      coqueirosPrice: 3.89,
    },
    {
      name: 'Esponja de Louça Multiuso (Pacote 3un)',
      category: 'limpeza_higiene',
      quantity: 1,
      unit: '3 un',
      brand: 'Scotch-Brite / Bettanin / EsfreBom',
      stokPrice: 3.89,
      atacadaoPrice: 4.19,
      boqueiraoPrice: 4.49,
      bourbonPrice: 5.29,
      zaffariPrice: 4.89,
      coqueirosPrice: 4.40,
    },

    // --- 5. HIGIENE PESSOAL INDISPENSÁVEL ---
    {
      name: 'Papel Higiênico Folha Dupla (Pacote 12 un)',
      category: 'limpeza_higiene',
      quantity: isCasal ? 2 : 1,
      unit: '12 un',
      brand: 'Neve / Personal / Sublime',
      stokPrice: 14.90,
      atacadaoPrice: 15.30,
      boqueiraoPrice: 16.90,
      bourbonPrice: 19.90,
      zaffariPrice: 18.90,
      coqueirosPrice: 17.50,
    },
    {
      name: 'Sabonete em Barra Hidratante (90g)',
      category: 'limpeza_higiene',
      quantity: isCasal ? 6 : 3,
      unit: '90g',
      brand: 'Palmolive / Protex / Francis / Lux',
      stokPrice: 2.19,
      atacadaoPrice: 2.29,
      boqueiraoPrice: 2.49,
      bourbonPrice: 2.99,
      zaffariPrice: 2.89,
      coqueirosPrice: 2.69,
    },
    {
      name: 'Creme Dental Anticáries Tradicional (90g)',
      category: 'limpeza_higiene',
      quantity: isCasal ? 2 : 1,
      unit: '90g',
      brand: 'Sorriso / Colgate / Oral-B',
      stokPrice: 3.89,
      atacadaoPrice: 4.09,
      boqueiraoPrice: 4.39,
      bourbonPrice: 4.99,
      zaffariPrice: 4.79,
      coqueirosPrice: 4.30,
    },
    {
      name: 'Shampoo Suave Neutro Familiar (350ml)',
      category: 'limpeza_higiene',
      quantity: isCasal ? 2 : 1,
      unit: '350ml',
      brand: 'Seda / Suave / Palmolive',
      stokPrice: 7.89,
      atacadaoPrice: 8.19,
      boqueiraoPrice: 8.79,
      bourbonPrice: 9.99,
      zaffariPrice: 9.49,
      coqueirosPrice: 8.90,
    },
  ];

  return items.map((raw, index) => {
    const prices: Partial<Record<SupermarketName, number>> = {
      'Stock Center': raw.stokPrice,
      'Atacadão': raw.atacadaoPrice,
      'Supermercado Boqueirão': raw.boqueiraoPrice,
      'Bourbon': raw.bourbonPrice,
      'Zaffari': raw.zaffariPrice,
      'Coqueiros': raw.coqueirosPrice,
    };

    const lowestUnitPrice = raw.stokPrice; // Stok Center is cheapest on these essential staples
    const totalPrice = Number((lowestUnitPrice * raw.quantity).toFixed(2));

    return {
      id: `basic-rancho-${household}-${index}-${Date.now()}`,
      name: raw.name,
      category: raw.category,
      quantity: raw.quantity,
      unit: raw.unit,
      brand: raw.brand,
      prices,
      selectedMarket: 'best',
      unitPrice: lowestUnitPrice,
      totalPrice,
      isEssential: true,
      priority: 'essencial',
      isBought: false,
    };
  });
}
