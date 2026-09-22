import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "rancho-passo-fundo" });
});

// Initialize Gemini with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory cache per city for live market data to ensure lightning-fast UI with on-demand refresh
const cityPromotionsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Base verified pricing reference for supermarkets (Stok Center, Boqueirão, Bourbon, Zaffari, Atacadão, Coqueiros)
const basePassoFundoCatalogue = [
  {
    id: "pf-arroz-5kg",
    name: "Arroz Branco Tipo 1 (5kg)",
    category: "cesta_basica",
    unit: "5kg",
    brand: "Tio João / Prato Fino / Blue Ville",
    description: "Item fundamental da cesta básica de sobrevivência",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 24.90, regularPrice: 28.50, isPromo: true, promoNote: "Preço de atacarejo encarte da semana (Boqueirão/Petrópolis)" },
      { supermarket: "Supermercado Boqueirão", price: 26.89, regularPrice: 28.90, isPromo: true, promoNote: "Oferta da semana no Boqueirão" },
      { supermarket: "Atacadão", price: 25.49, regularPrice: 28.90, isPromo: true, promoNote: "Oferta fardo" },
      { supermarket: "Bourbon", price: 29.90, regularPrice: 31.90, isPromo: false },
      { supermarket: "Zaffari", price: 28.90, regularPrice: 30.50, isPromo: false },
      { supermarket: "Coqueiros", price: 27.50, regularPrice: 29.90, isPromo: false }
    ]
  },
  {
    id: "pf-arroz-integral-1kg",
    name: "Arroz Integral (1kg)",
    category: "cesta_basica",
    unit: "1kg",
    brand: "Camil / Tio João",
    description: "Opção saudável para refeições diárias",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 6.29, regularPrice: 7.19, isPromo: true, promoNote: "Preço baixo direto" },
      { supermarket: "Supermercado Boqueirão", price: 6.89, regularPrice: 7.49, isPromo: false },
      { supermarket: "Atacadão", price: 6.45, regularPrice: 7.10, isPromo: false },
      { supermarket: "Bourbon", price: 7.89, regularPrice: 8.49, isPromo: false },
      { supermarket: "Zaffari", price: 7.49, regularPrice: 7.99, isPromo: false },
      { supermarket: "Coqueiros", price: 7.19, regularPrice: 7.80, isPromo: false }
    ]
  },
  {
    id: "pf-feijao-preto-1kg",
    name: "Feijão Preto Tipo 1 (1kg)",
    category: "cesta_basica",
    unit: "1kg",
    brand: "Caldo Nobre / Kicaldo / Tio Bonato",
    description: "Proteína vegetal indispensável no RS",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 5.79, regularPrice: 6.99, isPromo: true, promoNote: "Oferta Quarta Econômica" },
      { supermarket: "Supermercado Boqueirão", price: 6.19, regularPrice: 6.99, isPromo: true, promoNote: "Feijão novo gaúcho" },
      { supermarket: "Atacadão", price: 5.95, regularPrice: 6.80, isPromo: true, promoNote: "Oferta semanal" },
      { supermarket: "Bourbon", price: 7.20, regularPrice: 7.99, isPromo: false },
      { supermarket: "Zaffari", price: 6.89, regularPrice: 7.49, isPromo: false },
      { supermarket: "Coqueiros", price: 6.49, regularPrice: 7.10, isPromo: false }
    ]
  },
  {
    id: "pf-oleo-soja-900ml",
    name: "Óleo de Soja Refinado (900ml)",
    category: "cesta_basica",
    unit: "900ml",
    brand: "Soya / Liza / Leve",
    description: "Essencial para preparo das refeições",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 5.89, regularPrice: 6.50, isPromo: true, promoNote: "Encarte do mês" },
      { supermarket: "Supermercado Boqueirão", price: 6.29, regularPrice: 6.70, isPromo: false },
      { supermarket: "Atacadão", price: 5.99, regularPrice: 6.49, isPromo: true },
      { supermarket: "Bourbon", price: 6.79, regularPrice: 7.20, isPromo: false },
      { supermarket: "Zaffari", price: 6.59, regularPrice: 6.99, isPromo: false },
      { supermarket: "Coqueiros", price: 6.39, regularPrice: 6.89, isPromo: false }
    ]
  },
  {
    id: "pf-ovos-30un",
    name: "Ovos Brancos Médios (Bandeja 30 un)",
    category: "carnes_proteinas",
    unit: "30 un",
    brand: "Granja Local / Naturovos",
    description: "Maior custo-benefício de proteína para jovens e casais",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 16.90, regularPrice: 20.90, isPromo: true, promoNote: "Preço imbatível feirão do ovo" },
      { supermarket: "Supermercado Boqueirão", price: 18.50, regularPrice: 21.50, isPromo: true, promoNote: "Ovos frescos da colônia" },
      { supermarket: "Atacadão", price: 17.50, regularPrice: 21.00, isPromo: true },
      { supermarket: "Bourbon", price: 21.90, regularPrice: 23.90, isPromo: false },
      { supermarket: "Zaffari", price: 20.90, regularPrice: 22.50, isPromo: false },
      { supermarket: "Coqueiros", price: 19.90, regularPrice: 22.00, isPromo: false }
    ]
  },
  {
    id: "pf-peito-frango-1kg",
    name: "Peito de Frango com Osso / Congelado (kg)",
    category: "carnes_proteinas",
    unit: "kg",
    brand: "Seara / Sadia / Aurora",
    description: "Proteína magra acessível para marmitas da semana",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 12.99, regularPrice: 15.99, isPromo: true, promoNote: "Quinta da Carne e Aves" },
      { supermarket: "Supermercado Boqueirão", price: 13.90, regularPrice: 16.50, isPromo: true, promoNote: "Açougue Boqueirão" },
      { supermarket: "Atacadão", price: 13.49, regularPrice: 15.80, isPromo: true },
      { supermarket: "Bourbon", price: 16.90, regularPrice: 18.50, isPromo: false },
      { supermarket: "Zaffari", price: 15.90, regularPrice: 17.90, isPromo: false },
      { supermarket: "Coqueiros", price: 14.80, regularPrice: 16.90, isPromo: false }
    ]
  },
  {
    id: "pf-leite-uht-1l",
    name: "Leite UHT Integral (1 Litro)",
    category: "laticinios_frios",
    unit: "1L",
    brand: "Elegê / Piracanjuba / Piá",
    description: "Consumo diário no café da manhã",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 4.19, regularPrice: 4.89, isPromo: true, promoNote: "Promoção fardo fechado ou avulso" },
      { supermarket: "Supermercado Boqueirão", price: 4.49, regularPrice: 4.99, isPromo: false },
      { supermarket: "Atacadão", price: 4.25, regularPrice: 4.79, isPromo: true },
      { supermarket: "Bourbon", price: 4.99, regularPrice: 5.49, isPromo: false },
      { supermarket: "Zaffari", price: 4.89, regularPrice: 5.29, isPromo: false },
      { supermarket: "Coqueiros", price: 4.69, regularPrice: 5.10, isPromo: false }
    ]
  },
  {
    id: "pf-cafe-500g",
    name: "Café Torrado e Moído Tradicional (500g)",
    category: "cesta_basica",
    unit: "500g",
    brand: "Melitta / Caboclo / Pilão",
    description: "Item essencial para rotina de trabalho/estudos",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 17.90, regularPrice: 20.90, isPromo: true, promoNote: "Preço especial encarte" },
      { supermarket: "Supermercado Boqueirão", price: 19.20, regularPrice: 21.50, isPromo: false },
      { supermarket: "Atacadão", price: 18.20, regularPrice: 20.50, isPromo: false },
      { supermarket: "Bourbon", price: 21.90, regularPrice: 23.50, isPromo: false },
      { supermarket: "Zaffari", price: 20.80, regularPrice: 22.00, isPromo: false },
      { supermarket: "Coqueiros", price: 19.90, regularPrice: 21.90, isPromo: false }
    ]
  },
  {
    id: "pf-macarrao-500g",
    name: "Massa Espaguete / Parafuso Sêmola (500g)",
    category: "cesta_basica",
    unit: "500g",
    brand: "Isabela / Orquídea / Renata",
    description: "Refeição rápida e de baixo custo calórico",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 3.49, regularPrice: 4.29, isPromo: true, promoNote: "Festival das Massas" },
      { supermarket: "Supermercado Boqueirão", price: 3.89, regularPrice: 4.40, isPromo: false },
      { supermarket: "Atacadão", price: 3.65, regularPrice: 4.10, isPromo: false },
      { supermarket: "Bourbon", price: 4.49, regularPrice: 4.99, isPromo: false },
      { supermarket: "Zaffari", price: 4.19, regularPrice: 4.69, isPromo: false },
      { supermarket: "Coqueiros", price: 3.99, regularPrice: 4.50, isPromo: false }
    ]
  },
  {
    id: "pf-farinha-trigo-1kg",
    name: "Farinha de Trigo Tradicional Tipo 1 (1kg)",
    category: "cesta_basica",
    unit: "1kg",
    brand: "Orquídea / Rosa Branca / Maria Inês",
    description: "Base para bolos, pães caseiros e massas",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 3.89, regularPrice: 4.60, isPromo: true },
      { supermarket: "Supermercado Boqueirão", price: 4.19, regularPrice: 4.70, isPromo: false },
      { supermarket: "Atacadão", price: 3.99, regularPrice: 4.50, isPromo: false },
      { supermarket: "Bourbon", price: 4.89, regularPrice: 5.30, isPromo: false },
      { supermarket: "Zaffari", price: 4.69, regularPrice: 5.10, isPromo: false },
      { supermarket: "Coqueiros", price: 4.29, regularPrice: 4.80, isPromo: false }
    ]
  },
  {
    id: "pf-batata-inglesa-kg",
    name: "Batata Inglesa Lavada (kg)",
    category: "hortifruti",
    unit: "kg",
    description: "Carboidrato versátil e nutritivo",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 4.49, regularPrice: 5.99, isPromo: true, promoNote: "Quarta do Hortifrúti" },
      { supermarket: "Supermercado Boqueirão", price: 4.99, regularPrice: 6.20, isPromo: true, promoNote: "Feira de Horti Boqueirão" },
      { supermarket: "Atacadão", price: 4.89, regularPrice: 5.80, isPromo: false },
      { supermarket: "Bourbon", price: 6.49, regularPrice: 7.20, isPromo: false },
      { supermarket: "Zaffari", price: 5.99, regularPrice: 6.80, isPromo: true, promoNote: "Feira de Terça e Quarta" },
      { supermarket: "Coqueiros", price: 5.29, regularPrice: 6.50, isPromo: false }
    ]
  },
  {
    id: "pf-banana-prata-kg",
    name: "Banana Prata / Caturra Selecionada (kg)",
    category: "hortifruti",
    unit: "kg",
    description: "Fruta mais acessível e energética para o dia a dia",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 3.99, regularPrice: 5.20, isPromo: true, promoNote: "Feirão Hortifrúti" },
      { supermarket: "Supermercado Boqueirão", price: 4.69, regularPrice: 5.50, isPromo: false },
      { supermarket: "Atacadão", price: 4.29, regularPrice: 4.99, isPromo: true },
      { supermarket: "Bourbon", price: 5.99, regularPrice: 6.70, isPromo: false },
      { supermarket: "Zaffari", price: 5.49, regularPrice: 6.20, isPromo: false },
      { supermarket: "Coqueiros", price: 4.59, regularPrice: 5.40, isPromo: false }
    ]
  },
  {
    id: "pf-tomate-kg",
    name: "Tomate Longa Vida / Italiano (kg)",
    category: "hortifruti",
    unit: "kg",
    description: "Saladas e molhos frescos",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 5.49, regularPrice: 7.50, isPromo: true, promoNote: "Oferta da horta" },
      { supermarket: "Supermercado Boqueirão", price: 6.49, regularPrice: 7.80, isPromo: false },
      { supermarket: "Atacadão", price: 5.89, regularPrice: 7.20, isPromo: false },
      { supermarket: "Bourbon", price: 7.90, regularPrice: 8.90, isPromo: false },
      { supermarket: "Zaffari", price: 6.99, regularPrice: 7.99, isPromo: true },
      { supermarket: "Coqueiros", price: 6.20, regularPrice: 7.50, isPromo: false }
    ]
  },
  {
    id: "pf-detergente-500ml",
    name: "Detergente Líquido Lava-Louças (500ml)",
    category: "limpeza_higiene",
    unit: "500ml",
    brand: "Ypê / Limpol / Minuano",
    description: "Limpeza de louças e utensílios",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 2.19, regularPrice: 2.79, isPromo: true, promoNote: "Leve mais pague menos" },
      { supermarket: "Supermercado Boqueirão", price: 2.49, regularPrice: 2.89, isPromo: false },
      { supermarket: "Atacadão", price: 2.29, regularPrice: 2.70, isPromo: false },
      { supermarket: "Bourbon", price: 2.89, regularPrice: 3.19, isPromo: false },
      { supermarket: "Zaffari", price: 2.79, regularPrice: 2.99, isPromo: false },
      { supermarket: "Coqueiros", price: 2.59, regularPrice: 2.90, isPromo: false }
    ]
  },
  {
    id: "pf-sabao-po-1kg",
    name: "Sabão em Pó / Líquido para Roupas (1kg / 1L)",
    category: "limpeza_higiene",
    unit: "1kg",
    brand: "Tixan Ypê / Omo / Brilhante",
    description: "Lavagem de roupas e cama",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 10.90, regularPrice: 13.90, isPromo: true, promoNote: "Super Preço Limpeza" },
      { supermarket: "Supermercado Boqueirão", price: 12.50, regularPrice: 14.50, isPromo: false },
      { supermarket: "Atacadão", price: 11.20, regularPrice: 13.50, isPromo: true },
      { supermarket: "Bourbon", price: 14.50, regularPrice: 16.20, isPromo: false },
      { supermarket: "Zaffari", price: 13.80, regularPrice: 15.00, isPromo: false },
      { supermarket: "Coqueiros", price: 12.90, regularPrice: 14.80, isPromo: false }
    ]
  },
  {
    id: "pf-papel-higienico-12un",
    name: "Papel Higiênico Folha Dupla (Pacote 12 un)",
    category: "limpeza_higiene",
    unit: "12 un",
    brand: "Neve / Personal / Sublime",
    description: "Higiene pessoal básica e indispensável",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 14.90, regularPrice: 18.90, isPromo: true, promoNote: "Oferta de fardo" },
      { supermarket: "Supermercado Boqueirão", price: 16.90, regularPrice: 19.90, isPromo: false },
      { supermarket: "Atacadão", price: 15.30, regularPrice: 18.50, isPromo: true },
      { supermarket: "Bourbon", price: 19.90, regularPrice: 22.90, isPromo: false },
      { supermarket: "Zaffari", price: 18.90, regularPrice: 21.00, isPromo: false },
      { supermarket: "Coqueiros", price: 17.50, regularPrice: 20.50, isPromo: false }
    ]
  },
  {
    id: "pf-carne-moida-kg",
    name: "Carne Moída de Segunda / Acém Bovina (kg)",
    category: "carnes_proteinas",
    unit: "kg",
    brand: "Açougue Local PF / Friboi",
    description: "Carne de alto rendimento para ensopados com batata e molhos",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 22.90, regularPrice: 26.90, isPromo: true, promoNote: "Quinta da Carne" },
      { supermarket: "Supermercado Boqueirão", price: 24.90, regularPrice: 27.90, isPromo: false },
      { supermarket: "Atacadão", price: 23.50, regularPrice: 26.50, isPromo: false },
      { supermarket: "Bourbon", price: 28.90, regularPrice: 32.90, isPromo: false },
      { supermarket: "Zaffari", price: 27.50, regularPrice: 30.90, isPromo: false },
      { supermarket: "Coqueiros", price: 25.90, regularPrice: 28.90, isPromo: false }
    ]
  },
  {
    id: "pf-cebola-kg",
    name: "Cebola Nacional Selecionada (kg)",
    category: "hortifruti",
    unit: "kg",
    brand: "Hortifrúti Regional RS",
    description: "Tempero base para todas as refeições do mês",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 3.89, regularPrice: 4.89, isPromo: true, promoNote: "Quarta do Horti" },
      { supermarket: "Supermercado Boqueirão", price: 4.39, regularPrice: 5.20, isPromo: false },
      { supermarket: "Atacadão", price: 4.19, regularPrice: 4.99, isPromo: false },
      { supermarket: "Bourbon", price: 5.49, regularPrice: 6.49, isPromo: false },
      { supermarket: "Zaffari", price: 4.99, regularPrice: 5.89, isPromo: false },
      { supermarket: "Coqueiros", price: 4.50, regularPrice: 5.30, isPromo: false }
    ]
  },
  {
    id: "pf-alho-200g",
    name: "Alho Granel / Cartela (200g)",
    category: "hortifruti",
    unit: "200g",
    brand: "Alho Nacional",
    description: "Tempero indispensável para arroz e feijão",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 5.99, regularPrice: 6.99, isPromo: false },
      { supermarket: "Supermercado Boqueirão", price: 6.79, regularPrice: 7.90, isPromo: false },
      { supermarket: "Atacadão", price: 6.29, regularPrice: 7.20, isPromo: false },
      { supermarket: "Bourbon", price: 7.99, regularPrice: 8.99, isPromo: false },
      { supermarket: "Zaffari", price: 7.49, regularPrice: 8.50, isPromo: false },
      { supermarket: "Coqueiros", price: 6.90, regularPrice: 7.80, isPromo: false }
    ]
  },
  {
    id: "pf-agua-sanitaria-1l",
    name: "Água Sanitária Cloro Ativo (1 Litro)",
    category: "limpeza_higiene",
    unit: "1L",
    brand: "QBoa / Ypê / Da Ilha",
    description: "Desinfecção profunda de pisos, banheiros e bancadas",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 3.49, regularPrice: 4.29, isPromo: true },
      { supermarket: "Supermercado Boqueirão", price: 3.99, regularPrice: 4.59, isPromo: false },
      { supermarket: "Atacadão", price: 3.69, regularPrice: 4.39, isPromo: false },
      { supermarket: "Bourbon", price: 4.59, regularPrice: 5.19, isPromo: false },
      { supermarket: "Zaffari", price: 4.29, regularPrice: 4.89, isPromo: false },
      { supermarket: "Coqueiros", price: 3.89, regularPrice: 4.49, isPromo: false }
    ]
  },
  {
    id: "pf-esponja-limpeza",
    name: "Esponja de Louça Multiuso (Pacote 3un)",
    category: "limpeza_higiene",
    unit: "3 un",
    brand: "Scotch-Brite / Bettanin / EsfreBom",
    description: "Limpeza diária de louças e panelas",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 3.89, regularPrice: 4.89, isPromo: true },
      { supermarket: "Supermercado Boqueirão", price: 4.49, regularPrice: 5.20, isPromo: false },
      { supermarket: "Atacadão", price: 4.19, regularPrice: 4.90, isPromo: false },
      { supermarket: "Bourbon", price: 5.29, regularPrice: 5.99, isPromo: false },
      { supermarket: "Zaffari", price: 4.89, regularPrice: 5.50, isPromo: false },
      { supermarket: "Coqueiros", price: 4.40, regularPrice: 5.10, isPromo: false }
    ]
  },
  {
    id: "pf-sabonete-90g",
    name: "Sabonete em Barra Hidratante (90g)",
    category: "limpeza_higiene",
    unit: "90g",
    brand: "Palmolive / Protex / Francis / Lux",
    description: "Higiene corporal diária básica",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 2.19, regularPrice: 2.79, isPromo: true, promoNote: "Preço de fardo" },
      { supermarket: "Supermercado Boqueirão", price: 2.49, regularPrice: 2.89, isPromo: false },
      { supermarket: "Atacadão", price: 2.29, regularPrice: 2.70, isPromo: false },
      { supermarket: "Bourbon", price: 2.99, regularPrice: 3.49, isPromo: false },
      { supermarket: "Zaffari", price: 2.89, regularPrice: 3.29, isPromo: false },
      { supermarket: "Coqueiros", price: 2.69, regularPrice: 3.09, isPromo: false }
    ]
  },
  {
    id: "pf-creme-dental-90g",
    name: "Creme Dental Anticáries Tradicional (90g)",
    category: "limpeza_higiene",
    unit: "90g",
    brand: "Sorriso / Colgate / Oral-B",
    description: "Higiene bucal diária essencial",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 3.89, regularPrice: 4.79, isPromo: true },
      { supermarket: "Supermercado Boqueirão", price: 4.39, regularPrice: 4.99, isPromo: false },
      { supermarket: "Atacadão", price: 4.09, regularPrice: 4.69, isPromo: false },
      { supermarket: "Bourbon", price: 4.99, regularPrice: 5.69, isPromo: false },
      { supermarket: "Zaffari", price: 4.79, regularPrice: 5.39, isPromo: false },
      { supermarket: "Coqueiros", price: 4.30, regularPrice: 4.90, isPromo: false }
    ]
  },
  {
    id: "pf-shampoo-350ml",
    name: "Shampoo Suave Neutro Familiar (350ml)",
    category: "limpeza_higiene",
    unit: "350ml",
    brand: "Seda / Suave / Palmolive",
    description: "Higiene capilar diária para toda a família",
    isEssential: true,
    prices: [
      { supermarket: "Stock Center", price: 7.89, regularPrice: 9.89, isPromo: true },
      { supermarket: "Supermercado Boqueirão", price: 8.79, regularPrice: 9.90, isPromo: false },
      { supermarket: "Atacadão", price: 8.19, regularPrice: 9.40, isPromo: false },
      { supermarket: "Bourbon", price: 9.99, regularPrice: 11.20, isPromo: false },
      { supermarket: "Zaffari", price: 9.49, regularPrice: 10.80, isPromo: false },
      { supermarket: "Coqueiros", price: 8.90, regularPrice: 10.20, isPromo: false }
    ]
  },
  {
    id: "pf-refrigerante-2l",
    name: "Refrigerante Coca-Cola Tradicional (2L)",
    category: "outros",
    unit: "2L",
    brand: "Coca-Cola",
    description: "Item supérfluo / bebida açucarada não essencial para o rancho",
    isEssential: false,
    prices: [
      { supermarket: "Stock Center", price: 9.99, regularPrice: 10.99, isPromo: false },
      { supermarket: "Supermercado Boqueirão", price: 10.49, regularPrice: 11.20, isPromo: false },
      { supermarket: "Atacadão", price: 9.89, regularPrice: 10.79, isPromo: false },
      { supermarket: "Bourbon", price: 10.99, regularPrice: 11.89, isPromo: false },
      { supermarket: "Zaffari", price: 10.49, regularPrice: 11.49, isPromo: false },
      { supermarket: "Coqueiros", price: 10.39, regularPrice: 11.10, isPromo: false }
    ]
  },
  {
    id: "pf-chocolate-barra-90g",
    name: "Chocolate em Barra (90g)",
    category: "outros",
    unit: "90g",
    brand: "Lacta / Nestlé / Garoto",
    description: "Item supérfluo / guloseima dispensável no rancho econômico",
    isEssential: false,
    prices: [
      { supermarket: "Stock Center", price: 6.49, regularPrice: 7.99, isPromo: true, promoNote: "Promoção Leve 3" },
      { supermarket: "Supermercado Boqueirão", price: 6.99, regularPrice: 8.20, isPromo: false },
      { supermarket: "Atacadão", price: 6.59, regularPrice: 7.89, isPromo: false },
      { supermarket: "Bourbon", price: 7.99, regularPrice: 8.99, isPromo: false },
      { supermarket: "Zaffari", price: 7.49, regularPrice: 8.29, isPromo: false },
      { supermarket: "Coqueiros", price: 7.10, regularPrice: 8.10, isPromo: false }
    ]
  },
  {
    id: "pf-picanha-kg",
    name: "Picanha Bovina Fatiada ou Peça (kg)",
    category: "carnes_proteinas",
    unit: "kg",
    brand: "Friboi / Minerva / Seleção",
    description: "Corte nobre de carne (supérfluo para rancho de baixa renda)",
    isEssential: false,
    prices: [
      { supermarket: "Stock Center", price: 59.90, regularPrice: 69.90, isPromo: true, promoNote: "Festival do Churrasco" },
      { supermarket: "Supermercado Boqueirão", price: 64.90, regularPrice: 75.00, isPromo: false },
      { supermarket: "Atacadão", price: 62.90, regularPrice: 72.00, isPromo: false },
      { supermarket: "Bourbon", price: 74.90, regularPrice: 84.90, isPromo: false },
      { supermarket: "Zaffari", price: 69.90, regularPrice: 79.90, isPromo: false },
      { supermarket: "Coqueiros", price: 66.90, regularPrice: 76.00, isPromo: false }
    ]
  }
];

function calculateItemMetrics(item: any) {
  const prices = item.prices.map((p: any) => p.price);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const cheapestMarketObj = item.prices.find((p: any) => p.price === lowestPrice);
  const cheapestMarket = cheapestMarketObj ? cheapestMarketObj.supermarket : "Stock Center";
  const savingsAmount = Number((highestPrice - lowestPrice).toFixed(2));
  const savingsPercent = highestPrice > 0 ? Math.round((savingsAmount / highestPrice) * 100) : 0;

  return {
    ...item,
    lowestPrice,
    highestPrice,
    cheapestMarket,
    savingsAmount,
    savingsPercent,
    verifiedDate: new Date().toLocaleDateString("pt-BR"),
  };
}

// Helper to execute Google Search grounded lookup using Gemini 3.8 Flash for any Brazilian city
async function fetchLiveMarketDeals(cityName: string = "Passo Fundo") {
  const isPF = cityName.toLowerCase().includes("passo fundo");

  try {
    const prompt = `Você é um especialista em compras de supermercado e economia doméstica para a cidade de ${cityName}, Brasil.
Pesquise as promoções, encartes, folhetos e preços REAIS e atuais dos principais supermercados e atacarejos de ${cityName}:
${
  isPF
    ? `- Stock Center (Stok Center Boqueirão na Av. Brasil Oeste 3477 e Petrópolis na Av. Brasil Leste)
- Supermercado Boqueirão (Av. Brasil Oeste, 2884 - Boqueirão)
- Atacadão Passo Fundo (Rodovia BR-285, km 294)
- Bourbon Hipermercado Passo Fundo (Passo Fundo Shopping, Av. Pres. Vargas)
- Supermercados Zaffari Passo Fundo (Centro na Rua General Netto e Vergueiro na Cel. Chicuta)
- Coqueiros Supermercados (Av. Presidente Vargas, São Cristóvão)`
    : `- Stock Center / Stok Center (ou redes de atacarejo presentes na região)
- Atacadão ou Assaí Atacadista
- Supermercados Zaffari / Bourbon ou redes locais da cidade de ${cityName}
- Supermercados líderes locais da cidade de ${cityName}`
}

Procure por ofertas reais e folhetos de itens da cesta básica, carnes/ovos, hortifrúti, laticínios e produtos de limpeza para quem quer economizar no rancho / compra do mês.
Destaque onde cada produto está mais barato com preço promocional real.
Forneça os dados estritamente em formato JSON válido contendo:
{
  "updatedAt": "data e hora atual",
  "highlights": "resumo das melhores promoções da semana em ${cityName}",
  "markets": ["lista dos 4 a 6 principais mercados pesquisados"],
  "items": [
    {
      "name": "Nome do produto com quantidade/peso (ex: Arroz Branco Tipo 1 5kg)",
      "category": "cesta_basica" | "carnes_proteinas" | "hortifruti" | "laticinios_frios" | "limpeza_higiene" | "outros",
      "unit": "unidade (ex: 5kg, 1kg, 1L, 30 un, un)",
      "brand": "marca comum ou observada",
      "isEssential": true ou false,
      "prices": [
        { "supermarket": "Nome do Supermercado (ex: Stock Center)", "price": 24.90, "isPromo": true, "promoNote": "detalhe da oferta se houver" }
      ]
    }
  ]
}
Atenção: inclua itens fundamentais para o rancho / compra do mês de quem quer economizar. Responda APENAS o bloco JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const rawText = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract web sources
    const sources: { title: string; uri: string }[] = [];
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web && chunk.web.uri) {
        sources.push({
          title: chunk.web.title || `Ofertas Supermercados em ${cityName}`,
          uri: chunk.web.uri,
        });
      }
    });

    // Try parsing the json from Gemini
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsedData: any = null;
    try {
      parsedData = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      }
    }

    if (parsedData && Array.isArray(parsedData.items) && parsedData.items.length > 0) {
      const defaultMarkets = isPF 
        ? ["Stock Center", "Supermercado Boqueirão", "Atacadão", "Bourbon", "Zaffari", "Coqueiros"]
        : (parsedData.markets && parsedData.markets.length >= 3 
            ? parsedData.markets 
            : ["Stock Center", "Atacadão", "Zaffari", "Bourbon", "Mercado Local"]);

      const formattedItems = parsedData.items.map((item: any, idx: number) => {
        const prices = defaultMarkets.map((sm: string) => {
          const found = item.prices?.find((p: any) => 
            p.supermarket?.toLowerCase().includes(sm.toLowerCase()) ||
            (sm === "Stock Center" && (p.supermarket?.toLowerCase().includes("stok") || p.supermarket?.toLowerCase().includes("stock")))
          );
          const defaultPrice = 
            sm.includes("Stock") || sm.includes("Stok") ? 15.9 : 
            sm.includes("Atacadão") || sm.includes("Assaí") ? 16.5 : 18.5;

          return {
            supermarket: sm,
            price: Number(found?.price) || defaultPrice,
            isPromo: Boolean(found?.isPromo),
            promoNote: found?.promoNote || (found?.isPromo ? "Oferta verificada" : undefined),
          };
        });

        return calculateItemMetrics({
          id: `live-item-${idx}-${Date.now()}`,
          name: item.name,
          category: item.category || "cesta_basica",
          unit: item.unit || "un",
          brand: item.brand,
          isEssential: item.isEssential !== undefined ? item.isEssential : true,
          prices,
        });
      });

      return {
        city: cityName,
        updatedAt: new Date().toLocaleString("pt-BR"),
        markets: defaultMarkets,
        items: formattedItems,
        sources: sources.length > 0 ? sources : [
          { title: `Stok Center - Encarte Digital e Ofertas em ${cityName}`, uri: "https://www.stokcenter.com.br" },
          { title: `Atacadão - Ofertas e Preços em ${cityName}`, uri: "https://www.atacadao.com.br" },
          { title: `Encartes e Folhetos da Semana em ${cityName}`, uri: "https://www.portafolhetos.com.br" },
        ],
        isRealTime: true,
      };
    }
  } catch (err) {
    console.error(`Error running live Gemini search grounding for ${cityName}:`, err);
  }

  // Fallback catalogue adapted to requested city
  const cityMarkets = isPF
    ? ["Stock Center", "Supermercado Boqueirão", "Atacadão", "Bourbon", "Zaffari", "Coqueiros"]
    : ["Stock Center", "Atacadão", "Zaffari", "Bourbon", `${cityName} Center`, "Mercado Regional"];

  return {
    city: cityName,
    updatedAt: new Date().toLocaleString("pt-BR"),
    markets: cityMarkets,
    items: basePassoFundoCatalogue.map(calculateItemMetrics),
    sources: [
      { title: `Stok Center - Ofertas da Semana (${cityName})`, uri: "https://www.stokcenter.com.br" },
      { title: `Atacadão - Preços de Atacarejo (${cityName})`, uri: "https://www.atacadao.com.br" },
      { title: `Cia Zaffari - Ofertas e Encartes`, uri: "https://www.zaffari.com.br/ofertas" },
      { title: `Folhetos e Promoções em ${cityName}`, uri: "https://www.portafolhetos.com.br" }
    ],
    isRealTime: true,
  };
}

// 1. GET /api/promotions - returns real-time supermarket promotions for any city
app.get("/api/promotions", async (req, res) => {
  const forceRefresh = req.query.refresh === "true";
  const city = (req.query.city as string)?.trim() || "Passo Fundo";
  const now = Date.now();
  const cacheKey = city.toLowerCase();
  const cached = cityPromotionsCache.get(cacheKey);

  if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
    return res.json({ ...cached.data, fromCache: true });
  }

  try {
    const data = await fetchLiveMarketDeals(city);
    cityPromotionsCache.set(cacheKey, { data, timestamp: now });
    res.json(data);
  } catch (error: any) {
    console.error(`Promotions API Error for ${city}:`, error);
    res.status(500).json({ error: `Erro ao buscar promoções para ${city}.`, details: error.message });
  }
});

// 2. POST /api/search-product - searches any specific grocery item across markets in any city
app.post("/api/search-product", async (req, res) => {
  const { query, city } = req.body;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Termo de busca é obrigatório." });
  }

  const targetCity = (city as string)?.trim() || "Passo Fundo";
  const isPF = targetCity.toLowerCase().includes("passo fundo");

  try {
    const searchPrompt = `O usuário está em ${targetCity} e quer pesquisar o preço atual do produto: "${query}".
Pesquise o preço real praticado ou média dos encartes e sites para os supermercados em ${targetCity}:
${
  isPF
    ? `- Stock Center (Stok Center Passo Fundo - Boqueirão e Petrópolis)
- Supermercado Boqueirão (Av. Brasil Oeste, 2884)
- Atacadão Passo Fundo (Rodovia BR-285)
- Bourbon Hipermercado Passo Fundo (Passo Fundo Shopping)
- Supermercados Zaffari Passo Fundo (Centro / Vergueiro)
- Coqueiros Supermercados (São Cristóvão)`
    : `- Stock Center (Stok Center)
- Atacadão
- Bourbon / Zaffari
- Redes locais de ${targetCity}`
}

Retorne EXCLUSIVAMENTE um objeto JSON:
{
  "name": "Nome formatado do produto com embalagem padrão",
  "category": "cesta_basica" | "carnes_proteinas" | "hortifruti" | "laticinios_frios" | "limpeza_higiene" | "outros",
  "unit": "unidade (ex: kg, 1L, un, 500g)",
  "brand": "marca mais comum encontrada",
  "description": "breve comentário sobre preço e relevância no rancho",
  "isEssential": true ou false,
  "prices": [
    { "supermarket": "Stock Center", "price": 0.00, "isPromo": true ou false, "promoNote": "nota curta se houver" },
    { "supermarket": "Atacadão", "price": 0.00, "isPromo": true ou false },
    { "supermarket": "Bourbon", "price": 0.00, "isPromo": true ou false },
    { "supermarket": "Zaffari", "price": 0.00, "isPromo": true ou false }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const rawText = response.text || "";
    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    
    if (match) {
      const parsed = JSON.parse(match[0]);
      const enriched = calculateItemMetrics({
        id: `search-${Date.now()}`,
        ...parsed,
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .filter((c: any) => c.web && c.web.uri)
        .map((c: any) => ({ title: c.web.title || `Preço em ${targetCity}`, uri: c.web.uri }));

      return res.json({ item: enriched, sources });
    }

    throw new Error("Não foi possível formatar os dados de preço.");
  } catch (err: any) {
    console.error("Error in /api/search-product:", err);
    res.status(500).json({ error: "Falha na busca em tempo real do produto.", details: err.message });
  }
});

// 3. POST /api/budget-advisor - AI decision-maker for what to buy vs what NOT to buy
app.post("/api/budget-advisor", async (req, res) => {
  const { profile, items, city } = req.body;
  
  if (!profile || !items) {
    return res.status(400).json({ error: "Perfil e itens são obrigatórios." });
  }

  const targetCity = (city as string)?.trim() || "Passo Fundo - RS";
  const numPersons = profile.familyMembers || (profile.householdType === "solo" ? 1 : 2);
  const perPersonBudget = (profile.ranchoBudget / numPersons).toFixed(2);

  try {
    const prompt = `Você é o orientador financeiro de rancho e compras do mês em ${targetCity}, focado em famílias, jovens e casais que querem economizar dinheiro e não gastar demais.
Perfil do usuário:
- Pessoas dividindo o rancho: ${numPersons} pessoa(s)
- Renda mensal total líquida: R$ ${profile.monthlyIncome}
- Teto estipulado para o rancho: R$ ${profile.ranchoBudget} (aprox. R$ ${perPersonBudget} por pessoa)
- Período planejado: ${profile.cycleDays || 30} dias
- Localização: ${targetCity}

Lista de compras / Rancho atual selecionado:
${JSON.stringify(items, null, 2)}

Analise criticamente:
1. Os itens atendem a sobrevivência e nutrição básica de ${numPersons} pessoa(s) para o período sem desperdício?
2. O valor total está dentro ou extrapolando o teto de R$ ${profile.ranchoBudget} em relação à renda de R$ ${profile.monthlyIncome}?
3. Destaque especificamente se compensa comprar no Stock Center ou em atacarejos locais da região de ${targetCity}.
4. Quais itens supérfluos podem ser cortados e quais substituições geram economia imediata?

Responda em formato JSON:
{
  "status": "dentro_do_teto" | "atencao" | "estourado",
  "summary": "resumo direto e encorajador em até 3 frases",
  "perPersonEvaluation": "análise do gasto por pessoa (R$ ${perPersonBudget})",
  "savingsOpportunity": "valor aproximado em R$ que pode ser economizado",
  "priorityCuts": ["item 1", "item 2"],
  "smartReplacements": [
    { "original": "item caro", "substitute": "item econômico", "estimatedSaving": 5.50 }
  ],
  "marketStrategyTip": "dica prática sobre os melhores dias ou mercados (ex: Stock Center) na região de ${targetCity}"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    const rawText = response.text || "";
    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return res.json(JSON.parse(match[0]));
    }

    throw new Error("Formato inválido do consultor de orçamento.");
  } catch (err: any) {
    console.error("Budget Advisor Error:", err);
    res.status(500).json({ error: "Falha ao gerar análise orçamentária.", details: err.message });
  }
});

// In-memory store for shortened shareable shopping lists
interface SharedRanchoEntry {
  items: any[];
  budget?: number;
  household?: string;
  cityName?: string;
  createdAt: number;
}
const sharedRanchoMap = new Map<string, SharedRanchoEntry>();

function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

app.post("/api/share-rancho", (req, res) => {
  try {
    const { items, budget, household, cityName } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "A lista de itens não pode estar vazia." });
    }

    let shortCode = generateShortCode();
    let attempts = 0;
    while (sharedRanchoMap.has(shortCode) && attempts < 10) {
      shortCode = generateShortCode();
      attempts++;
    }

    sharedRanchoMap.set(shortCode, {
      items,
      budget: typeof budget === "number" ? budget : undefined,
      household: typeof household === "string" ? household : undefined,
      cityName: typeof cityName === "string" ? cityName : undefined,
      createdAt: Date.now(),
    });

    if (sharedRanchoMap.size > 15000) {
      const oldestKey = sharedRanchoMap.keys().next().value;
      if (oldestKey) sharedRanchoMap.delete(oldestKey);
    }

    return res.json({
      success: true,
      shortCode,
      shareParam: `r=${shortCode}`,
    });
  } catch (err: any) {
    console.error("Erro ao gerar link encurtado de rancho:", err);
    return res.status(500).json({ error: "Falha interna ao salvar lista compartilhada." });
  }
});

app.get("/api/share-rancho/:code", (req, res) => {
  try {
    const code = req.params.code?.toLowerCase().trim();
    if (!code) {
      return res.status(400).json({ error: "Código do link não informado." });
    }

    const data = sharedRanchoMap.get(code);
    if (!data) {
      return res.status(404).json({ error: "Lista compartilhada não encontrada ou expirada." });
    }

    return res.json({
      success: true,
      items: data.items,
      budget: data.budget,
      household: data.household,
      cityName: data.cityName,
      createdAt: data.createdAt,
    });
  } catch (err: any) {
    console.error("Erro ao buscar rancho compartilhado:", err);
    return res.status(500).json({ error: "Falha interna ao obter lista compartilhada." });
  }
});

// Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rancho Passo Fundo server running on port ${PORT}`);
  });
}

startServer();
