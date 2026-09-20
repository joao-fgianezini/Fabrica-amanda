import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, type Dealer, type DealerSite, type Vehicle, type VehiclePhoto, type SiteData } from '@/lib/supabase';
import { renderTemplate } from '@/components/site-templates';
import { Loader2, Globe } from 'lucide-react';

export function PublicSitePage() {
  const { slug } = useParams();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [site, setSite] = useState<DealerSite | null>(null);
  const [vehicles, setVehicles] = useState<(Vehicle & { photos: VehiclePhoto[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      const { data: siteData, error: siteErr } = await supabase
        .from('dealer_sites')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (siteErr || !siteData) {
        setError('Site não encontrado ou não publicado.');
        setLoading(false);
        return;
      }

      const s = siteData as DealerSite;
      setSite(s);

      const { data: dealerData } = await supabase
        .from('dealers')
        .select('*')
        .eq('id', s.dealer_id)
        .maybeSingle();

      if (!dealerData) {
        setError('Lojista não encontrado.');
        setLoading(false);
        return;
      }

      setDealer(dealerData as Dealer);

      const { data: vehData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('dealer_id', s.dealer_id)
        .order('created_at', { ascending: false });

      const rows = (vehData || []) as Vehicle[];
      const ids = rows.map((v) => v.id);
      const photosMap = new Map<string, VehiclePhoto[]>();
      if (ids.length > 0) {
        const { data: photoData } = await supabase.from('vehicle_photos').select('*').in('vehicle_id', ids);
        for (const p of (photoData || []) as VehiclePhoto[]) {
          const list = photosMap.get(p.vehicle_id) || [];
          list.push(p);
          photosMap.set(p.vehicle_id, list);
        }
      }
      setVehicles(rows.map((v) => ({ ...v, photos: photosMap.get(v.id) || [] })));
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-14 h-14 border-2 border-blue-500/20 rounded-full" />
            <div className="absolute inset-0 w-14 h-14 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-sm">Carregando site...</p>
        </div>
      </div>
    );
  }

  if (error || !dealer || !site) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-center px-4">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
          <Globe size={48} className="relative text-gray-600" />
        </div>
        <p className="text-gray-300 text-lg font-medium">{error || 'Site não encontrado'}</p>
        <p className="text-gray-500 text-sm mt-2">O site pode ter sido removido ou não está mais publicado.</p>
      </div>
    );
  }

  return renderTemplate({ dealer, site, siteData: site.site_data as SiteData, vehicles });
}
