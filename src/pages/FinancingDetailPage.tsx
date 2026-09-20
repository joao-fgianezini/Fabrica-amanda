import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Car, User, Calculator, Building2, TrendingUp,
  AlertCircle, ShieldCheck, Clock, CheckCircle2, XCircle,
  ExternalLink, MessageCircle, FileDown, Info, Loader2,
} from 'lucide-react';
import { generateProposal } from '@/lib/proposal';
import { useAuth } from '@/context/AuthContext';
import { supabase, type FinancingSimulationWithDetails, type CredereConditionRow } from '@/lib/supabase';
import { formatCurrency, formatDate, statusLabel, statusColor, maskCPF } from '@/lib/format';
import {
  centsToMoney, translatePreApprovalStatus, parseExpenses,
  selectCondition, loadCredereConditions,
} from '@/lib/credere';

export function FinancingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dealer } = useAuth();
  const [simulation, setSimulation] = useState<FinancingSimulationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [credereConditions, setCredereConditions] = useState<CredereConditionRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { data, error } = await supabase
        .from('financing_simulations')
        .select(`*, vehicle:vehicles(id, brand, model, year_model, year_manufacture, asking_price), client:clients(id, name, phone, document), offers:financing_offers(*, institution:financing_institutions(*)), credere_conditions:credere_conditions(*)`)
        .eq('id', id)
        .maybeSingle();
      if (error || !data) { setLoading(false); return; }
      setSimulation(data as unknown as FinancingSimulationWithDetails);
      const conditions = (data as unknown as { credere_conditions?: CredereConditionRow[] }).credere_conditions || [];
      setCredereConditions(conditions);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleRefresh() {
    if (!simulation) return;
    setRefreshing(true);
    const credereSim = await supabase
      .from('credere_simulations')
      .select('id, status')
      .eq('financing_simulation_id', simulation.id)
      .maybeSingle();
    if (credereSim.data) {
      const conditions = await loadCredereConditions(credereSim.data.id);
      setCredereConditions(conditions);
    }
    setRefreshing(false);
  }

  async function handleSelectCondition(conditionId: string) {
    await selectCondition(conditionId);
    setCredereConditions(prev => prev.map(c => ({ ...c, is_selected: c.id === conditionId })));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <AlertCircle size={40} className="text-navy-500 mx-auto mb-3" />
        <p className="text-navy-300 mb-4">Simulação não encontrada</p>
        <Link to="/financiamento" className="text-accent-400 hover:text-accent-300 font-medium text-sm">Voltar para financiamentos</Link>
      </div>
    );
  }

  const offers = simulation.offers || [];
  const bestOffer = offers.find((o) => o.is_best);
  const approvedOffers = offers.filter((o) => o.status === 'approved' || o.status === 'approved_with_condition');
  const selectedCredereCondition = credereConditions.find(c => c.is_selected);
  const hasCredereConditions = credereConditions.length > 0;

  async function convertToSale() {
    if (!simulation?.vehicle || !simulation?.client) return;
    const salePrice = Number(simulation.vehicle_price);
    const { data: veh } = await supabase.from('vehicles').select('purchase_price').eq('id', simulation.vehicle.id).maybeSingle();
    const purchase = veh ? Number((veh as { purchase_price: number }).purchase_price) : 0;
    const bankLabel = selectedCredereCondition?.bank_name || selectedCredereCondition?.bank_nickname || bestOffer?.institution?.name || 'Financiamento';
    await supabase.from('sales').insert({
      vehicle_id: simulation.vehicle.id,
      client_name: simulation.client.name,
      client_phone: simulation.client.phone,
      sale_price: salePrice,
      purchase_price: purchase,
      profit: salePrice - purchase,
      payment_method: 'Financiamento',
      sale_date: new Date().toISOString().split('T')[0],
      notes: `Financiado por ${bankLabel}`,
      dealer_id: simulation.dealer_id,
    });
    await supabase.from('vehicles').update({ status: 'sold' }).eq('id', simulation.vehicle.id);
    await supabase.from('financing_simulations').update({ status: 'converted' }).eq('id', simulation.id);
    navigate('/vendas');
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/financiamento" className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors group animate-fade-in">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Status */}
          <div className="glass-card rounded-2xl p-5 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={18} className="text-accent-400" />
              <h2 className="text-base font-bold text-white">Simulação</h2>
            </div>
            <span className={`inline-block text-xs px-3 py-1 rounded-full border font-medium ${statusColor(simulation.status)}`}>
              {statusLabel(simulation.status)}
            </span>
            <p className="text-xs text-navy-400 mt-3">Criada em {formatDate(simulation.created_at)}</p>
            {simulation.provider === 'credere' && (
              <p className="text-xs text-accent-400 mt-1 font-medium">Credere · Financiamento Real</p>
            )}
          </div>

          {/* Vehicle */}
          {simulation.vehicle && (
            <Link to={`/veiculo/${simulation.vehicle.id}`} className="block glass-card rounded-2xl p-5 hover-lift-sm card-glow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-3">
                <Car size={18} className="text-accent-400" />
                <h3 className="text-sm font-bold text-white">Veículo</h3>
              </div>
              <p className="text-white font-bold text-sm">{simulation.vehicle.brand} {simulation.vehicle.model}</p>
              <p className="text-xs text-navy-400 mt-0.5">{simulation.vehicle.year_model || simulation.vehicle.year_manufacture} · {formatCurrency(simulation.vehicle.asking_price)}</p>
            </Link>
          )}

          {/* Client */}
          {simulation.client && (
            <Link to={`/clientes`} className="block glass-card rounded-2xl p-5 hover-lift-sm card-glow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-accent-400" />
                <h3 className="text-sm font-bold text-white">Cliente</h3>
              </div>
              <p className="text-white font-bold text-sm">{simulation.client.name}</p>
              <p className="text-xs text-navy-400 mt-0.5">{maskCPF(simulation.client.document)}</p>
              {simulation.client.phone && <p className="text-xs text-navy-400 mt-0.5">{simulation.client.phone}</p>}
            </Link>
          )}

          {/* Conditions */}
          <div className="glass-card rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-sm font-bold text-white mb-4">Condições</h3>
            <div className="space-y-2.5">
              <Row label="Valor do veículo" value={formatCurrency(simulation.vehicle_price)} />
              <Row label="Entrada" value={formatCurrency(simulation.down_payment)} />
              <Row label="Valor financiado" value={formatCurrency(simulation.financed_amount)} highlight />
              <Row label="Prazo" value={`${simulation.term_months}x`} />
              {simulation.licensing_uf && <Row label="UF licenciamento" value={simulation.licensing_uf} />}
              {simulation.licensing_city && <Row label="Cidade" value={simulation.licensing_city} />}
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Refresh button for Credere simulations */}
          {simulation.provider === 'credere' && (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
                Condições Credere ({credereConditions.length})
              </h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 text-xs text-accent-400 hover:text-accent-300 font-medium px-3 py-1.5 rounded-lg bg-accent-500/10 hover:bg-accent-500/20 transition-all"
              >
                {refreshing ? <Loader2 size={14} className="animate-spin" /> : <Info size={14} />}
                Atualizar
              </button>
            </div>
          )}

          {/* Credere conditions */}
          {hasCredereConditions && (
            <div className="space-y-3">
              {credereConditions.map((cond, i) => {
                const expenses = parseExpenses(cond.expenses);
                const preApproval = translatePreApprovalStatus(cond.pre_approval_status);
                const hasReason = !!cond.reason;
                return (
                  <div
                    key={cond.id}
                    className={`group glass rounded-2xl border p-5 hover-lift card-glow animate-fade-in-up ${cond.is_selected ? 'border-success-500/40' : 'border-navy-600/20'}`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Bank header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-accent-500/15 blur-md rounded-lg" />
                          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center">
                            <Building2 size={20} className="text-accent-300" />
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-bold">{cond.bank_nickname || cond.bank_name || 'Banco'}</p>
                          {cond.bank_name && cond.bank_nickname && cond.bank_name !== cond.bank_nickname && (
                            <p className="text-xs text-navy-400">{cond.bank_name}</p>
                          )}
                          {cond.bank_febraban_code && <p className="text-xs text-navy-500">Febraban: {cond.bank_febraban_code}</p>}
                        </div>
                      </div>
                      {cond.is_selected && <span className="text-xs px-2 py-1 rounded-full bg-success-500/15 text-success-400 border border-success-500/30 font-bold">SELECIONADA</span>}
                    </div>

                    {/* Reason / error */}
                    {hasReason && (
                      <div className="p-3 bg-error-500/10 rounded-xl border border-error-500/20 mb-4">
                        <p className="text-xs text-error-300">Não foi possível obter condição.</p>
                        <p className="text-xs text-navy-400 mt-0.5">Motivo: {cond.reason}</p>
                      </div>
                    )}

                    {/* Financial fields */}
                    {!hasReason && (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                          {cond.installments !== null && <Field label="Parcelas" value={`${cond.installments}x`} />}
                          {cond.down_payment_cents !== null && <Field label="Entrada" value={formatCurrency(centsToMoney(cond.down_payment_cents))} />}
                          {cond.financed_amount_cents !== null && <Field label="Financiado" value={formatCurrency(centsToMoney(cond.financed_amount_cents))} />}
                          {cond.amount_paid_in_financing_cents !== null && <Field label="Valor total" value={formatCurrency(centsToMoney(cond.amount_paid_in_financing_cents))} highlight />}
                          {cond.bank_down_payment_suggestion_cents !== null && <Field label="Entrada sugerida" value={formatCurrency(centsToMoney(cond.bank_down_payment_suggestion_cents))} />}
                          {preApproval && <Field label="Pré-aprovação" value={preApproval} />}
                        </div>

                        {/* Expenses */}
                        {expenses.length > 0 && (
                          <div className="p-3 bg-navy-800/40 rounded-xl border border-navy-600/20 mb-4">
                            <p className="text-xs font-bold text-navy-200 mb-2 uppercase tracking-wide">Detalhamento da operação</p>
                            <div className="space-y-1.5">
                              {expenses.map((exp, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span className="text-xs text-navy-300">{exp.label}</span>
                                  <span className="text-xs text-white font-medium">{formatCurrency(centsToMoney(exp.valueCents))}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Select button */}
                        {!cond.is_selected && (
                          <button
                            onClick={() => handleSelectCondition(cond.id)}
                            className="btn-shine w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-accent-500/20 text-sm group"
                          >
                            <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" />
                            Escolher esta condição
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* No Credere conditions */}
          {!hasCredereConditions && simulation.provider === 'credere' && (
            <div className="glass rounded-2xl border border-dashed border-navy-600/40 p-8 text-center">
              <Clock size={32} className="text-navy-500 mx-auto mb-2" />
              <p className="text-navy-200 font-medium text-sm">
                {simulation.status === 'processing' ? 'Aguardando resultados da Credere...' : 'Nenhuma condição retornada pela Credere'}
              </p>
              <p className="text-xs text-navy-400 mt-1">
                {simulation.status === 'processing' ? 'Os resultados aparecerão automaticamente' : 'Nenhuma condição de financiamento disponível para esta simulação.'}
              </p>
            </div>
          )}

          {/* Legacy offers (for old simulations) */}
          {!hasCredereConditions && offers.length > 0 && (
            <>
              {bestOffer && (
                <div className="relative glass rounded-2xl border border-gold-500/30 p-5 overflow-hidden animate-bounce-in">
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-transparent" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gold-400/30 blur-xl rounded-xl" />
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center"><span className="text-xl">🏆</span></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Melhor opção</p>
                      <p className="text-lg font-extrabold text-white">{bestOffer.institution?.name || 'Instituição'}</p>
                    </div>
                    {bestOffer.installment_amount && (
                      <div className="text-right">
                        <p className="text-xs text-navy-400">Parcela</p>
                        <p className="text-xl font-extrabold text-success-400">{formatCurrency(bestOffer.installment_amount)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-accent-400" />
                Ofertas ({offers.length})
              </h2>

              <div className="space-y-3">
                {offers.map((offer, i) => {
                  const statusCfg: Record<string, { label: string; color: string; dot: string; icon: typeof CheckCircle2 }> = {
                    approved: { label: 'APROVADO', color: 'text-success-400', dot: 'bg-success-400', icon: CheckCircle2 },
                    approved_with_condition: { label: 'APROVADO COM CONDIÇÃO', color: 'text-warning-400', dot: 'bg-warning-400', icon: CheckCircle2 },
                    rejected: { label: 'NÃO APROVADO', color: 'text-error-400', dot: 'bg-error-400', icon: XCircle },
                    pending: { label: 'INTEGRAÇÃO NÃO DISPONÍVEL', color: 'text-navy-400', dot: 'bg-navy-500', icon: Clock },
                  };
                  const cfg = statusCfg[offer.status] || statusCfg.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={offer.id} className={`group glass-card rounded-2xl p-5 hover-lift-sm card-glow animate-fade-in-up ${offer.is_best ? 'border-gold-500/30' : ''}`} style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center"><Building2 size={18} className="text-accent-300" /></div>
                          <div>
                            <p className="text-white font-bold text-sm">{offer.institution?.name || 'Instituição'}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                              <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                            </div>
                          </div>
                        </div>
                        {offer.is_best && <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-400 border border-gold-500/30 font-bold">🏆</span>}
                      </div>
                      {offer.status === 'pending' ? (
                        <p className="text-xs text-navy-400">{offer.conditions || 'Integração não disponível'}</p>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {offer.down_payment !== null && <Field label="Entrada" value={formatCurrency(offer.down_payment)} />}
                            {offer.financed_amount !== null && <Field label="Financiado" value={formatCurrency(offer.financed_amount)} />}
                            {offer.term_months !== null && <Field label="Prazo" value={`${offer.term_months}x`} />}
                            {offer.installment_amount !== null && <Field label="Parcela" value={formatCurrency(offer.installment_amount)} highlight />}
                          </div>
                          {(offer.status === 'approved' || offer.status === 'approved_with_condition') && (
                            <button
                              onClick={() => {
                                generateProposal({
                                  clientName: simulation.client?.name || '',
                                  clientDocument: simulation.client?.document || null,
                                  clientPhone: simulation.client?.phone || null,
                                  vehicleLabel: `${simulation.vehicle?.brand || ''} ${simulation.vehicle?.model || ''}`,
                                  vehicleYear: simulation.vehicle?.year_model || simulation.vehicle?.year_manufacture || null,
                                  vehiclePrice: Number(simulation.vehicle_price) || 0,
                                  downPayment: Number(offer.down_payment) || 0,
                                  financedAmount: Number(offer.financed_amount) || 0,
                                  termMonths: offer.term_months || 0,
                                  dealerName: dealer?.name,
                                  dealerLogoUrl: dealer?.logo_url,
                                  protocolNumber: simulation.id.slice(0, 8).toUpperCase(),
                                  result: {
                                    institutionId: offer.institution_id,
                                    institutionName: offer.institution?.name || '',
                                    status: offer.status as 'approved' | 'approved_with_condition',
                                    downPayment: Number(offer.down_payment),
                                    financedAmount: Number(offer.financed_amount),
                                    termMonths: offer.term_months,
                                    installmentAmount: Number(offer.installment_amount),
                                    interestRate: Number(offer.interest_rate),
                                    cet: Number(offer.cet),
                                    conditions: offer.conditions,
                                    notes: offer.notes,
                                    financingUrl: offer.institution?.financing_url || null,
                                    whatsappNumber: offer.institution?.whatsapp_number || null,
                                  },
                                });
                              }}
                              className="btn-shine w-full flex items-center justify-center gap-2 glass border border-navy-600/30 hover:border-accent-500/30 text-white font-semibold py-2.5 rounded-xl transition-all text-sm group mt-2"
                            >
                              <FileDown size={14} className="group-hover:scale-110 transition-transform" />
                              Gerar proposta
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Disclaimer */}
          <div className="glass-card rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck size={18} className="text-navy-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-navy-300 leading-relaxed">
              As condições apresentadas são retornadas pela API oficial da Credere, com base nas integrações bancárias ativas da loja. A aprovação final é de responsabilidade da instituição financeira.
            </p>
          </div>

          {/* Convert to sale */}
          {simulation.status !== 'converted' && (approvedOffers.length > 0 || selectedCredereCondition) && (
            <button
              onClick={convertToSale}
              className="btn-shine w-full flex items-center justify-center gap-2 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-400 hover:to-success-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-success-500/20 text-sm group"
            >
              <TrendingUp size={18} className="group-hover:scale-110 transition-transform" />
              Continuar para venda
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-navy-300">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-accent-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-navy-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-success-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}
