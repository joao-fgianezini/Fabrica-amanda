import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CredereWebhookPayload {
  event: string;
  simulation_uuid?: string;
  status?: string;
  results?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const serviceClient = createClient(supabaseUrl, serviceKey);

    const rawBody = await req.text();

    // Verify webhook signature if header present
    const signature = req.headers.get("X-Credere-Signature");
    const webhookSecret = Deno.env.get("CREDERE_WEBHOOK_SECRET");
    if (webhookSecret && signature) {
      // HMAC verification
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const expectedSig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
      const expectedHex = Array.from(new Uint8Array(expectedSig))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
      if (signature !== expectedHex) {
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const payload = JSON.parse(rawBody) as CredereWebhookPayload;

    if (!payload.simulation_uuid) {
      return new Response(
        JSON.stringify({ error: "simulation_uuid is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the simulation by Credere UUID
    const { data: simulation, error: simError } = await serviceClient
      .from("credere_simulations")
      .select("id, dealer_id, financing_simulation_id")
      .eq("credere_uuid", payload.simulation_uuid)
      .maybeSingle();

    if (simError || !simulation) {
      return new Response(
        JSON.stringify({ error: "Simulation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newStatus = payload.status || "processing";

    // Update simulation status
    await serviceClient
      .from("credere_simulations")
      .update({
        status: newStatus,
        webhook_received_at: new Date().toISOString(),
        raw_response: payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", simulation.id);

    // Also update the linked financing_simulations record
    if (simulation.financing_simulation_id) {
      const financingStatus = mapStatusToFinancing(newStatus);
      await serviceClient
        .from("financing_simulations")
        .update({
          status: financingStatus,
          raw_response: payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", simulation.financing_simulation_id);
    }

    // Process conditions/results if present
    if (payload.results && Array.isArray(payload.results) && payload.results.length > 0) {
      // Delete existing conditions for this simulation
      await serviceClient
        .from("credere_conditions")
        .delete()
        .eq("simulation_id", simulation.id);

      // Insert new conditions
      const conditionsToInsert = payload.results.map((result) => {
        const bank = (result.bank as Record<string, unknown>) || {};
        return {
          simulation_id: simulation.id,
          dealer_id: simulation.dealer_id,
          provider: "credere",
          bank_id: (bank.id as string) || null,
          bank_name: (bank.name as string) || null,
          bank_nickname: (bank.nickname as string) || null,
          bank_febraban_code: (bank.febraban_code as string) || null,
          provider_condition_id: (result.id as string) || (result.condition_id as string) || null,
          installments: (result.installments as number) || null,
          down_payment_cents: (result.down_payment as number) || null,
          financed_amount_cents: (result.financed_amount as number) || null,
          amount_paid_in_financing_cents: (result.amount_paid_in_financing as number) || null,
          bank_down_payment_suggestion_cents: (result.bank_down_payment_suggestion as number) || null,
          expenses: (result.expenses as Record<string, unknown>) || null,
          reason: (result.reason as string) || null,
          run_pre_approval: (result.run_pre_approval as boolean) || false,
          pre_approval_status: (result.pre_approval_status as string) || null,
          process_condition_payload: (result.process_condition_payload as Record<string, unknown>) || null,
          raw_response: result,
        };
      });

      await serviceClient
        .from("credere_conditions")
        .insert(conditionsToInsert);
    }

    return new Response(
      JSON.stringify({ received: true, status: newStatus, conditionsCount: payload.results?.length || 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Credere webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function mapStatusToFinancing(credereStatus: string): string {
  const mapping: Record<string, string> = {
    "created": "processing",
    "processing": "processing",
    "completed": "approved",
    "failed": "rejected",
    "no_results": "rejected",
  };
  return mapping[credereStatus] || "processing";
}
