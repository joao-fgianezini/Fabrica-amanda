import { supabase, type ExpenseWithCategory, type MonthlyClosure } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';

export type ClosureSummary = {
  totalExpenses: number;
  totalPaidExpenses: number;
  totalPendingExpenses: number;
  totalSales: number;
  totalProfit: number;
  vehiclesSold: number;
  vehiclesInStock: number;
  fixedExpensesCount: number;
  expensesByCategory: { name: string; color: string; total: number }[];
};

export type ClosureReportData = {
  expenses: ExpenseWithCategory[];
  sales: {
    id: string;
    client_name: string | null;
    vehicle_label: string;
    sale_price: number;
    purchase_price: number;
    profit: number | null;
    sale_date: string;
    payment_method: string | null;
  }[];
  soldVehicles: {
    id: string;
    brand: string;
    model: string;
    year_model: number | null;
    sale_price: number;
    purchase_price: number;
    profit: number | null;
  }[];
  summary: ClosureSummary;
};

export async function gatherClosureData(dealerId: string): Promise<ClosureReportData> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [expRes, salesRes, vehiclesRes] = await Promise.all([
    supabase
      .from('expenses')
      .select('*, category:expense_categories(*)')
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false }),
    supabase
      .from('sales')
      .select('id, client_name, sale_price, purchase_price, profit, sale_date, payment_method, vehicle_id, notes')
      .eq('dealer_id', dealerId)
      .gte('sale_date', monthStart.toISOString().split('T')[0])
      .lte('sale_date', monthEnd.toISOString().split('T')[0])
      .order('sale_date', { ascending: false }),
    supabase
      .from('vehicles')
      .select('id, brand, model, year_model, asking_price, purchase_price, status')
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false }),
  ]);

  const expenses = (expRes.data as unknown as ExpenseWithCategory[]) || [];

  const salesRaw = salesRes.data || [];
  const sales = await Promise.all(
    salesRaw.map(async (s: { id: string; client_name: string | null; sale_price: number; purchase_price: number; profit: number | null; sale_date: string; payment_method: string | null; vehicle_id: string | null; notes: string | null }) => {
      let vehicleLabel = 'Veículo não vinculado';
      if (s.vehicle_id) {
        const { data: v } = await supabase
          .from('vehicles')
          .select('brand, model, year_model')
          .eq('id', s.vehicle_id)
          .maybeSingle();
        if (v) vehicleLabel = `${v.brand} ${v.model}${v.year_model ? ' ' + v.year_model : ''}`;
      }
      return {
        id: s.id,
        client_name: s.client_name,
        vehicle_label: vehicleLabel,
        sale_price: Number(s.sale_price),
        purchase_price: Number(s.purchase_price),
        profit: s.profit !== null ? Number(s.profit) : null,
        sale_date: s.sale_date,
        payment_method: s.payment_method,
      };
    })
  );

  const soldVehicles = (vehiclesRes.data || [])
    .filter((v: { status: string }) => v.status === 'sold')
    .map((v: { id: string; brand: string; model: string; year_model: number | null; asking_price: number; purchase_price: number }) => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      year_model: v.year_model,
      sale_price: Number(v.asking_price),
      purchase_price: Number(v.purchase_price),
      profit: Number(v.asking_price) - Number(v.purchase_price),
    }));

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalPaidExpenses = expenses.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);
  const totalPendingExpenses = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + Number(e.amount), 0);
  const totalSales = sales.reduce((s, sale) => s + sale.sale_price, 0);
  const totalProfit = sales.reduce((s, sale) => s + (sale.profit || 0), 0) + soldVehicles.reduce((s, v) => s + v.profit, 0);
  const vehiclesSold = soldVehicles.length;
  const vehiclesInStock = (vehiclesRes.data || []).filter((v: { status: string }) => v.status !== 'sold').length;
  const fixedExpensesCount = expenses.filter((e) => e.is_fixed).length;

  const catMap = new Map<string, { name: string; color: string; total: number }>();
  for (const e of expenses) {
    const key = e.category_id || 'none';
    const existing = catMap.get(key) || { name: e.category?.name || 'Sem categoria', color: e.category?.color || '#64748b', total: 0 };
    existing.total += Number(e.amount);
    catMap.set(key, existing);
  }
  const expensesByCategory = Array.from(catMap.values()).sort((a, b) => b.total - a.total);

  return {
    expenses,
    sales,
    soldVehicles,
    summary: {
      totalExpenses,
      totalPaidExpenses,
      totalPendingExpenses,
      totalSales,
      totalProfit,
      vehiclesSold,
      vehiclesInStock,
      fixedExpensesCount,
      expensesByCategory,
    },
  };
}

export async function executeMonthClosure(dealerId: string): Promise<MonthlyClosure> {
  const now = new Date();
  const periodMonth = now.getMonth() + 1;
  const periodYear = now.getFullYear();

  const reportData = await gatherClosureData(dealerId);

  const { data: existing } = await supabase
    .from('monthly_closures')
    .select('id')
    .eq('dealer_id', dealerId)
    .eq('period_month', periodMonth)
    .eq('period_year', periodYear)
    .maybeSingle();

  if (existing) {
    throw new Error('Este mês já foi encerrado. Consulte o histórico para acessar o relatório.');
  }

  const summaryTotals = {
    total_expenses: reportData.summary.totalExpenses,
    total_paid_expenses: reportData.summary.totalPaidExpenses,
    total_pending_expenses: reportData.summary.totalPendingExpenses,
    total_sales: reportData.summary.totalSales,
    total_profit: reportData.summary.totalProfit,
    vehicles_sold: reportData.summary.vehiclesSold,
    vehicles_in_stock: reportData.summary.vehiclesInStock,
    fixed_expenses_count: reportData.summary.fixedExpensesCount,
  };

  const { data, error } = await supabase
    .from('monthly_closures')
    .insert({
      dealer_id: dealerId,
      period_month: periodMonth,
      period_year: periodYear,
      report_data: reportData as unknown as Record<string, unknown>,
      summary_totals: summaryTotals,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Erro ao salvar encerramento: ${error.message}`);

  // Delete non-fixed expenses
  await supabase.from('expenses').delete().eq('dealer_id', dealerId).eq('is_fixed', false);

  // Delete sold vehicles
  await supabase.from('vehicles').delete().eq('dealer_id', dealerId).eq('status', 'sold');

  // Delete all sales records (they're archived in the report)
  await supabase.from('sales').delete().eq('dealer_id', dealerId);

  return data as MonthlyClosure;
}

export function generateClosurePDF(closure: MonthlyClosure, dealerName: string, dealerLogoUrl?: string | null) {
  const report = closure.report_data as unknown as ClosureReportData;
  const s = report.summary;
  const monthName = new Date(closure.period_year, closure.period_month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const today = new Date(closure.closed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const logoHtml = dealerLogoUrl
    ? `<img src="${dealerLogoUrl}" alt="${dealerName}" style="max-height:48px;max-width:140px;object-fit:contain;" />`
    : '';
  const profitColor = s.totalProfit >= 0 ? '#155724' : '#721c24';
  const profitBg = s.totalProfit >= 0 ? '#d4edda' : '#f8d7da';

  const expensesRows = report.expenses
    .map(
      (e) => `<tr>
        <td>${e.description}</td>
        <td>${e.category?.name || '—'}</td>
        <td style="text-align:right">${formatCurrency(Number(e.amount))}</td>
        <td>${e.status === 'paid' ? 'Pago' : 'Pendente'}</td>
        <td>${e.is_fixed ? 'Sim' : 'Não'}</td>
      </tr>`
    )
    .join('');

  const salesRows = report.sales
    .map(
      (sale) => `<tr>
        <td>${sale.vehicle_label}</td>
        <td>${sale.client_name || '—'}</td>
        <td style="text-align:right">${formatCurrency(sale.sale_price)}</td>
        <td style="text-align:right">${formatCurrency(sale.purchase_price)}</td>
        <td style="text-align:right;color:${(sale.profit || 0) >= 0 ? '#155724' : '#721c24'};font-weight:700">${formatCurrency(sale.profit || 0)}</td>
      </tr>`
    )
    .join('');

  const soldVehiclesRows = report.soldVehicles
    .map(
      (v) => `<tr>
        <td>${v.brand} ${v.model}</td>
        <td>${v.year_model || '—'}</td>
        <td style="text-align:right">${formatCurrency(v.sale_price)}</td>
        <td style="text-align:right">${formatCurrency(v.purchase_price)}</td>
        <td style="text-align:right;color:${(v.profit || 0) >= 0 ? '#155724' : '#721c24'};font-weight:700">${formatCurrency(v.profit || 0)}</td>
      </tr>`
    )
    .join('');

  const catBreakdown = s.expensesByCategory
    .map(
      (c) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <div style="width:12px;height:12px;border-radius:50%;background:${c.color}"></div>
        <span style="flex:1;font-size:13px;color:#333">${c.name}</span>
        <span style="font-size:13px;font-weight:700;color:#1a1a1a">${formatCurrency(c.total)}</span>
      </div>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Relatório de Encerramento - ${monthName}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Helvetica Neue',Arial,sans-serif; background:#f0f2f5; color:#1a1a1a; padding:20px; }
  .doc { max-width:800px; margin:0 auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 2px 20px rgba(0,0,0,0.08); }
  .header { background:linear-gradient(135deg,#1e3a5f 0%,#2b5cb8 100%); color:white; padding:30px 40px; display:flex; align-items:center; justify-content:space-between; }
  .header-left { flex:1; }
  .header-right { flex-shrink:0; margin-left:20px; }
  .header h1 { font-size:22px; font-weight:700; }
  .header .subtitle { font-size:13px; opacity:0.8; margin-top:5px; }
  .header .date { font-size:12px; opacity:0.7; margin-top:8px; }
  .body { padding:30px 40px; }
  .summary-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:25px; }
  .summary-card { padding:16px; border-radius:10px; border:1px solid #e8edf3; background:#f5f7fa; }
  .summary-card .label { font-size:11px; color:#666; text-transform:uppercase; letter-spacing:0.5px; font-weight:600; }
  .summary-card .value { font-size:18px; font-weight:700; color:#1a1a1a; margin-top:4px; }
  .profit-card { background:${profitBg}; border-color:${profitColor}; }
  .profit-card .value { color:${profitColor}; }
  h2 { font-size:15px; color:#2b5cb8; border-left:4px solid #2b5cb8; padding-left:12px; margin:25px 0 15px; text-transform:uppercase; letter-spacing:0.5px; }
  table { width:100%; border-collapse:collapse; margin-bottom:20px; font-size:13px; }
  th { text-align:left; padding:10px 12px; background:#f0f4f8; color:#1e3a5f; font-weight:700; border-bottom:2px solid #d0d8e4; font-size:11px; text-transform:uppercase; }
  td { padding:10px 12px; border-bottom:1px solid #eef2f7; color:#333; }
  tr:hover td { background:#f8faff; }
  .actions { padding:0 40px 30px; text-align:center; }
  .btn-print { display:inline-block; padding:12px 32px; background:#2b5cb8; color:white; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; }
  .btn-print:hover { background:#1e3a5f; }
  .footer { padding:20px 40px; background:#f8f9fa; border-top:1px solid #e9ecef; text-align:center; font-size:11px; color:#999; }
  .footer-dealer { font-weight:700; color:#444; margin-bottom:4px; font-size:13px; }
  .cat-box { background:#f5f7fa; border:1px solid #e8edf3; border-radius:10px; padding:15px; margin-bottom:20px; }
  @media print { body { background:white; padding:0; } .doc { box-shadow:none; max-width:100%; } .actions { display:none; } }
</style>
</head>
<body>
<div class="doc">
  <div class="header">
    <div class="header-left">
      <h1>RELATÓRIO DE ENCERRAMENTO MENSAL</h1>
      <div class="subtitle">${dealerName} — ${monthName}</div>
      <div class="date">Encerrado em ${today}</div>
    </div>
    ${logoHtml ? `<div class="header-right">${logoHtml}</div>` : ''}
  </div>
  <div class="body">
    <h2>Resumo do Mês</h2>
    <div class="summary-grid">
      <div class="summary-card"><div class="label">Total de Despesas</div><div class="value">${formatCurrency(s.totalExpenses)}</div></div>
      <div class="summary-card"><div class="label">Total de Vendas</div><div class="value">${formatCurrency(s.totalSales)}</div></div>
      <div class="summary-card profit-card"><div class="label">Lucro Total</div><div class="value">${formatCurrency(s.totalProfit)}</div></div>
      <div class="summary-card"><div class="label">Despesas Pagas</div><div class="value">${formatCurrency(s.totalPaidExpenses)}</div></div>
      <div class="summary-card"><div class="label">Despesas Pendentes</div><div class="value">${formatCurrency(s.totalPendingExpenses)}</div></div>
      <div class="summary-card"><div class="label">Veículos Vendidos</div><div class="value">${s.vehiclesSold}</div></div>
      <div class="summary-card"><div class="label">Veículos em Estoque</div><div class="value">${s.vehiclesInStock}</div></div>
      <div class="summary-card"><div class="label">Despesas Fixas</div><div class="value">${s.fixedExpensesCount}</div></div>
    </div>

    ${s.expensesByCategory.length > 0 ? `<h2>Despesas por Categoria</h2><div class="cat-box">${catBreakdown}</div>` : ''}

    ${report.sales.length > 0 ? `<h2>Vendas do Mês</h2>
    <table>
      <thead><tr><th>Veículo</th><th>Cliente</th><th style="text-align:right">Venda</th><th style="text-align:right">Custo</th><th style="text-align:right">Lucro</th></tr></thead>
      <tbody>${salesRows}</tbody>
    </table>` : ''}

    ${report.soldVehicles.length > 0 ? `<h2>Veículos Vendidos</h2>
    <table>
      <thead><tr><th>Veículo</th><th>Ano</th><th style="text-align:right">Preço Venda</th><th style="text-align:right">Custo</th><th style="text-align:right">Lucro</th></tr></thead>
      <tbody>${soldVehiclesRows}</tbody>
    </table>` : ''}

    ${report.expenses.length > 0 ? `<h2>Despesas do Mês</h2>
    <table>
      <thead><tr><th>Descrição</th><th>Categoria</th><th style="text-align:right">Valor</th><th>Status</th><th>Fixa</th></tr></thead>
      <tbody>${expensesRows}</tbody>
    </table>` : ''}

    <div style="background:#f8f9fa;border-radius:10px;padding:15px;margin:20px 0;font-size:12px;line-height:1.6;color:#666;border:1px solid #e9ecef;">
      Este relatório é um registro permanente do encerramento do mês. Após o encerramento, as despesas não fixas, veículos vendidos e registros de vendas foram removidos do sistema. As despesas fixas, veículos em estoque e clientes foram mantidos para o próximo mês.
    </div>
  </div>
  <div class="actions">
    <button class="btn-print" onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>
  <div class="footer">
    ${dealerName ? `<div class="footer-dealer">${dealerName}</div>` : ''}
    Relatório de Encerramento — ${monthName} | Rede Auto Ribeirão
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) window.location.href = url;
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
