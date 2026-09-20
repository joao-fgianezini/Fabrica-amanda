import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Car, User, CircleDollarSign, Check, Search, Plus,
  TrendingUp, ShieldCheck, AlertCircle, Loader2,
  ChevronRight, Sparkles, Building2, X, Phone, Mail, FileText,
  MapPin, Zap, Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type VehiclePhoto, type ClientRecord } from '@/lib/supabase';
import { formatCurrency, maskCPF } from '@/lib/format';
import {
  getCredereConfigStatus, createCredereSimulation, searchCredereVehicles,
  saveVehicleCredereMapping, loadVehicleCredereMapping,
  loadCredereSimulation, loadCredereConditions, selectCondition,
  moneyToCents, centsToMoney, isValidCpf, maskCpfPartial,
  translatePreApprovalStatus, parseExpenses,
  type CredereConfigStatus, type CredereCondition, type CredereVehicle,
} from '@/lib/credere';
import { useDraftForm } from '@/hooks/useDraftForm';

type Step = 'vehicle' | 'client' | 'conditions' | 'consulting' | 'results';

const TERM_OPTIONS = [12, 24, 36, 48, 60];

export function FinancingSimulationPage() {
  const { dealer } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('veiculo');

  const [step, setStep] = useState<Step>('vehicle');
  const [vehicles, setVehicles] = useState<(Vehicle & { photos?: VehiclePhoto[] })[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [credereConfig, setCredereConfig] = useState<CredereConfigStatus | null>(null);
  const [credereError, setCredereError] = useState<string | null>(null);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);

  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientDocument, setNewClientDocument] = useState('');

  const [vehiclePrice, setVehiclePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [selectedTerms, setSelectedTerms] = useState<number[]>([36, 48, 60]);
  const [consent, setConsent] = useState(false);

  const [licensingUf, setLicensingUf] = useState('');
  const [licensingCity, setLicensingCity] = useState('');
  const [sellerCpf, setSellerCpf] = useState('');

  const [credereVehicleMapping, setCredereVehicleMapping] = useState<string | null>(null);
  const [credereVehicleSearch, setCredereVehicleSearch] = useState('');
  const [credereVehicleResults, setCredereVehicleResults] = useState<CredereVehicle[]>([]);
  const [searchingCredereVehicles, setSearchingCredereVehicles] = useState(false);
  const [showVehicleSearch, setShowVehicleSearch] = useState(false);

  const [credereConditions, setCredereConditions] = useState<CredereCondition[]>([]);
  const [credereSimId, setCredereSimId] = useState<string | null>(null);
  const [financingSimId, setFinancingSimId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const draftApplied = useRef(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draftData = {
    step, selectedVehicleId: selectedVehicle?.id || '', selectedClientId: selectedClient?.id || '',
    vehiclePrice, downPayment, selectedTerms, consent,
    newClientName, newClientPhone, newClientEmail, newClientDocument,
    licensingUf, licensingCity, sellerCpf,
  };
  const { restoredData, clearDraft } = useDraftForm('financing-sim-draft', draftData, !loading);

  useEffect(() => {
    if (!restoredData || draftApplied.current || loading) return;
    draftApplied.current = true;
    if (restoredData.vehiclePrice) setVehiclePrice(restoredData.vehiclePrice);
    if (restoredData.downPayment) setDownPayment(restoredData.downPayment);
    if (Array.isArray(restoredData.selectedTerms)) setSelectedTerms(restoredData.selectedTerms);
    if (typeof restoredData.consent === 'boolean') setConsent(restoredData.consent);
    if (restoredData.newClientName) setNewClientName(restoredData.newClientName);
    if (restoredData.newClientPhone) setNewClientPhone(restoredData.newClientPhone);
    if (restoredData.newClientEmail) setNewClientEmail(restoredData.newClientEmail);
    if (restoredData.newClientDocument) setNewClientDocument(restoredData.newClientDocument);
    if (restoredData.licensingUf) setLicensingUf(restoredData.licensingUf);
    if (restoredData.licensingCity) setLicensingCity(restoredData.licensingCity);
    if (restoredData.sellerCpf) setSellerCpf(restoredData.sellerCpf);
    if (restoredData.step) setStep(restoredData.step);
    if (restoredData.selectedVehicleId) {
      const v = vehicles.find((v) => v.id === restoredData.selectedVehicleId);
      if (v) setSelectedVehicle(v);
    }
    if (restoredData.selectedClientId) {
      const c = clients.find((c) => c.id === restoredData.selectedClientId);
      if (c) setSelectedClient(c);
    }
  }, [restoredData, loading, vehicles, clients]);

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const [vehRes, cliRes, configRes] = await Promise.all([
        supabase.from('vehicles').select('*, photos:vehicle_photos(*)').eq('dealer_id', dealer.id).neq('status', 'sold').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').eq('dealer_id', dealer.id).order('created_at', { ascending: false }),
        getCredereConfigStatus(),
      ]);
      if (vehRes.data) setVehicles(vehRes.data as (Vehicle & { photos?: VehiclePhoto[] })[]);
      if (cliRes.data) setClients(cliRes.data as ClientRecord[]);
      setCredereConfig(configRes);

      if (dealer.state) setLicensingUf(dealer.state);
      if (dealer.city) setLicensingCity(dealer.city);

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
    load().catch(() => setLoading(false));
  }, [dealer, preselectedVehicleId]);

  useEffect(() => {
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, []);

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
    checkVehicleMapping(v.id);
  }

  async function checkVehicleMapping(vehicleId: string) {
    const mapping = await loadVehicleCredereMapping(vehicleId);
    if (mapping) {
      setCredereVehicleMapping(mapping.credere_vehicle_model_id);
    } else {
      setCredereVehicleMapping(null);
    }
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

  const debounceSearch = useRef(0);
  function handleCredereVehicleSearch(query: string) {
    setCredereVehicleSearch(query);
    if (debounceSearch.current) clearTimeout(debounceSearch.current);
    if (!query.trim()) { setCredereVehicleResults([]); return; }
    setSearchingCredereVehicles(true);
    debounceSearch.current = window.setTimeout(async () => {
      try {
        const results = await searchCredereVehicles(query);
        setCredereVehicleResults(results);
      } catch {
        setCredereVehicleResults([]);
      } finally {
        setSearchingCredereVehicles(false);
      }
    }, 400);
  }

  async function selectCredereVehicle(cv: CredereVehicle) {
    if (!selectedVehicle || !dealer) return;
    setCredereVehicleMapping(cv.id);
    setShowVehicleSearch(false);
    await saveVehicleCredereMapping(selectedVehicle.id, dealer.id, cv.id, {
      brand: cv.brand,
      model: cv.model,
      version: cv.version,
      fipe_code: cv.fipe_code,
    });
  }

  const pollForResults = useCallback(async (credSimId: string) => {
    if (pollRef.current) clearTimeout(pollRef.current);
    pollRef.current = setTimeout(async () => {
      const { data: sim } = await supabase
        .from('credere_simulations')
        .select('status')
        .eq('id', credSimId)
        .maybeSingle();

      const currentStatus = sim?.status || 'processing';

      if (currentStatus === 'completed' || currentStatus === 'failed' || currentStatus === 'no_results') {
        const conditions = await loadCredereConditions(credSimId);
        setCredereConditions(conditions);
        setPolling(false);
        setStep('results');
        if (currentStatus === 'no_results' && conditions.length === 0) {
          setSimError('Nenhuma condição de financiamento disponível para esta simulação.');
        }
        return;
      }

      const conditions = await loadCredereConditions(credSimId);
      if (conditions.length > 0) {
        setCredereConditions(conditions);
      }

      pollForResults(credSimId);
    }, 3000);
  }, []);

  async function handleConsult() {
    if (!dealer || !selectedVehicle || !selectedClient || !consent) return;

    if (!credereConfig?.configured) {
      setCredereError('Configure a integração da Credere para realizar simulações reais.');
      return;
    }
    if (!credereVehicleMapping) {
      setSimError('É necessário mapear o veículo no catálogo da Credere antes de simular.');
      setShowVehicleSearch(true);
      return;
    }
    if (!selectedClient.document || !isValidCpf(selectedClient.document)) {
      setSimError('O cliente precisa ter um CPF válido cadastrado.');
      return;
    }
    if (!sellerCpf || !isValidCpf(sellerCpf)) {
      setSimError('Informe um CPF válido do vendedor.');
      return;
    }
    if (!licensingUf || !licensingCity) {
      setSimError('Informe o estado (UF) e cidade de licenciamento.');
      return;
    }
    if (selectedTerms.length === 0) {
      setSimError('Selecione ao menos uma opção de parcelas.');
      return;
    }

    setSimError(null);
    setStep('consulting');

    const { data: simData, error: simError2 } = await supabase
      .from('financing_simulations')
      .insert({
        dealer_id: dealer.id,
        vehicle_id: selectedVehicle.id,
        client_id: selectedClient.id,
        vehicle_price: parseFloat(vehiclePrice) || 0,
        down_payment: parseFloat(downPayment) || 0,
        financed_amount: financedAmount,
        term_months: selectedTerms[0],
        status: 'processing',
        consent_given: true,
        provider: 'credere',
        licensing_uf: licensingUf,
        licensing_city: licensingCity,
        seller_cpf: sellerCpf,
      })
      .select('*')
      .maybeSingle();

    if (simError2 || !simData) {
      setSimError('Erro ao salvar a simulação. Tente novamente.');
      setStep('conditions');
      return;
    }
    const simId = (simData as { id: string }).id;
    setFinancingSimId(simId);

    const assetValueCents = moneyToCents(parseFloat(vehiclePrice) || 0);
    const downPaymentCents = moneyToCents(parseFloat(downPayment) || 0);

    try {
      const result = await createCredereSimulation({
        sellerCpf: sellerCpf.replace(/\D/g, ''),
        clientCpf: selectedClient.document!.replace(/\D/g, ''),
        clientName: selectedClient.name,
        clientPhone: selectedClient.phone || undefined,
        clientEmail: selectedClient.email || undefined,
        vehicleCredereModelId: credereVehicleMapping,
        licensingUf,
        licensingCity,
        manufactureYear: selectedVehicle.year_manufacture || new Date().getFullYear(),
        modelYear: selectedVehicle.year_model || selectedVehicle.year_manufacture || new Date().getFullYear(),
        assetValueCents,
        zeroKm: (selectedVehicle.mileage ?? 9999) === 0,
        conditions: selectedTerms.map((t) => ({ installments: t, downPaymentCents })),
        financingSimulationId: simId,
      });

      if (result.credereSimulationId) {
        setCredereSimId(result.credereSimulationId);
        setPolling(true);
        pollForResults(result.credereSimulationId);
      } else {
        const rawResults = (result.rawResponse as Record<string, unknown>)?.results;
        if (Array.isArray(rawResults) && rawResults.length > 0) {
          const { data: credSim } = await supabase
            .from('credere_simulations')
            .select('id')
            .eq('financing_simulation_id', simId)
            .maybeSingle();
          if (credSim) {
            setCredereSimId(credSim.id);
            const conditions = await loadCredereConditions(credSim.id);
            setCredereConditions(conditions);
          }
          setStep('results');
        } else {
          setSimError('Nenhuma condição de financiamento disponível para esta simulação.');
          setStep('results');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao consultar a Credere.';
      setSimError(msg);
      setStep('conditions');
    }
  }

  async function handleSelectCondition(conditionId: string) {
    if (!credereSimId) return;
    await selectCondition(conditionId);
    setCredereConditions(prev => prev.map(c => ({ ...c, is_selected: c.id === conditionId })));
  }

  async function convertToSale(condition: CredereCondition) {
    if (!dealer || !selectedVehicle || !selectedClient || !financingSimId) return;
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
      notes: `Financiado por ${condition.bank_name || condition.bank_nickname || 'Credere'} - ${condition.installments}x`,
    });

    if (error) return;

    await supabase.from('vehicles').update({ status: 'sold' }).eq('id', selectedVehicle.id);
    await supabase.from('financing_simulations').update({ status: 'converted' }).eq('id', financingSimId);
    clearDraft();
    navigate('/vendas');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
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
          <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Credere · Financiamento Real</span>
        </div>
      </div>

      {/* Credere config warning */}
      {credereConfig && !credereConfig.configured && step !== 'consulting' && (
        <div className="glass-card rounded-2xl p-4 mb-6 border border-warning-500/30 flex items-start gap-3 animate-fade-in">
          <AlertCircle size={18} className="text-warning-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white font-medium">Integração Credere aguardando configuração</p>
            <p className="text-xs text-navy-300 mt-1">
              {credereConfig.storeId
                ? 'O token de acesso está expirado. Reconfigure a integração.'
                : 'Esta loja não possui Store-Id configurado. Acesse as configurações de integração.'}
            </p>
          </div>
        </div>
      )}

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
              <button onClick={() => { setSelectedVehicle(null); setVehiclePrice(''); setCredereVehicleMapping(null); }} className="text-navy-400 hover:text-error-400"><X size={18} /></button>
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
                <input type="text" value={newClientDocument} onChange={(e) => setNewClientDocument(e.target.value)} placeholder="CPF *" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              </div>
              <input type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="E-mail" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              <button onClick={createNewClient} disabled={!newClientName.trim() || !newClientDocument.trim()} className="btn-shine flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
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

          {/* Credere vehicle mapping */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-accent-400" />
              <h3 className="text-sm font-bold text-white">Mapeamento do veículo na Credere</h3>
            </div>
            {credereVehicleMapping ? (
              <div className="flex items-center justify-between p-3 bg-success-500/10 rounded-xl border border-success-500/20">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-success-400" />
                  <span className="text-sm text-success-300">Veículo mapeado: ID {credereVehicleMapping}</span>
                </div>
                <button onClick={() => setShowVehicleSearch(true)} className="text-xs text-accent-400 hover:text-accent-300">Trocar</button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-warning-500/10 rounded-xl border border-warning-500/20">
                  <Info size={16} className="text-warning-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-navy-200">Este veículo ainda não foi mapeado no catálogo da Credere. Busque e selecione o modelo correspondente.</p>
                </div>
                <button onClick={() => setShowVehicleSearch(true)} className="btn-shine flex items-center gap-2 bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium px-4 py-2.5 rounded-xl text-sm transition-all border border-accent-500/20">
                  <Search size={16} /> Buscar no catálogo Credere
                </button>
              </div>
            )}
            {showVehicleSearch && (
              <div className="mt-3 space-y-3 animate-drop-in">
                <div className="relative group">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
                  <input
                    type="text"
                    value={credereVehicleSearch}
                    onChange={(e) => handleCredereVehicleSearch(e.target.value)}
                    placeholder={`${selectedVehicle.brand} ${selectedVehicle.model}...`}
                    className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all"
                    autoFocus
                  />
                  {searchingCredereVehicles && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-400 animate-spin" />}
                </div>
                {credereVehicleResults.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {credereVehicleResults.map((cv) => (
                      <button key={cv.id} onClick={() => selectCredereVehicle(cv)} className="w-full text-left p-2.5 rounded-lg bg-navy-900/40 hover:bg-accent-500/10 border border-navy-600/30 hover:border-accent-500/30 transition-all">
                        <p className="text-sm text-white font-medium">{cv.brand} {cv.model} {cv.version || ''}</p>
                        <p className="text-xs text-navy-400">ID: {cv.id} {cv.fipe_code ? `· FIPE: ${cv.fipe_code}` : ''}</p>
                      </button>
                    ))}
                  </div>
                )}
                {credereVehicleSearch && !searchingCredereVehicles && credereVehicleResults.length === 0 && (
                  <p className="text-xs text-navy-400">Nenhum veículo encontrado. Tente outro termo.</p>
                )}
                <button onClick={() => setShowVehicleSearch(false)} className="text-xs text-navy-400 hover:text-white">Fechar busca</button>
              </div>
            )}
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

            <div className="p-4 bg-accent-500/10 rounded-xl border border-accent-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy-200">Valor financiado</span>
                <span className="text-lg font-extrabold text-accent-400">{formatCurrency(financedAmount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Parcelas (selecione uma ou mais)</label>
              <div className="grid grid-cols-5 gap-2">
                {TERM_OPTIONS.map((t) => (
                  <button key={t} onClick={() => {
                    setSelectedTerms(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t].sort((a,b) => a - b));
                  }} className={`py-2.5 rounded-xl text-sm font-medium transition-all ${selectedTerms.includes(t) ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40' : 'bg-navy-900/50 text-navy-300 border border-navy-600/40 hover:border-navy-500'}`}>{t}x</button>
                ))}
              </div>
            </div>
          </div>

          {/* Licensing + Seller */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-accent-400" />
              <h3 className="text-sm font-bold text-white">Local de licenciamento e vendedor</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Estado (UF)</label>
                <input type="text" maxLength={2} value={licensingUf} onChange={(e) => setLicensingUf(e.target.value.toUpperCase())} placeholder="SP" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all uppercase" />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Cidade</label>
                <input type="text" value={licensingCity} onChange={(e) => setLicensingCity(e.target.value)} placeholder="São Paulo" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">CPF do vendedor</label>
              <input type="text" value={sellerCpf} onChange={(e) => setSellerCpf(e.target.value)} placeholder="000.000.000-00" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
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

          {/* Error */}
          {simError && (
            <div className="glass-card rounded-xl p-4 border border-error-500/30 flex items-start gap-3 animate-fade-in">
              <AlertCircle size={18} className="text-error-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error-300">{simError}</p>
            </div>
          )}

          {/* Action */}
          <button
            onClick={handleConsult}
            disabled={!consent || financedAmount <= 0 || !credereVehicleMapping}
            className="btn-shine w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-accent-500/25 text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={20} className="group-hover:scale-110 transition-transform" />
            CONSULTAR FINANCIAMENTO
          </button>
          {!credereVehicleMapping && <p className="text-xs text-navy-400 text-center">Mapeie o veículo na Credere para prosseguir</p>}
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
              <Building2 size={28} className="text-accent-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Consultando instituições financeiras</h3>
          <p className="text-sm text-navy-300 text-center max-w-md">Aguarde enquanto buscamos as condições disponíveis junto aos bancos parceiros da loja na Credere...</p>
        </div>
      )}

      {/* Step: Results */}
      {step === 'results' && (
        <CredereResults
          conditions={credereConditions}
          onSelectCondition={handleSelectCondition}
          onConvertToSale={convertToSale}
          vehicleLabel={selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : ''}
          clientName={selectedClient?.name || ''}
          clientDocument={selectedClient?.document || null}
          financedAmount={financedAmount}
          vehiclePrice={parseFloat(vehiclePrice) || 0}
          downPayment={parseFloat(downPayment) || 0}
          simError={simError}
          polling={polling}
        />
      )}
    </div>
  );
}

// =================== Results Component ===================

function CredereResults({
  conditions, onSelectCondition, onConvertToSale,
  vehicleLabel, clientName, clientDocument,
  financedAmount, vehiclePrice, downPayment,
  simError, polling,
}: {
  conditions: CredereCondition[];
  onSelectCondition: (conditionId: string) => void;
  onConvertToSale: (condition: CredereCondition) => void;
  vehicleLabel: string;
  clientName: string;
  clientDocument: string | null;
  financedAmount: number;
  vehiclePrice: number;
  downPayment: number;
  simError: string | null;
  polling: boolean;
}) {
  const selectedCondition = conditions.find(c => c.is_selected);

  if (polling && conditions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Loader2 size={32} className="text-accent-400 animate-spin mb-4" />
        <p className="text-sm text-navy-300">Aguardando resultados da Credere...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Summary */}
      <div className="glass-card rounded-2xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><p className="text-xs text-navy-400 uppercase">Veículo</p><p className="text-sm text-white font-semibold truncate">{vehicleLabel}</p></div>
          <div><p className="text-xs text-navy-400 uppercase">Cliente</p><p className="text-sm text-white font-semibold truncate">{clientName}</p></div>
          <div><p className="text-xs text-navy-400 uppercase">Financiado</p><p className="text-sm text-accent-400 font-bold">{formatCurrency(financedAmount)}</p></div>
          <div><p className="text-xs text-navy-400 uppercase">Entrada</p><p className="text-sm text-white font-bold">{formatCurrency(downPayment)}</p></div>
        </div>
      </div>

      {/* Error / no results */}
      {simError && conditions.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center border border-navy-600/30">
          <AlertCircle size={32} className="text-navy-400 mx-auto mb-3" />
          <p className="text-navy-200 font-medium">{simError}</p>
        </div>
      )}

      {/* Conditions header */}
      {conditions.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" />
            <h2 className="text-lg font-bold text-white">Condições retornadas ({conditions.length})</h2>
          </div>

          {/* Condition cards */}
          <div className="space-y-3">
            {conditions.map((c, i) => (
              <ConditionCard
                key={c.id}
                condition={c}
                onSelect={() => onSelectCondition(c.id)}
                onConvert={() => onConvertToSale(c)}
                animateDelay={i * 60}
              />
            ))}
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

      {/* Selected condition summary */}
      {selectedCondition && (
        <div className="glass rounded-2xl border border-success-500/30 p-5 animate-bounce-in">
          <div className="flex items-center gap-3 mb-3">
            <Check size={20} className="text-success-400" />
            <p className="text-sm font-bold text-white">Condição selecionada: {selectedCondition.bank_name || selectedCondition.bank_nickname}</p>
          </div>
          <button
            onClick={() => onConvertToSale(selectedCondition)}
            className="btn-shine w-full flex items-center justify-center gap-2 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-400 hover:to-success-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-success-500/20 text-sm group"
          >
            <TrendingUp size={18} className="group-hover:scale-110 transition-transform" />
            Continuar para venda
          </button>
        </div>
      )}
    </div>
  );
}

function ConditionCard({
  condition, onSelect, onConvert, animateDelay,
}: {
  condition: CredereCondition;
  onSelect: () => void;
  onConvert: () => void;
  animateDelay: number;
}) {
  const expenses = parseExpenses(condition.expenses);
  const preApproval = translatePreApprovalStatus(condition.pre_approval_status);
  const hasReason = !!condition.reason;

  return (
    <div className={`group glass rounded-2xl border p-5 hover-lift card-glow animate-fade-in-up overflow-hidden relative ${condition.is_selected ? 'border-success-500/40' : 'border-navy-600/20'}`} style={{ animationDelay: `${animateDelay}ms` }}>
      {condition.is_selected && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-success-400/50 to-transparent" />}

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
            <p className="text-white font-bold">{condition.bank_nickname || condition.bank_name || 'Banco'}</p>
            {condition.bank_name && condition.bank_nickname && condition.bank_name !== condition.bank_nickname && (
              <p className="text-xs text-navy-400">{condition.bank_name}</p>
            )}
            {condition.bank_febraban_code && (
              <p className="text-xs text-navy-500">Febraban: {condition.bank_febraban_code}</p>
            )}
          </div>
        </div>
        {condition.is_selected && <span className="text-xs px-2 py-1 rounded-full bg-success-500/15 text-success-400 border border-success-500/30 font-bold">SELECIONADA</span>}
      </div>

      {/* Reason / error */}
      {hasReason && (
        <div className="p-3 bg-error-500/10 rounded-xl border border-error-500/20 mb-4">
          <p className="text-xs text-error-300">Não foi possível obter condição.</p>
          <p className="text-xs text-navy-400 mt-0.5">Motivo: {condition.reason}</p>
        </div>
      )}

      {/* Financial fields */}
      {!hasReason && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {condition.installments !== null && (
              <CondField label="Parcelas" value={`${condition.installments}x`} />
            )}
            {condition.down_payment_cents !== null && (
              <CondField label="Entrada" value={formatCurrency(centsToMoney(condition.down_payment_cents))} />
            )}
            {condition.financed_amount_cents !== null && (
              <CondField label="Financiado" value={formatCurrency(centsToMoney(condition.financed_amount_cents))} />
            )}
            {condition.amount_paid_in_financing_cents !== null && (
              <CondField label="Valor total" value={formatCurrency(centsToMoney(condition.amount_paid_in_financing_cents))} highlight />
            )}
            {condition.bank_down_payment_suggestion_cents !== null && (
              <CondField label="Entrada sugerida" value={formatCurrency(centsToMoney(condition.bank_down_payment_suggestion_cents))} />
            )}
            {preApproval && (
              <CondField label="Pré-aprovação" value={preApproval} />
            )}
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
          {!condition.is_selected && (
            <button
              onClick={onSelect}
              className="btn-shine w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-accent-500/20 text-sm group"
            >
              <Check size={16} className="group-hover:scale-110 transition-transform" />
              Escolher esta condição
            </button>
          )}
          {condition.is_selected && (
            <button
              onClick={onConvert}
              className="btn-shine w-full flex items-center justify-center gap-2 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-400 hover:to-success-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-success-500/20 text-sm group"
            >
              <TrendingUp size={16} className="group-hover:scale-110 transition-transform" />
              Continuar para venda
            </button>
          )}
        </>
      )}
    </div>
  );
}

function CondField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-navy-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-success-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}
