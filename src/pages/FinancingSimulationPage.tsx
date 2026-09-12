import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Car, User, Calculator, Check, Search, Plus,
  CircleDollarSign, TrendingUp, ShieldCheck, AlertCircle, Loader2,
  ChevronRight, Sparkles, Building2, X, Phone, Mail, FileText,
  ExternalLink, MessageCircle, FileDown, Printer,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type VehiclePhoto, type ClientRecord, type FinancingInstitution } from '@/lib/supabase';
import { formatCurrency, formatMileage, maskCPF } from '@/lib/format';
import { generateProposal } from '@/lib/proposal';
import {
  loadInstitutions, runSimulation, determineBestOption, rankResults,
  type ProviderResult, type SimulationFullInput,
} from '@/lib/financing-engine';

type Step = 'vehicle' | 'client' | 'conditions' | 'consulting' | 'results';

export function FinancingSimulationPage() {
  const { dealer } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('veiculo');

  const [step, setStep] = useState<Step>('vehicle');
  const [vehicles, setVehicles] = useState<(Vehicle & { photos?: VehiclePhoto[] })[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [institutions, setInstitutions] = useState<FinancingInstitution[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);

  // New client form
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientDocument, setNewClientDocument] = useState('');

  // Conditions
  const [vehiclePrice, setVehiclePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [termMonths, setTermMonths] = useState(48);
  const [maxInstallment, setMaxInstallment] = useState('');
  const [consent, setConsent] = useState(false);

  // Results
  const [results, setResults] = useState<ProviderResult[]>([]);
  const [rankCriteria, setRankCriteria] = useState<'best' | 'lowest_installment' | 'lowest_down' | 'lowest_cost' | 'longest_term' | 'approval'>('best');
  const [simulationId, setSimulationId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const [vehRes, cliRes, instRes] = await Promise.all([
        supabase.from('vehicles').select('*, photos:vehicle_photos(*)').eq('dealer_id', dealer.id).neq('status', 'sold').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').eq('dealer_id', dealer.id).order('created_at', { ascending: false }),
        loadInstitutions(),
      ]);
      if (vehRes.data) setVehicles(vehRes.data as (Vehicle & { photos?: VehiclePhoto[] })[]);
      if (cliRes.data) setClients(cliRes.data as ClientRecord[]);
      setInstitutions(instRes);

      if (preselectedVehicleId) {
        const { data } = await supabase.from('vehicles').select('*, photos:vehicle_photos(*)').eq('id', preselectedVehicleId).maybeSingle();
        if (data) {
          const v = data as Vehicle;
          setSelectedVehicle(v);
          setVehiclePrice(v.asking_price?.toString() || '');
        }
      }
      setLoading(false);
    }
    load();
  }, [dealer, preselectedVehicleId]);

  const financedAmount = (parseFloat(vehiclePrice) || 0) - (parseFloat(downPayment) || 0);

  const filteredClients = clients.filter((c) => {
    if (!clientSearch) return true;
    const s = clientSearch.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.phone?.includes(s) || c.document?.includes(s);
  });

  function selectVehicle(v: Vehicle) {
    setSelectedVehicle(v);
    setVehiclePrice(v.asking_price?.toString() || '');
    setStep('client');
  }

  function selectClient(c: ClientRecord) {
    setSelectedClient(c);
    setStep('conditions');
  }

  async function createNewClient() {
    if (!dealer || !newClientName.trim()) return;
    const { data, error } = await supabase
      .from('clients')
      .insert({
        dealer_id: dealer.id,
        name: newClientName.trim(),
        phone: newClientPhone || null,
        email: newClientEmail || null,
        document: newClientDocument || null,
        status: 'active',
      })
      .select('*')
      .maybeSingle();
    if (error) return;
    if (data) {
      const newClient = data as ClientRecord;
      setClients((prev) => [newClient, ...prev]);
      setSelectedClient(newClient);
      setShowNewClient(false);
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setNewClientDocument('');
      setStep('conditions');
    }
  }

  async function handleConsult() {
    if (!dealer || !selectedVehicle || !selectedClient || !consent) return;
    setStep('consulting');

    // Save simulation record
    const { data: simData, error: simError } = await supabase
      .from('financing_simulations')
      .insert({
        dealer_id: dealer.id,
        vehicle_id: selectedVehicle.id,
        client_id: selectedClient.id,
        vehicle_price: parseFloat(vehiclePrice) || 0,
        down_payment: parseFloat(downPayment) || 0,
        financed_amount: financedAmount,
        term_months: termMonths,
        max_installment: maxInstallment ? parseFloat(maxInstallment) : null,
        status: 'processing',
        consent_given: true,
      })
      .select('*')
      .maybeSingle();

    if (simError || !simData) {
      setStep('conditions');
      return;
    }
    const simId = (simData as { id: string }).id;
    setSimulationId(simId);

    // Call edge function — the "bot" goes bank by bank
    const fullInput: SimulationFullInput = {
      simulationId: simId,
      vehiclePrice: parseFloat(vehiclePrice) || 0,
      downPayment: parseFloat(downPayment) || 0,
      financedAmount,
      termMonths,
      maxInstallment: maxInstallment ? parseFloat(maxInstallment) : null,
      vehicleBrand: selectedVehicle.brand,
      vehicleModel: selectedVehicle.model,
      vehicleYear: selectedVehicle.year_model || selectedVehicle.year_manufacture,
      clientName: selectedClient.name,
      clientDocument: selectedClient.document,
    };

    const providerResults = await runSimulation(institutions, fullInput);

    setResults(providerResults);
    setStep('results');
  }

  async function convertToSale(offer: ProviderResult) {
    if (!dealer || !selectedVehicle || !selectedClient || !simulationId) return;
    const salePrice = parseFloat(vehiclePrice) || 0;
    const profit = salePrice - (selectedVehicle.purchase_price || 0);

    const { error } = await supabase.from('sales').insert({
      dealer_id: dealer.id,
      vehicle_id: selectedVehicle.id,
      client_name: selectedClient.name,
      client_phone: selectedClient.phone,
      sale_price: salePrice,
      purchase_price: selectedVehicle.purchase_price || 0,
      profit,
      payment_method: 'Financiamento',
      sale_date: new Date().toISOString().split('T')[0],
      notes: `Financiado por ${offer.institutionName} - ${offer.termMonths}x de ${formatCurrency(offer.installmentAmount || 0)}`,
    });

    if (error) return;

    await supabase.from('vehicles').update({ status: 'sold' }).eq('id', selectedVehicle.id);
    await supabase.from('financing_simulations').update({ status: 'converted' }).eq('id', simulationId);
    navigate('/vendas');
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

  const stepIndex = ['vehicle', 'client', 'conditions', 'consulting', 'results'].indexOf(step);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-down">
        <Link to="/financiamento" className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-gold-400" />
          <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Financiamento Inteligente</span>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        {[
          { label: 'Veículo', icon: Car },
          { label: 'Cliente', icon: User },
          { label: 'Condições', icon: CircleDollarSign },
          { label: 'Consultar', icon: Search },
          { label: 'Resultados', icon: TrendingUp },
        ].map((s, i) => {
          const Icon = s.icon;
          const isActive = i === stepIndex;
          const isDone = i < stepIndex;
          return (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 transition-all ${isActive ? 'scale-110' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isDone ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                  : isActive ? 'bg-accent-500/20 text-accent-400 border border-accent-500/40'
                  : 'bg-navy-800/40 text-navy-500 border border-navy-600/30'
                }`}>
                  {isDone ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${isActive ? 'text-white' : isDone ? 'text-success-400' : 'text-navy-500'}`}>{s.label}</span>
              </div>
              {i < 4 && <div className={`flex-1 h-px mx-2 transition-all duration-500 ${isDone ? 'bg-success-500/40' : 'bg-navy-600/30'}`} />}
            </div>
          );
        })}
      </div>

      {/* Step: Vehicle */}
      {step === 'vehicle' && (
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="text-xl font-bold text-white">Selecione o veículo</h2>
          {selectedVehicle && (
            <div className="glass rounded-2xl border border-accent-500/30 p-4 flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent-500/15 flex items-center justify-center"><Car size={22} className="text-accent-400" /></div>
              <div className="flex-1"><p className="text-white font-bold">{selectedVehicle.brand} {selectedVehicle.model}</p><p className="text-xs text-navy-400">{selectedVehicle.year_model || selectedVehicle.year_manufacture} · {formatCurrency(selectedVehicle.asking_price)}</p></div>
              <button onClick={() => { setSelectedVehicle(null); setVehiclePrice(''); }} className="text-navy-400 hover:text-error-400"><X size={18} /></button>
            </div>
          )}
          {vehicles.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Car size={36} className="text-navy-500 mx-auto mb-3" />
              <p className="text-navy-200 font-medium">Nenhum veículo disponível no estoque</p>
              <p className="text-sm text-navy-400 mt-1">Cadastre um veículo primeiro</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vehicles.map((v, i) => (
                <button key={v.id} onClick={() => selectVehicle(v)} className="group glass-card rounded-2xl overflow-hidden hover-lift-sm card-glow text-left animate-fade-in-up spotlight" style={{ animationDelay: `${i * 40}ms` }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
                  <div className="relative h-28 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center overflow-hidden">
                    {(() => { const cover = v.photos?.find((p) => p.is_cover) || v.photos?.[0]; return cover ? (
                      <img src={cover.url} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <Car size={28} className="text-navy-500 group-hover:scale-110 transition-transform" />
                    ); })()}
                  </div>
                  <div className="p-3">
                    <p className="text-white font-semibold truncate text-sm">{v.brand} {v.model}</p>
                    <p className="text-xs text-navy-400 mt-0.5">{v.year_model || v.year_manufacture} · {formatCurrency(v.asking_price)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step: Client */}
      {step === 'client' && (
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="text-xl font-bold text-white">Selecione o cliente</h2>
          <div className="relative group">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
            <input type="text" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder="Buscar por nome, telefone ou documento..."
              className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm" />
          </div>

          {!showNewClient ? (
            <button onClick={() => setShowNewClient(true)} className="btn-shine flex items-center gap-2 bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium px-4 py-2.5 rounded-xl text-sm transition-all border border-accent-500/20 group">
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" /> Cadastrar novo cliente
            </button>
          ) : (
            <div className="glass-card rounded-2xl p-5 space-y-3 animate-drop-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Novo cliente</h3>
                <button onClick={() => setShowNewClient(false)} className="text-navy-400 hover:text-white"><X size={18} /></button>
              </div>
              <input type="text" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Nome *" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              <div className="grid grid-cols-2 gap-3">
                <input type="tel" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="Telefone" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                <input type="text" value={newClientDocument} onChange={(e) => setNewClientDocument(e.target.value)} placeholder="CPF/CNPJ" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              </div>
              <input type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="E-mail" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              <button onClick={createNewClient} disabled={!newClientName.trim()} className="btn-shine flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                <Check size={16} /> Cadastrar e selecionar
              </button>
            </div>
          )}

          <div className="space-y-2">
            {filteredClients.map((c, i) => (
              <button key={c.id} onClick={() => selectClient(c)} className="group w-full glass-card rounded-xl p-4 hover-lift-sm flex items-center gap-4 text-left animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent-500/20 blur-md rounded-lg" />
                  <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center text-white font-bold text-sm">{c.name.charAt(0).toUpperCase()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate text-sm">{c.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-navy-400">
                    {c.document && <span className="flex items-center gap-1"><FileText size={10} /> {maskCPF(c.document)}</span>}
                    {c.phone && <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>}
                  </div>
                </div>
                <ChevronRight size={16} className="text-navy-500 group-hover:text-accent-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
          {filteredClients.length === 0 && !showNewClient && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <User size={32} className="text-navy-500 mx-auto mb-2" />
              <p className="text-navy-200 font-medium text-sm">Nenhum cliente encontrado</p>
              <p className="text-xs text-navy-400 mt-1">Cadastre um novo cliente ou ajuste a busca</p>
            </div>
          )}
        </div>
      )}

      {/* Step: Conditions */}
      {step === 'conditions' && selectedVehicle && selectedClient && (
        <div className="space-y-5 animate-fade-in-up max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white">Condições do financiamento</h2>

          {/* Summary card */}
          <div className="glass-card rounded-2xl p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-500/15 flex items-center justify-center"><Car size={18} className="text-accent-400" /></div>
                <div><p className="text-xs text-navy-400">Veículo</p><p className="text-sm text-white font-semibold truncate">{selectedVehicle.brand} {selectedVehicle.model}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-500/15 flex items-center justify-center"><User size={18} className="text-accent-400" /></div>
                <div><p className="text-xs text-navy-400">Cliente</p><p className="text-sm text-white font-semibold truncate">{selectedClient.name}</p></div>
              </div>
            </div>
          </div>

          {/* Financial inputs */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Valor do veículo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input type="number" step="0.01" value={vehiclePrice} onChange={(e) => setVehiclePrice(e.target.value)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Entrada</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input type="number" step="0.01" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="0,00" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              </div>
            </div>

            {/* Financed amount display */}
            <div className="p-4 bg-accent-500/10 rounded-xl border border-accent-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy-200">Valor financiado</span>
                <span className="text-lg font-extrabold text-accent-400">{formatCurrency(financedAmount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Prazo</label>
              <div className="grid grid-cols-5 gap-2">
                {[12, 24, 36, 48, 60].map((t) => (
                  <button key={t} onClick={() => setTermMonths(t)} className={`py-2.5 rounded-xl text-sm font-medium transition-all ${termMonths === t ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40' : 'bg-navy-900/50 text-navy-300 border border-navy-600/40 hover:border-navy-500'}`}>{t}x</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Parcela máxima desejada (opcional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input type="number" step="0.01" value={maxInstallment} onChange={(e) => setMaxInstallment(e.target.value)} placeholder="0,00" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="glass-card rounded-2xl p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <button type="button" onClick={() => setConsent(!consent)} className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${consent ? 'bg-accent-500 border-accent-500' : 'bg-navy-900/50 border border-navy-600/40'}`}>
                {consent && <Check size={14} className="text-white" />}
              </button>
              <span className="text-xs text-navy-200 leading-relaxed">
                Declaro que o cliente <span className="font-bold text-white">{selectedClient.name}</span> autorizou a consulta de financiamento e o tratamento de seus dados conforme a LGPD. A aprovação final é de responsabilidade da instituição financeira.
              </span>
            </label>
          </div>

          {/* Action */}
          <button
            onClick={handleConsult}
            disabled={!consent || financedAmount <= 0}
            className="btn-shine w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-accent-500/25 text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={20} className="group-hover:scale-110 transition-transform" />
            CONSULTAR FINANCIAMENTO
          </button>
          {!consent && <p className="text-xs text-navy-400 text-center">É necessário dar consentimento para prosseguir</p>}
        </div>
      )}

      {/* Step: Consulting */}
      {step === 'consulting' && (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-accent-500/30 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-20 h-20 border-3 border-accent-500/20 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Calculator size={28} className="text-accent-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Consultando instituições</h3>
          <p className="text-sm text-navy-300 text-center max-w-md">Enviando a operação para as instituições financeiras parceiras e aguardando retorno...</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {institutions.map((inst, i) => (
              <div key={inst.id} className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-xs text-navy-200 animate-fade-in" style={{ animationDelay: `${i * 200}ms` }}>
                <Building2 size={12} className="text-navy-400" /> {inst.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: Results */}
      {step === 'results' && (
        <FinancingResults
          results={rankResults(results, rankCriteria)}
          bestResult={determineBestOption(results)}
          rankCriteria={rankCriteria}
          onCriteriaChange={setRankCriteria}
          onConvertToSale={convertToSale}
          vehicleLabel={selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : ''}
          clientName={selectedClient?.name || ''}
          clientDocument={selectedClient?.document || null}
          clientPhone={selectedClient?.phone || null}
          vehicleYear={selectedVehicle?.year_model || selectedVehicle?.year_manufacture || null}
          financedAmount={financedAmount}
          termMonths={termMonths}
          downPayment={parseFloat(downPayment) || 0}
          vehiclePrice={parseFloat(vehiclePrice) || 0}
          dealerName={dealer?.name}
          dealerLogoUrl={dealer?.logo_url}
          protocolNumber={simulationId}
        />
      )}
    </div>
  );
}

// =================== Results Component ===================

function FinancingResults({
  results, bestResult, rankCriteria, onCriteriaChange, onConvertToSale,
  vehicleLabel, clientName, clientDocument, clientPhone, vehicleYear,
  financedAmount, termMonths, downPayment, vehiclePrice,
  dealerName, dealerLogoUrl, protocolNumber,
}: {
  results: ProviderResult[];
  bestResult: ProviderResult | null;
  rankCriteria: string;
  onCriteriaChange: (c: 'best' | 'lowest_installment' | 'lowest_down' | 'lowest_cost' | 'longest_term' | 'approval') => void;
  onConvertToSale: (offer: ProviderResult) => void;
  vehicleLabel: string;
  clientName: string;
  clientDocument: string | null;
  clientPhone: string | null;
  vehicleYear: number | null;
  financedAmount: number;
  termMonths: number;
  downPayment: number;
  vehiclePrice: number;
  dealerName: string | null | undefined;
  dealerLogoUrl: string | null | undefined;
  protocolNumber: string | null;
}) {
  const criteriaOptions = [
    { value: 'best', label: 'Melhor condição' },
    { value: 'lowest_installment', label: 'Menor parcela' },
    { value: 'lowest_down', label: 'Menor entrada' },
    { value: 'lowest_cost', label: 'Menor custo (CET)' },
    { value: 'longest_term', label: 'Maior prazo' },
    { value: 'approval', label: 'Aprovação' },
  ] as const;

  function handleGenerateProposal(result: ProviderResult) {
    generateProposal({
      clientName,
      clientDocument,
      clientPhone,
      vehicleLabel,
      vehicleYear,
      vehiclePrice,
      downPayment,
      financedAmount,
      termMonths,
      result,
      dealerName,
      dealerLogoUrl,
      protocolNumber: protocolNumber ? protocolNumber.slice(0, 8).toUpperCase() : null,
    });
  }

  function buildWhatsAppLink(result: ProviderResult): string {
    const proto = protocolNumber ? protocolNumber.slice(0, 8).toUpperCase() : '';
    const msg = `Olá! Tenho um cliente com simulação aprovada de financiamento veicular e gostaria de dar continuidade ao processo.

*Protocolo:* ${proto}
*Cliente:* ${clientName}
*Veículo:* ${vehicleLabel}
*Valor financiado:* R$ ${(result.financedAmount || 0).toFixed(2).replace('.', ',')}
*Entrada:* R$ ${(result.downPayment || 0).toFixed(2).replace('.', ',')}
*Prazo:* ${result.termMonths}x
*Parcela:* R$ ${(result.installmentAmount || 0).toFixed(2).replace('.', ',')}
*Taxa:* ${result.interestRate}% a.a.
*CET:* ${result.cet}% a.a.
*Status:* ${result.status === 'approved' ? 'APROVADO' : 'APROVADO COM CONDIÇÃO'}

Como podemos prosseguir com a formalização do contrato?`;
    return `https://wa.me/${result.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Summary */}
      <div className="glass-card rounded-2xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><p className="text-xs text-navy-400 uppercase">Veículo</p><p className="text-sm text-white font-semibold truncate">{vehicleLabel}</p></div>
          <div><p className="text-xs text-navy-400 uppercase">Cliente</p><p className="text-sm text-white font-semibold truncate">{clientName}</p></div>
          <div><p className="text-xs text-navy-400 uppercase">Financiado</p><p className="text-sm text-accent-400 font-bold">{formatCurrency(financedAmount)}</p></div>
          <div><p className="text-xs text-navy-400 uppercase">Prazo</p><p className="text-sm text-white font-bold">{termMonths}x</p></div>
        </div>
      </div>

      {/* Best option banner */}
      {bestResult && (
        <div className="relative glass rounded-2xl border border-gold-500/30 p-6 overflow-hidden animate-bounce-in">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-transparent" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gold-400/30 blur-xl rounded-xl" />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Melhor opção</p>
              <p className="text-xl font-extrabold text-white">{bestResult.institutionName}</p>
              <p className="text-sm text-navy-200 mt-0.5">Melhor condição encontrada para esta simulação</p>
            </div>
            {bestResult.installmentAmount && (
              <div className="text-right">
                <p className="text-xs text-navy-400">Parcela</p>
                <p className="text-2xl font-extrabold text-success-400">{formatCurrency(bestResult.installmentAmount)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ranking controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-navy-400 uppercase tracking-wide font-medium">Ordenar por:</span>
        {criteriaOptions.map((opt) => (
          <button key={opt.value} onClick={() => onCriteriaChange(opt.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${rankCriteria === opt.value ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30' : 'glass border border-navy-600/30 text-navy-300 hover:text-white'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Offer cards */}
      <div className="space-y-3">
        {results.map((r, i) => (
          <OfferCard key={i} result={r} isBest={bestResult?.institutionId === r.institutionId} onConvert={() => onConvertToSale(r)} onGenerateProposal={() => handleGenerateProposal(r)} onWhatsApp={() => window.open(buildWhatsAppLink(r), '_blank')} animateDelay={i * 60} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="glass-card rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck size={18} className="text-navy-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-navy-300 leading-relaxed">
          As simulações apresentadas são reais e válidas, com condições efetivas junto a cada instituição. Para formalizar o contrato, será necessária a apresentação da documentação, vistoria do veículo e validação cadastral final. Os valores podem sofrer ajustes em caso de alteração das informações prestadas.
        </p>
      </div>
    </div>
  );
}

function OfferCard({ result, isBest, onConvert, onGenerateProposal, onWhatsApp, animateDelay }: { result: ProviderResult; isBest: boolean; onConvert: () => void; onGenerateProposal: () => void; onWhatsApp: () => void; animateDelay: number }) {
  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    approved: { label: 'APROVADO', color: 'text-success-400', dot: 'bg-success-400' },
    approved_with_condition: { label: 'APROVADO COM CONDIÇÃO', color: 'text-warning-400', dot: 'bg-warning-400' },
    rejected: { label: 'NÃO APROVADO', color: 'text-error-400', dot: 'bg-error-400' },
    unavailable: { label: 'INTEGRAÇÃO NÃO DISPONÍVEL', color: 'text-navy-400', dot: 'bg-navy-500' },
  };
  const cfg = statusConfig[result.status] || statusConfig.unavailable;
  const canConvert = result.status === 'approved' || result.status === 'approved_with_condition';

  return (
    <div className={`group glass rounded-2xl border p-5 hover-lift card-glow animate-fade-in-up overflow-hidden relative ${isBest ? 'border-gold-500/30' : 'border-navy-600/20'}`} style={{ animationDelay: `${animateDelay}ms` }}>
      {isBest && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-500/15 blur-md rounded-lg" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center">
              <Building2 size={20} className="text-accent-300" />
            </div>
          </div>
          <div>
            <p className="text-white font-bold">{result.institutionName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${cfg.dot} ${result.status === 'approved' ? 'animate-pulse' : ''}`} />
              <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
            </div>
          </div>
        </div>
        {isBest && <span className="text-xs px-2 py-1 rounded-full bg-gold-500/15 text-gold-400 border border-gold-500/30 font-bold">🏆 MELHOR</span>}
      </div>

      {result.status === 'unavailable' ? (
        <div className="p-3 bg-navy-800/40 rounded-xl border border-navy-600/20">
          <p className="text-xs text-navy-400">{result.conditions || 'Integração não disponível'}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {result.downPayment !== null && <OfferField label="Entrada" value={formatCurrency(result.downPayment)} />}
            {result.financedAmount !== null && <OfferField label="Financiado" value={formatCurrency(result.financedAmount)} />}
            {result.termMonths !== null && <OfferField label="Prazo" value={`${result.termMonths}x`} />}
            {result.installmentAmount !== null && <OfferField label="Parcela" value={formatCurrency(result.installmentAmount)} highlight />}
            {result.interestRate !== null && <OfferField label="Taxa" value={`${result.interestRate}%`} />}
            {result.cet !== null && <OfferField label="CET" value={`${result.cet}%`} />}
          </div>
          {result.conditions && (
            <div className="p-3 bg-navy-800/40 rounded-xl border border-navy-600/20 mb-4">
              <p className="text-xs text-navy-300">{result.conditions}</p>
            </div>
          )}
          {result.notes && (
            <p className="text-xs text-navy-400 mb-3">{result.notes}</p>
          )}
          {canConvert && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a href={result.financingUrl || '#'} target="_blank" rel="noopener noreferrer" className="btn-shine flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-accent-500/20 text-sm group">
                  <ExternalLink size={16} className="group-hover:scale-110 transition-transform" />
                  Continuar com {result.institutionName.split(' ')[0]}
                </a>
                <button onClick={onWhatsApp} className="btn-shine flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-green-500/20 text-sm group">
                  <MessageCircle size={16} className="group-hover:scale-110 transition-transform" />
                  WhatsApp do banco
                </button>
                <button onClick={onGenerateProposal} className="btn-shine flex items-center justify-center gap-2 glass border border-navy-600/30 hover:border-accent-500/30 text-white font-semibold py-3 rounded-xl transition-all text-sm group">
                  <FileDown size={16} className="group-hover:scale-110 transition-transform" />
                  Gerar proposta
                </button>
              </div>
              <button onClick={onConvert} className="btn-shine w-full flex items-center justify-center gap-2 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-400 hover:to-success-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-success-500/20 text-sm group">
                <TrendingUp size={16} className="group-hover:scale-110 transition-transform" />
                Continuar para venda
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OfferField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-navy-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-success-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}
