import { supabase, type FinancingInstitution, type FinancingOffer } from '@/lib/supabase';

export interface SimulationInput {
  vehiclePrice: number;
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  maxInstallment: number | null;
}

export interface SimulationFullInput extends SimulationInput {
  simulationId: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number | null;
  clientName?: string;
  clientDocument?: string | null;
}

export interface ProviderResult {
  institutionId: string;
  institutionName: string;
  status: 'approved' | 'approved_with_condition' | 'rejected' | 'unavailable';
  downPayment: number | null;
  financedAmount: number | null;
  termMonths: number | null;
  installmentAmount: number | null;
  interestRate: number | null;
  cet: number | null;
  conditions: string | null;
  notes: string | null;
  financingUrl: string | null;
  whatsappNumber: string | null;
}

export async function runSimulation(
  institutions: FinancingInstitution[],
  input: SimulationFullInput
): Promise<ProviderResult[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const apiUrl = `${supabaseUrl}/functions/v1/financing-simulator`;

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
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Falha na consulta (${response.status})`);
  }

  const data = await response.json();
  if (!data.results || !Array.isArray(data.results)) {
    throw new Error('Resposta inválida do simulador');
  }

  // Map edge function results to ProviderResult
  const results: ProviderResult[] = data.results.map((r: {
    institutionId: string; institutionName: string;
    status: string; downPayment: number; financedAmount: number;
    termMonths: number; installmentAmount: number; interestRate: number;
    cet: number; conditions: string; notes: string;
    financingUrl: string; whatsappNumber: string;
  }) => ({
    institutionId: r.institutionId,
    institutionName: r.institutionName,
    status: r.status as ProviderResult['status'],
    downPayment: r.downPayment,
    financedAmount: r.financedAmount,
    termMonths: r.termMonths,
    installmentAmount: r.installmentAmount,
    interestRate: r.interestRate,
    cet: r.cet,
    conditions: r.conditions,
    notes: r.notes,
    financingUrl: r.financingUrl || null,
    whatsappNumber: r.whatsappNumber || null,
  }));

  return results;
}

export function determineBestOption(results: ProviderResult[]): ProviderResult | null {
  const valid = results.filter(
    (r) => r.status === 'approved' || r.status === 'approved_with_condition'
  );
  if (valid.length === 0) return null;

  const scored = valid.map((r) => {
    let score = 0;
    if (r.status === 'approved') score += 100;
    if (r.installmentAmount) score -= r.installmentAmount * 0.01;
    if (r.downPayment) score -= r.downPayment * 0.005;
    if (r.cet) score -= r.cet;
    if (r.termMonths) score += r.termMonths * 0.1;
    return { result: r, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.result || null;
}

export function rankResults(
  results: ProviderResult[],
  criteria: 'best' | 'lowest_installment' | 'lowest_down' | 'lowest_cost' | 'longest_term' | 'approval'
): ProviderResult[] {
  const sorted = [...results].sort((a, b) => {
    switch (criteria) {
      case 'lowest_installment':
        return (a.installmentAmount || Infinity) - (b.installmentAmount || Infinity);
      case 'lowest_down':
        return (a.downPayment || Infinity) - (b.downPayment || Infinity);
      case 'lowest_cost':
        return (a.cet || Infinity) - (b.cet || Infinity);
      case 'longest_term':
        return (b.termMonths || 0) - (a.termMonths || 0);
      case 'approval':
        return rankApproval(a) - rankApproval(b);
      case 'best':
      default:
        return rankBest(a) - rankBest(b);
    }
  });
  return sorted;
}

function rankApproval(r: ProviderResult): number {
  if (r.status === 'approved') return 0;
  if (r.status === 'approved_with_condition') return 1;
  if (r.status === 'rejected') return 2;
  return 3;
}

function rankBest(r: ProviderResult): number {
  let score = 0;
  if (r.status === 'approved') score -= 1000;
  if (r.status === 'approved_with_condition') score -= 500;
  if (r.installmentAmount) score += r.installmentAmount * 0.01;
  if (r.downPayment) score += r.downPayment * 0.005;
  if (r.cet) score += r.cet * 10;
  if (r.termMonths) score -= r.termMonths * 0.1;
  return score;
}

export async function loadInstitutions(): Promise<FinancingInstitution[]> {
  const { data, error } = await supabase
    .from('financing_institutions')
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data as FinancingInstitution[];
}

// Reload saved offers for a simulation from the database
export async function loadOffers(simulationId: string): Promise<FinancingOffer[]> {
  const { data, error } = await supabase
    .from('financing_offers')
    .select('*')
    .eq('simulation_id', simulationId);
  if (error) throw error;
  return data as FinancingOffer[];
}
