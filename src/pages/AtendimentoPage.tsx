import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  Send, Search, CheckCircle2, Sparkles, User, Car, ChevronRight,
  AlertCircle, MessageSquare, Phone, Mail, Plus, Calendar, Flame,
  Tag, Trash2, X, Clock, TrendingUp, Target, RefreshCw, Layers, ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  supabase,
  type Message,
  type Lead,
  type LeadInteraction,
  type LeadFollowUp,
  type InteractionType,
  type FollowUpType,
  type LeadStatus,
  type Vehicle,
} from '@/lib/supabase';
import {
  channelLabel,
  channelColor,
  loadMessages,
  sendMessageViaPlatform,
  markConversationRead,
} from '@/lib/integrations';
import {
  PIPELINE_STAGES,
  INTERACTION_TYPES,
  FOLLOW_UP_TYPES,
  interactionLabel,
  followUpTypeLabel,
  sourceLabel,
  scoreColor,
  scoreLabel,
  timeAgo,
  isOverdue,
} from '@/lib/crm';
import { formatCurrency, formatDate } from '@/lib/format';
import { LeadModal } from '@/components/LeadModal';
import { ChannelLogo, ChannelBadge, type ChannelType } from '@/components/ChannelLogo';
import { VehicleChatHeader, type VehicleInterestInfo } from '@/components/VehicleChatHeader';
import {
  type UnifiedConversation,
  type ChatCommercialStatus,
  CHAT_STATUS_CONFIG,
  generateMultichannelDemo,
  getLocalDemoConversations,
  saveLocalDemoConversations,
  getLocalDemoMessages,
  saveLocalDemoMessages,
  clearLocalDemoData,
} from '@/lib/unified-chat';

type AIAnalysis = {
  sentiment?: string;
  summary?: string;
  lead_score?: number;
  suggested_action?: string;
  is_lead?: boolean;
  is_personal?: boolean;
  conversation_type?: string;
};

type ExtractedData = {
  vehicle_interest?: string;
  budget?: number;
  down_payment?: number;
  max_installment?: number;
  intent?: string;
  conversation_type?: string;
};

type RightTab = 'cliente' | 'veiculo' | 'interacoes' | 'acompanhamentos';

// Supported channels for tabs
const CHANNELS_NAV = [
  { id: 'all', label: 'Todas as Plataformas' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'olx', label: 'OLX' },
  { id: 'webmotors', label: 'Webmotors' },
] as const;

export function AtendimentoPage() {
  const { dealer } = useAuth();
  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
  const [selected, setSelected] = useState<UnifiedConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<{ delivered: boolean; error: string | null } | null>(null);
  const [activeChannelTab, setActiveChannelTab] = useState<string>('all');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Right panel state
  const [rightTab, setRightTab] = useState<RightTab>('cliente');
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
  const [rightLoading, setRightLoading] = useState(false);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [newInteraction, setNewInteraction] = useState({ type: 'whatsapp' as InteractionType, description: '' });
  const [newFollowUp, setNewFollowUp] = useState({ type: 'whatsapp' as FollowUpType, message: '', scheduledAt: '' });
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadStats, setLeadStats] = useState({ total: 0, quentes: 0, vendidos: 0, acompanhamentosHoje: 0 });

  // Load conversations (Supabase + Local Demo fallback)
  const loadConversations = useCallback(async () => {
    if (!dealer) return;

    // Check if local demo conversations exist
    const localDemo = getLocalDemoConversations();
    if (localDemo && localDemo.length > 0) {
      setConversations(localDemo);
      setIsDemoMode(true);
      setSelected((prev) => prev || localDemo[0]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, lead:leads(*)')
        .eq('dealer_id', dealer.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (!error && data && data.length > 0) {
        setConversations(data as UnifiedConversation[]);
        setIsDemoMode(false);
        setSelected((prev) => prev || (data[0] as UnifiedConversation));
      } else {
        // If empty in database, initialize demo conversations for a great immediate experience
        handleLoadDemo(dealer.id);
      }
    } catch {
      handleLoadDemo(dealer.id);
    } finally {
      setLoading(false);
    }
  }, [dealer?.id]);

  function handleLoadDemo(dealerId: string) {
    const { conversations: demoConvs, messagesMap } = generateMultichannelDemo(dealerId);
    setConversations(demoConvs);
    saveLocalDemoConversations(demoConvs);
    Object.keys(messagesMap).forEach((convId) => {
      saveLocalDemoMessages(convId, messagesMap[convId]);
    });
    setIsDemoMode(true);
    if (demoConvs.length > 0) {
      setSelected(demoConvs[0]);
    }
  }

  function handleClearDemo() {
    clearLocalDemoData();
    setIsDemoMode(false);
    setConversations([]);
    setSelected(null);
    setMessages([]);
    loadConversations();
  }

  const loadLeadStats = useCallback(async () => {
    if (!dealer) return;
    try {
      const { data: leads } = await supabase.from('leads').select('lead_score, status').eq('dealer_id', dealer.id);
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('lead_follow_ups')
        .select('*', { count: 'exact', head: true })
        .eq('dealer_id', dealer.id)
        .eq('status', 'pending')
        .gte('scheduled_at', today + 'T00:00:00')
        .lte('scheduled_at', today + 'T23:59:59');

      if (leads && leads.length > 0) {
        setLeadStats({
          total: leads.length,
          quentes: leads.filter((l) => l.lead_score >= 80).length,
          vendidos: leads.filter((l) => l.status === 'won').length,
          acompanhamentosHoje: count || 0,
        });
      } else {
        setLeadStats({
          total: 5,
          quentes: 3,
          vendidos: 1,
          acompanhamentosHoje: 1,
        });
      }
    } catch {
      // Ignore in offline mode
    }
  }, [dealer?.id]);

  useEffect(() => {
    loadConversations();
    loadLeadStats();
  }, [loadConversations, loadLeadStats]);

  // Realtime subscription (when not in local demo)
  useEffect(() => {
    if (!dealer || isDemoMode) return;
    const convChannel = supabase
      .channel('conv-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `dealer_id=eq.${dealer.id}` }, () => {
        loadConversations();
      })
      .subscribe();

    const msgChannel = supabase
      .channel('msg-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `dealer_id=eq.${dealer.id}` }, (payload) => {
        const newMsg = payload.new as Message;
        if (selected && newMsg.conversation_id === selected.id) {
          setMessages((prev) => [...prev, newMsg]);
          markConversationRead(selected.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(convChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [dealer, selected?.id, loadConversations, isDemoMode]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (!selected) return;
    setMsgLoading(true);
    setDeliveryStatus(null);

    // If demo conversation, load from localStorage
    if (selected.id.startsWith('demo-conv-')) {
      const demoMsgs = getLocalDemoMessages(selected.id);
      setMessages(demoMsgs);
      setMsgLoading(false);
      setConversations((prev) =>
        prev.map((c) => (c.id === selected.id ? { ...c, unread_count: 0 } : c))
      );
      return;
    }

    loadMessages(selected.id).then((msgs) => {
      setMessages(msgs);
      setMsgLoading(false);
      markConversationRead(selected.id);
      setConversations((prev) =>
        prev.map((c) => (c.id === selected.id ? { ...c, unread_count: 0 } : c))
      );
    });

    if (selected.lead) {
      loadLeadDetails(selected.lead.id);
    }
  }, [selected?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadLeadDetails(leadId: string) {
    setRightLoading(true);
    try {
      const [iRes, fRes] = await Promise.all([
        supabase.from('lead_interactions').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
        supabase.from('lead_follow_ups').select('*').eq('lead_id', leadId).order('scheduled_at', { ascending: false }),
      ]);
      if (iRes.data) setInteractions(iRes.data as LeadInteraction[]);
      if (fRes.data) setFollowUps(fRes.data as LeadFollowUp[]);
    } catch {
      // Offline fallback
    } finally {
      setRightLoading(false);
    }
  }

  // Count messages per channel for tab badges
  const channelCounts = useMemo(() => {
    const counts: Record<string, { total: number; unread: number }> = {
      all: { total: conversations.length, unread: 0 },
      whatsapp: { total: 0, unread: 0 },
      instagram: { total: 0, unread: 0 },
      facebook: { total: 0, unread: 0 },
      olx: { total: 0, unread: 0 },
      webmotors: { total: 0, unread: 0 },
    };

    conversations.forEach((c) => {
      counts.all.unread += c.unread_count || 0;
      const ch = c.channel.toLowerCase();
      if (!counts[ch]) {
        counts[ch] = { total: 0, unread: 0 };
      }
      counts[ch].total += 1;
      counts[ch].unread += c.unread_count || 0;
    });

    return counts;
  }, [conversations]);

  // Filter conversations by active channel tab and search query
  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const matchesChannel =
        activeChannelTab === 'all' ||
        c.channel.toLowerCase() === activeChannelTab.toLowerCase();

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (c.contact_name || '').toLowerCase().includes(q) ||
        (c.contact_phone || '').includes(q) ||
        (c.vehicle?.brand || '').toLowerCase().includes(q) ||
        (c.vehicle?.model || '').toLowerCase().includes(q) ||
        (c.last_message_preview || '').toLowerCase().includes(q);

      return matchesChannel && matchesSearch;
    });
  }, [conversations, activeChannelTab, search]);

  const unreadTotal = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);
  const currentLead = selected?.lead || null;
  const currentVehicle: VehicleInterestInfo | null = selected?.vehicle || null;

  async function handleSend() {
    if (!input.trim() || !selected || !dealer) return;
    const text = input.trim();
    setSending(true);
    setDeliveryStatus(null);

    // If demo conversation, append message locally
    if (selected.id.startsWith('demo-conv-')) {
      const newMsg: Message = {
        id: `demo-msg-${Date.now()}`,
        conversation_id: selected.id,
        dealer_id: dealer.id,
        direction: 'outbound',
        content: text,
        content_type: 'text',
        external_id: null,
        ai_extracted_data: {},
        ai_analysis: { delivery_status: 'sent' },
        created_at: new Date().toISOString(),
      };

      const updatedMsgs = [...messages, newMsg];
      setMessages(updatedMsgs);
      saveLocalDemoMessages(selected.id, updatedMsgs);
      setInput('');

      const updatedConvs = conversations.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              last_message_preview: text.slice(0, 100),
              last_message_at: new Date().toISOString(),
            }
          : c
      );
      setConversations(updatedConvs);
      saveLocalDemoConversations(updatedConvs);

      setDeliveryStatus({ delivered: true, error: null });
      setTimeout(() => setDeliveryStatus(null), 4000);
      setSending(false);
      return;
    }

    // Live Supabase Edge Function send
    const result = await sendMessageViaPlatform(selected.id, dealer.id, text);
    if (result.success && result.message) {
      setMessages([...messages, result.message]);
      setInput('');
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? {
                ...c,
                last_message_preview: text.slice(0, 100),
                last_message_at: new Date().toISOString(),
              }
            : c
        )
      );
      setDeliveryStatus({ delivered: result.delivered, error: result.error });
      setTimeout(() => setDeliveryStatus(null), 5000);
    } else {
      setDeliveryStatus({ delivered: false, error: result.error || 'Erro ao enviar' });
    }
    setSending(false);
  }

  // Change commercial status of the conversation
  function handleStatusChange(newStatus: ChatCommercialStatus) {
    if (!selected) return;

    const updatedSelected = { ...selected, commercial_status: newStatus };
    setSelected(updatedSelected);

    const updated = conversations.map((c) =>
      c.id === selected.id ? { ...c, commercial_status: newStatus } : c
    );
    setConversations(updated);

    if (isDemoMode) {
      saveLocalDemoConversations(updated);
    } else {
      supabase
        .from('conversations')
        .update({ status: newStatus as any, updated_at: new Date().toISOString() })
        .eq('id', selected.id);
    }
  }

  async function changeLeadStatus(newStatus: LeadStatus) {
    if (!currentLead) return;
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', currentLead.id);
    if (!error) {
      loadLeadStats();
      loadConversations();
      if (selected) {
        setSelected({ ...selected, lead: { ...currentLead, status: newStatus } });
      }
    }
  }

  async function addInteraction() {
    if (!currentLead || !newInteraction.description.trim()) return;
    const { data, error } = await supabase
      .from('lead_interactions')
      .insert({
        lead_id: currentLead.id,
        dealer_id: currentLead.dealer_id,
        type: newInteraction.type,
        description: newInteraction.description.trim(),
        vehicle_id: currentLead.vehicle_id,
      })
      .select('*')
      .single();

    if (!error && data) {
      setInteractions([data as LeadInteraction, ...interactions]);
      await supabase
        .from('leads')
        .update({ last_interaction_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', currentLead.id);
      setNewInteraction({ type: 'whatsapp', description: '' });
      setShowAddInteraction(false);
    }
  }

  async function addFollowUp() {
    if (!currentLead || !newFollowUp.scheduledAt || !newFollowUp.message.trim()) return;
    const { data, error } = await supabase
      .from('lead_follow_ups')
      .insert({
        lead_id: currentLead.id,
        dealer_id: currentLead.dealer_id,
        scheduled_at: new Date(newFollowUp.scheduledAt).toISOString(),
        message: newFollowUp.message.trim(),
        type: newFollowUp.type,
        status: 'pending',
      })
      .select('*')
      .single();

    if (!error && data) {
      setFollowUps([data as LeadFollowUp, ...followUps]);
      setNewFollowUp({ type: 'whatsapp', message: '', scheduledAt: '' });
      setShowAddFollowUp(false);
      loadLeadStats();
    }
  }

  async function completeFollowUp(id: string) {
    const { error } = await supabase
      .from('lead_follow_ups')
      .update({ status: 'done', completed_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setFollowUps(
        followUps.map((f) =>
          f.id === id ? { ...f, status: 'done', completed_at: new Date().toISOString() } : f
        )
      );
      loadLeadStats();
    }
  }

  function getAIAnalysis(msg: Message): AIAnalysis {
    return (msg.ai_analysis || {}) as AIAnalysis;
  }
  function getExtractedData(msg: Message): ExtractedData {
    return (msg.ai_extracted_data || {}) as ExtractedData;
  }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col gap-3">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-500/20 via-navy-800 to-accent-600/30 border border-accent-500/30 flex items-center justify-center relative shadow-lg shadow-accent-500/10">
            <MessageSquare size={22} className="text-accent-400" />
            {unreadTotal > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 rounded-full text-[11px] font-extrabold text-white flex items-center justify-center shadow-md animate-pulse">
                {unreadTotal}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Atendimento Comercial</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-500/15 border border-accent-500/30 text-accent-300 font-bold uppercase tracking-wider">
                Chat Unificado
              </span>
            </div>
            <p className="text-xs text-navy-400">
              Centralize mensagens de WhatsApp, Instagram, Facebook, OLX e Webmotors
            </p>
          </div>
        </div>

        {/* Demo Mode Button & Mini KPI Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          {isDemoMode ? (
            <button
              onClick={handleClearDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800/80 hover:bg-error-500/20 text-navy-300 hover:text-error-400 border border-navy-700 hover:border-error-500/30 text-xs font-semibold transition-all"
              title="Restaurar conexões reais"
            >
              <Trash2 size={13} />
              <span>Limpar Demonstração</span>
            </button>
          ) : (
            <button
              onClick={() => dealer && handleLoadDemo(dealer.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-accent-500/15 to-gold-500/15 hover:from-accent-500/25 hover:to-gold-500/25 text-accent-300 border border-accent-500/30 text-xs font-semibold shadow-sm transition-all"
              title="Carregar 5 conversas de exemplo dos 5 canais"
            >
              <Sparkles size={13} className="text-gold-400" />
              <span>Carregar Demonstração (5 Canais)</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-3 bg-navy-900/60 border border-navy-700/50 rounded-2xl px-4 py-2 shadow-sm">
            <div className="text-center px-2">
              <p className="text-base font-extrabold text-accent-400">{leadStats.total}</p>
              <p className="text-[9px] text-navy-400 uppercase font-bold tracking-wider">Clientes</p>
            </div>
            <div className="w-[1px] h-6 bg-navy-700" />
            <div className="text-center px-2">
              <p className="text-base font-extrabold text-rose-400">{leadStats.quentes}</p>
              <p className="text-[9px] text-navy-400 uppercase font-bold tracking-wider">Quentes</p>
            </div>
            <div className="w-[1px] h-6 bg-navy-700" />
            <div className="text-center px-2">
              <p className="text-base font-extrabold text-emerald-400">{leadStats.vendidos}</p>
              <p className="text-[9px] text-navy-400 uppercase font-bold tracking-wider">Vendidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Omnichannel Platform Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-shrink-0">
        {CHANNELS_NAV.map((tab) => {
          const isActive = activeChannelTab === tab.id;
          const count = channelCounts[tab.id]?.total || 0;
          const unread = channelCounts[tab.id]?.unread || 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveChannelTab(tab.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 border ${
                isActive
                  ? 'bg-navy-800 border-accent-500/60 text-white shadow-md shadow-accent-500/10 ring-1 ring-accent-500/30'
                  : 'bg-navy-900/50 border-navy-700/60 text-navy-400 hover:text-navy-200 hover:bg-navy-850 hover:border-navy-600'
              }`}
            >
              <ChannelLogo
                channel={tab.id as ChannelType}
                size="sm"
                showBadge={false}
                className={isActive ? 'scale-110 transition-transform' : 'opacity-80'}
              />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-accent-500/25 text-accent-300'
                    : 'bg-navy-800 text-navy-400'
                }`}
              >
                {count}
              </span>
              {unread > 0 && (
                <span className="w-2 h-2 rounded-full bg-error-500 ring-2 ring-error-500/30 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3-Column Omnichannel Unified Workspace */}
      <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
        {/* Column 1: Conversations List */}
        <div className="w-80 flex-shrink-0 glass-card rounded-2xl flex flex-col overflow-hidden border border-navy-700/50">
          {/* Search Box */}
          <div className="p-3 border-b border-navy-700/40">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente, veículo, telefone..."
                className="w-full bg-navy-900/70 border border-navy-700/60 rounded-xl pl-9 pr-3 py-2 text-white text-xs placeholder:text-navy-500 focus:outline-none focus:border-accent-500 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Conversations List View */}
          <div className="flex-1 overflow-y-auto divide-y divide-navy-700/20">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MessageSquare size={36} className="text-navy-600 mx-auto mb-3" />
                <p className="text-sm text-navy-300 font-semibold">Nenhuma conversa encontrada</p>
                <p className="text-xs text-navy-500 mt-1">
                  {activeChannelTab !== 'all'
                    ? `Nenhuma mensagem recente no canal ${channelLabel(activeChannelTab)}.`
                    : 'Aguardando novas mensagens dos canais integrados.'}
                </p>
                {!isDemoMode && dealer && (
                  <button
                    onClick={() => handleLoadDemo(dealer.id)}
                    className="mt-4 px-3 py-1.5 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-semibold transition-all border border-accent-500/30"
                  >
                    ✨ Ver exemplos multicanal
                  </button>
                )}
              </div>
            ) : (
              filtered.map((conv) => {
                const isSelected = selected?.id === conv.id;
                const statusCfg = conv.commercial_status
                  ? CHAT_STATUS_CONFIG[conv.commercial_status]
                  : null;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelected(conv)}
                    className={`w-full text-left p-3.5 transition-all relative flex gap-3 ${
                      isSelected
                        ? 'bg-accent-500/10 border-l-4 border-l-accent-500 shadow-inner'
                        : 'hover:bg-navy-800/40'
                    }`}
                  >
                    {/* Platform Logo Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm bg-navy-800 border border-navy-700/60 shadow-sm"
                      >
                        <span className="text-white font-extrabold text-sm">
                          {(conv.contact_name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* Platform Logo badge positioned at the bottom right corner */}
                      <div className="absolute -bottom-1 -right-1 ring-2 ring-navy-950 rounded-lg">
                        <ChannelLogo channel={conv.channel} size="xs" showBadge={false} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-white truncate">
                          {conv.contact_name || 'Sem nome'}
                        </p>
                        <span className="text-[10px] text-navy-400 flex-shrink-0">
                          {timeAgo(conv.last_message_at)}
                        </span>
                      </div>

                      {/* Vehicle of Interest Tag */}
                      {conv.vehicle ? (
                        <div className="flex items-center gap-1 text-[11px] text-accent-300 font-semibold truncate mt-0.5">
                          <Car size={11} className="text-accent-400 flex-shrink-0" />
                          <span className="truncate">
                            {conv.vehicle.brand} {conv.vehicle.model}
                          </span>
                          {conv.vehicle.asking_price != null && (
                            <span className="text-[10px] text-gold-400 font-bold ml-auto flex-shrink-0">
                              {formatCurrency(conv.vehicle.asking_price)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-navy-400 truncate mt-0.5">
                          <ChannelBadge channel={conv.channel} size="xs" showName={true} />
                        </div>
                      )}

                      {/* Last Message Preview */}
                      <p className="text-[11px] text-navy-400 truncate mt-1">
                        {conv.last_message_preview || 'Sem mensagens'}
                      </p>

                      {/* Bottom row: Platform badge + Status */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <ChannelBadge channel={conv.channel} size="xs" showName={true} />

                        {statusCfg && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-md border font-semibold ${statusCfg.badgeClass}`}
                          >
                            {statusCfg.label}
                          </span>
                        )}

                        {conv.unread_count > 0 && (
                          <span className="ml-auto bg-accent-500 text-white text-[10px] font-extrabold rounded-full px-1.5 py-0.2 flex-shrink-0 shadow-sm shadow-accent-500/30">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Unified Chat Window */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden min-w-0 border border-navy-700/50 shadow-xl">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-3xl bg-navy-800/80 border border-navy-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageSquare size={32} className="text-accent-400/70" />
                </div>
                <h3 className="text-lg font-bold text-white">Selecione uma conversa</h3>
                <p className="text-xs text-navy-400 mt-1">
                  Escolha um contato à esquerda ou use os filtros superiores para atender clientes por canal.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-navy-700/40 bg-navy-900/80 backdrop-blur-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center font-bold text-sm text-white">
                      {(selected.contact_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 ring-2 ring-navy-950 rounded-md">
                      <ChannelLogo channel={selected.channel} size="xs" showBadge={false} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-extrabold text-white truncate">
                        {selected.contact_name || 'Sem nome'}
                      </h2>
                      <ChannelBadge channel={selected.channel} size="xs" showName={true} />
                    </div>
                    <p className="text-[11px] text-navy-400 mt-0.5">
                      {selected.contact_phone || selected.contact_handle || 'Contato via ' + channelLabel(selected.channel)}
                    </p>
                  </div>
                </div>

                {/* Status Selector & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Commercial Status Selector */}
                  <div className="flex items-center gap-1.5 bg-navy-800/90 border border-navy-700/70 rounded-xl px-2.5 py-1.5">
                    <span className="text-[10px] text-navy-400 font-medium uppercase">Status:</span>
                    <select
                      value={selected.commercial_status || 'novo'}
                      onChange={(e) => handleStatusChange(e.target.value as ChatCommercialStatus)}
                      className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                    >
                      {Object.keys(CHAT_STATUS_CONFIG).map((st) => (
                        <option key={st} value={st} className="bg-navy-900 text-white">
                          {CHAT_STATUS_CONFIG[st as ChatCommercialStatus].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentLead && (
                    <button
                      onClick={() => setShowLeadModal(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-semibold transition-all border border-accent-500/30"
                    >
                      <User size={12} />
                      <span className="hidden sm:inline">Lead</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Vehicle Context Banner (Card do Veículo Anunciado) */}
              <VehicleChatHeader vehicle={currentVehicle} />

              {/* AI summary banner if available */}
              {selected.ai_summary && (
                <div
                  className={`px-4 py-2 border-b flex items-start gap-2 ${
                    selected.ai_qualified
                      ? 'bg-gold-500/10 border-gold-500/20'
                      : 'bg-navy-800/30 border-navy-700/30'
                  }`}
                >
                  <Sparkles
                    size={14}
                    className={`flex-shrink-0 mt-0.5 ${
                      selected.ai_qualified ? 'text-gold-400' : 'text-navy-400'
                    }`}
                  />
                  <div className="flex-1 text-xs">
                    <span
                      className={`font-bold ${
                        selected.ai_qualified ? 'text-gold-400' : 'text-navy-300'
                      }`}
                    >
                      Resumo IA:{' '}
                    </span>
                    <span className="text-navy-200">{selected.ai_summary}</span>
                  </div>
                </div>
              )}

              {/* Delivery notification */}
              {deliveryStatus && (
                <div
                  className={`px-4 py-2 border-b text-xs flex items-center gap-2 ${
                    deliveryStatus.delivered
                      ? 'bg-success-500/10 border-success-500/20 text-success-400'
                      : 'bg-warning-500/10 border-warning-500/20 text-warning-400'
                  }`}
                >
                  {deliveryStatus.delivered ? (
                    <>
                      <CheckCircle2 size={13} /> Mensagem sincronizada no canal {channelLabel(selected.channel)}
                    </>
                  ) : (
                    <>
                      <AlertCircle size={13} /> {deliveryStatus.error || 'Erro no canal'}
                    </>
                  )}
                </div>
              )}

              {/* Messages History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-navy-950/40">
                {msgLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-navy-500 text-xs">
                    Nenhuma mensagem registrada nesta conversa ainda.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const analysis = getAIAnalysis(msg);
                    const extracted = getExtractedData(msg);
                    const isInbound = msg.direction === 'inbound';
                    const deliveryInfo = msg.ai_analysis as { delivery_status?: string };

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className="max-w-[78%]">
                          {/* Bubble */}
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm shadow-md ${
                              isInbound
                                ? 'bg-navy-850/90 border border-navy-700/60 text-white rounded-tl-sm'
                                : 'bg-gradient-to-r from-accent-600 via-accent-500 to-accent-600 text-white rounded-tr-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed text-[13px]">{msg.content}</p>
                          </div>

                          {/* Footer Info: Channel + Time + Status */}
                          <div className="flex items-center gap-1.5 text-[10px] text-navy-500 mt-1 px-1">
                            <ChannelLogo
                              channel={selected.channel}
                              size="xs"
                              showBadge={false}
                              className="opacity-70"
                            />
                            <span>{channelLabel(selected.channel)}</span>
                            <span>·</span>
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {!isInbound && (
                              <CheckCircle2 size={11} className="text-emerald-400 ml-0.5" />
                            )}
                          </div>

                          {/* AI Lead Enrichment Card (if inbound had AI extraction) */}
                          {isInbound && analysis.lead_score != null && (
                            <div
                              className={`mt-2 rounded-xl p-2.5 border space-y-1.5 shadow-sm text-xs ${
                                analysis.conversation_type === 'lead'
                                  ? 'bg-gold-500/8 border-gold-500/20'
                                  : 'bg-navy-850/60 border-navy-700/40'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <Sparkles
                                  size={12}
                                  className={
                                    analysis.conversation_type === 'lead' ? 'text-gold-400' : 'text-navy-400'
                                  }
                                />
                                <span
                                  className="text-[10px] font-bold uppercase tracking-wider"
                                  style={{
                                    color: analysis.conversation_type === 'lead' ? '#e6c25e' : '#8fb5da',
                                  }}
                                >
                                  {analysis.conversation_type === 'lead'
                                    ? 'Lead Qualificado'
                                    : 'Mensagem Geral'}
                                </span>
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${scoreColor(
                                    analysis.lead_score
                                  )}`}
                                >
                                  Score: {analysis.lead_score}
                                </span>
                              </div>

                              {analysis.summary && (
                                <p className="text-[11px] text-navy-300">{analysis.summary}</p>
                              )}

                              {extracted.vehicle_interest && (
                                <div className="flex items-center gap-1 text-[11px] text-navy-300">
                                  <Car size={11} className="text-accent-400" />
                                  <span>Interesse: </span>
                                  <strong className="text-white">{extracted.vehicle_interest}</strong>
                                </div>
                              )}

                              {analysis.suggested_action && (
                                <div className="flex items-start gap-1 pt-0.5">
                                  <ChevronRight size={12} className="text-accent-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-[11px] text-accent-300 font-medium">
                                    {analysis.suggested_action}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-navy-700/40 bg-navy-900/90 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 pl-1">
                    <ChannelLogo channel={selected.channel} size="sm" showBadge={true} />
                  </div>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`Responder pelo ${channelLabel(selected.channel)}...`}
                    className="flex-1 bg-navy-950/70 border border-navy-700/60 rounded-xl px-4 py-2.5 text-white text-xs placeholder:text-navy-500 focus:outline-none focus:border-accent-500 transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !input.trim()}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white transition-all shadow-md shadow-accent-500/20 disabled:opacity-40 flex-shrink-0"
                    title={`Enviar resposta via ${channelLabel(selected.channel)}`}
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-navy-500 mt-1.5 px-2">
                  <span>
                    Sua resposta é sincronizada em tempo real com o{' '}
                    <strong className="text-navy-300">{channelLabel(selected.channel)}</strong>
                  </span>
                  <span className="font-mono">Enter para enviar</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Column 3: Lead & Negotiation Context */}
        <div className="w-80 flex-shrink-0 glass-card rounded-2xl flex flex-col overflow-hidden border border-navy-700/50">
          {!currentLead && !currentVehicle ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <User size={36} className="text-navy-600 mx-auto mb-3" />
                <p className="text-xs text-navy-300 font-bold">Nenhum cliente vinculado</p>
                <p className="text-[11px] text-navy-500 mt-1">
                  {selected
                    ? 'Esta conversa pode ser cadastrada como lead comercial para gerar propostas.'
                    : 'Selecione uma conversa para ver dados de CRM'}
                </p>
                {selected && (
                  <button
                    onClick={() => setShowLeadModal(true)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-semibold transition-all border border-accent-500/30"
                  >
                    <Plus size={13} /> Criar ficha de cliente
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Lead Header */}
              {currentLead && (
                <div className="p-3.5 border-b border-navy-700/40 bg-navy-900/40">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-extrabold text-white truncate">{currentLead.name}</h3>
                      <p className="text-[10px] text-navy-400">
                        {sourceLabel(currentLead.source)} · {scoreLabel(currentLead.lead_score)}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${scoreColor(
                        currentLead.lead_score
                      )}`}
                    >
                      <Flame size={10} /> {currentLead.lead_score}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs mt-2">
                    {currentLead.phone && (
                      <a
                        href={`https://wa.me/55${currentLead.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-navy-300 hover:text-emerald-400 transition-colors text-[11px]"
                      >
                        <Phone size={11} className="text-emerald-400" /> {currentLead.phone}
                      </a>
                    )}
                    {currentLead.email && (
                      <span className="flex items-center gap-1 text-navy-300 text-[11px] truncate">
                        <Mail size={11} className="text-accent-400" /> {currentLead.email}
                      </span>
                    )}
                  </div>

                  {/* Pipeline Stage buttons */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {PIPELINE_STAGES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => changeLeadStatus(s.value)}
                        className={`text-[9px] px-2 py-0.5 rounded-md border transition-all ${
                          currentLead.status === s.value
                            ? s.bgColor + ' ' + s.color + ' font-bold'
                            : 'border-navy-700 text-navy-500 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex border-b border-navy-700/40 bg-navy-900/60">
                {(['cliente', 'veiculo', 'interacoes', 'acompanhamentos'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setRightTab(t)}
                    className={`flex-1 py-2 text-[10px] font-bold border-b-2 transition-all uppercase tracking-wider ${
                      rightTab === t
                        ? 'border-accent-500 text-accent-400'
                        : 'border-transparent text-navy-500 hover:text-navy-300'
                    }`}
                  >
                    {t === 'cliente'
                      ? 'Dados'
                      : t === 'veiculo'
                      ? 'Veículo'
                      : t === 'interacoes'
                      ? `Notas (${interactions.length})`
                      : `Acomp.`}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {rightTab === 'cliente' && currentLead && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-1.5">
                      {currentLead.budget != null && (
                        <div className="glass rounded-xl p-2 text-center">
                          <p className="text-[9px] text-navy-500 uppercase font-bold">Orçamento</p>
                          <p className="text-[11px] text-white font-extrabold mt-0.5">
                            {formatCurrency(Number(currentLead.budget))}
                          </p>
                        </div>
                      )}
                      {currentLead.down_payment != null && (
                        <div className="glass rounded-xl p-2 text-center">
                          <p className="text-[9px] text-navy-500 uppercase font-bold">Entrada</p>
                          <p className="text-[11px] text-white font-extrabold mt-0.5">
                            {formatCurrency(Number(currentLead.down_payment))}
                          </p>
                        </div>
                      )}
                      {currentLead.max_installment != null && (
                        <div className="glass rounded-xl p-2 text-center">
                          <p className="text-[9px] text-navy-500 uppercase font-bold">Parcela máx.</p>
                          <p className="text-[11px] text-white font-extrabold mt-0.5">
                            {formatCurrency(Number(currentLead.max_installment))}
                          </p>
                        </div>
                      )}
                    </div>

                    {currentLead.notes && (
                      <div className="glass rounded-xl p-2.5">
                        <p className="text-[9px] text-navy-500 uppercase font-bold mb-1">Notas Comerciais</p>
                        <p className="text-xs text-navy-200 whitespace-pre-wrap">{currentLead.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {rightTab === 'veiculo' && (
                  <div className="space-y-3">
                    {currentVehicle ? (
                      <div className="glass rounded-xl p-3 space-y-2 border border-navy-700/60">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-accent-400 font-bold uppercase tracking-wider">
                            Veículo Vinculado
                          </span>
                          {currentVehicle.status && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-success-500/15 text-success-400 font-bold border border-success-500/30">
                              {currentVehicle.status}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-extrabold text-white">
                          {currentVehicle.brand} {currentVehicle.model}
                        </h4>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div>
                            <span className="text-[10px] text-navy-500">Ano:</span>
                            <p className="font-semibold text-white">
                              {currentVehicle.year_manufacture}/{currentVehicle.year_model}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-navy-500">Preço:</span>
                            <p className="font-extrabold text-gold-400">
                              {currentVehicle.asking_price
                                ? formatCurrency(currentVehicle.asking_price)
                                : 'A consultar'}
                            </p>
                          </div>
                          {currentVehicle.plate && (
                            <div>
                              <span className="text-[10px] text-navy-500">Placa:</span>
                              <p className="font-mono text-white">{currentVehicle.plate}</p>
                            </div>
                          )}
                          {currentVehicle.fuel && (
                            <div>
                              <span className="text-[10px] text-navy-500">Combustível:</span>
                              <p className="text-white">{currentVehicle.fuel}</p>
                            </div>
                          )}
                        </div>

                        {currentVehicle.id && (
                          <div className="pt-2">
                            <a
                              href={`/veiculos/${currentVehicle.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-semibold border border-accent-500/30 transition-all"
                            >
                              <span>Ver Estoque Completo</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-navy-500 text-xs">
                        Nenhum veículo vinculado a este atendimento.
                      </div>
                    )}
                  </div>
                )}

                {rightTab === 'interacoes' && (
                  <div className="space-y-2">
                    {showAddInteraction ? (
                      <div className="glass rounded-xl p-3 space-y-2 border border-navy-700/60">
                        <select
                          value={newInteraction.type}
                          onChange={(e) =>
                            setNewInteraction({ ...newInteraction, type: e.target.value as InteractionType })
                          }
                          className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                        >
                          {INTERACTION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={newInteraction.description}
                          onChange={(e) =>
                            setNewInteraction({ ...newInteraction, description: e.target.value })
                          }
                          rows={2}
                          placeholder="Detalhes da conversa/ligação..."
                          className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-white text-xs resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowAddInteraction(false)}
                            className="px-2.5 py-1 text-xs text-navy-400"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={addInteraction}
                            className="px-3 py-1 bg-accent-500 text-white rounded-lg text-xs font-bold"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddInteraction(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-navy-800/80 hover:bg-navy-800 text-accent-300 text-xs font-semibold border border-navy-700/60 transition-all"
                      >
                        <Plus size={13} /> Registrar Nota
                      </button>
                    )}

                    {interactions.map((it) => (
                      <div key={it.id} className="glass rounded-xl p-2.5 text-xs space-y-1">
                        <div className="flex items-center justify-between text-navy-400">
                          <span className="font-semibold text-white">{interactionLabel(it.type)}</span>
                          <span className="text-[10px]">{formatDate(it.created_at)}</span>
                        </div>
                        {it.description && <p className="text-navy-300 text-[11px]">{it.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {rightTab === 'acompanhamentos' && (
                  <div className="space-y-2">
                    {followUps.length === 0 ? (
                      <div className="text-center py-6 text-navy-500 text-xs">
                        Nenhum lembrete ou acompanhamento agendado.
                      </div>
                    ) : (
                      followUps.map((f) => (
                        <div key={f.id} className="glass rounded-xl p-2.5 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{followUpTypeLabel(f.type)}</span>
                            <span className="text-[10px] text-navy-400">{formatDate(f.scheduled_at)}</span>
                          </div>
                          {f.message && <p className="text-navy-300 text-[11px]">{f.message}</p>}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lead Edit Modal */}
      {showLeadModal && (
        <LeadModal
          lead={currentLead || undefined}
          onClose={() => setShowLeadModal(false)}
          onSaved={() => {
            setShowLeadModal(false);
            loadConversations();
            loadLeadStats();
            if (selected?.lead) loadLeadDetails(selected.lead.id);
          }}
        />
      )}
    </div>
  );
}
