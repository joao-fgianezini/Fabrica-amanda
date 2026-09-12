import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, Image as ImageIcon, Loader2, Bot, AlertCircle, StopCircle } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  isFallback?: boolean;
};

type Props = {
  platformContext: string | null;
  webhookUrl: string;
};

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUGGESTIONS = [
  'Como conectar o WhatsApp?',
  'Onde encontro o Access Token?',
  'Como configurar o webhook?',
  'Não consigo achar o Page ID',
  'Quanto custa a API do WhatsApp?',
];

// Parse SSE stream from OpenRouter
async function* parseSSE(response: Response): AsyncGenerator<string> {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed chunks
      }
    }
  }
}

export function IntegrationHelpChat({ platformContext }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = platformContext
        ? `Olá! Vi que você está configurando o **${platformContextLabel(platformContext)}**. Posso te ajudar passo a passo! Me pergunte qualquer dúvida ou envie um print da tela se travou em algum lugar.`
        : `Olá! Sou a IA assistente da Rede Auto. Posso te ajudar a conectar WhatsApp, Instagram, Facebook, OLX e Webmotors — ou responder qualquer outra pergunta.\n\nQual sua dúvida? Você também pode enviar prints de tela que eu analiso!`;
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [open, messages.length, platformContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, []);

  async function handleSend(text?: string) {
    const content = (text || input).trim();
    if ((!content && !image) || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: content || '(imagem enviada)', image: image || undefined };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = content;
    const currentImage = image;
    setInput('');
    setImage(null);
    setLoading(true);

    // Add empty assistant message that we'll fill as chunks arrive
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const apiMessages = [
        ...messages.map((m) => ({
          role: m.role,
          content: m.image
            ? [
                { type: 'text', text: m.content },
                { type: 'image_url', image_url: { url: m.image } },
              ]
            : m.content,
        })),
        {
          role: 'user' as const,
          content: currentImage
            ? [
                { type: 'text', text: currentInput || 'Analise esta imagem e me ajude com a integração. Descreva o que você vê e me diga o que fazer.' },
                { type: 'image_url', image_url: { url: currentImage } },
              ]
            : currentInput,
        },
      ];

      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch(`${EDGE_URL}/ai-help-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, platform_context: platformContext }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('text/event-stream') && response.body) {
        // Streaming response — update message as chunks arrive
        let accumulated = '';
        for await (const chunk of parseSSE(response)) {
          accumulated += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: accumulated,
            };
            return updated;
          });
        }

        if (!accumulated.trim()) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: 'Não consegui gerar uma resposta. Tente reformular sua pergunta.',
            };
            return updated;
          });
        }
      } else {
        // Non-streaming fallback (error message)
        const data = await response.json();
        const reply = data.reply || 'Não consegui gerar uma resposta. Tente novamente.';
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: reply,
            isFallback: data.fallback === true,
          };
          return updated;
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User stopped generation — keep partial content
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant' && !last.content.trim()) {
            updated.pop();
          }
          return updated;
        });
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Ops! Tive um problema de conexão. Tente novamente em alguns segundos.',
          };
          return updated;
        });
      }
    }
    setLoading(false);
    abortRef.current = null;
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'A imagem é muito grande (máximo 5MB). Tente uma imagem menor.',
      }]);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold text-sm shadow-2xl shadow-accent-500/30 transition-all hover:scale-105 hover:-translate-y-1 group"
      >
        <div className="relative">
          <Sparkles size={20} className="text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold-400 rounded-full animate-pulse" />
        </div>
        <span className="hidden sm:inline">Preciso de ajuda</span>
        <span className="sm:hidden">Ajuda</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[calc(100vw-3rem)] max-w-md animate-drop-in">
      <div className="glass-strong rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-accent-500/30" style={{ height: 'min(75vh, 650px)' }}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-navy-600/30 flex items-center gap-3 bg-gradient-to-r from-accent-500/10 to-gold-500/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/30 to-gold-500/30 border border-accent-500/30 flex items-center justify-center flex-shrink-0">
            <Bot size={20} className="text-accent-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              Assistente IA
              <span className="w-2 h-2 bg-success-400 rounded-full flex-shrink-0 animate-pulse" />
            </p>
            <p className="text-xs text-navy-400 truncate">
              {platformContext ? `Ajuda com ${platformContextLabel(platformContext)}` : 'Tire dúvidas sobre integrações'}
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-navy-400 hover:bg-navy-700/50 hover:text-white transition-all flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%]`}>
                {msg.image && (
                  <img src={msg.image} alt="Print enviado" className="rounded-xl max-h-40 mb-1.5 border border-navy-600/30" />
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white'
                      : 'glass border border-navy-600/30 text-navy-100'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <>
                      <div dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
                      {loading && idx === messages.length - 1 && (
                        <span className="inline-block w-1.5 h-4 bg-accent-400 ml-0.5 animate-pulse align-middle" />
                      )}
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.isFallback && (
                  <div className="flex items-start gap-1.5 mt-1.5 px-1">
                    <AlertCircle size={12} className="text-gold-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gold-400/80">IA externa não configurada — usando respostas limitadas.</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Suggested questions (only on first message) */}
          {messages.length === 1 && !loading && (
            <div className="space-y-1.5 pt-2">
              <p className="text-[10px] text-navy-500 px-1 uppercase tracking-wide">Sugestões</p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-navy-800/40 hover:bg-navy-700/40 border border-navy-600/20 text-xs text-navy-200 transition-all hover:border-accent-500/30"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Image preview */}
        {image && (
          <div className="px-3 pb-2">
            <div className="relative inline-block">
              <img src={image} alt="Preview" className="h-16 rounded-lg border border-accent-500/30" />
              <button onClick={removeImage} className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 rounded-full flex items-center justify-center text-white">
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-navy-600/30">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-xl bg-navy-700/40 hover:bg-navy-700/60 text-navy-300 hover:text-white flex items-center justify-center transition-all flex-shrink-0 border border-navy-600/30"
              title="Enviar print de tela"
            >
              <ImageIcon size={16} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua dúvida..."
              className="flex-1 bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
            />
            {loading ? (
              <button
                onClick={stopGeneration}
                className="w-9 h-9 rounded-xl bg-error-500/80 hover:bg-error-500 text-white flex items-center justify-center transition-all flex-shrink-0"
                title="Parar"
              >
                <StopCircle size={16} />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={loading || (!input.trim() && !image)}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white flex items-center justify-center transition-all disabled:opacity-50 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            )}
          </div>
          <p className="text-[10px] text-navy-500 mt-1.5 px-1">
            IA com visão — envie um print se travou em algum passo.
          </p>
        </div>
      </div>
    </div>
  );
}

function platformContextLabel(platform: string): string {
  const labels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    facebook: 'Facebook',
    olx: 'OLX',
    webmotors: 'Webmotors',
  };
  return labels[platform] || platform;
}

function renderMarkdown(content: string): { __html: string } {
  if (!content) return { __html: '' };
  let html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-navy-800/60 rounded-lg p-2 my-1.5 text-[11px] text-accent-300 overflow-x-auto"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="text-accent-300 bg-navy-800/60 px-1 rounded text-[12px]">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-navy-200">$1</em>')
    .replace(/^\- (.+)$/gm, '<div class="flex gap-1.5 ml-1"><span class="text-accent-400 flex-shrink-0">•</span><span>$1</span></div>')
    .replace(/^\d+\. (.+)$/gm, '<div class="ml-1">$1</div>')
    .replace(/\n/g, '<br />');

  return { __html: html };
}
