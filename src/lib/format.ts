export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatMileage(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${formatNumber(value)} km`;
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Disponível',
    reserved: 'Reservado',
    sold: 'Vendido',
    ongoing: 'Em andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    draft: 'Rascunho',
    submitted: 'Enviada',
    processing: 'Processando',
    analysis: 'Em análise',
    approved: 'Aprovada',
    approved_with_condition: 'Aprovada com condição',
    rejected: 'Recusada',
    expired: 'Expirada',
    converted: 'Convertida em venda',
    created: 'Criada na Credere',
    failed: 'Falhou',
    no_results: 'Sem resultados',
    pending: 'Pendente',
    draft_atpv: 'Rascunho',
    ready_atpv: 'Pronto para envio',
    submitted_atpv: 'Enviado ao Detran',
    completed_atpv: 'Transferência concluída',
    cancelled_atpv: 'Cancelado',
  };
  return labels[status] || status;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-success-500/15 text-success-500 border-success-500/30',
    reserved: 'bg-warning-500/15 text-warning-500 border-warning-500/30',
    sold: 'bg-error-500/15 text-error-500 border-error-500/30',
    ongoing: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
    completed: 'bg-success-500/15 text-success-500 border-success-500/30',
    cancelled: 'bg-error-500/15 text-error-500 border-error-500/30',
    draft: 'bg-navy-600/30 text-navy-200 border-navy-500/30',
    submitted: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
    processing: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
    analysis: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
    approved: 'bg-success-500/15 text-success-400 border-success-500/30',
    approved_with_condition: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
    rejected: 'bg-error-500/15 text-error-400 border-error-500/30',
    expired: 'bg-navy-600/30 text-navy-300 border-navy-500/30',
    converted: 'bg-success-500/15 text-success-400 border-success-500/30',
    created: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
    failed: 'bg-error-500/15 text-error-400 border-error-500/30',
    no_results: 'bg-navy-600/30 text-navy-300 border-navy-500/30',
    pending: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
    draft_atpv: 'bg-navy-600/30 text-navy-200 border-navy-500/30',
    ready_atpv: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
    submitted_atpv: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
    completed_atpv: 'bg-success-500/15 text-success-400 border-success-500/30',
    cancelled_atpv: 'bg-error-500/15 text-error-400 border-error-500/30',
  };
  return colors[status] || 'bg-navy-600/30 text-navy-200 border-navy-500/30';
}

export function maskCPF(document: string | null): string {
  if (!document) return '—';
  const digits = document.replace(/\D/g, '');
  if (digits.length === 11) {
    return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
  }
  if (digits.length === 14) {
    return `**.${digits.slice(2, 5)}.${digits.slice(5, 8)}/****-**`;
  }
  return document;
}
