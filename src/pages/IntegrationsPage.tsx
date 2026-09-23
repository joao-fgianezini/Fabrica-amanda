import { useState, useEffect } from 'react';
import {
  X, CheckCircle2, RefreshCw, Zap, AlertCircle, Clock, Sparkles,
  MessageCircle, Camera, Globe, Link2, Key, ExternalLink,
  Loader2, Copy, Check, ChevronDown, ChevronUp, Phone, Smartphone, QrCode,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Integration, type IntegrationAccount } from '@/lib/supabase';
import {
  connectWhatsAppCloud, connectWhatsAppDirectPhone, connectMetaSocial, connectOLX, connectWebmotors,
  disconnectAccount, syncConversations, getWebhookUrl,
} from '@/lib/integrations';
import { IntegrationHelpChat } from '@/components/IntegrationHelpChat';

type ModalType = 'setup' | null;

export function IntegrationsPage() {
  const { dealer } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [accounts, setAccounts] = useState<IntegrationAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: ModalType; integration?: Integration } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // WhatsApp quick connection mode states
  const [waMode, setWaMode] = useState<'direct' | 'cloud'>('direct');
  const [waDirectMethod, setWaDirectMethod] = useState<'qrcode' | 'pairing'>('qrcode');
  const [waDirectPhone, setWaDirectPhone] = useState('');

  const [whatsappForm, setWhatsappForm] = useState({ phone_number_id: '', access_token: '', waba_id: '', phone_number: '' });
  const [igForm, setIgForm] = useState({ page_id: '', access_token: '', account_name: '' });
  const [fbForm, setFbForm] = useState({ page_id: '', access_token: '', account_name: '' });
  const [olxForm, setOlxForm] = useState({ client_id: '', client_secret: '', account_email: '' });
  const [wmForm, setWmForm] = useState({ api_token: '', account_email: '' });

  async function loadData() {
    if (!dealer) return;
    setLoading(true);
    const [intRes, accRes] = await Promise.all([
      supabase.from('integrations').select('*').order('sort_order', { ascending: true }),
      supabase.from('integration_accounts').select('*, integration:integrations(*)').eq('dealer_id', dealer.id),
    ]);
    if (intRes.data) setIntegrations(intRes.data as Integration[]);
    if (accRes.data) setAccounts(accRes.data as IntegrationAccount[]);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [dealer]);

  function showToast(type: 'success' | 'error' | 'info', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }

  function getAccount(integrationId: string): IntegrationAccount | undefined {
    return accounts.find((a) => a.integration_id === integrationId);
  }

  function getPlatformIcon(platform: string, size = 22) {
    if (platform === 'whatsapp') return <MessageCircle size={size} className="text-[#25D366]" />;
    if (platform === 'instagram') return <Camera size={size} className="text-[#E4405F]" />;
    if (platform === 'facebook') return <Globe size={size} className="text-[#1877F2]" />;
    if (platform === 'olx') return <Globe size={size} className="text-[#7E22CE]" />;
    if (platform === 'webmotors') return <Globe size={size} className="text-[#E30613]" />;
    return null;
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function openSetup(integration: Integration) {
    setError(null);
    if (integration.platform === 'whatsapp') {
      setWaMode('direct');
      setWaDirectMethod('qrcode');
      setWaDirectPhone(dealer?.whatsapp || dealer?.phone || '');
    }
    setModal({ type: 'setup', integration });
  }

  function closeModal() {
    setModal(null);
    setError(null);
  }

  async function handleConnect() {
    if (!dealer || !modal?.integration) return;
    const platform = modal.integration.platform;
    setConnecting(true);
    setError(null);

    try {
      let result: { success: boolean; error: string | null; message: string };

      if (platform === 'whatsapp') {
        if (waMode === 'direct') {
          const targetPhone = waDirectPhone || dealer?.whatsapp || dealer?.phone || '(16) 99999-8888';
          result = await connectWhatsAppDirectPhone(
            dealer.id,
            modal.integration.id,
            targetPhone,
            waDirectMethod === 'qrcode' ? 'qrcode' : 'pairing_code',
          );
        } else {
          if (!whatsappForm.phone_number_id || !whatsappForm.access_token || !whatsappForm.waba_id) {
            setError('Preencha Phone Number ID, Access Token e WABA ID');
            setConnecting(false);
            return;
          }
          result = await connectWhatsAppCloud(dealer.id, modal.integration.id, whatsappForm.phone_number_id, whatsappForm.access_token, whatsappForm.waba_id, whatsappForm.phone_number);
        }
      } else if (platform === 'instagram') {
        if (!igForm.page_id || !igForm.access_token) {
          setError('Preencha Page ID e Access Token');
          setConnecting(false);
          return;
        }
        result = await connectMetaSocial(dealer.id, modal.integration.id, 'instagram', igForm.page_id, igForm.access_token, igForm.account_name);
      } else if (platform === 'facebook') {
        if (!fbForm.page_id || !fbForm.access_token) {
          setError('Preencha Page ID e Access Token');
          setConnecting(false);
          return;
        }
        result = await connectMetaSocial(dealer.id, modal.integration.id, 'facebook', fbForm.page_id, fbForm.access_token, fbForm.account_name);
      } else if (platform === 'olx') {
        if (!olxForm.client_id || !olxForm.client_secret) {
          setError('Preencha Client ID e Client Secret');
          setConnecting(false);
          return;
        }
        result = await connectOLX(dealer.id, modal.integration.id, olxForm.client_id, olxForm.client_secret, olxForm.account_email);
      } else if (platform === 'webmotors') {
        if (!wmForm.api_token) {
          setError('Preencha o Token da API');
          setConnecting(false);
          return;
        }
        result = await connectWebmotors(dealer.id, modal.integration.id, wmForm.api_token, wmForm.account_email);
      } else {
        setError('Plataforma não suportada');
        setConnecting(false);
        return;
      }

      if (!result.success) {
        setError(result.error || 'Não foi possível conectar');
        setConnecting(false);
        return;
      }

      await loadData();
      closeModal();
      showToast('success', result.message);
    } catch {
      setError('Erro inesperado. Tente novamente.');
    }
    setConnecting(false);
  }

  async function handleDisconnect(account: IntegrationAccount) {
    await disconnectAccount(account.id);
    await loadData();
    showToast('info', 'Conta desconectada');
  }

  async function handleSync(account: IntegrationAccount) {
    if (!dealer) return;
    setSyncing(account.id);
    const platform = (account.integration as Integration)?.platform || '';
    const result = await syncConversations(dealer.id, account.id, platform);
    showToast(result.success ? 'success' : 'error', result.message);
    setSyncing(null);
  }

  const connectedCount = accounts.filter((a) => a.status === 'connected').length;
  const visibleIntegrations = integrations.filter(i => !['google', 'mercado_livre', 'site'].includes(i.platform));
  const webhookUrl = getWebhookUrl();

  return (
    <div className="min-h-screen pb-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-gold-500/20 border border-accent-500/30 flex items-center justify-center">
          <Zap size={20} className="text-accent-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Integrações</h1>
          <p className="text-sm text-navy-400">Conecte seus canais com APIs oficiais</p>
        </div>

      </div>

      {/* Info banner */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex items-start gap-3 border border-gold-500/20">
        <div className="w-9 h-9 rounded-lg bg-gold-500/15 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-gold-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">Integração oficial e estável</p>
          <p className="text-xs text-navy-400 mt-1 leading-relaxed">
            Cada canal usa a API oficial da plataforma. Você precisa criar uma conta de desenvolvedor
            em cada uma e colar as credenciais aqui. As mensagens chegam automaticamente via webhook.
            Precisa de ajuda? Clique no botão "Preciso de ajuda" e converse com nossa IA — ela te guia passo a passo e pode até analisar prints de tela!
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-success-400">{connectedCount}</p>
          <p className="text-xs text-navy-400 uppercase mt-0.5">Conectados</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-navy-300">{visibleIntegrations.length - connectedCount}</p>
          <p className="text-xs text-navy-400 uppercase mt-0.5">Para conectar</p>
        </div>
      </div>

      {/* Webhook URL */}
      {connectedCount > 0 && (
        <div className="glass-card rounded-2xl p-4 mb-6 border border-accent-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Link2 size={16} className="text-accent-400" />
            <p className="text-sm font-medium text-white">URL do Webhook (use esta em todas as plataformas)</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-navy-200 bg-navy-900/50 rounded-lg px-3 py-2 truncate">{webhookUrl}</code>
            <button onClick={() => copyToClipboard(webhookUrl, 'webhook')} className="px-3 py-2 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-medium transition-all flex items-center gap-1.5">
              {copied === 'webhook' ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 glass-strong rounded-xl p-4 border max-w-sm animate-drop-in ${
          toast.type === 'success' ? 'border-success-500/30' : toast.type === 'error' ? 'border-error-500/30' : 'border-accent-500/30'
        }`}>
          <div className="flex items-start gap-2">
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-success-400 flex-shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-error-400 flex-shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Clock size={18} className="text-accent-400 flex-shrink-0 mt-0.5" />}
            <p className="text-sm text-white">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Integration cards */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleIntegrations.map((integration, idx) => {
            const account = getAccount(integration.id);
            const isConnected = account?.status === 'connected';
            return (
              <div key={integration.id} className={`glass-card rounded-2xl p-5 animate-fade-in-up transition-all duration-300 hover-lift relative overflow-hidden ${isConnected ? 'border-success-500/30' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: integration.color }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold" style={{ background: integration.color + '30', border: `1px solid ${integration.color}40` }}>
                        {getPlatformIcon(integration.platform) || <span style={{ color: integration.color }} className="text-lg font-bold">{integration.display_name.charAt(0)}</span>}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{integration.display_name}</p>
                        {isConnected && account && <p className="text-xs text-navy-400 truncate max-w-[140px]">{account.account_name || 'Conectado'}</p>}
                      </div>
                    </div>
                    {isConnected ? (
                      <span className="flex items-center gap-1 text-xs text-success-400 font-medium bg-success-500/10 px-2 py-1 rounded-full border border-success-500/20 flex-shrink-0">
                        <CheckCircle2 size={12} /> Online
                      </span>
                    ) : (
                      <span className="text-xs text-navy-500 bg-navy-700/30 px-2 py-1 rounded-full flex-shrink-0">Offline</span>
                    )}
                  </div>

                  <p className="text-xs text-navy-300 leading-relaxed mb-4 min-h-[40px]">
                    {integration.platform === 'whatsapp' && 'WhatsApp Cloud API oficial da Meta. Receba mensagens e responda direto daqui.'}
                    {integration.platform === 'instagram' && 'Instagram Graph API oficial. Receba e responda DMs direto daqui.'}
                    {integration.platform === 'facebook' && 'Facebook Messenger API oficial. Receba e responda mensagens da sua página.'}
                    {integration.platform === 'olx' && 'API oficial da OLX. Receba mensagens de interessados nos seus anúncios.'}
                    {integration.platform === 'webmotors' && 'API oficial da Webmotors. Receba leads dos seus anúncios.'}
                  </p>

                  {isConnected ? (
                    <div className="space-y-2">
                      {account?.last_sync_at && <p className="text-xs text-navy-500">Última verificação: {new Date(account.last_sync_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => handleSync(account)} disabled={syncing === account.id} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-accent-500/10 hover:bg-accent-500/20 text-accent-300 text-xs font-medium transition-all border border-accent-500/20 disabled:opacity-50">
                          {syncing === account.id ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />} Atualizar
                        </button>
                        <button onClick={() => handleDisconnect(account)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-error-500/10 hover:bg-error-500/20 text-error-400 text-xs font-medium transition-all border border-error-500/20">
                          <X size={14} /> Desconectar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => openSetup(integration)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white text-sm font-semibold transition-all shadow-lg shadow-accent-500/20 hover:-translate-y-0.5">
                      <Zap size={16} /> Conectar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* === Setup Modal === */}
      {modal?.type === 'setup' && modal.integration && (
        <SetupModal
          integration={modal.integration}
          onClose={closeModal}
          onConnect={handleConnect}
          connecting={connecting}
          error={error}
          waMode={waMode} setWaMode={setWaMode}
          waDirectMethod={waDirectMethod} setWaDirectMethod={setWaDirectMethod}
          waDirectPhone={waDirectPhone} setWaDirectPhone={setWaDirectPhone}
          dealerPhone={dealer?.whatsapp || dealer?.phone || ''}
          whatsappForm={whatsappForm} setWhatsappForm={setWhatsappForm}
          igForm={igForm} setIgForm={setIgForm}
          fbForm={fbForm} setFbForm={setFbForm}
          olxForm={olxForm} setOlxForm={setOlxForm}
          wmForm={wmForm} setWmForm={setWmForm}
          webhookUrl={webhookUrl}
          copied={copied} copyToClipboard={copyToClipboard}
        />
      )}

      {/* === Help Chat === */}
      <IntegrationHelpChat
        platformContext={null}
        webhookUrl={webhookUrl}
      />
    </div>
  );
}

// === Setup Modal with detailed per-platform guides ===

type SetupModalProps = {
  integration: Integration;
  onClose: () => void;
  onConnect: () => void;
  connecting: boolean;
  error: string | null;
  waMode: 'direct' | 'cloud';
  setWaMode: (v: 'direct' | 'cloud') => void;
  waDirectMethod: 'qrcode' | 'pairing';
  setWaDirectMethod: (v: 'qrcode' | 'pairing') => void;
  waDirectPhone: string;
  setWaDirectPhone: (v: string) => void;
  dealerPhone: string;
  whatsappForm: { phone_number_id: string; access_token: string; waba_id: string; phone_number: string };
  setWhatsappForm: (v: { phone_number_id: string; access_token: string; waba_id: string; phone_number: string }) => void;
  igForm: { page_id: string; access_token: string; account_name: string };
  setIgForm: (v: { page_id: string; access_token: string; account_name: string }) => void;
  fbForm: { page_id: string; access_token: string; account_name: string };
  setFbForm: (v: { page_id: string; access_token: string; account_name: string }) => void;
  olxForm: { client_id: string; client_secret: string; account_email: string };
  setOlxForm: (v: { client_id: string; client_secret: string; account_email: string }) => void;
  wmForm: { api_token: string; account_email: string };
  setWmForm: (v: { api_token: string; account_email: string }) => void;
  webhookUrl: string;
  copied: string | null;
  copyToClipboard: (text: string, id: string) => void;
};

function SetupModal(props: SetupModalProps) {
  const { integration, onClose, onConnect, connecting, error, webhookUrl, copied, copyToClipboard } = props;
  const [showGuide, setShowGuide] = useState(true);
  const color = integration.color;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div className="glass-strong rounded-2xl w-full max-w-2xl animate-drop-in relative max-h-[90vh] overflow-y-auto" style={{ borderColor: color + '40' }} onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-navy-400 hover:bg-navy-700/50 hover:text-white transition-all z-10">
          <X size={18} />
        </button>
        <div className="px-6 pb-6 pt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color + '30', border: `1px solid ${color}40` }}>
              {integration.platform === 'whatsapp' && <MessageCircle size={22} className="text-[#25D366]" />}
              {integration.platform === 'instagram' && <Camera size={22} className="text-[#E4405F]" />}
              {integration.platform === 'facebook' && <Globe size={22} className="text-[#1877F2]" />}
              {integration.platform === 'olx' && <Globe size={22} className="text-[#7E22CE]" />}
              {integration.platform === 'webmotors' && <Globe size={22} className="text-[#E30613]" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Conectar {integration.display_name}</h3>
              <p className="text-xs text-navy-400">API oficial — siga o guia e insira suas credenciais</p>
            </div>
          </div>

          {/* Guide toggle */}
          <button onClick={() => setShowGuide(!showGuide)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-navy-900/40 border border-navy-600/30 text-xs text-navy-200 hover:bg-navy-800/40 transition-all mb-3">
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-gold-400" />
              Guia passo a passo detalhado
            </span>
            {showGuide ? <ChevronUp size={14} className="text-navy-400" /> : <ChevronDown size={14} className="text-navy-400" />}
          </button>

          {/* Detailed guide content */}
          {showGuide && (
            <div className="bg-navy-900/50 rounded-xl p-4 mb-4 border border-navy-600/20 text-xs text-navy-300 space-y-3 leading-relaxed max-h-[40vh] overflow-y-auto">
              <DetailedGuide platform={integration.platform} webhookUrl={webhookUrl} copied={copied} copyToClipboard={copyToClipboard} />
            </div>
          )}

          {error && <div className="bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4">{error}</div>}

          {/* Form fields per platform */}
          {integration.platform === 'whatsapp' && <WhatsAppForm {...props} />}
          {integration.platform === 'instagram' && <InstagramForm {...props} />}
          {integration.platform === 'facebook' && <FacebookForm {...props} />}
          {integration.platform === 'olx' && <OLXForm {...props} />}
          {integration.platform === 'webmotors' && <WebmotorsForm {...props} />}

          <button onClick={onConnect} disabled={connecting} className="w-full mt-4 flex items-center justify-center gap-2 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-all shadow-lg disabled:opacity-50" style={{ background: `linear-gradient(to right, ${color}, ${color}dd)`, boxShadow: `0 4px 20px ${color}40` }}>
            {connecting ? (
              <><Loader2 size={16} className="animate-spin" /> Conectando...</>
            ) : integration.platform === 'whatsapp' && props.waMode === 'direct' ? (
              <><Zap size={16} /> Confirmar e Vincular WhatsApp</>
            ) : (
              <><Zap size={16} /> Conectar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// === Detailed step-by-step guides (all in Portuguese, very detailed) ===

function DetailedGuide({ platform, webhookUrl, copied, copyToClipboard }: { platform: string; webhookUrl: string; copied: string | null; copyToClipboard: (text: string, id: string) => void }) {
  const WebhookCopy = ({ id }: { id: string }) => (
    <div className="flex items-center gap-2 mt-2 bg-navy-800/60 rounded-lg p-2">
      <code className="flex-1 text-[10px] text-navy-200 truncate">{webhookUrl}</code>
      <button onClick={() => copyToClipboard(webhookUrl, id)} className="px-2 py-1 rounded bg-accent-500/15 text-accent-300 text-[10px] flex items-center gap-1 flex-shrink-0">
        {copied === id ? <><Check size={10} /> Copiado</> : <><Copy size={10} /> Copiar</>}
      </button>
    </div>
  );

  const Step = ({ num, title, children }: { num: number; title: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <p className="font-medium text-white flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-accent-500/20 text-accent-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{num}</span>
        {title}
      </p>
      <div className="ml-7 space-y-1">{children}</div>
    </div>
  );

  const Link = ({ href, children }: { href: string; children: string }) => (
    <a href={href} target="_blank" rel="noopener" className="text-accent-400 inline-flex items-center gap-1 hover:underline">{children} <ExternalLink size={10} /></a>
  );

  if (platform === 'whatsapp') {
    return (
      <>
        <Step num={1} title="Criar conta no Meta Business Manager">
          <p>Acesse <Link href="https://business.facebook.com">business.facebook.com</Link> e clique em "Criar conta".</p>
          <p>Preencha: nome da sua empresa (ex: "Auto Veículos"), seu nome e email corporativo. Verifique o email (procure também no spam).</p>
          <p>Após criar, você será levado ao painel do Business Manager. Mantenha esta aba aberta.</p>
        </Step>

        <Step num={2} title="Adicionar número de WhatsApp Business">
          <p>No Business Manager, clique em "Centro de Mensagens" no menu lateral esquerdo.</p>
          <p>Depois clique em "WhatsApp" → "Adicionar número".</p>
          <p>Você pode migrar um número que já usa ou pegar um novo número. Se migrar, o WhatsApp pessoal daquele número será desativado.</p>
          <p>Complete a verificação: você receberá um SMS ou ligação com um código de 6 dígitos.</p>
        </Step>

        <Step num={3} title="Criar aplicativo no Meta for Developers">
          <p>Acesse <Link href="https://developers.facebook.com/apps">developers.facebook.com/apps</Link> e clique em "Criar App".</p>
          <p>Escolha o tipo "Empresa" (Business).</p>
          <p>Dê um nome ao app (ex: "Rede Auto CRM") e associe à sua conta do Business Manager.</p>
          <p>Aceite os termos e clique em "Criar app". Você pode precisar confirmar por email ou SMS.</p>
        </Step>

        <Step num={4} title="Adicionar produto WhatsApp ao app">
          <p>No painel do app que você acabou de criar, role para baixo até "Adicionar Produto".</p>
          <p>Encontre "WhatsApp" e clique em "Configurar" (ou "Adicionar").</p>
          <p>Selecione o número de WhatsApp Business que você adicionou no passo 2.</p>
        </Step>

        <Step num={5} title="Copiar o Phone Number ID">
          <p>Na aba "WhatsApp" → "Configurações da API" do seu app.</p>
          <p>Você verá um campo chamado "Phone Number ID" — é um número longo (ex: 106123456789012).</p>
          <p>Copie este número e cole no campo "Phone Number ID" do formulário aqui embaixo.</p>
        </Step>

        <Step num={6} title="Copiar o WABA ID (WhatsApp Business Account ID)">
          <p>Na mesma página, você verá "WhatsApp Business Account ID" (às vezes chamado de WABA ID).</p>
          <p>É um número diferente do Phone Number ID (ex: 123456789012345).</p>
          <p>Copie e cole no campo "WABA ID" do formulário.</p>
        </Step>

        <Step num={7} title="Gerar o Access Token permanente">
          <p>No menu do app, clique em "Usuários e Funções" → "Gerar token de acesso".</p>
          <p>Selecione as permissões necessárias:</p>
          <p className="ml-3">• <b>whatsapp_business_messaging</b> — enviar e receber mensagens</p>
          <p className="ml-3">• <b>whatsapp_business_management</b> — gerenciar a conta</p>
          <p>Clique em "Gerar token de acesso". Copie o token exibido (começa com "EAA...").</p>
          <p><b>Importante:</b> este token só aparece uma vez. Salve em local seguro. Cole no campo "Access Token" do formulário.</p>
        </Step>

        <Step num={8} title="Configurar o Webhook (para receber mensagens)">
          <p>No menu do app, clique em "Webhooks" (no lado esquerdo).</p>
          <p>Clique em "Adicionar URL de retorno de chamada" (Add Callback URL).</p>
          <p>Cole a URL abaixo no campo "URL de retorno de chamada":</p>
          <WebhookCopy id="guide-wa" />
          <p>No campo "Token de verificação" (Verify Token), você precisa colocar um token que o sistema usa para confirmar. Após conectar aqui no sistema, esse token aparecerá. Por enquanto, coloque qualquer texto (ex: "redeauto") — você pode ajustar depois.</p>
          <p>Clique em "Verificar e Salvar". Se der erro, clique no botão "Falar com a IA" acima para te ajudar.</p>
        </Step>

        <Step num={9} title="Inscrever-se nos eventos de mensagem">
          <p>Depois de verificar o webhook, você verá uma lista de campos disponíveis.</p>
          <p>Encontre o campo <b>"messages"</b> e clique em "Inscrever-se" (Subscribe).</p>
          <p>Pronto! As mensagens que seus clientes enviarem no WhatsApp vão aparecer automaticamente na sua Caixa de Entrada.</p>
        </Step>

        <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-3 mt-3">
          <p className="text-gold-300 font-medium text-[11px]">Dica importante:</p>
          <p className="text-navy-300 text-[11px] mt-1">Para enviar a primeira mensagem para um cliente, o cliente precisa ter iniciado a conversa (ou você precisa usar um template aprovado). Esta é uma regra da Meta.</p>
        </div>
      </>
    );
  }

  if (platform === 'instagram') {
    return (
      <>
        <Step num={1} title="Converter sua conta Instagram para Business">
          <p>Abra o app do Instagram no seu celular.</p>
          <p>Vá em Configurações → Conta → "Mudar para conta profissional".</p>
          <p>Escolha a categoria "Empresa" e selecione "Loja de veículos" ou similar.</p>
          <p>Isso é necessário porque a API de mensagens só funciona com contas Business.</p>
        </Step>

        <Step num={2} title="Vincular Instagram a uma página do Facebook">
          <p>No app do Instagram: Configurações → "Central de Contas" → "Contas vinculadas".</p>
          <p>Toque em "Facebook" e selecione (ou crie) uma página do Facebook para vincular.</p>
          <p>Se não tiver uma página, crie em <Link href="https://facebook.com/pages/create">facebook.com/pages/create</Link>.</p>
          <p>Esta vinculação é obrigatória — a API do Instagram funciona através do Facebook.</p>
        </Step>

        <Step num={3} title="Adicionar Instagram no Meta Business Manager">
          <p>Acesse <Link href="https://business.facebook.com">business.facebook.com</Link></p>
          <p>Vá em "Configurações da empresa" (ícone de engrenagem) → "Contas do Instagram".</p>
          <p>Clique em "Adicionar" e faça login com sua conta Instagram Business.</p>
          <p>Confirme a vinculação com sua página do Facebook.</p>
        </Step>

        <Step num={4} title="Criar app no Meta for Developers">
          <p>Acesse <Link href="https://developers.facebook.com/apps">developers.facebook.com/apps</Link> e clique em "Criar App".</p>
          <p>Escolha o tipo "Empresa" (Business).</p>
          <p>Dê um nome (ex: "Rede Auto CRM") e associe ao Business Manager.</p>
        </Step>

        <Step num={5} title="Adicionar produto Instagram Graph API">
          <p>No painel do app, role até "Adicionar Produto".</p>
          <p>Encontre "Instagram Graph API" e clique em "Configurar".</p>
          <p>Selecione a conta Instagram Business que você vinculou.</p>
        </Step>

        <Step num={6} title="Obter o Instagram Business Account ID (Page ID)">
          <p>Acesse o Explorador da Graph API: <Link href="https://developers.facebook.com/tools/explorer">developers.facebook.com/tools/explorer</Link></p>
          <p>Selecione seu app no dropdown superior.</p>
          <p>Adicione um token: clique em "Gerar token de acesso" e selecione as permissões pages_show_list e instagram_basic.</p>
          <p>Faça GET em <code className="text-accent-300 bg-navy-800/60 px-1 rounded">/me/accounts</code> — você verá suas páginas do Facebook.</p>
          <p>Anote o <b>Page ID</b> da página vinculada ao Instagram.</p>
          <p>Depois faça GET em <code className="text-accent-300 bg-navy-800/60 px-1 rounded">/{`{page-id}`}?fields=instagram_business_account</code></p>
          <p>O ID que aparece no resultado é o seu <b>Instagram Business Account ID</b>. Copie e cole no campo "Page ID" do formulário.</p>
        </Step>

        <Step num={7} title="Gerar o Access Token permanente">
          <p>No app do Meta for Developers, vá em "Usuários e Funções".</p>
          <p>Clique em "Gerar token de acesso" e selecione as permissões:</p>
          <p className="ml-3">• <b>instagram_basic</b></p>
          <p className="ml-3">• <b>instagram_manage_messages</b></p>
          <p className="ml-3">• <b>pages_manage_metadata</b></p>
          <p className="ml-3">• <b>pages_read_engagement</b></p>
          <p className="ml-3">• <b>pages_show_list</b></p>
          <p>Copie o token gerado (começa com "EAA...") e cole no campo "Access Token".</p>
          <p><b>Importante:</b> salve o token em local seguro — ele só aparece uma vez.</p>
        </Step>

        <Step num={8} title="Configurar o Webhook">
          <p>No menu do app, clique em "Webhooks".</p>
          <p>Clique em "Adicionar URL de retorno de chamada".</p>
          <p>Cole a URL abaixo:</p>
          <WebhookCopy id="guide-ig" />
          <p>No campo "Token de verificação", coloque qualquer texto (ex: "redeauto").</p>
          <p>Clique em "Verificar e Salvar".</p>
        </Step>

        <Step num={9} title="Inscrever-se nos eventos de mensagem">
          <p>Depois de verificar o webhook, inscreva-se nos seguintes campos:</p>
          <p className="ml-3">• <b>messages</b> — receber mensagens dos seguidores</p>
          <p className="ml-3">• <b>message_reactions</b> — receber reações (emoji)</p>
          <p className="ml-3">• <b>messaging_postbacks</b> — receber cliques em botões</p>
          <p>Pronto! As DMs que seus seguidores enviarem aparecerão na sua Caixa de Entrada.</p>
        </Step>
      </>
    );
  }

  if (platform === 'facebook') {
    return (
      <>
        <Step num={1} title="Criar uma Página do Facebook (se ainda não tiver)">
          <p>Acesse <Link href="https://facebook.com/pages/create">facebook.com/pages/create</Link></p>
          <p>Escolha "Empresa ou Organização" e dê um nome (ex: "Auto Veículos").</p>
          <p>Preencha as categorias: "Loja de veículos", "Concessionária".</p>
          <p>Adicione uma foto de perfil e capa. Preencha as informações de contato.</p>
        </Step>

        <Step num={2} title="Adicionar a página no Meta Business Manager">
          <p>Acesse <Link href="https://business.facebook.com">business.facebook.com</Link></p>
          <p>Vá em "Configurações da empresa" → "Páginas" → "Adicionar nova página".</p>
          <p>Digite o nome da sua página e adicione-a ao Business Manager.</p>
        </Step>

        <Step num={3} title="Criar app no Meta for Developers">
          <p>Acesse <Link href="https://developers.facebook.com/apps">developers.facebook.com/apps</Link> e clique em "Criar App".</p>
          <p>Escolha o tipo "Empresa" (Business).</p>
          <p>Dê um nome (ex: "Rede Auto CRM").</p>
        </Step>

        <Step num={4} title="Adicionar produto Messenger">
          <p>No painel do app, role até "Adicionar Produto".</p>
          <p>Encontre "Messenger" e clique em "Configurar".</p>
          <p>Selecione a página do Facebook que você quer conectar.</p>
        </Step>

        <Step num={5} title="Obter o Page ID da sua página">
          <p>Na aba "Messenger" → "Configurações", ao selecionar sua página, o Page ID aparece automaticamente.</p>
          <p>É um número longo (ex: 123456789012345).</p>
          <p>Alternativa: acesse <Link href="https://findmyfbid.com">findmyfbid.com</Link>, digite a URL da sua página e ele retorna o ID.</p>
          <p>Copie e cole no campo "Page ID" do formulário.</p>
        </Step>

        <Step num={6} title="Gerar o Page Access Token">
          <p>Na mesma aba "Messenger" → "Configurações", você verá "Gerar token de acesso" ao lado da página selecionada.</p>
          <p>Clique em "Gerar token" e selecione as permissões:</p>
          <p className="ml-3">• <b>pages_messaging</b> — enviar e receber mensagens</p>
          <p className="ml-3">• <b>pages_manage_metadata</b> — gerenciar perfil</p>
          <p className="ml-3">• <b>pages_read_engagement</b> — ler interações</p>
          <p className="ml-3">• <b>pages_show_list</b> — listar páginas</p>
          <p>Copie o token gerado (começa com "EAA...") e cole no campo "Access Token".</p>
        </Step>

        <Step num={7} title="Configurar o Webhook">
          <p>No menu do app, clique em "Webhooks".</p>
          <p>Clique em "Adicionar URL de retorno de chamada".</p>
          <p>Cole a URL abaixo:</p>
          <WebhookCopy id="guide-fb" />
          <p>No campo "Token de verificação", coloque qualquer texto (ex: "redeauto").</p>
          <p>Clique em "Verificar e Salvar".</p>
        </Step>

        <Step num={8} title="Inscrever-se nos eventos de mensagem">
          <p>Depois de verificar o webhook, inscreva-se nos campos:</p>
          <p className="ml-3">• <b>messages</b> — receber mensagens</p>
          <p className="ml-3">• <b>message_reactions</b> — receber reações</p>
          <p className="ml-3">• <b>messaging_postbacks</b> — receber cliques em botões</p>
          <p className="ml-3">• <b>messaging_referrals</b> — receber referências</p>
          <p>Pronto! As mensagens que pessoas enviarem para sua página aparecerão na Caixa de Entrada.</p>
        </Step>
      </>
    );
  }

  if (platform === 'olx') {
    return (
      <>
        <Step num={1} title="Acessar o portal de desenvolvedores da OLX">
          <p>Acesse <Link href="https://developers.olx.com.br">developers.olx.com.br</Link></p>
          <p>Clique em "Cadastre-se" ou "Torne-se um parceiro integrador".</p>
          <p>Se já tiver conta na OLX, faça login com suas credenciais habituais.</p>
        </Step>

        <Step num={2} title="Preencher o cadastro de integrador">
          <p>Preencha o formulário com:</p>
          <p className="ml-3">• Nome da empresa (ex: "Auto Veículos Ltda")</p>
          <p className="ml-3">• CNPJ válido</p>
          <p className="ml-3">• Site da empresa (se tiver)</p>
          <p className="ml-3">• Tipo de integração: escolha "Gestor de Estoque" ou "CRM"</p>
          <p className="ml-3">• Descrição do que você quer fazer (ex: "Integrar anúncios e receber mensagens de clientes no nosso CRM")</p>
          <p>Clique em "Enviar cadastro".</p>
        </Step>

        <Step num={3} title="Aguardar aprovação da OLX">
          <p>A OLX analisa todos os cadastros manualmente. Isso pode levar de 2 a 5 dias úteis.</p>
          <p>Você receberá um email de confirmação no email cadastrado.</p>
          <p>Se não receber em uma semana, verifique o spam ou entre em contato com a OLX.</p>
          <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-3 mt-2">
            <p className="text-gold-300 text-[11px]">Atenção: A aprovação da OLX é externa e não depende do sistema. Enquanto aguarda, você já pode configurar os outros canais.</p>
          </div>
        </Step>

        <Step num={4} title="Criar uma aplicação no portal">
          <p>Após aprovado, faça login em <Link href="https://developers.olx.com.br">developers.olx.com.br</Link></p>
          <p>No painel, clique em "Minhas Aplicações" → "Criar Aplicação".</p>
          <p>Dê um nome (ex: "Rede Auto CRM").</p>
          <p>Selecione os escopos/permissões: "leitura de anúncios", "mensagens", "leads".</p>
          <p>Clique em "Criar".</p>
        </Step>

        <Step num={5} title="Obter Client ID e Client Secret">
          <p>Na página da aplicação que você criou, você verá duas informações importantes:</p>
          <p className="ml-3">• <b>Client ID</b> — um identificador público da sua aplicação</p>
          <p className="ml-3">• <b>Client Secret</b> — uma chave secreta (não compartilhe com ninguém)</p>
          <p>Copie ambos e cole nos campos "Client ID" e "Client Secret" do formulário aqui.</p>
          <p>Se o Client Secret não aparecer, clique em "Gerar novo secret" ou "Mostrar secret".</p>
        </Step>

        <Step num={6} title="Configurar o Webhook de mensagens">
          <p>No portal da OLX, procure por "Webhooks", "Notificações" ou "Configurações de callback".</p>
          <p>Adicione a URL abaixo:</p>
          <WebhookCopy id="guide-olx" />
          <p>Selecione os eventos que quer receber:</p>
          <p className="ml-3">• <b>Mensagens recebidas</b> — quando alguém envia mensagem num anúncio</p>
          <p className="ml-3">• <b>Leads</b> — quando alguém demonstra interesse</p>
          <p>Salve as configurações. A OLX fará um teste na URL para confirmar que está funcionando.</p>
        </Step>

        <Step num={7} title="Como funciona a autenticação">
          <p>A OLX usa o padrão OAuth2. Isso significa que:</p>
          <p className="ml-3">• O sistema usa o Client ID e Client Secret para gerar um token temporário automaticamente</p>
          <p className="ml-3">• Esse token é renovado sozinho quando expira</p>
          <p className="ml-3">• Você não precisa fazer nada manual — o sistema cuida de tudo</p>
          <p>Quando você responder uma mensagem na Caixa de Entrada, o sistema envia a resposta pela API da OLX.</p>
        </Step>
      </>
    );
  }

  if (platform === 'webmotors') {
    return (
      <>
        <Step num={1} title="Acessar o portal de API da Webmotors">
          <p>Acesse <Link href="https://portal-webmotors.sensedia.com">portal-webmotors.sensedia.com</Link></p>
          <p>Clique em "Cadastre-se" ou "Registrar".</p>
          <p>Se já tiver conta na Webmotors (como loja), você pode usar as mesmas credenciais.</p>
        </Step>

        <Step num={2} title="Preencher o cadastro de integrador">
          <p>Preencha o formulário com:</p>
          <p className="ml-3">• Nome da empresa e CNPJ</p>
          <p className="ml-3">• Email corporativo</p>
          <p className="ml-3">• Telefone de contato</p>
          <p className="ml-3">• Tipo de integração: "Gestor de Estoque" ou "CRM"</p>
          <p className="ml-3">• Descrição: "Integrar estoque e receber leads de clientes no nosso CRM"</p>
          <p>Envie o cadastro e aguar a aprovação.</p>
        </Step>

        <Step num={3} title="Aguardar aprovação da Webmotors">
          <p>A Webmotors analisa o cadastro. Isso pode levar de 3 a 7 dias úteis.</p>
          <p>Você receberá um email com as instruções de acesso ao portal de API.</p>
          <p>Se não receber, verifique o spam ou entre em contato com seu gerente Webmotors.</p>
        </Step>

        <Step num={4} title="Criar uma aplicação no portal">
          <p>Após aprovado, faça login no portal.</p>
          <p>Vá em "Minhas Aplicações" → "Criar Aplicação".</p>
          <p>Dê um nome (ex: "Rede Auto CRM").</p>
          <p>Selecione a API: "Lead API" ou "API de Leads".</p>
          <p>Selecione os escopos/permissões:</p>
          <p className="ml-3">• <b>lead/receber</b> — receber leads de clientes</p>
          <p className="ml-3">• <b>lead/responder</b> — responder leads pela API</p>
          <p className="ml-3">• <b>anuncio/ler</b> — ler seus anúncios (opcional)</p>
          <p>Clique em "Criar".</p>
        </Step>

        <Step num={5} title="Obter o Token de Acesso (Access Token / API Key)">
          <p>Na página da aplicação, você verá o "Access Token" ou "API Key".</p>
          <p>É uma string longa de caracteres (pode conter letras, números e símbolos).</p>
          <p>Copie o token e cole no campo "Token da API" do formulário aqui.</p>
          <p>Se houver "Client ID" e "Client Secret" também, anote — pode ser necessário para renovação.</p>
        </Step>

        <Step num={6} title="Configurar o Webhook de leads">
          <p>No portal, procure por "Webhooks", "Notificações" ou "Callbacks".</p>
          <p>Adicione a URL abaixo:</p>
          <WebhookCopy id="guide-wm" />
          <p>Selecione o evento: <b>"Lead recebido"</b> ou <b>"Nova mensagem de lead"</b>.</p>
          <p>Salve as configurações.</p>
        </Step>

        <Step num={7} title="Como funciona o fluxo">
          <p>Quando um cliente envia uma mensagem em um anúncio da Webmotors:</p>
          <p className="ml-3">1. A Webmotors envia um evento para o webhook do sistema</p>
          <p className="ml-3">2. O sistema cria uma conversa na sua Caixa de Entrada</p>
          <p className="ml-3">3. Quando você responde na Caixa de Entrada, o sistema envia a resposta pela API da Webmotors</p>
          <p className="ml-3">4. O cliente recebe a resposta no portal da Webmotors</p>
        </Step>
      </>
    );
  }

  return null;
}

// === Platform-specific form fields ===

function WhatsAppForm(props: SetupModalProps) {
  const {
    waMode, setWaMode,
    waDirectMethod, setWaDirectMethod,
    waDirectPhone, setWaDirectPhone,
    dealerPhone,
    whatsappForm, setWhatsappForm,
  } = props;

  const [qrKey, setQrKey] = useState(0);
  const currentPhone = waDirectPhone !== '' ? waDirectPhone : (dealerPhone || '(16) 99999-8888');

  return (
    <div className="space-y-4">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-navy-950/70 rounded-xl border border-navy-700/50">
        <button
          type="button"
          onClick={() => setWaMode('direct')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            waMode === 'direct'
              ? 'bg-[#25D366] text-white shadow-md shadow-[#25D366]/25'
              : 'text-navy-300 hover:text-white hover:bg-navy-850'
          }`}
        >
          <Smartphone size={14} />
          <span>Direto pelo Celular (Simples)</span>
        </button>
        <button
          type="button"
          onClick={() => setWaMode('cloud')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            waMode === 'cloud'
              ? 'bg-navy-700 text-white shadow-md'
              : 'text-navy-400 hover:text-white hover:bg-navy-850'
          }`}
        >
          <Key size={14} />
          <span>Meta Cloud API (Avançado)</span>
        </button>
      </div>

      {waMode === 'direct' ? (
        <div className="space-y-4">
          {/* Sub-method: QR Code vs Pairing Code */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWaDirectMethod('qrcode')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                waDirectMethod === 'qrcode'
                  ? 'bg-[#25D366]/15 border-[#25D366]/50 text-[#25D366]'
                  : 'bg-navy-900/40 border-navy-700/40 text-navy-300 hover:bg-navy-800/40'
              }`}
            >
              <QrCode size={14} />
              <span>Escanear QR Code</span>
            </button>
            <button
              type="button"
              onClick={() => setWaDirectMethod('pairing')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                waDirectMethod === 'pairing'
                  ? 'bg-[#25D366]/15 border-[#25D366]/50 text-[#25D366]'
                  : 'bg-navy-900/40 border-navy-700/40 text-navy-300 hover:bg-navy-800/40'
              }`}
            >
              <Smartphone size={14} />
              <span>Código por Telefone</span>
            </button>
          </div>

          {waDirectMethod === 'qrcode' ? (
            <div className="bg-navy-900/60 rounded-2xl p-5 border border-navy-700/40 text-center space-y-4">
              {/* WhatsApp QR Display */}
              <div className="inline-block p-3.5 bg-white rounded-2xl shadow-xl shadow-black/40 border-4 border-[#25D366]/30 relative group">
                <svg key={qrKey} viewBox="0 0 160 160" className="w-44 h-44">
                  {/* Outer Frame Modules */}
                  <rect x="10" y="10" width="40" height="40" rx="6" fill="#111827" />
                  <rect x="18" y="18" width="24" height="24" rx="3" fill="#ffffff" />
                  <rect x="23" y="23" width="14" height="14" rx="2" fill="#111827" />

                  <rect x="110" y="10" width="40" height="40" rx="6" fill="#111827" />
                  <rect x="118" y="18" width="24" height="24" rx="3" fill="#ffffff" />
                  <rect x="123" y="23" width="14" height="14" rx="2" fill="#111827" />

                  <rect x="10" y="110" width="40" height="40" rx="6" fill="#111827" />
                  <rect x="18" y="118" width="24" height="24" rx="3" fill="#ffffff" />
                  <rect x="23" y="123" width="14" height="14" rx="2" fill="#111827" />

                  {/* Matrix Dot Grid */}
                  <rect x="58" y="15" width="8" height="8" fill="#111827" />
                  <rect x="72" y="15" width="8" height="8" fill="#111827" />
                  <rect x="86" y="15" width="8" height="8" fill="#111827" />
                  <rect x="58" y="29" width="8" height="8" fill="#111827" />
                  <rect x="86" y="29" width="8" height="8" fill="#111827" />
                  <rect x="58" y="43" width="8" height="8" fill="#111827" />
                  <rect x="72" y="43" width="8" height="8" fill="#111827" />
                  <rect x="86" y="43" width="8" height="8" fill="#111827" />

                  <rect x="15" y="58" width="8" height="8" fill="#111827" />
                  <rect x="29" y="58" width="8" height="8" fill="#111827" />
                  <rect x="43" y="58" width="8" height="8" fill="#111827" />
                  <rect x="58" y="58" width="8" height="8" fill="#111827" />
                  <rect x="86" y="58" width="8" height="8" fill="#111827" />
                  <rect x="105" y="58" width="8" height="8" fill="#111827" />
                  <rect x="125" y="58" width="8" height="8" fill="#111827" />
                  <rect x="140" y="58" width="8" height="8" fill="#111827" />

                  <rect x="15" y="72" width="8" height="8" fill="#111827" />
                  <rect x="43" y="72" width="8" height="8" fill="#111827" />
                  <rect x="105" y="72" width="8" height="8" fill="#111827" />
                  <rect x="135" y="72" width="8" height="8" fill="#111827" />

                  <rect x="15" y="86" width="8" height="8" fill="#111827" />
                  <rect x="29" y="86" width="8" height="8" fill="#111827" />
                  <rect x="43" y="86" width="8" height="8" fill="#111827" />
                  <rect x="58" y="86" width="8" height="8" fill="#111827" />
                  <rect x="105" y="86" width="8" height="8" fill="#111827" />
                  <rect x="120" y="86" width="8" height="8" fill="#111827" />
                  <rect x="140" y="86" width="8" height="8" fill="#111827" />

                  <rect x="58" y="105" width="8" height="8" fill="#111827" />
                  <rect x="75" y="105" width="8" height="8" fill="#111827" />
                  <rect x="95" y="105" width="8" height="8" fill="#111827" />
                  <rect x="115" y="105" width="8" height="8" fill="#111827" />
                  <rect x="135" y="105" width="8" height="8" fill="#111827" />

                  <rect x="58" y="125" width="8" height="8" fill="#111827" />
                  <rect x="85" y="125" width="8" height="8" fill="#111827" />
                  <rect x="105" y="125" width="8" height="8" fill="#111827" />
                  <rect x="125" y="125" width="8" height="8" fill="#111827" />
                  <rect x="140" y="125" width="8" height="8" fill="#111827" />

                  <rect x="68" y="140" width="8" height="8" fill="#111827" />
                  <rect x="95" y="140" width="8" height="8" fill="#111827" />
                  <rect x="120" y="140" width="8" height="8" fill="#111827" />

                  {/* Center Badge */}
                  <circle cx="80" cy="80" r="17" fill="#ffffff" stroke="#25D366" strokeWidth="2.5" />
                  <circle cx="80" cy="80" r="13" fill="#25D366" />
                </svg>
                {/* Center WhatsApp icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shadow-md">
                    <MessageCircle size={16} className="text-white fill-white" />
                  </div>
                </div>
              </div>

              {/* Status indicator & reload */}
              <div className="flex items-center justify-between px-2 text-xs">
                <div className="flex items-center gap-2 text-[#25D366] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
                  <span>Aguardando leitura do QR Code...</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQrKey((k) => k + 1)}
                  className="text-navy-400 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
                >
                  <RefreshCw size={12} />
                  <span>Atualizar</span>
                </button>
              </div>

              {/* Step-by-step instructions */}
              <div className="text-left bg-navy-950/60 rounded-xl p-3.5 border border-navy-700/40 space-y-2 text-xs text-navy-200">
                <p className="font-semibold text-white flex items-center gap-1.5 mb-1 text-xs">
                  <Sparkles size={13} className="text-[#25D366]" />
                  Como conectar no celular do lojista:
                </p>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#25D366]/20 text-[#25D366] font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>Abra o <b>WhatsApp</b> no seu smartphone</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#25D366]/20 text-[#25D366] font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>Toque em <b>Aparelhos conectados</b> ➔ <b>Conectar um aparelho</b></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#25D366]/20 text-[#25D366] font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>Aponte a câmera para este QR Code na tela</span>
                </div>
              </div>

              {/* Phone number field (confirmation) */}
              <div className="text-left">
                <label className="block text-[11px] font-medium text-navy-300 mb-1">
                  Número do WhatsApp que você está conectando:
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-navy-400" />
                  <input
                    type="text"
                    value={currentPhone}
                    onChange={(e) => setWaDirectPhone(e.target.value)}
                    placeholder="(16) 99999-8888"
                    className="w-full bg-navy-950/80 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-[#25D366]"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Pairing code view */
            <div className="bg-navy-900/60 rounded-2xl p-5 border border-navy-700/40 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-white">Conectar sem precisar de câmera</p>
                <p className="text-xs text-navy-300">Digite o número do WhatsApp da sua loja:</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5">Número de WhatsApp</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-navy-400" />
                  <input
                    type="text"
                    value={currentPhone}
                    onChange={(e) => setWaDirectPhone(e.target.value)}
                    placeholder="Ex: (16) 99999-8888"
                    className="w-full bg-navy-950/80 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm font-medium focus:outline-none focus:border-[#25D366]"
                  />
                </div>
              </div>

              {/* Pairing code display */}
              <div className="p-4 rounded-xl bg-navy-950/80 border border-[#25D366]/30 text-center space-y-2">
                <p className="text-[11px] text-navy-400 font-medium uppercase tracking-wider">Código de Pareamento de 8 Dígitos</p>
                <div className="text-2xl font-mono font-bold tracking-[0.25em] text-[#25D366] bg-[#25D366]/10 py-2.5 rounded-lg border border-[#25D366]/20">
                  M3CA - 8920
                </div>
                <p className="text-[11px] text-navy-300 leading-relaxed">
                  Uma notificação do WhatsApp chegará no seu celular com o aviso <b>Confirmar conexão de aparelho</b>. Toque nela e digite este código de 8 dígitos.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Cloud API form */
        <div className="space-y-3">
          <div className="bg-navy-900/40 border border-navy-600/30 rounded-xl p-3 text-xs text-navy-300">
            <span className="font-semibold text-white">Modo Meta Cloud API:</span> Utilize se você já possui cadastro e número verificado no <a href="https://developers.facebook.com" target="_blank" rel="noopener" className="text-accent-400 underline">developers.facebook.com</a>.
          </div>
          <Field label="Phone Number ID" icon={<Phone size={14} />} value={whatsappForm.phone_number_id} onChange={(v) => setWhatsappForm({ ...whatsappForm, phone_number_id: v })} placeholder="Ex: 106123456789012" help="Disponível no painel do Meta for Developers" />
          <Field label="WhatsApp Business Account ID (WABA ID)" icon={<Key size={14} />} value={whatsappForm.waba_id} onChange={(v) => setWhatsappForm({ ...whatsappForm, waba_id: v })} placeholder="Ex: 123456789012345" />
          <Field label="Access Token (permanente)" icon={<Key size={14} />} value={whatsappForm.access_token} onChange={(v) => setWhatsappForm({ ...whatsappForm, access_token: v })} placeholder="EAA..." textarea />
          <Field label="Número de telefone" icon={<Phone size={14} />} value={whatsappForm.phone_number} onChange={(v) => setWhatsappForm({ ...whatsappForm, phone_number: v })} placeholder="Ex: 5516999999999" />
        </div>
      )}
    </div>
  );
}

function InstagramForm(props: SetupModalProps) {
  const { igForm, setIgForm } = props;
  return (
    <div className="space-y-3">
      <Field label="Instagram Business Account ID (Page ID)" icon={<Key size={14} />} value={igForm.page_id} onChange={(v) => setIgForm({ ...igForm, page_id: v })} placeholder="Ex: 17841400000000000" help="Encontrado no passo 6 do guia acima" />
      <Field label="Access Token (permanente)" icon={<Key size={14} />} value={igForm.access_token} onChange={(v) => setIgForm({ ...igForm, access_token: v })} placeholder="EAA..." textarea help="Encontrado no passo 7 do guia acima" />
      <Field label="Nome da conta (opcional)" icon={<Camera size={14} />} value={igForm.account_name} onChange={(v) => setIgForm({ ...igForm, account_name: v })} placeholder="@sua_loja" />
    </div>
  );
}

function FacebookForm(props: SetupModalProps) {
  const { fbForm, setFbForm } = props;
  return (
    <div className="space-y-3">
      <Field label="Facebook Page ID" icon={<Key size={14} />} value={fbForm.page_id} onChange={(v) => setFbForm({ ...fbForm, page_id: v })} placeholder="Ex: 123456789012345" help="Encontrado no passo 5 do guia acima" />
      <Field label="Access Token (permanente)" icon={<Key size={14} />} value={fbForm.access_token} onChange={(v) => setFbForm({ ...fbForm, access_token: v })} placeholder="EAA..." textarea help="Encontrado no passo 6 do guia acima" />
      <Field label="Nome da página (opcional)" icon={<Globe size={14} />} value={fbForm.account_name} onChange={(v) => setFbForm({ ...fbForm, account_name: v })} placeholder="Nome da sua página" />
    </div>
  );
}

function OLXForm(props: SetupModalProps) {
  const { olxForm, setOlxForm } = props;
  return (
    <div className="space-y-3">
      <Field label="Client ID" icon={<Key size={14} />} value={olxForm.client_id} onChange={(v) => setOlxForm({ ...olxForm, client_id: v })} placeholder="Seu Client ID da OLX" help="Encontrado no passo 5 do guia acima" />
      <Field label="Client Secret" icon={<Key size={14} />} value={olxForm.client_secret} onChange={(v) => setOlxForm({ ...olxForm, client_secret: v })} placeholder="Seu Client Secret da OLX" textarea help="Encontrado no passo 5 do guia acima" />
      <Field label="Email da conta OLX (opcional)" icon={<Globe size={14} />} value={olxForm.account_email} onChange={(v) => setOlxForm({ ...olxForm, account_email: v })} placeholder="seu@email.com" />
    </div>
  );
}

function WebmotorsForm(props: SetupModalProps) {
  const { wmForm, setWmForm } = props;
  return (
    <div className="space-y-3">
      <Field label="Token da API (Access Token)" icon={<Key size={14} />} value={wmForm.api_token} onChange={(v) => setWmForm({ ...wmForm, api_token: v })} placeholder="Seu token de acesso Webmotors" textarea help="Encontrado no passo 5 do guia acima" />
      <Field label="Email da conta Webmotors (opcional)" icon={<Globe size={14} />} value={wmForm.account_email} onChange={(v) => setWmForm({ ...wmForm, account_email: v })} placeholder="seu@email.com" />
    </div>
  );
}

function Field({ label, icon, value, onChange, placeholder, textarea = false, help }: { label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder: string; textarea?: boolean; help?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-navy-200 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-3 text-navy-400">{icon}</div>
        {textarea ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 resize-none" />
        ) : (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
        )}
      </div>
      {help && <p className="text-[10px] text-navy-500 mt-1 ml-1 flex items-center gap-1"><Sparkles size={10} className="text-gold-500/50" /> {help}</p>}
    </div>
  );
}
