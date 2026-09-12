import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Send, Search, CheckCircle2, Sparkles, User, Car, ChevronRight,
  AlertCircle, MessageSquare, Phone, Mail, Plus, Calendar, Flame,
  Tag, Trash2, X, Clock, TrendingUp, Target, Calculator, Zap,
  Bot, Pencil, ThumbsUp, Filter, Snowflake, Sun, RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, type ConversationWithLead, type Message, type Lead, type LeadInteraction, type LeadFollowUp, type InteractionType, type FollowUpType, type LeadStatus, type ConversationTemperature } from '@/lib/supabase';
import {
  channelLabel, channelColor, loadMessages, sendMessageViaPlatform, markConversationRead,
  getAIReplySuggestion, temperatureLabel, temperatureColor, type Temperature,
} from '@/lib/integrations';
import { PIPELINE_STAGES, INTERACTION_TYPES, FOLLOW_UP_TYPES, interactionLabel, followUpTypeLabel, sourceLabel, scoreColor, scoreLabel, timeAgo, isOverdue } from '@/lib/crm';
import { formatCurrency, formatDate } from '@/lib/format';
import { LeadModal } from '@/components/LeadModal';

type AIAnalysis = {
  sentiment?: string;
  summary?: string;
  lead_score?: number;
  suggested_action?: string;
  is_lead?: boolean;
  is_personal?: boolean;
  conversation_type?: string;
  temperature?: Temperature;
  next_best_action?: string;
  reply_suggestion?: string | null;
};

type ExtractedData = {
  vehicle_interest?: string;
  budget?: number;
  down_payment?: number;
  max_installment?: number;
  intent?: string;
  conversation_type?: string;
  temperature?: Temperature;
  purchase_intent?: string;
  financing_interest?: boolean;
  trade_in_interest?: boolean;
  estimated_budget?: number;
  preferred_down_payment?: number;
  purchase_deadline?: string;
};

type RightTab = 'cliente' | 'interacoes' | 'acompanhamentos';

type ConvFilter = 'all' | 'new' | 'unanswered' | 'hot' | 'negotiation' | 'financing' | 'followup' | 'won' | 'lost';

type AIMode = 'manual' | 'suggestion' | 'automatic';

const FILTER_LABELS: { value: ConvFilter; label: string; icon?: typeof Flame }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'new', label: 'Novos' },
  { value: 'unanswered', label: 'Não respondidos' },
  { value: 'hot', label: 'Quentes', icon: Flame },
  { value: 'negotiation', label: 'Em negociação' },
  { value: 'financing', label: 'Financiamento', icon: Calculator },
  { value: 'followup', label: 'Follow-up' },
  { value: 'won', label: 'Vendidos' },
  { value: 'lost', label: 'Perdidos' },
];

function tempBadge(t: ConversationTemperature) {
  if (t === 'hot') return { icon: Flame, color: '#ef4444', bg: 'bg-error-500/15', border: 'border-error-500/30', label: 'HOT' };
  if (t === 'warm') return { icon: Sun, color: '#f59e0b', bg: 'bg-warning-500/15', border: 'border-warning-500/30', label: 'WARM' };
  if (t === 'cold') return { icon: Snowflake, color: '#3b82f6', bg: 'bg-accent-500/15', border: 'border-accent-500/30', label: 'COLD' };
  return null;
}

export function AtendimentoPage() {
  const { dealer } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationWithLead[]>([]);
  const [selected, setSelected] = useState<ConversationWithLead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<{ delivered: boolean; error: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [convFilter, setConvFilter] = useState<ConvFilter>('all');

  // AI state
  const [aiMode, setAiMode] = useState<AIMode>('suggestion');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState(false);
  const [editedSuggestion, setEditedSuggestion] = useState('');

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
  const [leadStats, setLeadStats] = useState({ total: 0, quentes: 0, vendidos: 0, acompanhamentosHoje: 0, semResposta: 0, emNegociacao: 0, financiamentos: 0 });

  const loadConversations = useCallback(async () => {
    if (!dealer) return;
    const { data, error } = await supabase
      .from('conversations')
      .select('*, lead:leads(*), vehicle:vehicles(id, brand, model, year_model, asking_price)')
      .eq('dealer_id', dealer.id)
      .order('last_message_at', { ascending: false, nullsFirst: false });
    if (!error && data) setConversations(data as ConversationWithLead[]);
    setLoading(false);
  }, [dealer]);

  const loadLeadStats = useCallback(async () => {
    if (!dealer) return;
    const { data: leads } = await supabase.from('leads').select('lead_score, status, budget, down_payment').eq('dealer_id', dealer.id);
    const { data: convs } = await supabase.from('conversations').select('unread_count, ai_temperature, lead_id').eq('dealer_id', dealer.id);
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase.from('lead_follow_ups').select('*', { count: 'exact', head: true }).eq('dealer_id', dealer.id).eq('status', 'pending').gte('scheduled_at', today + 'T00:00:00').lte('scheduled_at', today + 'T23:59:59');
    if (leads) {
      setLeadStats({
        total: leads.length,
        quentes: leads.filter((l) => l.lead_score >= 70).length,
        vendidos: leads.filter((l) => l.status === 'won').length,
        acompanhamentosHoje: count || 0,
        semResposta: (convs || []).filter((c) => c.unread_count > 0).length,
        emNegociacao: leads.filter((l) => l.status === 'negotiation').length,
        financiamentos: leads.filter((l) => l.down_payment != null || l.budget != null).length,
      });
    }
  }, [dealer]);

  useEffect(() => { loadConversations(); loadLeadStats(); }, [loadConversations, loadLeadStats]);

  // Load AI mode from localStorage
  useEffect(() => {
    if (dealer) {
      const saved = localStorage.getItem(`ai_mode_${dealer.id}`);
      if (saved === 'manual' || saved === 'suggestion' || saved === 'automatic') setAiMode(saved);
    }
  }, [dealer]);

  function saveAIMode(mode: AIMode) {
    setAiMode(mode);
    if (dealer) localStorage.setItem(`ai_mode_${dealer.id}`, mode);
  }

  // Realtime
  useEffect(() => {
    if (!dealer) return;
    const convChannel = supabase.channel('conv-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `dealer_id=eq.${dealer.id}` }, () => { loadConversations(); }).subscribe();
    const msgChannel = supabase.channel('msg-rt').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `dealer_id=eq.${dealer.id}` }, (payload) => {
      const newMsg = payload.new as Message;
      if (selected && newMsg.conversation_id === selected.id) {
        setMessages((prev) => [...prev, newMsg]);
        markConversationRead(selected.id);
        // Auto-generate AI suggestion for inbound messages
        if (newMsg.direction === 'inbound' && aiMode !== 'manual') {
          generateAISuggestion(newMsg.content);
        }
      }
    }).subscribe();
    return () => { supabase.removeChannel(convChannel); supabase.removeChannel(msgChannel); };
  }, [dealer, selected?.id, loadConversations, aiMode]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (selected) {
      setMsgLoading(true); setDeliveryStatus(null); setAiSuggestion(null);
      loadMessages(selected.id).then((msgs) => {
        setMessages(msgs); setMsgLoading(false); markConversationRead(selected.id);
        setConversations((prev) => prev.map((c) => c.id === selected.id ? { ...c, unread_count: 0 } : c));
        // Generate AI suggestion for the last inbound message
        if (aiMode !== 'manual') {
          const lastInbound = [...msgs].reverse().find((m) => m.direction === 'inbound');
          if (lastInbound) generateAISuggestion(lastInbound.content);
        }
      });
      if (selected.lead) { loadLeadDetails(selected.lead.id); }
    }
  }, [selected?.id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function generateAISuggestion(messageContent: string) {
    if (!messageContent || aiMode === 'manual') return;
    setAiLoading(true);
    const result = await getAIReplySuggestion(messageContent);
    setAiSuggestion(result.reply_suggestion);
    setAiLoading(false);
  }

  async function loadLeadDetails(leadId: string) {
    setRightLoading(true);
    const [iRes, fRes] = await Promise.all([
      supabase.from('lead_interactions').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
      supabase.from('lead_follow_ups').select('*').eq('lead_id', leadId).order('scheduled_at', { ascending: false }),
    ]);
    if (iRes.data) setInteractions(iRes.data as LeadInteraction[]);
    if (fRes.data) setFollowUps(fRes.data as LeadFollowUp[]);
    setRightLoading(false);
  }

  // Apply conversation filter
  const filtered = conversations.filter((c) => {
    const matchesSearch = !search || (c.contact_name || '').toLowerCase().includes(search.toLowerCase()) || (c.contact_phone || '').includes(search);

    let matchesFilter = true;
    switch (convFilter) {
      case 'new':
        matchesFilter = c.lead?.status === 'new' || (!c.lead_id && c.unread_count > 0);
        break;
      case 'unanswered':
        matchesFilter = c.unread_count > 0;
        break;
      case 'hot':
        matchesFilter = c.ai_temperature === 'hot';
        break;
      case 'negotiation':
        matchesFilter = c.lead?.status === 'negotiation' || c.lead?.status === 'proposal';
        break;
      case 'financing':
        matchesFilter = c.lead?.down_payment != null || c.lead?.budget != null;
        break;
      case 'followup': {
        // conversations with pending follow-ups today
        matchesFilter = followUps.some((f) => f.lead_id === c.lead_id && f.status === 'pending');
        break;
      }
      case 'won':
        matchesFilter = c.lead?.status === 'won';
        break;
      case 'lost':
        matchesFilter = c.lead?.status === 'lost';
        break;
      default:
        matchesFilter = true;
    }
    return matchesSearch && matchesFilter;
  });

  const unreadTotal = conversations.reduce((s, c) => s + c.unread_count, 0);
  const currentLead = selected?.lead || null;

  // Check if financing button should show
  const showFinancingButton = (() => {
    if (!messages.length) return false;
    const lastInbound = [...messages].reverse().find((m) => m.direction === 'inbound');
    if (!lastInbound) return false;
    const extracted = lastInbound.ai_extracted_data as unknown as ExtractedData | null;
    return extracted?.financing_interest === true || extracted?.preferred_down_payment != null;
  })();

  function handleSimulateFinancing() {
    if (!selected) return;
    const params = new URLSearchParams();
    if (selected.vehicle_id) params.set('veiculo', selected.vehicle_id);
    // Extract from last inbound message
    const lastInbound = [...messages].reverse().find((m) => m.direction === 'inbound');
    if (lastInbound) {
      const extracted = lastInbound.ai_extracted_data as unknown as ExtractedData | null;
      if (extracted?.preferred_down_payment) params.set('entrada', extracted.preferred_down_payment.toString());
    }
    navigate(`/financiamento/novo?${params.toString()}`);
  }

  async function handleSend(customContent?: string) {
    const content = (customContent ?? input).trim();
    if (!content || !selected || !dealer) return;
    setSending(true); setDeliveryStatus(null); setAiSuggestion(null); setEditingSuggestion(false);
    if (customContent) setInput('');
    const result = await sendMessageViaPlatform(selected.id, dealer.id, content);
    if (result.success && result.message) {
      setMessages([...messages, result.message]); setInput('');
      setConversations((prev) => prev.map((c) => c.id === selected.id ? { ...c, last_message_preview: content.slice(0, 100), last_message_at: new Date().toISOString() } : c));
      setDeliveryStatus({ delivered: result.delivered, error: result.error });
      setTimeout(() => setDeliveryStatus(null), 5000);
    } else {
      setDeliveryStatus({ delivered: false, error: result.error || 'Erro ao enviar' });
    }
    setSending(false);
  }

  function acceptSuggestion() {
    if (aiSuggestion) {
      setInput(aiSuggestion);
      setAiSuggestion(null);
    }
  }

  function editSuggestion() {
    setEditedSuggestion(aiSuggestion || '');
    setEditingSuggestion(true);
  }

  async function changeStatus(newStatus: LeadStatus) {
    if (!currentLead) return;
    const { error } = await supabase.from('leads').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', currentLead.id);
    if (!error) { loadLeadStats(); loadConversations(); if (selected) setSelected({ ...selected, lead: { ...currentLead, status: newStatus } }); }
  }

  async function addInteraction() {
    if (!currentLead || !newInteraction.description.trim()) return;
    const { data, error } = await supabase.from('lead_interactions').insert({ lead_id: currentLead.id, dealer_id: currentLead.dealer_id, type: newInteraction.type, description: newInteraction.description.trim(), vehicle_id: currentLead.vehicle_id }).select('*').single();
    if (!error && data) {
      setInteractions([data as LeadInteraction, ...interactions]);
      await supabase.from('leads').update({ last_interaction_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', currentLead.id);
      setNewInteraction({ type: 'whatsapp', description: '' }); setShowAddInteraction(false);
    }
  }

  async function addFollowUp() {
    if (!currentLead || !newFollowUp.scheduledAt || !newFollowUp.message.trim()) return;
    const { data, error } = await supabase.from('lead_follow_ups').insert({ lead_id: currentLead.id, dealer_id: currentLead.dealer_id, scheduled_at: new Date(newFollowUp.scheduledAt).toISOString(), message: newFollowUp.message.trim(), type: newFollowUp.type, status: 'pending' }).select('*').single();
    if (!error && data) { setFollowUps([data as LeadFollowUp, ...followUps]); setNewFollowUp({ type: 'whatsapp', message: '', scheduledAt: '' }); setShowAddFollowUp(false); loadLeadStats(); }
  }

  async function completeFollowUp(id: string) {
    const { error } = await supabase.from('lead_follow_ups').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', id);
    if (!error) { setFollowUps(followUps.map((f) => f.id === id ? { ...f, status: 'done', completed_at: new Date().toISOString() } : f)); loadLeadStats(); }
  }

  function getAIAnalysis(msg: Message): AIAnalysis { return msg.ai_analysis as unknown as AIAnalysis; }
  function getExtractedData(msg: Message): ExtractedData { return msg.ai_extracted_data as unknown as ExtractedData; }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-gold-500/20 border border-accent-500/30 flex items-center justify-center relative">
            <MessageSquare size={20} className="text-accent-400" />
            {unreadTotal > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-error-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{unreadTotal}</span>}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Atendimento 360°</h1>
            <p className="text-sm text-navy-400">Conversas e clientes em um só lugar</p>
          </div>
        </div>
        {/* Mini stats */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="text-center"><p className="text-lg font-bold text-accent-400">{leadStats.total}</p><p className="text-[10px] text-navy-500 uppercase">Clientes</p></div>
          <div className="text-center"><p className="text-lg font-bold text-error-400">{leadStats.quentes}</p><p className="text-[10px] text-navy-500 uppercase">Quentes</p></div>
          <div className="text-center"><p className="text-lg font-bold text-warning-400">{leadStats.semResposta}</p><p className="text-[10px] text-navy-500 uppercase">Sem resposta</p></div>
          <div className="text-center"><p className="text-lg font-bold text-gold-400">{leadStats.acompanhamentosHoje}</p><p className="text-[10px] text-navy-500 uppercase">Follow-ups hoje</p></div>
          <div className="text-center"><p className="text-lg font-bold text-success-400">{leadStats.vendidos}</p><p className="text-[10px] text-navy-500 uppercase">Vendidos</p></div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Column 1: Conversation list with filters */}
        <div className="w-72 flex-shrink-0 glass-card rounded-2xl flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="p-3 border-b border-navy-600/30 space-y-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar conversa..."
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div className="flex flex-wrap gap-1">
              {FILTER_LABELS.map((f) => (
                <button key={f.value} onClick={() => setConvFilter(f.value)}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${convFilter === f.value ? 'bg-accent-500/20 border-accent-500/40 text-accent-300 font-semibold' : 'border-navy-600/30 text-navy-400 hover:text-white hover:bg-navy-700/30'}`}>
                  {f.icon && <f.icon size={9} className="inline mr-0.5" />}{f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare size={32} className="text-navy-500 mx-auto mb-3" />
                <p className="text-sm text-navy-300 font-medium">Nenhuma conversa</p>
                <p className="text-xs text-navy-500 mt-1">Conecte um canal em Integrações para começar</p>
              </div>
            ) : (
              filtered.map((conv) => {
                const badge = tempBadge(conv.ai_temperature);
                const TempIcon = badge?.icon;
                return (
                  <button key={conv.id} onClick={() => setSelected(conv)}
                    className={`w-full text-left p-3 border-b border-navy-700/20 transition-all hover:bg-navy-700/20 ${selected?.id === conv.id ? 'bg-accent-500/10 border-l-2 border-l-accent-500' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold relative" style={{ background: channelColor(conv.channel) + '30', border: `1px solid ${channelColor(conv.channel)}40` }}>
                        <span style={{ color: channelColor(conv.channel) }}>{(conv.contact_name || '?').charAt(0).toUpperCase()}</span>
                        {badge && TempIcon && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border border-navy-900" style={{ background: badge.color }}>
                            <TempIcon size={8} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white truncate">{conv.contact_name || 'Sem nome'}</p>
                          {conv.unread_count > 0 && <span className="bg-accent-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0">{conv.unread_count}</span>}
                        </div>
                        {conv.vehicle && (
                          <p className="text-[10px] text-accent-400 truncate mt-0.5 flex items-center gap-1">
                            <Car size={8} /> {conv.vehicle.brand} {conv.vehicle.model} {conv.vehicle.year_model || ''}
                          </p>
                        )}
                        <p className="text-xs text-navy-400 truncate mt-0.5">{conv.last_message_preview || 'Sem mensagens'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: channelColor(conv.channel) + '20', color: channelColor(conv.channel) }}>{channelLabel(conv.channel)}</span>
                          {badge && <span className="text-[10px] font-bold" style={{ color: badge.color }}>{badge.label}</span>}
                          <span className="text-[10px] text-navy-500 ml-auto">{timeAgo(conv.last_message_at)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Chat */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden min-w-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="text-navy-500 mx-auto mb-4" />
                <p className="text-navy-300 font-medium">Selecione uma conversa</p>
                <p className="text-sm text-navy-500 mt-1">Escolha uma conversa à esquerda para começar</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-3 border-b border-navy-600/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: channelColor(selected.channel) + '30', border: `1px solid ${channelColor(selected.channel)}40` }}>
                  <span style={{ color: channelColor(selected.channel) }}>{(selected.contact_name || '?').charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white truncate">{selected.contact_name || 'Sem nome'}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: channelColor(selected.channel) + '20', color: channelColor(selected.channel) }}>{channelLabel(selected.channel)}</span>
                    {(() => { const b = tempBadge(selected.ai_temperature); if (!b) return null; const BI = b.icon; return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${b.bg} ${b.border}`} style={{ color: b.color }}><BI size={8} className="inline mr-0.5" />{b.label}</span>; })()}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-navy-400">
                    {selected.vehicle && <span className="flex items-center gap-1 text-accent-400"><Car size={10} /> {selected.vehicle.brand} {selected.vehicle.model}</span>}
                    {selected.contact_phone && <span>{selected.contact_phone}</span>}
                  </div>
                </div>
                {/* AI Mode selector */}
                <div className="flex items-center gap-1 glass rounded-lg p-0.5">
                  <button onClick={() => saveAIMode('manual')} className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${aiMode === 'manual' ? 'bg-navy-600 text-white' : 'text-navy-400 hover:text-white'}`} title="IA apenas analisa">Manual</button>
                  <button onClick={() => saveAIMode('suggestion')} className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${aiMode === 'suggestion' ? 'bg-accent-500/20 text-accent-300' : 'text-navy-400 hover:text-white'}`} title="IA sugere respostas">Sugestão</button>
                  <button onClick={() => saveAIMode('automatic')} className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${aiMode === 'automatic' ? 'bg-gold-500/20 text-gold-300' : 'text-navy-400 hover:text-white'}`} title="IA responde automaticamente">Auto</button>
                </div>
                {currentLead && <button onClick={() => setShowLeadModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-medium transition-all"><User size={12} /> Editar</button>}
              </div>

              {/* AI summary */}
              {selected.ai_summary && (
                <div className={`px-4 py-2 border-b flex items-start gap-2 ${selected.ai_qualified ? 'bg-gold-500/8 border-gold-500/15' : 'bg-navy-700/20 border-navy-600/20'}`}>
                  <Sparkles size={14} className={`flex-shrink-0 mt-0.5 ${selected.ai_qualified ? 'text-gold-400' : 'text-navy-400'}`} />
                  <div className="flex-1 text-xs">
                    <span className={`font-medium ${selected.ai_qualified ? 'text-gold-400' : 'text-navy-300'}`}>IA: </span>
                    <span className="text-navy-200">{selected.ai_summary}</span>
                  </div>
                </div>
              )}

              {/* Delivery status */}
              {deliveryStatus && (
                <div className={`px-4 py-2 border-b text-xs flex items-center gap-2 ${deliveryStatus.delivered ? 'bg-success-500/10 border-success-500/20 text-success-400' : 'bg-warning-500/10 border-warning-500/20 text-warning-400'}`}>
                  {deliveryStatus.delivered ? <><CheckCircle2 size={12} /> Mensagem enviada pelo canal original</> : <><AlertCircle size={12} /> {deliveryStatus.error || 'Não foi possível enviar pelo canal'}</>}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgLoading ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-navy-500 text-sm py-8">Nenhuma mensagem</p>
                ) : (
                  messages.map((msg) => {
                    const analysis = getAIAnalysis(msg);
                    const extracted = getExtractedData(msg);
                    const isInbound = msg.direction === 'inbound';
                    const deliveryInfo = msg.ai_analysis as { delivery_status?: string };
                    return (
                      <div key={msg.id} className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
                        <div className="max-w-[75%]">
                          <div className={`rounded-2xl px-4 py-2.5 text-sm ${isInbound ? 'glass border border-navy-600/30 text-white' : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <p className="text-[10px] text-navy-500 mt-1 px-1 flex items-center gap-1.5">
                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            {!isInbound && deliveryInfo?.delivery_status === 'sent' && <CheckCircle2 size={10} className="text-success-400" />}
                          </p>
                          {isInbound && analysis.lead_score != null && (
                            <div className={`mt-2 glass rounded-xl p-2.5 border space-y-1 ${analysis.conversation_type === 'lead' ? 'border-gold-500/15' : 'border-navy-600/20'}`}>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Sparkles size={12} className={analysis.conversation_type === 'lead' ? 'text-gold-400' : 'text-navy-400'} />
                                <span className="text-[10px] font-bold uppercase" style={{ color: analysis.conversation_type === 'lead' ? '#e6c25e' : '#5a6a8a' }}>
                                  {analysis.conversation_type === 'lead' ? 'Cliente detectado' : analysis.conversation_type === 'spam' ? 'Spam' : 'Pessoal'}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${scoreColor(analysis.lead_score)}`}>Pontos: {analysis.lead_score}</span>
                                {extracted.temperature && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: temperatureColor(extracted.temperature), background: temperatureColor(extracted.temperature) + '20' }}>
                                    {temperatureLabel(extracted.temperature).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              {analysis.summary && <p className="text-xs text-navy-300">{analysis.summary}</p>}
                              {analysis.next_best_action && <div className="flex items-start gap-1"><ChevronRight size={12} className="text-accent-400 mt-0.5 flex-shrink-0" /><p className="text-xs text-accent-300">{analysis.next_best_action}</p></div>}
                              {extracted.vehicle_interest && <div className="flex items-center gap-1 text-xs text-navy-400"><Car size={10} /> Veículo: <span className="text-white">{extracted.vehicle_interest}</span></div>}
                              {extracted.budget != null && <div className="flex items-center gap-1 text-xs text-navy-400">Orçamento: <span className="text-white">R$ {Number(extracted.budget).toLocaleString('pt-BR')}</span></div>}
                              {extracted.preferred_down_payment != null && <div className="flex items-center gap-1 text-xs text-navy-400">Entrada: <span className="text-white">R$ {Number(extracted.preferred_down_payment).toLocaleString('pt-BR')}</span></div>}
                              {extracted.financing_interest && <div className="flex items-center gap-1 text-xs text-gold-400"><Calculator size={10} /> Quer financiamento</div>}
                              {extracted.trade_in_interest && <div className="flex items-center gap-1 text-xs text-navy-400"><TrendingUp size={10} /> Tem troca</div>}
                              {extracted.purchase_deadline && <div className="flex items-center gap-1 text-xs text-navy-400"><Clock size={10} /> Prazo: <span className="text-white">{extracted.purchase_deadline}</span></div>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* AI Reply Suggestion */}
              {aiMode !== 'manual' && (aiLoading || aiSuggestion) && !editingSuggestion && (
                <div className="px-4 py-3 border-t border-navy-600/30 bg-gold-500/5">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                      <Bot size={14} className="text-gold-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gold-400 uppercase mb-1 flex items-center gap-1"><Sparkles size={9} /> Sugestão da IA</p>
                      {aiLoading ? (
                        <div className="flex items-center gap-2 text-xs text-navy-400"><div className="w-3 h-3 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" /> Analisando conversa...</div>
                      ) : (
                        <>
                          <p className="text-sm text-white bg-navy-900/40 rounded-lg p-2 border border-gold-500/15">{aiSuggestion}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => acceptSuggestion()} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success-500/15 hover:bg-success-500/25 text-success-400 text-xs font-medium transition-all"><ThumbsUp size={11} /> Enviar</button>
                            <button onClick={() => editSuggestion()} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-medium transition-all"><Pencil size={11} /> Editar</button>
                            <button onClick={() => setAiSuggestion(null)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-navy-400 hover:text-white text-xs font-medium transition-all"><X size={11} /> Ignorar</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Editing suggestion */}
              {editingSuggestion && (
                <div className="px-4 py-3 border-t border-navy-600/30 bg-gold-500/5">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gold-500/15 flex items-center justify-center flex-shrink-0"><Bot size={14} className="text-gold-400" /></div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gold-400 uppercase mb-1">Editar sugestão</p>
                      <textarea value={editedSuggestion} onChange={(e) => setEditedSuggestion(e.target.value)} rows={2} className="w-full bg-navy-900/50 border border-gold-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500 resize-none" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => { setEditingSuggestion(false); setAiSuggestion(null); handleSend(editedSuggestion); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success-500/20 hover:bg-success-500/30 text-success-400 text-xs font-medium transition-all"><Send size={11} /> Enviar editada</button>
                        <button onClick={() => setEditingSuggestion(false)} className="px-3 py-1.5 rounded-lg text-navy-400 hover:text-white text-xs">Cancelar</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Financing action button */}
              {showFinancingButton && (
                <div className="px-4 py-2 border-t border-navy-600/30 bg-accent-500/5">
                  <button onClick={handleSimulateFinancing} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white text-sm font-semibold transition-all shadow-lg shadow-accent-500/20">
                    <Calculator size={16} /> Simular Financiamento
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-navy-600/30">
                <div className="flex items-center gap-2">
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={`Responder pelo ${channelLabel(selected.channel)}...`}
                    className="flex-1 bg-navy-900/50 border border-navy-600/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
                  <button onClick={() => handleSend()} disabled={sending || !input.trim()}
                    className="btn-shine ripple-btn flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-white transition-all shadow-lg shadow-accent-500/20 disabled:opacity-50 flex-shrink-0">
                    {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-navy-500 mt-1.5 px-1">Sua resposta é enviada direto no {channelLabel(selected.channel)} do cliente</p>
              </div>
            </>
          )}
        </div>

        {/* Column 3: Lead/client details */}
        <div className="w-80 flex-shrink-0 glass-card rounded-2xl flex flex-col overflow-hidden">
          {!currentLead ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <User size={40} className="text-navy-500 mx-auto mb-3" />
                <p className="text-sm text-navy-300 font-medium">Nenhum cliente vinculado</p>
                <p className="text-xs text-navy-500 mt-1">
                  {selected ? 'Esta conversa ainda não foi identificada como cliente pela IA' : 'Selecione uma conversa para ver os dados do cliente'}
                </p>
                {selected && !currentLead && selected.ai_qualified && (
                  <button onClick={() => setShowLeadModal(true)} className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-medium transition-all">
                    <Plus size={14} /> Criar cliente
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Lead header */}
              <div className="p-4 border-b border-navy-600/30">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{currentLead.name}</h3>
                    <p className="text-xs text-navy-400">{sourceLabel(currentLead.source)} · {scoreLabel(currentLead.lead_score)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${scoreColor(currentLead.lead_score)}`}>
                    <Flame size={10} /> {currentLead.lead_score}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {currentLead.phone && <a href={`https://wa.me/55${currentLead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="flex items-center gap-1 text-navy-200 hover:text-success-400"><Phone size={10} /> {currentLead.phone}</a>}
                  {currentLead.email && <span className="flex items-center gap-1 text-navy-200"><Mail size={10} /> {currentLead.email}</span>}
                </div>
                {/* Status changer */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {PIPELINE_STAGES.map((s) => (
                    <button key={s.value} onClick={() => changeStatus(s.value)}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition-all hover:scale-105 ${currentLead.status === s.value ? s.bgColor + ' ' + s.color + ' font-semibold' : 'border-navy-600/30 text-navy-400 hover:text-white'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-navy-600/30">
                {(['cliente', 'interacoes', 'acompanhamentos'] as const).map((t) => (
                  <button key={t} onClick={() => setRightTab(t)}
                    className={`flex-1 px-2 py-2.5 text-xs font-medium border-b-2 transition-all ${rightTab === t ? 'border-accent-500 text-accent-400' : 'border-transparent text-navy-400 hover:text-white'}`}>
                    {t === 'cliente' ? 'Dados' : t === 'interacoes' ? `Interações (${interactions.length})` : `Acompanhamentos (${followUps.filter((f) => f.status === 'pending').length})`}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {rightLoading ? (
                  <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
                ) : rightTab === 'cliente' ? (
                  <div className="space-y-3">
                    {selected?.vehicle && (
                      <div className="glass rounded-xl p-3 flex items-center gap-2 border border-accent-500/20">
                        <Car size={16} className="text-accent-400 flex-shrink-0" />
                        <div><p className="text-[10px] text-navy-400">Veículo de interesse</p><p className="text-xs text-white font-medium">{selected.vehicle.brand} {selected.vehicle.model} {selected.vehicle.year_model || ''}</p></div>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {currentLead.budget != null && <div className="glass rounded-lg p-2"><p className="text-[10px] text-navy-400 uppercase">Orçamento</p><p className="text-xs text-white font-bold">{formatCurrency(Number(currentLead.budget))}</p></div>}
                      {currentLead.down_payment != null && <div className="glass rounded-lg p-2"><p className="text-[10px] text-navy-400 uppercase">Entrada</p><p className="text-xs text-white font-bold">{formatCurrency(Number(currentLead.down_payment))}</p></div>}
                      {currentLead.max_installment != null && <div className="glass rounded-lg p-2"><p className="text-[10px] text-navy-400 uppercase">Parcela máx.</p><p className="text-xs text-white font-bold">{formatCurrency(Number(currentLead.max_installment))}</p></div>}
                    </div>
                    {currentLead.notes && <div className="glass rounded-xl p-3"><p className="text-[10px] text-navy-400 uppercase mb-1">Observações</p><p className="text-xs text-white whitespace-pre-wrap">{currentLead.notes}</p></div>}
                    <div className="glass rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-navy-400">Criado em</p><p className="text-white font-medium">{formatDate(currentLead.created_at)}</p></div>
                      <div><p className="text-navy-400">Última interação</p><p className="text-white font-medium">{timeAgo(currentLead.last_interaction_at)}</p></div>
                    </div>
                  </div>
                ) : rightTab === 'interacoes' ? (
                  <div className="space-y-2">
                    {showAddInteraction ? (
                      <div className="glass rounded-xl p-3 space-y-2">
                        <select value={newInteraction.type} onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as InteractionType })} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-500">
                          {INTERACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <textarea value={newInteraction.description} onChange={(e) => setNewInteraction({ ...newInteraction, description: e.target.value })} rows={2} placeholder="Descreva a interação..." className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-500 resize-none" />
                        <div className="flex gap-2">
                          <button onClick={() => setShowAddInteraction(false)} className="px-3 py-1 rounded-lg text-navy-300 hover:bg-navy-700/50 text-xs">Cancelar</button>
                          <button onClick={addInteraction} className="px-3 py-1 rounded-lg bg-accent-500 hover:bg-accent-400 text-white text-xs font-semibold">Adicionar</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAddInteraction(true)} className="w-full flex items-center justify-center gap-2 glass rounded-xl py-2 text-xs text-accent-400 hover:border-accent-500/40 border border-transparent transition-all">
                        <Plus size={14} /> Registrar interação
                      </button>
                    )}
                    {interactions.length === 0 ? <p className="text-center text-navy-500 text-xs py-4">Nenhuma interação registrada</p> : interactions.map((i) => (
                      <div key={i.id} className="glass rounded-xl p-2.5 flex items-start gap-2">
                        <div className="w-7 h-7 rounded-lg bg-accent-500/15 flex items-center justify-center flex-shrink-0"><MessageSquare size={12} className="text-accent-400" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between"><p className="text-xs font-medium text-white">{interactionLabel(i.type)}</p><span className="text-[10px] text-navy-500">{formatDate(i.created_at)}</span></div>
                          {i.description && <p className="text-xs text-navy-300 mt-1 whitespace-pre-wrap">{i.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {showAddFollowUp ? (
                      <div className="glass rounded-xl p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <select value={newFollowUp.type} onChange={(e) => setNewFollowUp({ ...newFollowUp, type: e.target.value as FollowUpType })} className="bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-500">
                            {FOLLOW_UP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                          <input type="datetime-local" value={newFollowUp.scheduledAt} onChange={(e) => setNewFollowUp({ ...newFollowUp, scheduledAt: e.target.value })} className="bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-500 [color-scheme:dark]" />
                        </div>
                        <textarea value={newFollowUp.message} onChange={(e) => setNewFollowUp({ ...newFollowUp, message: e.target.value })} rows={2} placeholder="Mensagem do acompanhamento..." className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-500 resize-none" />
                        <div className="flex gap-2">
                          <button onClick={() => setShowAddFollowUp(false)} className="px-3 py-1 rounded-lg text-navy-300 hover:bg-navy-700/50 text-xs">Cancelar</button>
                          <button onClick={addFollowUp} className="px-3 py-1 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-semibold">Agendar</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAddFollowUp(true)} className="w-full flex items-center justify-center gap-2 glass rounded-xl py-2 text-xs text-gold-400 hover:border-gold-500/40 border border-transparent transition-all">
                        <Plus size={14} /> Agendar acompanhamento
                      </button>
                    )}
                    {followUps.length === 0 ? <p className="text-center text-navy-500 text-xs py-4">Nenhum acompanhamento agendado</p> : followUps.map((f) => (
                      <div key={f.id} className={`glass rounded-xl p-2.5 ${isOverdue(f.scheduled_at, f.status) ? 'border-error-500/30' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar size={11} className={isOverdue(f.scheduled_at, f.status) ? 'text-error-400' : 'text-navy-400'} />
                              <span className="text-xs font-medium text-white">{followUpTypeLabel(f.type)}</span>
                              {f.ai_suggested && <span className="text-[10px] text-gold-400 flex items-center gap-0.5"><Sparkles size={8} /> IA</span>}
                              {isOverdue(f.scheduled_at, f.status) && <span className="text-[10px] text-error-400 font-medium">Atrasado</span>}
                            </div>
                            {f.message && <p className="text-xs text-navy-300 mb-1">{f.message}</p>}
                            <p className="text-[10px] text-navy-500">{formatDate(f.scheduled_at)} · {new Date(f.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          {f.status === 'pending' && (
                            <button onClick={() => completeFollowUp(f.id)} className="p-1.5 rounded-lg bg-success-500/15 hover:bg-success-500/25 text-success-400 transition-all flex-shrink-0" title="Concluir">
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {f.status === 'done' && <span className="text-[10px] text-success-400 flex items-center gap-1 flex-shrink-0"><CheckCircle2 size={10} /> Concluído</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lead edit modal */}
      {showLeadModal && (
        <LeadModal lead={currentLead || undefined} onClose={() => setShowLeadModal(false)} onSaved={() => { setShowLeadModal(false); loadConversations(); loadLeadStats(); if (selected?.lead) loadLeadDetails(selected.lead.id); }} />
      )}
    </div>
  );
}
