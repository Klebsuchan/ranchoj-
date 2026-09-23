import { PassoFundoNeighborhood, SupermarketStore } from '../types';

export interface NeighborhoodCoord {
  neighborhood: PassoFundoNeighborhood;
  lat: number;
  lng: number;
  description: string;
}

export const PASSO_FUNDO_NEIGHBORHOODS: NeighborhoodCoord[] = [
  {
    neighborhood: 'Boqueirão',
    lat: -28.2685,
    lng: -52.4310,
    description: 'Bairro nobre e movimentado de Passo Fundo, cortado pela Av. Brasil Oeste',
  },
  {
    neighborhood: 'Centro',
    lat: -28.2618,
    lng: -52.4080,
    description: 'Região central, Rua General Netto, Morom, Uruguai e Praça Marechal Floriano',
  },
  {
    neighborhood: 'Petrópolis',
    lat: -28.2490,
    lng: -52.3810,
    description: 'Polo de atacarejos na Av. Brasil Leste e acesso à BR-285',
  },
  {
    neighborhood: 'São Cristóvão',
    lat: -28.2730,
    lng: -52.3980,
    description: 'Região do Passo Fundo Shopping e Av. Presidente Vargas',
  },
  {
    neighborhood: 'Vergueiro',
    lat: -28.2640,
    lng: -52.4140,
    description: 'Próximo ao Hospital São Vicente de Paulo e Rua Coronel Chicuta',
  },
  {
    neighborhood: 'Vera Cruz',
    lat: -28.2710,
    lng: -52.4410,
    description: 'Extensão oeste de Passo Fundo, vizinho ao Boqueirão',
  },
  {
    neighborhood: 'Lucas Araújo',
    lat: -28.2580,
    lng: -52.4220,
    description: 'Bairro residencial próximo à Faculdade de Medicina e Av. Brasil',
  },
  {
    neighborhood: 'Integração',
    lat: -28.2420,
    lng: -52.4010,
    description: 'Zona norte de Passo Fundo, saída para a RS-324',
  },
];

export const PASSO_FUNDO_STORES: SupermarketStore[] = [
  // 1. GRANDES ATACAREJOS & FILIAIS
  {
    id: 'stok-boqueirao',
    name: 'Stok Center - Boqueirão',
    chain: 'Stock Center',
    neighborhood: 'Boqueirão',
    address: 'Av. Brasil Oeste, 3477 - Boqueirão',
    lat: -28.2715,
    lng: -52.4355,
    openHours: 'Seg a Sáb: 07:30 às 21:00 • Dom: 08:00 às 20:00',
    highlightPromo: 'Maior atacarejo do Boqueirão: Arroz 5kg a R$ 24,90, Ovos 30un a R$ 16,90',
    phone: '(54) 3316-4000',
    storeType: 'atacarejo',
    tagline: 'Grande atacarejo com descontos por volume e fardos',
    specialties: ['Cesta básica no fardo', 'Bebidas no atacado', 'Produtos de limpeza pesada'],
  },
  {
    id: 'stok-petropolis',
    name: 'Stok Center - Petrópolis',
    chain: 'Stock Center',
    neighborhood: 'Petrópolis',
    address: 'Av. Brasil Leste, 2333 - Petrópolis',
    lat: -28.2520,
    lng: -52.3830,
    openHours: 'Seg a Sáb: 07:30 às 21:00 • Dom: 08:00 às 20:00',
    highlightPromo: 'Pioneiro em atacado de Passo Fundo: Fardos de leite, café e óleo com desconto',
    phone: '(54) 3316-4100',
    storeType: 'atacarejo',
    tagline: 'Grande filial atacarejo na Av. Brasil Leste',
    specialties: ['Fardos fechados', 'Laticínios industriais', 'Higiene econômica'],
  },
  {
    id: 'atacadao-pf',
    name: 'Atacadão Passo Fundo',
    chain: 'Atacadão',
    neighborhood: 'Petrópolis',
    address: 'Rodovia BR-285, km 294 (Trevo Petrópolis)',
    lat: -28.2435,
    lng: -52.3780,
    openHours: 'Seg a Sáb: 07:00 às 22:00 • Dom: 08:00 às 18:00',
    highlightPromo: 'Preço de atacado em escala: Descontos extras no Cartão Atacadão/Carrefour',
    phone: '(54) 3045-8000',
    storeType: 'atacarejo',
    tagline: 'Maior atacado de autosserviço da região norte do RS',
    specialties: ['Grandes embalagens', 'Preço de pessoa jurídica e física', 'Alimentos secos'],
  },

  // 2. MERCADOS DE BAIRRO (Próximos do comprador, rápidos e sem gasto de gasolina)
  {
    id: 'super-boqueirao',
    name: 'Supermercado Boqueirão',
    chain: 'Supermercado Boqueirão',
    neighborhood: 'Boqueirão',
    address: 'Av. Brasil Oeste, 2884 - Boqueirão',
    lat: -28.2680,
    lng: -52.4298,
    openHours: 'Seg a Sáb: 08:00 às 20:30 • Dom: 08:00 às 13:00',
    highlightPromo: 'Açougue tradicional do Boqueirão com carnes frescas desossadas na hora',
    phone: '(54) 3313-1520',
    storeType: 'bairro',
    tagline: 'Mercado de bairro completo, perto de casa e com atendimento de balcão',
    specialties: ['Açougue de bairro', 'Pães quentes a toda hora', 'Hortifrúti selecionado'],
  },
  {
    id: 'coqueiros-sao-cristovao',
    name: 'Coqueiros Supermercados',
    chain: 'Coqueiros',
    neighborhood: 'São Cristóvão',
    address: 'Av. Presidente Vargas, 1905 - São Cristóvão',
    lat: -28.2740,
    lng: -52.3965,
    openHours: 'Seg a Sáb: 08:00 às 20:30 • Dom: 08:00 às 13:00',
    highlightPromo: 'Feirão de quarta, linguiças artesanais e hortifrúti fresco para a região',
    phone: '(54) 3313-7500',
    storeType: 'bairro',
    tagline: 'Supermercado tradicional do São Cristóvão com preços populares',
    specialties: ['Quarta da feira', 'Embutidos regionais', 'Mercearia ágil'],
  },
  {
    id: 'mercado-vera-cruz',
    name: 'Mercado & Açougue Vera Cruz',
    chain: 'Mercado Vera Cruz',
    neighborhood: 'Vera Cruz',
    address: 'Rua Independência, 1140 - Vera Cruz',
    lat: -28.2720,
    lng: -52.4430,
    openHours: 'Seg a Sáb: 07:30 às 20:00 • Dom: 08:00 às 12:30',
    highlightPromo: 'Moída de primeira R$ 26,90/kg e coxas de frango frescas para o bairro',
    phone: '(54) 3311-2090',
    storeType: 'bairro',
    tagline: 'Mercado de vizinhança: economia a poucos passos de casa',
    specialties: ['Carnes frescas', 'Bebidas geladas sem taxa', 'Mantimentos essenciais'],
  },
  {
    id: 'mercado-sao-jose-petropolis',
    name: 'Mercado & Mercearia São José',
    chain: 'Mercado São José',
    neighborhood: 'Petrópolis',
    address: 'Rua Morom, 2890 - Petrópolis',
    lat: -28.2510,
    lng: -52.3880,
    openHours: 'Seg a Sáb: 08:00 às 20:00 • Dom: 08:00 às 12:00',
    highlightPromo: 'Promoção relâmpago de leite e queijo gaúcho na porta de casa',
    phone: '(54) 3314-4320',
    storeType: 'bairro',
    tagline: 'Mercado do bairro Petrópolis com comodidade total',
    specialties: ['Padaria do bairro', 'Laticínios coloniais', 'Cesta rápida'],
  },
  {
    id: 'super-dal-moro',
    name: 'Supermercado Dal Moro',
    chain: 'Super Dal Moro',
    neighborhood: 'Centro',
    address: 'Rua Fagundes dos Reis, 650 - Centro',
    lat: -28.2605,
    lng: -52.4060,
    openHours: 'Seg a Sáb: 08:00 às 20:30 • Dom: Fechado',
    highlightPromo: 'Mercado tradicional com frios fatiados na hora e hortifrúti diário',
    phone: '(54) 3312-8800',
    storeType: 'bairro',
    tagline: 'Mercado central para compras do dia a dia a pé',
    specialties: ['Frios frescos', 'Frutas e verduras diárias', 'Conveniência'],
  },
  {
    id: 'mercado-lucas-araujo',
    name: 'Mercado & Frios Lucas Araújo',
    chain: 'Mercado Lucas Araújo',
    neighborhood: 'Lucas Araújo',
    address: 'Rua Capitão Araújo, 412 - Lucas Araújo',
    lat: -28.2575,
    lng: -52.4210,
    openHours: 'Seg a Sáb: 08:00 às 20:00 • Dom: 08:30 às 12:30',
    highlightPromo: 'Ovos caipiras, queijo colonial e farinhas regionais em promoção',
    phone: '(54) 3315-6210',
    storeType: 'bairro',
    tagline: 'Minimercado de confiança no coração do Lucas Araújo',
    specialties: ['Produtos coloniais', 'Hortaliças frescas', 'Básico da casa'],
  },
  {
    id: 'mercado-popular-integracao',
    name: 'Mercado Popular Integração',
    chain: 'Mercado Integração',
    neighborhood: 'Integração',
    address: 'Rua São Lázaro, 420 - Integração',
    lat: -28.2410,
    lng: -52.4020,
    openHours: 'Seg a Sáb: 07:30 às 20:00 • Dom: 08:00 às 13:00',
    highlightPromo: 'Pacotão de arroz e feijão com desconto para moradores da zona norte',
    phone: '(54) 3318-1140',
    storeType: 'bairro',
    tagline: 'Mercado popular da zona norte de Passo Fundo',
    specialties: ['Preços comunitários', 'Cestas econômicas', 'Carnes diárias'],
  },

  // 3. MERCADOS COM GRANDES FILIAIS & REDES
  {
    id: 'zaffari-centro',
    name: 'Comercial Zaffari - Centro',
    chain: 'Zaffari',
    neighborhood: 'Centro',
    address: 'Rua General Netto, 443 - Centro',
    lat: -28.2615,
    lng: -52.4085,
    openHours: 'Seg a Sáb: 08:00 às 20:30 • Dom: Fechado',
    highlightPromo: 'Feira tradicional de frutas e legumes terça e quarta, conveniência no Centro',
    phone: '(54) 3316-3000',
    storeType: 'rede',
    tagline: 'Rede histórica de Passo Fundo com grande mix de marcas',
    specialties: ['Terça e Quarta da Feira', 'Padaria própria', 'Açougue inspecionado'],
  },
  {
    id: 'zaffari-vergueiro',
    name: 'Hiper Zaffari - Vergueiro',
    chain: 'Zaffari',
    neighborhood: 'Vergueiro',
    address: 'Rua Cel. Chicuta, 355 - Vergueiro',
    lat: -28.2635,
    lng: -52.4130,
    openHours: 'Seg a Sáb: 08:00 às 21:00 • Dom: 08:30 às 20:00',
    highlightPromo: 'Higiene e perfumaria, vinhos da Serra Gaúcha e padaria fina',
    phone: '(54) 3316-3200',
    storeType: 'rede',
    tagline: 'Hipermercado de rede no Vergueiro com estacionamento amplo',
    specialties: ['Importados e especiais', 'Higiene e cosméticos', 'Adega gaúcha'],
  },
  {
    id: 'bourbon-shopping',
    name: 'Bourbon Hipermercado Passo Fundo',
    chain: 'Bourbon',
    neighborhood: 'São Cristóvão',
    address: 'Passo Fundo Shopping - Av. Pres. Vargas, 1610',
    lat: -28.2725,
    lng: -52.3995,
    openHours: 'Seg a Sáb: 08:30 às 22:00 • Dom: 09:00 às 21:00',
    highlightPromo: 'Variedade premium, cortes especiais e promoções no Clube Zaffari Card',
    phone: '(54) 3601-5000',
    storeType: 'rede',
    tagline: 'Grande hipermercado no Passo Fundo Shopping com horário estendido',
    specialties: ['Cortes nobres', 'Gastronomia pronta', 'Clube de fidelidade'],
  },

  // 4. MERCADOS ÚNICOS INDEPENDENTES COM OFERTAS PONTUAIS ARRASADORAS
  {
    id: 'casa-carnes-central',
    name: 'Casa de Carnes & Mercado Central',
    chain: 'Mercado Central',
    neighborhood: 'Centro',
    address: 'Rua Morom, 1420 - Centro',
    lat: -28.2610,
    lng: -52.4110,
    openHours: 'Seg a Sáb: 07:30 às 19:30 • Dom: 08:00 às 12:30',
    highlightPromo: 'Sexta da Carne: Filé de frango a R$ 18,90/kg e coxão mole a R$ 34,90/kg',
    phone: '(54) 3311-9080',
    storeType: 'independente',
    tagline: 'Mercado único tradicional que cobre o preço de atacado nas carnes',
    specialties: ['Açougue de alta rotatividade', 'Temperos e churrasco', 'Ofertas relâmpago de sexta'],
  },
  {
    id: 'sacolao-economia-boqueirao',
    name: 'Sacolão & Mercearia da Economia',
    chain: 'Sacolão Economia',
    neighborhood: 'Boqueirão',
    address: 'Rua Uruguai, 890 - Boqueirão',
    lat: -28.2670,
    lng: -52.4280,
    openHours: 'Seg a Sáb: 08:00 às 19:45 • Dom: 08:00 às 12:00',
    highlightPromo: 'Quarta da Terra: Batata, cebola e tomate até 35% mais baratos que grandes redes',
    phone: '(54) 3317-5420',
    storeType: 'independente',
    tagline: 'Mercado único focado em hortifrúti barato direto dos produtores',
    specialties: ['Preço imbatível da quarta-feira', 'Ovos frescos da granja', 'Frutas por quilo'],
  },
  {
    id: 'emporio-sul-petropolis',
    name: 'Empório Sul & Mercado Gaúcho',
    chain: 'Empório Sul',
    neighborhood: 'Petrópolis',
    address: 'Av. Brasil Leste, 1540 - Petrópolis',
    lat: -28.2540,
    lng: -52.3850,
    openHours: 'Seg a Sáb: 08:00 às 20:00 • Dom: 08:30 às 12:30',
    highlightPromo: 'Erva-mate a preço de produtor e queijo mussarela colonial por R$ 36,90/kg',
    phone: '(54) 3313-9930',
    storeType: 'independente',
    tagline: 'Mercado regional único com ofertas pontuais e produtos gaúchos',
    specialties: ['Erva-mate e chimarrão', 'Queijos e embutidos coloniais', 'Cestas de café da manhã'],
  },
];

const CUSTOM_STORES_KEY = 'rancho_custom_stores_v1';

export function getCustomStoresFromStorage(): SupermarketStore[] {
  try {
    const raw = localStorage.getItem(CUSTOM_STORES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveCustomStoreToStorage(newStore: Omit<SupermarketStore, 'id' | 'isUserAdded'>): SupermarketStore {
  const current = getCustomStoresFromStorage();
  const storeWithId: SupermarketStore = {
    ...newStore,
    id: `custom-market-${Date.now()}`,
    isUserAdded: true,
  };
  const updated = [storeWithId, ...current];
  try {
    localStorage.setItem(CUSTOM_STORES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save custom store', e);
  }
  return storeWithId;
}

export function removeCustomStoreFromStorage(id: string): void {
  const current = getCustomStoresFromStorage();
  const updated = current.filter(s => s.id !== id);
  try {
    localStorage.setItem(CUSTOM_STORES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove custom store', e);
  }
}

export function getAllPassoFundoStores(): SupermarketStore[] {
  const custom = getCustomStoresFromStorage();
  return [...custom, ...PASSO_FUNDO_STORES];
}

/**
 * Fórmula de Haversine para calcular distância real em km
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Encontra o bairro de Passo Fundo mais próximo das coordenadas GPS fornecidas
 */
export function findNearestPassoFundoNeighborhood(
  lat: number,
  lng: number
): { neighborhood: PassoFundoNeighborhood; distanceKm: number } {
  let nearest = PASSO_FUNDO_NEIGHBORHOODS[0];
  let minDistance = Infinity;

  for (const n of PASSO_FUNDO_NEIGHBORHOODS) {
    const dist = calculateDistanceKm(lat, lng, n.lat, n.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = n;
    }
  }

  return {
    neighborhood: nearest.neighborhood,
    distanceKm: minDistance,
  };
}

/**
 * Reference cities for quick selection when user is anywhere in Brazil
 */
export interface KnownCityReference {
  name: string;
  state: string;
  lat: number;
  lng: number;
  isBaseMarket: boolean;
}

export const KNOWN_BRAZILIAN_CITIES: KnownCityReference[] = [
  { name: 'Passo Fundo', state: 'RS', lat: -28.2618, lng: -52.4080, isBaseMarket: true },
  { name: 'Marau', state: 'RS', lat: -28.4489, lng: -52.2001, isBaseMarket: false },
  { name: 'Erechim', state: 'RS', lat: -27.6341, lng: -52.2739, isBaseMarket: false },
  { name: 'Carazinho', state: 'RS', lat: -28.2839, lng: -52.7864, isBaseMarket: false },
  { name: 'Porto Alegre', state: 'RS', lat: -30.0346, lng: -51.2177, isBaseMarket: false },
  { name: 'Caxias do Sul', state: 'RS', lat: -29.1678, lng: -51.1794, isBaseMarket: false },
  { name: 'Chapecó', state: 'SC', lat: -27.1004, lng: -52.6152, isBaseMarket: false },
  { name: 'Curitiba', state: 'PR', lat: -25.4284, lng: -49.2733, isBaseMarket: false },
  { name: 'Florianópolis', state: 'SC', lat: -27.5954, lng: -48.5480, isBaseMarket: false },
  { name: 'São Paulo', state: 'SP', lat: -23.5505, lng: -46.6333, isBaseMarket: false },
];

/**
 * Detects whether GPS coordinates are in Passo Fundo or another location in Brazil/world
 */
export function detectLocationContext(lat: number, lng: number): {
  isPassoFundo: boolean;
  cityName: string;
  stateName: string;
  nearestCityName: string;
  distanceToPassoFundoKm: number;
  detectedNeighborhood?: PassoFundoNeighborhood;
} {
  const distToPF = calculateDistanceKm(lat, lng, -28.2618, -52.4080);
  const isPassoFundo = distToPF <= 30; // within 30km radius of PF

  // Find closest known city
  let closest = KNOWN_BRAZILIAN_CITIES[0];
  let minCityDist = Infinity;
  for (const city of KNOWN_BRAZILIAN_CITIES) {
    const d = calculateDistanceKm(lat, lng, city.lat, city.lng);
    if (d < minCityDist) {
      minCityDist = d;
      closest = city;
    }
  }

  let detectedNeighborhood: PassoFundoNeighborhood | undefined = undefined;
  if (isPassoFundo) {
    detectedNeighborhood = findNearestPassoFundoNeighborhood(lat, lng).neighborhood;
  }

  return {
    isPassoFundo,
    cityName: isPassoFundo ? 'Passo Fundo' : (minCityDist < 45 ? closest.name : 'Outra Região'),
    stateName: isPassoFundo ? 'RS' : closest.state,
    nearestCityName: closest.name,
    distanceToPassoFundoKm: distToPF,
    detectedNeighborhood,
  };
}

/**
 * Ordena os supermercados por distância em relação à localização informada
 */
export function getStoresSortedByDistance(
  userLat: number,
  userLng: number
): (SupermarketStore & { distanceKm: number; etaMinutes: number })[] {
  return PASSO_FUNDO_STORES.map((store) => {
    const dist = calculateDistanceKm(userLat, userLng, store.lat, store.lng);
    // Estimativa de tempo de carro na malha viária (~30 km/h)
    const etaMinutes = Math.max(2, Math.round((dist / 30) * 60));
    return {
      ...store,
      distanceKm: dist,
      etaMinutes,
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

export interface FuelTripEstimate {
  distanceKm: number;
  roundTripKm: number;
  fuelCost: number;
  fuelLiters: number;
  driveTimeMinutes: number;
  roundTripTimeMinutes: number;
  isSuperClose: boolean;
}

/**
 * Calcula custo de combustível e tempo de deslocamento ida e volta em Passo Fundo
 * Premissas: Gasolina média no RS R$ 6,29/L e consumo urbano de 10 km/L
 */
export function calculateFuelAndTrip(
  distanceKm: number,
  fuelPricePerLiter = 6.29,
  kmPerLiter = 10.0
): FuelTripEstimate {
  const roundTripKm = Number((distanceKm * 2).toFixed(2));
  const fuelLiters = Number((roundTripKm / kmPerLiter).toFixed(2));
  const fuelCost = Number((fuelLiters * fuelPricePerLiter).toFixed(2));
  const driveTimeMinutes = Math.max(2, Math.round((distanceKm / 30) * 60));
  const roundTripTimeMinutes = driveTimeMinutes * 2;
  const isSuperClose = distanceKm <= 2.5;

  return {
    distanceKm,
    roundTripKm,
    fuelCost,
    fuelLiters,
    driveTimeMinutes,
    roundTripTimeMinutes,
    isSuperClose,
  };
}

