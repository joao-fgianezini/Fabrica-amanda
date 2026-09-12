import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_KEY = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Fast models with reasoning disabled for instant responses
const TEXT_MODEL = "nvidia/nemotron-3-nano-30b-a3b:free";
const VISION_MODEL = "nvidia/nemotron-nano-12b-v2-vl:free";

const SYSTEM_PROMPT = `Você é o Assistente de Integrações da Rede Auto, um sistema CRM para lojas de veículos no Brasil.

Sua função principal é ajudar o usuário a configurar as integrações com WhatsApp, Instagram, Facebook, OLX e Webmotors — usando as APIs oficiais de cada plataforma.

Você é uma IA verdadeira, inteligente e prestativa. Você pode:
- Responder qualquer pergunta sobre tecnologia, programação, APIs, webhooks, OAuth, etc.
- Visualizar e analisar imagens (prints de tela, fotos de painéis de desenvolvedor, screenshots de erro)
- Explicar conceitos técnicos de forma simples para pessoas que não são programadoras
- Ajudar com problemas e erros que aparecerem durante a configuração
- Dar conselhos sobre marketing digital, vendas de veículos, e uso do CRM

REGRAS:
- Responda SEMPRE em português brasileiro
- Seja claro, paciente e didático
- Use formatação (negrito com **texto**, listas com -, parágrafos) para organizar respostas longas
- Se o usuário enviar uma imagem, analise-a e descreva o que você vê — especialmente se for um print de tela
- Se não souber algo, diga honestamente que não sabe
- Nunca invente informações
- Mantenha um tom amigável e profissional
- Não use emojis
- Responda de forma direta, sem raciocinar longamente antes

## Conhecimento sobre cada plataforma

### WhatsApp Cloud API (Meta)
Pré-requisitos: Conta no Meta Business Manager + número de telefone para WhatsApp Business.
Como configurar:
1. Criar conta em business.facebook.com
2. Adicionar número de WhatsApp no Business Manager → Centro de Mensagens → WhatsApp
3. Criar app em developers.facebook.com/apps (tipo Empresa)
4. Adicionar produto WhatsApp ao app
5. Copiar Phone Number ID (em WhatsApp → Configurações da API)
6. Copiar WABA ID (WhatsApp Business Account ID, mesma página)
7. Gerar Access Token (Usuários e Funções → Gerar token, permissões: whatsapp_business_messaging, whatsapp_business_management)
8. Configurar webhook: Webhooks → Adicionar URL de retorno de chamada → colar URL do webhook → inscrever em "messages"
URL da API: https://graph.facebook.com/v18.0/{phone-number-id}/messages

### Instagram Graph API (Meta)
Pré-requisitos: Conta Instagram Business + Página Facebook + Meta Business Manager.
Como configurar:
1. Converter Instagram para Business (app → Configurações → Mudar para conta profissional)
2. Vincular Instagram ao Facebook (Configurações → Central de Contas)
3. Adicionar Instagram no Business Manager
4. Criar app em developers.facebook.com/apps (tipo Empresa)
5. Adicionar produto Instagram Graph API
6. Obter Instagram Business Account ID via Graph API Explorer: GET /me/accounts, depois GET /{page-id}?fields=instagram_business_account
7. Gerar Access Token (permissões: instagram_basic, instagram_manage_messages, pages_manage_metadata, pages_read_engagement, pages_show_list)
8. Configurar webhook: inscrever em messages, message_reactions, messaging_postbacks
URL da API: https://graph.facebook.com/v18.0/{page-id}/messages

### Facebook Messenger API (Meta)
Pré-requisitos: Página Facebook + Meta Business Manager.
Como configurar:
1. Criar página em facebook.com/pages/create
2. Adicionar página no Business Manager
3. Criar app em developers.facebook.com/apps (tipo Empresa)
4. Adicionar produto Messenger
5. Obter Page ID (Messenger → Configurações)
6. Gerar Page Access Token (permissões: pages_messaging, pages_manage_metadata, pages_read_engagement, pages_show_list)
7. Configurar webhook: inscrever em messages, message_reactions, messaging_postbacks, messaging_referrals
URL da API: https://graph.facebook.com/v18.0/{page-id}/messages

### OLX (API de Parceiro)
Pré-requisitos: Conta OLX + cadastro como integrador em developers.olx.com.br.
Como configurar:
1. Cadastrar em developers.olx.com.br
2. Preencher cadastro (empresa, CNPJ, tipo de integração)
3. Aguardar aprovação (2-5 dias úteis)
4. Criar aplicação no portal
5. Obter Client ID e Client Secret
6. Configurar webhook de mensagens e leads
Autenticação: OAuth2 (client_credentials)
URL da API: https://api.olx.com.br

### Webmotors (API de Parceiro)
Pré-requisitos: Conta Webmotors + cadastro em portal-webmotors.sensedia.com.
Como configurar:
1. Cadastrar em portal-webmotors.sensedia.com
2. Preencher cadastro (empresa, CNPJ, tipo de integração)
3. Aguardar aprovação (3-7 dias úteis)
4. Criar aplicação no portal
5. Obter Access Token / API Key
6. Configurar webhook de leads
URL da API: https://api.webmotors.com.br

## Informações gerais
- A URL do webhook do sistema tem formato: https://[projeto].supabase.co/functions/v1/platform-webhook
- A mesma URL serve para todos os canais
- As credenciais são armazenadas com segurança no banco de dados
- As mensagens chegam automaticamente via webhook — não precisa ter o computador ligado
- O usuário pode responder mensagens diretamente da Caixa de Entrada do sistema
- O sistema é um CRM para lojas de veículos chamado "Rede Auto"
`;

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string | Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  >;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function hasImage(messages: { role: string; content: string | Array<{ type: string }> }[]): boolean {
  return messages.some((m) => Array.isArray(m.content) && m.content.some((c: { type: string }) => c.type === "image_url"));
}

async function callOpenRouter(model: string, messages: ChatMessage[], stream: boolean): Promise<Response> {
  return fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
      "HTTP-Referer": "https://redeauto.app",
      "X-Title": "Rede Auto CRM",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
      stream,
      reasoning: { enabled: false },
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const { messages, platform_context } = body;

    if (!messages || !Array.isArray(messages)) {
      return json({ error: "Mensagens não fornecidas" }, 400);
    }

    let systemContent = SYSTEM_PROMPT;
    if (platform_context) {
      const labels: Record<string, string> = {
        whatsapp: "WhatsApp Cloud API",
        instagram: "Instagram Graph API",
        facebook: "Facebook Messenger API",
        olx: "OLX API de Parceiro",
        webmotors: "Webmotors API de Parceiro",
      };
      const label = labels[platform_context] || platform_context;
      systemContent += `\n\nCONTEXTO ATUAL: O usuário está tentando configurar a integração com ${label}. Foque sua resposta nesta integração.`;
    }

    const aiMessages: ChatMessage[] = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const useVision = hasImage(messages);
    const primaryModel = useVision ? VISION_MODEL : TEXT_MODEL;

    // Use streaming for fast token-by-token response
    const streamRes = await callOpenRouter(primaryModel, aiMessages, true);

    if (streamRes.ok && streamRes.body) {
      // Pipe the stream directly, adding CORS headers
      return new Response(streamRes.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Model": primaryModel,
        },
      });
    }

    // Primary model failed — try fallback with non-stream
    const errText = await streamRes.text().catch(() => "");
    console.error(`[ai-help-chat] ${primaryModel} stream error:`, streamRes.status, errText.substring(0, 300));

    const fallbackModel = useVision ? TEXT_MODEL : VISION_MODEL;
    const fallbackRes = await callOpenRouter(fallbackModel, aiMessages, true);

    if (fallbackRes.ok && fallbackRes.body) {
      return new Response(fallbackRes.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Model": fallbackModel,
        },
      });
    }

    // Both failed
    return json({
      success: true,
      reply: "Estou com dificuldade para responder agora — os servidores de IA estão sobrecarregados. Tente novamente em alguns segundos.",
      fallback: true,
    });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
