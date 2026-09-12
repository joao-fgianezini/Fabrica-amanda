import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, ImagePlus, X, AlertCircle, Car } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type VehiclePhoto } from '@/lib/supabase';

type FormData = {
  brand: string;
  model: string;
  year_manufacture: string;
  year_model: string;
  color: string;
  mileage: string;
  fuel: string;
  transmission: string;
  plate: string;
  chassis: string;
  engine: string;
  doors: string;
  description: string;
  purchase_price: string;
  asking_price: string;
  min_price: string;
  status: 'available' | 'reserved' | 'sold';
};

const emptyForm: FormData = {
  brand: '', model: '', year_manufacture: '', year_model: '', color: '',
  mileage: '', fuel: '', transmission: '', plate: '', chassis: '', engine: '',
  doors: '', description: '', purchase_price: '', asking_price: '', min_price: '',
  status: 'available',
};

const fuelOptions = ['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Híbrido', 'Elétrico'];
const transmissionOptions = ['Manual', 'Automático', 'Automatizado', 'CVT'];

export function VehicleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dealer } = useAuth();
  const isEdit = id && id !== 'novo';

  const [form, setForm] = useState<FormData>(emptyForm);
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);
  const [loading, setLoading] = useState(isEdit ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    async function loadVehicle() {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id!)
        .maybeSingle();

      if (error || !data) {
        setError('Veículo não encontrado');
        setLoading(false);
        return;
      }

      const v = data as Vehicle;
      setForm({
        brand: v.brand, model: v.model,
        year_manufacture: v.year_manufacture?.toString() || '',
        year_model: v.year_model?.toString() || '',
        color: v.color || '', mileage: v.mileage?.toString() || '',
        fuel: v.fuel || '', transmission: v.transmission || '',
        plate: v.plate || '', chassis: v.chassis || '',
        engine: v.engine || '', doors: v.doors?.toString() || '',
        description: v.description || '',
        purchase_price: v.purchase_price?.toString() || '',
        asking_price: v.asking_price?.toString() || '',
        min_price: v.min_price?.toString() || '',
        status: v.status,
      });

      const { data: photosData } = await supabase
        .from('vehicle_photos')
        .select('*')
        .eq('vehicle_id', id!)
        .order('is_cover', { ascending: false });

      if (photosData) setPhotos(photosData as VehiclePhoto[]);
      setLoading(false);
    }
    loadVehicle();
  }, [id, isEdit]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const purchasePrice = parseFloat(form.purchase_price) || 0;
  const askingPrice = parseFloat(form.asking_price) || 0;
  const minPrice = parseFloat(form.min_price) || 0;
  const profitMargin = purchasePrice > 0 ? ((askingPrice - purchasePrice) / purchasePrice) * 100 : 0;
  const profitValue = askingPrice - purchasePrice;
  const minProfit = minPrice > 0 ? minPrice - purchasePrice : 0;

  function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const MAX_BYTES = 10 * 1024 * 1024;
    const valid: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ALLOWED.includes(file.type)) {
        setError('Envie apenas imagens JPG, PNG, WEBP, GIF ou AVIF.');
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError('Cada foto deve ter no máximo 10 MB.');
        continue;
      }
      valid.push(file);
    }

    if (valid.length > 0) {
      if (isEdit && id) {
        uploadFiles(valid, id);
      } else {
        const previews = valid.map((f) => URL.createObjectURL(f));
        setPendingFiles((prev) => [...prev, ...valid]);
        setPendingPreviews((prev) => [...prev, ...previews]);
      }
    }
    e.target.value = '';
  }

  async function uploadFiles(files: File[], vehicleId: string) {
    if (!dealer) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fileName = `${dealer.id}/${vehicleId}/${Date.now()}-${i}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from('vehicle-photos')
          .upload(fileName, file);
        if (upErr) throw upErr;

        const { data: urlData } = supabase.storage
          .from('vehicle-photos')
          .getPublicUrl(fileName);

        const isFirst = photos.length === 0 && i === 0;
        const { data: photoData, error: dbErr } = await supabase
          .from('vehicle_photos')
          .insert({ vehicle_id: vehicleId, url: urlData.publicUrl, is_cover: isFirst })
          .select()
          .single();
        if (dbErr) throw dbErr;
        if (photoData) setPhotos((prev) => [...prev, photoData as VehiclePhoto]);
      }
    } catch (err) {
      console.error('Erro ao enviar foto:', err);
      setError('Não foi possível enviar a foto. Tente novamente.');
    }
    setUploading(false);
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleDeletePhoto(photoId: string, url: string) {
    const { error } = await supabase.from('vehicle_photos').delete().eq('id', photoId);
    if (error) {
      setError('Erro ao remover foto');
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));

    // Try to remove from storage (best-effort)
    try {
      const pathMatch = url.match(/vehicle-photos\/(.+)$/);
      if (pathMatch) {
        await supabase.storage.from('vehicle-photos').remove([pathMatch[1]]);
      }
    } catch {}
  }

  async function handleSetCover(photoId: string) {
    if (!id) return;
    // Unset all covers, then set the selected one
    await supabase.from('vehicle_photos').update({ is_cover: false }).eq('vehicle_id', id);
    await supabase.from('vehicle_photos').update({ is_cover: true }).eq('id', photoId);
    setPhotos((prev) => prev.map((p) => ({ ...p, is_cover: p.id === photoId })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealer) return;
    setError(null);
    setSaving(true);

    if (!form.brand.trim() || !form.model.trim()) {
      setError('Marca e modelo são obrigatórios');
      setSaving(false);
      return;
    }
    if (purchasePrice <= 0 || askingPrice <= 0) {
      setError('Valor de compra e valor de venda são obrigatórios');
      setSaving(false);
      return;
    }

    const payload = {
      dealer_id: dealer.id,
      brand: form.brand.trim(),
      model: form.model.trim(),
      year_manufacture: form.year_manufacture ? parseInt(form.year_manufacture) : null,
      year_model: form.year_model ? parseInt(form.year_model) : null,
      color: form.color || null,
      mileage: form.mileage ? parseInt(form.mileage) : null,
      fuel: form.fuel || null,
      transmission: form.transmission || null,
      plate: form.plate || null,
      chassis: form.chassis || null,
      engine: form.engine || null,
      doors: form.doors ? parseInt(form.doors) : null,
      description: form.description || null,
      purchase_price: purchasePrice,
      asking_price: askingPrice,
      min_price: minPrice > 0 ? minPrice : null,
      profit_margin: parseFloat(profitMargin.toFixed(2)),
      status: form.status,
      updated_at: new Date().toISOString(),
    };

    if (isEdit) {
      const { error: updateErr } = await supabase.from('vehicles').update(payload).eq('id', id!);
      if (updateErr) {
        console.error('Erro ao salvar veículo:', updateErr);
        setError('Não foi possível salvar o veículo. Verifique os dados e tente novamente.');
        setSaving(false);
        return;
      }
      navigate(`/veiculo/${id}`);
    } else {
      const { data, error: insertErr } = await supabase
        .from('vehicles')
        .insert(payload)
        .select()
        .single();

      if (insertErr) {
        console.error('Erro ao cadastrar veículo:', insertErr);
        setError('Não foi possível cadastrar o veículo. Verifique os dados e tente novamente.');
        setSaving(false);
        return;
      }

      if (pendingFiles.length > 0) {
        await uploadFiles(pendingFiles, data.id);
      }
      navigate(`/veiculo/${data.id}`);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={isEdit ? `/veiculo/${id}` : '/estoque'} className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors group animate-fade-in">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
      </Link>

      <div className="mb-8 animate-fade-in-down">
        <h1 className="text-3xl font-extrabold text-white">
          {isEdit ? 'Editar veículo' : 'Cadastrar veículo'}
        </h1>
        <p className="text-navy-300 text-sm mt-1">
          {isEdit ? 'Atualize os dados e fotos do veículo' : 'Preencha as informações do veículo para adicioná-lo ao seu estoque'}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados do veículo */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Dados do veículo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Marca *" required>
              <input type="text" value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="Ex: Toyota" className={inputClass} />
            </Field>
            <Field label="Modelo *" required>
              <input type="text" value={form.model} onChange={(e) => update('model', e.target.value)} placeholder="Ex: Corolla" className={inputClass} />
            </Field>
            <Field label="Cor">
              <input type="text" value={form.color} onChange={(e) => update('color', e.target.value)} placeholder="Ex: Prata" className={inputClass} />
            </Field>
            <Field label="Ano de fabricação">
              <input type="number" value={form.year_manufacture} onChange={(e) => update('year_manufacture', e.target.value)} placeholder="Ex: 2020" className={inputClass} />
            </Field>
            <Field label="Ano do modelo">
              <input type="number" value={form.year_model} onChange={(e) => update('year_model', e.target.value)} placeholder="Ex: 2021" className={inputClass} />
            </Field>
            <Field label="Quilometragem">
              <input type="number" value={form.mileage} onChange={(e) => update('mileage', e.target.value)} placeholder="Ex: 45000" className={inputClass} />
            </Field>
            <Field label="Combustível">
              <select value={form.fuel} onChange={(e) => update('fuel', e.target.value)} className={inputClass}>
                <option value="">Selecione</option>
                {fuelOptions.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Câmbio">
              <select value={form.transmission} onChange={(e) => update('transmission', e.target.value)} className={inputClass}>
                <option value="">Selecione</option>
                {transmissionOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Portas">
              <input type="number" value={form.doors} onChange={(e) => update('doors', e.target.value)} placeholder="Ex: 4" className={inputClass} />
            </Field>
            <Field label="Placa">
              <input type="text" value={form.plate} onChange={(e) => update('plate', e.target.value.toUpperCase())} placeholder="ABC1234" className={inputClass} />
            </Field>
            <Field label="Chassi">
              <input type="text" value={form.chassis} onChange={(e) => update('chassis', e.target.value)} placeholder="9BWZZZ377VT..." className={inputClass} />
            </Field>
            <Field label="Motorização">
              <input type="text" value={form.engine} onChange={(e) => update('engine', e.target.value)} placeholder="Ex: 1.8 16V" className={inputClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Descrição / Observações">
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Detalhes sobre o veículo, acessórios, estado de conservação..." className={`${inputClass} resize-none`} />
            </Field>
          </div>
        </section>

        {/* Dados financeiros */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gold-400" style={{ boxShadow: '0 0 8px rgba(212,168,67,0.5)' }} />
            Dados financeiros
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Valor pago (custo) *">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input type="number" step="0.01" value={form.purchase_price} onChange={(e) => update('purchase_price', e.target.value)} placeholder="0,00" className={`${inputClass} pl-9`} />
              </div>
            </Field>
            <Field label="Valor de venda *">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input type="number" step="0.01" value={form.asking_price} onChange={(e) => update('asking_price', e.target.value)} placeholder="0,00" className={`${inputClass} pl-9`} />
              </div>
            </Field>
            <Field label="Valor mínimo aceito">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input type="number" step="0.01" value={form.min_price} onChange={(e) => update('min_price', e.target.value)} placeholder="0,00" className={`${inputClass} pl-9`} />
              </div>
            </Field>
          </div>

          {/* Resumo financeiro */}
          {purchasePrice > 0 && askingPrice > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-navy-900/50 rounded-xl border border-navy-600/30">
              <Metric label="Lucro bruto" value={formatBRL(profitValue)} color={profitValue >= 0 ? 'text-success-400' : 'text-error-400'} />
              <Metric label="Margem" value={`${profitMargin.toFixed(1)}%`} color={profitMargin >= 0 ? 'text-success-400' : 'text-error-400'} />
              {minPrice > 0 && <Metric label="Lucro mínimo" value={formatBRL(minProfit)} color={minProfit >= 0 ? 'text-accent-400' : 'text-error-400'} />}
              <Metric label="Status" value={form.status === 'available' ? 'Disponível' : form.status === 'reserved' ? 'Reservado' : 'Vendido'} color="text-white" />
            </div>
          )}

          <div className="mt-4">
            <Field label="Status do veículo">
              <select value={form.status} onChange={(e) => update('status', e.target.value as FormData['status'])} className={inputClass}>
                <option value="available">Disponível</option>
                <option value="reserved">Reservado</option>
                <option value="sold">Vendido</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Fotos */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
              Fotos do veículo
            </h2>
            {uploading && <Loader2 size={18} className="animate-spin text-accent-400" />}
          </div>

          <label className="group flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-navy-600/40 rounded-2xl cursor-pointer hover:border-accent-500/40 hover:bg-accent-500/5 transition-all mb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl glass flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImagePlus size={24} className="text-navy-300 group-hover:text-accent-400 transition-colors" />
              </div>
              <span className="text-sm text-navy-300 group-hover:text-white transition-colors">
                {isEdit ? 'Clique para adicionar mais fotos' : 'Clique para adicionar fotos (opcional)'}
              </span>
            </div>
            <input type="file" accept="image/*" multiple onChange={handleSelectFiles} className="hidden" />
          </label>

          {photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-navy-600/40 hover-lift">
                  <img src={photo.url} alt="Veículo" className="w-full h-full object-cover" />
                  {photo.is_cover && (
                    <span className="absolute top-2 left-2 text-xs bg-accent-500 text-white px-2 py-0.5 rounded-full font-medium">
                      Capa
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!photo.is_cover && (
                      <button type="button" onClick={() => handleSetCover(photo.id)} className="text-xs bg-accent-500 hover:bg-accent-600 text-white px-2 py-1 rounded">
                        Capa
                      </button>
                    )}
                    <button type="button" onClick={() => handleDeletePhoto(photo.id, photo.url)} className="bg-error-500 hover:bg-error-600 text-white p-1.5 rounded">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : pendingPreviews.length > 0 ? null : (
            <div className="text-center py-6">
              <Car size={28} className="text-navy-500 mx-auto mb-2" />
              <p className="text-sm text-navy-400">Nenhuma foto adicionada</p>
            </div>
          )}

          {pendingPreviews.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-navy-300 mb-2">
                {photos.length > 0 ? 'Fotos novas (enviadas após salvar):' : 'Fotos selecionadas (enviadas após salvar):'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pendingPreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-accent-500/30 hover-lift">
                    <img src={src} alt="Pré-visualização" className="w-full h-full object-cover" />
                    {photos.length === 0 && i === 0 && (
                      <span className="absolute top-2 left-2 text-xs bg-accent-500 text-white px-2 py-0.5 rounded-full font-medium">
                        Capa
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removePendingFile(i)} className="bg-error-500 hover:bg-error-600 text-white p-1.5 rounded">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Link to={isEdit ? `/veiculo/${id}` : '/estoque'} className="px-5 py-3 rounded-xl text-navy-200 hover:bg-navy-700/40 font-medium text-sm transition-all hover:scale-105 active:scale-95">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isEdit ? 'Salvar alterações' : 'Cadastrar veículo'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass = 'w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all duration-300 text-sm';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">
        {label}{required && <span className="text-accent-400"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-xs text-navy-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-semibold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
