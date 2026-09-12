import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Send, Search, CheckCircle2, Sparkles, User,
  MessageSquare, Car, ChevronRight, AlertCircle, Plug,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type ConversationWithLead, type Message, type Lead } from '@/lib/supabase';
import { channelLabel, channelColor, loadMessages, sendMessageViaPlatform, markConversationRead } from '@/lib/integrations';
import { scoreColor, timeAgo } from '@/lib/crm';
import { LeadModal } from '@/components/LeadModal';

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

export function InboxPage() {
  const { dealer } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithLead[]>([]);
  const [selected, setSelected] = useState<ConversationWithLead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [sending, setSending] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<{ delivered: boolean; error: string | null } | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    if (!dealer) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('conversations')
      .select('*, lead:leads(*)')
      .eq('dealer_id', dealer.id)
      .order('last_message_at', { ascending: false, nullsFirst: false });
    if (!error && data) setConversations(data as ConversationWithLead[]);
    setLoading(false);
  }, [dealer]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Realtime: listen for new/updated conversations and new messages
  useEffect(() => {
    if (!dealer) return;
    const convChannel = supabase.channel('conversations-realtime').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conversations', filter: `dealer_id=eq.${dealer.id}` },
      () => { loadConversations(); }
    ).subscribe();

    const msgChannel = supabase.channel('messages-realtime').on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `dealer_id=eq.${dealer.id}` },
      (payload) => {
        const newMsg = payload.new as Message;
        if (selected && newMsg.conversation_id === selected.id) {
          setMessages((prev) => [...prev, newMsg]);
          markConversationRead(selected.id);
        }
      }
    ).subscribe();

    return () => {
      supabase.removeChannel(convChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [dealer, selected?.id, loadConversations]);

  useEffect(() => {
    if (selected) {
      setMsgLoading(true);
      setDeliveryStatus(null);
      loadMessages(selected.id).then((msgs) => {
        setMessages(msgs);
        setMsgLoading(false);
        markConversationRead(selected.id);
        setConversations((prev) => prev.map((c) => c.id === selected.id ? { ...c, unread_count: 0 } : c));
      });
    }
  }, [selected?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filtered = conversations.filter((c) => {
    const matchesSearch = !search || (c.contact_name || '').toLowerCase().includes(search.toLowerCase()) || (c.contact_phone || '').includes(search);
    const matchesChannel = channelFilter === 'all' || c.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  const unreadTotal = conversations.reduce((s, c) => s + c.unread_count, 0);

  async function handleSend() {
    if (!input.trim() || !selected || !dealer) return;
    setSending(true);
    setDeliveryStatus(null);
    const result = await sendMessageViaPlatform(selected.id, dealer.id, input.trim());
    if (result.success && result.message) {
      setMessages([...messages, result.message]);
      setInput('');
      setConversations((prev) => prev.map((c) => c.id === selected.id ? { ...c, last_message_preview: input.trim().slice(0, 100), last_message_at: new Date().toISOString() } : c));
      setDeliveryStatus({ delivered: result.delivered, error: result.error });
      // Clear delivery status after 5 seconds
      setTimeout(() => setDeliveryStatus(null), 5000);
    } else {
      setDeliveryStatus({ delivered: false, error: result.error || 'Erro ao enviar mensagem' });
    }
    setSending(false);
  }

  function getAIAnalysis(msg: Message): AIAnalysis {
    return msg.ai_analysis as unknown as AIAnalysis;
  }

  function getExtractedData(msg: Message): ExtractedData {
    return msg.ai_extracted_data as unknown as ExtractedData;
  }

  const channels = ['whatsapp', 'instagram', 'facebook', 'olx', 'webmotors', 'site'];

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-gold-500/20 border border-accent-500/30 flex items-center justify-center relative">
            <MessageSquare size={20} className="text-accent-400" />
            {unreadTotal > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-error-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{unreadTotal}</span>}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Inbox</h1>
            <p className="text-sm text-navy-400">Todas as conversas em um só lugar — respostas enviadas pelo canal original</p>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Conversation list */}
        <div className="w-80 flex-shrink-0 glass-card rounded-2xl flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="p-3 border-b border-navy-600/30 space-y-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-500 cursor-pointer">
              <option value="all">Todos canais</option>
              {channels.map((c) => <option key={c} value={c}>{channelLabel(c)}</option>)}
            </select>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare size={36} className="text-navy-500 mx-auto mb-3" />
                <p className="text-sm text-navy-300 font-medium">Nenhuma conversa</p>
                <p className="text-xs text-navy-500 mt-1">Conecte um canal em Integrações para começar a receber mensagens</p>
              </div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full text-left p-3 border-b border-navy-700/20 transition-all hover:bg-navy-700/20 ${selected?.id === conv.id ? 'bg-accent-500/10 border-l-2 border-l-accent-500' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: channelColor(conv.channel) + '30', border: `1px solid ${channelColor(conv.channel)}40` }}>
                      <span style={{ color: channelColor(conv.channel) }}>{(conv.contact_name || '?').charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">{conv.contact_name || 'Sem nome'}</p>
                        {conv.unread_count > 0 && <span className="bg-accent-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0">{conv.unread_count}</span>}
                      </div>
                      <p className="text-xs text-navy-400 truncate mt-0.5">{conv.last_message_preview || 'Sem mensagens'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: channelColor(conv.channel) + '20', color: channelColor(conv.channel) }}>{channelLabel(conv.channel)}</span>
                        {conv.ai_qualified && <span className="text-[10px] text-gold-400 flex items-center gap-0.5"><Sparkles size={8} /> Lead</span>}
                        {!conv.ai_qualified && conv.ai_intent && <span className="text-[10px] text-navy-500">Pessoal</span>}
                        <span className="text-[10px] text-navy-500 ml-auto">{timeAgo(conv.last_message_at)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="text-navy-500 mx-auto mb-4" />
                <p className="text-navy-300 font-medium">Selecione uma conversa</p>
                <p className="text-sm text-navy-500 mt-1">Escolha uma conversa à esquerda para visualizar</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-navy-600/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ background: channelColor(selected.channel) + '30', border: `1px solid ${channelColor(selected.channel)}40` }}>
                  <span style={{ color: channelColor(selected.channel) }}>{(selected.contact_name || '?').charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{selected.contact_name || 'Sem nome'}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: channelColor(selected.channel) + '20', color: channelColor(selected.channel) }}>{channelLabel(selected.channel)}</span>
                    {selected.ai_qualified ? (
                      <span className="text-[10px] text-gold-400 flex items-center gap-0.5"><Sparkles size={8} /> Lead qualificado</span>
                    ) : (
                      <span className="text-[10px] text-navy-500">Conversa pessoal</span>
                    )}
                  </div>
                  <p className="text-xs text-navy-400">{selected.contact_phone || selected.contact_handle || ''}</p>
                </div>
                {selected.lead && (
                  <button onClick={() => { setEditLead(selected.lead || null); setShowLeadModal(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-medium transition-all">
                    <User size={12} /> Ver Lead
                  </button>
                )}
              </div>

              {/* AI summary banner */}
              {selected.ai_summary && (
                <div className={`px-4 py-2.5 border-b flex items-start gap-2 ${selected.ai_qualified ? 'bg-gold-500/8 border-gold-500/15' : 'bg-navy-700/20 border-navy-600/20'}`}>
                  <Sparkles size={14} className={`flex-shrink-0 mt-0.5 ${selected.ai_qualified ? 'text-gold-400' : 'text-navy-400'}`} />
                  <div className="flex-1 text-xs">
                    <span className={`font-medium ${selected.ai_qualified ? 'text-gold-400' : 'text-navy-300'}`}>IA: </span>
                    <span className="text-navy-200">{selected.ai_summary}</span>
                    {selected.ai_intent && <span className="text-navy-400 ml-2">· Intenção: {selected.ai_intent}</span>}
                  </div>
                </div>
              )}

              {/* Delivery status */}
              {deliveryStatus && (
                <div className={`px-4 py-2 border-b text-xs flex items-center gap-2 ${deliveryStatus.delivered ? 'bg-success-500/10 border-success-500/20 text-success-400' : 'bg-warning-500/10 border-warning-500/20 text-warning-400'}`}>
                  {deliveryStatus.delivered ? (
                    <><CheckCircle2 size={12} /> Mensagem enviada pelo canal original</>
                  ) : (
                    <><AlertCircle size={12} /> {deliveryStatus.error || 'Não foi possível enviar pelo canal. Mensagem salva no inbox.'}</>
                  )}
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
                    const deliveryInfo = msg.ai_analysis as { delivery_status?: string; delivery_error?: string };
                    return (
                      <div key={msg.id} className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
                        <div className="max-w-[75%]">
                          <div className={`rounded-2xl px-4 py-2.5 text-sm ${isInbound ? 'glass border border-navy-600/30 text-white' : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <p className="text-[10px] text-navy-500 mt-1 px-1 flex items-center gap-1.5">
                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            {!isInbound && deliveryInfo.delivery_status === 'sent' && <span className="text-success-400"><CheckCircle2 size={10} /></span>}
                            {!isInbound && deliveryInfo.delivery_status === 'failed' && <span className="text-warning-400" title={deliveryInfo.delivery_error}><AlertCircle size={10} /></span>}
                          </p>

                          {/* AI analysis for inbound messages */}
                          {isInbound && analysis.lead_score != null && (
                            <div className={`mt-2 glass rounded-xl p-2.5 border space-y-1.5 ${analysis.conversation_type === 'lead' ? 'border-gold-500/15' : 'border-navy-600/20'}`}>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Sparkles size={12} className={analysis.conversation_type === 'lead' ? 'text-gold-400' : 'text-navy-400'} />
                                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: analysis.conversation_type === 'lead' ? '#e6c25e' : '#5a6a8a' }}>
                                  {analysis.conversation_type === 'lead' ? 'Lead Detectado' : analysis.conversation_type === 'spam' ? 'Spam' : 'Conversa Pessoal'}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${scoreColor(analysis.lead_score)}`}>Score: {analysis.lead_score}</span>
                                {analysis.sentiment && <span className="text-[10px] text-navy-400">Sentimento: {analysis.sentiment}</span>}
                              </div>
                              {analysis.summary && <p className="text-xs text-navy-300">{analysis.summary}</p>}
                              {analysis.suggested_action && (
                                <div className="flex items-start gap-1.5">
                                  <ChevronRight size={12} className="text-accent-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-accent-300">{analysis.suggested_action}</p>
                                </div>
                              )}
                              {extracted.vehicle_interest && (
                                <div className="flex items-center gap-1 text-xs text-navy-400">
                                  <Car size={10} /> Veículo: <span className="text-white">{extracted.vehicle_interest}</span>
                                </div>
                              )}
                              {extracted.budget != null && (
                                <div className="flex items-center gap-1 text-xs text-navy-400">
                                  Orçamento: <span className="text-white">R$ {Number(extracted.budget).toLocaleString('pt-BR')}</span>
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

              {/* Input */}
              <div className="p-3 border-t border-navy-600/30">
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`Responder via ${channelLabel(selected.channel)}...`}
                    className="flex-1 bg-navy-900/50 border border-navy-600/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500"
                  />
                  <button onClick={handleSend} disabled={sending || !input.trim()}
                    className="btn-shine ripple-btn flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white transition-all shadow-lg shadow-accent-500/20 disabled:opacity-50 flex-shrink-0">
                    {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-navy-500 mt-1.5 px-1">
                  Sua resposta será enviada diretamente no {channelLabel(selected.channel)} do cliente
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lead modal */}
      {showLeadModal && editLead && (
        <LeadModal lead={editLead} onClose={() => setShowLeadModal(false)} onSaved={() => { setShowLeadModal(false); loadConversations(); }} />
      )}
    </div>
  );
}
