import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Save, Loader2, AlertCircle, ImagePlus, X, Eye, Rocket, Palette, Share2, Copy, Check, ChevronRight, Layout as LayoutIcon, Type, Smartphone, Monitor, Sparkles, Zap, ExternalLink, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type DealerSite, type SiteTemplate, type SiteData, type Vehicle, type VehiclePhoto } from '@/lib/supabase';
import { TEMPLATE_OPTIONS, renderTemplate } from '@/components/site-templates';

export function SiteBuilderPage() {
  const { dealer } = useAuth();
  const [site, setSite] = useState<DealerSite | null>(null);
  const [vehicles, setVehicles] = useState<(Vehicle & { photos: VehiclePhoto[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'template' | 'content' | 'design' | 'social' | 'domain'>('template');
  const [hoveredTemplate, setHoveredTemplate] = useState<SiteTemplate | null>(null);
  const initialized = useRef(false);

  const [siteData, setSiteData] = useState<SiteData>({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    aboutTitle: '',
    aboutText: '',
    aboutImage: '',
    primaryColor: '',
    secondaryColor: '',
    showAboutSection: true,
    showStatsSection: true,
    showContactSection: true,
    showSocialLinks: true,
    customFooterText: '',
    social: {},
  });

  useEffect(() => {
    if (!dealer || initialized.current) return;
    initialized.current = true;
    loadData();
  }, [dealer]);

  async function loadData() {
    if (!dealer) return;
    try {
      const [siteRes, vehRes] = await Promise.all([
        supabase.from('dealer_sites').select('*').eq('dealer_id', dealer.id).maybeSingle(),
        supabase.from('vehicles').select('*').eq('dealer_id', dealer.id).order('created_at', { ascending: false }),
      ]);

      if (siteRes.data) {
        const s = siteRes.data as DealerSite;
        setSite(s);
        setSiteData({
          heroTitle: s.site_data.heroTitle || '',
          heroSubtitle: s.site_data.heroSubtitle || '',
          heroImage: s.site_data.heroImage || '',
          aboutTitle: s.site_data.aboutTitle || '',
          aboutText: s.site_data.aboutText || '',
          aboutImage: s.site_data.aboutImage || '',
          primaryColor: s.site_data.primaryColor || '',
          secondaryColor: s.site_data.secondaryColor || '',
          showAboutSection: s.site_data.showAboutSection !== false,
          showStatsSection: s.site_data.showStatsSection !== false,
          showContactSection: s.site_data.showContactSection !== false,
          showSocialLinks: s.site_data.showSocialLinks !== false,
          customFooterText: s.site_data.customFooterText || '',
          social: s.site_data.social || {},
        });
      } else {
        const defaultSlug = dealer.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'minha-loja';
        setSiteData((prev) => ({ ...prev, heroTitle: dealer.name, heroSubtitle: 'Os melhores seminovos da região' }));
        setSite({ id: '', dealer_id: dealer.id, template: 'classic', slug: defaultSlug, is_published: false, site_data: {} as SiteData, custom_domain: null, created_at: '', updated_at: '' } as DealerSite);
      }

      const vehicleRows = (vehRes.data || []) as Vehicle[];
      const ids = vehicleRows.map((v) => v.id);
      const photosMap = new Map<string, VehiclePhoto[]>();
      if (ids.length > 0) {
        const { data: photoData } = await supabase.from('vehicle_photos').select('*').in('vehicle_id', ids);
        for (const p of (photoData || []) as VehiclePhoto[]) {
          const list = photosMap.get(p.vehicle_id) || [];
          list.push(p);
          photosMap.set(p.vehicle_id, list);
        }
      }
      setVehicles(vehicleRows.map((v) => ({ ...v, photos: photosMap.get(v.id) || [] })));
    } catch (err) {
      console.error('Erro ao carregar site:', err);
      setError('Não foi possível carregar os dados do site.');
    } finally {
      setLoading(false);
    }
  }

  async function uploadImage(file: File, kind: 'hero' | 'about') {
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
    const setUploading = kind === 'hero' ? setUploadingHero : setUploadingAbout;
    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const fileName = `${dealer.id}/site-${kind}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('vehicle-photos').upload(fileName, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('vehicle-photos').getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (err) {
      console.error(`Erro ao enviar ${kind}:`, err);
      setError(`Não foi possível enviar a imagem. Tente novamente.`);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleUploadHero(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, 'hero');
    if (url) setSiteData((prev) => ({ ...prev, heroImage: url }));
    e.target.value = '';
  }

  async function handleUploadAbout(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, 'about');
    if (url) setSiteData((prev) => ({ ...prev, aboutImage: url }));
    e.target.value = '';
  }

  async function handleSave() {
    if (!dealer || !site) return;
    setError(null);
    setSaving(true);
    try {
      const payload = { template: site.template, slug: site.slug, custom_domain: site.custom_domain || null, site_data: siteData as unknown as Record<string, unknown>, updated_at: new Date().toISOString() };
      if (site.id) {
        const { error: updErr } = await supabase.from('dealer_sites').update(payload).eq('id', site.id);
        if (updErr) throw updErr;
      } else {
        const { data, error: insErr } = await supabase.from('dealer_sites').insert({ dealer_id: dealer.id, ...payload }).select('*').single();
        if (insErr) throw insErr;
        setSite(data as DealerSite);
      }
    } catch (err) {
      console.error('Erro ao salvar site:', err);
      setError('Não foi possível salvar o site. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish() {
    if (!site || !site.id) {
      setError('Salve o site antes de publicar.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const newPub = !site.is_published;
      const { error: updErr } = await supabase.from('dealer_sites').update({ is_published: newPub, updated_at: new Date().toISOString() }).eq('id', site.id);
      if (updErr) throw updErr;
      setSite({ ...site, is_published: newPub });
    } catch (err) {
      console.error('Erro ao publicar/despublicar:', err);
      setError('Não foi possível alterar a publicação do site.');
    } finally {
      setSaving(false);
    }
  }

  function handleCopyLink() {
    if (!site) return;
    const url = `${window.location.origin}/site/${site.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (previewMode && site) {
    return (
      <div className="fixed inset-0 z-50 bg-navy-950 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 glass-strong border-b border-navy-600/20">
          <div className="flex items-center gap-3">
            <button onClick={() => setPreviewMode(false)} className="flex items-center gap-2 text-navy-200 hover:text-white text-sm transition-colors">
              <X size={18} /> Fechar preview
            </button>
            <div className="flex items-center gap-1 ml-4">
              <button onClick={() => setDeviceView('desktop')} className={`p-2 rounded-lg transition-colors ${deviceView === 'desktop' ? 'bg-accent-500/20 text-accent-300' : 'text-navy-300 hover:bg-navy-700/40'}`}>
                <Monitor size={18} />
              </button>
              <button onClick={() => setDeviceView('mobile')} className={`p-2 rounded-lg transition-colors ${deviceView === 'mobile' ? 'bg-accent-500/20 text-accent-300' : 'text-navy-300 hover:bg-navy-700/40'}`}>
                <Smartphone size={18} />
              </button>
            </div>
          </div>
          <div className="text-xs text-navy-400">Pré-visualização do site</div>
        </div>
        <div className="flex-1 overflow-y-auto flex justify-center bg-navy-900">
          <div className={deviceView === 'mobile' ? 'w-[375px] bg-white shadow-2xl' : 'w-full'}>
            {renderTemplate({ dealer: dealer!, site, siteData, vehicles })}
          </div>
        </div>
      </div>
    );
  }

  const inputClass = 'w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all duration-300 text-sm';
  const labelClass = 'block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide';
  const tabClass = (tab: string) => `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'bg-accent-500/15 text-accent-300 border border-accent-500/20' : 'text-navy-200 hover:bg-navy-700/40 hover:text-white'}`;
  const publicUrl = site ? `${window.location.origin}/site/${site.slug}` : '';

  // Mini preview component for template cards
  function TemplateMiniPreview({ templateId, accent }: { templateId: SiteTemplate; accent: string }) {
    return (
      <div className="h-40 relative overflow-hidden rounded-xl" style={{ background: templateId === 'dark' ? '#0f0f17' : templateId === 'luxury' ? '#0a0a0a' : templateId === 'magazine' ? '#fff' : '#f9fafb' }}>
        {/* Header bar */}
        <div className="h-6 flex items-center px-3 gap-1.5" style={{ background: templateId === 'classic' ? '#fff' : templateId === 'sport' ? accent : templateId === 'magazine' ? '#fff' : 'transparent' }}>
          <div className="w-4 h-4 rounded" style={{ background: accent }} />
          <div className="h-1.5 w-12 rounded-full" style={{ background: templateId === 'dark' || templateId === 'luxury' ? '#fff3' : '#0003' }} />
          <div className="ml-auto flex gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: accent, opacity: 0.5 }} />
            <div className="w-2 h-2 rounded-full" style={{ background: accent, opacity: 0.5 }} />
          </div>
        </div>
        {/* Hero area */}
        <div className="h-16 relative" style={{ background: templateId === 'dark' ? `radial-gradient(ellipse at top, ${accent}40, transparent)` : templateId === 'luxury' ? 'linear-gradient(to bottom, #1a1a1a, #0a0a0a)' : templateId === 'highway' ? `linear-gradient(120deg, #0f172a, ${accent})` : templateId === 'magazine' ? 'transparent' : `linear-gradient(135deg, ${accent}, ${accent}aa)` }}>
          <div className="absolute bottom-2 left-3">
            <div className="h-2 w-16 rounded-full bg-white/80 mb-1" />
            <div className="h-1.5 w-10 rounded-full bg-white/40" />
          </div>
        </div>
        {/* Content cards */}
        <div className="p-2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 h-10 rounded-lg border" style={{ background: templateId === 'dark' || templateId === 'luxury' ? 'rgba(255,255,255,0.03)' : '#fff', borderColor: templateId === 'dark' || templateId === 'luxury' ? 'rgba(255,255,255,0.05)' : '#eee' }}>
              <div className="h-5 rounded-t-lg" style={{ background: `${accent}30` }} />
              <div className="px-1 pt-1">
                <div className="h-1 w-full rounded-full" style={{ background: templateId === 'dark' || templateId === 'luxury' ? '#fff2' : '#0001' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors group animate-fade-in">
        <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Voltar
      </Link>

      <div className="mb-8 animate-fade-in-down">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-500/30 blur-md rounded-full" />
            <Globe size={16} className="relative text-accent-400" />
          </div>
          <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Construtor de Site</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Meu <span className="gradient-text">Site</span></h1>
        <p className="text-navy-300 text-sm mt-1">Crie e personalize o site da sua loja com seu estoque integrado</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Status bar */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${site?.is_published ? 'bg-success-400 animate-pulse' : 'bg-navy-500'}`} />
          <div>
            <p className="text-sm font-semibold text-white">{site?.is_published ? 'Site publicado' : 'Site não publicado'}</p>
            {publicUrl && <p className="text-xs text-navy-400 truncate max-w-xs">{publicUrl}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {site?.is_published && (
            <button onClick={handleCopyLink} className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-navy-600/30 text-navy-200 hover:text-white text-xs font-medium transition-all">
              {copied ? <Check size={14} className="text-success-400" /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
          )}
          <button onClick={() => setPreviewMode(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-navy-600/30 text-navy-200 hover:text-white text-xs font-medium transition-all">
            <Eye size={14} /> Preview
          </button>
          <button onClick={togglePublish} disabled={saving || !site?.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all disabled:opacity-50 ${site?.is_published ? 'bg-error-500 hover:bg-error-600' : 'bg-gradient-to-r from-success-500 to-success-600 hover:from-success-400 hover:to-success-500'}`}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
            {site?.is_published ? 'Despublicar' : 'Publicar'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 animate-fade-in-up">
        <button onClick={() => setActiveTab('template')} className={tabClass('template')}><LayoutIcon size={16} /> Templates</button>
        <button onClick={() => setActiveTab('content')} className={tabClass('content')}><Type size={16} /> Conteúdo</button>
        <button onClick={() => setActiveTab('design')} className={tabClass('design')}><Palette size={16} /> Cores</button>
        <button onClick={() => setActiveTab('social')} className={tabClass('social')}><Share2 size={16} /> Redes Sociais</button>
        <button onClick={() => setActiveTab('domain')} className={tabClass('domain')}><Globe size={16} /> Domínio</button>
      </div>

      {/* === TEMPLATE TAB === */}
      {activeTab === 'template' && (
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
              Escolha o template
            </h2>
            <span className="text-xs text-navy-400 flex items-center gap-1"><Sparkles size={12} className="text-accent-400" /> {TEMPLATE_OPTIONS.length} templates disponíveis</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATE_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSite((prev) => prev ? { ...prev, template: t.id as SiteTemplate } : prev)}
                onMouseEnter={() => setHoveredTemplate(t.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 hover-lift-sm text-left ${site?.template === t.id ? 'border-accent-500 ring-2 ring-accent-500/30' : 'border-navy-600/40 hover:border-accent-500/30'}`}
              >
                <TemplateMiniPreview templateId={t.id} accent={t.accent} />
                <div className="p-3.5 bg-navy-800/60">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    {site?.template === t.id && (
                      <div className="w-5 h-5 rounded-full bg-accent-500 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-navy-400 leading-relaxed line-clamp-2">{t.description}</p>
                </div>
                {hoveredTemplate === t.id && (
                  <div className="absolute inset-0 bg-accent-500/5 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-navy-600/20">
            <label className={labelClass}>URL do site (slug)</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-navy-400 whitespace-nowrap">/site/</span>
              <input
                type="text"
                value={site?.slug || ''}
                onChange={(e) => setSite((prev) => prev ? { ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') } : prev)}
                placeholder="minha-loja"
                className={inputClass}
              />
            </div>
            <p className="text-xs text-navy-400 mt-1.5">O link do seu site será: {publicUrl || '/site/minha-loja'}</p>
          </div>
        </section>
      )}

      {/* === CONTENT TAB === */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
              Seção principal (topo)
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelClass}>Título principal</label>
                <input type="text" value={siteData.heroTitle || ''} onChange={(e) => setSiteData((prev) => ({ ...prev, heroTitle: e.target.value }))} placeholder="Ex: Auto Ribeirão Seminovos" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Subtítulo</label>
                <input type="text" value={siteData.heroSubtitle || ''} onChange={(e) => setSiteData((prev) => ({ ...prev, heroSubtitle: e.target.value }))} placeholder="Ex: Os melhores seminovos da região" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Imagem de fundo do topo</label>
                <div className="relative rounded-xl overflow-hidden border border-navy-600/40 group">
                  {siteData.heroImage ? (
                    <>
                      <img src={siteData.heroImage} alt="Hero" className="w-full h-32 object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg glass-strong text-white text-xs">
                          {uploadingHero ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                          {uploadingHero ? 'Enviando...' : 'Trocar'}
                          <input type="file" accept="image/*" onChange={handleUploadHero} className="hidden" />
                        </label>
                        <button onClick={() => setSiteData((prev) => ({ ...prev, heroImage: '' }))} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-error-500 text-white text-xs"><X size={14} /> Remover</button>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer hover:bg-navy-700/20 transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        {uploadingHero ? <Loader2 size={20} className="animate-spin text-accent-400" /> : <ImagePlus size={20} className="text-navy-400" />}
                        <span className="text-xs text-navy-400">Clique para adicionar imagem de fundo</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleUploadHero} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gold-400" style={{ boxShadow: '0 0 8px rgba(212,168,67,0.5)' }} />
              Seção "Sobre nós"
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setSiteData((prev) => ({ ...prev, showAboutSection: !prev.showAboutSection }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${siteData.showAboutSection ? 'bg-success-500' : 'bg-navy-600'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${siteData.showAboutSection ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm text-navy-200">Mostrar seção "Sobre nós"</span>
            </div>
            <div className={`space-y-4 ${siteData.showAboutSection ? '' : 'opacity-40 pointer-events-none'}`}>
              <div>
                <label className={labelClass}>Título da seção</label>
                <input type="text" value={siteData.aboutTitle || ''} onChange={(e) => setSiteData((prev) => ({ ...prev, aboutTitle: e.target.value }))} placeholder="Sobre nós" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Texto sobre a loja</label>
                <textarea value={siteData.aboutText || ''} onChange={(e) => setSiteData((prev) => ({ ...prev, aboutText: e.target.value }))} rows={4} placeholder="Conte um pouco sobre seu negócio..." className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className={labelClass}>Imagem da seção</label>
                <div className="relative rounded-xl overflow-hidden border border-navy-600/40 group">
                  {siteData.aboutImage ? (
                    <>
                      <img src={siteData.aboutImage} alt="Sobre" className="w-full h-32 object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg glass-strong text-white text-xs">
                          {uploadingAbout ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                          {uploadingAbout ? 'Enviando...' : 'Trocar'}
                          <input type="file" accept="image/*" onChange={handleUploadAbout} className="hidden" />
                        </label>
                        <button onClick={() => setSiteData((prev) => ({ ...prev, aboutImage: '' }))} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-error-500 text-white text-xs"><X size={14} /> Remover</button>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer hover:bg-navy-700/20 transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        {uploadingAbout ? <Loader2 size={20} className="animate-spin text-accent-400" /> : <ImagePlus size={20} className="text-navy-400" />}
                        <span className="text-xs text-navy-400">Clique para adicionar imagem</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleUploadAbout} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-success-400" style={{ boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
              Seções visíveis
            </h2>
            <div className="space-y-3">
              {[
                { key: 'showStatsSection' as const, label: 'Estatísticas (número de veículos, preços)' },
                { key: 'showContactSection' as const, label: 'Seção de contato' },
                { key: 'showSocialLinks' as const, label: 'Links de redes sociais' },
              ].map((s) => (
                <div key={s.key} className="flex items-center gap-3">
                  <button
                    onClick={() => setSiteData((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${siteData[s.key] ? 'bg-success-500' : 'bg-navy-600'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${siteData[s.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-sm text-navy-200">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className={labelClass}>Texto do rodapé (opcional)</label>
              <input type="text" value={siteData.customFooterText || ''} onChange={(e) => setSiteData((prev) => ({ ...prev, customFooterText: e.target.value }))} placeholder="© 2026 Minha Loja. Todos os direitos reservados." className={inputClass} />
            </div>
          </section>
        </div>
      )}

      {/* === DESIGN TAB === */}
      {activeTab === 'design' && (
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Cores personalizadas
          </h2>
          <p className="text-xs text-navy-400 mb-4">Personalize as cores do seu site. Deixe em branco para usar a cor padrão do template.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Cor principal</label>
              <div className="flex items-center gap-3">
                <input type="color" value={siteData.primaryColor || '#1e3a5f'} onChange={(e) => setSiteData((prev) => ({ ...prev, primaryColor: e.target.value }))} className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-navy-600/40" />
                <input type="text" value={siteData.primaryColor || ''} onChange={(e) => setSiteData((prev) => ({ ...prev, primaryColor: e.target.value }))} placeholder="#1e3a5f" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Cor secundária</label>
              <div className="flex items-center gap-3">
                <input type="color" value={siteData.secondaryColor || '#2b5cb8'} onChange={(e) => setSiteData((prev) => ({ ...prev, secondaryColor: e.target.value }))} className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-navy-600/40" />
                <input type="text" value={siteData.secondaryColor || ''} onChange={(e) => setSiteData((prev) => ({ ...prev, secondaryColor: e.target.value }))} placeholder="#2b5cb8" className={inputClass} />
              </div>
            </div>
          </div>
          {/* Color presets */}
          <div className="mt-6">
            <p className={labelClass}>Paletas prontas</p>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Azul', primary: '#1e3a5f', secondary: '#2b5cb8' },
                { name: 'Verde', primary: '#059669', secondary: '#10b981' },
                { name: 'Vermelho', primary: '#dc2626', secondary: '#ef4444' },
                { name: 'Roxo', primary: '#7c3aed', secondary: '#a78bfa' },
                { name: 'Laranja', primary: '#ea580c', secondary: '#fb923c' },
                { name: 'Ciano', primary: '#0891b2', secondary: '#06b6d4' },
                { name: 'Dourado', primary: '#c4a843', secondary: '#e6c860' },
                { name: 'Slate', primary: '#1e293b', secondary: '#475569' },
              ].map((p) => (
                <button
                  key={p.name}
                  onClick={() => setSiteData((prev) => ({ ...prev, primaryColor: p.primary, secondaryColor: p.secondary }))}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-navy-600/30 transition-all group"
                >
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full border-2 border-navy-800" style={{ background: p.primary }} />
                    <div className="w-5 h-5 rounded-full border-2 border-navy-800" style={{ background: p.secondary }} />
                  </div>
                  <span className="text-xs text-navy-200 group-hover:text-white transition-colors">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-navy-900/40 border border-navy-600/20">
            <p className="text-xs text-navy-400 mb-3">Prévia das cores:</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-12 rounded-lg" style={{ background: siteData.primaryColor || '#1e3a5f' }} />
              <div className="flex-1 h-12 rounded-lg" style={{ background: siteData.secondaryColor || '#2b5cb8' }} />
              <button onClick={() => setSiteData((prev) => ({ ...prev, primaryColor: '', secondaryColor: '' }))} className="text-xs text-navy-300 hover:text-white px-3 py-2 rounded-lg hover:bg-navy-700/40 transition-colors">Restaurar padrão</button>
            </div>
          </div>
        </section>
      )}

      {/* === SOCIAL TAB === */}
      {activeTab === 'social' && (
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gold-400" style={{ boxShadow: '0 0 8px rgba(212,168,67,0.5)' }} />
            Redes sociais
          </h2>
          <p className="text-xs text-navy-400 mb-4">Adicione os links das suas redes sociais. Eles aparecerão no topo e na seção de contato do site.</p>
          <div className="space-y-4">
            {[
              { key: 'instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/minhaloja' },
              { key: 'facebook' as const, label: 'Facebook', placeholder: 'https://facebook.com/minhaloja' },
              { key: 'whatsapp' as const, label: 'WhatsApp', placeholder: '5516999999999' },
              { key: 'youtube' as const, label: 'YouTube', placeholder: 'https://youtube.com/@minhaloja' },
              { key: 'tiktok' as const, label: 'TikTok', placeholder: 'https://tiktok.com/@minhaloja' },
            ].map((s) => (
              <div key={s.key}>
                <label className={labelClass}>{s.label}</label>
                <input
                  type="text"
                  value={siteData.social?.[s.key] || ''}
                  onChange={(e) => setSiteData((prev) => ({ ...prev, social: { ...prev.social, [s.key]: e.target.value } }))}
                  placeholder={s.placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* === DOMAIN TAB === */}
      {activeTab === 'domain' && (
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Domínio personalizado
          </h2>

          {/* Free domain info */}
          <div className="rounded-xl p-4 bg-navy-900/40 border border-navy-600/20 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success-500/15 flex items-center justify-center flex-shrink-0">
                <Check size={18} className="text-success-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Domínio grátis (atual)</p>
                <p className="text-xs text-navy-400 truncate mt-0.5">{publicUrl || '/site/minha-loja'}</p>
              </div>
              <span className="text-xs font-bold text-success-400 bg-success-500/10 px-2.5 py-1 rounded-lg border border-success-500/20">GRÁTIS</span>
            </div>
          </div>

          {/* Custom domain toggle */}
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setSite((prev) => prev ? { ...prev, custom_domain: prev.custom_domain ? null : '' } : prev)}
              className={`relative w-11 h-6 rounded-full transition-colors ${site?.custom_domain !== null && site?.custom_domain !== undefined ? 'bg-accent-500' : 'bg-navy-600'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${site?.custom_domain !== null && site?.custom_domain !== undefined ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm text-navy-200">Usar domínio próprio</span>
          </div>

          {site?.custom_domain !== null && site?.custom_domain !== undefined ? (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className={labelClass}>Seu domínio</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={site.custom_domain || ''}
                    onChange={(e) => setSite((prev) => prev ? { ...prev, custom_domain: e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '') } : prev)}
                    placeholder="www.minhaloja.com.br"
                    className={inputClass}
                  />
                </div>
                <p className="text-xs text-navy-400 mt-1.5">Digite o domínio que você já comprou (ex: www.minhaloja.com.br)</p>
              </div>

              {/* DNS instructions */}
              <div className="rounded-xl p-4 bg-accent-500/5 border border-accent-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info size={16} className="text-accent-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-2">Como configurar o DNS</p>
                    <p className="text-xs text-navy-300 leading-relaxed mb-3">
                      No painel da sua registradora (Registro.br, Hostinger, GoDaddy, etc), crie um registro <span className="text-accent-300 font-medium">CNAME</span> apontando para:
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <code className="flex-1 bg-navy-900/60 rounded-lg px-3 py-2 text-xs text-accent-300 font-mono border border-navy-600/30">cname.redeauto.com.br</code>
                      <button
                        onClick={() => { navigator.clipboard.writeText('cname.redeauto.com.br'); }}
                        className="p-2 rounded-lg glass hover:bg-navy-600/30 text-navy-200 hover:text-white transition-all flex-shrink-0"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-navy-400 leading-relaxed">
                      Após configurar, o domínio pode levar até 24 horas para funcionar. Mantenha o domínio grátis ativo enquanto a propagação acontece.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning about paid feature */}
              <div className="flex items-start gap-2 rounded-xl p-3 bg-gold-500/10 border border-gold-500/20">
                <Zap size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-navy-200 leading-relaxed">
                  Domínio personalizado é um recurso premium. O domínio grátis continua funcionando como alternativa.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-4 bg-navy-900/30 border border-navy-600/20 text-center">
              <Globe size={32} className="text-navy-500 mx-auto mb-3" />
              <p className="text-sm text-navy-300 font-medium">Ative para usar seu próprio domínio</p>
              <p className="text-xs text-navy-400 mt-1">Você pode usar um domínio que já comprou ou continuar com o grátis</p>
            </div>
          )}

          {/* Quick link to public site */}
          {site?.is_published && (
            <div className="mt-6 pt-6 border-t border-navy-600/20">
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-accent-300 hover:text-accent-200 transition-colors"
              >
                <ExternalLink size={13} /> Ver site publicado
              </a>
            </div>
          )}
        </section>
      )}

      {/* Save button */}
      <div className="flex items-center gap-3 justify-end mt-8 animate-fade-in-up">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-shine flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Salvar site
        </button>
      </div>
    </div>
  );
}
