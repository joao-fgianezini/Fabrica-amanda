import { supabase } from '@/lib/supabase';

// ============================================================
// Types
// ============================================================

export interface CredereConfigStatus {
  configured: boolean;
  storeId: string | null;
  integrationStatus: string;
  tokenExpiresAt: string | null;
  tokenRefreshExpiresAt: string | null;
  tokenIsValid: boolean;
  hasRefreshToken: boolean;
  scopes: string[];
}

export interface CredereVehicle {
  id: string;
  brand: string;
  model: string;
  version?: string;
  fipe_code?: string;
  [key: string]: unknown;
}

export interface CredereCondition {
  id: string;
  simulation_id: string;
  dealer_id: string;
  provider: string;
  bank_id: string | null;
  bank_name: string | null;
  bank_nickname: string | null;
  bank_febraban_code: string | null;
  provider_condition_id: string | null;
  installments: number | null;
  down_payment_cents: number | null;
  financed_amount_cents: number | null;
  amount_paid_in_financing_cents: number | null;
  bank_down_payment_suggestion_cents: number | null;
  expenses: Record<string, unknown> | null;
  reason: string | null;
  run_pre_approval: boolean;
  pre_approval_status: string | null;
  process_condition_payload: Record<string, unknown> | null;
  raw_response: Record<string, unknown> | null;
  is_selected: boolean;
  selected_at: string | null;
  created_at: string;
}

export interface CredereSimulation {
  id: string;
  dealer_id: string;
  financing_simulation_id: string | null;
  credere_uuid: string | null;
  provider: string;
  store_id: string | null;
  customer_id: string | null;
  vehicle_id: string | null;
  seller_cpf: string | null;
  vehicle_value_cents: number | null;
  status: string;
  raw_response: Record<string, unknown> | null;
  webhook_received_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CredereBankCredential {
  id: string;
  dealer_id: string;
  bank_febraban_code: string;
  bank_name: string | null;
  bank_nickname: string | null;
  status: 'not_analyzed' | 'okay' | 'unauthorized';
  credential_type: string;
  raw_response: Record<string, unknown> | null;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSimulationParams {
  sellerCpf: string;
  clientCpf: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientBirthDate?: string;
  clientIncome?: number;
  clientProfession?: string;
  clientAddress?: string;
  vehicleCredereModelId: string;
  licensingUf: string;
  licensingCity: string;
  manufactureYear: number;
  modelYear: number;
  assetValueCents: number;
  zeroKm: boolean;
  conditions: Array<{ installments: number; downPaymentCents: number }>;
  financingSimulationId?: string;
}

export interface SimulationResponse {
  credereUuid: string | null;
  credereSimulationId: string | null;
  rawResponse: Record<string, unknown>;
  status: string;
}

// ============================================================
// Money helpers
// ============================================================

export function moneyToCents(value: number): number {
  return Math.round(value * 100);
}

export function centsToMoney(cents: number): number {
  return cents / 100;
}

// ============================================================
// CPF validation
// ============================================================

export function isValidCpf(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(clean[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(clean[10])) return false;

  return true;
}

export function maskCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
}

export function maskCpfPartial(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
}

// ============================================================
// API client
// ============================================================

async function callCredereApi(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    throw new Error('Sessão expirada. Entre novamente.');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const apiUrl = `${supabaseUrl}/functions/v1/credere-api`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: anonKey,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = data as { error?: string; code?: string };
    const error = new Error(err.error || 'Erro na integração Credere.') as Error & { code?: string };
    error.code = err.code;
    throw error;
  }

  return data as Record<string, unknown>;
}

// ============================================================
// Public API
// ============================================================

export async function getCredereConfigStatus(): Promise<CredereConfigStatus> {
  const data = await callCredereApi({ action: 'config_status' });
  return data as unknown as CredereConfigStatus;
}

export async function searchCredereVehicles(query: string): Promise<CredereVehicle[]> {
  const data = await callCredereApi({ action: 'search_vehicles', vehicleSearchQuery: query });
  const vehicles = (data as Record<string, unknown>).vehicles;
  if (Array.isArray(vehicles)) return vehicles as CredereVehicle[];
  if (vehicles && typeof vehicles === 'object') {
    const arr = (vehicles as Record<string, unknown>).data;
    if (Array.isArray(arr)) return arr as CredereVehicle[];
  }
  return [];
}

export async function getCredereVehicle(modelId: string): Promise<CredereVehicle | null> {
  const data = await callCredereApi({ action: 'get_vehicle', credereVehicleModelId: modelId });
  return (data as Record<string, unknown>).vehicle as CredereVehicle || null;
}

export async function createCredereSimulation(params: CreateSimulationParams): Promise<SimulationResponse> {
  const data = await callCredereApi({
    action: 'create_simulation',
    ...params,
  });
  return data as unknown as SimulationResponse;
}

export async function getBankCredentialFields(bankFebrabanCode: string): Promise<Record<string, unknown>> {
  const data = await callCredereApi({ action: 'get_bank_credentials_fields', bankFebrabanCode });
  return (data as Record<string, unknown>).fields as Record<string, unknown>;
}

export async function saveBankCredential(
  bankFebrabanCode: string,
  credentialFields: Record<string, string>,
  cnpj?: string
): Promise<Record<string, unknown>> {
  const data = await callCredereApi({
    action: 'save_bank_credential',
    bankFebrabanCode,
    credentialFields,
    cnpj,
  });
  return (data as Record<string, unknown>).credential as Record<string, unknown>;
}

export async function getBankCredentialsStatus(): Promise<CredereBankCredential[]> {
  const data = await callCredereApi({ action: 'get_bank_credentials_status' });
  const credentials = (data as Record<string, unknown>).credentials;
  return (Array.isArray(credentials) ? credentials : []) as CredereBankCredential[];
}

// ============================================================
// DB helpers (direct Supabase queries)
// ============================================================

export async function loadCredereSimulation(financingSimulationId: string): Promise<CredereSimulation | null> {
  const { data, error } = await supabase
    .from('credere_simulations')
    .select('*')
    .eq('financing_simulation_id', financingSimulationId)
    .maybeSingle();
  if (error) return null;
  return data as CredereSimulation | null;
}

export async function loadCredereConditions(credereSimulationId: string): Promise<CredereCondition[]> {
  const { data, error } = await supabase
    .from('credere_conditions')
    .select('*')
    .eq('simulation_id', credereSimulationId)
    .order('created_at');
  if (error) return [];
  return (data || []) as CredereCondition[];
}

export async function selectCondition(conditionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('credere_conditions')
    .update({ is_selected: true, selected_at: new Date().toISOString() })
    .eq('id', conditionId);
  return !error;
}

export async function loadVehicleCredereMapping(vehicleId: string): Promise<{ credere_vehicle_model_id: string } | null> {
  const { data, error } = await supabase
    .from('credere_vehicle_mapping')
    .select('credere_vehicle_model_id')
    .eq('vehicle_id', vehicleId)
    .maybeSingle();
  if (error) return null;
  return data as { credere_vehicle_model_id: string } | null;
}

export async function saveVehicleCredereMapping(
  vehicleId: string,
  dealerId: string,
  credereVehicleModelId: string,
  extra?: { brand?: string; model?: string; version?: string; fipe_code?: string; raw_response?: Record<string, unknown> }
): Promise<boolean> {
  const { error } = await supabase
    .from('credere_vehicle_mapping')
    .upsert({
      vehicle_id: vehicleId,
      dealer_id: dealerId,
      credere_vehicle_model_id: credereVehicleModelId,
      brand: extra?.brand || null,
      model: extra?.model || null,
      version: extra?.version || null,
      fipe_code: extra?.fipe_code || null,
      raw_response: extra?.raw_response || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'vehicle_id' });
  return !error;
}

// ============================================================
// Pre-approval status translation
// ============================================================

export function translatePreApprovalStatus(status: string | null): string | null {
  if (!status) return null;
  const map: Record<string, string> = {
    approved: 'Aprovado',
    rejected: 'Reprovado',
    pre_approved: 'Pré-aprovado',
    pending: 'Em análise',
    processing: 'Processando',
    manual_review: 'Revisão manual',
    expired: 'Expirado',
  };
  return map[status.toLowerCase()] || status;
}

// ============================================================
// Expenses translation
// ============================================================

export interface ExpenseDetail {
  label: string;
  valueCents: number;
}

export function parseExpenses(expenses: Record<string, unknown> | null): ExpenseDetail[] {
  if (!expenses) return [];
  const labelMap: Record<string, string> = {
    iof: 'IOF',
    taxa_registro: 'Taxa de Registro',
    registro: 'Taxa de Registro',
    avaliacao: 'Avaliação',
    seguro: 'Seguro',
    spf: 'SPF',
    other: 'Outras Despesas',
    outras: 'Outras Despesas',
  };
  const result: ExpenseDetail[] = [];
  for (const [key, value] of Object.entries(expenses)) {
    if (typeof value === 'number' && value > 0) {
      result.push({
        label: labelMap[key.toLowerCase()] || key,
        valueCents: value,
      });
    }
  }
  return result;
}
