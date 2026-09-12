import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Search, Flame, Phone, Car, Clock, TrendingUp, Filter,
  LayoutGrid, List, ChevronRight, Trash2, Users, Target, DollarSign, Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Lead, type LeadWithRelations, type LeadStatus } from '@/lib/supabase';
import {
  PIPELINE_STAGES, LEAD_SOURCES, sourceLabel, scoreColor, scoreLabel,
  statusColorCRM, statusLabelCRM, timeAgo,
} from '@/lib/crm';
import { formatCurrency, formatDate } from '@/lib/format';
import { LeadModal } from '@/components/LeadModal';
import { LeadDetail } from '@/components/LeadDetail';

type ViewMode = 'kanban' | 'list';

export function CrmPage() {
  const { dealer } = useAuth();
  const [leads, setLeads] = useState<LeadWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, hot: 0, won: 0, pipelineValue: 0, followUpsToday: 0 });

  const loadData = useCallback(async () => {
    if (!dealer) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*, vehicle:vehicles(id, brand, model, year_model, asking_price), client:clients(id, name, phone, email)')
      .eq('dealer_id', dealer.id)
      .order('updated_at', { ascending: false });
    if (!error && data) {
      setLeads(data as LeadWithRelations[]);
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('lead_follow_ups')
        .select('*', { count: 'exact', head: true })
        .eq('dealer_id', dealer.id)
        .eq('status', 'pending')
        .gte('scheduled_at', today + 'T00:00:00')
        .lte('scheduled_at', today + 'T23:59:59');
      const allLeads = data as LeadWithRelations[];
      setStats({
        total: allLeads.length,
        hot: allLeads.filter((l) => l.lead_score >= 80).length,
        won: allLeads.filter((l) => l.status === 'won').length,
        pipelineValue: allLeads.filter((l) => !['won', 'lost'].includes(l.status)).reduce((s, l) => s + (l.vehicle?.asking_price ? Number(l.vehicle.asking_price) : 0), 0),
        followUpsToday: count || 0,
      });
    }
    setLoading(false);
  }, [dealer]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = leads.filter((l) => {
    const matchesSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || (l.phone || '').includes(search);
    const matchesSource = sourceFilter === 'all' || l.source === sourceFilter;
    const matchesScore = scoreFilter === 'all' ||
      (scoreFilter === 'hot' && l.lead_score >= 80) ||
      (scoreFilter === 'warm' && l.lead_score >= 60 && l.lead_score < 80) ||
      (scoreFilter === 'cold' && l.lead_score < 60);
    return matchesSearch && matchesSource && matchesScore;
  });

  async function handleStatusChange(leadId: string, newStatus: LeadStatus) {
    const { error } = await supabase.from('leads').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', leadId);
    if (!error) {
      setLeads(leads.map((l) => l.id === leadId ? { ...l, status: newStatus } : l));
      if (detailLead?.id === leadId) setDetailLead({ ...detailLead, status: newStatus });
      loadData();
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('leads').delete().eq('id', deleteId);
    if (!error) { setLeads(leads.filter((l) => l.id !== deleteId)); loadData(); }
    setDeleteId(null);
  }

  function handleDragStart(id: string) { setDraggedId(id); }
  function handleDragEnd() { setDraggedId(null); }
  function handleDrop(status: LeadStatus) {
    if (draggedId) handleStatusChange(draggedId, status);
    setDraggedId(null);
  }

  const activeLeads = filtered.filter((l) => !['won', 'lost'].includes(l.status));
  const wonLeads = filtered.filter((l) => l.status === 'won');
  const lostLeads = filtered.filter((l) => l.status === 'lost');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-gold-500/20 border border-accent-500/30 flex items-center justify-center">
              <Users size={20} className="text-accent-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CRM & Clientes</h1>
              <p className="text-sm text-navy-400">Gerencie seus clientes e vendas</p>
            </div>
          </div>
        </div>
        <button onClick={() => { setEditLead(null); setShowModal(true); }}
          className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:-translate-y-0.5 text-sm group">
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Novo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1"><Target size={16} className="text-accent-400" /><span className="text-xs text-navy-400 uppercase">Clientes ativos</span></div>
          <p className="text-2xl font-bold text-white">{stats.total - wonLeads.length - lostLeads.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 mb-1"><Flame size={16} className="text-error-400" /><span className="text-xs text-navy-400 uppercase">Clientes quentes</span></div>
          <p className="text-2xl font-bold text-error-400">{stats.hot}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-1"><DollarSign size={16} className="text-gold-400" /><span className="text-xs text-navy-400 uppercase">Funil</span></div>
          <p className="text-xl font-bold text-white">{formatCurrency(stats.pipelineValue)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-1"><Calendar size={16} className="text-warning-400" /><span className="text-xs text-navy-400 uppercase">Acompanhamentos hoje</span></div>
          <p className="text-2xl font-bold text-warning-400">{stats.followUpsToday}</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
        <div className="relative group flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar lead..."
            className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 text-sm" />
        </div>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="glass border border-navy-600/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
          <option value="all">Todas origens</option>
          {LEAD_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} className="glass border border-navy-600/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
          <option value="all">Todas pontuações</option>
          <option value="hot">Quentes (80+)</option>
          <option value="warm">Mornos (60-79)</option>
          <option value="cold">Frios (&lt;60)</option>
        </select>
        <div className="flex gap-1 glass rounded-xl p-1">
          <button onClick={() => setViewMode('kanban')} className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-accent-500/20 text-accent-400' : 'text-navy-400 hover:text-white'}`}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-accent-500/20 text-accent-400' : 'text-navy-400 hover:text-white'}`}>
            <List size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center animate-fade-in-up">
          <Users size={48} className="text-navy-500 mx-auto mb-4" />
          <p className="text-navy-300 font-medium text-lg">Nenhum cliente encontrado</p>
          <p className="text-sm text-navy-500 mt-1">Cadastre seu primeiro cliente para começar</p>
          <button onClick={() => { setEditLead(null); setShowModal(true); }}
            className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
            <Plus size={16} /> Criar Cliente
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = filtered.filter((l) => l.status === stage.value);
              return (
                <div key={stage.value} className="w-72 flex-shrink-0"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(stage.value)}>
                  <div className={`rounded-xl border p-3 mb-2 ${stage.bgColor}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${stage.color}`}>{stage.label}</span>
                      <span className={`text-xs ${stage.color} bg-white/5 rounded-full px-2 py-0.5`}>{stageLeads.length}</span>
                    </div>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {stageLeads.map((l) => (
                      <div key={l.id}
                        draggable
                        onDragStart={() => handleDragStart(l.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setDetailLead(l)}
                        className={`glass rounded-xl p-3 cursor-pointer hover:border-accent-500/40 border border-transparent transition-all hover:-translate-y-0.5 ${draggedId === l.id ? 'opacity-50' : ''}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{l.name}</p>
                            {l.vehicle && <p className="text-xs text-accent-400 mt-0.5 truncate">{l.vehicle.brand} {l.vehicle.model} {l.vehicle.year_model || ''}</p>}
                          </div>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${scoreColor(l.lead_score)}`}>{l.lead_score}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-navy-400">
                          {l.phone && <span className="flex items-center gap-1"><Phone size={10} /> {l.phone}</span>}
                          <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(l.last_interaction_at)}</span>
                        </div>
                        {l.source && <span className="text-xs text-navy-500 mt-1 inline-block">{sourceLabel(l.source)}</span>}
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-center text-xs text-navy-600 py-8 border border-dashed border-navy-700/30 rounded-xl">Solte aqui</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">
          <div className="divide-y divide-navy-700/30">
            {filtered.map((l) => (
              <div key={l.id} className="flex items-center gap-4 p-4 hover:bg-navy-700/20 transition-all group cursor-pointer" onClick={() => setDetailLead(l)}>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${scoreColor(l.lead_score)}`}>
                  <Flame size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{l.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColorCRM(l.status)}`}>{statusLabelCRM(l.status)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-navy-400">
                    {l.vehicle && <span className="flex items-center gap-1 text-accent-400"><Car size={10} /> {l.vehicle.brand} {l.vehicle.model}</span>}
                    {l.phone && <span className="flex items-center gap-1"><Phone size={10} /> {l.phone}</span>}
                    <span>{sourceLabel(l.source)}</span>
                    <span>{timeAgo(l.last_interaction_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(l.id); }}
                    className="p-2 rounded-lg text-navy-400 hover:bg-error-500/15 hover:text-error-400 transition-all">
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className="text-navy-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && <LeadModal lead={editLead} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadData(); }} />}
      {detailLead && <LeadDetail lead={detailLead} onClose={() => setDetailLead(null)} onUpdated={loadData} />}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full animate-drop-in" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-error-500/15 flex items-center justify-center mb-4 mx-auto">
              <Trash2 size={24} className="text-error-400" />
            </div>
            <h3 className="text-lg font-bold text-white text-center">Excluir cliente?</h3>
            <p className="text-sm text-navy-400 text-center mt-2 mb-5">Todas as interações e acompanhamentos também serão removidos. Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2.5 rounded-xl bg-error-500 hover:bg-error-600 text-white text-sm font-bold transition-all">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
