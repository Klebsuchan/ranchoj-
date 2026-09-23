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

export interface EssentialStapleConfig {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string;
  brand: string;
  qtySolo: number;     // 1 person for 30 full days
  qtyCasal: number;    // 2 people for 30 full days
  qtyFamilia: number;  // 3-4 people for 30 full days
  portionDesc: string; // Ex: "Consumo 30d: ~160g/dia cru"
  prices: Record<string, number>;
}

/**
 * 48 Core Essential Staples of a full Brazilian / Gaucho monthly grocery haul ("Rancho do Mês").
 * Covers pantry basics, meats/poultry/eggs, fresh produce, cleaning supplies and personal hygiene.
 */
export const ESSENTIAL_STAPLES: EssentialStapleConfig[] = [
  // --- DESPENSA & SUSTENTO (CARBOIDRATOS E BÁSICOS) ---
  {
    id: 'arroz-5kg',
    name: 'Arroz Branco Tipo 1 (5kg)',
    category: 'cesta_basica',
    unit: 'pct 5kg',
    brand: 'Tio João / Prato Fino / Blue Ville',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: 5kg dura o mês para 1 pessoa (10kg casal, 15kg família)',
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
    id: 'feijao-preto-1kg',
    name: 'Feijão Preto Tipo 1 (1kg)',
    category: 'cesta_basica',
    unit: 'kg',
    brand: 'Caldo Nobre / Kicaldo / Tio Jorge',
    qtySolo: 2,
    qtyCasal: 3,
    qtyFamilia: 5,
    portionDesc: 'Consumo 30d: 2kg a 5kg para feijão diário no almoço',
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
    id: 'feijao-carioca-1kg',
    name: 'Feijão Carioca Tipo 1 (1kg)',
    category: 'cesta_basica',
    unit: 'kg',
    brand: 'Camil / Kicaldo',
    qtySolo: 1,
    qtyCasal: 1,
    qtyFamilia: 2,
    portionDesc: 'Consumo 30d: Variação de feijão para sopas ou caldo',
    prices: {
      'Stock Center': 6.49,
      'Atacadão': 6.69,
      'Supermercado Boqueirão': 6.99,
      'Zaffari': 7.59,
      'Bourbon': 7.89,
      'Coqueiros': 7.20,
    },
  },
  {
    id: 'acucar-1kg',
    name: 'Açúcar Refinado ou Cristal (1kg)',
    category: 'cesta_basica',
    unit: 'kg',
    brand: 'União / Alto Alegre / Da Barra',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 4,
    portionDesc: 'Consumo 30d: Para cafés, sucos e receitas caseiras',
    prices: {
      'Stock Center': 4.19,
      'Atacadão': 4.29,
      'Supermercado Boqueirão': 4.59,
      'Zaffari': 4.89,
      'Bourbon': 4.99,
      'Coqueiros': 4.69,
    },
  },
  {
    id: 'sal-1kg',
    name: 'Sal Refinado Iodado (1kg)',
    category: 'cesta_basica',
    unit: 'kg',
    brand: 'Cisne / Lebre',
    qtySolo: 1,
    qtyCasal: 1,
    qtyFamilia: 1,
    portionDesc: 'Consumo 30d: 1 pacote supre tranquilamente todo o mês',
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
    id: 'oleo-soja-900ml',
    name: 'Óleo de Soja Refinado (900ml)',
    category: 'cesta_basica',
    unit: 'frasco 900ml',
    brand: 'Soya / Liza / Cocamar',
    qtySolo: 2,
    qtyCasal: 3,
    qtyFamilia: 5,
    portionDesc: 'Consumo 30d: Cozimento, refogados e frituras do mês',
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
    id: 'cafe-500g',
    name: 'Café Torrado e Moído (500g)',
    category: 'cesta_basica',
    unit: 'pct 500g',
    brand: 'Melitta / Pilão / Caboclo',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: 500g rende ~40 a 50 xícaras de café coado',
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
    id: 'farinha-trigo-1kg',
    name: 'Farinha de Trigo Especial Tipo 1 (1kg)',
    category: 'cesta_basica',
    unit: 'kg',
    brand: 'Orquídea / Rosa Branca / Lili',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: Panquecas, bolos, empanados e massas',
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
    id: 'farinha-milho-1kg',
    name: 'Farinha de Milho / Fubá / Polenta (1kg)',
    category: 'cesta_basica',
    unit: 'kg',
    brand: 'Yoki / Fritz & Frida / Zaeli',
    qtySolo: 1,
    qtyCasal: 1,
    qtyFamilia: 2,
    portionDesc: 'Consumo 30d: Tradicional polenta e bolos de milho no RS',
    prices: {
      'Stock Center': 3.49,
      'Atacadão': 3.59,
      'Supermercado Boqueirão': 3.89,
      'Zaffari': 4.19,
      'Bourbon': 4.39,
      'Coqueiros': 3.99,
    },
  },
  {
    id: 'massa-espaguete-500g',
    name: 'Massa Espaguete com Ovos ou Sêmola (500g)',
    category: 'cesta_basica',
    unit: 'pct 500g',
    brand: 'Isabela / Orquídea / Barilla',
    qtySolo: 2,
    qtyCasal: 3,
    qtyFamilia: 5,
    portionDesc: 'Consumo 30d: Espaguete rápido para almoços da semana',
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
    id: 'massa-parafuso-500g',
    name: 'Massa Parafuso ou Pena (500g)',
    category: 'cesta_basica',
    unit: 'pct 500g',
    brand: 'Isabela / Orquídea',
    qtySolo: 2,
    qtyCasal: 3,
    qtyFamilia: 4,
    portionDesc: 'Consumo 30d: Macarronadas com carne moída ou molho',
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
    id: 'molho-tomate-300g',
    name: 'Molho de Tomate Tradicional (Sachê 300g)',
    category: 'cesta_basica',
    unit: 'sachê',
    brand: 'Elefante / Fugini / Pomarola',
    qtySolo: 3,
    qtyCasal: 5,
    qtyFamilia: 8,
    portionDesc: 'Consumo 30d: Molhos para massas, carnes e refogados',
    prices: {
      'Stock Center': 1.99,
      'Atacadão': 2.09,
      'Supermercado Boqueirão': 2.29,
      'Zaffari': 2.59,
      'Bourbon': 2.69,
      'Coqueiros': 2.39,
    },
  },
  {
    id: 'leite-1l',
    name: 'Leite UHT Integral (1 Litro)',
    category: 'cesta_basica',
    unit: 'Litros',
    brand: 'Elegê / Piracanjuba / Piá',
    qtySolo: 6,
    qtyCasal: 12,
    qtyFamilia: 24,
    portionDesc: 'Consumo 30d: Café com leite matinal e receitas (12L = 1 fardo)',
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
    id: 'achocolatado-400g',
    name: 'Achocolatado em Pó (400g)',
    category: 'cesta_basica',
    unit: 'pote 400g',
    brand: 'Nescau / Toddy / 3 Corações',
    qtySolo: 1,
    qtyCasal: 1,
    qtyFamilia: 2,
    portionDesc: 'Consumo 30d: Café da manhã e lanches',
    prices: {
      'Stock Center': 6.49,
      'Atacadão': 6.79,
      'Supermercado Boqueirão': 7.20,
      'Zaffari': 7.89,
      'Bourbon': 8.19,
      'Coqueiros': 7.49,
    },
  },
  {
    id: 'biscoito-cream-cracker-400g',
    name: 'Biscoito Cream Cracker Água e Sal (400g)',
    category: 'cesta_basica',
    unit: 'pct 400g',
    brand: 'Zezé / Isabela / Marilan',
    qtySolo: 2,
    qtyCasal: 3,
    qtyFamilia: 4,
    portionDesc: 'Consumo 30d: Café da manhã com manteiga/requeijão',
    prices: {
      'Stock Center': 4.49,
      'Atacadão': 4.69,
      'Supermercado Boqueirão': 4.99,
      'Zaffari': 5.49,
      'Bourbon': 5.79,
      'Coqueiros': 5.19,
    },
  },
  {
    id: 'biscoito-recheado-130g',
    name: 'Biscoito Recheado Tradicional (130g)',
    category: 'cesta_basica',
    unit: 'pct',
    brand: 'Passatempo / Bono / Trakinas',
    qtySolo: 2,
    qtyCasal: 3,
    qtyFamilia: 6,
    portionDesc: 'Consumo 30d: Lanche prático e sobremesa',
    prices: {
      'Stock Center': 2.49,
      'Atacadão': 2.59,
      'Supermercado Boqueirão': 2.89,
      'Zaffari': 3.19,
      'Bourbon': 3.39,
      'Coqueiros': 2.99,
    },
  },
  {
    id: 'vinagre-alcool-750ml',
    name: 'Vinagre de Álcool (750ml)',
    category: 'cesta_basica',
    unit: 'frasco',
    brand: 'Castelo / Minhoto',
    qtySolo: 1,
    qtyCasal: 1,
    qtyFamilia: 1,
    portionDesc: 'Consumo 30d: Higienização de saladas e tempero',
    prices: {
      'Stock Center': 2.19,
      'Atacadão': 2.29,
      'Supermercado Boqueirão': 2.49,
      'Zaffari': 2.79,
      'Bourbon': 2.99,
      'Coqueiros': 2.59,
    },
  },
  {
    id: 'maionese-500g',
    name: 'Maionese Tradicional (Pote 500g)',
    category: 'cesta_basica',
    unit: 'pote 500g',
    brand: 'Hellmanns / Liza / Soya',
    qtySolo: 1,
    qtyCasal: 1,
    qtyFamilia: 2,
    portionDesc: 'Consumo 30d: Salada de maionese de domingo e lanches',
    prices: {
      'Stock Center': 5.49,
      'Atacadão': 5.79,
      'Supermercado Boqueirão': 6.19,
      'Zaffari': 6.79,
      'Bourbon': 6.99,
      'Coqueiros': 6.39,
    },
  },
  {
    id: 'erva-mate-1kg',
    name: 'Erva-Mate para Chimarrão Tradicional (1kg)',
    category: 'cesta_basica',
    unit: 'pct 1kg',
    brand: 'Barão de Cotegipe / Rei Verde / Madrugada',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: Indispensável no dia a dia gaúcho em Passo Fundo',
    prices: {
      'Stock Center': 13.90,
      'Atacadão': 14.20,
      'Supermercado Boqueirão': 14.90,
      'Zaffari': 16.50,
      'Bourbon': 16.90,
      'Coqueiros': 15.50,
    },
  },

  // --- PROTEÍNAS, CARNES, OVOS & FRIOS ---
  {
    id: 'ovos-30un',
    name: 'Ovos Brancos Médios (Bandeja 30un)',
    category: 'carnes_proteinas',
    unit: 'bandeja 30un',
    brand: 'Granja Regional PF / Naturovos',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: 30 ovos = 1 ovo/dia para solo (60 casal, 90 família)',
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
    id: 'frango-peito-kg',
    name: 'Peito de Frango Congelado (kg)',
    category: 'carnes_proteinas',
    unit: 'kg',
    brand: 'Seara / Sadia / Aurora',
    qtySolo: 2,
    qtyCasal: 4,
    qtyFamilia: 6,
    portionDesc: 'Consumo 30d: Filés grelhados, iscas e desfiado proteico',
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
    id: 'frango-coxa-kg',
    name: 'Coxa e Sobrecoxa de Frango (kg)',
    category: 'carnes_proteinas',
    unit: 'kg',
    brand: 'Seara / Aurora / Agrosul',
    qtySolo: 2,
    qtyCasal: 3,
    qtyFamilia: 5,
    portionDesc: 'Consumo 30d: Frango assado com batatas ou ensopado',
    prices: {
      'Stock Center': 9.49,
      'Atacadão': 9.89,
      'Supermercado Boqueirão': 10.49,
      'Zaffari': 11.90,
      'Bourbon': 12.50,
      'Coqueiros': 10.90,
    },
  },
  {
    id: 'carne-moida-kg',
    name: 'Carne Moída de Segunda / Acém Fresco (kg)',
    category: 'carnes_proteinas',
    unit: 'kg',
    brand: 'Açougue Fresco PF',
    qtySolo: 1.5,
    qtyCasal: 3,
    qtyFamilia: 4.5,
    portionDesc: 'Consumo 30d: Panquecas, molho bolonhesa, hambúrguer e almôndegas',
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
    id: 'carne-bife-kg',
    name: 'Carne Bovina para Bife / Paleta ou Coxão Mole (kg)',
    category: 'carnes_proteinas',
    unit: 'kg',
    brand: 'Cortes Bovinos Selecionados RS',
    qtySolo: 1.5,
    qtyCasal: 2.5,
    qtyFamilia: 4,
    portionDesc: 'Consumo 30d: Bifes acebolados e ensopados na panela',
    prices: {
      'Stock Center': 29.90,
      'Atacadão': 30.90,
      'Supermercado Boqueirão': 32.50,
      'Zaffari': 35.90,
      'Bourbon': 37.90,
      'Coqueiros': 33.90,
    },
  },
  {
    id: 'linguica-calabresa-kg',
    name: 'Linguiça Calabresa Defumada (kg)',
    category: 'carnes_proteinas',
    unit: 'kg',
    brand: 'Perdigão / Sadia / Pamplona',
    qtySolo: 1,
    qtyCasal: 1.5,
    qtyFamilia: 2.5,
    portionDesc: 'Consumo 30d: Enriquecer o feijão, arroz carreteiro e massas',
    prices: {
      'Stock Center': 19.90,
      'Atacadão': 20.50,
      'Supermercado Boqueirão': 21.90,
      'Zaffari': 23.90,
      'Bourbon': 24.90,
      'Coqueiros': 22.50,
    },
  },
  {
    id: 'queijo-mussarela-400g',
    name: 'Queijo Mussarela Fatiado (400g)',
    category: 'carnes_proteinas',
    unit: 'pct 400g',
    brand: 'Santa Clara / Piá / Languiru',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: Sanduíches e gratinados',
    prices: {
      'Stock Center': 16.90,
      'Atacadão': 17.49,
      'Supermercado Boqueirão': 18.50,
      'Zaffari': 20.50,
      'Bourbon': 21.50,
      'Coqueiros': 19.20,
    },
  },
  {
    id: 'presunto-cozido-300g',
    name: 'Presunto Cozido Fatiado (300g)',
    category: 'carnes_proteinas',
    unit: 'pct 300g',
    brand: 'Sadia / Seara / Perdigão',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: Misto quente e lanches da tarde',
    prices: {
      'Stock Center': 8.90,
      'Atacadão': 9.20,
      'Supermercado Boqueirão': 9.90,
      'Zaffari': 11.20,
      'Bourbon': 11.80,
      'Coqueiros': 10.50,
    },
  },
  {
    id: 'margarina-500g',
    name: 'Margarina com Sal (500g)',
    category: 'carnes_proteinas',
    unit: 'pote 500g',
    brand: 'Qualy / Doriana / Claybom',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: Passar no pão e preparações',
    prices: {
      'Stock Center': 5.49,
      'Atacadão': 5.79,
      'Supermercado Boqueirão': 6.19,
      'Zaffari': 6.89,
      'Bourbon': 7.20,
      'Coqueiros': 6.49,
    },
  },

  // --- HORTIFRÚTI ESSENCIAL & RESISTENTE (PARA DURAR) ---
  {
    id: 'batata-inglesa-kg',
    name: 'Batata Inglesa Lavada (kg)',
    category: 'hortifruti',
    unit: 'kg',
    brand: 'Produtor Regional RS',
    qtySolo: 3,
    qtyCasal: 5,
    qtyFamilia: 8,
    portionDesc: 'Consumo 30d: Acompanhamento clássico frito, cozido ou purê',
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
    qtySolo: 2,
    qtyCasal: 3,
    qtyFamilia: 5,
    portionDesc: 'Consumo 30d: Base obrigatória para temperar feijão e carnes',
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
    id: 'alho-cartela-200g',
    name: 'Alho Roxo Nacional (Cartela 200g)',
    category: 'hortifruti',
    unit: 'cartela 200g',
    brand: 'Hortifrúti Selecionado',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: Tempero diário essencial de arroz e feijão',
    prices: {
      'Stock Center': 5.90,
      'Atacadão': 6.20,
      'Supermercado Boqueirão': 6.80,
      'Zaffari': 7.50,
      'Bourbon': 7.90,
      'Coqueiros': 7.10,
    },
  },
  {
    id: 'tomate-kg',
    name: 'Tomate Longa Vida Especial (kg)',
    category: 'hortifruti',
    unit: 'kg',
    brand: 'Produtor da Região Norte RS',
    qtySolo: 2,
    qtyCasal: 3,
    qtyFamilia: 5,
    portionDesc: 'Consumo 30d: Saladas frescas e refogados',
    prices: {
      'Stock Center': 5.89,
      'Atacadão': 6.19,
      'Supermercado Boqueirão': 6.59,
      'Zaffari': 7.49,
      'Bourbon': 7.89,
      'Coqueiros': 6.99,
    },
  },
  {
    id: 'cenoura-kg',
    name: 'Cenoura Selecionada (kg)',
    category: 'hortifruti',
    unit: 'kg',
    brand: 'Feira Regional Passo Fundo',
    qtySolo: 1.5,
    qtyCasal: 2.5,
    qtyFamilia: 4,
    portionDesc: 'Consumo 30d: Ralada em saladas, sopas e cozidos',
    prices: {
      'Stock Center': 3.99,
      'Atacadão': 4.29,
      'Supermercado Boqueirão': 4.59,
      'Zaffari': 5.19,
      'Bourbon': 5.49,
      'Coqueiros': 4.79,
    },
  },
  {
    id: 'banana-prata-kg',
    name: 'Banana Prata ou Caturra (kg)',
    category: 'hortifruti',
    unit: 'kg',
    brand: 'Feira Regional',
    qtySolo: 3,
    qtyCasal: 5,
    qtyFamilia: 8,
    portionDesc: 'Consumo 30d: Fruta do dia a dia, rica em potássio',
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
    id: 'maca-nacional-kg',
    name: 'Maçã Nacional Gala (kg)',
    category: 'hortifruti',
    unit: 'kg',
    brand: 'Pomares de Vacaria RS',
    qtySolo: 2,
    qtyCasal: 3,
    qtyFamilia: 5,
    portionDesc: 'Consumo 30d: Alta durabilidade na geladeira para lanches',
    prices: {
      'Stock Center': 6.49,
      'Atacadão': 6.79,
      'Supermercado Boqueirão': 7.19,
      'Zaffari': 7.99,
      'Bourbon': 8.49,
      'Coqueiros': 7.59,
    },
  },

  // --- PRODUTOS DE LIMPEZA DO LAR (MÊS INTEIRO) ---
  {
    id: 'sabao-po-1kg',
    name: 'Sabão em Pó / Líquido Lava-Roupas (1kg ou 1.6kg)',
    category: 'limpeza_higiene',
    unit: 'caixa',
    brand: 'Tixan Ypê / Omo / Brilhante',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 4,
    portionDesc: 'Consumo 30d: Lavagens semanais de roupas e lençóis',
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
    id: 'amaciante-2l',
    name: 'Amaciante de Roupas Tradicional (2L)',
    category: 'limpeza_higiene',
    unit: 'frasco 2L',
    brand: 'Ypê / Comfort / Downy',
    qtySolo: 1,
    qtyCasal: 1,
    qtyFamilia: 2,
    portionDesc: 'Consumo 30d: Perfume e maciez nas lavagens do mês',
    prices: {
      'Stock Center': 7.90,
      'Atacadão': 8.20,
      'Supermercado Boqueirão': 8.90,
      'Zaffari': 9.90,
      'Bourbon': 10.50,
      'Coqueiros': 9.20,
    },
  },
  {
    id: 'agua-sanitaria-2l',
    name: 'Água Sanitária Cloro Ativo (2L)',
    category: 'limpeza_higiene',
    unit: 'garrafa 2L',
    brand: 'QBoa / Ypê / Dragão',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: Desinfecção pesada de banheiros, calçadas e pisos',
    prices: {
      'Stock Center': 4.89,
      'Atacadão': 5.19,
      'Supermercado Boqueirão': 5.59,
      'Zaffari': 5.99,
      'Bourbon': 6.39,
      'Coqueiros': 5.69,
    },
  },
  {
    id: 'detergente-500ml',
    name: 'Detergente Líquido Lava-Louças (500ml)',
    category: 'limpeza_higiene',
    unit: 'frascos',
    brand: 'Ypê / Limpol / Minuano',
    qtySolo: 3,
    qtyCasal: 5,
    qtyFamilia: 7,
    portionDesc: 'Consumo 30d: Louça diária de todas as refeições do mês',
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
    id: 'desinfetante-piso-2l',
    name: 'Desinfetante Perfumado para Piso (2L)',
    category: 'limpeza_higiene',
    unit: 'frasco 2L',
    brand: 'Pinho Sol / Veja / Sanol',
    qtySolo: 1,
    qtyCasal: 1,
    qtyFamilia: 2,
    portionDesc: 'Consumo 30d: Passar pano semanal na casa inteira',
    prices: {
      'Stock Center': 6.49,
      'Atacadão': 6.89,
      'Supermercado Boqueirão': 7.49,
      'Zaffari': 8.19,
      'Bourbon': 8.59,
      'Coqueiros': 7.79,
    },
  },
  {
    id: 'esponja-louca-4un',
    name: 'Esponja Dupla Face Lava-Louças (Pacote c/ 4un)',
    category: 'limpeza_higiene',
    unit: 'pct 4un',
    brand: 'Scotch-Brite / Bettanin / Bombril',
    qtySolo: 1,
    qtyCasal: 1,
    qtyFamilia: 2,
    portionDesc: 'Consumo 30d: 4 esponjas = trocar 1 a cada semana (higiênico)',
    prices: {
      'Stock Center': 3.99,
      'Atacadão': 4.19,
      'Supermercado Boqueirão': 4.59,
      'Zaffari': 4.99,
      'Bourbon': 5.29,
      'Coqueiros': 4.69,
    },
  },
  {
    id: 'saco-lixo-30l',
    name: 'Sacos para Lixo Reforçados 30L/50L (Rolo c/ 30un)',
    category: 'limpeza_higiene',
    unit: 'rolo 30un',
    brand: 'Embalixo / Dover Roll',
    qtySolo: 1,
    qtyCasal: 1,
    qtyFamilia: 2,
    portionDesc: 'Consumo 30d: 30 sacos = 1 saco descartado por dia',
    prices: {
      'Stock Center': 8.90,
      'Atacadão': 9.20,
      'Supermercado Boqueirão': 9.90,
      'Zaffari': 10.90,
      'Bourbon': 11.50,
      'Coqueiros': 10.20,
    },
  },
  {
    id: 'limpador-multiuso-500ml',
    name: 'Limpador Multiuso Geral (500ml)',
    category: 'limpeza_higiene',
    unit: 'frasco 500ml',
    brand: 'Veja Multiuso / Ypê',
    qtySolo: 1,
    qtyCasal: 1,
    qtyFamilia: 2,
    portionDesc: 'Consumo 30d: Limpeza rápida de bancadas, fogão e mesa',
    prices: {
      'Stock Center': 3.89,
      'Atacadão': 4.09,
      'Supermercado Boqueirão': 4.49,
      'Zaffari': 4.89,
      'Bourbon': 5.19,
      'Coqueiros': 4.59,
    },
  },

  // --- HIGIENE PESSOAL (MÊS INTEIRO) ---
  {
    id: 'papel-higienico-12un',
    name: 'Papel Higiênico Folha Dupla (Pacote 12 rolos)',
    category: 'limpeza_higiene',
    unit: 'fardo 12 rolos',
    brand: 'Personal / Neve / Sublime',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: 12 rolos solo (24 casal, 36 família)',
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
    unit: 'unidades',
    brand: 'Palmolive / Protex / Francis',
    qtySolo: 4,
    qtyCasal: 8,
    qtyFamilia: 12,
    portionDesc: 'Consumo 30d: Banho diário (1 sabonete por semana por pessoa)',
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
    name: 'Creme Dental Anticáries Tripla Ação (90g)',
    category: 'limpeza_higiene',
    unit: 'tubos',
    brand: 'Sorriso / Colgate',
    qtySolo: 2,
    qtyCasal: 3,
    qtyFamilia: 5,
    portionDesc: 'Consumo 30d: Escovação diária após cada refeição',
    prices: {
      'Stock Center': 3.89,
      'Atacadão': 4.09,
      'Supermercado Boqueirão': 4.39,
      'Zaffari': 4.79,
      'Bourbon': 4.99,
      'Coqueiros': 4.30,
    },
  },
  {
    id: 'shampoo-350ml',
    name: 'Shampoo Familiar Suave (350ml)',
    category: 'limpeza_higiene',
    unit: 'frasco',
    brand: 'Seda / Palmolive / Pantene',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: Lavagem dos cabelos durante todo o mês',
    prices: {
      'Stock Center': 8.90,
      'Atacadão': 9.20,
      'Supermercado Boqueirão': 9.90,
      'Zaffari': 11.20,
      'Bourbon': 11.80,
      'Coqueiros': 10.50,
    },
  },
  {
    id: 'desodorante-aerosol-150ml',
    name: 'Desodorante Antitranspirante Aerosol (150ml)',
    category: 'limpeza_higiene',
    unit: 'frasco',
    brand: 'Rexona / Nivea / Dove',
    qtySolo: 1,
    qtyCasal: 2,
    qtyFamilia: 3,
    portionDesc: 'Consumo 30d: 1 frasco aerosol dura o mês inteiro',
    prices: {
      'Stock Center': 10.90,
      'Atacadão': 11.40,
      'Supermercado Boqueirão': 12.20,
      'Zaffari': 13.50,
      'Bourbon': 13.90,
      'Coqueiros': 12.60,
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
 * Generates 3 curated Rancho Pronto options based on selected budget and nearby promo density.
 * Now guarantees ALL 48 monthly essentials are represented with realistic 30-day portions.
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
  const safeBudget = Math.max(150, Math.round(budget || 450));
  const userLoc = resolveCoordinates(userCoords, userNeighborhood);

  // Calculate distance from user location to all Passo Fundo supermarkets
  const storesWithDistance = PASSO_FUNDO_STORES.map((store) => {
    const dist = calculateDistanceKm(userLoc.lat, userLoc.lng, store.lat, store.lng);
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

  /**
   * Helper function to build grocery list for given target store(s).
   * Unlike the old implementation which truncated to 19 items, this function ensures
   * EVERY staple is included. Quantities are scaled cleanly according to budget.
   */
  const buildItemsList = (
    primaryMarket: SupermarketName,
    secondaryMarket?: SupermarketName,
    useComboSplit = false
  ): { items: ShoppingListItem[]; total: number; savings: number } => {
    let currentTotal = 0;
    const resultItems: ShoppingListItem[] = [];

    // Base benchmark budget for the profile
    const benchmarkBudget = householdType === 'casal' ? 850 : householdType === 'familia' ? 1350 : 480;
    const ratio = Math.max(0.65, Math.min(1.8, safeBudget / benchmarkBudget));

    for (const staple of ESSENTIAL_STAPLES) {
      let marketToUse = primaryMarket;
      if (useComboSplit && secondaryMarket) {
        // In combo: produce & meats at secondaryMarket (fresh store), staples & cleaning at primary (wholesale)
        if (staple.category === 'hortifruti' || staple.category === 'carnes_proteinas') {
          marketToUse = secondaryMarket;
        }
      }

      const unitPrice = staple.prices[marketToUse] || staple.prices['Stock Center'] || 5.0;

      // Base quantity from profile
      let baseProfileQty = householdType === 'casal' 
        ? staple.qtyCasal 
        : householdType === 'familia' 
          ? staple.qtyFamilia 
          : staple.qtySolo;

      // Scale gently if budget is larger or smaller, keeping whole or sensible numbers
      let qty = baseProfileQty;
      if (ratio > 1.25) {
        qty = Math.round(baseProfileQty * Math.min(1.5, ratio));
      } else if (ratio < 0.8) {
        qty = Math.max(1, Math.round(baseProfileQty * Math.max(0.7, ratio)));
      }

      // Special rule: always at least 1 unit of everything in monthly rancho
      if (qty < 1) qty = 1;

      const itemCost = Number((unitPrice * qty).toFixed(2));
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

    // Calculate realistic savings vs average market in Passo Fundo
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
    description: `Concentra 100% das compras do mês no atacarejo perto de você (${nearestWholesale.name}). Você faz 1 única viagem, gasta apenas R$ ${fuel1.fuelCost.toFixed(2)} em gasolina e garante o menor custo nos ${opt1Data.items.length} itens do mês inteiro.`,
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
      `${opt1Data.items.length} itens completos cobrindo despensa, carnes, hortifrúti e limpeza para 30 dias`,
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
      `${opt2Data.items.length} itens essenciais sem precisar atravessar a cidade`,
      'Chegue rápido, compre sem estresse e volte em menos de 40 min',
    ],
  };

  // --- OPÇÃO 3: COMBO INTELIGENTE (2 MELHORES VIZINHOS) ---
  const opt3Data = buildItemsList(nearestWholesale.chain, complementaryStore.chain, true);
  const combinedDistance = Number(((nearestWholesale.distanceKm + complementaryStore.distanceKm) * 0.75).toFixed(2));
  const fuel3 = calculateFuelAndTrip(combinedDistance);
  const savings3 = Number((opt3Data.savings + 18.5).toFixed(2));
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
      `Economia líquida de R$ ${netSavings3.toFixed(2)} com ${opt3Data.items.length} itens organizados`,
    ],
  };

  return [option1, option2, option3];
}
