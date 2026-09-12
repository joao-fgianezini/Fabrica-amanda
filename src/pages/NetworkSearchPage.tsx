import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Car, MapPin, Filter, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type Dealer, type VehiclePhoto } from '@/lib/supabase';
import { formatCurrency, formatNumber, statusLabel, statusColor } from '@/lib/format';

type NetworkVehicle = Omit<Vehicle, 'purchase_price' | 'min_price' | 'profit_margin' | 'plate' | 'chassis'> & {
  dealer_name: string | null;
  dealer_city: string | null;
  dealer_state: string | null;
  dealer_logo_url: string | null;
  dealer_phone: string | null;
  dealer_whatsapp: string | null;
};

type PublicDealer = Pick<Dealer, 'id' | 'name' | 'city' | 'state' | 'logo_url' | 'phone' | 'whatsapp'>;

type SearchResult = NetworkVehicle & { dealer: PublicDealer; photos: VehiclePhoto[] };

export function NetworkSearchPage() {
  const { dealer } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      // `network_vehicles` is the public projection of the stock: it deliberately
      // omits cost, floor price, margin, plate and chassis of other dealers.
      const { data, error } = await supabase
        .from('network_vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error(error);
        setLoading(false);
        return;
      }

      const rows = data as unknown as NetworkVehicle[];
      const ids = rows.map((v) => v.id);
      const photosByVehicle = new Map<string, VehiclePhoto[]>();

      if (ids.length > 0) {
        const { data: photoData } = await supabase
          .from('vehicle_photos')
          .select('*')
          .in('vehicle_id', ids);
        for (const p of (photoData || []) as VehiclePhoto[]) {
          const list = photosByVehicle.get(p.vehicle_id) || [];
          list.push(p);
          photosByVehicle.set(p.vehicle_id, list);
        }
      }

      const merged: SearchResult[] = rows.map((v) => ({
        ...v,
        dealer: {
          id: v.dealer_id,
          name: v.dealer_name,
          city: v.dealer_city,
          state: v.dealer_state,
          logo_url: v.dealer_logo_url,
          phone: v.dealer_phone,
          whatsapp: v.dealer_whatsapp,
        } as PublicDealer,
        photos: photosByVehicle.get(v.id) || [],
      }));

      setResults(merged);
      setBrands([...new Set(merged.map((v) => v.brand))].sort());
      setLoading(false);
    }
    load();
  }, []);

  const filtered = results.filter((v) => {
    if (dealer && v.dealer_id === dealer.id) return false;
    const s = search.toLowerCase();
    const matchesSearch = !s || `${v.brand} ${v.model} ${v.color || ''}`.toLowerCase().includes(s);
    const matchesBrand = !brandFilter || v.brand === brandFilter;
    const matchesMin = !minPrice || v.asking_price >= parseFloat(minPrice);
    const matchesMax = !maxPrice || v.asking_price <= parseFloat(maxPrice);
    const matchesYear = !yearFilter || v.year_model === parseInt(yearFilter) || v.year_manufacture === parseInt(yearFilter);
    return matchesSearch && matchesBrand && matchesMin && matchesMax && matchesYear;
  });

  const hasActiveFilters = !!(brandFilter || minPrice || maxPrice || yearFilter);
  function clearFilters() { setBrandFilter(''); setMinPrice(''); setMaxPrice(''); setYearFilter(''); }

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
      <div className="mb-8 animate-fade-in-down">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gold-400/30 blur-md rounded-full" />
            <Sparkles size={16} className="relative text-gold-400" />
          </div>
          <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Rede de Lojistas</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Buscar na <span className="gradient-text">Rede</span></h1>
        <p className="text-navy-300 text-sm mt-1">{filtered.length} veículo(s) disponível(is) de outros lojistas</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-4 animate-fade-in">
        <div className="relative group flex-1 input-anim">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 group-focus-within:scale-110 transition-all" />
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por marca, modelo ou cor..."
            className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`ripple-btn flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
            showFilters || hasActiveFilters
              ? 'bg-accent-500/15 text-accent-300 border border-accent-500/30'
              : 'glass border border-navy-600/30 text-navy-200 hover:bg-navy-600/20'
          }`}
        >
          <Filter size={16} /> Filtros
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="glass-card rounded-2xl p-5 mb-6 animate-drop-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Marca</label>
              <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500">
                <option value="">Todas</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Preço mínimo</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="R$" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Preço máximo</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="R$" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Ano</label>
              <input type="number" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} placeholder="Ex: 2020" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 mt-3 text-xs text-navy-300 hover:text-white transition-colors">
              <X size={14} /> Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center hover-lift animate-fade-in-scale">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-accent-500/20 blur-2xl rounded-full animate-breathe" />
            <Car size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">
            {results.length === 0 ? 'Nenhum veículo na rede ainda' : 'Nenhum resultado'}
          </p>
          <p className="text-sm text-navy-400 mt-1">
            {results.length === 0 ? 'Quando outros lojistas cadastrarem carros, eles aparecem aqui' : 'Tente ajustar os filtros'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v, i) => {
            const cover = v.photos?.find((p) => p.is_cover) || v.photos?.[0];
            const waNumber = v.dealer?.whatsapp || v.dealer?.phone || '';
            const waDigits = waNumber.replace(/\D/g, '');
            const waMsg = `Olá! Tenho interesse no veículo *${v.brand} ${v.model}* (${v.year_model || v.year_manufacture || '—'}) anunciado na Rede Auto Ribeirão no valor de ${formatCurrency(v.asking_price)}. Gostaria de negociar.`;
            const waLink = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waMsg)}` : '#';
            return (
              <div
                key={v.id}
                className="group glass-card rounded-2xl overflow-hidden hover-lift card-glow-strong animate-fade-in-up spotlight"
                style={{ animationDelay: `${i * 50}ms` }}
                onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}
              >
                <Link to={`/veiculo/${v.id}`}>
                  <div className="relative h-40 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center overflow-hidden img-zoom">
                    <div className="absolute inset-0 bg-grid opacity-20" />
                    {cover ? (
                      <img src={cover.url} alt={`${v.brand} ${v.model}`} className="relative w-full h-full object-cover" />
                    ) : (
                      <Car size={36} className="relative text-navy-500 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500" />
                    )}
                    {/* Hover overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium backdrop-blur-sm ${statusColor(v.status)}`}>
                        {statusLabel(v.status)}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/veiculo/${v.id}`}>
                    <p className="text-white font-bold truncate group-hover:text-accent-300 transition-colors">{v.brand} {v.model}</p>
                    <p className="text-xs text-navy-300 mt-0.5">
                      {v.year_model || v.year_manufacture || '—'} · {v.color || '—'}
                    </p>
                  </Link>

                  <Link to={`/lojista/${v.dealer?.id}`} className="flex items-center gap-1.5 mt-3 text-xs text-navy-300 hover:text-accent-300 transition-colors group/dealer">
                    <MapPin size={12} className="text-accent-400 flex-shrink-0 group-hover/dealer:scale-125 transition-transform" />
                    <span className="truncate font-medium group-hover/dealer:underline">{v.dealer?.name || 'Lojista'}</span>
                    {v.dealer?.city && v.dealer?.state && (
                      <span className="text-navy-400 truncate">· {v.dealer.city}/{v.dealer.state}</span>
                    )}
                  </Link>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-navy-600/30 text-xs">
                    <div>
                      <p className="text-navy-400">Venda</p>
                      <p className="text-white font-bold group-hover:text-accent-300 transition-colors">{formatCurrency(v.asking_price)}</p>
                    </div>
                    <div>
                      <p className="text-navy-400">KM</p>
                      <p className="text-navy-200 font-medium">{v.mileage !== null ? `${formatNumber(v.mileage)} km` : '—'}</p>
                    </div>
                  </div>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-shine mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 text-xs group/btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="group-hover/btn:scale-110 transition-transform">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Negociar no WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
