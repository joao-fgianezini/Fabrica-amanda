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

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const { conversation_id, dealer_id, content } = body;

    if (!conversation_id || !dealer_id || !content) {
      return json({ error: "Missing required fields" }, 400);
    }

    // Fetch conversation
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversation_id)
      .eq("dealer_id", dealer_id)
      .maybeSingle();

    if (convError || !conv) {
      return json({ error: "Conversation not found" }, 404);
    }

    // Find the connected integration account
    let account: Record<string, unknown> | null = null;
    if (conv.integration_account_id) {
      const { data: acc } = await supabase
        .from("integration_accounts")
        .select("*, integration:integrations(*)")
        .eq("id", conv.integration_account_id)
        .maybeSingle();
      account = acc as Record<string, unknown> | null;
    }
    if (!account) {
      const { data: intData } = await supabase
        .from("integrations")
        .select("id")
        .eq("platform", conv.channel)
        .maybeSingle();
      if (intData) {
        const { data: acc } = await supabase
          .from("integration_accounts")
          .select("*, integration:integrations(*)")
          .eq("dealer_id", dealer_id)
          .eq("integration_id", intData.id)
          .eq("status", "connected")
          .maybeSingle();
        account = acc as Record<string, unknown> | null;
      }
    }

    // Save the outbound message regardless of delivery
    const { data: msg } = await supabase
      .from("messages")
      .insert({
        conversation_id, dealer_id, direction: "outbound",
        content, content_type: "text",
      })
      .select("*")
      .single();

    await supabase.from("conversations").update({
      last_message_at: new Date().toISOString(),
      last_message_preview: content.slice(0, 100),
      updated_at: new Date().toISOString(),
    }).eq("id", conversation_id);

    if (!account) {
      await supabase.from("messages").update({
        ai_analysis: { delivery_status: "failed", delivery_error: "Nenhuma conta conectada para este canal" },
      }).eq("id", msg?.id);
      return json({ success: true, message: msg, delivered: false, delivery_error: "Nenhuma conta conectada para este canal" });
    }

    const integration = account.integration as { platform: string } | null;
    const platform = integration?.platform || conv.channel;
    const metadata = (account.metadata as Record<string, unknown>) || {};
    const accessToken = metadata.access_token as string || "";
    const phoneNumberId = metadata.phone_number_id as string || account.phone_number_id as string || "";
    const pageId = metadata.page_id as string || account.waba_id as string || "";

    let externalResponse: { success: boolean; external_id?: string; error?: string } = { success: false, error: "Canal não suportado" };

    // --- WhatsApp Cloud API ---
    if (platform === "whatsapp" && accessToken && phoneNumberId) {
      const recipientPhone = conv.contact_phone || conv.contact_handle || "";
      if (!recipientPhone) {
        externalResponse = { success: false, error: "Telefone do contato não encontrado" };
      } else {
        try {
          const waResponse = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: recipientPhone,
                type: "text",
                text: { body: content },
              }),
            }
          );
          const waData = await waResponse.json();
          if (waResponse.ok && waData.messages?.[0]?.id) {
            externalResponse = { success: true, external_id: waData.messages[0].id };
          } else {
            externalResponse = { success: false, error: waData.error?.message || "Erro ao enviar via WhatsApp API" };
          }
        } catch (err) {
          externalResponse = { success: false, error: `WhatsApp API erro: ${err.message}` };
        }
      }
    }

    // --- Instagram Graph API ---
    else if (platform === "instagram" && accessToken && pageId) {
      const recipientId = conv.contact_handle || conv.contact_phone || "";
      if (!recipientId) {
        externalResponse = { success: false, error: "ID do contato não encontrado" };
      } else {
        try {
          const igResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
              body: JSON.stringify({
                recipient: { id: recipientId },
                message: { text: content },
              }),
            }
          );
          const igData = await igResponse.json();
          if (igResponse.ok && igData.message_id) {
            externalResponse = { success: true, external_id: igData.message_id };
          } else {
            externalResponse = { success: false, error: igData.error?.message || "Erro ao enviar via Instagram API" };
          }
        } catch (err) {
          externalResponse = { success: false, error: `Instagram API erro: ${err.message}` };
        }
      }
    }

    // --- Facebook Messenger API ---
    else if (platform === "facebook" && accessToken && pageId) {
      const recipientId = conv.contact_handle || conv.contact_phone || "";
      if (!recipientId) {
        externalResponse = { success: false, error: "ID do contato não encontrado" };
      } else {
        try {
          const fbResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
              body: JSON.stringify({
                recipient: { id: recipientId },
                message: { text: content },
              }),
            }
          );
          const fbData = await fbResponse.json();
          if (fbResponse.ok && fbData.message_id) {
            externalResponse = { success: true, external_id: fbData.message_id };
          } else {
            externalResponse = { success: false, error: fbData.error?.message || "Erro ao enviar via Facebook API" };
          }
        } catch (err) {
          externalResponse = { success: false, error: `Facebook API erro: ${err.message}` };
        }
      }
    }

    // --- OLX: reply via OLX API ---
    else if (platform === "olx") {
      const clientId = metadata.client_id as string || "";
      const clientSecret = metadata.client_secret as string || "";
      if (!clientId || !clientSecret) {
        externalResponse = { success: false, error: "Credenciais OLX incompletas" };
      } else {
        // OLX chat reply endpoint — token is conversation external_id
        const threadId = conv.external_id || "";
        if (!threadId) {
          externalResponse = { success: false, error: "Thread OLX não encontrada. Responda pelo painel da OLX." };
        } else {
          try {
            // Get OLX access token
            const tokenRes = await fetch("https://api.olx.com.br/oauth/token", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
            });
            const tokenData = await tokenRes.json();
            if (!tokenRes.ok || !tokenData.access_token) {
              externalResponse = { success: false, error: "Não foi possível autenticar na OLX" };
            } else {
              const replyRes = await fetch(`https://api.olx.com.br/chat/threads/${threadId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokenData.access_token}` },
                body: JSON.stringify({ text: content }),
              });
              if (replyRes.ok) {
                externalResponse = { success: true, external_id: `olx_${Date.now()}` };
              } else {
                const replyData = await replyRes.json().catch(() => ({}));
                externalResponse = { success: false, error: replyData.error?.message || "Erro ao responder na OLX" };
              }
            }
          } catch (err) {
            externalResponse = { success: false, error: `OLX API erro: ${err.message}` };
          }
        }
      }
    }

    // --- Webmotors: reply via Webmotors API ---
    else if (platform === "webmotors") {
      const apiToken = metadata.api_token as string || "";
      if (!apiToken) {
        externalResponse = { success: false, error: "Token Webmotors não configurado" };
      } else {
        const leadId = conv.external_id || "";
        if (!leadId) {
          externalResponse = { success: false, error: "Lead Webmotors não encontrado. Responda pelo painel da Webmotors." };
        } else {
          try {
            const wmRes = await fetch("https://api.webmotors.com.br/lead/responder", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiToken}` },
              body: JSON.stringify({ leadId, message: content }),
            });
            if (wmRes.ok) {
              externalResponse = { success: true, external_id: `wm_${Date.now()}` };
            } else {
              externalResponse = { success: false, error: "Erro ao responder na Webmotors" };
            }
          } catch (err) {
            externalResponse = { success: false, error: `Webmotors API erro: ${err.message}` };
          }
        }
      }
    }

    // --- Site widget ---
    else if (platform === "site") {
      externalResponse = { success: true };
    }

    // Update message with delivery status
    await supabase.from("messages").update({
      external_id: externalResponse.external_id || null,
      ai_analysis: {
        delivery_status: externalResponse.success ? "sent" : "failed",
        delivery_error: externalResponse.success ? null : externalResponse.error,
      },
    }).eq("id", msg?.id);

    return json({
      success: true,
      message: msg,
      delivered: externalResponse.success,
      delivery_error: externalResponse.success ? null : externalResponse.error,
    });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
