import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calculator, Plus, ArrowRight, Car, User, TrendingUp, Clock, CheckCircle2, XCircle, Eye, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type FinancingSimulationWithDetails } from '@/lib/supabase';
import { formatCurrency, formatDate, statusLabel, statusColor } from '@/lib/format';

export function FinancingPage() {
  const { dealer } = useAuth();
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState<FinancingSimulationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const { data, error } = await supabase
        .from('financing_simulations')
        .select(`*, vehicle:vehicles(id, brand, model, year_model, year_manufacture, asking_price), client:clients(id, name, phone, document), offers:financing_offers(*, institution:financing_institutions(*))`)
        .eq('dealer_id', dealer.id)
        .order('created_at', { ascending: false });
      if (error) { console.error(error); }
      if (data) setSimulations(data as unknown as FinancingSimulationWithDetails[]);
      setLoading(false);
    }
    load();
  }, [dealer]);

  const filtered = simulations.filter((s) => {
    const matchesSearch = !search ||
      s.vehicle?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      s.vehicle?.model?.toLowerCase().includes(search.toLowerCase()) ||
      s.client?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const todayCount = simulations.filter((s) => {
    const d = new Date(s.created_at);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const approvedCount = simulations.filter((s) => s.status === 'approved' || s.status === 'approved_with_condition').length;
  const analysisCount = simulations.filter((s) => s.status === 'analysis' || s.status === 'processing' || s.status === 'submitted').length;
  const rejectedCount = simulations.filter((s) => s.status === 'rejected').length;
  const convertedCount = simulations.filter((s) => s.status === 'converted').length;
  const conversionRate = simulations.length > 0 ? (convertedCount / simulations.length) * 100 : 0;

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

  const stats = [
    { label: 'Simulações hoje', value: todayCount.toString(), icon: Calculator, color: 'text-accent-400', grad: 'from-accent-500/15 to-transparent' },
    { label: 'Aprovadas', value: approvedCount.toString(), icon: CheckCircle2, color: 'text-success-400', grad: 'from-success-500/15 to-transparent' },
    { label: 'Em análise', value: analysisCount.toString(), icon: Clock, color: 'text-warning-400', grad: 'from-warning-500/15 to-transparent' },
    { label: 'Recusadas', value: rejectedCount.toString(), icon: XCircle, color: 'text-error-400', grad: 'from-error-500/15 to-transparent' },
    { label: 'Convertidas', value: convertedCount.toString(), icon: TrendingUp, color: 'text-success-400', grad: 'from-success-500/15 to-transparent' },
    { label: 'Conversão', value: conversionRate.toFixed(0) + '%', icon: TrendingUp, color: 'text-gold-400', grad: 'from-gold-500/15 to-transparent' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-down">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Financiamento Inteligente</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Financiamentos</h1>
          <p className="text-navy-300 text-sm mt-1">Consulte e compare opções de financiamento em um só lugar</p>
        </div>
        <button
          onClick={() => navigate('/financiamento/novo')}
          className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 text-sm group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Nova simulação
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="group relative glass-card rounded-2xl p-4 hover-lift-sm card-glow overflow-hidden animate-fade-in-up spotlight" style={{ animationDelay: `${i * 50}ms` }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-xl glass flex items-center justify-center mb-2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon size={16} className={stat.color} />
                </div>
                <p className="text-xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs text-navy-300 mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
        <div className="relative group flex-1 input-anim">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por veículo ou cliente..."
            className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="glass border border-navy-600/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
          <option value="all">Todos status</option>
          <option value="draft">Rascunho</option>
          <option value="processing">Processando</option>
          <option value="analysis">Em análise</option>
          <option value="approved">Aprovada</option>
          <option value="approved_with_condition">Aprovada com condição</option>
          <option value="rejected">Recusada</option>
          <option value="converted">Convertida</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center hover-lift animate-fade-in-scale">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-accent-500/20 blur-2xl rounded-full animate-breathe" />
            <Calculator size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">
            {simulations.length === 0 ? 'Nenhuma simulação realizada' : 'Nenhum resultado'}
          </p>
          <p className="text-sm text-navy-400 mt-1">
            {simulations.length === 0 ? 'Comece simulando financiamento para seus clientes' : 'Tente ajustar os filtros'}
          </p>
          {simulations.length === 0 && (
            <button
              onClick={() => navigate('/financiamento/novo')}
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium text-sm transition-all border border-accent-500/20 group hover:scale-105 duration-300"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              Realizar primeira simulação
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sim, i) => {
            const offers = sim.offers || [];
            const approvedOffers = offers.filter((o) => o.status === 'approved' || o.status === 'approved_with_condition');
            const bestOffer = offers.find((o) => o.is_best);
            return (
              <div
                key={sim.id}
                className="group glass-card rounded-2xl p-5 hover-lift card-glow animate-fade-in-up cursor-pointer spotlight"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => navigate(`/financiamento/${sim.id}`)}
                onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-accent-500/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-navy-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <Calculator size={22} className="text-accent-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate text-sm">
                        {sim.vehicle ? `${sim.vehicle.brand} ${sim.vehicle.model}` : 'Veículo não vinculado'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-navy-400">
                        {sim.client && <span className="flex items-center gap-1"><User size={12} /> {sim.client.name}</span>}
                        {sim.vehicle && <span className="flex items-center gap-1"><Car size={12} /> {sim.vehicle.year_model || sim.vehicle.year_manufacture || '—'}</span>}
                        <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(sim.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-navy-400">Financiado</p>
                      <p className="text-sm font-bold text-white">{formatCurrency(sim.financed_amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-navy-400">Prazo</p>
                      <p className="text-sm font-bold text-white">{sim.term_months}x</p>
                    </div>
                    {bestOffer && (
                      <div className="text-right">
                        <p className="text-xs text-navy-400">Melhor parcela</p>
                        <p className="text-sm font-bold text-success-400">{formatCurrency(bestOffer.installment_amount || 0)}</p>
                      </div>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(sim.status)}`}>
                      {statusLabel(sim.status)}
                    </span>
                    <Eye size={16} className="text-navy-400 group-hover:text-accent-400 group-hover:scale-125 transition-all duration-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
