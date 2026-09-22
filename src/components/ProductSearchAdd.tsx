import React, { useState } from 'react';
import { PromotionItem } from '../types';
import { Search, Loader2, Plus, Sparkles, Store, CheckCircle2 } from 'lucide-react';

interface ProductSearchAddProps {
  onAddCustomProduct: (item: PromotionItem) => void;
  cityName?: string;
}

export const ProductSearchAdd: React.FC<ProductSearchAddProps> = ({ onAddCustomProduct, cityName }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<PromotionItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResult(null);
    setJustAdded(false);

    try {
      const res = await fetch('/api/search-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query.trim(),
          city: cityName || 'Passo Fundo' 
        }),
      });

      if (!res.ok) {
        throw new Error('Não foi possível obter os preços para este item.');
      }

      const data = await res.json();
      if (data.item) {
        setResult(data.item);
      } else {
        setError('Nenhum dado encontrado para este item.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao consultar preços ao vivo.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = () => {
    if (result) {
      onAddCustomProduct(result);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2500);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl p-3.5 mb-4 shadow-xs border border-emerald-800/40">
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <h3 className="text-xs font-bold text-white tracking-tight">
            Consultar Outro Produto na Internet
          </h3>
        </div>
        <p className="text-[11px] text-slate-300 mb-3 leading-tight">
          A IA pesquisa preços ao vivo no Stok Center, Bourbon, Zaffari e Atacadão.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-pesquisar-ao-vivo"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Azeite Andorinha, Fralda Pampers..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <button
            id="btn-pesquisar-produto"
            type="submit"
            disabled={isSearching || !query.trim()}
            className="min-h-[44px] py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Buscando Preços...</span>
              </>
            ) : (
              <span>Consultar ao Vivo</span>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-3 text-xs text-rose-300 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/50">
            {error}
          </div>
        )}

        {/* Search Result Card */}
        {result && (
          <div className="mt-4 bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-white">{result.name}</h4>
                  {result.isEssential ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                      Básico / Essencial
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                      Supérfluo / Opcional
                    </span>
                  )}
                </div>
                {result.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{result.description}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={justAdded}
                className={`py-2 px-4 rounded-lg font-bold text-xs transition flex items-center gap-1.5 self-start md:self-center ${
                  justAdded 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                }`}
              >
                {justAdded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Adicionado ao Rancho!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Adicionar à Lista</span>
                  </>
                )}
              </button>
            </div>

            {/* Price grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-700/60">
              {result.prices.map((p) => {
                const isCheapest = p.supermarket === result.cheapestMarket;
                return (
                  <div
                    key={p.supermarket}
                    className={`p-2.5 rounded-lg border text-center ${
                      isCheapest
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : 'bg-slate-900/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
                      <Store className="w-3 h-3" />
                      {p.supermarket}
                    </div>
                    <div className={`text-base font-extrabold mt-0.5 ${isCheapest ? 'text-emerald-300' : 'text-white'}`}>
                      R$ {p.price.toFixed(2)}
                    </div>
                    {isCheapest && (
                      <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                        Menor Preço
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
