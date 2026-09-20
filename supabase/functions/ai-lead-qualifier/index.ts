import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

type Analysis = {
  vehicle_interest: string | null;
  budget: number | null;
  down_payment: number | null;
  max_installment: number | null;
  intent: string;
  sentiment: string;
  lead_score: number;
  summary: string;
  suggested_action: string;
  should_create_lead: boolean;
  is_lead: boolean;
  is_personal: boolean;
  conversation_type: "lead" | "personal" | "spam";
};

function analyzeMessage(content: string): Analysis {
  const lower = content.toLowerCase();

  // --- Distinguish lead vs personal vs spam ---
  const businessKeywords = [
    "carro", "veiculo", "veículo", "moto", "caminhao", "caminhão",
    "preco", "preço", "valor", "comprar", "compra", "vender", "venda",
    "financiar", "financiamento", "parcela", "entrada", "troca", "permuta",
    "estoque", "anuncio", "anúncio", "olx", "webmotors", "test drive",
    "agendar", "visitar", "loja", "concessionaria", "concessionária",
    "modelo", "marca", "ano", "km", "quilometragem", "automatico", "automático",
    "manual", "flex", "diesel", "gasolina", "etanol", "cor", "placa",
  ];
  const personalKeywords = [
    "oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "eai", "e ai",
    "como vai", "tudo bem", "tudo ok", "feliz", "aniversario", "aniversário",
    "parabens", "parabéns", "familia", "família", "viagem", "festa",
    "namorado", "namorada", "esposa", "marido", "filho", "filha",
    "amor", "saudade", "saudades", "voce", "você", "vc",
  ];
  const spamKeywords = [
    "click no link", "clique no link", "ganhei", "premio", "prêmio",
    "parabens voce", "parabéns você", "pix estranho", "transferencia duvidosa",
    "click aqui", "clique aqui", "seu numero foi sorteado",
  ];

  let businessScore = 0;
  for (const kw of businessKeywords) if (lower.includes(kw)) businessScore += 2;

  let personalScore = 0;
  for (const kw of personalKeywords) if (lower.includes(kw)) personalScore += 1;

  let isSpam = false;
  for (const kw of spamKeywords) if (lower.includes(kw)) { isSpam = true; break; }

  let conversation_type: "lead" | "personal" | "spam" = "personal";
  if (isSpam) conversation_type = "spam";
  else if (businessScore >= 3 && businessScore > personalScore) conversation_type = "lead";
  else if (businessScore >= 2) conversation_type = "lead";

  const is_lead = conversation_type === "lead";
  const is_personal = conversation_type === "personal";

  // --- Extract vehicle interest ---
  let vehicle_interest: string | null = null;
  const carPatterns = [
    /(?:procuro|quero|estou procurando|tenho interesse|vi o|gostei do|quero ver)\s+(?:um|uma|o|a)?\s*([\w\s-]+?)(?:\s+\.|\s*,|\s*$|\s+(?:da|de|com|ano|por|que|modelo))/i,
    /(?:carro|ve[ií]culo)\s+(?:[\w-]+)\s+([\w\s-]+?)(?:\s+\.|\s*,|\s*$)/i,
  ];
  for (const p of carPatterns) {
    const m = content.match(p);
    if (m && m[1] && m[1].trim().length > 2) { vehicle_interest = m[1].trim().substring(0, 100); break; }
  }
  const carBrands = ["corolla","hilux","civic","onix","ka","hb20","compass","renegade","t-cross","nivus","gol","virtus","polo","creta","kwid","kicks","s10","ranger","strada","toro","pulse","tracker","trend","argo","cronos","bolt","spin"," Tracker"];
  if (!vehicle_interest) {
    for (const brand of carBrands) if (lower.includes(brand)) { vehicle_interest = brand.charAt(0).toUpperCase() + brand.slice(1); break; }
  }

  // --- Extract budget ---
  let budget: number | null = null;
  const budgetMatch2 = content.match(/(?:or[çc]amento|valor|pre[çc]o|at[ée])\s*(?:de\s*)?r?\$?\s*(\d[\d.,]*)/i);
  if (budgetMatch2) budget = parseFloat(budgetMatch2[1].replace(/\./g, "").replace(",", "."));
  else {
    const budgetMatch = content.match(/(\d+)\s*mil/i);
    if (budgetMatch && (lower.includes("mil") && (lower.includes("reais") || lower.includes("orçamento") || lower.includes("valor") || lower.includes("preco") || lower.includes("preço")))) {
      budget = parseInt(budgetMatch[1]) * 1000;
    }
  }

  // --- Extract down payment ---
  let down_payment: number | null = null;
  const dpMatch = content.match(/(?:entrada)\s*(?:de\s*)?r?\$?\s*(\d[\d.,]*)/i);
  if (dpMatch) down_payment = parseFloat(dpMatch[1].replace(/\./g, "").replace(",", "."));
  else if (lower.includes("entrada")) {
    const dpNum = content.match(/(\d+)\s*mil/i);
    if (dpNum) down_payment = parseInt(dpNum[1]) * 1000;
  }

  // --- Extract max installment ---
  let max_installment: number | null = null;
  const instMatch = content.match(/(?:parcela)\s*(?:de\s*)?(?:at[ée]\s*)?r?\$?\s*(\d[\d.,]*)/i);
  if (instMatch) max_installment = parseFloat(instMatch[1].replace(/\./g, "").replace(",", "."));

  // --- Determine intent ---
  let intent = "inquiry";
  if (lower.includes("comprar") || lower.includes("fechar") || lower.includes("fechou") || lower.includes("levar")) intent = "high_intent";
  else if (lower.includes("financiar") || lower.includes("financiamento") || lower.includes("parcelar")) intent = "financing";
  else if (lower.includes("preço") || lower.includes("preco") || lower.includes("valor") || lower.includes("quanto")) intent = "pricing";
  else if (lower.includes("agendar") || lower.includes("visitar") || lower.includes("ver o carro") || lower.includes("test drive") || lower.includes("testar")) intent = "visit";
  else if (lower.includes("troca") || lower.includes("permuta")) intent = "trade_in";

  // --- Sentiment ---
  let sentiment = "neutral";
  const positiveWords = ["otimo","ótimo","bom","perfeito","adorei","gostei","interessante","show","top","legal","massa"];
  const negativeWords = ["caro","errado","ruim","problema","defeito","nao quero","não quero","desisti","cancela","cancelar"];
  if (positiveWords.some((w) => lower.includes(w))) sentiment = "positive";
  if (negativeWords.some((w) => lower.includes(w))) sentiment = "negative";

  // --- Lead Score ---
  let lead_score = 30;
  if (!is_lead) lead_score = 10;
  if (isSpam) lead_score = 0;
  if (intent === "high_intent") lead_score += 30;
  else if (intent === "financing") lead_score += 20;
  else if (intent === "pricing") lead_score += 15;
  else if (intent === "visit") lead_score += 25;
  else if (intent === "trade_in") lead_score += 15;
  if (budget) lead_score += 10;
  if (down_payment) lead_score += 10;
  if (max_installment) lead_score += 5;
  if (vehicle_interest) lead_score += 10;
  if (sentiment === "positive") lead_score += 5;
  if (sentiment === "negative") lead_score -= 10;
  lead_score = Math.max(0, Math.min(100, lead_score));

  // --- Summary ---
  const parts: string[] = [];
  if (vehicle_interest) parts.push(`Interessado em: ${vehicle_interest}`);
  if (budget) parts.push(`Orçamento: R$ ${budget.toLocaleString("pt-BR")}`);
  if (down_payment) parts.push(`Entrada: R$ ${down_payment.toLocaleString("pt-BR")}`);
  if (max_installment) parts.push(`Parcela máx: R$ ${max_installment.toLocaleString("pt-BR")}`);
  const summary = parts.length > 0 ? parts.join(" · ") : (is_lead ? "Cliente interessado em veículos" : isSpam ? "Possível spam" : "Conversa pessoal");

  // --- Suggested action ---
  let suggested_action = "Responder e qualificar o cliente";
  if (!is_lead) suggested_action = "Conversa pessoal — não criar lead";
  if (isSpam) suggested_action = "Possível spam — ignorar";
  else if (intent === "high_intent" && vehicle_interest) suggested_action = `Simular financiamento do ${vehicle_interest} e apresentar opções`;
  else if (intent === "financing") suggested_action = "Simular financiamento com as condições informadas";
  else if (intent === "pricing") suggested_action = "Enviar preço e condições do veículo";
  else if (intent === "visit") suggested_action = "Agendar visita ou test drive";
  else if (intent === "trade_in") suggested_action = "Avaliar veículo de troca";

  const should_create_lead = is_lead && !isSpam && (lead_score >= 40 || intent !== "inquiry" || vehicle_interest !== null);

  return { vehicle_interest, budget, down_payment, max_installment, intent, sentiment, lead_score, summary, suggested_action, should_create_lead, is_lead, is_personal, conversation_type };
}

async function processMessage(params: {
  dealer_id: string;
  channel: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_handle?: string | null;
  message_content: string;
  conversation_id?: string | null;
  integration_account_id?: string | null;
}) {
  const { dealer_id, channel, contact_name, contact_phone, contact_handle, message_content, conversation_id, integration_account_id } = params;
  const analysis = analyzeMessage(message_content);

  // Skip processing for spam
  if (analysis.conversation_type === "spam") {
    return { success: true, analysis, skipped: true, reason: "spam_detected" };
  }

  // Find or create client (only for leads)
  let clientId: string | null = null;
  if (analysis.is_lead && contact_phone) {
    const { data: existingClient } = await supabase
      .from("clients").select("id")
      .eq("dealer_id", dealer_id).or(`phone.eq.${contact_phone},email.eq.${contact_phone}`)
      .maybeSingle();
    if (existingClient) clientId = existingClient.id;
  }
  if (!clientId && analysis.is_lead) {
    const { data: newClient } = await supabase
      .from("clients").insert({
        dealer_id, name: contact_name || "Cliente via " + (channel || "canal"),
        phone: contact_phone || null, status: "active",
      }).select("id").single();
    if (newClient) clientId = newClient.id;
  }

  // Find vehicle match
  let vehicleId: string | null = null;
  if (analysis.vehicle_interest) {
    const { data: vehicles } = await supabase
      .from("vehicles").select("id, brand, model")
      .eq("dealer_id", dealer_id).neq("status", "sold");
    if (vehicles) {
      const interest = analysis.vehicle_interest.toLowerCase();
      const match = vehicles.find((v: { brand: string; model: string }) =>
        `${v.brand} ${v.model}`.toLowerCase().includes(interest) ||
        v.model.toLowerCase().includes(interest) ||
        v.brand.toLowerCase().includes(interest)
      );
      if (match) vehicleId = match.id;
    }
  }

  // Find or create conversation
  let convId: string | null = conversation_id || null;
  if (!convId && contact_phone) {
    const { data: existingConv } = await supabase
      .from("conversations").select("id, lead_id")
      .eq("dealer_id", dealer_id).eq("contact_phone", contact_phone)
      .neq("status", "archived").maybeSingle();
    if (existingConv) { convId = existingConv.id; }
  }
  if (!convId && contact_handle) {
    const { data: existingConv } = await supabase
      .from("conversations").select("id, lead_id")
      .eq("dealer_id", dealer_id).eq("contact_handle", contact_handle)
      .neq("status", "archived").maybeSingle();
    if (existingConv) { convId = existingConv.id; }
  }

  let leadId: string | null = null;
  if (convId) {
    const { data: conv } = await supabase.from("conversations").select("lead_id").eq("id", convId).single();
    if (conv) leadId = conv.lead_id;
  }

  // Create or update lead only if AI says it's a lead
  if (analysis.should_create_lead && !leadId) {
    const { data: newLead } = await supabase
      .from("leads").insert({
        dealer_id, client_id: clientId, vehicle_id: vehicleId,
        name: contact_name || "Lead via " + (channel || "canal"),
        phone: contact_phone || null,
        source: (channel || "other") as string,
        source_detail: contact_handle || null,
        status: "new", lead_score: analysis.lead_score,
        budget: analysis.budget, down_payment: analysis.down_payment,
        max_installment: analysis.max_installment,
        notes: analysis.summary, last_interaction_at: new Date().toISOString(),
      }).select("id").single();
    if (newLead) leadId = newLead.id;
  } else if (leadId && analysis.is_lead && analysis.lead_score > 0) {
    await supabase.from("leads").update({
      lead_score: analysis.lead_score,
      budget: analysis.budget ?? undefined,
      down_payment: analysis.down_payment ?? undefined,
      max_installment: analysis.max_installment ?? undefined,
      vehicle_id: vehicleId ?? undefined,
      last_interaction_at: new Date().toISOString(),
      notes: analysis.summary, updated_at: new Date().toISOString(),
    }).eq("id", leadId);
  }

  // Create or update conversation
  if (!convId) {
    const { data: newConv } = await supabase
      .from("conversations").insert({
        dealer_id, integration_account_id: integration_account_id || null,
        lead_id: leadId, client_id: clientId,
        contact_name: contact_name || null, contact_phone: contact_phone || null,
        contact_handle: contact_handle || null,
        channel: channel || "other", status: "open",
        last_message_at: new Date().toISOString(),
        last_message_preview: (message_content || "").slice(0, 100),
        unread_count: 1, ai_summary: analysis.summary,
        ai_sentiment: analysis.sentiment, ai_intent: analysis.intent,
        ai_qualified: analysis.should_create_lead,
      }).select("*").single();
    if (newConv) convId = newConv.id;
  } else {
    await supabase.from("conversations").update({
      last_message_at: new Date().toISOString(),
      last_message_preview: (message_content || "").slice(0, 100),
      unread_count: 1, ai_summary: analysis.summary,
      ai_sentiment: analysis.sentiment, ai_intent: analysis.intent,
      ai_qualified: analysis.should_create_lead,
      lead_id: leadId, updated_at: new Date().toISOString(),
    }).eq("id", convId);
  }

  // Save message with AI analysis
  const { data: msg } = await supabase
    .from("messages").insert({
      conversation_id: convId, dealer_id, direction: "inbound",
      content: message_content || "", content_type: "text",
      ai_extracted_data: {
        vehicle_interest: analysis.vehicle_interest, budget: analysis.budget,
        down_payment: analysis.down_payment, max_installment: analysis.max_installment,
        intent: analysis.intent, conversation_type: analysis.conversation_type,
      },
      ai_analysis: {
        sentiment: analysis.sentiment, lead_score: analysis.lead_score,
        summary: analysis.summary, suggested_action: analysis.suggested_action,
        is_lead: analysis.is_lead, is_personal: analysis.is_personal,
      },
    }).select("*").single();

  // Tracking event
  await supabase.from("lead_tracking_events").insert({
    dealer_id, lead_id: leadId, event_type: "message_received",
    channel: channel || null, vehicle_id: vehicleId,
    metadata: { analysis: { conversation_type: analysis.conversation_type, lead_score: analysis.lead_score }, conversation_id: convId },
  });

  // AI-suggested follow-up for qualified leads
  if (analysis.should_create_lead && leadId) {
    await supabase.from("lead_follow_ups").insert({
      lead_id: leadId, dealer_id,
      scheduled_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      message: analysis.suggested_action, type: "whatsapp",
      status: "pending", ai_suggested: true,
    });
  }

  const { data: conv } = await supabase.from("conversations").select("*").eq("id", convId).single();

  return { success: true, conversation: conv, message: msg, analysis, lead_id: leadId, client_id: clientId };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "process_message") {
      const result = await processMessage({
        dealer_id: body.dealer_id,
        channel: body.channel,
        contact_name: body.contact_name,
        contact_phone: body.contact_phone,
        contact_handle: body.contact_handle,
        message_content: body.message_content,
        conversation_id: body.conversation_id,
        integration_account_id: body.integration_account_id,
      });
      return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "analyze_only") {
      const analysis = analyzeMessage(body.message_content || "");
      return new Response(JSON.stringify({ success: true, analysis }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
