import { useEffect, useState } from 'react';
import { Plus, Users, AlertCircle, X, Loader2, Pencil, Trash2, Phone, Mail, FileText, MapPin, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type ClientRecord } from '@/lib/supabase';
import { formatDate } from '@/lib/format';

export function ClientsPage() {
  const { dealer } = useAuth();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<ClientRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('dealer_id', dealer.id)
        .order('created_at', { ascending: false });
      if (error) { console.error('Erro ao carregar clientes:', error); setError('Não foi possível carregar os clientes. Tente novamente.'); }
      else setClients(data as ClientRecord[]);
      setLoading(false);
    }
    load();
  }, [dealer]);

  async function loadData() {
    if (!dealer) return;
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('dealer_id', dealer.id)
      .order('created_at', { ascending: false });
    if (data) setClients(data as ClientRecord[]);
  }

  function openModal(client?: ClientRecord) {
    if (client) {
      setEditClient(client);
      setName(client.name);
      setPhone(client.phone || '');
      setEmail(client.email || '');
      setDocument(client.document || '');
      setAddress(client.address || '');
      setNotes(client.notes || '');
      setStatus(client.status);
    } else {
      setEditClient(null);
      setName('');
      setPhone('');
      setEmail('');
      setDocument('');
      setAddress('');
      setNotes('');
      setStatus('active');
    }
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealer) return;
    setError(null);
    setSaving(true);

    if (!name.trim()) {
      setError('Nome é obrigatório');
      setSaving(false);
      return;
    }

    const payload = {
      dealer_id: dealer.id,
      name: name.trim(),
      phone: phone || null,
      email: email || null,
      document: document || null,
      address: address || null,
      notes: notes || null,
      status,
    };

    if (editClient) {
      const { error } = await supabase.from('clients').update(payload).eq('id', editClient.id);
      if (error) { console.error('Erro ao salvar cliente:', error); setError('Não foi possível salvar o cliente. Verifique os dados e tente novamente.'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('clients').insert(payload);
      if (error) { console.error('Erro ao cadastrar cliente:', error); setError('Não foi possível cadastrar o cliente. Verifique os dados e tente novamente.'); setSaving(false); return; }
    }

    setSaving(false);
    setShowModal(false);
    await loadData();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) { console.error('Erro ao excluir cliente:', error); setError('Não foi possível excluir o cliente. Tente novamente.'); return; }
    setClients((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
  }

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.phone?.includes(s) || c.email?.toLowerCase().includes(s) || c.document?.includes(s);
  });

  const activeCount = clients.filter((c) => c.status === 'active').length;

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
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">CRM</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Clientes</h1>
          <p className="text-navy-300 text-sm mt-1">{clients.length} cliente(s) · {activeCount} ativo(s)</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 text-sm group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Novo cliente
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative group mb-6 animate-fade-in input-anim">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, telefone, e-mail ou documento..."
          className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center hover-lift animate-fade-in-scale">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-accent-500/20 blur-2xl rounded-full animate-breathe" />
            <Users size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">
            {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum resultado'}
          </p>
          <p className="text-sm text-navy-400 mt-1">
            {clients.length === 0 ? 'Cadastre seus clientes para manter um histórico' : 'Tente ajustar a busca'}
          </p>
          {clients.length === 0 && (
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium text-sm transition-all border border-accent-500/20 group hover:scale-105 duration-300"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              Cadastrar primeiro cliente
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client, i) => (
            <div
              key={client.id}
              className="group glass-card rounded-2xl p-5 hover-lift card-glow animate-fade-in-up spotlight"
              style={{ animationDelay: `${i * 50}ms` }}
              onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent-500/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform duration-300">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{client.name}</p>
                    <p className="text-xs text-navy-400">Desde {formatDate(client.created_at)}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  client.status === 'active'
                    ? 'bg-success-500/15 text-success-400 border-success-500/30'
                    : 'bg-navy-600/30 text-navy-300 border-navy-500/30'
                }`}>
                  {client.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="space-y-2">
                {client.phone && (
                  <div className="flex items-center gap-2 text-xs text-navy-200">
                    <Phone size={12} className="text-navy-400 flex-shrink-0" /> {client.phone}
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-xs text-navy-200">
                    <Mail size={12} className="text-navy-400 flex-shrink-0" /> <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.document && (
                  <div className="flex items-center gap-2 text-xs text-navy-200">
                    <FileText size={12} className="text-navy-400 flex-shrink-0" /> {client.document}
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-xs text-navy-200">
                    <MapPin size={12} className="text-navy-400 flex-shrink-0" /> <span className="truncate">{client.address}</span>
                  </div>
                )}
              </div>

              {client.notes && (
                <p className="text-xs text-navy-400 mt-3 pt-3 border-t border-navy-600/30 italic line-clamp-2">"{client.notes}"</p>
              )}

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-navy-600/30">
                <button onClick={() => openModal(client)} className="flex-1 flex items-center justify-center gap-1.5 glass hover:bg-accent-500/15 text-navy-200 hover:text-accent-400 text-xs font-medium py-2 rounded-lg transition-all hover:scale-[1.02] active:scale-95">
                  <Pencil size={14} /> Editar
                </button>
                <button onClick={() => setDeleteId(client.id)} className="flex items-center justify-center glass hover:bg-error-500/15 text-navy-200 hover:text-error-400 p-2 rounded-lg transition-all hover:scale-110 active:scale-95">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="glass-strong rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-drop-in border border-navy-600/30 relative" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center justify-between p-6 border-b border-navy-600/20 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
              <h2 className="text-lg font-bold text-white">{editClient ? 'Editar cliente' : 'Novo cliente'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-navy-300 hover:bg-navy-700/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Nome *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do cliente" required className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Telefone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(16) 99999-9999" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Documento</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input type="text" value={document} onChange={(e) => setDocument(e.target.value)} placeholder="CPF/CNPJ" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Endereço</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro..." className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Observações</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Preferências, histórico, etc..." className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500">
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/40 text-sm font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-shine flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {editClient ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete */}
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
            <h3 className="text-lg font-bold text-white">Excluir cliente?</h3>
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
    </div>
  );
}
