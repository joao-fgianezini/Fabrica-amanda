import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Building2, Calendar, Car, MessageCircle, ArrowLeft, Store, BadgeCheck, TrendingUp, Sparkles, Share2, ExternalLink } from 'lucide-react';
import { supabase, type Dealer, type Vehicle, type VehiclePhoto } from '@/lib/supabase';
import { formatCurrency, formatNumber, statusLabel, statusColor } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';

type DealerVehicle = Vehicle & { photos: VehiclePhoto[] };

export function DealerProfilePage() {
  const { id } = useParams();
  const { dealer: currentDealer } = useAuth();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [vehicles, setVehicles] = useState<DealerVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      // Own profile comes from the table; other dealerships come from the public
      // projection, which omits the registration number, email and address.
      const ownRes = await supabase
        .from('dealers')
        .select('*')
        .eq('id', id!)
        .maybeSingle();

      let dealerData = ownRes.data as Dealer | null;
      let dealerErr = ownRes.error;

      if (!dealerData) {
        const publicRes = await supabase
          .from('public_dealers')
          .select('*')
          .eq('id', id!)
          .maybeSingle();
        dealerData = publicRes.data as unknown as Dealer | null;
        dealerErr = publicRes.error;
      }

      if (dealerErr || !dealerData) {
        setError('Lojista não encontrado');
        setLoading(false);
        return;
      }

      setDealer(dealerData);

      const { data: vehicleData } = await supabase
        .from('network_vehicles')
        .select('*')
        .eq('dealer_id', id!)
        .order('created_at', { ascending: false });

      const rows = (vehicleData || []) as unknown as Vehicle[];
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

      setVehicles(rows.map((v) => ({ ...v, photos: photosByVehicle.get(v.id) || [] })) as DealerVehicle[]);
      setLoading(false);
    }
    load();
  }, [id]);

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: dealer?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

  if (error || !dealer) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-scale-in">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-error-500/20 blur-2xl rounded-full" />
          <Store size={48} className="relative text-navy-500" />
        </div>
        <p className="text-navy-200 text-lg font-medium">{error || 'Lojista não encontrado'}</p>
        <Link to="/rede" className="inline-flex items-center gap-2 mt-4 text-accent-400 hover:text-accent-300 text-sm font-medium group transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar para a Rede
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentDealer?.id === dealer.id;
  const waNumber = dealer.whatsapp || dealer.phone || '';
  const waDigits = waNumber.replace(/\D/g, '');
  const waMsg = `Olá! Encontrei seu perfil na Rede Auto Ribeirão e gostaria de conversar sobre veículos.`;
  const waLink = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waMsg)}` : '#';

  const coverPhoto = (v: DealerVehicle) => v.photos?.find((p) => p.is_cover)?.url || v.photos?.[0]?.url;

  const avgPrice = vehicles.length > 0
    ? vehicles.reduce((sum, v) => sum + Number(v.asking_price), 0) / vehicles.length
    : 0;

  const stats = [
    { label: 'Veículos', value: vehicles.length.toString(), icon: Car, color: 'text-accent-400', bg: 'from-accent-500/15 to-transparent' },
    { label: 'Menor preço', value: vehicles.length > 0 ? formatCurrency(Math.min(...vehicles.map((v) => v.asking_price))) : '—', icon: TrendingUp, color: 'text-success-400', bg: 'from-success-500/15 to-transparent' },
    { label: 'Maior preço', value: vehicles.length > 0 ? formatCurrency(Math.max(...vehicles.map((v) => v.asking_price))) : '—', icon: TrendingUp, color: 'text-gold-400', bg: 'from-gold-500/15 to-transparent' },
    { label: 'Preço médio', value: vehicles.length > 0 ? formatCurrency(avgPrice) : '—', icon: TrendingUp, color: 'text-accent-300', bg: 'from-accent-500/15 to-transparent' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back link */}
      <Link to="/rede" className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors group animate-fade-in">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar para a Rede
      </Link>

      {/* === Profile Header Card === */}
      <div className="relative glass-card rounded-3xl overflow-hidden animate-fade-in-down mb-8 aurora-bg">
        {/* Banner with cover image or animated mesh gradient */}
        <div className="relative h-40 sm:h-48 overflow-hidden">
          {dealer.cover_url ? (
            <>
              <img src={dealer.cover_url} alt="Capa" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 mesh-gradient" />
              <div className="absolute inset-0 bg-grid opacity-30" />
              {/* Floating orbs */}
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-accent-500/15 rounded-full blur-[60px] animate-float" />
              <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-gold-400/10 rounded-full blur-[50px] animate-float-slow" style={{ animationDelay: '2s' }} />
              {/* Sheen effect */}
              <div className="absolute inset-0 shimmer-effect" />
              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-navy-900/80 to-transparent" />
            </>
          )}
        </div>

        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-14">
            {/* Avatar with glow ring */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-accent-500/30 to-gold-400/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-500" />
              {dealer.logo_url ? (
                <img src={dealer.logo_url} alt={dealer.name} className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-navy-900 object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-navy-900 bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  {dealer.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success-400 border-3 border-navy-900 flex items-center justify-center animate-pulse" style={{ borderWidth: '3px' }}>
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate">{dealer.name}</h1>
                {dealer.cnpj && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-500/15 border border-accent-500/30">
                    <BadgeCheck size={14} className="text-accent-400" />
                    <span className="text-xs font-medium text-accent-300">Verificado</span>
                  </div>
                )}
              </div>
              {(dealer.city || dealer.state) && (
                <p className="text-sm text-navy-300 flex items-center gap-1.5 mt-1.5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <MapPin size={14} className="text-accent-400" />
                  {dealer.city ? `${dealer.city}` : ''}{dealer.city && dealer.state ? ' / ' : ''}{dealer.state || ''}
                  <span className="text-navy-500">·</span>
                  <span className="text-navy-400">Lojista da Rede Auto Ribeirão</span>
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-navy-600/30 text-navy-200 hover:text-white text-sm font-medium transition-all duration-300 group"
              >
                {copied ? <Sparkles size={16} className="text-success-400" /> : <Share2 size={16} className="group-hover:scale-110 transition-transform" />}
                {copied ? 'Copiado!' : 'Compartilhar'}
              </button>
              {isOwnProfile ? (
                <Link
                  to="/perfil/editar"
                  className="btn-shine flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-accent-500/20"
                >
                  Editar perfil
                </Link>
              ) : (
                waDigits.length > 0 && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-shine flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 text-sm group"
                  >
                    <MessageCircle size={16} className="group-hover:scale-110 transition-transform" /> Contatar
                  </a>
                )
              )}
            </div>
          </div>

          {/* Contact info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-navy-600/30">
            {dealer.phone && (
              <div className="flex items-center gap-2.5 text-sm group hover:bg-navy-700/20 -mx-2 px-2 py-1.5 rounded-lg transition-colors animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Phone size={14} className="text-accent-400" />
                </div>
                <span className="text-navy-200 truncate">{dealer.phone}</span>
              </div>
            )}
            {dealer.email && (
              <div className="flex items-center gap-2.5 text-sm group hover:bg-navy-700/20 -mx-2 px-2 py-1.5 rounded-lg transition-colors animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mail size={14} className="text-accent-400" />
                </div>
                <span className="text-navy-200 truncate">{dealer.email}</span>
              </div>
            )}
            {dealer.cnpj && (
              <div className="flex items-center gap-2.5 text-sm group hover:bg-navy-700/20 -mx-2 px-2 py-1.5 rounded-lg transition-colors animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 size={14} className="text-accent-400" />
                </div>
                <span className="text-navy-200 truncate">CNPJ {dealer.cnpj}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm group hover:bg-navy-700/20 -mx-2 px-2 py-1.5 rounded-lg transition-colors animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Calendar size={14} className="text-accent-400" />
              </div>
              <span className="text-navy-200">Desde {new Date(dealer.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {dealer.address && (
            <div className="flex items-center gap-2 text-sm mt-3 animate-fade-in" style={{ animationDelay: '0.35s' }}>
              <MapPin size={16} className="text-navy-400 flex-shrink-0" />
              <span className="text-navy-200">{dealer.address}</span>
            </div>
          )}

          {dealer.description && (
            <div className="mt-4 p-4 rounded-xl glass animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <p className="text-sm text-navy-200 leading-relaxed">{dealer.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* === Animated Stats === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative glass-card rounded-2xl p-5 hover-lift-sm card-glow overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon size={18} className={stat.color} />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{stat.value}</p>
                <p className="text-xs text-navy-400 uppercase tracking-wide mt-1 font-medium">{stat.label}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          );
        })}
      </div>

      {/* === Vehicles Section === */}
      <div className="mb-6 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
          Veículos disponíveis
          {vehicles.length > 0 && <span className="text-sm text-navy-400 font-normal">({vehicles.length})</span>}
        </h2>
      </div>

      {vehicles.length === 0 ? (
        <div className="glass rounded-2xl border border-dashed border-navy-600/40 p-16 text-center animate-scale-in hover-lift">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-accent-500/15 blur-2xl rounded-full animate-pulse" />
            <Car size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">Nenhum veículo disponível</p>
          <p className="text-sm text-navy-400 mt-1">Este lojista ainda não publicou veículos na rede.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vehicles.map((v, i) => {
            const photo = coverPhoto(v);
            return (
              <Link
                key={v.id}
                to={`/veiculo/${v.id}`}
                className="group glass-card rounded-2xl overflow-hidden hover-lift card-glow-strong animate-fade-in-up spotlight"
                style={{ animationDelay: `${i * 60}ms` }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`);
                }}
              >
                <div className="relative h-40 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center overflow-hidden">
                  {photo ? (
                    <img src={photo} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  ) : (
                    <Car size={36} className="text-navy-500 group-hover:scale-125 transition-transform duration-500" />
                  )}
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(v.status)} backdrop-blur-sm`}>
                    {statusLabel(v.status)}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-white font-bold truncate group-hover:text-accent-300 transition-colors">{v.brand} {v.model}</p>
                  <p className="text-xs text-navy-300 mt-0.5">
                    {v.year_model || v.year_manufacture || '—'} · {v.color || '—'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-navy-600/30 text-xs">
                    <div>
                      <p className="text-navy-400">Venda</p>
                      <p className="text-white font-bold group-hover:text-accent-300 transition-colors">{formatCurrency(v.asking_price)}</p>
                    </div>
                    <div>
                      <p className="text-navy-400">KM</p>
                      <p className="text-navy-200 font-medium">{v.mileage !== null ? `${formatNumber(v.mileage)} km` : '—'}</p>
                    </div>
                  </div>
                  {/* Arrow indicator */}
                  <div className="flex items-center gap-1 mt-3 text-xs text-accent-400 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                    <span>Ver detalhes</span>
                    <ExternalLink size={12} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
