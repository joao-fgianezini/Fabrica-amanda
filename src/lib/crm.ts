import type { LeadSource, LeadStatus, InteractionType, FollowUpType } from '@/lib/supabase';

export const LEAD_SOURCES: { value: LeadSource; label: string; icon: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram' },
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'olx', label: 'OLX', icon: 'olx' },
  { value: 'webmotors', label: 'Webmotors', icon: 'webmotors' },
  { value: 'mercado_livre', label: 'Mercado Livre', icon: 'mercado_livre' },
  { value: 'google', label: 'Google', icon: 'google' },
  { value: 'qr_code', label: 'QR Code', icon: 'qr_code' },
  { value: 'site', label: 'Site', icon: 'site' },
  { value: 'referral', label: 'Indicação', icon: 'referral' },
  { value: 'walk_in', label: 'Loja Física', icon: 'walk_in' },
  { value: 'other', label: 'Outros', icon: 'other' },
];

export const PIPELINE_STAGES: { value: LeadStatus; label: string; color: string; bgColor: string }[] = [
  { value: 'new', label: 'Novo', color: 'text-accent-300', bgColor: 'bg-accent-500/10 border-accent-500/30' },
  { value: 'contacted', label: 'Contatado', color: 'text-navy-200', bgColor: 'bg-navy-500/10 border-navy-500/30' },
  { value: 'qualified', label: 'Qualificado', color: 'text-warning-400', bgColor: 'bg-warning-500/10 border-warning-500/30' },
  { value: 'proposal', label: 'Proposta', color: 'text-gold-400', bgColor: 'bg-gold-500/10 border-gold-500/30' },
  { value: 'negotiation', label: 'Negociação', color: 'text-gold-300', bgColor: 'bg-gold-500/15 border-gold-500/40' },
  { value: 'won', label: 'Ganho', color: 'text-success-400', bgColor: 'bg-success-500/10 border-success-500/30' },
  { value: 'lost', label: 'Perdido', color: 'text-error-400', bgColor: 'bg-error-500/10 border-error-500/30' },
];

export function sourceLabel(source: string): string {
  return LEAD_SOURCES.find((s) => s.value === source)?.label || source;
}

export function statusLabelCRM(status: string): string {
  return PIPELINE_STAGES.find((s) => s.value === status)?.label || status;
}

export function statusColorCRM(status: string): string {
  const stage = PIPELINE_STAGES.find((s) => s.value === status);
  if (!stage) return '';
  return stage.bgColor;
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-success-400 bg-success-500/15 border-success-500/30';
  if (score >= 60) return 'text-warning-400 bg-warning-500/15 border-warning-500/30';
  if (score >= 40) return 'text-accent-300 bg-accent-500/15 border-accent-500/30';
  return 'text-navy-200 bg-navy-500/15 border-navy-500/30';
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Quente';
  if (score >= 60) return 'Morno';
  if (score >= 40) return 'Frio';
  return 'Frio';
}

export const INTERACTION_TYPES: { value: InteractionType; label: string; icon: string }[] = [
  { value: 'call', label: 'Ligação', icon: 'call' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { value: 'email', label: 'E-mail', icon: 'email' },
  { value: 'message', label: 'Mensagem', icon: 'message' },
  { value: 'visit', label: 'Visita', icon: 'visit' },
  { value: 'test_drive', label: 'Test Drive', icon: 'test_drive' },
  { value: 'proposal_sent', label: 'Proposta Enviada', icon: 'proposal_sent' },
  { value: 'financing_sent', label: 'Financiamento', icon: 'financing_sent' },
  { value: 'note', label: 'Nota', icon: 'note' },
];

export const FOLLOW_UP_TYPES: { value: FollowUpType; label: string }[] = [
  { value: 'call', label: 'Ligação' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'E-mail' },
  { value: 'visit', label: 'Visita' },
  { value: 'reminder', label: 'Lembrete' },
];

export function interactionLabel(type: string): string {
  return INTERACTION_TYPES.find((t) => t.value === type)?.label || type;
}

export function followUpTypeLabel(type: string): string {
  return FOLLOW_UP_TYPES.find((t) => t.value === type)?.label || type;
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Nunca';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffH < 24) return `${diffH}h atrás`;
  if (diffD < 30) return `${diffD}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

export function isOverdue(scheduledAt: string, status: string): boolean {
  if (status !== 'pending') return false;
  return new Date(scheduledAt) < new Date();
}
