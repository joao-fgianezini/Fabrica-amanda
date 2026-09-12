import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Search, Pencil, Trash2, AlertCircle, Eye, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type VehiclePhoto } from '@/lib/supabase';
import { formatCurrency, formatNumber, statusLabel, statusColor } from '@/lib/format';

export function MyStockPage() {
  const { dealer } = useAuth();
  const [vehicles, setVehicles] = useState<(Vehicle & { photos?: VehiclePhoto[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('available');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, photos:vehicle_photos(*)')
        .eq('dealer_id', dealer.id)
        .order('created_at', { ascending: false });
      if (error) { console.error('Erro ao carregar estoque:', error); setError('Não foi possível carregar o estoque. Tente novamente.'); }
      else setVehicles(data as (Vehicle & { photos?: VehiclePhoto[] })[]);
      setLoading(false);
    }
    load();
  }, [dealer]);

  async function handleDelete(id: string) {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) { console.error('Erro ao excluir veículo:', error); setError('Não foi possível excluir o veículo. Tente novamente.'); return; }
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    setDeleteId(null);
  }

  const filtered = vehicles.filter((v) => {
    const matchesSearch = !search || `${v.brand} ${v.model} ${v.color || ''} ${v.plate || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <div className="relative">
              <div className="absolute inset-0 bg-accent-400/30 blur-md rounded-full" />
              <div className="relative w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            </div>
            <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Seu Inventário</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Meu <span className="gradient-text">Estoque</span></h1>
          <p className="text-navy-300 text-sm mt-1">{vehicles.filter((v) => v.status !== 'sold').length} veículo(s) em estoque · {vehicles.filter((v) => v.status === 'sold').length} vendido(s)</p>
        </div>
        <Link
          to="/veiculo/novo"
          className="btn-shine btn-sheen ripple-btn group flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 text-sm"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Cadastrar veículo
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
        <div className="relative group flex-1 input-anim">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 group-focus-within:scale-110 transition-all" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por marca, modelo, cor ou placa..."
            className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm"
          />
        </div>
        <div className="relative input-anim">
          <SlidersHorizontal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass border border-navy-600/30 rounded-xl pl-9 pr-8 py-3 text-white focus:outline-none focus:border-accent-500 text-sm appearance-none cursor-pointer transition-all"
          >
            <option value="all">Todos os status</option>
            <option value="available">Disponíveis</option>
            <option value="reserved">Reservados</option>
            <option value="sold">Vendidos</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center hover-lift animate-fade-in-scale">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-accent-500/20 blur-2xl rounded-full animate-breathe" />
            <Car size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">
            {vehicles.length === 0 ? 'Seu estoque está vazio' : 'Nenhum resultado'}
          </p>
          <p className="text-sm text-navy-400 mt-1">
            {vehicles.length === 0 ? 'Cadastre seu primeiro veículo para começar' : 'Tente ajustar os filtros de busca'}
          </p>
          {vehicles.length === 0 && (
            <Link
              to="/veiculo/novo"
              className="btn-shine inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium text-sm transition-all border border-accent-500/20 group hover:scale-105 duration-300"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              Cadastrar primeiro veículo
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v, i) => (
            <div
              key={v.id}
              className="group glass-card rounded-2xl overflow-hidden hover-lift card-glow-strong animate-fade-in-up spotlight"
              style={{ animationDelay: `${i * 50}ms` }}
              onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}
            >
              <Link to={`/veiculo/${v.id}`} className="block relative h-36 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center overflow-hidden img-zoom">
                <div className="absolute inset-0 bg-grid opacity-20" />
                {(() => { const cover = v.photos?.find((p) => p.is_cover) || v.photos?.[0]; return cover ? (
                  <img src={cover.url} alt={`${v.brand} ${v.model}`} className="relative w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <Car size={36} className="relative text-navy-500 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500" />
                ); })()}
                <div className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full border font-medium backdrop-blur-sm ${statusColor(v.status)}`}>
                  {statusLabel(v.status)}
                </div>
                {/* Bottom gradient overlay on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-navy-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
              <div className="p-4">
                <p className="text-white font-bold truncate group-hover:text-accent-300 transition-colors">{v.brand} {v.model}</p>
                <p className="text-xs text-navy-300 mt-0.5">
                  {v.year_model || v.year_manufacture || '—'} · {v.color || '—'}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-navy-600/30 text-xs">
                  <div>
                    <p className="text-navy-400">Venda</p>
                    <p className="text-white font-semibold group-hover:text-accent-300 transition-colors">{formatCurrency(v.asking_price)}</p>
                  </div>
                  <div>
                    <p className="text-navy-400">Custo</p>
                    <p className="text-navy-200 font-medium">{formatCurrency(v.purchase_price)}</p>
                  </div>
                  {v.mileage !== null && (
                    <div className="col-span-2">
                      <p className="text-navy-400">KM</p>
                      <p className="text-navy-200 font-medium">{formatNumber(v.mileage)} km</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Link
                    to={`/veiculo/${v.id}`}
                    className="ripple-btn flex-1 flex items-center justify-center gap-1.5 glass hover:bg-navy-600/30 text-navy-200 hover:text-white text-xs font-medium py-2 rounded-lg transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Eye size={14} /> Ver
                  </Link>
                  <Link
                    to={`/veiculo/${v.id}/editar`}
                    className="flex items-center justify-center glass hover:bg-accent-500/20 text-navy-200 hover:text-accent-400 p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => setDeleteId(v.id)}
                    className="flex items-center justify-center glass hover:bg-error-500/20 text-navy-200 hover:text-error-400 p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full animate-drop-in border border-navy-600/30 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-error-400/60 to-transparent" />
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-error-500/30 blur-xl rounded-xl animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-error-500/15 flex items-center justify-center">
                <Trash2 size={24} className="text-error-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Excluir veículo?</h3>
            <p className="text-sm text-navy-300 mt-2 mb-6">Esta ação não pode ser desfeita. Todos os dados e fotos serão removidos permanentemente.</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all hover:scale-105 active:scale-95">
                Cancelar
              </button>
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
