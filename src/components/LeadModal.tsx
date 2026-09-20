import { useEffect, useState, useRef } from 'react';
import { X, Save, MessageSquare, Phone, Mail, User, Car, Tag, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type LeadSource, type LeadStatus, type Lead, type Vehicle, type ClientRecord } from '@/lib/supabase';
import { LEAD_SOURCES, PIPELINE_STAGES } from '@/lib/crm';
import { formatCurrency } from '@/lib/format';
import { useDraftForm } from '@/hooks/useDraftForm';

type Props = {
  lead?: Lead | null;
  onClose: () => void;
  onSaved: () => void;
};

export function LeadModal({ lead, onClose, onSaved }: Props) {
  const { dealer } = useAuth();
  const [name, setName] = useState(lead?.name || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [email, setEmail] = useState(lead?.email || '');
  const [source, setSource] = useState<LeadSource>(lead?.source || 'whatsapp');
  const [sourceDetail, setSourceDetail] = useState(lead?.source_detail || '');
  const [status, setStatus] = useState<LeadStatus>(lead?.status || 'new');
  const [leadScore, setLeadScore] = useState(lead?.lead_score ?? 50);
  const [vehicleId, setVehicleId] = useState<string>(lead?.vehicle_id || '');
  const [clientId, setClientId] = useState<string>(lead?.client_id || '');
  const [budget, setBudget] = useState(lead?.budget?.toString() || '');
  const [downPayment, setDownPayment] = useState(lead?.down_payment?.toString() || '');
  const [maxInstallment, setMaxInstallment] = useState(lead?.max_installment?.toString() || '');
  const [notes, setNotes] = useState(lead?.notes || '');
  const [assignedTo, setAssignedTo] = useState(lead?.assigned_to || '');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draftApplied = useRef(false);
  const isEditMode = !!lead;

  const draftData = { name, phone, email, source, sourceDetail, status, leadScore, vehicleId, clientId, budget, downPayment, maxInstallment, notes, assignedTo };
  const { restoredData, clearDraft } = useDraftForm('lead-modal-draft', draftData, !isEditMode);

  // Auto-restore draft for new leads only
  useEffect(() => {
    if (!restoredData || draftApplied.current || isEditMode) return;
    draftApplied.current = true;
    if (restoredData.name) setName(restoredData.name);
    if (restoredData.phone) setPhone(restoredData.phone);
    if (restoredData.email) setEmail(restoredData.email);
    if (restoredData.source) setSource(restoredData.source);
    if (restoredData.sourceDetail) setSourceDetail(restoredData.sourceDetail);
    if (restoredData.status) setStatus(restoredData.status);
    if (typeof restoredData.leadScore === 'number') setLeadScore(restoredData.leadScore);
    if (restoredData.vehicleId) setVehicleId(restoredData.vehicleId);
    if (restoredData.budget) setBudget(restoredData.budget);
    if (restoredData.downPayment) setDownPayment(restoredData.downPayment);
    if (restoredData.maxInstallment) setMaxInstallment(restoredData.maxInstallment);
    if (restoredData.notes) setNotes(restoredData.notes);
    if (restoredData.assignedTo) setAssignedTo(restoredData.assignedTo);
  }, [restoredData, isEditMode]);

  useEffect(() => {
    if (!dealer) return;
    supabase.from('vehicles').select('*').eq('dealer_id', dealer.id).neq('status', 'sold').order('created_at', { ascending: false })
      .then(({ data }) => data && setVehicles(data as Vehicle[]));
    supabase.from('clients').select('*').eq('dealer_id', dealer.id).order('created_at', { ascending: false })
      .then(({ data }) => data && setClients(data as ClientRecord[]));
  }, [dealer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealer) return;
    if (!name.trim()) { setError('Nome é obrigatório'); return; }
    setSaving(true);
    setError(null);

    let resolvedClientId = clientId || null;

    if (!resolvedClientId && (phone || email)) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('dealer_id', dealer.id)
        .or(`phone.eq.${phone},email.eq.${email}`)
        .maybeSingle();
      if (existing) resolvedClientId = existing.id;
    }

    if (!resolvedClientId) {
      const { data: newClient, error: cErr } = await supabase
        .from('clients')
        .insert({
          dealer_id: dealer.id,
          name: name.trim(),
          phone: phone || null,
          email: email || null,
          status: 'active',
        })
        .select('id')
        .single();
      if (cErr) { setError('Erro ao criar cliente: ' + cErr.message); setSaving(false); return; }
      resolvedClientId = newClient.id;
    }

    const payload = {
      dealer_id: dealer.id,
      client_id: resolvedClientId,
      vehicle_id: vehicleId || null,
      name: name.trim(),
      phone: phone || null,
      email: email || null,
      source,
      source_detail: sourceDetail || null,
      status,
      lead_score: Number(leadScore),
      budget: budget ? Number(budget) : null,
      down_payment: downPayment ? Number(downPayment) : null,
      max_installment: maxInstallment ? Number(maxInstallment) : null,
      notes: notes || null,
      assigned_to: assignedTo || null,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (lead) {
      result = await supabase.from('leads').update(payload).eq('id', lead.id).select('*').single();
    } else {
      result = await supabase.from('leads').insert(payload).select('*').single();
    }

    if (result.error) { setError(result.error.message); setSaving(false); return; }
    clearDraft();
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div className="glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-drop-in border border-accent-500/20 relative" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-navy-400 hover:bg-navy-700/50 hover:text-white transition-all z-10">
          <X size={18} />
        </button>
        <div className="p-6 pb-4 border-b border-navy-600/30">
          <h3 className="text-lg font-bold text-white">{lead ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <p className="text-sm text-navy-400 mt-0.5">Capture um novo prospecto no CRM</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><User size={12} /> Nome *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nome do cliente"
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Phone size={12} /> WhatsApp</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000"
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Mail size={12} /> E-mail</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="cliente@email.com"
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Tag size={12} /> Cliente existente</label>
              <select value={clientId} onChange={(e) => {
                setClientId(e.target.value);
                const c = clients.find((c) => c.id === e.target.value);
                if (c) { setName(c.name); setPhone(c.phone || ''); setEmail(c.email || ''); }
              }} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
                <option value="">Novo cliente</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Origem</label>
              <select value={source} onChange={(e) => setSource(e.target.value as LeadSource)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
                {LEAD_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Detalhe da origem</label>
              <input value={sourceDetail} onChange={(e) => setSourceDetail(e.target.value)} placeholder="Anúncio, campanha, etc."
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Car size={12} /> Veículo de interesse</label>
              <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
                <option value="">Nenhum</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.brand} {v.model} {v.year_model || ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Status no funil</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
                {PIPELINE_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Pontuação: <span className="text-accent-400">{leadScore}/100</span></label>
            <input type="range" min="0" max="100" value={leadScore} onChange={(e) => setLeadScore(Number(e.target.value))} className="w-full accent-accent-500 cursor-pointer" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><DollarSign size={12} /> Orçamento</label>
              <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" placeholder="R$ 80.000"
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Entrada</label>
              <input value={downPayment} onChange={(e) => setDownPayment(e.target.value)} type="number" placeholder="R$ 20.000"
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Parcela máx.</label>
              <input value={maxInstallment} onChange={(e) => setMaxInstallment(e.target.value)} type="number" placeholder="R$ 1.800"
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Vendedor responsável</label>
            <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Nome do vendedor"
              className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><MessageSquare size={12} /> Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notas sobre o cliente..."
              className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 resize-none" />
          </div>

          <div className="flex items-center gap-3 justify-end pt-2 border-t border-navy-600/30">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-shine ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-accent-500/25 hover:-translate-y-0.5 disabled:opacity-50">
              <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
