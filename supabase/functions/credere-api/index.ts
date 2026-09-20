import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CREDERE_BASE_URL = "https://app.meucredere.com.br/api/v1";

// ============================================================
// Types
// ============================================================

interface CredereTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  created_at?: number;
}

interface SimulationRequestBody {
  action: "create_simulation" | "search_vehicles" | "get_vehicle" | "get_bank_credentials_fields" | "save_bank_credential" | "get_bank_credentials_status" | "config_status";
  dealerId: string;

  // For create_simulation
  sellerCpf?: string;
  clientCpf?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientBirthDate?: string;
  clientIncome?: number;
  clientProfession?: string;
  clientAddress?: string;
  vehicleCredereModelId?: string;
  licensingUf?: string;
  licensingCity?: string;
  manufactureYear?: number;
  modelYear?: number;
  assetValueCents?: number;
  zeroKm?: boolean;
  conditions?: Array<{ installments: number; downPaymentCents: number }>;
  financingSimulationId?: string;

  // For search_vehicles
  vehicleSearchQuery?: string;

  // For get_vehicle
  credereVehicleModelId?: string;

  // For get_bank_credentials_fields / save_bank_credential
  bankFebrabanCode?: string;
  credentialFields?: Record<string, string>;

  // For save_bank_credential (CNPJ simplificado)
  cnpj?: string;
}

// ============================================================
// Auth helpers
// ============================================================

async function getValidAccessToken(
  supabaseClient: ReturnType<typeof createClient>,
  dealerId: string
): Promise<string> {
  const { data: tokenData, error } = await supabaseClient
    .from("credere_token_cache")
    .select("access_token, refresh_token, expires_at, refresh_expires_at, scope")
    .eq("dealer_id", dealerId)
    .maybeSingle();

  if (error || !tokenData) {
    throw new CredereError("CREDERE_NOT_CONFIGURED", "Integração Credere não configurada. Configure as credenciais primeiro.");
  }

  const now = new Date();
  const expiresAt = new Date(tokenData.expires_at);

  if (expiresAt > now) {
    return tokenData.access_token;
  }

  if (tokenData.refresh_token) {
    const refreshed = await refreshAccessToken(supabaseClient, dealerId, tokenData.refresh_token);
    return refreshed;
  }

  throw new CredereError("CREDERE_TOKEN_EXPIRED", "Token expirado e sem refresh token. Reconfigure a integração.");
}

async function refreshAccessToken(
  supabaseClient: ReturnType<typeof createClient>,
  dealerId: string,
  refreshToken: string
): Promise<string> {
  const clientId = Deno.env.get("CREDERE_CLIENT_ID");
  const clientSecret = Deno.env.get("CREDERE_CLIENT_SECRET");
  const redirectUri = Deno.env.get("CREDERE_REDIRECT_URI");

  if (!clientId || !clientSecret) {
    throw new CredereError("CREDERE_NOT_CONFIGURED", "Credere client_id/client_secret não configurados.");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  if (redirectUri) body.append("redirect_uri", redirectUri);

  const response = await fetch(`${CREDERE_BASE_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Credere token refresh failed:", response.status, errText);
    throw new CredereError("CREDERE_AUTH_FAILED", "Não foi possível renovar o token da Credere.");
  }

  const token = await response.json() as CredereTokenResponse;
  await saveTokens(supabaseClient, dealerId, token);

  return token.access_token;
}

async function saveTokens(
  supabaseClient: ReturnType<typeof createClient>,
  dealerId: string,
  token: CredereTokenResponse
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (token.expires_in || 3600) * 1000);
  const refreshExpiresAt = token.refresh_token
    ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;

  await supabaseClient
    .from("credere_token_cache")
    .upsert({
      dealer_id: dealerId,
      access_token: token.access_token,
      refresh_token: token.refresh_token || null,
      token_type: token.token_type || "Bearer",
      expires_at: expiresAt.toISOString(),
      refresh_expires_at: refreshExpiresAt?.toISOString() || null,
      scope: token.scope || null,
      updated_at: now.toISOString(),
    }, { onConflict: "dealer_id" });
}

// ============================================================
// Store-Id helper
// ============================================================

async function getStoreId(
  supabaseClient: ReturnType<typeof createClient>,
  dealerId: string
): Promise<string> {
  const { data: config } = await supabaseClient
    .from("credere_dealer_config")
    .select("credere_store_id, integration_status")
    .eq("dealer_id", dealerId)
    .maybeSingle();

  if (!config || !config.credere_store_id) {
    const { data: dealer } = await supabaseClient
      .from("dealers")
      .select("credere_store_id")
      .eq("id", dealerId)
      .maybeSingle();

    if (dealer?.credere_store_id) return dealer.credere_store_id;

    throw new CredereError("NO_STORE_ID", "Esta loja não possui integração financeira configurada.");
  }

  return config.credere_store_id;
}

// ============================================================
// Credere API calls
// ============================================================

class CredereError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function callCredere(
  method: string,
  path: string,
  accessToken: string,
  storeId: string,
  body?: unknown
): Promise<unknown> {
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${accessToken}`,
    "Store-Id": storeId,
    "Content-Type": "application/json",
  };

  const options: RequestInit & { signal: AbortSignal } = {
    method,
    headers,
    signal: AbortSignal.timeout(30000),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${CREDERE_BASE_URL}${path}`, options);

  if (response.status === 429) {
    throw new CredereError("RATE_LIMIT", "Muitas solicitações foram realizadas. Aguarde alguns instantes.");
  }

  if (response.status === 401) {
    throw new CredereError("CREDERE_UNAUTHORIZED", "Não foi possível autenticar a integração financeira.");
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`Credere API error ${response.status}:`, errText);
    let errMsg = `Erro na API Credere (${response.status}).`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.error || errJson.message || errMsg;
    } catch { /* keep default */ }
    throw new CredereError("CREDERE_API_ERROR", errMsg);
  }

  return response.json();
}

// ============================================================
// Action handlers
// ============================================================

async function handleCreateSimulation(
  supabaseClient: ReturnType<typeof createClient>,
  authClient: ReturnType<typeof createClient>,
  body: SimulationRequestBody,
  dealerId: string
): Promise<Response> {
  const accessToken = await getValidAccessToken(supabaseClient, dealerId);
  const storeId = await getStoreId(supabaseClient, dealerId);

  const required = ["sellerCpf", "clientCpf", "vehicleCredereModelId", "licensingUf", "licensingCity", "manufactureYear", "modelYear", "assetValueCents", "conditions"];
  for (const field of required) {
    if (!(body as Record<string, unknown>)[field]) {
      return errorResponse(400, `Campo obrigatório ausente: ${field}`);
    }
  }

  const payload = {
    simulation: {
      process_bank_suggested_conditions: true,
      seller_cpf: body.sellerCpf,
      retrieve_lead: {
        cpf_cnpj: body.clientCpf,
      },
      assets_value: body.assetValueCents,
      vehicle: {
        credere_vehicle_model_id: body.vehicleCredereModelId,
        licensing_uf: body.licensingUf,
        licensing_city: body.licensingCity,
        manufacture_year: body.manufactureYear,
        model_year: body.modelYear,
        asset_value: body.assetValueCents,
        zero_km: body.zeroKm ?? false,
      },
      conditions: body.conditions!.map(c => ({
        installments: c.installments,
        down_payment: c.downPaymentCents,
      })),
    },
  };

  const result = await callCredere("POST", "/banks_api/simulations", accessToken, storeId, payload) as Record<string, unknown>;

  const credereUuid = result.uuid as string | undefined;

  let credereSimulationId: string | null = null;

  if (credereUuid) {
    const { data: credereSim } = await supabaseClient
      .from("credere_simulations")
      .insert({
        dealer_id: dealerId,
        financing_simulation_id: body.financingSimulationId || null,
        credere_uuid: credereUuid,
        provider: "credere",
        store_id: storeId,
        seller_cpf: body.sellerCpf,
        vehicle_value_cents: body.assetValueCents,
        status: "created",
        raw_response: result,
      })
      .select("id")
      .maybeSingle();

    credereSimulationId = credereSim?.id ?? null;

    if (body.financingSimulationId) {
      await supabaseClient
        .from("financing_simulations")
        .update({
          credere_simulation_uuid: credereUuid,
          provider: "credere",
          raw_response: result,
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.financingSimulationId);
    }
  }

  return successResponse({
    credereUuid,
    credereSimulationId,
    rawResponse: result,
    status: "created",
  });
}

async function handleSearchVehicles(
  supabaseClient: ReturnType<typeof createClient>,
  body: SimulationRequestBody,
  dealerId: string
): Promise<Response> {
  const accessToken = await getValidAccessToken(supabaseClient, dealerId);
  const storeId = await getStoreId(supabaseClient, dealerId);

  const params = new URLSearchParams();
  if (body.vehicleSearchQuery) params.append("q", body.vehicleSearchQuery);

  const result = await callCredere("GET", `/banks_api/vehicles?${params.toString()}`, accessToken, storeId);

  return successResponse({ vehicles: result });
}

async function handleGetVehicle(
  supabaseClient: ReturnType<typeof createClient>,
  body: SimulationRequestBody,
  dealerId: string
): Promise<Response> {
  const accessToken = await getValidAccessToken(supabaseClient, dealerId);
  const storeId = await getStoreId(supabaseClient, dealerId);

  if (!body.credereVehicleModelId) {
    return errorResponse(400, "credereVehicleModelId é obrigatório.");
  }

  const result = await callCredere("GET", `/banks_api/vehicles/${body.credereVehicleModelId}`, accessToken, storeId);

  return successResponse({ vehicle: result });
}

async function handleGetBankCredentialFields(
  supabaseClient: ReturnType<typeof createClient>,
  body: SimulationRequestBody,
  dealerId: string
): Promise<Response> {
  const accessToken = await getValidAccessToken(supabaseClient, dealerId);
  const storeId = await getStoreId(supabaseClient, dealerId);

  if (!body.bankFebrabanCode) {
    return errorResponse(400, "bankFebrabanCode é obrigatório.");
  }

  const result = await callCredere(
    "GET",
    `/stores/${storeId}/bank_credentials/${body.bankFebrabanCode}/fields`,
    accessToken,
    storeId
  );

  return successResponse({ fields: result });
}

async function handleSaveBankCredential(
  supabaseClient: ReturnType<typeof createClient>,
  body: SimulationRequestBody,
  dealerId: string
): Promise<Response> {
  const accessToken = await getValidAccessToken(supabaseClient, dealerId);
  const storeId = await getStoreId(supabaseClient, dealerId);

  if (!body.bankFebrabanCode) {
    return errorResponse(400, "bankFebrabanCode é obrigatório.");
  }

  const credentialBody: Record<string, unknown> = {};
  if (body.credentialFields) {
    for (const [key, value] of Object.entries(body.credentialFields)) {
      credentialBody[key] = value;
    }
  }
  if (body.cnpj) {
    credentialBody.cnpj = body.cnpj;
  }

  const result = await callCredere(
    "PUT",
    `/stores/${storeId}/bank_credentials/${body.bankFebrabanCode}`,
    accessToken,
    storeId,
    credentialBody
  );

  const status = (result as Record<string, unknown>)?.status as string || "not_analyzed";
  const bankName = (result as Record<string, unknown>)?.bank_name as string || null;
  const bankNickname = (result as Record<string, unknown>)?.bank_nickname as string || null;

  await supabaseClient
    .from("credere_bank_credentials")
    .upsert({
      dealer_id: dealerId,
      bank_febraban_code: body.bankFebrabanCode,
      bank_name: bankName,
      bank_nickname: bankNickname,
      status,
      raw_response: result,
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "dealer_id,bank_febraban_code" });

  return successResponse({ credential: result });
}

async function handleGetBankCredentialsStatus(
  supabaseClient: ReturnType<typeof createClient>,
  body: SimulationRequestBody,
  dealerId: string
): Promise<Response> {
  const accessToken = await getValidAccessToken(supabaseClient, dealerId);
  const storeId = await getStoreId(supabaseClient, dealerId);

  const result = await callCredere("GET", `/stores/${storeId}/bank_credentials`, accessToken, storeId);

  const credentials = result as Array<Record<string, unknown>> || [];

  for (const cred of credentials) {
    const febraban = cred.bank_febraban_code as string;
    if (febraban) {
      await supabaseClient
        .from("credere_bank_credentials")
        .upsert({
          dealer_id: dealerId,
          bank_febraban_code: febraban,
          bank_name: cred.bank_name as string || null,
          bank_nickname: cred.bank_nickname as string || null,
          status: cred.status as string || "not_analyzed",
          raw_response: cred,
          last_checked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "dealer_id,bank_febraban_code" });
    }
  }

  const { data: savedCreds } = await supabaseClient
    .from("credere_bank_credentials")
    .select("*")
    .eq("dealer_id", dealerId)
    .order("bank_name");

  return successResponse({ credentials: savedCreds || [] });
}

async function handleConfigStatus(
  supabaseClient: ReturnType<typeof createClient>,
  _body: SimulationRequestBody,
  dealerId: string
): Promise<Response> {
  const { data: config } = await supabaseClient
    .from("credere_dealer_config")
    .select("*")
    .eq("dealer_id", dealerId)
    .maybeSingle();

  const { data: tokenData } = await supabaseClient
    .from("credere_token_cache")
    .select("expires_at, refresh_expires_at, scope, updated_at")
    .eq("dealer_id", dealerId)
    .maybeSingle();

  const storeId = config?.credere_store_id || null;
  const integrationStatus = config?.integration_status || "not_configured";
  const tokenExpiresAt = tokenData?.expires_at || null;
  const tokenRefreshExpiresAt = tokenData?.refresh_expires_at || null;
  const tokenIsValid = tokenExpiresAt ? new Date(tokenExpiresAt) > new Date() : false;
  const hasRefreshToken = !!tokenData?.refresh_expires_at;

  return successResponse({
    configured: !!storeId && tokenIsValid,
    storeId,
    integrationStatus,
    tokenExpiresAt,
    tokenRefreshExpiresAt,
    tokenIsValid,
    hasRefreshToken,
    scopes: config?.scopes || [],
  });
}

// ============================================================
// Response helpers
// ============================================================

function successResponse(data: unknown): Response {
  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function errorResponse(status: number, message: string, code?: string): Response {
  return new Response(
    JSON.stringify({ error: message, code: code || "ERROR" }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ============================================================
// Main handler
// ============================================================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- Authentication ---
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token || token === anonKey) {
      return errorResponse(401, "Não autorizado");
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser();
    const user = userData?.user;
    if (userError || !user) {
      return errorResponse(401, "Não autorizado");
    }

    // Get dealer_id
    const { data: dealerData, error: dealerErr } = await authClient
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (dealerErr || !dealerData) {
      return errorResponse(403, "Lojista não encontrado");
    }

    const dealerId = dealerData.id;
    const serviceClient = createClient(supabaseUrl, serviceKey);

    const body = await req.json() as SimulationRequestBody;

    if (body.dealerId && body.dealerId !== dealerId) {
      return errorResponse(403, "Acesso negado a esta loja");
    }

    switch (body.action) {
      case "create_simulation":
        return await handleCreateSimulation(serviceClient, authClient, body, dealerId);
      case "search_vehicles":
        return await handleSearchVehicles(serviceClient, body, dealerId);
      case "get_vehicle":
        return await handleGetVehicle(serviceClient, body, dealerId);
      case "get_bank_credentials_fields":
        return await handleGetBankCredentialFields(serviceClient, body, dealerId);
      case "save_bank_credential":
        return await handleSaveBankCredential(serviceClient, body, dealerId);
      case "get_bank_credentials_status":
        return await handleGetBankCredentialsStatus(serviceClient, body, dealerId);
      case "config_status":
        return await handleConfigStatus(serviceClient, body, dealerId);
      default:
        return errorResponse(400, `Action inválida: ${body.action}`);
    }
  } catch (err) {
    if (err instanceof CredereError) {
      const status = err.code === "CREDERE_NOT_CONFIGURED" || err.code === "NO_STORE_ID" ? 400
        : err.code === "CREDERE_UNAUTHORIZED" ? 401
        : err.code === "RATE_LIMIT" ? 429
        : 500;
      return errorResponse(status, err.message, err.code);
    }
    console.error("Credere API error:", err);
    return errorResponse(500, "Erro ao processar solicitação. Tente novamente.");
  }
});
