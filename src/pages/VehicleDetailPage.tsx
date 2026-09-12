import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Car, Fuel, Gauge, Cog, Calendar, Palette,
  DoorOpen, FileText, Phone, MapPin, CircleDollarSign,
  TrendingUp, AlertCircle, ShieldCheck, Calculator, X,
  Globe, RefreshCw, CheckCircle2, Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type Dealer, type VehiclePhoto, type FinancingSimulationWithDetails, type ExternalListing } from '@/lib/supabase';
import { formatCurrency, formatDate, formatMileage, statusLabel, statusColor } from '@/lib/format';
import { loadExternalListings, publishToPlatform, unpublishFromPlatform } from '@/lib/integrations';

type VehicleDetails = Vehicle & { dealer: Dealer; photos: VehiclePhoto[] };

export function VehicleDetailPage() {
  const { id } = useParams();
  const { dealer } = useAuth();
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [financingSims, setFinancingSims] = useState<FinancingSimulationWithDetails[]>([]);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const photoCount = vehicle?.photos?.length ?? 0;
  const nextPhoto = useCallback(() => setActivePhoto((p) => (p + 1) % Math.max(photoCount, 1)), [photoCount]);
  const prevPhoto = useCallback(() => setActivePhoto((p) => (p - 1 + Math.max(photoCount, 1)) % Math.max(photoCount, 1)), [photoCount]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, closeLightbox, nextPhoto, prevPhoto]);

  useEffect(() => {
    async function load() {
      if (!id) return;
      // Own vehicles come from the table (full record). Other dealers' vehicles come
      // from the public projection, which omits cost, floor price, margin, plate and chassis.
      const ownRes = await supabase
        .from('vehicles')
        .select(`*, dealer:dealers(*), photos:vehicle_photos(*)`)
        .eq('id', id)
        .maybeSingle();

      let details = ownRes.data as unknown as VehicleDetails | null;

      if (!details) {
        const netRes = await supabase
          .from('network_vehicles')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (netRes.data) {
          const row = netRes.data as Record<string, unknown>;
          const { data: photoData } = await supabase
            .from('vehicle_photos')
            .select('*')
            .eq('vehicle_id', id);
          details = {
            ...(row as unknown as VehicleDetails),
            dealer: {
              id: row.dealer_id,
              name: row.dealer_name,
              city: row.dealer_city,
              state: row.dealer_state,
              logo_url: row.dealer_logo_url,
              phone: row.dealer_phone,
              whatsapp: row.dealer_whatsapp,
            },
            photos: (photoData || []),
          } as unknown as VehicleDetails;
        }
      }

      if (!details) { setError('Veículo não encontrado'); setLoading(false); return; }
      setVehicle(details);
      const photos = details.photos || [];
      setActivePhoto(photos.findIndex((p) => p.is_cover) >= 0 ? photos.findIndex((p) => p.is_cover) : 0);

      // Load financing simulations for this vehicle (owner only)
      if (dealer?.id === details.dealer_id) {
        const { data: simData } = await supabase
          .from('financing_simulations')
          .select(`*, client:clients(id, name, phone, document), offers:financing_offers(*, institution:financing_institutions(*))`)
          .eq('vehicle_id', id!)
          .order('created_at', { ascending: false });
        if (simData) setFinancingSims(simData as unknown as FinancingSimulationWithDetails[]);
      }

      setLoading(false);
    }
    load();
  }, [id]);

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

  if (error || !vehicle) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <AlertCircle size={40} className="text-navy-500 mx-auto mb-3" />
        <p className="text-navy-300 mb-4">{error || 'Veículo não encontrado'}</p>
        <Link to="/rede" className="text-accent-400 hover:text-accent-300 font-medium text-sm">Voltar para a rede</Link>
      </div>
    );
  }

  const isOwn = dealer?.id === vehicle.dealer_id;
  const photos = vehicle.photos || [];
  const purchasePrice = Number(vehicle.purchase_price);
  const askingPrice = Number(vehicle.asking_price);
  const minPrice = Number(vehicle.min_price || 0);
  const profitValue = askingPrice - purchasePrice;
  const profitMargin = vehicle.profit_margin ?? (purchasePrice > 0 ? ((askingPrice - purchasePrice) / purchasePrice) * 100 : 0);
  const minProfit = minPrice > 0 ? minPrice - purchasePrice : 0;
  const waNumber = vehicle.dealer?.whatsapp || vehicle.dealer?.phone || '';
  const waDigits = waNumber.replace(/\D/g, '');
  const waMsg = `Olá! Tenho interesse no veículo *${vehicle.brand} ${vehicle.model}* (${vehicle.year_model || vehicle.year_manufacture || '—'}, ${vehicle.color || '—'}) anunciado na Rede Auto Ribeirão no valor de ${formatCurrency(vehicle.asking_price)}. Gostaria de negociar.`;
  const whatsappLink = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waMsg)}` : '#';

  const specs = [
    { icon: Calendar, label: 'Ano fabricação', value: vehicle.year_manufacture?.toString() || '—' },
    { icon: Calendar, label: 'Ano modelo', value: vehicle.year_model?.toString() || '—' },
    { icon: Palette, label: 'Cor', value: vehicle.color || '—' },
    { icon: Gauge, label: 'Quilometragem', value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: 'Combustível', value: vehicle.fuel || '—' },
    { icon: Cog, label: 'Câmbio', value: vehicle.transmission || '—' },
    { icon: DoorOpen, label: 'Portas', value: vehicle.doors?.toString() || '—' },
    { icon: FileText, label: 'Placa', value: vehicle.plate || '—' },
    { icon: FileText, label: 'Chassi', value: vehicle.chassis || '—' },
    { icon: Cog, label: 'Motorização', value: vehicle.engine || '—' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Link to={isOwn ? '/estoque' : '/rede'} className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors group animate-fade-in">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Photos + Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">
            <div className="relative h-72 sm:h-96 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center group overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-20" />
              {photos.length > 0 ? (
                <img key={activePhoto} src={photos[activePhoto]?.url} alt={`${vehicle.brand} ${vehicle.model}`} onClick={() => setLightboxOpen(true)} className="relative w-full h-full object-cover cursor-zoom-in animate-photo-reveal" />
              ) : (
                <Car size={56} className="relative text-navy-500 group-hover:scale-110 transition-transform duration-500" />
              )}
              {/* Gradient overlay for better text legibility on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              {photos.length > 1 && (
                <>
                  <button onClick={() => setActivePhoto((p) => (p - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-white hover:bg-accent-500/30 transition-all opacity-0 group-hover:opacity-100 duration-300 hover:scale-110 active:scale-95">
                    <ArrowLeft size={18} />
                  </button>
                  <button onClick={() => setActivePhoto((p) => (p + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-white hover:bg-accent-500/30 transition-all opacity-0 group-hover:opacity-100 duration-300 hover:scale-110 active:scale-95">
                    <ArrowLeft size={18} className="rotate-180" />
                  </button>
                  {/* Photo counter */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full glass-strong text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {activePhoto + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => setActivePhoto(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 animate-thumb-in ${
                      i === activePhoto ? 'border-accent-400 scale-105 shadow-lg shadow-accent-500/20' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
              Especificações
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specs.map((spec, i) => {
                const Icon = spec.icon;
                return (
                  <div key={i} className="group flex items-start gap-2.5 hover:bg-navy-700/25 -mx-2 px-3 py-2 rounded-xl transition-all duration-300 animate-fade-in-up hover:border-accent-500/20 border border-transparent" style={{ animationDelay: `${0.1 + i * 30}ms` }}>
                    <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Icon size={14} className="text-navy-400 group-hover:text-accent-400 transition-colors" />
                    </div>
                    <div className="min-w-0 pt-1">
                      <p className="text-xs text-navy-400 uppercase tracking-wide">{spec.label}</p>
                      <p className="text-sm text-white font-medium truncate group-hover:text-accent-200 transition-colors">{spec.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {vehicle.description && (
              <div className="mt-5 pt-5 border-t border-navy-600/30">
                <h3 className="text-sm font-semibold text-white mb-2">Descrição</h3>
                <p className="text-sm text-navy-200 leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Title card */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up relative overflow-hidden aurora-bg">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/50 to-transparent" />
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-extrabold text-white">{vehicle.brand} {vehicle.model}</h1>
                <p className="text-sm text-navy-300 mt-0.5">
                  {vehicle.year_model || vehicle.year_manufacture || '—'} · {vehicle.color || '—'}
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(vehicle.status)}`}>
                {statusLabel(vehicle.status)}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-navy-600/30">
              <p className="text-3xl font-extrabold text-white">{formatCurrency(askingPrice)}</p>
              <p className="text-xs text-navy-400 mt-1">Valor de venda</p>
            </div>
          </div>

          {/* Financial (owner only) */}
          {isOwn ? (
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                  <CircleDollarSign size={16} className="text-accent-400" />
                </div>
                <h2 className="text-base font-bold text-white">Dados financeiros</h2>
              </div>
              <div className="space-y-3">
                <FinancialRow label="Valor pago (custo)" value={formatCurrency(purchasePrice)} />
                <FinancialRow label="Valor de venda" value={formatCurrency(askingPrice)} highlight />
                {minPrice > 0 && <FinancialRow label="Valor mínimo aceito" value={formatCurrency(minPrice)} />}
                <div className="pt-3 border-t border-navy-600/30 space-y-3">
                  <FinancialRow label="Lucro bruto" value={formatCurrency(profitValue)} color={profitValue >= 0 ? 'text-success-400' : 'text-error-400'} />
                  <FinancialRow label="Margem de lucro" value={`${profitMargin.toFixed(1)}%`} color={profitMargin >= 0 ? 'text-success-400' : 'text-error-400'} />
                  {minPrice > 0 && <FinancialRow label="Lucro no valor mínimo" value={formatCurrency(minProfit)} color={minProfit >= 0 ? 'text-accent-400' : 'text-error-400'} />}
                </div>
              </div>
            </div>
          ) : (
            /* WhatsApp contact card for other dealers' vehicles */
            <div className="relative glass rounded-2xl border border-emerald-500/30 p-6 animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/30 blur-lg rounded-lg" />
                    <ShieldCheck size={20} className="relative text-emerald-400" />
                  </div>
                  <h2 className="text-base font-bold text-white">Tenho interesse</h2>
                </div>
                <p className="text-sm text-navy-200 mb-5">
                  Este veículo pertence a <span className="font-bold text-white">{vehicle.dealer?.name}</span>.
                  Clique no botão abaixo para negociar diretamente via WhatsApp.
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-shine w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 text-sm group"
                >
                  <WhatsAppIcon size={20} className="group-hover:scale-110 transition-transform" />
                  Negociar no WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Dealer info */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-accent-400" style={{ boxShadow: '0 0 6px rgba(74,174,245,0.5)' }} />
              Lojista
            </h2>
            <div className="flex items-center gap-3 mb-3">
              <Link to={`/lojista/${vehicle.dealer?.id}`} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-accent-500/30 to-gold-400/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform duration-300">
                  {vehicle.dealer?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              </Link>
              <div className="flex-1">
                <Link to={`/lojista/${vehicle.dealer?.id}`} className="text-sm font-bold text-white hover:text-accent-300 transition-colors">{vehicle.dealer?.name}</Link>
                <p className="text-xs text-navy-300">Lojista da rede</p>
                {(vehicle.dealer?.city || vehicle.dealer?.state) && (
                  <p className="text-xs text-navy-400 mt-0.5 flex items-center gap-1">
                    <MapPin size={11} />{vehicle.dealer?.city}{vehicle.dealer?.city && vehicle.dealer?.state ? ' / ' : ''}{vehicle.dealer?.state}
                  </p>
                )}
              </div>
            </div>
            {vehicle.dealer?.phone && (
              <div className="flex items-center gap-2 text-sm text-navy-200 mt-3">
                <Phone size={14} className="text-navy-400" /> {vehicle.dealer.phone}
              </div>
            )}
            <Link to={`/lojista/${vehicle.dealer?.id}`} className="inline-flex items-center gap-1.5 mt-4 text-sm text-accent-400 hover:text-accent-300 font-medium transition-colors">
              Ver perfil completo →
            </Link>
            {vehicle.dealer?.address && (
              <div className="flex items-center gap-2 text-sm text-navy-200 mt-2">
                <MapPin size={14} className="text-navy-400" /> {vehicle.dealer.address}
              </div>
            )}
          </div>

          {/* Owner actions */}
          {isOwn && (
            <div className="space-y-3">
              <Link
                to={`/financiamento/novo?veiculo=${vehicle.id}`}
                className="btn-shine flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-accent-500/25 text-sm group"
              >
                <Calculator size={16} className="group-hover:scale-110 transition-transform" /> Simular financiamento
              </Link>
              <Link
                to={`/veiculo/${vehicle.id}/editar`}
                className="btn-shine flex items-center justify-center gap-2 glass border border-navy-600/30 hover:border-accent-500/30 text-white font-semibold py-3 rounded-xl transition-all text-sm group"
              >
                <Pencil size={16} className="group-hover:rotate-12 transition-transform" /> Editar veículo
              </Link>
            </div>
          )}

          <p className="text-xs text-navy-400 text-center">Cadastrado em {formatDate(vehicle.created_at)}</p>
        </div>
      </div>

      {/* Financing history (owner only) */}
      {isOwn && financingSims.length > 0 && (
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Financiamentos ({financingSims.length})
          </h2>
          <div className="space-y-3">
            {financingSims.map((sim, i) => (
              <Link key={sim.id} to={`/financiamento/${sim.id}`} className="group glass rounded-xl border border-navy-600/20 p-4 hover-lift flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                  <Calculator size={18} className="text-accent-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate text-sm">{sim.client?.name || 'Cliente não vinculado'}</p>
                  <p className="text-xs text-navy-400">{formatCurrency(sim.financed_amount)} · {sim.term_months}x · {formatDate(sim.created_at)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${statusColor(sim.status)}`}>
                  {statusLabel(sim.status)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* External listings / multi-channel publishing (owner only) */}
      {isOwn && (
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gold-400" style={{ boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
            Publicação Multicanal
          </h2>
          <ExternalListingsSection vehicleId={vehicle.id} dealerId={vehicle.dealer_id} isSold={vehicle.status === 'sold'} />
        </div>
      )}

      {/* Lightbox - full screen image viewer like OLX */}
      {lightboxOpen && photos.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fade-in" onClick={closeLightbox}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm font-medium">{activePhoto + 1} / {photos.length}</span>
            <button onClick={closeLightbox} className="w-10 h-10 rounded-full glass-strong flex items-center justify-center hover:bg-white/10 transition-all active:scale-90">
              <X size={20} />
            </button>
          </div>

          {/* Image area */}
          <div className="flex-1 flex items-center justify-center px-4 pb-4 relative" onClick={(e) => e.stopPropagation()}>
            {photos.length > 1 && (
              <button onClick={prevPhoto} className="absolute left-4 z-10 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90">
                <ArrowLeft size={22} />
              </button>
            )}
            <img src={photos[activePhoto]?.url} alt={`${vehicle.brand} ${vehicle.model}`} className="max-w-full max-h-full object-contain rounded-lg animate-photo-reveal" />
            {photos.length > 1 && (
              <button onClick={nextPhoto} className="absolute right-4 z-10 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90">
                <ArrowLeft size={22} className="rotate-180" />
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 px-4 pb-4 overflow-x-auto justify-center" onClick={(e) => e.stopPropagation()}>
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => setActivePhoto(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activePhoto ? 'border-accent-400 scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FinancialRow({ label, value, highlight, color }: { label: string; value: string; highlight?: boolean; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-navy-300">{label}</span>
      <span className={`text-sm font-semibold ${color || (highlight ? 'text-white' : 'text-navy-100')}`}>{value}</span>
    </div>
  );
}

function WhatsAppIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

// === External Listings / Multi-channel Publishing ===

const PLATFORMS = [
  { id: 'olx', label: 'OLX', color: '#a855f7' },
  { id: 'instagram', label: 'Instagram', color: '#ec4899' },
  { id: 'facebook', label: 'Facebook', color: '#1877f2' },
  { id: 'webmotors', label: 'Webmotors', color: '#f97316' },
];

function listingStatusInfo(status: string) {
  switch (status) {
    case 'published': return { label: 'Publicado', color: 'text-success-400', dot: 'bg-success-500' };
    case 'syncing': return { label: 'Sincronizando', color: 'text-warning-400', dot: 'bg-warning-500' };
    case 'error': return { label: 'Erro', color: 'text-error-400', dot: 'bg-error-500' };
    case 'paused': return { label: 'Pausado', color: 'text-navy-300', dot: 'bg-navy-500' };
    case 'sold_removed': return { label: 'Removido (vendido)', color: 'text-navy-300', dot: 'bg-navy-600' };
    default: return { label: 'Não publicado', color: 'text-navy-400', dot: 'bg-navy-600' };
  }
}

function ExternalListingsSection({ vehicleId, dealerId, isSold }: { vehicleId: string; dealerId: string; isSold: boolean }) {
  const [listings, setListings] = useState<ExternalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const data = await loadExternalListings(vehicleId);
    setListings(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [vehicleId]);

  async function handlePublish(platform: string) {
    setActionLoading(platform);
    await publishToPlatform(dealerId, vehicleId, platform, null);
    await load();
    setActionLoading(null);
  }

  async function handleUnpublish(platform: string) {
    setActionLoading('unpub_' + platform);
    await unpublishFromPlatform(vehicleId, platform);
    await load();
    setActionLoading(null);
  }

  async function handleSoldRemoveAll() {
    setActionLoading('sold');
    for (const l of listings.filter((l) => l.status === 'published' || l.status === 'syncing')) {
      await supabase.from('external_listings').update({ status: 'sold_removed', updated_at: new Date().toISOString() }).eq('id', l.id);
    }
    await load();
    setActionLoading(null);
  }

  if (loading) {
    return <div className="glass-card rounded-2xl p-6 flex justify-center"><Loader2 size={20} className="animate-spin text-navy-400" /></div>;
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PLATFORMS.map((p) => {
          const listing = listings.find((l) => l.platform === p.id);
          const status = listing?.status || 'not_published';
          const info = listingStatusInfo(status);
          const isLoading = actionLoading === p.id;
          return (
            <div key={p.id} className="glass rounded-xl p-3 border border-navy-600/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: p.color + '30', border: `1px solid ${p.color}40` }}>
                    <span style={{ color: p.color }}>{p.label.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{p.label}</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${info.dot}`} />
              </div>
              <p className={`text-xs font-medium ${info.color} mb-2`}>{info.label}</p>
              {listing?.last_error && <p className="text-[10px] text-error-400 mb-2">{listing.last_error}</p>}
              {listing?.external_url && <a href={listing.external_url} target="_blank" rel="noopener" className="text-[10px] text-accent-400 hover:underline flex items-center gap-1 mb-2"><Globe size={10} /> Ver anúncio</a>}
              <div className="flex gap-1.5">
                {status === 'not_published' || status === 'paused' || status === 'sold_removed' ? (
                  <button onClick={() => handlePublish(p.id)} disabled={isLoading || isSold}
                    className="flex-1 text-[10px] px-2 py-1.5 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-1">
                    {isLoading ? <Loader2 size={10} className="animate-spin" /> : <Globe size={10} />} Publicar
                  </button>
                ) : (
                  <button onClick={() => handleUnpublish(p.id)} disabled={isLoading}
                    className="flex-1 text-[10px] px-2 py-1.5 rounded-lg bg-navy-700/40 hover:bg-navy-600/40 text-navy-200 font-medium transition-all flex items-center justify-center gap-1">
                    {isLoading ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />} Pausar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isSold && listings.some((l) => l.status === 'published' || l.status === 'syncing') && (
        <div className="mt-4 glass rounded-xl p-3 border border-warning-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-warning-400" />
            <p className="text-xs text-navy-200">Este veículo foi vendido mas ainda tem anúncios ativos. Remova-os das plataformas.</p>
          </div>
          <button onClick={handleSoldRemoveAll} disabled={actionLoading === 'sold'}
            className="text-xs px-3 py-1.5 rounded-lg bg-warning-500/20 hover:bg-warning-500/30 text-warning-400 font-medium transition-all flex items-center gap-1">
            {actionLoading === 'sold' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Remover todos
          </button>
        </div>
      )}

      <p className="text-[10px] text-navy-500 mt-3 flex items-center gap-1">
        <Globe size={10} /> A publicação real depende de credenciais e aprovação de cada plataforma. Conecte suas contas em Integrações.
      </p>
    </div>
  );
}
