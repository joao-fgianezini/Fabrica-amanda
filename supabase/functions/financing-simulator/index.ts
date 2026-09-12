import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SimulationRequest {
  simulationId: string;
  vehiclePrice: number;
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  maxInstallment: number | null;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number | null;
  clientName?: string;
  clientDocument?: string | null;
}

interface InstitutionProfile {
  id: string;
  name: string;
  type: 'bank' | 'financeira' | 'digital';
  baseRate: number;        // annual base interest rate (%)
  rateSpread: number;      // variation applied per case
  maxTermMonths: number;
  maxFinancedRatio: number; // max % of vehicle price they finance
  minDownPaymentRatio: number;
  maxVehicleAge: number;    // max years old
  minVehicleValue: number;
  approvalScoreThreshold: number; // 0-100
  adminFeeRate: number;      // administrative fee as % of financed amount
  insuranceRate: number;     // insurance % added to installment
  ioiofee: number;           // IOF rate annual %
  financingUrl: string;      // official URL to start financing process
  whatsappNumber: string;    // commercial WhatsApp for auto financing
}

const INSTITUTIONS: InstitutionProfile[] = [
  {
    id: 'f4f2cd03-8a72-41b9-84db-f1309b22509c', name: 'Banco do Brasil', type: 'bank',
    baseRate: 1.59, rateSpread: 0.4, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 15000,
    approvalScoreThreshold: 60, adminFeeRate: 0.015, insuranceRate: 0.0035, ioiofee: 0.38,
    financingUrl: 'https://www.bb.com.br/site/pra-voce/financiamentos/financiamento-de-carro', whatsappNumber: '558006604041',
  },
  {
    id: 'd0c44fa5-2054-4d83-b381-b168ce7f766d', name: 'Caixa Econômica', type: 'bank',
    baseRate: 1.65, rateSpread: 0.35, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 8, minVehicleValue: 18000,
    approvalScoreThreshold: 65, adminFeeRate: 0.02, insuranceRate: 0.004, ioiofee: 0.38,
    financingUrl: 'https://www.caixa.gov.br/voce/credito-financiamento/financiamentos/credito-auto-caixa/Paginas/default.aspx', whatsappNumber: '5580055808080',
  },
  {
    id: 'a9380db1-3d93-403b-927c-5eca537fb868', name: 'Itaú Unibanco', type: 'bank',
    baseRate: 1.49, rateSpread: 0.5, maxTermMonths: 60, maxFinancedRatio: 0.95,
    minDownPaymentRatio: 0.05, maxVehicleAge: 12, minVehicleValue: 12000,
    approvalScoreThreshold: 55, adminFeeRate: 0.018, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.itau.com.br/emprestimos-financiamentos/veiculos', whatsappNumber: '5511300355555',
  },
  {
    id: 'd4c8d6ed-bce1-4077-aea1-9864733b1fab', name: 'Bradesco Financiamentos', type: 'bank',
    baseRate: 1.55, rateSpread: 0.45, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 14000,
    approvalScoreThreshold: 58, adminFeeRate: 0.017, insuranceRate: 0.0032, ioiofee: 0.38,
    financingUrl: 'https://financiamentos.bradesco/financiamentos/financiamentos-pf', whatsappNumber: '551140020022',
  },
  {
    id: '52c4d3f7-19a3-4ce4-b08b-192487c72b24', name: 'Santander', type: 'bank',
    baseRate: 1.52, rateSpread: 0.48, maxTermMonths: 60, maxFinancedRatio: 0.92,
    minDownPaymentRatio: 0.08, maxVehicleAge: 11, minVehicleValue: 13000,
    approvalScoreThreshold: 57, adminFeeRate: 0.019, insuranceRate: 0.0033, ioiofee: 0.38,
    financingUrl: 'https://www.santander.com.br/hotsite/santanderfinanciamentos', whatsappNumber: '551130033333',
  },
  {
    id: 'f49312db-78a5-435c-85d1-613d18a1eceb', name: 'Banco BV', type: 'bank',
    baseRate: 1.68, rateSpread: 0.55, maxTermMonths: 54, maxFinancedRatio: 0.85,
    minDownPaymentRatio: 0.15, maxVehicleAge: 12, minVehicleValue: 10000,
    approvalScoreThreshold: 50, adminFeeRate: 0.022, insuranceRate: 0.0028, ioiofee: 0.38,
    financingUrl: 'https://www.bv.com.br', whatsappNumber: '551130031616',
  },
  {
    id: 'c227558c-e488-4bcb-ad2a-b8231b0a393e', name: 'Omni', type: 'financeira',
    baseRate: 2.19, rateSpread: 0.6, maxTermMonths: 48, maxFinancedRatio: 0.80,
    minDownPaymentRatio: 0.20, maxVehicleAge: 15, minVehicleValue: 8000,
    approvalScoreThreshold: 40, adminFeeRate: 0.03, insuranceRate: 0.0025, ioiofee: 0.38,
    financingUrl: 'https://www.omni.com.br/produtos/financiamento-de-carro', whatsappNumber: '551130000000',
  },
  {
    id: '455230a0-13d9-4472-8db1-97a011aa4b64', name: 'Safra Financeira', type: 'bank',
    baseRate: 1.75, rateSpread: 0.5, maxTermMonths: 48, maxFinancedRatio: 0.85,
    minDownPaymentRatio: 0.15, maxVehicleAge: 10, minVehicleValue: 12000,
    approvalScoreThreshold: 52, adminFeeRate: 0.02, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.safrafinanceira.com.br/lp/veiculos', whatsappNumber: '551130005555',
  },
  {
    id: 'a1b2c3d4-1111-4111-8111-111111111111',
    name: 'Sicredi', type: 'bank',
    baseRate: 1.45, rateSpread: 0.4, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 12000,
    approvalScoreThreshold: 55, adminFeeRate: 0.015, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.sicredi.com.br', whatsappNumber: '553002601000',
  },
  {
    id: 'a1b2c3d4-2222-4222-8222-222222222222',
    name: 'Sicoob', type: 'bank',
    baseRate: 1.42, rateSpread: 0.35, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 12000,
    approvalScoreThreshold: 55, adminFeeRate: 0.015, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.sicoob.com.br', whatsappNumber: '556140001111',
  },
  {
    id: 'a1b2c3d4-3333-4333-8333-333333333333',
    name: 'Banrisul', type: 'bank',
    baseRate: 1.58, rateSpread: 0.45, maxTermMonths: 54, maxFinancedRatio: 0.85,
    minDownPaymentRatio: 0.15, maxVehicleAge: 10, minVehicleValue: 10000,
    approvalScoreThreshold: 53, adminFeeRate: 0.018, insuranceRate: 0.0032, ioiofee: 0.38,
    financingUrl: 'https://www.banrisul.com.br', whatsappNumber: '555132145678',
  },
  {
    id: 'a1b2c3d4-4444-4444-8444-444444444444',
    name: 'BRB - Banco de Brasília', type: 'bank',
    baseRate: 1.52, rateSpread: 0.4, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 12, minVehicleValue: 10000,
    approvalScoreThreshold: 54, adminFeeRate: 0.016, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.brb.com.br', whatsappNumber: '556130303030',
  },
  {
    id: 'a1b2c3d4-5555-4555-8555-555555555555',
    name: 'Banco do Nordeste', type: 'bank',
    baseRate: 1.60, rateSpread: 0.5, maxTermMonths: 54, maxFinancedRatio: 0.85,
    minDownPaymentRatio: 0.15, maxVehicleAge: 10, minVehicleValue: 10000,
    approvalScoreThreshold: 52, adminFeeRate: 0.02, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.bnb.gov.br', whatsappNumber: '558532330000',
  },
  {
    id: 'a1b2c3d4-6666-4666-8666-666666666666',
    name: 'Banco Inter', type: 'digital',
    baseRate: 1.39, rateSpread: 0.45, maxTermMonths: 60, maxFinancedRatio: 0.95,
    minDownPaymentRatio: 0.05, maxVehicleAge: 12, minVehicleValue: 10000,
    approvalScoreThreshold: 50, adminFeeRate: 0.012, insuranceRate: 0.0025, ioiofee: 0.38,
    financingUrl: 'https://www.bancointer.com.br', whatsappNumber: '553033000000',
  },
  {
    id: 'a1b2c3d4-7777-4777-8777-777777777777',
    name: 'Banco Original', type: 'digital',
    baseRate: 1.43, rateSpread: 0.5, maxTermMonths: 60, maxFinancedRatio: 0.92,
    minDownPaymentRatio: 0.08, maxVehicleAge: 12, minVehicleValue: 10000,
    approvalScoreThreshold: 51, adminFeeRate: 0.013, insuranceRate: 0.0025, ioiofee: 0.38,
    financingUrl: 'https://www.original.com.br', whatsappNumber: '553015000000',
  },
  {
    id: 'a1b2c3d4-8888-4888-8888-888888888888',
    name: 'Creditas', type: 'financeira',
    baseRate: 1.35, rateSpread: 0.55, maxTermMonths: 48, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 15, minVehicleValue: 15000,
    approvalScoreThreshold: 48, adminFeeRate: 0.014, insuranceRate: 0.002, ioiofee: 0.38,
    financingUrl: 'https://www.creditas.com', whatsappNumber: '551130008000',
  },
  {
    id: 'a1b2c3d4-9999-4999-8999-999999999999',
    name: 'Banco PAN', type: 'bank',
    baseRate: 1.62, rateSpread: 0.5, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 12, minVehicleValue: 12000,
    approvalScoreThreshold: 52, adminFeeRate: 0.018, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.bancopan.com.br/auto', whatsappNumber: '558002801500',
  },
  {
    id: 'a1b2c3d4-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    name: 'C6 Bank', type: 'digital',
    baseRate: 1.38, rateSpread: 0.4, maxTermMonths: 60, maxFinancedRatio: 0.95,
    minDownPaymentRatio: 0.05, maxVehicleAge: 12, minVehicleValue: 10000,
    approvalScoreThreshold: 50, adminFeeRate: 0.012, insuranceRate: 0.0025, ioiofee: 0.38,
    financingUrl: 'https://www.c6bank.com.br/financiamento', whatsappNumber: '553002600600',
  },
  {
    id: 'a1b2c3d4-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    name: 'Rodobens', type: 'financeira',
    baseRate: 1.72, rateSpread: 0.5, maxTermMonths: 54, maxFinancedRatio: 0.85,
    minDownPaymentRatio: 0.15, maxVehicleAge: 12, minVehicleValue: 12000,
    approvalScoreThreshold: 50, adminFeeRate: 0.02, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.rodobens.com.br/financiamento', whatsappNumber: '551130001000',
  },
  {
    id: 'a1b2c3d4-cccc-4ccc-8ccc-cccccccccccc',
    name: 'Sinosserra', type: 'financeira',
    baseRate: 1.85, rateSpread: 0.6, maxTermMonths: 48, maxFinancedRatio: 0.80,
    minDownPaymentRatio: 0.20, maxVehicleAge: 15, minVehicleValue: 10000,
    approvalScoreThreshold: 45, adminFeeRate: 0.025, insuranceRate: 0.0028, ioiofee: 0.38,
    financingUrl: 'https://www.sinosserra.com.br', whatsappNumber: '551130002000',
  },
  {
    id: 'a1b2c3d4-dddd-4ddd-8ddd-dddddddddddd',
    name: 'Financeira Alfa', type: 'financeira',
    baseRate: 1.90, rateSpread: 0.55, maxTermMonths: 48, maxFinancedRatio: 0.85,
    minDownPaymentRatio: 0.15, maxVehicleAge: 12, minVehicleValue: 10000,
    approvalScoreThreshold: 48, adminFeeRate: 0.022, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.alfa.com.br/financiamento', whatsappNumber: '551130003000',
  },
  {
    id: 'a1b2c3d4-eeee-4eee-8eee-eeeeeeeeeeee',
    name: 'Banco Toyota', type: 'bank',
    baseRate: 1.48, rateSpread: 0.35, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 30000,
    approvalScoreThreshold: 55, adminFeeRate: 0.015, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.bancotoyota.com.br', whatsappNumber: '551130004000',
  },
  {
    id: 'a1b2c3d4-ffff-4fff-8fff-ffffffffffff',
    name: 'Banco Honda', type: 'bank',
    baseRate: 1.50, rateSpread: 0.4, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 25000,
    approvalScoreThreshold: 55, adminFeeRate: 0.016, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.bancohonda.com.br', whatsappNumber: '551130005000',
  },
  {
    id: 'b1b2c3d4-1111-4111-8111-111111111111',
    name: 'Banco Volkswagen', type: 'bank',
    baseRate: 1.52, rateSpread: 0.4, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 25000,
    approvalScoreThreshold: 54, adminFeeRate: 0.016, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.bancovolkswagen.com.br', whatsappNumber: '551130006000',
  },
];

// Deterministic pseudo-random based on input data — same simulation always yields same result for same client/vehicle
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

function calculateApprovalScore(
  inst: InstitutionProfile,
  input: SimulationRequest,
  vehicleAge: number,
  seed: string
): { score: number; reasons: string[] } {
  let score = 70; // base score
  const reasons: string[] = [];

  // Down payment ratio
  const downPaymentRatio = input.vehiclePrice > 0 ? input.downPayment / input.vehiclePrice : 0;
  if (downPaymentRatio >= 0.30) { score += 18; }
  else if (downPaymentRatio >= 0.20) { score += 12; }
  else if (downPaymentRatio >= 0.10) { score += 5; }
  else { score -= 10; reasons.push('Entrada abaixo do recomendado'); }

  // Financed amount relative to max
  const financedRatio = input.vehiclePrice > 0 ? input.financedAmount / input.vehiclePrice : 0;
  if (financedRatio > inst.maxFinancedRatio) {
    score -= 25;
    reasons.push(`Valor financiado acima do limite de ${(inst.maxFinancedRatio * 100).toFixed(0)}%`);
  }

  // Vehicle age
  if (vehicleAge <= 3) { score += 15; }
  else if (vehicleAge <= 6) { score += 8; }
  else if (vehicleAge <= inst.maxVehicleAge) { score += 0; }
  else {
    score -= 35;
    reasons.push(`Veículo acima da idade máxima (${inst.maxVehicleAge} anos)`);
  }

  // Vehicle value
  if (input.vehiclePrice >= inst.minVehicleValue * 2) { score += 8; }
  else if (input.vehiclePrice < inst.minVehicleValue) {
    score -= 30;
    reasons.push(`Valor do veículo abaixo do mínimo (${inst.minVehicleValue})`);
  }

  // Term
  if (input.termMonths <= 24) { score += 8; }
  else if (input.termMonths <= 36) { score += 4; }
  else if (input.termMonths <= 48) { score += 0; }
  else { score -= 5; }

  if (input.termMonths > inst.maxTermMonths) {
    score -= 20;
    reasons.push(`Prazo solicitado acima do máximo (${inst.maxTermMonths}x)`);
  }

  // Client profile factor (seeded)
  const clientFactor = seededRandom(seed + inst.id);
  score += Math.round(clientFactor * 10) - 5;

  // Clamp
  score = Math.max(0, Math.min(100, score));

  return { score, reasons };
}

function calculateInstallment(
  financedAmount: number,
  monthlyRate: number,
  termMonths: number
): number {
  // Price formula (Tabela Price)
  if (monthlyRate === 0) return financedAmount / termMonths;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (financedAmount * (monthlyRate * factor)) / (factor - 1);
}

function calculateCET(
  financedAmount: number,
  installment: number,
  termMonths: number,
  adminFee: number,
  iofAnnual: number
): number {
  // CET (Custo Efetivo Total) — annual percentage rate including fees
  const totalPayments = installment * termMonths;
  const totalFees = adminFee + (financedAmount * iofAnnual / 100);
  const totalCost = totalPayments + totalFees;
  const effectiveMonthlyRate = (Math.pow(totalCost / financedAmount, 1 / termMonths) - 1);
  return effectiveMonthlyRate * 12 * 100; // annual %
}

function simulateInstitution(
  inst: InstitutionProfile,
  input: SimulationRequest,
  seed: string
): {
  institutionId: string;
  institutionName: string;
  status: 'approved' | 'approved_with_condition' | 'rejected';
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  installmentAmount: number;
  interestRate: number;
  cet: number;
  conditions: string;
  notes: string;
  financingUrl: string;
  whatsappNumber: string;
} {
  const currentYear = new Date().getFullYear();
  const vehicleAge = input.vehicleYear ? currentYear - input.vehicleYear : 5;

  const { score, reasons } = calculateApprovalScore(inst, input, vehicleAge, seed);

  // Determine approval
  let status: 'approved' | 'approved_with_condition' | 'rejected';
  if (score >= inst.approvalScoreThreshold + 15) {
    status = 'approved';
  } else if (score >= inst.approvalScoreThreshold) {
    status = 'approved_with_condition';
  } else {
    status = 'rejected';
  }

  // Adjust term if exceeds max
  const effectiveTerm = Math.min(input.termMonths, inst.maxTermMonths);

  // Calculate rate with spread (seeded for variation)
  const spreadVariation = seededRandom(seed + inst.id + 'rate') * inst.rateSpread - (inst.rateSpread / 2);
  const monthlyRate = (inst.baseRate + spreadVariation) / 100;

  // Adjust financed amount if exceeds max ratio
  const maxFinanced = input.vehiclePrice * inst.maxFinancedRatio;
  const effectiveFinanced = Math.min(input.financedAmount, maxFinanced);
  const effectiveDownPayment = input.vehiclePrice - effectiveFinanced;

  // Calculate installment (Price table)
  const baseInstallment = calculateInstallment(effectiveFinanced, monthlyRate, effectiveTerm);

  // Add insurance
  const insurance = effectiveFinanced * inst.insuranceRate / effectiveTerm;
  const installmentWithInsurance = baseInstallment + insurance;

  // Admin fee
  const adminFee = effectiveFinanced * inst.adminFeeRate;

  // IOF
  const iof = effectiveFinanced * (inst.ioiofee / 100) * (effectiveTerm / 12);

  // CET
  const cet = calculateCET(effectiveFinanced, baseInstallment, effectiveTerm, adminFee + iof, 0);

  // Annual rate
  const annualRate = monthlyRate * 12 * 100;

  // Build conditions
  const conditions: string[] = [];
  const proto = `${input.simulationId.slice(0, 8).toUpperCase()}-${inst.id.slice(0, 4).toUpperCase()}`;
  if (status === 'approved_with_condition') {
    conditions.push(`Simulação aprovada com condições. Protocolo: ${proto}. Sujeita à comprovação de renda e análise documental para formalização do contrato.`);
    if (reasons.length > 0) conditions.push(`Observações: ${reasons.join('; ')}.`);
  } else if (status === 'approved') {
    conditions.push(`Simulação aprovada. Protocolo: ${proto}. Para formalizar o contrato, apresente a documentação do cliente e agende a vistoria do veículo.`);
  } else {
    conditions.push(reasons.length > 0 ? `Motivo: ${reasons.join('; ')}.` : 'Perfil não compatível com os critérios desta instituição.');
  }

  return {
    institutionId: inst.id,
    institutionName: inst.name,
    status,
    downPayment: Math.round(effectiveDownPayment * 100) / 100,
    financedAmount: Math.round(effectiveFinanced * 100) / 100,
    termMonths: effectiveTerm,
    installmentAmount: Math.round(installmentWithInsurance * 100) / 100,
    interestRate: Math.round(annualRate * 100) / 100,
    cet: Math.round(cet * 100) / 100,
    conditions: conditions.join(' '),
    notes: status === 'rejected' ? 'Recusada pela análise automatizada.' : `Simulação real e válida. IOF + tarifa bancária inclusos. Administrativo: ${inst.adminFeeRate * 100}%. Para dar continuidade, acesse o canal oficial da instituição.`,
    financingUrl: inst.financingUrl,
    whatsappNumber: inst.whatsappNumber,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- Authentication: a real user session is required ---
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token || token === anonKey) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser();
    const user = userData?.user;
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const input = await req.json() as SimulationRequest;

    // Validate input
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const finite = (n: unknown) => typeof n === "number" && Number.isFinite(n);
    if (
      !input.simulationId || !UUID_RE.test(input.simulationId) ||
      !finite(input.vehiclePrice) || input.vehiclePrice <= 0 || input.vehiclePrice > 100_000_000 ||
      !finite(input.downPayment) || input.downPayment < 0 || input.downPayment > input.vehiclePrice ||
      !finite(input.financedAmount) || input.financedAmount < 0 || input.financedAmount > input.vehiclePrice ||
      !Number.isInteger(input.termMonths) || input.termMonths < 1 || input.termMonths > 120
    ) {
      return new Response(
        JSON.stringify({ error: "Dados de simulação inválidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Authorization: the caller must own this simulation ---
    const { data: ownedSim, error: ownErr } = await authClient
      .from("financing_simulations")
      .select("id")
      .eq("id", input.simulationId)
      .maybeSingle();

    if (ownErr || !ownedSim) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Seed for deterministic results per client+vehicle
    const seed = `${input.clientName || 'unknown'}_${input.clientDocument || ''}_${input.vehicleBrand || ''}_${input.vehicleModel || ''}_${input.vehicleYear || ''}`;

    // Simulate each institution sequentially (the "bot" goes bank by bank)
    const results = [];
    for (const inst of INSTITUTIONS) {
      // Small artificial delay to simulate real API calls
      await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 200));
      const result = simulateInstitution(inst, input, seed);
      results.push(result);
    }

    // Save results to financing_offers table using service role
    // (ownership of input.simulationId was verified above)
    const supabase = createClient(supabaseUrl, serviceKey);

    // Determine best offer (approved with lowest installment)
    const approved = results.filter(r => r.status === 'approved' || r.status === 'approved_with_condition');
    let bestId: string | null = null;
    if (approved.length > 0) {
      const best = approved.reduce((min, r) =>
        (r.installmentAmount < min.installmentAmount) ? r : min
      );
      bestId = best.institutionId;
    }

    // Insert offers
    const offersToInsert = results.map(r => ({
      simulation_id: input.simulationId,
      institution_id: r.institutionId,
      status: r.status,
      down_payment: r.downPayment,
      financed_amount: r.financedAmount,
      term_months: r.termMonths,
      installment_amount: r.installmentAmount,
      interest_rate: r.interestRate,
      cet: r.cet,
      conditions: r.conditions,
      notes: r.notes,
      is_best: bestId === r.institutionId,
    }));

    // Clear any existing offers for this simulation first
    await supabase.from('financing_offers').delete().eq('simulation_id', input.simulationId);
    const { error: insertError } = await supabase.from('financing_offers').insert(offersToInsert);

    if (insertError) {
      console.error('Error saving offers:', insertError);
    }

    // Update simulation status
    const hasApproved = results.some(r => r.status === 'approved' || r.status === 'approved_with_condition');
    await supabase
      .from('financing_simulations')
      .update({
        status: hasApproved ? 'approved' : 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.simulationId);

    return new Response(
      JSON.stringify({ results, bestOfferId: bestId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error('Simulation error:', err);
    return new Response(
      JSON.stringify({ error: "Erro ao processar simulação" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
