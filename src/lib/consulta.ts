import { supabase } from '@/lib/supabase';

// --- Plate validation ---

export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidPlate(plate: string): boolean {
  const normalized = normalizePlate(plate);
  const oldFormat = /^[A-Z]{3}[0-9]{4}$/;
  const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  return oldFormat.test(normalized) || mercosulFormat.test(normalized);
}

export function formatPlate(plate: string): string {
  const normalized = normalizePlate(plate);
  if (normalized.length === 7) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
  }
  return normalized;
}

// --- Types matching the edge function response ---

export interface VehicleData {
  marca: string | null;
  modelo: string | null;
  versao: string | null;
  ano_fabricacao: number | null;
  ano_modelo: number | null;
  combustivel: string | null;
  cor: string | null;
  categoria: string | null;
  chassis: string | null;
  renavam: string | null;
  uf: string | null;
  municipio: string | null;
  situacao: string | null;
}

export interface FipeData {
  valor: number | null;
  referencia: string | null;
  codigo_fipe: string | null;
  marca: string | null;
  modelo: string | null;
  ano_modelo: string | null;
  combustivel: string | null;
  consulted_at: string;
}

export interface MarketData {
  min_price: number | null;
  avg_price: number | null;
  max_price: number | null;
  count: number;
  source: string;
  criteria: string;
  consulted_at: string;
}

export interface VehicleStatusData {
  status: 'available' | 'not_configured' | 'error';
  message: string;
  details: string | null;
}

export interface VehicleHistoryData {
  status: 'available' | 'not_configured' | 'error';
  message: string;
  events: Array<{ type: string; date: string | null; description: string }>;
}

export interface QueryResult {
  plate: string;
  vehicle: {
    status: 'available' | 'not_found' | 'not_configured' | 'error';
    data: VehicleData | null;
    message: string;
  };
  fipe: {
    status: 'available' | 'not_found' | 'not_configured' | 'error';
    data: FipeData | null;
    message: string;
  };
  market: {
    status: 'available' | 'no_data' | 'error';
    data: MarketData | null;
    message: string;
  };
  vehicle_status: {
    debits: VehicleStatusData;
    restrictions: VehicleStatusData;
  };
  history: {
    status: 'available' | 'not_configured' | 'error';
    data: VehicleHistoryData | null;
    message: string;
  };
  sources_used: string[];
  consulted_at: string;
}

export interface AnalysisResult {
  score: number | null;
  classification: 'BOM DE VENDA' | 'MÉDIO DE VENDA' | 'RUIM DE VENDA' | 'DADOS INSUFICIENTES';
  positives: string[];
  negatives: string[];
  factors_used: string[];
  factors_missing: string[];
}

// --- Price comparison engine ---

export interface PriceComparison {
  fipe_value: number | null;
  market_min: number | null;
  market_avg: number | null;
  market_max: number | null;
  diff_vs_avg: number | null;
  diff_vs_avg_pct: number | null;
  diff_vs_min: number | null;
  diff_vs_min_pct: number | null;
  diff_vs_max: number | null;
  diff_vs_max_pct: number | null;
}

export function computePriceComparison(fipe: FipeData | null, market: MarketData | null): PriceComparison {
  const safe = (n: number | null | undefined): number | null =>
    (typeof n === 'number' && Number.isFinite(n) && n > 0) ? n : null;

  const fipeValue = safe(fipe?.valor);
  const marketMin = safe(market?.min_price);
  const marketAvg = safe(market?.avg_price);
  const marketMax = safe(market?.max_price);

  const calcDiff = (a: number, b: number): { diff: number; pct: number } => {
    const diff = a - b;
    const pct = b > 0 ? (diff / b) * 100 : 0;
    return { diff, pct };
  };

  return {
    fipe_value: fipeValue,
    market_min: marketMin,
    market_avg: marketAvg,
    market_max: marketMax,
    diff_vs_avg: fipeValue && marketAvg ? calcDiff(fipeValue, marketAvg).diff : null,
    diff_vs_avg_pct: fipeValue && marketAvg ? calcDiff(fipeValue, marketAvg).pct : null,
    diff_vs_min: fipeValue && marketMin ? calcDiff(fipeValue, marketMin).diff : null,
    diff_vs_min_pct: fipeValue && marketMin ? calcDiff(fipeValue, marketMin).pct : null,
    diff_vs_max: fipeValue && marketMax ? calcDiff(fipeValue, marketMax).diff : null,
    diff_vs_max_pct: fipeValue && marketMax ? calcDiff(fipeValue, marketMax).pct : null,
  };
}

// --- API call ---

export async function performVehicleQuery(plate: string): Promise<{
  result: QueryResult;
  analysis: AnalysisResult;
  queryId: string | null;
}> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const apiUrl = `${supabaseUrl}/functions/v1/vehicle-lookup`;

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    throw new Error('Sessão expirada. Entre novamente para consultar.');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: anonKey,
    },
    body: JSON.stringify({ plate: normalizePlate(plate) }),
  });

  if (response.status === 400) {
    const data = await response.json();
    throw new Error(data.error || 'Placa inválida.');
  }

  if (response.status === 401) {
    throw new Error('Não autorizado. Entre novamente.');
  }

  if (!response.ok) {
    throw new Error(`Falha na consulta (${response.status}). Tente novamente.`);
  }

  const data = await response.json();
  if (!data.result) {
    throw new Error('Resposta inválida da consulta.');
  }

  return {
    result: data.result as QueryResult,
    analysis: data.analysis as AnalysisResult,
    queryId: data.queryId || null,
  };
}

// --- Query history ---

export interface QueryHistoryItem {
  id: string;
  plate: string;
  status: string;
  created_at: string;
  query_data: {
    vehicle?: { data?: VehicleData | null };
    analysis?: AnalysisResult;
  } | null;
}

export async function loadQueryHistory(dealerId: string): Promise<QueryHistoryItem[]> {
  const { data, error } = await supabase
    .from('vehicle_queries')
    .select('id, plate, status, created_at, query_data')
    .eq('dealer_id', dealerId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return [];
  return (data || []) as QueryHistoryItem[];
}

// --- Config management ---

export interface ConsultaConfig {
  weight_price: number;
  weight_market: number;
  weight_demand: number;
  weight_sales_velocity: number;
  weight_offer_quantity: number;
  weight_sales_rate: number;
  threshold_good: number;
  threshold_medium: number;
}

export async function loadConsultaConfig(dealerId: string): Promise<ConsultaConfig> {
  const { data, error } = await supabase
    .from('consulta_inteligente_config')
    .select('*')
    .eq('dealer_id', dealerId)
    .maybeSingle();

  if (error || !data) {
    return {
      weight_price: 25,
      weight_market: 20,
      weight_demand: 20,
      weight_sales_velocity: 15,
      weight_offer_quantity: 10,
      weight_sales_rate: 10,
      threshold_good: 70,
      threshold_medium: 40,
    };
  }

  return {
    weight_price: Number(data.weight_price),
    weight_market: Number(data.weight_market),
    weight_demand: Number(data.weight_demand),
    weight_sales_velocity: Number(data.weight_sales_velocity),
    weight_offer_quantity: Number(data.weight_offer_quantity),
    weight_sales_rate: Number(data.weight_sales_rate),
    threshold_good: Number(data.threshold_good),
    threshold_medium: Number(data.threshold_medium),
  };
}

export async function saveConsultaConfig(dealerId: string, config: ConsultaConfig): Promise<boolean> {
  const { error } = await supabase
    .from('consulta_inteligente_config')
    .upsert({
      dealer_id: dealerId,
      weight_price: config.weight_price,
      weight_market: config.weight_market,
      weight_demand: config.weight_demand,
      weight_sales_velocity: config.weight_sales_velocity,
      weight_offer_quantity: config.weight_offer_quantity,
      weight_sales_rate: config.weight_sales_rate,
      threshold_good: config.threshold_good,
      threshold_medium: config.threshold_medium,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'dealer_id' });

  return !error;
}
