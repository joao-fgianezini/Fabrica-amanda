import type { FinancingOffer } from '@/lib/supabase';

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

export async function loadOffers(simulationId: string): Promise<FinancingOffer[]> {
  const { supabase } = await import('@/lib/supabase');
  const { data, error } = await supabase
    .from('financing_offers')
    .select('*')
    .eq('simulation_id', simulationId);
  if (error) throw error;
  return data as FinancingOffer[];
}
