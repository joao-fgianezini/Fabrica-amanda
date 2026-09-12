import { useEffect, useState } from 'react';
import { Plus, TrendingUp, Car, AlertCircle, X, Loader2, Pencil, Trash2, DollarSign, Calendar, User, Phone, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Sale, type SaleWithVehicle, type Vehicle } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/format';

const paymentMethods = ['Dinheiro', 'PIX', 'Cartão Débito', 'Cartão Crédito', 'Financiamento', 'Consórcio', 'Permuta'];

export function SalesPage() {
  const { dealer } = useAuth();
  const [sales, setSales] = useState<SaleWithVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [vehicleId, setVehicleId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const [salesRes, vehRes] = await Promise.all([
        supabase
          .from('sales')
          .select('*, vehicle:vehicles(id, brand, model, year_model, year_manufacture)')
          .eq('dealer_id', dealer.id)
          .order('sale_date', { ascending: false }),
        supabase.from('vehicles').select('*').eq('dealer_id', dealer.id),
      ]);
      if (salesRes.error) { console.error('Erro ao carregar vendas:', salesRes.error); setError('Não foi possível carregar as vendas. Tente novamente.'); }
      else setSales(salesRes.data as unknown as SaleWithVehicle[]);
      if (vehRes.data) setVehicles(vehRes.data as Vehicle[]);
      setLoading(false);
    }
    load();
  }, [dealer]);

  async function loadData() {
    if (!dealer) return;
    const { data } = await supabase
      .from('sales')
      .select('*, vehicle:vehicles(id, brand, model, year_model, year_manufacture)')
      .eq('dealer_id', dealer.id)
      .order('sale_date', { ascending: false });
    if (data) setSales(data as unknown as SaleWithVehicle[]);
  }

  function openModal(sale?: Sale) {
    if (sale) {
      setEditSale(sale);
      setVehicleId(sale.vehicle_id || '');
      setClientName(sale.client_name || '');
      setClientPhone(sale.client_phone || '');
      setSalePrice(sale.sale_price?.toString() || '');
      setPurchasePrice(sale.purchase_price?.toString() || '');
      setPaymentMethod(sale.payment_method || '');
      setSaleDate(sale.sale_date || new Date().toISOString().split('T')[0]);
      setNotes(sale.notes || '');
    } else {
      setEditSale(null);
      setVehicleId('');
      setClientName('');
      setClientPhone('');
      setSalePrice('');
      setPurchasePrice('');
      setPaymentMethod('');
      setSaleDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setShowModal(true);
  }

  function handleSelectVehicle(vId: string) {
    setVehicleId(vId);
    const v = vehicles.find((v) => v.id === vId);
    if (v) {
      setPurchasePrice(v.purchase_price?.toString() || '');
      if (!salePrice) setSalePrice(v.asking_price?.toString() || '');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealer) return;
    setError(null);
    setSaving(true);

    if (!salePrice || parseFloat(salePrice) <= 0) {
      setError('Valor de venda é obrigatório');
      setSaving(false);
      return;
    }

    const sp = parseFloat(salePrice);
    const pp = parseFloat(purchasePrice) || 0;
    const profit = sp - pp;

    const payload = {
      dealer_id: dealer.id,
      vehicle_id: vehicleId || null,
      client_name: clientName || null,
      client_phone: clientPhone || null,
      sale_price: sp,
      purchase_price: pp,
      profit,
      payment_method: paymentMethod || null,
      sale_date: saleDate,
      notes: notes || null,
    };

    if (editSale) {
      const { error } = await supabase.from('sales').update(payload).eq('id', editSale.id);
      if (error) { console.error('Erro ao salvar venda:', error); setError('Não foi possível salvar a venda. Verifique os dados e tente novamente.'); setSaving(false); return; }
      // If vehicle, mark as sold
      if (vehicleId) {
        await supabase.from('vehicles').update({ status: 'sold' }).eq('id', vehicleId);
      }
    } else {
      const { error } = await supabase.from('sales').insert(payload);
      if (error) { console.error('Erro ao registrar venda:', error); setError('Não foi possível registrar a venda. Verifique os dados e tente novamente.'); setSaving(false); return; }
      if (vehicleId) {
        await supabase.from('vehicles').update({ status: 'sold' }).eq('id', vehicleId);
      }
    }

    setSaving(false);
    setShowModal(false);
    await loadData();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (error) { console.error('Erro ao excluir venda:', error); setError('Não foi possível excluir a venda. Tente novamente.'); return; }
    setSales((prev) => prev.filter((s) => s.id !== id));
    setDeleteId(null);
  }

  const totalRevenue = sales.reduce((s, sale) => s + Number(sale.sale_price), 0);
  const totalProfit = sales.reduce((s, sale) => s + Number(sale.profit || 0), 0);
  const totalCost = sales.reduce((s, sale) => s + Number(sale.purchase_price), 0);
  const avgMargin = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-down">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-success-400" style={{ boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
            <span className="text-xs font-semibold text-success-400 uppercase tracking-wider">Vendas Diretas</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Vendas</h1>
          <p className="text-navy-300 text-sm mt-1">Registro de vendas e controle de lucro</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 text-sm group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Registrar venda
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Receita total', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-white', grad: 'from-accent-500/15 to-transparent' },
          { label: 'Lucro total', value: formatCurrency(totalProfit), icon: TrendingUp, color: totalProfit >= 0 ? 'text-success-400' : 'text-error-400', grad: 'from-success-500/15 to-transparent' },
          { label: 'Custo total', value: formatCurrency(totalCost), icon: Car, color: 'text-gold-400', grad: 'from-gold-500/15 to-transparent' },
          { label: 'Margem média', value: `${avgMargin.toFixed(1)}%`, icon: TrendingUp, color: avgMargin >= 0 ? 'text-success-400' : 'text-error-400', grad: 'from-navy-400/15 to-transparent' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="group relative glass-card rounded-2xl p-5 hover-lift-sm card-glow overflow-hidden animate-fade-in-up spotlight" style={{ animationDelay: `${i * 60}ms` }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon size={18} className={stat.color} />
                </div>
                <p className="text-xl font-extrabold text-white">{stat.value}</p>
                <p className="text-sm text-navy-300 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales list */}
      {sales.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center hover-lift animate-fade-in-scale">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-success-500/20 blur-2xl rounded-full animate-breathe" />
            <TrendingUp size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">Nenhuma venda registrada</p>
          <p className="text-sm text-navy-400 mt-1">Registre suas vendas para acompanhar o lucro</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium text-sm transition-all border border-accent-500/20 group hover:scale-105 duration-300"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            Registrar primeira venda
          </button>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
          <div className="divide-y divide-navy-600/20">
            {sales.map((sale, i) => (
              <div
                key={sale.id}
                className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 hover:bg-navy-700/20 transition-all animate-fade-in hover:pl-5"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">
                    {sale.vehicle ? `${sale.vehicle.brand} ${sale.vehicle.model}` : 'Venda direta'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-navy-400">
                    {sale.vehicle && (
                      <span className="flex items-center gap-1">
                        <Car size={12} /> {sale.vehicle.year_model || sale.vehicle.year_manufacture || '—'}
                      </span>
                    )}
                    {sale.client_name && <span className="flex items-center gap-1"><User size={12} /> {sale.client_name}</span>}
                    {sale.payment_method && <span className="flex items-center gap-1"><DollarSign size={12} /> {sale.payment_method}</span>}
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(sale.sale_date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-navy-400">Venda</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(sale.sale_price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-navy-400">Lucro</p>
                    <p className={`text-sm font-bold ${Number(sale.profit) >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                      {formatCurrency(sale.profit)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openModal(sale)} className="p-2 rounded-lg text-navy-400 hover:bg-accent-500/15 hover:text-accent-400 transition-all hover:scale-110 active:scale-95">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(sale.id)} className="p-2 rounded-lg text-navy-400 hover:bg-error-500/15 hover:text-error-400 transition-all hover:scale-110 active:scale-95">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="glass-strong rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-drop-in border border-navy-600/30 relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
            <div className="relative flex items-center justify-between p-6 border-b border-navy-600/20">
              <h2 className="text-lg font-bold text-white">{editSale ? 'Editar venda' : 'Registrar venda'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-navy-300 hover:bg-navy-700/50 hover:text-white transition-all hover:scale-110 active:scale-95">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Veículo (opcional)</label>
                <select
                  value={vehicleId}
                  onChange={(e) => handleSelectVehicle(e.target.value)}
                  className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                >
                  <option value="">Venda sem veículo cadastrado</option>
                  {vehicles.filter((v) => v.status !== 'sold').map((v) => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate || 'Sem placa'}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Nome do cliente</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nome" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Telefone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(16) 99999-9999" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Valor de venda *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                    <input type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="0,00" required className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Custo do carro</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                    <input type="number" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="0,00" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                  </div>
                </div>
              </div>

              {/* Live profit preview */}
              {salePrice && (
                <div className="p-4 bg-navy-900/50 rounded-xl border border-navy-600/30 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-navy-400">Lucro</p>
                    <p className={`text-sm font-bold ${(parseFloat(salePrice) - (parseFloat(purchasePrice) || 0)) >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                      {formatCurrency(parseFloat(salePrice) - (parseFloat(purchasePrice) || 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400">Margem</p>
                    <p className={`text-sm font-bold ${((parseFloat(salePrice) - (parseFloat(purchasePrice) || 0)) / (parseFloat(purchasePrice) || 1)) * 100 >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                      {parseFloat(purchasePrice) > 0
                        ? `${(((parseFloat(salePrice) - parseFloat(purchasePrice)) / parseFloat(purchasePrice)) * 100).toFixed(1)}%`
                        : '—'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Forma de pagamento</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500">
                    <option value="">Selecione</option>
                    {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Data da venda</label>
                  <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 [color-scheme:dark]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Observações</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notas..." className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 resize-none" />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/40 text-sm font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-shine flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {editSale ? 'Salvar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full animate-drop-in border border-navy-600/30 relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-error-400/60 to-transparent" />
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-error-500/30 blur-xl rounded-xl animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-error-500/15 flex items-center justify-center">
                <Trash2 size={24} className="text-error-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Excluir venda?</h3>
            <p className="text-sm text-navy-300 mt-2 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all hover:scale-105 active:scale-95">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-shine ripple-btn flex items-center gap-2 bg-error-500 hover:bg-error-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-error-500/20 hover:shadow-error-500/40 hover:-translate-y-0.5">
                <Trash2 size={16} /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
