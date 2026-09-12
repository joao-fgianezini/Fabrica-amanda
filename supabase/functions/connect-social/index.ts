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
    const { action } = body;

    if (action === "sync_chats") {
      const { dealer_id, account_id } = body;

      const { data: account } = await supabase
        .from("integration_accounts")
        .select("*")
        .eq("id", account_id)
        .eq("dealer_id", dealer_id)
        .maybeSingle();

      if (!account) return json({ success: false, error: "Conta não encontrada" });

      // Messages arrive automatically via webhooks — just update sync timestamp
      await supabase.from("integration_accounts").update({
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", account_id);

      return json({ success: true, message: "Atualizado. As mensagens chegam automaticamente via webhook." });
    }

    if (action === "verify_webhook") {
      const { dealer_id, account_id } = body;
      const { data: account } = await supabase
        .from("integration_accounts")
        .select("webhook_verified, webhook_url, webhook_secret")
        .eq("id", account_id)
        .eq("dealer_id", dealer_id)
        .maybeSingle();

      if (!account) return json({ success: false, error: "Conta não encontrada" });
      return json({ success: true, verified: account.webhook_verified, webhook_url: account.webhook_url, webhook_secret: account.webhook_secret });
    }

    return json({ error: "Ação desconhecida" }, 400);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
