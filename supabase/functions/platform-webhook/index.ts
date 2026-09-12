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

async function computeHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function isDuplicate(channel: string, externalEventId: string | null, payloadHash: string): Promise<boolean> {
  if (!externalEventId && !payloadHash) return false;
  try {
    if (externalEventId) {
      const { data } = await supabase
        .from("webhook_events").select("id").eq("channel", channel).eq("external_event_id", externalEventId).maybeSingle();
      if (data) return true;
    }
    if (payloadHash) {
      const { data } = await supabase
        .from("webhook_events").select("id").eq("payload_hash", payloadHash).maybeSingle();
      if (data) return true;
    }
  } catch { /* table might not exist yet — proceed */ }
  return false;
}

async function logWebhookEvent(dealerId: string | null, channel: string, externalEventId: string | null, payloadHash: string) {
  try {
    await supabase.from("webhook_events").insert({
      dealer_id: dealerId, channel, external_event_id: externalEventId, payload_hash: payloadHash,
    });
  } catch { /* ignore — dedup index may catch, that's fine */ }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const url = new URL(req.url);

  // --- Meta webhook verification (GET) ---
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && challenge) {
      const { data: account } = await supabase
        .from("integration_accounts")
        .select("id, dealer_id")
        .eq("webhook_secret", token || "")
        .eq("status", "connected")
        .maybeSingle();

      if (account) {
        await supabase
          .from("integration_accounts")
          .update({ webhook_verified: true })
          .eq("id", account.id);
        return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
      }
      return new Response("Forbidden", { status: 403 });
    }
    return new Response("Bad Request", { status: 400 });
  }

  // --- Incoming webhook events (POST) ---
  if (req.method === "POST") {
    try {
      const rawBody = await req.text();
      const body = JSON.parse(rawBody);
      const payloadHash = await computeHash(rawBody);

      // --- Z-API (WhatsApp) webhook format ---
      if (body.phone && body.message && body.type === "Received") {
        const externalEventId = body.messageId || null;
        if (await isDuplicate("whatsapp", externalEventId, payloadHash)) {
          return new Response("OK", { status: 200, headers: corsHeaders });
        }

        const zapiInstanceId = body.instanceId || body.instance;
        let dealerId: string | null = null;
        let accountId: string | null = null;

        if (zapiInstanceId) {
          const { data: acc } = await supabase
            .from("integration_accounts")
            .select("id, dealer_id")
            .eq("phone_number_id", zapiInstanceId)
            .eq("status", "connected")
            .maybeSingle();
          if (acc) { accountId = acc.id; dealerId = acc.dealer_id; }
        }

        if (!dealerId) {
          const { data: intRes } = await supabase
            .from("integrations").select("id").eq("platform", "whatsapp").maybeSingle();
          if (intRes) {
            const { data: acc } = await supabase
              .from("integration_accounts")
              .select("id, dealer_id, phone_number_id")
              .eq("integration_id", intRes.id)
              .eq("status", "connected")
              .maybeSingle();
            if (acc) { accountId = acc.id; dealerId = acc.dealer_id; }
          }
        }

        if (dealerId) {
          const contactName = body.senderName || body.sender?.pushName || null;
          const phone = body.phone?.replace(/\D/g, "") || null;
          const messageText = body.message?.text || (typeof body.message === "string" ? body.message : "");

          await forwardToAI({
            dealer_id: dealerId, channel: "whatsapp",
            contact_name: contactName, contact_phone: phone,
            message_content: messageText, integration_account_id: accountId,
            external_id: externalEventId,
          });
          await logWebhookEvent(dealerId, "whatsapp", externalEventId, payloadHash);
        }
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // --- Local connector server webhook format (WhatsApp + Instagram) ---
      if (body.session_id && body.message) {
        const sessionId = body.session_id;
        const platform = body.platform || "whatsapp";
        const message = body.message;
        const isFromMe = message.fromMe || message.key?.fromMe || false;

        if (isFromMe) return new Response("OK", { status: 200, headers: corsHeaders });

        const messageText = message.text || message.message?.conversation || "";
        if (!messageText) return new Response("OK", { status: 200, headers: corsHeaders });

        const externalEventId = message.id || message.key?.id || null;
        if (await isDuplicate(platform, externalEventId, payloadHash)) {
          return new Response("OK", { status: 200, headers: corsHeaders });
        }

        const senderName = message.pushName || message.senderName || null;
        const senderId = String(message.from || "").replace(/\D/g, "") || null;
        if (!senderId) return new Response("OK", { status: 200, headers: corsHeaders });

        let dealerId: string | null = null;
        let accountId: string | null = null;

        const { data: accounts } = await supabase
          .from("integration_accounts")
          .select("id, dealer_id, metadata")
          .eq("status", "connected");

        if (accounts) {
          for (const a of accounts) {
            const meta = a.metadata as Record<string, unknown>;
            if (meta.session_id === sessionId) { accountId = a.id; dealerId = a.dealer_id; break; }
          }
        }

        if (!dealerId) {
          console.error(`[webhook] no dealer found for session_id: ${sessionId}`);
          return new Response("OK", { status: 200, headers: corsHeaders });
        }

        await forwardToAI({
          dealer_id: dealerId, channel: platform,
          contact_name: senderName,
          contact_phone: platform === "whatsapp" ? senderId : null,
          contact_handle: platform !== "whatsapp" ? senderId : null,
          message_content: messageText, integration_account_id: accountId,
          external_id: externalEventId,
        });
        await logWebhookEvent(dealerId, platform, externalEventId, payloadHash);
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // --- Meta (WhatsApp Cloud API / Instagram / Facebook) webhook format ---
      if (body.object && body.entry) {
        for (const entry of body.entry) {
          if (entry.changes) {
            for (const change of entry.changes) {
              if (change.field === "messages" && change.value?.messages) {
                for (const msg of change.value.messages) {
                  const externalEventId = msg.id || null;
                  if (await isDuplicate("whatsapp", externalEventId, payloadHash)) continue;
                  const phoneNumber = msg.from;
                  const contactName = change.value.contacts?.[0]?.profile?.name || null;
                  const messageText = msg.text?.body || "";
                  const wabaId = change.value?.metadata?.phone_number_id || entry.id;
                  await handleMetaIncoming({
                    platform: "whatsapp", contact_phone: phoneNumber,
                    contact_name: contactName, message_content: messageText, wabaId,
                    external_id: externalEventId,
                  });
                  await logWebhookEvent(null, "whatsapp", externalEventId, payloadHash);
                }
              }
              if (change.field === "messages" && change.value?.messaging) {
                for (const event of change.value.messaging) {
                  const externalEventId = event.message?.mid || event.message?.message_id || null;
                  if (await isDuplicate("instagram", externalEventId, payloadHash)) continue;
                  const senderId = event.sender?.id;
                  const messageText = event.message?.text || "";
                  await handleMetaIncoming({
                    platform: "instagram", contact_phone: null,
                    contact_handle: senderId, contact_name: null,
                    message_content: messageText, wabaId: event.recipient?.id,
                    external_id: externalEventId,
                  });
                  await logWebhookEvent(null, "instagram", externalEventId, payloadHash);
                }
              }
            }
          }
          if (entry.messaging) {
            for (const event of entry.messaging) {
              const externalEventId = event.message?.mid || event.message?.message_id || null;
              if (await isDuplicate("facebook", externalEventId, payloadHash)) continue;
              const senderId = event.sender?.id;
              const messageText = event.message?.text || "";
              await handleMetaIncoming({
                platform: "facebook", contact_phone: null,
                contact_handle: senderId, contact_name: null,
                message_content: messageText, wabaId: event.recipient?.id,
                external_id: externalEventId,
              });
              await logWebhookEvent(null, "facebook", externalEventId, payloadHash);
            }
          }
        }
        return new Response("EVENT_RECEIVED", { status: 200, headers: corsHeaders });
      }

      // --- OLX webhook format ---
      if (body.platform === "olx" || body.source === "olx") {
        const externalEventId = body.event_id || body.id || null;
        if (await isDuplicate("olx", externalEventId, payloadHash)) {
          return new Response("OK", { status: 200, headers: corsHeaders });
        }
        await handleMetaIncoming({
          platform: "olx",
          contact_phone: body.phone || body.contact_phone || null,
          contact_name: body.name || body.contact_name || null,
          message_content: body.message || body.text || "",
          wabaId: body.listing_id, external_id: externalEventId,
        });
        await logWebhookEvent(null, "olx", externalEventId, payloadHash);
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // --- Webmotors webhook format ---
      if (body.platform === "webmotors" || body.source === "webmotors") {
        const externalEventId = body.event_id || body.id || null;
        if (await isDuplicate("webmotors", externalEventId, payloadHash)) {
          return new Response("OK", { status: 200, headers: corsHeaders });
        }
        await handleMetaIncoming({
          platform: "webmotors",
          contact_phone: body.phone || null,
          contact_name: body.name || null,
          message_content: body.message || "",
          wabaId: body.announcement_id, external_id: externalEventId,
        });
        await logWebhookEvent(null, "webmotors", externalEventId, payloadHash);
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // --- Site widget format ---
      if (body.platform === "site" || body.source === "site" || body.action === "site_message") {
        const externalEventId = body.message_id || null;
        if (await isDuplicate("site", externalEventId, payloadHash)) {
          return new Response("OK", { status: 200, headers: corsHeaders });
        }
        await forwardToAI({
          dealer_id: body.dealer_id, channel: "site",
          contact_name: body.name || null, contact_phone: body.phone || null,
          message_content: body.message || "", external_id: externalEventId,
        });
        await logWebhookEvent(body.dealer_id || null, "site", externalEventId, payloadHash);
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      return new Response("OK", { status: 200, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
});

async function handleMetaIncoming(params: {
  platform: string;
  contact_phone: string | null;
  contact_name: string | null;
  contact_handle?: string | null;
  message_content: string;
  wabaId?: string | null;
  external_id?: string | null;
}) {
  const { platform, contact_phone, contact_name, contact_handle, message_content, wabaId, external_id } = params;

  let dealerId: string | null = null;
  let accountId: string | null = null;

  const matchField = platform === "whatsapp" ? "phone_number_id" : "waba_id";
  if (wabaId) {
    const { data: acc } = await supabase
      .from("integration_accounts")
      .select("id, dealer_id")
      .eq("status", "connected")
      .eq(matchField, wabaId)
      .maybeSingle();
    if (acc) { accountId = acc.id; dealerId = acc.dealer_id; }
  }

  if (!dealerId) {
    const { data: intRes } = await supabase
      .from("integrations").select("id").eq("platform", platform).maybeSingle();
    if (intRes) {
      const { data: acc } = await supabase
        .from("integration_accounts")
        .select("id, dealer_id")
        .eq("integration_id", intRes.id)
        .eq("status", "connected")
        .maybeSingle();
      if (acc) { accountId = acc.id; dealerId = acc.dealer_id; }
    }
  }

  if (!dealerId) return;

  await forwardToAI({
    dealer_id: dealerId, channel: platform,
    contact_name, contact_phone, contact_handle,
    message_content, integration_account_id: accountId, external_id,
  });
}

async function forwardToAI(params: {
  dealer_id: string;
  channel: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_handle?: string | null;
  message_content: string;
  integration_account_id?: string | null;
  external_id?: string | null;
}) {
  await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-lead-qualifier`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "process_message",
      dealer_id: params.dealer_id,
      channel: params.channel,
      contact_name: params.contact_name,
      contact_phone: params.contact_phone,
      contact_handle: params.contact_handle,
      message_content: params.message_content,
      integration_account_id: params.integration_account_id,
      external_id: params.external_id,
    }),
  });
}
