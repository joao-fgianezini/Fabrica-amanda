import { Car, MapPin, Phone, Mail, MessageCircle, ChevronRight, Gauge, Fuel, Calendar, Zap, Star, TrendingUp } from 'lucide-react';
import type { Dealer, Vehicle, VehiclePhoto, DealerSite, SiteData, SiteTemplate } from '@/lib/supabase';
import { formatCurrency, formatNumber } from '@/lib/format';

type IconType = React.ComponentType<{ size?: number; className?: string }>;

const InstagramIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export type TemplateProps = {
  dealer: Dealer;
  site: DealerSite;
  siteData: SiteData;
  vehicles: (Vehicle & { photos: VehiclePhoto[] })[];
};

function coverPhoto(v: Vehicle & { photos: VehiclePhoto[] }): string | undefined {
  return v.photos?.find((p) => p.is_cover)?.url || v.photos?.[0]?.url;
}

function SocialRow({ social, color }: { social: SiteData['social']; color: string }) {
  if (!social) return null;
  const links: { url?: string; icon: IconType; label: string }[] = [
    { url: social.instagram, icon: InstagramIcon, label: 'Instagram' },
    { url: social.facebook, icon: FacebookIcon, label: 'Facebook' },
    { url: social.youtube, icon: YoutubeIcon, label: 'YouTube' },
    { url: social.whatsapp, icon: MessageCircle, label: 'WhatsApp' },
  ];
  const filtered = links.filter((l) => l.url);
  if (filtered.length === 0) return null;
  return (
    <div className="flex items-center gap-3">
      {filtered.map((l) => {
        const Icon = l.icon;
        const href = l.label === 'WhatsApp'
          ? `https://wa.me/${l.url?.replace(/\D/g, '')}`
          : l.url || '#';
        return (
          <a key={l.label} href={href} target="_blank" rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: `${color}20`, color }}>
            <Icon size={18} />
          </a>
        );
      })}
    </div>
  );
}

function VehicleCard({ v, accent }: { v: Vehicle & { photos: VehiclePhoto[] }; accent: string }) {
  const photo = coverPhoto(v);
  const waMsg = `Olá! Tenho interesse no ${v.brand} ${v.model} ${v.year_model || ''} anunciado no site.`;
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {photo ? (
          <img src={photo} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Car size={40} className="text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: accent }}>
          {formatCurrency(v.asking_price)}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 truncate">{v.brand} {v.model}</h3>
        <p className="text-sm text-gray-500 mt-1">{v.year_model || v.year_manufacture || '—'} · {v.color || '—'}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
          {v.mileage !== null && <span className="flex items-center gap-1"><Gauge size={14} /> {formatNumber(v.mileage)} km</span>}
          {v.fuel && <span className="flex items-center gap-1"><Fuel size={14} /> {v.fuel}</span>}
          {v.transmission && <span className="flex items-center gap-1"><Calendar size={14} /> {v.transmission}</span>}
        </div>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(waMsg)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: accent }}
        >
          <MessageCircle size={16} /> Tenho interesse
        </a>
      </div>
    </div>
  );
}

// ====== CLASSIC TEMPLATE ======
export function ClassicTemplate({ dealer, siteData, vehicles }: TemplateProps) {
  const accent = siteData.primaryColor || '#1e3a5f';
  const available = vehicles.filter((v) => v.status === 'available');
  return (
    <div className="min-h-screen bg-gray-50 font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dealer.logo_url ? (
              <img src={dealer.logo_url} alt={dealer.name} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ background: accent }}>
                {dealer.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">{dealer.name}</h1>
              <p className="text-xs text-gray-500">{dealer.city}{dealer.city && dealer.state ? ' / ' : ''}{dealer.state}</p>
            </div>
          </div>
          {siteData.showSocialLinks && <SocialRow social={siteData.social} color={accent} />}
        </div>
      </header>

      <section className="relative h-[340px] md:h-[420px] overflow-hidden flex items-center justify-center text-center text-white">
        {siteData.heroImage ? (
          <img src={siteData.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}, ${siteData.secondaryColor || '#2b5cb8'})` }} />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-3xl px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight">{siteData.heroTitle || dealer.name}</h2>
          <p className="text-base md:text-lg text-gray-100">{siteData.heroSubtitle || 'Os melhores seminovos da região'}</p>
        </div>
      </section>

      {siteData.showStatsSection && (
        <section className="max-w-6xl mx-auto px-4 -mt-12 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Veículos em estoque', value: available.length },
              { label: 'Menor preço', value: available.length > 0 ? formatCurrency(Math.min(...available.map((v) => v.asking_price))) : '—' },
              { label: 'Maior preço', value: available.length > 0 ? formatCurrency(Math.max(...available.map((v) => v.asking_price))) : '—' },
              { label: 'Cidade', value: dealer.city || '—' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-lg text-center">
                <p className="text-2xl font-extrabold" style={{ color: accent }}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-1.5 h-7 rounded-full" style={{ background: accent }} />
          Veículos Disponíveis
        </h2>
        {available.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Car size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum veículo disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {available.map((v) => <VehicleCard key={v.id} v={v} accent={accent} />)}
          </div>
        )}
      </section>

      {siteData.showAboutSection && (siteData.aboutText || dealer.description) && (
        <section className="bg-white py-12">
          <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row gap-8 items-center">
            {siteData.aboutImage && (
              <img src={siteData.aboutImage} alt="Sobre" className="w-full md:w-1/2 rounded-2xl shadow-lg object-cover h-64" />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">{siteData.aboutTitle || 'Sobre nós'}</h2>
              <p className="text-gray-600 leading-relaxed">{siteData.aboutText || dealer.description}</p>
            </div>
          </div>
        </section>
      )}

      {siteData.showContactSection && (
        <section className="py-12" style={{ background: accent }}>
          <div className="max-w-4xl mx-auto px-4 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-6">Entre em contato</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {dealer.phone && <a href={`tel:${dealer.phone}`} className="flex items-center gap-2 hover:opacity-80"><Phone size={20} /> {dealer.phone}</a>}
              {dealer.email && <a href={`mailto:${dealer.email}`} className="flex items-center gap-2 hover:opacity-80"><Mail size={20} /> {dealer.email}</a>}
              {dealer.address && <span className="flex items-center gap-2"><MapPin size={20} /> {dealer.address}</span>}
            </div>
            {siteData.showSocialLinks && <div className="mt-6 flex justify-center"><SocialRow social={siteData.social} color="#fff" /></div>}
          </div>
        </section>
      )}

      <footer className="bg-gray-900 py-6 text-center text-gray-400 text-sm">
        <p>{siteData.customFooterText || `© ${new Date().getFullYear()} ${dealer.name}. Todos os direitos reservados.`}</p>
      </footer>
    </div>
  );
}

// ====== MODERN TEMPLATE ======
export function ModernTemplate({ dealer, siteData, vehicles }: TemplateProps) {
  const accent = siteData.primaryColor || '#0ea5e9';
  const available = vehicles.filter((v) => v.status === 'available');
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dealer.logo_url ? (
              <img src={dealer.logo_url} alt={dealer.name} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: accent }}>{dealer.name?.charAt(0).toUpperCase()}</div>
            )}
            <span className="text-white font-bold text-lg">{dealer.name}</span>
          </div>
          {siteData.showSocialLinks && <SocialRow social={siteData.social} color="#fff" />}
        </div>
      </header>

      <section className="relative h-[380px] md:h-[500px] flex items-center overflow-hidden">
        {siteData.heroImage ? (
          <img src={siteData.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${accent}dd, #0f172a)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">{siteData.heroTitle || dealer.name}</h2>
          <p className="text-base md:text-xl text-gray-200 mb-8 max-w-xl">{siteData.heroSubtitle || 'Os melhores seminovos da região'}</p>
          <a href="#estoque" className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-full text-white font-bold text-base md:text-lg transition-all hover:scale-105 shadow-xl" style={{ background: accent }}>
            Ver estoque <ChevronRight size={18} />
          </a>
        </div>
      </section>

      {siteData.showStatsSection && (
        <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Em estoque', value: available.length, icon: Car },
              { label: 'A partir de', value: available.length > 0 ? formatCurrency(Math.min(...available.map((v) => v.asking_price))) : '—', icon: Star },
              { label: 'Cidade', value: dealer.city || '—', icon: MapPin },
              { label: 'Anúncios ativos', value: available.length, icon: Zap },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <Icon size={24} style={{ color: accent }} className="mb-3" />
                  <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section id="estoque" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Nosso Estoque</h2>
        <p className="text-gray-500 mb-8">Veículos disponíveis e prontos para entrega</p>
        {available.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl">
            <Car size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum veículo disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {available.map((v) => <VehicleCard key={v.id} v={v} accent={accent} />)}
          </div>
        )}
      </section>

      {siteData.showAboutSection && (siteData.aboutText || dealer.description) && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
            {siteData.aboutImage && <img src={siteData.aboutImage} alt="Sobre" className="rounded-3xl shadow-xl object-cover w-full h-72" />}
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{siteData.aboutTitle || 'Sobre nós'}</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{siteData.aboutText || dealer.description}</p>
            </div>
          </div>
        </section>
      )}

      {siteData.showContactSection && (
        <section className="py-16" style={{ background: accent }}>
          <div className="max-w-4xl mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-extrabold mb-6">Fale conosco</h2>
            <div className="flex flex-wrap justify-center gap-6 text-lg">
              {dealer.phone && <a href={`tel:${dealer.phone}`} className="flex items-center gap-2 hover:opacity-80"><Phone size={20} /> {dealer.phone}</a>}
              {dealer.email && <a href={`mailto:${dealer.email}`} className="flex items-center gap-2 hover:opacity-80"><Mail size={20} /> {dealer.email}</a>}
            </div>
            {siteData.showSocialLinks && <div className="mt-6 flex justify-center"><SocialRow social={siteData.social} color="#fff" /></div>}
          </div>
        </section>
      )}

      <footer className="bg-gray-900 py-6 text-center text-gray-400 text-sm">
        <p>{siteData.customFooterText || `© ${new Date().getFullYear()} ${dealer.name}. Todos os direitos reservados.`}</p>
      </footer>
    </div>
  );
}

// ====== LUXURY TEMPLATE ======
export function LuxuryTemplate({ dealer, siteData, vehicles }: TemplateProps) {
  const accent = siteData.primaryColor || '#c4a843';
  const available = vehicles.filter((v) => v.status === 'available');
  return (
    <div className="min-h-screen bg-[#0a0a0a]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dealer.logo_url ? (
              <img src={dealer.logo_url} alt={dealer.name} className="w-12 h-12 rounded-full object-cover border-2" style={{ borderColor: accent }} />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl border-2" style={{ background: 'transparent', borderColor: accent, color: accent }}>{dealer.name?.charAt(0).toUpperCase()}</div>
            )}
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide uppercase">{dealer.name}</h1>
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>Automóveis de Excelência</p>
            </div>
          </div>
          {siteData.showSocialLinks && <SocialRow social={siteData.social} color={accent} />}
        </div>
      </header>

      <section className="relative h-[380px] md:h-[480px] overflow-hidden flex items-center justify-center text-center">
        {siteData.heroImage ? (
          <img src={siteData.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl px-6">
          <div className="w-12 h-px mx-auto mb-5" style={{ background: accent }} />
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">{siteData.heroTitle || dealer.name}</h2>
          <p className="text-base md:text-lg text-gray-300 font-light tracking-wide">{siteData.heroSubtitle || 'Veículos premium selecionados para você'}</p>
        </div>
      </section>

      {siteData.showStatsSection && (
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { label: 'Veículos', value: available.length },
              { label: 'A partir de', value: available.length > 0 ? formatCurrency(Math.min(...available.map((v) => v.asking_price))) : '—' },
              { label: 'Localização', value: dealer.city || '—' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-extrabold" style={{ color: accent }}>{s.value}</p>
                <p className="text-xs uppercase tracking-[0.15em] text-gray-500 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-12 h-px mx-auto mb-4" style={{ background: accent }} />
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Coleção Disponível</h2>
        </div>
        {available.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-2xl">
            <Car size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum veículo disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {available.map((v) => {
              const photo = coverPhoto(v);
              return (
                <div key={v.id} className="group border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500">
                  <div className="relative h-56 overflow-hidden bg-gray-900">
                    {photo && <img src={photo} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                    <div className="absolute bottom-3 left-3 px-4 py-2 rounded-lg text-white font-bold text-lg" style={{ background: 'rgba(0,0,0,0.8)', color: accent }}>
                      {formatCurrency(v.asking_price)}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white">{v.brand} {v.model}</h3>
                    <p className="text-sm text-gray-500 mt-1">{v.year_model || v.year_manufacture} · {v.color} · {v.mileage !== null ? `${formatNumber(v.mileage)} km` : ''}</p>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Olá! Tenho interesse no ${v.brand} ${v.model}`)}`} target="_blank" rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3" style={{ color: accent }}>
                      Consultar <ChevronRight size={16} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {siteData.showAboutSection && (siteData.aboutText || dealer.description) && (
        <section className="py-16 border-t border-white/10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="w-12 h-px mx-auto mb-4" style={{ background: accent }} />
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest mb-6">{siteData.aboutTitle || 'Sobre nós'}</h2>
            {siteData.aboutImage && <img src={siteData.aboutImage} alt="Sobre" className="rounded-2xl mx-auto mb-6 max-h-64 object-cover" />}
            <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">{siteData.aboutText || dealer.description}</p>
          </div>
        </section>
      )}

      {siteData.showContactSection && (
        <section className="py-12 border-t border-white/10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="w-12 h-px mx-auto mb-4" style={{ background: accent }} />
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-6">Contato</h2>
            <div className="flex flex-wrap justify-center gap-6 text-gray-300">
              {dealer.phone && <a href={`tel:${dealer.phone}`} className="flex items-center gap-2 hover:text-white"><Phone size={18} /> {dealer.phone}</a>}
              {dealer.email && <a href={`mailto:${dealer.email}`} className="flex items-center gap-2 hover:text-white"><Mail size={18} /> {dealer.email}</a>}
            </div>
            {siteData.showSocialLinks && <div className="mt-6 flex justify-center"><SocialRow social={siteData.social} color={accent} /></div>}
          </div>
        </section>
      )}

      <footer className="py-6 text-center text-gray-600 text-xs uppercase tracking-widest border-t border-white/10">
        <p>{siteData.customFooterText || `© ${new Date().getFullYear()} ${dealer.name}`}</p>
      </footer>
    </div>
  );
}

// ====== SPORT TEMPLATE ======
export function SportTemplate({ dealer, siteData, vehicles }: TemplateProps) {
  const accent = siteData.primaryColor || '#dc2626';
  const available = vehicles.filter((v) => v.status === 'available');
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="sticky top-0 z-50 text-white shadow-lg" style={{ background: accent }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dealer.logo_url ? (
              <img src={dealer.logo_url} alt={dealer.name} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-bold text-xl" style={{ color: accent }}>{dealer.name?.charAt(0).toUpperCase()}</div>
            )}
            <span className="font-extrabold text-lg uppercase tracking-tight">{dealer.name}</span>
          </div>
          {siteData.showSocialLinks && <SocialRow social={siteData.social} color="#fff" />}
        </div>
      </header>

      <section className="relative h-[360px] md:h-[440px] flex items-center overflow-hidden">
        {siteData.heroImage ? (
          <img src={siteData.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${accent}, #1a1a1a)` }} />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs md:text-sm font-bold uppercase tracking-wider mb-3">Estoque disponível</div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase leading-tight mb-3">{siteData.heroTitle || dealer.name}</h2>
          <p className="text-base md:text-lg text-gray-100 font-medium max-w-xl">{siteData.heroSubtitle || 'Velocidade e qualidade em cada veículo'}</p>
        </div>
      </section>

      {siteData.showStatsSection && (
        <section className="bg-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Veículos', value: available.length, icon: Car },
              { label: 'A partir de', value: available.length > 0 ? formatCurrency(Math.min(...available.map((v) => v.asking_price))) : '—', icon: Star },
              { label: 'Até', value: available.length > 0 ? formatCurrency(Math.max(...available.map((v) => v.asking_price))) : '—', icon: TrendingUp },
              { label: 'Cidade', value: dealer.city || '—', icon: MapPin },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-5 flex items-center gap-3 shadow-sm">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}15` }}>
                    <Icon size={22} style={{ color: accent }} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-1 rounded-full" style={{ background: accent }} />
          <h2 className="text-3xl font-extrabold text-gray-900 uppercase">Estoque</h2>
        </div>
        {available.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <Car size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum veículo disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {available.map((v) => <VehicleCard key={v.id} v={v} accent={accent} />)}
          </div>
        )}
      </section>

      {siteData.showAboutSection && (siteData.aboutText || dealer.description) && (
        <section className="py-12 bg-gray-900">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
            {siteData.aboutImage && <img src={siteData.aboutImage} alt="Sobre" className="rounded-2xl shadow-xl object-cover w-full h-64" />}
            <div>
              <div className="w-8 h-1 mb-4" style={{ background: accent }} />
              <h2 className="text-2xl font-extrabold text-white uppercase mb-4">{siteData.aboutTitle || 'Sobre nós'}</h2>
              <p className="text-gray-400 leading-relaxed">{siteData.aboutText || dealer.description}</p>
            </div>
          </div>
        </section>
      )}

      {siteData.showContactSection && (
        <section className="py-12" style={{ background: accent }}>
          <div className="max-w-4xl mx-auto px-6 text-center text-white">
            <h2 className="text-2xl font-extrabold uppercase mb-6">Contato</h2>
            <div className="flex flex-wrap justify-center gap-6 font-medium">
              {dealer.phone && <a href={`tel:${dealer.phone}`} className="flex items-center gap-2 hover:opacity-80"><Phone size={20} /> {dealer.phone}</a>}
              {dealer.email && <a href={`mailto:${dealer.email}`} className="flex items-center gap-2 hover:opacity-80"><Mail size={20} /> {dealer.email}</a>}
            </div>
            {siteData.showSocialLinks && <div className="mt-6 flex justify-center"><SocialRow social={siteData.social} color="#fff" /></div>}
          </div>
        </section>
      )}

      <footer className="bg-gray-900 py-6 text-center text-gray-500 text-sm">
        <p>{siteData.customFooterText || `© ${new Date().getFullYear()} ${dealer.name}. Todos os direitos reservados.`}</p>
      </footer>
    </div>
  );
}

// ====== MINIMAL TEMPLATE ======
export function MinimalTemplate({ dealer, siteData, vehicles }: TemplateProps) {
  const accent = siteData.primaryColor || '#10b981';
  const available = vehicles.filter((v) => v.status === 'available');
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dealer.logo_url ? (
              <img src={dealer.logo_url} alt={dealer.name} className="w-9 h-9 rounded-lg object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: accent }}>{dealer.name?.charAt(0).toUpperCase()}</div>
            )}
            <span className="font-bold text-gray-900">{dealer.name}</span>
          </div>
          {siteData.showSocialLinks && <SocialRow social={siteData.social} color={accent} />}
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">{siteData.heroTitle || dealer.name}</h1>
        <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto">{siteData.heroSubtitle || 'Veículos seminovos selecionados com cuidado'}</p>
      </section>

      {siteData.showStatsSection && available.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { label: 'Veículos', value: available.length },
              { label: 'A partir de', value: formatCurrency(Math.min(...available.map((v) => v.asking_price))) },
              { label: 'Cidade', value: dealer.city || '—' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-4xl mx-auto px-6 pb-16">
        {available.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Car size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum veículo disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {available.map((v) => {
              const photo = coverPhoto(v);
              return (
                <div key={v.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 flex flex-col sm:flex-row">
                  <div className="sm:w-56 h-44 sm:h-auto flex-shrink-0 overflow-hidden bg-gray-100">
                    {photo && <img src={photo} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{v.brand} {v.model}</h3>
                      <p className="text-sm text-gray-400 mt-1">{v.year_model || v.year_manufacture} · {v.color} · {v.mileage !== null ? `${formatNumber(v.mileage)} km` : ''}</p>
                      {v.fuel && <p className="text-sm text-gray-400 mt-1 flex items-center gap-1"><Fuel size={14} /> {v.fuel}</p>}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-extrabold" style={{ color: accent }}>{formatCurrency(v.asking_price)}</span>
                      <a href={`https://wa.me/?text=${encodeURIComponent(`Olá! Tenho interesse no ${v.brand} ${v.model}`)}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90" style={{ background: accent }}>
                        <MessageCircle size={16} /> Interessado
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {siteData.showAboutSection && (siteData.aboutText || dealer.description) && (
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">{siteData.aboutTitle || 'Sobre nós'}</h2>
            {siteData.aboutImage && <img src={siteData.aboutImage} alt="Sobre" className="rounded-2xl mx-auto mb-6 max-h-56 object-cover" />}
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">{siteData.aboutText || dealer.description}</p>
          </div>
        </section>
      )}

      {siteData.showContactSection && (
        <section className="bg-white border-t border-gray-200 py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Contato</h2>
            <div className="flex flex-wrap justify-center gap-6 text-gray-600">
              {dealer.phone && <a href={`tel:${dealer.phone}`} className="flex items-center gap-2 hover:text-gray-900"><Phone size={18} /> {dealer.phone}</a>}
              {dealer.email && <a href={`mailto:${dealer.email}`} className="flex items-center gap-2 hover:text-gray-900"><Mail size={18} /> {dealer.email}</a>}
            </div>
            {siteData.showSocialLinks && <div className="mt-6 flex justify-center"><SocialRow social={siteData.social} color={accent} /></div>}
          </div>
        </section>
      )}

      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>{siteData.customFooterText || `© ${new Date().getFullYear()} ${dealer.name}`}</p>
      </footer>
    </div>
  );
}

// ====== DARK PREMIUM TEMPLATE ======
export function DarkTemplate({ dealer, siteData, vehicles }: TemplateProps) {
  const accent = siteData.primaryColor || '#7c3aed';
  const available = vehicles.filter((v) => v.status === 'available');
  return (
    <div className="min-h-screen bg-[#0f0f17]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0f0f17]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dealer.logo_url ? (
              <img src={dealer.logo_url} alt={dealer.name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}80)` }}>{dealer.name?.charAt(0).toUpperCase()}</div>
            )}
            <span className="font-bold text-white text-lg">{dealer.name}</span>
          </div>
          {siteData.showSocialLinks && <SocialRow social={siteData.social} color={accent} />}
        </div>
      </header>

      <section className="relative h-[380px] md:h-[460px] flex items-center overflow-hidden">
        {siteData.heroImage ? (
          <img src={siteData.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top, ${accent}30, transparent 60%), #0f0f17` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f0f17]/50 to-[#0f0f17]" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4" style={{ borderColor: `${accent}40`, background: `${accent}15` }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>{available.length} veículos disponíveis</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">{siteData.heroTitle || dealer.name}</h2>
          <p className="text-base md:text-lg text-gray-400 max-w-xl mb-6">{siteData.heroSubtitle || 'Os melhores seminovos da região'}</p>
          <a href="#estoque" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 8px 32px ${accent}40` }}>
            Ver estoque <ChevronRight size={18} />
          </a>
        </div>
      </section>

      {siteData.showStatsSection && (
        <section className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Em estoque', value: available.length, icon: Car },
              { label: 'A partir de', value: available.length > 0 ? formatCurrency(Math.min(...available.map((v) => v.asking_price))) : '—', icon: Star },
              { label: 'Até', value: available.length > 0 ? formatCurrency(Math.max(...available.map((v) => v.asking_price))) : '—', icon: TrendingUp },
              { label: 'Cidade', value: dealer.city || '—', icon: MapPin },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <Icon size={20} style={{ color: accent }} className="mb-3" />
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section id="estoque" className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-extrabold text-white mb-8">Estoque</h2>
        {available.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <Car size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum veículo disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {available.map((v) => {
              const photo = coverPhoto(v);
              return (
                <div key={v.id} className="group rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all duration-500" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="relative h-44 overflow-hidden bg-[#1a1a24]">
                    {photo && <img src={photo} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: accent }}>{formatCurrency(v.asking_price)}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white">{v.brand} {v.model}</h3>
                    <p className="text-sm text-gray-500 mt-1">{v.year_model || v.year_manufacture || '—'} · {v.color || '—'}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      {v.mileage !== null && <span className="flex items-center gap-1"><Gauge size={14} /> {formatNumber(v.mileage)} km</span>}
                      {v.fuel && <span className="flex items-center gap-1"><Fuel size={14} /> {v.fuel}</span>}
                    </div>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Olá! Tenho interesse no ${v.brand} ${v.model}`)}`} target="_blank" rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90" style={{ background: accent }}>
                      <MessageCircle size={16} /> Tenho interesse
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {siteData.showAboutSection && (siteData.aboutText || dealer.description) && (
        <section className="py-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
            {siteData.aboutImage && <img src={siteData.aboutImage} alt="Sobre" className="rounded-2xl object-cover w-full h-72" style={{ boxShadow: `0 16px 48px ${accent}20` }} />}
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-4">{siteData.aboutTitle || 'Sobre nós'}</h2>
              <p className="text-gray-400 leading-relaxed text-lg">{siteData.aboutText || dealer.description}</p>
            </div>
          </div>
        </section>
      )}

      {siteData.showContactSection && (
        <section className="py-16 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-extrabold text-white mb-6">Entre em contato</h2>
            <div className="flex flex-wrap justify-center gap-6 text-gray-300">
              {dealer.phone && <a href={`tel:${dealer.phone}`} className="flex items-center gap-2 hover:text-white"><Phone size={20} /> {dealer.phone}</a>}
              {dealer.email && <a href={`mailto:${dealer.email}`} className="flex items-center gap-2 hover:text-white"><Mail size={20} /> {dealer.email}</a>}
            </div>
            {siteData.showSocialLinks && <div className="mt-6 flex justify-center"><SocialRow social={siteData.social} color={accent} /></div>}
          </div>
        </section>
      )}

      <footer className="py-6 text-center text-gray-600 text-sm border-t border-white/5">
        <p>{siteData.customFooterText || `© ${new Date().getFullYear()} ${dealer.name}. Todos os direitos reservados.`}</p>
      </footer>
    </div>
  );
}

// ====== MAGAZINE TEMPLATE ======
export function MagazineTemplate({ dealer, siteData, vehicles }: TemplateProps) {
  const accent = siteData.primaryColor || '#ea580c';
  const available = vehicles.filter((v) => v.status === 'available');
  const featured = available.slice(0, 1)[0];
  const rest = available.slice(1);
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Georgia, serif' }}>
      <header className="border-b-2 border-gray-900">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dealer.logo_url ? (
              <img src={dealer.logo_url} alt={dealer.name} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ background: accent }}>{dealer.name?.charAt(0).toUpperCase()}</div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>{dealer.name}</h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest">{dealer.city}{dealer.city && dealer.state ? ' · ' : ''}{dealer.state}</p>
            </div>
          </div>
          {siteData.showSocialLinks && <SocialRow social={siteData.social} color={accent} />}
        </div>
      </header>

      {/* Hero text section */}
      <section className="max-w-5xl mx-auto px-6 py-12 md:py-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: accent }}>{dealer.city || 'Brasil'} · {available.length} veículos</p>
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{siteData.heroTitle || dealer.name}</h2>
        <p className="text-base md:text-lg text-gray-500 italic max-w-2xl mx-auto">{siteData.heroSubtitle || 'Os melhores seminovos da região'}</p>
      </section>

      {/* Featured vehicle */}
      {featured && (
        <section className="max-w-5xl mx-auto px-6 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center border-y-2 border-gray-100 py-8">
            <div className="relative h-80 rounded-lg overflow-hidden">
              {coverPhoto(featured) && <img src={coverPhoto(featured)} alt={`${featured.brand} ${featured.model}`} className="w-full h-full object-cover" />}
              <div className="absolute bottom-4 left-4 px-4 py-2 rounded-lg text-white font-bold text-lg" style={{ background: accent }}>{formatCurrency(featured.asking_price)}</div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: accent }}>Destaque</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>{featured.brand} {featured.model}</h3>
              <p className="text-gray-500 mb-4">{featured.year_model || featured.year_manufacture} · {featured.color} · {featured.mileage !== null ? `${formatNumber(featured.mileage)} km` : ''}</p>
              {featured.description && <p className="text-gray-600 leading-relaxed mb-6">{featured.description}</p>}
              <a href={`https://wa.me/?text=${encodeURIComponent(`Olá! Tenho interesse no ${featured.brand} ${featured.model}`)}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90" style={{ background: accent }}>
                <MessageCircle size={18} /> Tenho interesse
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Grid of remaining vehicles */}
      {rest.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-baseline gap-3 mb-8">
            <div className="w-12 h-0.5" style={{ background: accent }} />
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>Mais veículos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((v) => <VehicleCard key={v.id} v={v} accent={accent} />)}
          </div>
        </section>
      )}

      {available.length === 0 && (
        <section className="max-w-5xl mx-auto px-6 py-20 text-center">
          <Car size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum veículo disponível no momento.</p>
        </section>
      )}

      {siteData.showStatsSection && available.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
            {[
              { label: 'Veículos', value: available.length },
              { label: 'A partir de', value: formatCurrency(Math.min(...available.map((v) => v.asking_price))) },
              { label: 'Cidade', value: dealer.city || '—' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-bold" style={{ color: accent, fontFamily: 'Georgia, serif' }}>{s.value}</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {siteData.showAboutSection && (siteData.aboutText || dealer.description) && (
        <section className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: accent }}>Nossa história</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>{siteData.aboutTitle || 'Sobre nós'}</h2>
          {siteData.aboutImage && <img src={siteData.aboutImage} alt="Sobre" className="rounded-lg mx-auto mb-6 max-h-56 object-cover" />}
          <p className="text-gray-600 leading-relaxed text-lg" style={{ fontFamily: 'Georgia, serif' }}>{siteData.aboutText || dealer.description}</p>
        </section>
      )}

      {siteData.showContactSection && (
        <section className="bg-gray-900 py-12">
          <div className="max-w-4xl mx-auto px-6 text-center text-white">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Georgia, serif' }}>Contato</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {dealer.phone && <a href={`tel:${dealer.phone}`} className="flex items-center gap-2 hover:opacity-80"><Phone size={18} /> {dealer.phone}</a>}
              {dealer.email && <a href={`mailto:${dealer.email}`} className="flex items-center gap-2 hover:opacity-80"><Mail size={18} /> {dealer.email}</a>}
            </div>
            {siteData.showSocialLinks && <div className="mt-6 flex justify-center"><SocialRow social={siteData.social} color={accent} /></div>}
          </div>
        </section>
      )}

      <footer className="bg-gray-900 py-6 text-center text-gray-500 text-sm border-t border-white/10">
        <p>{siteData.customFooterText || `© ${new Date().getFullYear()} ${dealer.name}. Todos os direitos reservados.`}</p>
      </footer>
    </div>
  );
}

// ====== HIGHWAY TEMPLATE ======
export function HighwayTemplate({ dealer, siteData, vehicles }: TemplateProps) {
  const accent = siteData.primaryColor || '#0891b2';
  const available = vehicles.filter((v) => v.status === 'available');
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dealer.logo_url ? (
              <img src={dealer.logo_url} alt={dealer.name} className="w-11 h-11 rounded-xl object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(135deg, ${accent}, #0e7490)` }}>{dealer.name?.charAt(0).toUpperCase()}</div>
            )}
            <div>
              <h1 className="text-lg font-extrabold text-gray-900">{dealer.name}</h1>
              <p className="text-xs text-gray-400">{dealer.city}{dealer.city && dealer.state ? ' / ' : ''}{dealer.state}</p>
            </div>
          </div>
          {siteData.showSocialLinks && <SocialRow social={siteData.social} color={accent} />}
        </div>
      </header>

      {/* Hero with diagonal gradient overlay */}
      <section className="relative h-[380px] md:h-[460px] flex items-end overflow-hidden">
        {siteData.heroImage ? (
          <img src={siteData.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(120deg, #0f172a 0%, ${accent} 100%)` }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(15,23,42,0.8) 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-10 md:pb-12 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-white text-xs font-semibold mb-3">
            <Star size={12} style={{ color: accent }} /> Seminovos selecionados
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight max-w-2xl">{siteData.heroTitle || dealer.name}</h2>
          <p className="text-base md:text-lg text-gray-200 max-w-xl">{siteData.heroSubtitle || 'Os melhores seminovos da região'}</p>
        </div>
      </section>

      {/* Floating stats bar */}
      {siteData.showStatsSection && (
        <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Veículos', value: available.length, icon: Car },
              { label: 'A partir de', value: available.length > 0 ? formatCurrency(Math.min(...available.map((v) => v.asking_price))) : '—', icon: Star },
              { label: 'Até', value: available.length > 0 ? formatCurrency(Math.max(...available.map((v) => v.asking_price))) : '—', icon: TrendingUp },
              { label: 'Cidade', value: dealer.city || '—', icon: MapPin },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}10` }}>
                    <Icon size={22} style={{ color: accent }} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Estoque</h2>
            <p className="text-gray-400 text-sm mt-1">Veículos disponíveis e prontos para entrega</p>
          </div>
        </div>
        {available.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl">
            <Car size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum veículo disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {available.map((v) => <VehicleCard key={v.id} v={v} accent={accent} />)}
          </div>
        )}
      </section>

      {siteData.showAboutSection && (siteData.aboutText || dealer.description) && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: `${accent}15` }}>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>Sobre nós</span>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{siteData.aboutTitle || 'Nossa história'}</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{siteData.aboutText || dealer.description}</p>
            </div>
            {siteData.aboutImage && <img src={siteData.aboutImage} alt="Sobre" className="rounded-3xl shadow-xl object-cover w-full h-72" />}
          </div>
        </section>
      )}

      {siteData.showContactSection && (
        <section className="py-16 bg-gradient-to-br from-gray-900 to-slate-800">
          <div className="max-w-4xl mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-extrabold mb-6">Fale conosco</h2>
            <div className="flex flex-wrap justify-center gap-6 text-lg">
              {dealer.phone && <a href={`tel:${dealer.phone}`} className="flex items-center gap-2 hover:text-gray-300"><Phone size={20} /> {dealer.phone}</a>}
              {dealer.email && <a href={`mailto:${dealer.email}`} className="flex items-center gap-2 hover:text-gray-300"><Mail size={20} /> {dealer.email}</a>}
            </div>
            {siteData.showSocialLinks && <div className="mt-6 flex justify-center"><SocialRow social={siteData.social} color={accent} /></div>}
          </div>
        </section>
      )}

      <footer className="bg-gray-900 py-6 text-center text-gray-500 text-sm">
        <p>{siteData.customFooterText || `© ${new Date().getFullYear()} ${dealer.name}. Todos os direitos reservados.`}</p>
      </footer>
    </div>
  );
}

// ====== TEMPLATE RENDERER ======
export function renderTemplate(props: TemplateProps) {
  switch (props.site.template) {
    case 'classic': return <ClassicTemplate {...props} />;
    case 'modern': return <ModernTemplate {...props} />;
    case 'luxury': return <LuxuryTemplate {...props} />;
    case 'sport': return <SportTemplate {...props} />;
    case 'minimal': return <MinimalTemplate {...props} />;
    case 'dark': return <DarkTemplate {...props} />;
    case 'magazine': return <MagazineTemplate {...props} />;
    case 'highway': return <HighwayTemplate {...props} />;
    default: return <ClassicTemplate {...props} />;
  }
}

export const TEMPLATE_OPTIONS: { id: SiteTemplate; name: string; description: string; preview: string; accent: string }[] = [
  { id: 'classic', name: 'Clássico', description: 'Layout tradicional com header fixo, seções bem definidas e foco na lista de veículos', preview: 'linear-gradient(135deg, #1e3a5f, #2b5cb8)', accent: '#2b5cb8' },
  { id: 'modern', name: 'Moderno', description: 'Hero em tela cheia, cards flutuantes sobrepostos e design contemporâneo', preview: 'linear-gradient(135deg, #0ea5e9, #0f172a)', accent: '#0ea5e9' },
  { id: 'luxury', name: 'Luxo', description: 'Tema escuro premium com detalhes dourados, ideal para veículos de alto padrão', preview: 'linear-gradient(135deg, #1a1a1a, #c4a843)', accent: '#c4a843' },
  { id: 'sport', name: 'Esportivo', description: 'Cores vibrantes, tipografia bold e layout dinâmico para um visual agressivo', preview: 'linear-gradient(135deg, #dc2626, #1a1a1a)', accent: '#dc2626' },
  { id: 'minimal', name: 'Minimalista', description: 'Design limpo, espaçoso e elegante com lista vertical de veículos', preview: 'linear-gradient(135deg, #10b981, #f3f4f6)', accent: '#10b981' },
  { id: 'dark', name: 'Dark Premium', description: 'Tema escuro sofisticado com glassmorphism, gradientes e efeitos modernos', preview: 'linear-gradient(135deg, #0f0f17, #7c3aed)', accent: '#7c3aed' },
  { id: 'magazine', name: 'Revista', description: 'Estilo editorial elegante com fonte serifada, veículo destaque e layout de revista', preview: 'linear-gradient(135deg, #ea580c, #fef3c7)', accent: '#ea580c' },
  { id: 'highway', name: 'Estrada', description: 'Visual clean com hero diagonal, barra de stats flutuante e design arrojado', preview: 'linear-gradient(135deg, #0f172a, #0891b2)', accent: '#0891b2' },
];
