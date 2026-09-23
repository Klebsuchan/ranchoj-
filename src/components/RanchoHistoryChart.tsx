import React, { useState } from 'react';
import { RanchoHistoryEntry, BudgetProfile, ShoppingListItem } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Save,
  Trash2,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  Info
} from 'lucide-react';

interface RanchoHistoryChartProps {
  history: RanchoHistoryEntry[];
  onSaveCurrentRancho: (monthYear: string, notes?: string) => void;
  onDeleteEntry: (id: string) => void;
  currentRanchoTotal: number;
  currentBudgetLimit: number;
  currentItemsCount: number;
}

export const RanchoHistoryChart: React.FC<RanchoHistoryChartProps> = ({
  history,
  onSaveCurrentRancho,
  onDeleteEntry,
  currentRanchoTotal,
  currentBudgetLimit,
  currentItemsCount,
}) => {
  const [chartMode, setChartMode] = useState<'budget' | 'markets'>('budget');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    return `${months[now.getMonth()]}/${now.getFullYear()}`;
  });
  const [notes, setNotes] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  // Calculate statistics
  const avgSpent = history.length > 0 
    ? history.reduce((acc, h) => acc + h.totalSpent, 0) / history.length 
    : 0;

  const totalSavedAcrossMonths = history.reduce((acc, h) => acc + (h.savingsAchieved || 0), 0);
  const avgBudgetUsed = history.length > 0
    ? history.reduce((acc, h) => acc + (h.budgetLimit > 0 ? (h.totalSpent / h.budgetLimit) * 100 : 0), 0) / history.length
    : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonth.trim()) return;
    onSaveCurrentRancho(selectedMonth.trim(), notes.trim());
    setNotes('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as RanchoHistoryEntry;
      const spent = data.totalSpent;
      const limit = data.budgetLimit;
      const diff = limit - spent;
      const isOver = diff < 0;

      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
          <div className="font-bold text-sm border-b border-slate-700 pb-1 flex justify-between items-center">
            <span>{label}</span>
            <span className="text-[10px] text-slate-400 uppercase font-medium">
              {data.householdType === 'solo' ? '1 pessoa' : 'Casal'}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-slate-200">
            <span>Total Gasto no Rancho:</span>
            <span className="font-extrabold text-red-400">R$ {spent.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span>Teto do Orçamento:</span>
            <span className="font-semibold text-slate-100">R$ {limit.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-800">
            <span>Saldo:</span>
            <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-red-300'}`}>
              {isOver ? `Estourou R$ ${Math.abs(diff).toFixed(2)}` : `Sobrou R$ ${diff.toFixed(2)}`}
            </span>
          </div>

          {data.savingsAchieved !== undefined && data.savingsAchieved > 0 && (
            <div className="flex justify-between items-center text-amber-300 pt-0.5">
              <span>Economia Otimizada:</span>
              <span className="font-bold">R$ {data.savingsAchieved.toFixed(2)}</span>
            </div>
          )}

          {data.notes && (
            <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
              "{data.notes}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Histórico de Gastos com Rancho (Recharts)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-300">
                localStorage Ativo
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Acompanhe a evolução do valor do seu rancho mês a mês e garanta que os gastos fiquem dentro do orçamento.
            </p>
          </div>

          {/* Toggle chart mode */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl self-start sm:self-center text-xs">
            <button
              type="button"
              onClick={() => setChartMode('budget')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                chartMode === 'budget'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gasto vs Teto
            </button>
            <button
              type="button"
              onClick={() => setChartMode('markets')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                chartMode === 'markets'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Evolução por Mercado
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Gasto Médio Mensal</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900">
              R$ {avgSpent.toFixed(2)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Orçamento Médio Utilizado</span>
            <span className="text-base sm:text-lg font-extrabold text-red-600">
              {avgBudgetUsed.toFixed(0)}%
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Total Economizado em Ofertas</span>
            <span className="text-base sm:text-lg font-extrabold text-amber-600">
              R$ {totalSavedAcrossMonths.toFixed(2)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Meses Registrados</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-800">
              {history.length} {history.length === 1 ? 'mês' : 'meses'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="p-4 sm:p-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'budget' ? (
              <AreaChart data={history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA1D2C" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#EA1D2C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="monthYear" 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                  tickFormatter={(val) => `R$ ${val}`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }} 
                  formatter={(value) => (
                    <span className="text-slate-700 font-medium">
                      {value === 'totalSpent' ? 'Gasto Real do Rancho' : 'Teto de Orçamento Estipulado'}
                    </span>
                  )}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalSpent" 
                  name="totalSpent"
                  stroke="#EA1D2C" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorSpent)" 
                  activeDot={{ r: 6, stroke: '#B91C1C', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="budgetLimit" 
                  name="budgetLimit"
                  stroke="#f43f5e" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            ) : (
              <BarChart data={history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="monthYear" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(val) => `R$ ${val}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="stokCenterTotal" name="Stock Center" fill="#EA1D2C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atacadaoTotal" name="Atacadão" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="zaffariTotal" name="Zaffari" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bourbonTotal" name="Bourbon" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Bar: Save Current Rancho into Monthly History */}
      <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200">
        <form onSubmit={handleSave} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Save className="w-4 h-4 text-red-600" />
              Salvar Rancho Atual no Histórico Mensal
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Grava o valor atual de <strong>R$ {currentRanchoTotal.toFixed(2)}</strong> ({currentItemsCount} itens) na memória do seu navegador.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <input
              id="input-mes-historico"
              type="text"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              placeholder="Ex: Set/2026"
              className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              id="input-notas-historico"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nota (opcional, ex: Foco em ofertas Stok Center)"
              className="flex-1 md:w-64 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              id="btn-salvar-mes-historico"
              type="submit"
              disabled={currentRanchoTotal === 0}
              className={`py-1.5 px-4 rounded-lg font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-2xs ${
                justSaved 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50'
              }`}
            >
              {justSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Salvo no Gráfico!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Mês</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* History records list */}
        {history.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200/80">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-2">
              Registros no localStorage:
            </span>
            <div className="flex flex-wrap gap-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs"
                >
                  <span className="font-bold text-slate-800">{entry.monthYear}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-red-700">R$ {entry.totalSpent.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400">/ R$ {entry.budgetLimit.toFixed(0)}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteEntry(entry.id)}
                    className="text-slate-300 hover:text-rose-600 transition ml-1"
                    title={`Remover registro de ${entry.monthYear}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
