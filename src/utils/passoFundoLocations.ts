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
  },
  {
    id: 'super-boqueirao',
    name: 'Supermercado Boqueirão',
    chain: 'Supermercado Boqueirão',
    neighborhood: 'Boqueirão',
    address: 'Av. Brasil Oeste, 2884 - Boqueirão',
    lat: -28.2680,
    lng: -52.4298,
    openHours: 'Seg a Sáb: 08:00 às 20:30 • Dom: 08:00 às 13:00',
    highlightPromo: 'Açougue tradicional do Boqueirão com cortes frescos e padaria artesanal',
    phone: '(54) 3313-1520',
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
  },
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
  },
];

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

