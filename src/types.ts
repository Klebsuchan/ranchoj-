export type SupermarketName = 
  | 'Stock Center' 
  | 'Bourbon' 
  | 'Zaffari' 
  | 'Atacadão'
  | 'Supermercado Boqueirão'
  | 'Coqueiros'
  | 'Carrefour'
  | 'Assaí'
  | string;

export type PassoFundoNeighborhood = 
  | 'Boqueirão' 
  | 'Centro' 
  | 'Petrópolis' 
  | 'São Cristóvão' 
  | 'Vergueiro' 
  | 'Vera Cruz' 
  | 'Lucas Araújo' 
  | 'Integração';

export type StoreCategoryType = 'bairro' | 'rede' | 'atacarejo' | 'independente';

export interface SupermarketStore {
  id: string;
  name: string;
  chain: SupermarketName;
  neighborhood: PassoFundoNeighborhood | string;
  address: string;
  lat: number;
  lng: number;
  openHours: string;
  highlightPromo: string;
  phone?: string;
  distanceKm?: number;
  storeType?: StoreCategoryType; // 'bairro' (mercado de bairro), 'rede' (grandes filiais), 'atacarejo' (grandes atacados), 'independente' (mercado único com promoções)
  tagline?: string;
  specialties?: string[];
  isUserAdded?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  avatarUrl?: string;
  isConnectedWithGoogle: boolean;
  connectedAt?: string;
  city?: string;
  state?: string;
  neighborhood: PassoFundoNeighborhood | string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  locationMode: 'gps' | 'manual';
  locationUpdatedAt?: string;
  radiusKm: number;
  monthlyBudget?: number;
  familyMembers?: number;
  isLiveTracking?: boolean;
  liveAccuracyMeters?: number;
  liveSpeedKmh?: number | null;
  liveHeading?: number | null;
  lastTrackingTimestamp?: number;
  nearestMarketName?: SupermarketName;
  nearestMarketDistanceKm?: number;
}

export interface PriceAlert {
  itemId: string;
  itemName: string;
  targetPrice: number;
  currentLowestPrice: number;
  cheapestMarket?: SupermarketName;
  isTriggered: boolean;
  createdAt: string;
}

export type ProductCategory = 
  | 'cesta_basica' 
  | 'carnes_proteinas' 
  | 'hortifruti' 
  | 'laticinios_frios' 
  | 'limpeza_higiene' 
  | 'outros';

export interface SupermarketPrice {
  supermarket: SupermarketName;
  price: number;
  regularPrice?: number;
  unit?: string;
  isPromo: boolean;
  promoNote?: string;
  validUntil?: string;
}

export interface PromotionItem {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string;
  brand?: string;
  description?: string;
  prices: SupermarketPrice[];
  lowestPrice: number;
  cheapestMarket: SupermarketName;
  highestPrice: number;
  savingsAmount: number;
  savingsPercent: number;
  isEssential: boolean; // Item básico indispensável para quem mora sozinho/casal
  verifiedDate: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  unit: string;
  brand?: string;
  prices: Partial<Record<SupermarketName, number>>;
  selectedMarket: 'best' | SupermarketName;
  unitPrice: number;
  totalPrice: number;
  isEssential: boolean;
  priority: 'essencial' | 'importante' | 'superfluo';
  isBought: boolean;
}

export interface BudgetProfile {
  householdType: 'solo' | 'casal';
  familyMembers?: number;
  monthlyIncome: number;
  ranchoBudget: number;
  cycleDays: 15 | 30;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface PromotionsResponse {
  city: string;
  updatedAt: string;
  markets: string[];
  items: PromotionItem[];
  sources: GroundingSource[];
  isRealTime: boolean;
}

export interface BudgetAnalysis {
  status: 'dentro' | 'alerta' | 'estourado';
  ranchoBudget: number;
  totalCost: number;
  remainingBalance: number;
  percentageUsed: number;
  canBuyCount: number;
  cannotBuyCount: number;
  canBuyItems: { name: string; cost: number; reason: string }[];
  cannotBuyItems: { name: string; cost: number; reason: string; substitute?: string }[];
  recommendations: string[];
  projectedDays: number;
}

export interface RanchoHistoryEntry {
  id: string;
  monthYear: string; // Ex: "Set/2026", "Ago/2026"
  date: string;
  totalSpent: number;
  budgetLimit: number;
  itemCount: number;
  householdType: 'solo' | 'casal';
  stokCenterTotal?: number;
  bourbonTotal?: number;
  zaffariTotal?: number;
  atacadaoTotal?: number;
  savingsAchieved?: number;
  notes?: string;
}
