import React from 'react';
import { Car, ExternalLink, Calendar, Gauge, Fuel, ShieldCheck, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Vehicle, VehiclePhoto } from '@/lib/supabase';
import { formatCurrency, formatNumber } from '@/lib/format';

export type VehicleInterestInfo = {
  id?: string;
  brand: string;
  model: string;
  year_model?: number | null;
  year_manufacture?: number | null;
  asking_price?: number | null;
  color?: string | null;
  plate?: string | null;
  mileage?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  status?: 'available' | 'reserved' | 'sold' | string;
  cover_url?: string | null;
  photos?: VehiclePhoto[];
};

interface VehicleChatHeaderProps {
  vehicle: VehicleInterestInfo | null;
  onSelectVehicle?: () => void;
  className?: string;
}

export function VehicleChatHeader({
  vehicle,
  onSelectVehicle,
  className = '',
}: VehicleChatHeaderProps) {
  if (!vehicle) {
    return (
      <div
        className={`px-4 py-2.5 bg-navy-800/40 border-b border-navy-700/40 flex items-center justify-between gap-3 text-xs ${className}`}
      >
        <div className="flex items-center gap-2 text-navy-400">
          <Car size={15} className="text-navy-500" />
          <span>Nenhum veículo vinculado a este atendimento</span>
        </div>
        {onSelectVehicle && (
          <button
            onClick={onSelectVehicle}
            className="flex items-center gap-1 text-[11px] font-medium text-accent-400 hover:text-accent-300 hover:underline"
          >
            <Tag size={12} /> Vincular veículo do estoque
          </button>
        )}
      </div>
    );
  }

  const coverUrl =
    vehicle.cover_url ||
    (vehicle.photos && vehicle.photos.length > 0
      ? vehicle.photos.find((p) => p.is_cover)?.url || vehicle.photos[0].url
      : null);

  const statusLabelMap: Record<string, { label: string; color: string }> = {
    available: { label: 'Disponível', color: 'bg-success-500/15 text-success-400 border-success-500/30' },
    reserved: { label: 'Reservado', color: 'bg-warning-500/15 text-warning-400 border-warning-500/30' },
    sold: { label: 'Vendido', color: 'bg-navy-600/30 text-navy-400 border-navy-500/30' },
  };

  const statusInfo = statusLabelMap[vehicle.status || 'available'] || statusLabelMap.available;

  return (
    <div
      className={`px-4 py-2.5 bg-gradient-to-r from-navy-900/90 via-navy-850/80 to-navy-900/90 border-b border-navy-600/30 backdrop-blur-md flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Vehicle photo / thumbnail */}
        <div className="w-12 h-10 rounded-lg overflow-hidden bg-navy-800 border border-navy-600/40 flex-shrink-0 flex items-center justify-center relative shadow-sm">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <Car size={20} className="text-accent-400/60" />
          )}
        </div>

        {/* Title, Year, and Key Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-white tracking-tight truncate">
              {vehicle.brand} {vehicle.model}
            </span>
            {vehicle.year_model && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-navy-700/60 text-navy-300 font-medium border border-navy-600/30">
                {vehicle.year_manufacture ? `${vehicle.year_manufacture}/` : ''}
                {vehicle.year_model}
              </span>
            )}
            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[11px] text-navy-400 mt-0.5">
            {vehicle.asking_price != null && vehicle.asking_price > 0 && (
              <span className="font-extrabold text-gold-400 text-xs">
                {formatCurrency(vehicle.asking_price)}
              </span>
            )}
            {vehicle.plate && (
              <span className="font-mono text-[10px] text-navy-300 bg-navy-800 px-1 rounded border border-navy-700">
                {vehicle.plate}
              </span>
            )}
            {vehicle.mileage != null && vehicle.mileage > 0 && (
              <span className="flex items-center gap-0.5">
                <Gauge size={10} className="text-navy-500" />
                {formatNumber(vehicle.mileage)} km
              </span>
            )}
            {vehicle.transmission && (
              <span className="hidden sm:inline-block">· {vehicle.transmission}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {vehicle.id ? (
          <Link
            to={`/veiculos/${vehicle.id}`}
            target="_blank"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-navy-800/80 hover:bg-navy-700 text-accent-300 border border-navy-600/40 text-[11px] font-medium transition-all"
            title="Abrir ficha completa do veículo"
          >
            <span>Ficha</span>
            <ExternalLink size={11} />
          </Link>
        ) : onSelectVehicle ? (
          <button
            onClick={onSelectVehicle}
            className="text-[11px] px-2 py-1 rounded bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 transition-colors"
          >
            Trocar
          </button>
        ) : null}
      </div>
    </div>
  );
}
