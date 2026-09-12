import { useEffect, useState } from 'react';
import {
  X, Phone, Mail, Car, Plus, Clock, CheckCircle2, ChevronRight,
  MessageSquare, Calendar, Flame, TrendingUp, User, Tag, DollarSign, Trash2,
} from 'lucide-react';
import { supabase, type Lead, type LeadInteraction, type LeadFollowUp, type InteractionType, type FollowUpType, type LeadStatus } from '@/lib/supabase';
import {
  PIPELINE_STAGES, INTERACTION_TYPES, FOLLOW_UP_TYPES,
  interactionLabel, followUpTypeLabel, sourceLabel, scoreColor, scoreLabel, timeAgo, isOverdue,
} from '@/lib/crm';
import { formatCurrency, formatDate, formatCurrency as fc } from '@/lib/format';

type Props = {
  lead: Lead;
  onClose: () => void;
  onUpdated: () => void;
};

export function LeadDetail({ lead, onClose, onUpdated }: Props) {
  const [tab, setTab] = useState<'info' | 'interactions' | 'followups'>('info');
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInteraction, setNewInteraction] = useState({ type: 'whatsapp' as InteractionType, description: '' });
  const [newFollowUp, setNewFollowUp] = useState({ type: 'whatsapp' as FollowUpType, message: '', scheduledAt: '' });
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [vehicleLabel, setVehicleLabel] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
  }, [lead.id]);

  async function loadDetails() {
    setLoading(true);
    const [iRes, fRes] = await Promise.all([
      supabase.from('lead_interactions').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false }),
      supabase.from('lead_follow_ups').select('*').eq('lead_id', lead.id).order('scheduled_at', { ascending: false }),
    ]);
    if (iRes.data) setInteractions(iRes.data as LeadInteraction[]);
    if (fRes.data) setFollowUps(fRes.data as LeadFollowUp[]);
    if (lead.vehicle_id) {
      const { data: v } = await supabase.from('vehicles').select('brand, model, year_model, asking_price').eq('id', lead.vehicle_id).maybeSingle();
      if (v) setVehicleLabel(`${v.brand} ${v.model} ${v.year_model || ''} — ${fc(Number(v.asking_price))}`);
    }
    setLoading(false);
  }

  async function addInteraction() {
    if (!newInteraction.description.trim()) return;
    const { data, error } = await supabase.from('lead_interactions').insert({
      lead_id: lead.id,
      dealer_id: lead.dealer_id,
      type: newInteraction.type,
      description: newInteraction.description.trim(),
      vehicle_id: lead.vehicle_id,
    }).select('*').single();
    if (!error && data) {
      setInteractions([data as LeadInteraction, ...interactions]);
      await supabase.from('leads').update({ last_interaction_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', lead.id);
      setNewInteraction({ type: 'whatsapp', description: '' });
      setShowAddInteraction(false);
      onUpdated();
    }
  }

  async function addFollowUp() {
    if (!newFollowUp.scheduledAt || !newFollowUp.message.trim()) return;
    const { data, error } = await supabase.from('lead_follow_ups').insert({
      lead_id: lead.id,
      dealer_id: lead.dealer_id,
      scheduled_at: new Date(newFollowUp.scheduledAt).toISOString(),
      message: newFollowUp.message.trim(),
      type: newFollowUp.type,
      status: 'pending',
    }).select('*').single();
    if (!error && data) {
      setFollowUps([data as LeadFollowUp, ...followUps]);
      setNewFollowUp({ type: 'whatsapp', message: '', scheduledAt: '' });
      setShowAddFollowUp(false);
      onUpdated();
    }
  }

  async function completeFollowUp(id: string) {
    const { error } = await supabase.from('lead_follow_ups').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', id);
    if (!error) {
      setFollowUps(followUps.map((f) => f.id === id ? { ...f, status: 'done', completed_at: new Date().toISOString() } : f));
      onUpdated();
    }
  }

  async function skipFollowUp(id: string) {
    const { error } = await supabase.from('lead_follow_ups').update({ status: 'skipped' }).eq('id', id);
    if (!error) {
      setFollowUps(followUps.map((f) => f.id === id ? { ...f, status: 'skipped' } : f));
      onUpdated();
    }
  }

  async function changeStatus(newStatus: LeadStatus) {
    const { error } = await supabase.from('leads').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', lead.id);
    if (!error) onUpdated();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-strong w-full max-w-lg h-full overflow-y-auto animate-slide-in-right border-l border-accent-500/20" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-20 glass-strong border-b border-navy-600/30 p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white truncate">{lead.name}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColor(lead.lead_score)} flex items-center gap-1`}>
                  <Flame size={10} /> {lead.lead_score}
                </span>
              </div>
              <p className="text-xs text-navy-400">{sourceLabel(lead.source)} · {scoreLabel(lead.lead_score)}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-navy-400 hover:bg-navy-700/50 hover:text-white transition-all flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Quick info */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            {lead.phone && <a href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-navy-200 hover:text-success-400 transition-colors"><Phone size={12} /> {lead.phone}</a>}
            {lead.email && <span className="flex items-center gap-1.5 text-navy-200"><Mail size={12} /> {lead.email}</span>}
            {lead.assigned_to && <span className="flex items-center gap-1.5 text-navy-200"><User size={12} /> {lead.assigned_to}</span>}
          </div>

          {/* Status changer */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {PIPELINE_STAGES.map((s) => (
              <button key={s.value} onClick={() => changeStatus(s.value)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all hover:scale-105 ${
                  lead.status === s.value ? s.bgColor + ' ' + s.color + ' font-semibold' : 'border-navy-600/30 text-navy-400 hover:text-white'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-navy-600/30 px-5">
          {(['info', 'interactions', 'followups'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === t ? 'border-accent-500 text-accent-400' : 'border-transparent text-navy-400 hover:text-white'
              }`}>
              {t === 'info' ? 'Informações' : t === 'interactions' ? `Interações (${interactions.length})` : `Acompanhamentos (${followUps.filter((f) => f.status === 'pending').length})`}
            </button>
          ))}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
          ) : (
            <>
              {tab === 'info' && (
                <div className="space-y-4 animate-fade-in">
                  {vehicleLabel && (
                    <div className="glass rounded-xl p-3 flex items-center gap-3">
                      <Car size={18} className="text-accent-400 flex-shrink-0" />
                      <div><p className="text-xs text-navy-400">Veículo de interesse</p><p className="text-sm text-white font-medium">{vehicleLabel}</p></div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {lead.budget != null && <div className="glass rounded-xl p-3"><p className="text-xs text-navy-400 uppercase">Orçamento</p><p className="text-sm text-white font-bold">{formatCurrency(Number(lead.budget))}</p></div>}
                    {lead.down_payment != null && <div className="glass rounded-xl p-3"><p className="text-xs text-navy-400 uppercase">Entrada</p><p className="text-sm text-white font-bold">{formatCurrency(Number(lead.down_payment))}</p></div>}
                    {lead.max_installment != null && <div className="glass rounded-xl p-3"><p className="text-xs text-navy-400 uppercase">Parcela máx.</p><p className="text-sm text-white font-bold">{formatCurrency(Number(lead.max_installment))}</p></div>}
                  </div>
                  {lead.source_detail && <div className="glass rounded-xl p-3"><p className="text-xs text-navy-400 uppercase mb-1 flex items-center gap-1"><Tag size={10} /> Detalhe da origem</p><p className="text-sm text-white">{lead.source_detail}</p></div>}
                  {lead.notes && <div className="glass rounded-xl p-3"><p className="text-xs text-navy-400 uppercase mb-1 flex items-center gap-1"><MessageSquare size={10} /> Observações</p><p className="text-sm text-white whitespace-pre-wrap">{lead.notes}</p></div>}
                  <div className="glass rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
                    <div><p className="text-navy-400">Criado em</p><p className="text-white font-medium">{formatDate(lead.created_at)}</p></div>
                    <div><p className="text-navy-400">Última interação</p><p className="text-white font-medium">{timeAgo(lead.last_interaction_at)}</p></div>
                  </div>
                </div>
              )}

              {tab === 'interactions' && (
                <div className="space-y-3 animate-fade-in">
                  {showAddInteraction ? (
                    <div className="glass rounded-xl p-3 space-y-2">
                      <select value={newInteraction.type} onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as InteractionType })}
                        className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500">
                        {INTERACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <textarea value={newInteraction.description} onChange={(e) => setNewInteraction({ ...newInteraction, description: e.target.value })} rows={2} placeholder="Descreva a interação..."
                        className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => setShowAddInteraction(false)} className="px-3 py-1.5 rounded-lg text-navy-300 hover:bg-navy-700/50 text-xs">Cancelar</button>
                        <button onClick={addInteraction} className="px-3 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-400 text-white text-xs font-semibold">Adicionar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddInteraction(true)} className="w-full flex items-center justify-center gap-2 glass rounded-xl py-2.5 text-sm text-accent-400 hover:border-accent-500/40 border border-transparent transition-all">
                      <Plus size={16} /> Registrar interação
                    </button>
                  )}
                  {interactions.length === 0 ? (
                    <p className="text-center text-navy-500 text-sm py-6">Nenhuma interação registrada</p>
                  ) : (
                    interactions.map((i) => (
                      <div key={i.id} className="glass rounded-xl p-3 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center flex-shrink-0">
                          <MessageSquare size={14} className="text-accent-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white">{interactionLabel(i.type)}</p>
                            <span className="text-xs text-navy-500">{formatDate(i.created_at)}</span>
                          </div>
                          {i.description && <p className="text-sm text-navy-300 mt-1 whitespace-pre-wrap">{i.description}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'followups' && (
                <div className="space-y-3 animate-fade-in">
                  {showAddFollowUp ? (
                    <div className="glass rounded-xl p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <select value={newFollowUp.type} onChange={(e) => setNewFollowUp({ ...newFollowUp, type: e.target.value as FollowUpType })}
                          className="bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500">
                          {FOLLOW_UP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <input type="datetime-local" value={newFollowUp.scheduledAt} onChange={(e) => setNewFollowUp({ ...newFollowUp, scheduledAt: e.target.value })}
                          className="bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500 [color-scheme:dark]" />
                      </div>
                      <textarea value={newFollowUp.message} onChange={(e) => setNewFollowUp({ ...newFollowUp, message: e.target.value })} rows={2} placeholder="Mensagem do follow-up..."
                        className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => setShowAddFollowUp(false)} className="px-3 py-1.5 rounded-lg text-navy-300 hover:bg-navy-700/50 text-xs">Cancelar</button>
                        <button onClick={addFollowUp} className="px-3 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-400 text-white text-xs font-semibold">Agendar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddFollowUp(true)} className="w-full flex items-center justify-center gap-2 glass rounded-xl py-2.5 text-sm text-gold-400 hover:border-gold-500/40 border border-transparent transition-all">
                      <Plus size={16} /> Agendar acompanhamento
                    </button>
                  )}
                  {followUps.length === 0 ? (
                    <p className="text-center text-navy-500 text-sm py-6">Nenhum acompanhamento agendado</p>
                  ) : (
                    followUps.map((f) => (
                      <div key={f.id} className={`glass rounded-xl p-3 ${isOverdue(f.scheduled_at, f.status) ? 'border-error-500/30' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar size={12} className={isOverdue(f.scheduled_at, f.status) ? 'text-error-400' : 'text-navy-400'} />
                              <span className="text-xs font-medium text-white">{followUpTypeLabel(f.type)}</span>
                              {f.ai_suggested && <span className="text-xs text-gold-400 flex items-center gap-0.5"><Flame size={10} /> IA</span>}
                              {isOverdue(f.scheduled_at, f.status) && <span className="text-xs text-error-400 font-medium">Atrasado</span>}
                            </div>
                            {f.message && <p className="text-sm text-navy-300 mb-2">{f.message}</p>}
                            <p className="text-xs text-navy-500">{formatDate(f.scheduled_at)} · {new Date(f.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          {f.status === 'pending' && (
                            <div className="flex flex-col gap-1 flex-shrink-0">
                              <button onClick={() => completeFollowUp(f.id)} className="p-1.5 rounded-lg bg-success-500/15 hover:bg-success-500/25 text-success-400 transition-all" title="Concluir">
                                <CheckCircle2 size={14} />
                              </button>
                              <button onClick={() => skipFollowUp(f.id)} className="p-1.5 rounded-lg bg-navy-700/50 hover:bg-navy-600/50 text-navy-400 transition-all" title="Pular">
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          )}
                          {f.status === 'done' && <span className="text-xs text-success-400 flex items-center gap-1 flex-shrink-0"><CheckCircle2 size={12} /> Concluído</span>}
                          {f.status === 'skipped' && <span className="text-xs text-navy-500 flex-shrink-0">Ignorado</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
