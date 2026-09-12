import { useEffect, useState } from 'react';
import {
  Plus, Wallet, TrendingDown, TrendingUp, Clock, CheckCircle2, Pencil, Trash2,
  AlertCircle, Search, Tag, Lock, History, FileDown, X, PieChart, RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Expense, type ExpenseCategory, type ExpenseWithCategory, type MonthlyClosure } from '@/lib/supabase';
import { formatCurrency, formatDate, statusLabel, statusColor } from '@/lib/format';
import { ExpenseModal } from '@/components/ExpenseModal';
import { executeMonthClosure, generateClosurePDF, gatherClosureData, type ClosureSummary } from '@/lib/closure';

export function FinancePage() {
  const { dealer } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showClosureConfirm, setShowClosureConfirm] = useState(false);
  const [closureLoading, setClosureLoading] = useState(false);
  const [closureError, setClosureError] = useState<string | null>(null);
  const [closurePreview, setClosurePreview] = useState<ClosureSummary | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [closures, setClosures] = useState<MonthlyClosure[]>([]);
  const [closuresLoading, setClosuresLoading] = useState(false);
  const [fixedFilter, setFixedFilter] = useState<'all' | 'fixed' | 'variable'>('all');

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const [expRes, catRes] = await Promise.all([
        supabase
          .from('expenses')
          .select('*, category:expense_categories(*)')
          .eq('dealer_id', dealer.id)
          .order('created_at', { ascending: false }),
        supabase.from('expense_categories').select('*').eq('dealer_id', dealer.id).order('name'),
      ]);
      if (expRes.error) { console.error('Erro ao carregar despesas:', expRes.error); setError('Não foi possível carregar as despesas. Tente novamente.'); }
      else setExpenses(expRes.data as unknown as ExpenseWithCategory[]);
      if (catRes.data) setCategories(catRes.data as ExpenseCategory[]);
      setLoading(false);
    }
    load();
  }, [dealer]);

  async function loadData() {
    if (!dealer) return;
    const { data } = await supabase
      .from('expenses')
      .select('*, category:expense_categories(*)')
      .eq('dealer_id', dealer.id)
      .order('created_at', { ascending: false });
    if (data) setExpenses(data as unknown as ExpenseWithCategory[]);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) { console.error('Erro ao excluir despesa:', error); setError('Não foi possível excluir a despesa. Tente novamente.'); return; }
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setDeleteId(null);
  }

  async function togglePaid(exp: Expense) {
    const newStatus = exp.status === 'paid' ? 'pending' : 'paid';
    const newPaidDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null;
    const { error } = await supabase
      .from('expenses')
      .update({ status: newStatus, paid_date: newPaidDate })
      .eq('id', exp.id);
    if (error) { console.error('Erro ao atualizar despesa:', error); setError('Não foi possível atualizar a despesa. Tente novamente.'); return; }
    await loadData();
  }

  const filtered = expenses.filter((e) => {
    const matchesSearch = !search || e.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || e.category_id === categoryFilter;
    const matchesFixed = fixedFilter === 'all' || (fixedFilter === 'fixed' && e.is_fixed) || (fixedFilter === 'variable' && !e.is_fixed);
    return matchesSearch && matchesStatus && matchesCategory && matchesFixed;
  });

  const fixedExpenses = expenses.filter((e) => e.is_fixed);
  const fixedTotal = fixedExpenses.reduce((s, e) => s + Number(e.amount), 0);

  async function handleClosurePreview() {
    if (!dealer) return;
    setClosureError(null);
    setShowClosureConfirm(true);
    setClosurePreview(null);
    try {
      const data = await gatherClosureData(dealer.id);
      setClosurePreview(data.summary);
    } catch (err) {
      setClosureError('Não foi possível carregar o resumo do mês.');
    }
  }

  async function handleExecuteClosure() {
    if (!dealer) return;
    setClosureLoading(true);
    setClosureError(null);
    try {
      const closure = await executeMonthClosure(dealer.id);
      generateClosurePDF(closure, dealer.name || 'Loja', dealer.logo_url || null);
      setShowClosureConfirm(false);
      setClosurePreview(null);
      await loadData();
    } catch (err) {
      setClosureError(err instanceof Error ? err.message : 'Erro ao encerrar o mês.');
    } finally {
      setClosureLoading(false);
    }
  }

  async function loadHistory() {
    if (!dealer) return;
    setClosuresLoading(true);
    const { data, error } = await supabase
      .from('monthly_closures')
      .select('*')
      .eq('dealer_id', dealer.id)
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false });
    if (!error && data) setClosures(data as MonthlyClosure[]);
    setClosuresLoading(false);
  }

  function handleDownloadClosurePDF(c: MonthlyClosure) {
    if (!dealer) return;
    generateClosurePDF(c, dealer.name || 'Loja', dealer.logo_url || null);
  }

  function monthLabel(m: number, y: number) {
    return new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  const totalPaid = expenses.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);
  const totalPending = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + Number(e.amount), 0);
  const totalAll = totalPaid + totalPending;
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + Number(e.amount), 0);

  // Category breakdown
  const byCategory = categories.map((cat) => {
    const total = expenses.filter((e) => e.category_id === cat.id).reduce((s, e) => s + Number(e.amount), 0);
    return { ...cat, total };
  }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);
  const maxCatTotal = byCategory[0]?.total || 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-down">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-gold-400" style={{ boxShadow: '0 0 8px rgba(212,168,67,0.5)' }} />
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Gestão Financeira</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Financeiro</h1>
          <p className="text-navy-300 text-sm mt-1">Controle de despesas, custos e fluxo de caixa</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowHistory(true); loadHistory(); }}
            className="flex items-center gap-2 glass border border-navy-600/30 hover:border-accent-500/40 text-navy-200 hover:text-white font-medium px-4 py-3 rounded-xl transition-all duration-300 text-sm group"
          >
            <History size={18} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Histórico</span>
          </button>
          <button
            onClick={handleClosurePreview}
            className="btn-shine ripple-btn flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-bold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:-translate-y-0.5 text-sm group"
          >
            <Lock size={18} className="group-hover:scale-110 transition-transform" />
            Encerrar Mês
          </button>
          <button
            onClick={() => { setEditExpense(null); setShowModal(true); }}
            className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 text-sm group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            Nova despesa
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total de despesas', value: formatCurrency(totalAll), icon: Wallet, color: 'text-white', grad: 'from-navy-400/20 to-transparent' },
          { label: 'Pagas', value: formatCurrency(totalPaid), icon: CheckCircle2, color: 'text-success-400', grad: 'from-success-500/15 to-transparent' },
          { label: 'Pendentes', value: formatCurrency(totalPending), icon: Clock, color: 'text-warning-400', grad: 'from-warning-500/15 to-transparent' },
          { label: 'Este mês', value: formatCurrency(monthExpenses), icon: TrendingDown, color: 'text-gold-400', grad: 'from-gold-500/15 to-transparent' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="group relative glass-card rounded-2xl p-5 hover-lift-sm card-glow overflow-hidden animate-fade-in-up spotlight" style={{ animationDelay: `${i * 60}ms` }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon size={18} className={stat.color} />
                </div>
                <p className="text-xl font-extrabold text-white">{stat.value}</p>
                <p className="text-sm text-navy-300 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Despesas por categoria
          </h2>
          <div className="space-y-3">
            {byCategory.map((cat, i) => (
              <div key={cat.id} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}80` }} />
                    <span className="text-sm text-white font-medium">{cat.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{formatCurrency(cat.total)}</span>
                </div>
                <div className="h-2 bg-navy-900/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full progress-bar transition-all duration-700 ease-out"
                    style={{
                      width: `${(cat.total / maxCatTotal) * 100}%`,
                      background: `linear-gradient(90deg, ${cat.color}, ${cat.color}80)`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixed expenses summary */}
      {fixedExpenses.length > 0 && (
        <div className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center flex-shrink-0">
            <RefreshCw size={18} className="text-gold-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{fixedExpenses.length} despesa(s) fixa(s) mensal(is)</p>
            <p className="text-xs text-navy-400">Total: {formatCurrency(fixedTotal)} — permanecem ao encerrar o mês</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
        <div className="relative group flex-1 input-anim">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar despesa..."
            className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="glass border border-navy-600/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
          <option value="all">Todas categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="glass border border-navy-600/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
          <option value="all">Todos status</option>
          <option value="pending">Pendentes</option>
          <option value="paid">Pagas</option>
        </select>
        <select value={fixedFilter} onChange={(e) => setFixedFilter(e.target.value as 'all' | 'fixed' | 'variable')} className="glass border border-navy-600/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
          <option value="all">Fixas e variáveis</option>
          <option value="fixed">Apenas fixas</option>
          <option value="variable">Apenas variáveis</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center hover-lift animate-fade-in-scale">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gold-500/20 blur-2xl rounded-full animate-breathe" />
            <Wallet size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">
            {expenses.length === 0 ? 'Nenhuma despesa cadastrada' : 'Nenhum resultado'}
          </p>
          <p className="text-sm text-navy-400 mt-1">
            {expenses.length === 0 ? 'Comece a controlar seus custos agora' : 'Ajuste os filtros de busca'}
          </p>
          {expenses.length === 0 && (
            <button
              onClick={() => { setEditExpense(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium text-sm transition-all border border-accent-500/20 group hover:scale-105 duration-300"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              Adicionar primeira despesa
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
          <div className="divide-y divide-navy-600/20">
            {filtered.map((exp, i) => (
              <div
                key={exp.id}
                className="group flex items-center gap-4 p-4 hover:bg-navy-700/20 transition-all animate-fade-in hover:pl-5"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Category color dot */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${exp.category?.color || '#64748b'}20`, border: `1px solid ${exp.category?.color || '#64748b'}40` }}
                >
                  <Tag size={16} style={{ color: exp.category?.color || '#64748b' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{exp.description}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-navy-400">
                    <span>{exp.category?.name || 'Sem categoria'}</span>
                    {exp.due_date && <span>Venc: {formatDate(exp.due_date)}</span>}
                    {exp.recurrence !== 'none' && (
                      <span className="text-accent-400 font-medium">
                        {exp.recurrence === 'weekly' ? 'Semanal' : exp.recurrence === 'monthly' ? 'Mensal' : 'Anual'}
                      </span>
                    )}
                    {exp.is_fixed && (
                      <span className="text-gold-400 font-medium flex items-center gap-1">
                        <RefreshCw size={10} /> Fixa
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-white">{formatCurrency(exp.amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(exp.status)}`}>
                    {statusLabel(exp.status)}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePaid(exp)}
                    className={`p-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${
                      exp.status === 'paid'
                        ? 'text-success-400 hover:bg-success-500/15'
                        : 'text-navy-400 hover:bg-warning-500/15 hover:text-warning-400'
                    }`}
                    title={exp.status === 'paid' ? 'Marcar como pendente' : 'Marcar como pago'}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button
                    onClick={() => { setEditExpense(exp); setShowModal(true); }}
                    className="p-2 rounded-lg text-navy-400 hover:bg-accent-500/15 hover:text-accent-400 transition-all hover:scale-110 active:scale-95"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(exp.id)}
                    className="p-2 rounded-lg text-navy-400 hover:bg-error-500/15 hover:text-error-400 transition-all hover:scale-110 active:scale-95"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ExpenseModal
          expense={editExpense}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full animate-drop-in border border-navy-600/30 relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-error-400/60 to-transparent" />
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-error-500/30 blur-xl rounded-xl animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-error-500/15 flex items-center justify-center">
                <Trash2 size={24} className="text-error-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Excluir despesa?</h3>
            <p className="text-sm text-navy-300 mt-2 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all hover:scale-105 active:scale-95">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-shine ripple-btn flex items-center gap-2 bg-error-500 hover:bg-error-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-error-500/20 hover:shadow-error-500/40 hover:-translate-y-0.5">
                <Trash2 size={16} /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Closure confirmation modal */}
      {showClosureConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => !closureLoading && setShowClosureConfirm(false)}>
          <div className="glass-strong rounded-2xl p-6 max-w-lg w-full animate-drop-in border border-gold-500/30 relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
            <button onClick={() => !closureLoading && setShowClosureConfirm(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-navy-400 hover:bg-navy-700/50 hover:text-white transition-all">
              <X size={18} />
            </button>
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gold-500/30 blur-xl rounded-xl animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-gold-500/15 flex items-center justify-center">
                <Lock size={24} className="text-gold-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Encerrar o Mês</h3>
            <p className="text-sm text-navy-300 mt-2 mb-4">
              Esta ação vai gerar um relatório completo do mês atual e reiniciar o sistema para o próximo mês. <strong className="text-white">Atenção:</strong> esta ação não pode ser desfeita.
            </p>

            {closureError && (
              <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{closureError}</span>
              </div>
            )}

            {closurePreview ? (
              <div className="space-y-2 mb-5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-navy-400 uppercase tracking-wide">Total Despesas</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(closurePreview.totalExpenses)}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-navy-400 uppercase tracking-wide">Total Vendas</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(closurePreview.totalSales)}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-navy-400 uppercase tracking-wide">Lucro Total</p>
                    <p className={`text-lg font-bold ${closurePreview.totalProfit >= 0 ? 'text-success-400' : 'text-error-400'}`}>{formatCurrency(closurePreview.totalProfit)}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-navy-400 uppercase tracking-wide">Veículos Vendidos</p>
                    <p className="text-lg font-bold text-white">{closurePreview.vehiclesSold}</p>
                  </div>
                </div>
                <div className="glass rounded-xl p-3 flex items-center gap-2">
                  <RefreshCw size={14} className="text-gold-400" />
                  <span className="text-xs text-navy-300">{closurePreview.fixedExpensesCount} despesa(s) fixa(s) serão mantidas</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 mb-4">
                <RefreshCw size={24} className="text-navy-400 animate-spin" />
              </div>
            )}

            <div className="bg-navy-900/40 rounded-xl p-3 mb-5 text-xs text-navy-400 leading-relaxed">
              <strong className="text-navy-200">O que acontece:</strong> as despesas não fixas, veículos vendidos e registros de vendas serão removidos. As despesas fixas, veículos em estoque e clientes serão mantidos. Um relatório em PDF será gerado.
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setShowClosureConfirm(false)} disabled={closureLoading} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50">Cancelar</button>
              <button onClick={handleExecuteClosure} disabled={closureLoading || !closurePreview} className="btn-shine ripple-btn flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                {closureLoading ? <><RefreshCw size={16} className="animate-spin" /> Encerrando...</> : <><Lock size={16} /> Confirmar Encerramento</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowHistory(false)}>
          <div className="glass-strong rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-drop-in border border-accent-500/20 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowHistory(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-navy-400 hover:bg-navy-700/50 hover:text-white transition-all">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center">
                <History size={20} className="text-accent-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Histórico de Encerramentos</h3>
                <p className="text-xs text-navy-400">Relatórios de meses encerrados</p>
              </div>
            </div>

            {closuresLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw size={24} className="text-navy-400 animate-spin" />
              </div>
            ) : closures.length === 0 ? (
              <div className="text-center py-12">
                <PieChart size={36} className="text-navy-500 mx-auto mb-3" />
                <p className="text-navy-300 font-medium">Nenhum encerramento registrado</p>
                <p className="text-sm text-navy-500 mt-1">Os meses encerrados aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {closures.map((c) => {
                  const totals = c.summary_totals;
                  return (
                    <div key={c.id} className="glass rounded-xl p-4 flex items-center gap-4 hover:border-accent-500/30 border border-transparent transition-all">
                      <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                        <Lock size={18} className="text-gold-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white capitalize">{monthLabel(c.period_month, c.period_year)}</p>
                        <p className="text-xs text-navy-400 mt-0.5">
                          Lucro: <span className={(Number(totals.total_profit) || 0) >= 0 ? 'text-success-400' : 'text-error-400'}>{formatCurrency(Number(totals.total_profit) || 0)}</span>
                          {' · '}{Number(totals.vehicles_sold) || 0} veículo(s) vendido(s)
                          {' · '}{formatCurrency(Number(totals.total_expenses) || 0)} em despesas
                        </p>
                        <p className="text-xs text-navy-500 mt-0.5">Encerrado em {formatDate(c.closed_at)}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadClosurePDF(c)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-medium transition-all hover:scale-105 active:scale-95"
                      >
                        <FileDown size={14} /> PDF
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
