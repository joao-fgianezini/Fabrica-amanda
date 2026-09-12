import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, TrendingUp, Search, ArrowRight, CircleDollarSign, Sparkles, Activity, Wallet, Users, TrendingDown, Receipt, Calculator, CheckCircle2, Clock, XCircle, Target, Flame, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type Sale, type Expense, type FinancingSimulation } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';

export function DashboardPage() {
  const { dealer } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [financingSims, setFinancingSims] = useState<FinancingSimulation[]>([]);
  const [totalNetwork, setTotalNetwork] = useState(0);
  const [leadStats, setLeadStats] = useState({ total: 0, hot: 0, followUpsToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!dealer) return;
      const [myVeh, mySales, myExp, myFin, netCount, leadRes] = await Promise.all([
        supabase.from('vehicles').select('*').eq('dealer_id', dealer.id).order('created_at', { ascending: false }),
        supabase.from('sales').select('*').eq('dealer_id', dealer.id).order('sale_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('dealer_id', dealer.id),
        supabase.from('financing_simulations').select('*').eq('dealer_id', dealer.id).order('created_at', { ascending: false }),
        supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('leads').select('id, lead_score, status').eq('dealer_id', dealer.id),
      ]);
      if (myVeh.data) setVehicles(myVeh.data as Vehicle[]);
      if (mySales.data) setSales(mySales.data as Sale[]);
      if (myExp.data) setExpenses(myExp.data as Expense[]);
      if (myFin.data) setFinancingSims(myFin.data as FinancingSimulation[]);
      if (netCount.count !== null) setTotalNetwork(netCount.count);
      if (leadRes.data) {
        const leadsData = leadRes.data as { id: string; lead_score: number; status: string }[];
        const today = new Date().toISOString().split('T')[0];
        const { count: fuCount } = await supabase
          .from('lead_follow_ups').select('*', { count: 'exact', head: true })
          .eq('dealer_id', dealer.id).eq('status', 'pending')
          .gte('scheduled_at', today + 'T00:00:00').lte('scheduled_at', today + 'T23:59:59');
        setLeadStats({
          total: leadsData.filter((l) => !['won', 'lost'].includes(l.status)).length,
          hot: leadsData.filter((l) => l.lead_score >= 80).length,
          followUpsToday: fuCount || 0,
        });
      }
      setLoading(false);
    }
    loadData();
  }, [dealer]);

  const stockVehicles = vehicles.filter((v) => v.status !== 'sold');
  const availableCount = stockVehicles.filter((v) => v.status === 'available').length;
  const reservedCount = stockVehicles.filter((v) => v.status === 'reserved').length;
  const totalValue = stockVehicles.reduce((sum, v) => sum + Number(v.asking_price), 0);
  const totalInvested = stockVehicles.reduce((sum, v) => sum + Number(v.purchase_price), 0);

  const totalSalesRevenue = sales.reduce((s, sale) => s + Number(sale.sale_price), 0);
  const totalSalesProfit = sales.reduce((s, sale) => s + Number(sale.profit || 0), 0);
  const totalExpenses = expenses.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);
  const pendingExpenses = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + Number(e.amount), 0);
  const netProfit = totalSalesProfit - totalExpenses;

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
    {
      label: 'Veículos no estoque',
      value: stockVehicles.length.toString(),
      sub: availableCount + ' disponíveis · ' + reservedCount + ' reservados',
      icon: Car,
      gradient: 'from-accent-500/20 to-accent-600/5',
      iconColor: 'text-accent-400',
    },
    {
      label: 'Valor do estoque',
      value: formatCurrency(totalValue),
      sub: 'Investido: ' + formatCurrency(totalInvested),
      icon: CircleDollarSign,
      gradient: 'from-success-500/20 to-success-600/5',
      iconColor: 'text-success-400',
    },
    {
      label: 'Lucro em vendas',
      value: formatCurrency(totalSalesProfit),
      sub: sales.length + ' venda(s) registrada(s)',
      icon: TrendingUp,
      gradient: 'from-gold-500/20 to-gold-400/5',
      iconColor: 'text-gold-400',
    },
    {
      label: 'Despesas pagas',
      value: formatCurrency(totalExpenses),
      sub: 'Pendentes: ' + formatCurrency(pendingExpenses),
      icon: Wallet,
      gradient: 'from-error-500/15 to-error-600/5',
      iconColor: 'text-error-400',
    },
  ];

  const quickActions = [
    { to: '/estoque', title: 'Meu Estoque', desc: 'Cadastre e gerencie seus veículos', icon: Car, gradient: 'from-accent-500/15 to-transparent' },
    { to: '/vendas', title: 'Vendas', desc: 'Registre vendas e acompanhe lucros', icon: TrendingUp, gradient: 'from-success-500/15 to-transparent' },
    { to: '/financeiro', title: 'Financeiro', desc: 'Controle despesas e custos', icon: Wallet, gradient: 'from-gold-500/15 to-transparent' },
    { to: '/clientes', title: 'Clientes', desc: 'Gerencie seu CRM', icon: Users, gradient: 'from-navy-400/15 to-transparent' },
    { to: '/financiamento', title: 'Financiamento', desc: 'Simule e compare opções', icon: Calculator, gradient: 'from-accent-500/15 to-transparent' },
    { to: '/atendimento', title: 'Atendimento', desc: 'Conversas e clientes', icon: MessageSquare, gradient: 'from-gold-500/15 to-transparent' },
    { to: '/rede', title: 'Buscar na Rede', desc: 'Encontre carros de outros lojistas', icon: Search, gradient: 'from-accent-500/15 to-transparent' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero header */}
      <div className="relative animate-fade-in-down">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gold-400/30 blur-md rounded-full" />
            <Sparkles size={16} className="relative text-gold-400" />
          </div>
          <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Painel do Lojista</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          Olá, <span className="gradient-text">{dealer?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-navy-300 mt-2 text-base">Visão geral completa do seu negócio e da rede de lojistas</p>
      </div>

      {/* Financial overview banner */}
      <div className="relative glass-card rounded-2xl p-6 overflow-hidden animate-fade-in-up aurora-bg">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-500/5 via-transparent to-gold-500/5" />
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-success-400" />
              <p className="text-xs text-navy-400 uppercase tracking-wide font-medium">Receita de vendas</p>
            </div>
            <p className="text-xl md:text-2xl font-extrabold text-white">{formatCurrency(totalSalesRevenue)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CircleDollarSign size={16} className="text-gold-400" />
              <p className="text-xs text-navy-400 uppercase tracking-wide font-medium">Lucro bruto</p>
            </div>
            <p className="text-xl md:text-2xl font-extrabold text-success-400">{formatCurrency(totalSalesProfit)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={16} className="text-error-400" />
              <p className="text-xs text-navy-400 uppercase tracking-wide font-medium">Despesas</p>
            </div>
            <p className="text-xl md:text-2xl font-extrabold text-error-400">{formatCurrency(totalExpenses)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-accent-400" />
              <p className="text-xs text-navy-400 uppercase tracking-wide font-medium">Lucro líquido</p>
            </div>
            <p className={'text-xl md:text-2xl font-extrabold ' + (netProfit >= 0 ? 'text-success-400' : 'text-error-400')}>{formatCurrency(netProfit)}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const gradientClass = 'absolute inset-0 bg-gradient-to-br ' + stat.gradient + ' opacity-0 group-hover:opacity-100 transition-opacity duration-500';
          return (
            <div key={i} className="group relative glass-card rounded-2xl p-6 hover-lift card-glow overflow-hidden animate-fade-in-up spotlight" style={{ animationDelay: String(i * 80) + 'ms' }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
              <div className={gradientClass} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl glass flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon size={20} className={stat.iconColor} />
                  </div>
                  <Activity size={14} className="text-navy-500 group-hover:text-accent-400/60 transition-colors" />
                </div>
                <p className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</p>
                <p className="text-sm text-navy-200 mt-1 font-medium">{stat.label}</p>
                <p className="text-xs text-navy-400 mt-2">{stat.sub}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
          Ações rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            const actionGradient = 'absolute inset-0 bg-gradient-to-br ' + action.gradient + ' opacity-0 group-hover:opacity-100 transition-opacity duration-500';
            return (
              <Link key={i} to={action.to} className="group relative glass-card rounded-2xl p-4 hover-lift-sm card-glow overflow-hidden transition-all duration-300 text-center sm:text-left spotlight" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
                <div className={actionGradient} />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mx-auto sm:mx-0 mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Icon size={18} className="text-accent-400" />
                  </div>
                  <p className="text-sm font-bold text-white">{action.title}</p>
                  <p className="text-xs text-navy-400 mt-0.5 hidden sm:block">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent vehicles */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
              Veículos recentes
            </h2>
            <Link to="/estoque" className="text-sm text-accent-400 hover:text-accent-300 font-medium flex items-center gap-1 group">
              Ver todos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {vehicles.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center hover-lift">
              <div className="relative inline-block mb-3">
                <div className="absolute inset-0 bg-accent-500/20 blur-2xl rounded-full animate-breathe" />
                <Car size={36} className="relative text-navy-400" />
              </div>
              <p className="text-navy-200 font-medium text-sm">Nenhum veículo cadastrado</p>
              <Link to="/veiculo/novo" className="inline-flex items-center gap-2 mt-3 text-accent-400 hover:text-accent-300 font-medium text-sm group">
                Cadastrar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stockVehicles.slice(0, 4).map((v, i) => (
                <Link key={v.id} to={'/veiculo/' + v.id} className="group glass-card rounded-xl p-4 hover-lift-sm card-glow flex items-center gap-4 overflow-hidden relative animate-fade-in spotlight" style={{ animationDelay: String(0.4 + i * 0.06) + 's' }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg glass flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Car size={18} className="text-navy-300 group-hover:text-accent-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate text-sm group-hover:text-accent-200 transition-colors">{v.brand} {v.model}</p>
                      <p className="text-xs text-navy-400">{v.year_model || v.year_manufacture || '—'} · {formatCurrency(v.asking_price)}</p>
                    </div>
                    <div className={'text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ' + (v.status === 'available' ? 'bg-success-500/15 text-success-400 border-success-500/30' : v.status === 'reserved' ? 'bg-warning-500/15 text-warning-400 border-warning-500/30' : 'bg-error-500/15 text-error-400 border-error-500/30')}>
                      {v.status === 'available' ? 'Disp.' : v.status === 'reserved' ? 'Reserv.' : 'Vendido'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent sales */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-success-400" style={{ boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
              Vendas recentes
            </h2>
            <Link to="/vendas" className="text-sm text-success-400 hover:text-success-500 font-medium flex items-center gap-1 group">
              Ver todas <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {sales.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center hover-lift">
              <div className="relative inline-block mb-3">
                <div className="absolute inset-0 bg-success-500/20 blur-2xl rounded-full animate-breathe" />
                <TrendingUp size={36} className="relative text-navy-400" />
              </div>
              <p className="text-navy-200 font-medium text-sm">Nenhuma venda registrada</p>
              <Link to="/vendas" className="inline-flex items-center gap-2 mt-3 text-success-400 hover:text-success-500 font-medium text-sm group">
                Registrar venda <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.slice(0, 4).map((sale, i) => (
                <div key={sale.id} className="group glass-card rounded-xl p-4 hover-lift-sm card-glow flex items-center gap-4 animate-fade-in spotlight" style={{ animationDelay: String(0.5 + i * 0.06) + 's' }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
                  <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <TrendingUp size={18} className="text-success-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate text-sm group-hover:text-accent-200 transition-colors">
                      {sale.client_name || 'Venda direta'}
                    </p>
                    <p className="text-xs text-navy-400">{formatCurrency(sale.sale_price)} · {sale.payment_method || '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={'text-sm font-bold ' + (Number(sale.profit) >= 0 ? 'text-success-400' : 'text-error-400')}>
                      {formatCurrency(sale.profit)}
                    </p>
                    <p className="text-xs text-navy-400">lucro</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Financing block */}
      {financingSims.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.55s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
              Financiamentos
            </h2>
            <Link to="/financiamento" className="text-sm text-accent-400 hover:text-accent-300 font-medium flex items-center gap-1 group">
              Ver todos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Simulações hoje', value: financingSims.filter((s) => { const d = new Date(s.created_at); const now = new Date(); return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length.toString(), icon: Calculator, color: 'text-accent-400' },
              { label: 'Aprovadas', value: financingSims.filter((s) => s.status === 'approved' || s.status === 'approved_with_condition').length.toString(), icon: CheckCircle2, color: 'text-success-400' },
              { label: 'Em análise', value: financingSims.filter((s) => s.status === 'analysis' || s.status === 'processing' || s.status === 'submitted').length.toString(), icon: Clock, color: 'text-warning-400' },
              { label: 'Recusadas', value: financingSims.filter((s) => s.status === 'rejected').length.toString(), icon: XCircle, color: 'text-error-400' },
              { label: 'Fechadas', value: financingSims.filter((s) => s.status === 'converted').length.toString(), icon: TrendingUp, color: 'text-success-400' },
              { label: 'Conversão', value: financingSims.length > 0 ? Math.round((financingSims.filter((s) => s.status === 'converted').length / financingSims.length) * 100) + '%' : '0%', icon: Activity, color: 'text-gold-400' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="group glass-card rounded-xl p-4 hover-lift-sm card-glow overflow-hidden animate-fade-in-up" style={{ animationDelay: `${0.4 + i * 60}ms` }}>
                  <div className="w-8 h-8 rounded-lg glass flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Icon size={14} className={stat.color} />
                  </div>
                  <p className="text-lg font-extrabold text-white">{stat.value}</p>
                  <p className="text-xs text-navy-300">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CRM quick stats */}
      {(leadStats.total > 0 || leadStats.hot > 0 || leadStats.followUpsToday > 0) && (
        <Link to="/atendimento" className="group block glass-card rounded-2xl p-5 hover-lift overflow-hidden relative animate-fade-in-up border border-gold-500/20" style={{ animationDelay: '0.65s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-transparent opacity-50" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gold-500/30 blur-lg rounded-xl animate-pulse" />
                <div className="relative w-12 h-12 rounded-xl glass flex items-center justify-center">
                  <Target size={22} className="text-gold-400" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-extrabold text-white">{leadStats.total}</p>
                  <p className="text-xs text-navy-300 uppercase tracking-wide">Clientes ativos</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-error-400 flex items-center gap-1"><Flame size={18} /> {leadStats.hot}</p>
                  <p className="text-xs text-navy-300 uppercase tracking-wide">Quentes</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-warning-400">{leadStats.followUpsToday}</p>
                  <p className="text-xs text-navy-300 uppercase tracking-wide">Acompanhamentos hoje</p>
                </div>
              </div>
            </div>
            <ArrowRight size={20} className="text-gold-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      )}

      {/* Pending expenses alert */}
      {pendingExpenses > 0 && (
        <Link to="/financeiro" className="group block glass-card rounded-2xl p-5 hover-lift overflow-hidden relative animate-fade-in-up border border-warning-500/20" style={{ animationDelay: '0.6s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-warning-500/10 to-transparent opacity-50" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-warning-500/30 blur-lg rounded-xl animate-pulse" />
                <div className="relative w-12 h-12 rounded-xl glass flex items-center justify-center">
                  <Receipt size={22} className="text-warning-400" />
                </div>
              </div>
              <div>
                <p className="text-white font-bold">{formatCurrency(pendingExpenses)} em despesas pendentes</p>
                <p className="text-sm text-navy-300">Quite suas contas em dia</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-warning-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      )}
    </div>
  );
}
