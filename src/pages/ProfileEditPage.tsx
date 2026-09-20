import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle, ImagePlus, X, Store, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useDraftForm } from '@/hooks/useDraftForm';

const states = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { dealer, refreshDealer } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);
  const draftApplied = useRef(false);

  const draftData = { name, phone, email, whatsapp, cnpj, city, state, address, description, logoUrl, coverUrl };
  const { restoredData, clearDraft } = useDraftForm('profile-edit-draft', draftData, !loading);

  // Auto-restore draft on mount (before dealer data loads)
  useEffect(() => {
    if (!restoredData || draftApplied.current) return;
    draftApplied.current = true;
    setName(restoredData.name || '');
    setPhone(restoredData.phone || '');
    setEmail(restoredData.email || '');
    setWhatsapp(restoredData.whatsapp || '');
    setCnpj(restoredData.cnpj || '');
    setCity(restoredData.city || '');
    setState(restoredData.state || '');
    setAddress(restoredData.address || '');
    setDescription(restoredData.description || '');
    if (restoredData.logoUrl) setLogoUrl(restoredData.logoUrl);
    if (restoredData.coverUrl) setCoverUrl(restoredData.coverUrl);
  }, [restoredData]);

  // Load dealer data only if no draft was restored
  useEffect(() => {
    if (!dealer || initialized.current) return;
    if (draftApplied.current) { setLoading(false); return; }
    initialized.current = true;
    setName(dealer.name || '');
    setPhone(dealer.phone || '');
    setEmail(dealer.email || '');
    setWhatsapp(dealer.whatsapp || '');
    setCnpj(dealer.cnpj || '');
    setCity(dealer.city || '');
    setState(dealer.state || '');
    setAddress(dealer.address || '');
    setDescription(dealer.description || '');
    setLogoUrl(dealer.logo_url || null);
    setCoverUrl(dealer.cover_url || null);
    setLoading(false);
  }, [dealer]);

  async function uploadImage(file: File, kind: 'logo' | 'cover') {
    if (!dealer) return null;
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!ALLOWED.includes(file.type)) {
      setError('Envie apenas imagens JPG, PNG, WEBP, GIF ou AVIF.');
      return null;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 10 MB.');
      return null;
    }

    const setUploading = kind === 'logo' ? setUploadingLogo : setUploadingCover;
    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const fileName = `${dealer.id}/${kind}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('vehicle-photos').upload(fileName, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('vehicle-photos').getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (err) {
      console.error(`Erro ao enviar ${kind}:`, err);
      setError(`Não foi possível enviar a ${kind === 'logo' ? 'logo' : 'imagem de capa'}. Tente novamente.`);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, 'logo');
    if (url) setLogoUrl(url);
    e.target.value = '';
  }

  async function handleUploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, 'cover');
    if (url) setCoverUrl(url);
    e.target.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealer) return;
    setError(null);
    setSaving(true);

    if (!name.trim()) {
      setError('O nome do lojista é obrigatório');
      setSaving(false);
      return;
    }

    const { error: updateErr } = await supabase
      .from('dealers')
      .update({
        name: name.trim(),
        phone: phone || null,
        email: email || null,
        whatsapp: whatsapp || null,
        cnpj: cnpj || null,
        city: city || null,
        state: state || null,
        address: address || null,
        description: description || null,
        logo_url: logoUrl,
        cover_url: coverUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dealer.id);

    if (updateErr) {
      console.error('Erro ao salvar perfil:', updateErr);
      setError('Não foi possível salvar o perfil. Verifique os dados e tente novamente.');
      setSaving(false);
      return;
    }

    await refreshDealer();
    clearDraft();
    navigate(`/lojista/${dealer.id}`);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const inputClass = 'w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all duration-300 text-sm';

  return (
    <div className="max-w-3xl mx-auto">
      <Link to={dealer ? `/lojista/${dealer.id}` : '/dashboard'} className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors group animate-fade-in">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
      </Link>

      <div className="mb-8 animate-fade-in-down">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-500/30 blur-md rounded-full" />
            <Store size={16} className="relative text-accent-400" />
          </div>
          <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Perfil do Lojista</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Editar <span className="gradient-text">Perfil</span></h1>
        <p className="text-navy-300 text-sm mt-1">Atualize as informações que outros lojistas verão na rede</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover image */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Imagem de capa
          </h2>
          <p className="text-xs text-navy-400 mb-4">Aparece no topo do seu perfil público, atrás da logo. Recomendado: 1200x400px.</p>
          <div className="relative rounded-2xl overflow-hidden border border-navy-600/40 group">
            {coverUrl ? (
              <>
                <img src={coverUrl} alt="Capa" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl glass-strong text-white text-sm font-medium hover:bg-white/10 transition-all">
                    {uploadingCover ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                    {uploadingCover ? 'Enviando...' : 'Trocar capa'}
                    <input type="file" accept="image/*" onChange={handleUploadCover} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setCoverUrl(null)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-error-500 hover:bg-error-600 text-white text-sm font-medium transition-all"
                  >
                    <X size={16} /> Remover
                  </button>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 cursor-pointer hover:bg-navy-700/20 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                    {uploadingCover ? <Loader2 size={24} className="animate-spin text-accent-400" /> : <ImagePlus size={24} className="text-navy-300" />}
                  </div>
                  <span className="text-sm text-navy-300">Clique para adicionar uma imagem de capa</span>
                </div>
                <input type="file" accept="image/*" onChange={handleUploadCover} className="hidden" />
              </label>
            )}
          </div>
        </section>

        {/* Logo */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Logo do lojista
          </h2>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-accent-500/30 to-gold-400/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src={logoUrl} alt="Logo" className="relative w-20 h-20 rounded-2xl border border-navy-600/40 object-cover shadow-lg transition-transform duration-300 group-hover:scale-105" />
                <button
                  type="button"
                  onClick={() => setLogoUrl(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error-500 hover:bg-error-600 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-accent-500/20 to-navy-600/20 rounded-2xl blur-md" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg transition-transform duration-300 group-hover:scale-105">
                  {name?.charAt(0).toUpperCase() || '?'}
                </div>
              </div>
            )}
            <label className="group flex flex-col items-center justify-center cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-navy-600/30 text-navy-200 hover:text-white text-sm font-medium transition-all">
                {uploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                {uploadingLogo ? 'Enviando...' : logoUrl ? 'Trocar logo' : 'Enviar logo'}
              </div>
              <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
            </label>
          </div>
        </section>

        {/* Basic info */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Informações básicas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">
                Nome do lojista <span className="text-accent-400">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Auto Ribeirão" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">CNPJ</label>
              <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@lojista.com" className={inputClass} />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gold-400" style={{ boxShadow: '0 0 8px rgba(212,168,67,0.5)' }} />
            Contato
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Telefone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(16) 99999-9999" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">WhatsApp</label>
              <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="5516999999999" className={inputClass} />
              <p className="text-xs text-navy-400 mt-1">Número para contato direto da rede (com DDI, ex: 5516999999999)</p>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-success-400" style={{ boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
            Localização
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Cidade</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: Ribeirão Preto" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Estado</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
                <option value="">Selecione</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Endereço</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro" className={inputClass} />
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Sobre o lojista
          </h2>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Conte um pouco sobre seu negócio, quanto tempo está no mercado, especialidades..." className={`${inputClass} resize-none`} />
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link to={dealer ? `/lojista/${dealer.id}` : '/dashboard'} className="px-5 py-3 rounded-xl text-navy-200 hover:bg-navy-700/40 font-medium text-sm transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-shine flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Salvar perfil
          </button>
        </div>
      </form>
    </div>
  );
}
