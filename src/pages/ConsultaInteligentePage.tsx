import { useState, useEffect, useCallback } from 'react';
import {
  Search, Car, TrendingUp, TrendingDown, Minus, Loader2, AlertCircle,
  CheckCircle2, XCircle, Clock, Info, History,
  ShieldCheck, AlertTriangle, BarChart3, FileText, Sparkles, RefreshCw,
  ArrowUp, ArrowDown, ArrowRight, CircleDot, Zap, ExternalLink, Landmark,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/format';
import {
  normalizePlate, isValidPlate, formatPlate,
  performVehicleQuery, computePriceComparison, loadQueryHistory,
  type QueryResult, type AnalysisResult, type PriceComparison,
  type QueryHistoryItem,
} from '@/lib/consulta';

type ViewState = 'idle' | 'loading' | 'result' | 'error';

const loadingSteps = [
  'Validando placa',
  'Identificando veículo',
  'Consultando valor FIPE',
  'Analisando mercado',
  'Consultando informações disponíveis',
  'Gerando análise REDE AUTO',
];

export function ConsultaInteligentePage() {
  const { dealer } = useAuth();
  const [plate, setPlate] = useState('');
  const [view, setView] = useState<ViewState>('idle');
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);

  // Normalize plate input
  function handlePlateChange(value: string) {
    const normalized = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setPlate(normalized);
  }

  // Simulate loading steps progression
  const startLoadingAnimation = useCallback(() => {
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return interval;
  }, []);

  async function handleQuery() {
    if (!isValidPlate(plate)) {
      setError('Digite uma placa válida para continuar.');
      setView('error');
      return;
    }

    setView('loading');
    setError('');
    const interval = startLoadingAnimation();

    try {
      const { result: res, analysis: ana } = await performVehicleQuery(plate);
      setResult(res);
      setAnalysis(ana);
      setView('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar consulta.');
      setView('error');
    } finally {
      clearInterval(interval);
    }
  }

  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      await handleQuery();
    }
  }

  async function loadHistory() {
    if (!dealer) return;
    const items = await loadQueryHistory(dealer.id);
    setHistory(items);
  }

  useEffect(() => {
    if (showHistory && dealer) {
      loadHistory();
    }
  }, [showHistory, dealer]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in-down">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-500/20 blur-lg rounded-xl" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20">
              <Sparkles size={20} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Consulta Inteligente</h1>
            <p className="text-sm text-navy-300">Consulte informações do veículo e analise seu potencial de mercado.</p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <label className="block text-xs font-bold text-navy-200 mb-2 uppercase tracking-wider">
          Digite a placa do veículo
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 input-anim">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              value={plate}
              onChange={(e) => handlePlateChange(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={8}
              placeholder="ABC1D23 ou ABC1234"
              className="w-full glass border border-navy-600/30 rounded-xl pl-12 pr-4 py-4 text-lg font-mono text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all uppercase tracking-wider"
            />
          </div>
          <button
            onClick={handleQuery}
            disabled={!plate || view === 'loading'}
            className="btn-shine flex items-center justify-center gap-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-lg shadow-accent-500/25 text-sm group disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {view === 'loading' ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Search size={20} className="group-hover:scale-110 transition-transform" />
            )}
            CONSULTAR VEÍCULO
          </button>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <p className="text-xs text-navy-400">
            Aceita placas antigas (ABC1234) e Mercosul (ABC1D23)
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-xs text-navy-300 hover:text-accent-300 transition-colors"
            >
              <History size={14} /> Histórico
            </button>
          </div>
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <HistoryPanel items={history} onRetry={(p) => { setPlate(p); setShowHistory(false); setView('idle'); }} />
      )}

      {/* Loading state */}
      {view === 'loading' && (
        <LoadingState currentStep={loadingStep} steps={loadingSteps} />
      )}

      {/* Error state */}
      {view === 'error' && (
        <div className="glass-card rounded-2xl p-8 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-error-500/15 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-error-400" />
          </div>
          <p className="text-white font-semibold">{error}</p>
          <button
            onClick={() => setView('idle')}
            className="mt-4 text-sm text-accent-300 hover:text-accent-200 transition-colors"
          >
            Voltar
          </button>
        </div>
      )}

      {/* Result */}
      {view === 'result' && result && analysis && (
        <QueryResultView
          result={result}
          analysis={analysis}
          onNewQuery={() => { setView('idle'); setPlate(''); setResult(null); setAnalysis(null); }}
        />
      )}
    </div>
  );
}

// ===================== Loading State =====================

function LoadingState({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div className="glass-card rounded-2xl p-8 animate-fade-in">
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-accent-500/30 blur-3xl rounded-full animate-pulse" />
          <div className="relative w-16 h-16 border-3 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Car size={24} className="text-accent-400 animate-pulse" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-white">Consultando veículo...</h3>
      </div>
      <div className="space-y-3 max-w-md mx-auto">
        {steps.map((step, i) => {
          const isDone = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all ${isDone || isCurrent ? 'opacity-100' : 'opacity-40'}`}
              style={{ animation: `fadeIn 0.3s ease-out ${i * 100}ms both` }}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 size={18} className="text-success-400" />
                ) : isCurrent ? (
                  <Loader2 size={18} className="text-accent-400 animate-spin" />
                ) : (
                  <CircleDot size={18} className="text-navy-600" />
                )}
              </div>
              <span className={`text-sm ${isDone ? 'text-navy-300' : isCurrent ? 'text-white font-medium' : 'text-navy-500'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== Query Result View =====================

function QueryResultView({
  result, analysis, onNewQuery,
}: {
  result: QueryResult;
  analysis: AnalysisResult;
  onNewQuery: () => void;
}) {
  const comparison = computePriceComparison(result.fipe.data, result.market.data);
  const consultedDate = new Date(result.consulted_at);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Plate banner */}
      <div className="glass rounded-2xl border border-accent-500/30 p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-500/20 blur-md rounded-lg" />
            <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center">
              <Car size={22} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-xs text-navy-400 uppercase tracking-wider">Placa consultada</p>
            <p className="text-xl font-mono font-bold text-white tracking-wider">{formatPlate(result.plate)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-navy-400">Consultado em</p>
          <p className="text-sm text-white font-medium">
            {consultedDate.toLocaleDateString('pt-BR')} às {consultedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* DADOS DO VEÍCULO */}
      <SectionCard title="Dados do Veículo" icon={Car}>
        {result.vehicle.status === 'available' && result.vehicle.data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DataField label="Marca" value={result.vehicle.data.marca} />
            <DataField label="Modelo" value={result.vehicle.data.modelo} />
            <DataField label="Versão" value={result.vehicle.data.versao} />
            <DataField label="Ano Fabricação" value={result.vehicle.data.ano_fabricacao?.toString()} />
            <DataField label="Ano Modelo" value={result.vehicle.data.ano_modelo?.toString()} />
            <DataField label="Combustível" value={result.vehicle.data.combustivel} />
            <DataField label="Cor" value={result.vehicle.data.cor} />
            <DataField label="Categoria" value={result.vehicle.data.categoria} />
            <DataField label="UF" value={result.vehicle.data.uf} />
            <DataField label="Município" value={result.vehicle.data.municipio} />
            <DataField label="Chassi" value={result.vehicle.data.chassis} />
            <DataField label="RENAVAM" value={result.vehicle.data.renavam} />
            <DataField label="Situação" value={result.vehicle.data.situacao} />
          </div>
        ) : (
          <NotAvailable
            message={result.vehicle.message}
            source={result.vehicle.status === 'not_found' ? 'BrasilAPI' : undefined}
          />
        )}
        {result.vehicle.status === 'available' && (
          <p className="text-xs text-navy-400 mt-4 flex items-center gap-1.5">
            <Info size={12} /> {result.vehicle.message}
          </p>
        )}
      </SectionCard>

      {/* FIPE */}
      <SectionCard title="Valor FIPE" icon={TrendingUp}>
        {result.fipe.status === 'available' && result.fipe.data ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-navy-400 uppercase tracking-wider mb-1">Valor FIPE</p>
                <p className="text-3xl font-extrabold text-accent-400">{formatCurrency(result.fipe.data.valor)}</p>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <MetaItem label="Referência" value={result.fipe.data.referencia} />
                <MetaItem label="Código FIPE" value={result.fipe.data.codigo_fipe} />
                <MetaItem label="Ano Modelo" value={result.fipe.data.ano_modelo} />
                <MetaItem label="Combustível" value={result.fipe.data.combustivel} />
              </div>
            </div>
            <p className="text-xs text-navy-400 flex items-center gap-1.5">
              <Info size={12} /> Fonte: BrasilAPI FIPE · Consultado em {new Date(result.fipe.data.consulted_at).toLocaleString('pt-BR')}
            </p>
          </div>
        ) : (
          <NotAvailable
            message={result.fipe.message}
            source="BrasilAPI FIPE"
          />
        )}
      </SectionCard>

      {/* MERCADO */}
      <SectionCard title="Análise de Mercado" icon={BarChart3}>
        {result.market.status === 'available' && result.market.data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <PriceStat label="Menor Preço" value={result.market.data.min_price} icon={TrendingDown} color="text-success-400" />
              <PriceStat label="Preço Médio" value={result.market.data.avg_price} icon={Minus} color="text-accent-400" />
              <PriceStat label="Maior Preço" value={result.market.data.max_price} icon={TrendingUp} color="text-warning-400" />
              <PriceStat label="Analisados" value={result.market.data.count} isCount icon={Car} color="text-white" />
            </div>
            <div className="space-y-1 text-xs text-navy-400">
              <p className="flex items-center gap-1.5"><Info size={12} /> Fonte: {result.market.data.source}</p>
              <p className="flex items-center gap-1.5"><Info size={12} /> Critérios: {result.market.data.criteria}</p>
              <p className="flex items-center gap-1.5"><Clock size={12} /> Consultado em {new Date(result.market.data.consulted_at).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        ) : (
          <NotAvailable message={result.market.message} />
        )}
      </SectionCard>

      {/* COMPARAÇÃO FIPE x MERCADO */}
      {comparison.fipe_value && comparison.market_avg && (
        <SectionCard title="Comparação FIPE x Mercado" icon={Zap}>
          <div className="space-y-3">
            <ComparisonRow label="FIPE vs Preço Médio" diff={comparison.diff_vs_avg} pct={comparison.diff_vs_avg_pct} fipe={comparison.fipe_value} market={comparison.market_avg} />
            {comparison.market_min && (
              <ComparisonRow label="FIPE vs Menor Preço" diff={comparison.diff_vs_min} pct={comparison.diff_vs_min_pct} fipe={comparison.fipe_value} market={comparison.market_min} />
            )}
            {comparison.market_max && (
              <ComparisonRow label="FIPE vs Maior Preço" diff={comparison.diff_vs_max} pct={comparison.diff_vs_max_pct} fipe={comparison.fipe_value} market={comparison.market_max} />
            )}
          </div>
        </SectionCard>
      )}

      {/* SITUAÇÃO DO VEÍCULO */}
      <SectionCard title="Situação do Veículo" icon={ShieldCheck}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatusCard
            label="Débitos"
            status={result.vehicle_status.debits.status}
            message={result.vehicle_status.debits.message}
            details={result.vehicle_status.debits.details}
          />
          <StatusCard
            label="Restrições"
            status={result.vehicle_status.restrictions.status}
            message={result.vehicle_status.restrictions.message}
            details={result.vehicle_status.restrictions.details}
          />
        </div>
      </SectionCard>

      {/* GOVERNO - DETRAN OFICIAL */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up border border-accent-500/20">
        <div className="relative p-5 border-b border-navy-600/20">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-500/8 to-transparent" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
              <Landmark size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sistema Oficial do Governo</h3>
              <p className="text-xs text-navy-300">Consulte débitos, restrições e histórico de vistorias</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-bold text-white uppercase tracking-wide">
                Para informações mais atualizadas, e acessar histórico de vistorias de transferências, entre no sistema oficial do governo
              </p>
            </div>
            <a
              href="https://www.detran.sp.gov.br/detransp/pb/servicos/veiculos/consultar_debitos_restricoes?id=consultar_debitos_restricoes"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine flex items-center gap-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-accent-500/25 text-sm group whitespace-nowrap"
            >
              <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
              Consultar no DETRAN
            </a>
          </div>
        </div>
      </div>

      {/* HISTÓRICO VEICULAR */}
      <SectionCard title="Histórico Veicular" icon={FileText}>
        {result.history.status === 'available' && result.history.data ? (
          <div className="space-y-3">
            <p className="text-xs text-navy-400 flex items-center gap-1.5">
              <Info size={12} /> {result.history.message} Fonte: BrasilAPI.
            </p>
            <div className="space-y-2">
              {result.history.data.events.map((evt, i) => (
                <div key={i} className="flex items-center gap-3 glass rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-navy-700/40 flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-accent-400" />
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 uppercase tracking-wide">{evt.type}</p>
                    <p className="text-sm text-white font-medium">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <NotAvailable
            message={result.history.message}
            source="Requer fonte autorizada"
          />
        )}
      </SectionCard>

      {/* ANÁLISE REDE AUTO */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">
        <div className="relative p-5 border-b border-navy-600/20">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-500/8 to-transparent" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Análise REDE AUTO</h3>
              <p className="text-xs text-navy-300">Inteligência exclusiva da plataforma</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {analysis.classification === 'DADOS INSUFICIENTES' ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-warning-500/15 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-warning-400" />
              </div>
              <p className="text-white font-bold text-lg">Dados insuficientes para uma classificação confiável</p>
              <p className="text-sm text-navy-300 mt-2 max-w-md mx-auto">
                Este veículo ainda não possui dados suficientes para uma análise confiável.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
                {analysis.factors_missing.map((f, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-navy-800/40 text-navy-300 border border-navy-600/20">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Classification badge */}
              <div className="flex flex-col items-center">
                <p className="text-xs text-navy-400 uppercase tracking-wider mb-3">Potencial de Venda</p>
                <div className={`relative px-6 py-3 rounded-2xl font-extrabold text-lg border-2 ${classificationColors(analysis.classification)}`}>
                  {analysis.classification}
                </div>
                {analysis.score !== null && (
                  <div className="mt-4 w-full max-w-xs">
                    <div className="flex items-center justify-between text-xs text-navy-300 mb-1.5">
                      <span>Pontuação</span>
                      <span className="font-bold text-white">{analysis.score}/100</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-navy-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${classificationBarColor(analysis.classification)}`}
                        style={{ width: `${analysis.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Justification */}
              <div>
                <p className="text-sm font-bold text-white mb-3">Por que este veículo recebeu esta classificação?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Positives */}
                  <div className="rounded-xl border border-success-500/20 bg-success-500/5 p-4">
                    <p className="text-xs font-bold text-success-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Pontos Positivos
                    </p>
                    {analysis.positives.length > 0 ? (
                      <ul className="space-y-2">
                        {analysis.positives.map((p, i) => (
                          <li key={i} className="text-sm text-navy-200 flex items-start gap-2">
                            <span className="text-success-400 mt-0.5">✓</span> {p}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-navy-400">Nenhum ponto positivo identificado.</p>
                    )}
                  </div>
                  {/* Negatives */}
                  <div className="rounded-xl border border-warning-500/20 bg-warning-500/5 p-4">
                    <p className="text-xs font-bold text-warning-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Pontos de Atenção
                    </p>
                    {analysis.negatives.length > 0 ? (
                      <ul className="space-y-2">
                        {analysis.negatives.map((n, i) => (
                          <li key={i} className="text-sm text-navy-200 flex items-start gap-2">
                            <span className="text-warning-400 mt-0.5">!</span> {n}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-navy-400">Nenhum ponto de atenção identificado.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Factors transparency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Fatores utilizados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.factors_used.map((f, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-accent-500/10 text-accent-300 border border-accent-500/20">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Fatores não disponíveis</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.factors_missing.map((f, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-navy-800/40 text-navy-400 border border-navy-600/20">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* TRANSPARÊNCIA */}
      <SectionCard title="Transparência" icon={Info}>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Fontes utilizadas</p>
            <div className="flex flex-wrap gap-2">
              {result.sources_used.length > 0 ? result.sources_used.map((s, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-lg glass border border-navy-600/30 text-navy-200 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-success-400" /> {s}
                </span>
              )) : (
                <span className="text-sm text-navy-400">Nenhuma fonte retornou dados.</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-navy-600/20">
            <SourceStatus label="Dados do veículo" status={result.vehicle.status} message={result.vehicle.message} />
            <SourceStatus label="FIPE" status={result.fipe.status} message={result.fipe.message} />
            <SourceStatus label="Mercado" status={result.market.status} message={result.market.message} />
            <SourceStatus label="Débitos" status={result.vehicle_status.debits.status} message={result.vehicle_status.debits.message} />
            <SourceStatus label="Restrições" status={result.vehicle_status.restrictions.status} message={result.vehicle_status.restrictions.message} />
            <SourceStatus label="Histórico" status={result.history.status} message={result.history.message} />
          </div>
        </div>
      </SectionCard>

      {/* New query button */}
      <div className="flex justify-center pb-4">
        <button
          onClick={onNewQuery}
          className="btn-shine flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-accent-500/25 text-sm group"
        >
          <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
          Nova Consulta
        </button>
      </div>
    </div>
  );
}

// ===================== Sub-components =====================

function SectionCard({ title, icon: Icon, children }: { title: string; icon: typeof Car; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">
      <div className="flex items-center gap-3 p-5 border-b border-navy-600/20">
        <div className="w-9 h-9 rounded-lg bg-navy-700/40 flex items-center justify-center">
          <Icon size={18} className="text-accent-400" />
        </div>
        <h3 className="text-base font-bold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function DataField({ label, value }: { label: string; value: string | null | undefined }) {
  const hasValue = value !== null && value !== undefined && value !== '';
  return (
    <div>
      <p className="text-xs text-navy-400 uppercase tracking-wide mb-0.5">{label}</p>
      {hasValue ? (
        <p className="text-sm text-white font-semibold">{value}</p>
      ) : (
        <p className="text-sm text-navy-500 italic">Não disponível</p>
      )}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-navy-300">
      <span className="text-xs text-navy-400">{label}:</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

function NotAvailable({ message, source }: { message: string; source?: string }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="w-12 h-12 rounded-full bg-navy-700/40 flex items-center justify-center mb-3">
        <XCircle size={22} className="text-navy-400" />
      </div>
      <p className="text-sm text-navy-200 font-medium max-w-md">{message}</p>
      {source && (
        <p className="text-xs text-navy-400 mt-1.5">Fonte: {source}</p>
      )}
    </div>
  );
}

function PriceStat({ label, value, isCount, icon: Icon, color }: {
  label: string; value: number | null; isCount?: boolean; icon: typeof Car; color: string;
}) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <Icon size={18} className={`mx-auto mb-2 ${color}`} />
      <p className="text-xs text-navy-400 uppercase tracking-wide mb-1">{label}</p>
      {isCount ? (
        <p className={`text-xl font-extrabold ${color}`}>{value}</p>
      ) : (
        <p className={`text-lg font-extrabold ${color}`}>{formatCurrency(value)}</p>
      )}
    </div>
  );
}

function ComparisonRow({ label, diff, pct, fipe, market }: {
  label: string; diff: number | null; pct: number | null; fipe: number; market: number;
}) {
  if (diff === null || pct === null) return null;
  const isAbove = diff > 0;
  const isAt = Math.abs(diff) < 1;

  return (
    <div className="flex items-center justify-between p-3 glass rounded-xl">
      <span className="text-sm text-navy-200">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-navy-400">
          {formatCurrency(fipe)} vs {formatCurrency(market)}
        </span>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold ${
          isAt ? 'bg-navy-700/40 text-navy-200'
          : isAbove ? 'bg-success-500/15 text-success-400'
          : 'bg-warning-500/15 text-warning-400'
        }`}>
          {!isAt && (isAbove ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
          {isAt ? 'Alinhado' : `${formatCurrency(Math.abs(diff))} ${isAbove ? 'acima' : 'abaixo'}`}
          {!isAt && ` (${Math.abs(pct).toFixed(1)}%)`}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, status, message, details }: {
  label: string;
  status: 'available' | 'not_configured' | 'error';
  message: string;
  details: string | null;
}) {
  const config = {
    available: { icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success-500/5', border: 'border-success-500/20' },
    not_configured: { icon: Info, color: 'text-navy-400', bg: 'bg-navy-700/20', border: 'border-navy-600/20' },
    error: { icon: AlertCircle, color: 'text-error-400', bg: 'bg-error-500/5', border: 'border-error-500/20' },
  };
  const cfg = config[status];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} className={cfg.color} />
        <p className="text-sm font-bold text-white">{label}</p>
      </div>
      <p className={`text-sm ${cfg.color} font-medium`}>{message}</p>
      {details && <p className="text-xs text-navy-400 mt-1.5">{details}</p>}
    </div>
  );
}

function SourceStatus({ label, status, message }: {
  label: string; status: string; message: string;
}) {
  const iconMap: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    available: { icon: CheckCircle2, color: 'text-success-400' },
    not_found: { icon: XCircle, color: 'text-navy-400' },
    no_data: { icon: XCircle, color: 'text-navy-400' },
    not_configured: { icon: Info, color: 'text-warning-400' },
    error: { icon: AlertCircle, color: 'text-error-400' },
  };
  const cfg = iconMap[status] || iconMap.error;
  const Icon = cfg.icon;

  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
      <div>
        <p className="text-xs text-navy-200 font-medium">{label}</p>
        <p className="text-xs text-navy-400">{message}</p>
      </div>
    </div>
  );
}

function classificationColors(c: string): string {
  switch (c) {
    case 'BOM DE VENDA': return 'bg-success-500/15 text-success-400 border-success-500/40';
    case 'MÉDIO DE VENDA': return 'bg-warning-500/15 text-warning-400 border-warning-500/40';
    case 'RUIM DE VENDA': return 'bg-error-500/15 text-error-400 border-error-500/40';
    default: return 'bg-navy-700/40 text-navy-200 border-navy-600/30';
  }
}

function classificationBarColor(c: string): string {
  switch (c) {
    case 'BOM DE VENDA': return 'bg-gradient-to-r from-success-400 to-success-500';
    case 'MÉDIO DE VENDA': return 'bg-gradient-to-r from-warning-400 to-warning-500';
    case 'RUIM DE VENDA': return 'bg-gradient-to-r from-error-400 to-error-500';
    default: return 'bg-navy-600';
  }
}

// ===================== History Panel =====================

function HistoryPanel({ items, onRetry }: { items: QueryHistoryItem[]; onRetry: (plate: string) => void }) {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      <h3 className="text-base font-bold text-white mb-4">Histórico de Consultas</h3>
      {items.length === 0 ? (
        <p className="text-sm text-navy-400 text-center py-6">Nenhuma consulta realizada ainda.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {items.map((item) => {
            const vehicleData = item.query_data?.vehicle?.data;
            const classification = item.query_data?.analysis?.classification;
            return (
              <button
                key={item.id}
                onClick={() => onRetry(item.plate)}
                className="group w-full glass rounded-xl p-3 hover-lift-sm flex items-center gap-4 text-left transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-navy-700/40 flex items-center justify-center flex-shrink-0">
                  <Car size={16} className="text-accent-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono font-bold text-white">{formatPlate(item.plate)}</p>
                  <p className="text-xs text-navy-400 truncate">
                    {vehicleData ? `${vehicleData.marca || ''} ${vehicleData.modelo || ''}` : 'Veículo não identificado'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-navy-400">{new Date(item.created_at).toLocaleDateString('pt-BR')}</p>
                  {classification && (
                    <span className={`text-xs font-bold ${classification === 'BOM DE VENDA' ? 'text-success-400' : classification === 'MÉDIO DE VENDA' ? 'text-warning-400' : 'text-error-400'}`}>
                      {classification}
                    </span>
                  )}
                </div>
                <ArrowRight size={14} className="text-navy-500 group-hover:text-accent-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
