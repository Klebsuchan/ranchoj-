# 🛒 RanchoJá — Gestor Inteligente de Rancho & Comparador de Supermercados

> **O aplicativo definitivo para planejar, comparar e economizar nas compras do mês.**  
> Criado e otimizado para os consumidores de **Passo Fundo - RS**, com fluxo em 4 etapas guiadas, busca inteligente por IA, comparador multi-mercados e compartilhamento instantâneo.

🌐 **URL Oficial do Projeto:** [https://ranchoja.app](https://ranchoja.app)  
🏷️ **Identificador de URL:** `ranchoja.app` (e `ranchoja.com.br`)

---

## 🎯 Por que o RanchoJá nasceu?

Fazer o "rancho" (as compras mensais de supermercado) é um dos maiores desafios do orçamento doméstico das famílias brasileiras. Os preços variam drasticamente de um mercado para outro — produtos de limpeza podem ser 30% mais baratos no atacarejo, enquanto hortifrúti pode estar em oferta no mercado de bairro.

Sem planejamento, o consumidor:
1. **Perde o controle do teto de gastos**, estourando o orçamento no caixa do supermercado;
2. **Não sabe em qual mercado a sua cesta específica fica mais barata**;
3. **Não tem como dividir ou enviar a lista de compras com o cônjuge ou família** de forma prática.

O **RanchoJá** resolve esses problemas através de uma experiência mobile-first limpa, rápida e 100% focada na economia real.

---

## 📱 O Novo Fluxo Mobile em 4 Etapas (Passo a Passo)

O aplicativo foi desenhado para ser utilizado diretamente na tela do celular, dispensando telas poluídas e conduzindo o usuário em uma jornada lógica e intuitiva:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   ETAPA 1    │ ──> │   ETAPA 2    │ ──> │   ETAPA 3    │ ──> │   ETAPA 4    │
│ Teto & Renda │     │   Ofertas    │     │  Comparador  │     │  No Mercado  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### 1️⃣ Etapa 1: Orçamento (Teto do Rancho)
- **Definição Inteligente:** Configure a sua renda familiar mensal e composição da casa (morando sozinho, casal, filhos).
- **Cálculo da Parcela de Alimentação:** O sistema calcula a faixa ideal de gastos (geralmente entre 15% e 25% da renda) para você nunca se endividar.
- **Consultor Orçamentário com IA:** Avalie se o valor pretendido está realista para os custos médios de Passo Fundo.

### 2️⃣ Etapa 2: Ofertas & Catálogo de Produtos
- **🔥 Card "Sugestão do Dia":** Algoritmo que cruza o histórico de compras com os encartes vigentes, destacando o produto com maior índice de economia em Passo Fundo e comparando o preço promocional atual com a média do mês anterior.
- **Encartes Atualizados:** Veja as promoções vigentes dos principais supermercados e atacarejos da região (Stock Center, Atacadão, Boqueirão, Zaffari, Bourbon, Coqueiros, etc.).
- **Busca em Tempo Real com IA:** Pesquise qualquer produto. O sistema busca preços e marcas equivalentes.
- **Substitutos Mais Econômicos:** Sugestões automáticas de marcas alternativas de boa qualidade quando um item estiver muito caro.
- **Cabeçalho Compacto:** Uma barra fina que exibe a todo instante o valor acumulado e quanto resta até atingir o seu teto.

### 3️⃣ Etapa 3: Comparador de Mercados
- **Cálculo da Cesta Completa:** Com base em todos os itens adicionados, o app calcula quanto a sua compra total custará em cada supermercado.
- **Mercado Vencedor:** Destaque visual do estabelecimento onde o seu rancho fica mais barato.
- **Geolocalização & GPS:** Mostra a distância até o mercado vencedor a partir do seu bairro (Centro, Boqueirão, Petrópolis, Vera Cruz, São Cristóvão, Lucas Araújo, etc.) com rota no mapa interativo.

### 4️⃣ Etapa 4: No Mercado & Carrinho Físico
- **Checklist na Gôndola:** Marque os produtos com um toque conforme os coloca no carrinho físico.
- **Total em Tempo Real:** Saiba exatamente quanto vai pagar antes de chegar ao caixa.
- **Compartilhamento de Rancho:** Gere um link encurtado para mandar no WhatsApp do seu parceiro(a) abrir no celular dele(a) com a lista pronta!
- **Registro no Histórico:** Finalize a compra para alimentar os gráficos de evolução mensal.

---

## ⚡ Principais Funcionalidades

### 🔗 Compartilhamento Instantâneo de Lista (Link Encurtado)
- **Código Único:** Cria links compactos como `https://ranchoja.app/?r=A9K2X` salvos de forma segura no Firestore.
- **Fallback Base64 Offline:** Se o dispositivo estiver sem internet no momento da criação, gera um payload codificado na própria URL (`?share_rancho=...`) garantindo que o link funcione sempre.
- **Texto Formatado para WhatsApp:** Opção de copiar a lista em formato legível com emojis, categorias, preços e cálculo de economia.
- **Importação Segura:** Ao abrir o link em outro navegador ou celular, o destinatário pode optar por mesclar com a lista dele ou substituir, sem risco de sobrescrever dados acidentalmente.

### 🗺️ Mapeamento de Mercados em Passo Fundo
- Mapa interativo integrado com Leaflet mostrando a localização dos supermercados e hipermercados:
  - *Stock Center* (Petrópolis e Presidente Vargas)
  - *Atacadão Passo Fundo*
  - *Comercial Zaffari / Bourbon*
  - *Supermercado Boqueirão*
  - *Supermercados Coqueiros*
- Seleção de bairro do usuário para calcular a distância e priorizar as ofertas mais convenientes.

### 📊 Histórico de Compras e Gráficos de Evolução
- Gráfico interativo com a evolução dos gastos mês a mês.
- Comparação visual entre o gasto real e o teto orçamentário estipulado.
- Métricas de economia média acumulada no ano.

### 🔐 Autenticação Google & Sincronização em Nuvem
- Login opcional via Google (Firebase Auth) para persistir o histórico e preferências entre múltiplos aparelhos.
- Funciona 100% no modo visitante (armazenamento local via `localStorage`), sem exigir cadastro obrigatório.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias Utilizadas |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide React Icons |
| **Mapas & GPS** | Leaflet, React Leaflet, OpenStreetMap |
| **Gráficos** | Recharts (ResponsiveContainer, AreaChart, BarChart) |
| **Backend & Servidor** | Node.js, Express, TSX, Vite Middleware |
| **Banco de Dados** | Google Cloud Firestore (Firebase) |
| **Inteligência Artificial** | Google Gemini API (Análise de orçamentos e encartes) |
| **Autenticação** | Firebase Authentication (Google Sign-In) |

---

## 📁 Estrutura do Código

```
├── server.ts                       # Backend Express (APIs de encarte, Gemini e links curtos)
├── index.html                      # Ponto de entrada com SEO, fontes e meta tags
├── metadata.json                   # Metadados e permissões da aplicação
├── src/
│   ├── main.tsx                    # Inicialização do React
│   ├── App.tsx                     # Orquestrador principal de estado e fluxo de etapas
│   ├── types.ts                    # Interfaces TypeScript (Produto, Rancho, Perfil, Mercados)
│   ├── components/
│   │   ├── StepProgressBar.tsx      # Barra superior de etapas do Wizard mobile
│   │   ├── BudgetStepView.tsx       # Etapa 1: Definição do teto e renda familiar
│   │   ├── CompactBudgetHeader.tsx  # Medidor compacto para as etapas 2, 3 e 4
│   │   ├── DailySuggestionCard.tsx  # Card 'Sugestão do Dia' (análise histórica e maior economia)
│   │   ├── ProductSearchAdd.tsx     # Campo de busca e adição rápida de produtos
│   │   ├── PromotionsTable.tsx      # Etapa 2: Tabela de ofertas categorizadas
│   │   ├── MarketComparisonSummary  # Etapa 3: Comparativo de preços por mercado
│   │   ├── SingleMarketShoppingMode # Etapa 4: Modo gôndola e carrinho físico
│   │   ├── ShareRanchoModal.tsx     # Modal de geração de link encurtado e WhatsApp
│   │   ├── PassoFundoMap.tsx        # Mapa de supermercados e bairros
│   │   ├── RanchoHistoryChart.tsx   # Gráficos de evolução de gastos
│   │   ├── BudgetAdvisorModal.tsx   # Consultor inteligente de orçamento
│   │   ├── GoogleAuthButton.tsx     # Botão e popover de conta Google
│   │   └── RanchoJaLogo.tsx         # Identidade visual e logotipo
│   └── utils/
│       ├── shareRancho.ts           # Algoritmos de encurtamento, encoding e cópia
│       ├── passoFundoLocations.ts   # Bairros, coordenadas e catálogo de lojas
│       ├── productSubstitutes.ts    # Base de substitutos econômicos
│       └── googleAuth.ts            # Gerenciamento de sessão Firebase Auth
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** v18 ou superior instalado
- **npm** ou **yarn**

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/braiancamargo/rancho-passo-fundo.git
   cd rancho-passo-fundo
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no seu navegador:**
   Abra [http://localhost:3000](http://localhost:3000).  
   *Dica: Abra o Inspecionar Elemento (F12) e ative a visualização em modo celular para aproveitar a experiência completa de tela.*

---

## 🔒 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
PORT=3000
# Credenciais do Google Gemini API (para sugestões e busca inteligente)
GEMINI_API_KEY=sua_chave_aqui
```

---

## 👥 Autor & Créditos

Desenvolvido por **Braian Camargo** ([braian.kleber.camargo@gmail.com](mailto:braian.kleber.camargo@gmail.com)).  
Projetado sob medida para fortalecer o poder de compra das famílias de Passo Fundo e região! 💚🌾

---

*RanchoJá © 2026. Economize tempo, preserve seu dinheiro.*
