import type { ProviderResult } from '@/lib/financing-engine';
import { formatCurrency } from '@/lib/format';

export interface ProposalData {
  clientName: string;
  clientDocument: string | null;
  clientPhone: string | null;
  vehicleLabel: string;
  vehicleYear: number | null;
  vehiclePrice: number;
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  result: ProviderResult;
  dealerName?: string | null;
  dealerLogoUrl?: string | null;
  protocolNumber?: string | null;
}

export function generateProposal(data: ProposalData): void {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const r = data.result;
  const isApproved = r.status === 'approved';
  const statusLabel = isApproved ? 'APROVADO' : 'APROVADO COM CONDIÇÃO';
  const statusClass = isApproved ? 'status-approved' : 'status-condition';

  const formatBRL = (val: number | null) => {
    if (val === null || val === undefined) return '—';
    return formatCurrency(val);
  };

  const logoHtml = data.dealerLogoUrl ? `<img src="${data.dealerLogoUrl}" alt="${data.dealerName || ''}" style="max-height: 48px; max-width: 140px; object-fit: contain;" />` : '';
  const protocolHtml = data.protocolNumber ? `<div style="font-size:12px;opacity:0.8;margin-top:8px;">Protocolo: <strong>${data.protocolNumber}</strong></div>` : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Proposta de Financiamento - ${data.clientName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f0f2f5; color: #1a1a1a; padding: 20px; }
  .doc { max-width: 720px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1e3a5f 0%, #2b5cb8 100%); color: white; padding: 30px 40px; display: flex; align-items: center; justify-content: space-between; }
  .header-left { flex: 1; }
  .header-right { flex-shrink: 0; margin-left: 20px; }
  .header h1 { font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
  .header .subtitle { font-size: 13px; opacity: 0.8; margin-top: 5px; }
  .header .date { font-size: 12px; opacity: 0.7; margin-top: 10px; }
  .body { padding: 30px 40px; }
  .status-badge { display: inline-block; padding: 8px 20px; border-radius: 24px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 25px; }
  .status-approved { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
  .status-condition { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
  h2 { font-size: 15px; color: #2b5cb8; border-left: 4px solid #2b5cb8; padding-left: 12px; margin: 25px 0 15px; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .info-item { padding: 14px; background: #f5f7fa; border-radius: 10px; border: 1px solid #e8edf3; }
  .info-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
  .info-value { font-size: 15px; font-weight: 700; color: #1a1a1a; margin-top: 4px; }
  .highlight-box { background: #e8f4e8 !important; border-color: #4a9d4a !important; }
  .highlight-box .info-value { color: #2d7a2d; }
  .protocol-box { display: inline-block; padding: 10px 20px; background: #e8f4e8; border: 1px solid #4a9d4a; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
  .protocol-box strong { color: #2d7a2d; font-size: 16px; letter-spacing: 1px; }
  .bank-section { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 20px; margin: 20px 0; }
  .bank-section .bank-name { font-size: 16px; font-weight: 700; color: #1e3a5f; margin-bottom: 8px; }
  .bank-section .bank-url { color: #2b5cb8; font-weight: 600; text-decoration: none; word-break: break-all; font-size: 13px; }
  .conditions-box { background: #fff8e1; border: 1px solid #ffe082; border-radius: 10px; padding: 15px; margin: 15px 0; font-size: 13px; line-height: 1.6; color: #6d5800; }
  .disclaimer { background: #f8f9fa; border-radius: 10px; padding: 15px; margin: 20px 0; font-size: 12px; line-height: 1.6; color: #666; border: 1px solid #e9ecef; }
  .footer { padding: 20px 40px; background: #f8f9fa; border-top: 1px solid #e9ecef; text-align: center; font-size: 11px; color: #999; }
  .footer-dealer { font-weight: 700; color: #444; margin-bottom: 4px; font-size: 13px; }
  .actions { padding: 0 40px 30px; text-align: center; }
  .btn-print { display: inline-block; padding: 12px 32px; background: #2b5cb8; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  .btn-print:hover { background: #1e3a5f; }
  @media print { body { background: white; padding: 0; } .doc { box-shadow: none; max-width: 100%; } .actions { display: none; } }
</style>
</head>
<body>
<div class="doc">
  <div class="header">
    <div class="header-left">
      <h1>PROPOSTA DE FINANCIAMENTO</h1>
      <div class="subtitle">${data.dealerName ? data.dealerName : 'Rede Auto - Plataforma de Gestão Automotiva'}</div>
      <div class="date">Emitido em ${today}</div>
      ${protocolHtml}
    </div>
    ${logoHtml ? `<div class="header-right">${logoHtml}</div>` : ''}
  </div>
  <div class="body">
    ${data.protocolNumber ? `<div class="protocol-box">Protocolo da simulação: <strong>${data.protocolNumber}</strong></div>` : ''}
    <div class="status-badge ${statusClass}">${statusLabel} - ${r.institutionName}</div>

    <h2>Dados do Cliente</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Nome</div>
        <div class="info-value">${data.clientName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">CPF / CNPJ</div>
        <div class="info-value">${data.clientDocument || '—'}</div>
      </div>
      ${data.clientPhone ? `<div class="info-item">
        <div class="info-label">Telefone</div>
        <div class="info-value">${data.clientPhone}</div>
      </div>` : ''}
    </div>

    <h2>Dados do Veículo</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Veículo</div>
        <div class="info-value">${data.vehicleLabel}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Ano</div>
        <div class="info-value">${data.vehicleYear || '—'}</div>
      </div>
    </div>

    <h2>Condições da Proposta — ${r.institutionName}</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Valor do Veículo</div>
        <div class="info-value">${formatBRL(data.vehiclePrice)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Entrada</div>
        <div class="info-value">${formatBRL(r.downPayment)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Valor Financiado</div>
        <div class="info-value">${formatBRL(r.financedAmount)}</div>
      </div>
      <div class="info-item highlight-box">
        <div class="info-label">Parcela</div>
        <div class="info-value">${formatBRL(r.installmentAmount)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Prazo</div>
        <div class="info-value">${r.termMonths}x</div>
      </div>
      <div class="info-item">
        <div class="info-label">Taxa de Juros (a.a.)</div>
        <div class="info-value">${r.interestRate !== null ? r.interestRate + '%' : '—'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">CET (a.a.)</div>
        <div class="info-value">${r.cet !== null ? r.cet + '%' : '—'}</div>
      </div>
    </div>

    ${r.conditions ? `<div class="conditions-box"><strong>Condicoes:</strong> ${r.conditions}</div>` : ''}
    ${r.notes ? `<div class="conditions-box"><strong>Observacoes:</strong> ${r.notes}</div>` : ''}

    <div class="bank-section">
      <div class="bank-name">${r.institutionName}</div>
      <p style="font-size:13px;color:#444;margin-bottom:8px;">Para dar continuidade ao financiamento, acesse o canal oficial:</p>
      <a href="${r.financingUrl || '#'}" target="_blank" class="bank-url">${r.financingUrl || 'Consulte a instituicao'}</a>
    </div>

    <div class="disclaimer">
      Esta proposta refere-se a uma simulação real e válida, com condições efetivas de financiamento junto a ${r.institutionName}. Para formalizar o contrato, será necessária a apresentação da documentação do cliente, vistoria do veículo e validação cadastral final pela instituição financeira. Os valores apresentados foram calculados com base nas taxas e condições vigentes e podem sofrer ajustes em caso de alteração das informações prestadas.
    </div>
  </div>

  <div class="actions">
    <button class="btn-print" onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>

  <div class="footer">
    ${data.dealerName ? `<div class="footer-dealer">${data.dealerName}</div>` : ''}
    Documento gerado em ${today} | Rede Auto Ribeirão - Plataforma de Gestão Automotiva
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    // Popup blocked — fallback: navigate in same tab
    window.location.href = url;
  }
  // Revoke after 60 seconds
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
