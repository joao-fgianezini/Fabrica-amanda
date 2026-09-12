import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Tag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type ExpenseCategory } from '@/lib/supabase';

type Props = {
  expense?: { id: string; description: string; amount: number; category_id: string | null; due_date: string | null; paid_date: string | null; status: string; recurrence: string; is_fixed: boolean; notes: string | null } | null;
  categories: ExpenseCategory[];
  onClose: () => void;
  onSaved: () => void;
};

export function ExpenseModal({ expense, categories, onClose, onSaved }: Props) {
  const { dealer } = useAuth();
  const isEdit = !!expense;
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [categoryId, setCategoryId] = useState(expense?.category_id || '');
  const [dueDate, setDueDate] = useState(expense?.due_date || '');
  const [paidDate, setPaidDate] = useState(expense?.paid_date || '');
  const [status, setStatus] = useState(expense?.status || 'pending');
  const [recurrence, setRecurrence] = useState(expense?.recurrence || 'none');
  const [isFixed, setIsFixed] = useState(expense?.is_fixed || false);
  const [notes, setNotes] = useState(expense?.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2a93e8');

  async function handleSaveCategory() {
    if (!dealer || !newCatName.trim()) return;
    const { data, error } = await supabase
      .from('expense_categories')
      .insert({ dealer_id: dealer.id, name: newCatName.trim(), color: newCatColor })
      .select()
      .single();
    if (error) { console.error('Erro ao criar categoria:', error); setError('Não foi possível criar a categoria. Tente novamente.'); return; }
    if (data) {
      setCategories([...categories, data as ExpenseCategory]);
      setCategoryId(data.id);
      setShowNewCat(false);
      setNewCatName('');
    }
  }

  const [categoriesState, setCategories] = useState(categories);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealer) return;
    setError(null);
    setSaving(true);

    if (!description.trim() || !amount) {
      setError('Descrição e valor são obrigatórios');
      setSaving(false);
      return;
    }

    const payload = {
      dealer_id: dealer.id,
      description: description.trim(),
      amount: parseFloat(amount),
      category_id: categoryId || null,
      due_date: dueDate || null,
      paid_date: status === 'paid' ? (paidDate || new Date().toISOString().split('T')[0]) : null,
      status,
      recurrence,
      is_fixed: isFixed,
      notes: notes || null,
    };

    if (isEdit) {
      const { error } = await supabase.from('expenses').update(payload).eq('id', expense!.id);
      if (error) { console.error('Erro ao salvar despesa:', error); setError('Não foi possível salvar a despesa. Verifique os dados e tente novamente.'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('expenses').insert(payload);
      if (error) { console.error('Erro ao cadastrar despesa:', error); setError('Não foi possível cadastrar a despesa. Verifique os dados e tente novamente.'); setSaving(false); return; }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div className="glass-strong rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-drop-in border border-navy-600/30 relative" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center justify-between p-6 border-b border-navy-600/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Editar despesa' : 'Nova despesa'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-navy-300 hover:bg-navy-700/50 hover:text-white transition-all hover:scale-110 active:scale-95">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative input-anim rounded-xl">
            <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Descrição *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel da loja"
              required
              className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Valor *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  required
                  className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => e.target.value === '__new__' ? setShowNewCat(true) : setCategoryId(e.target.value)}
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500"
              >
                <option value="">Selecione</option>
                {categoriesState.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                <option value="__new__">+ Nova categoria</option>
              </select>
            </div>
          </div>

          {showNewCat && (
            <div className="flex items-center gap-2 p-3 bg-navy-900/40 rounded-xl border border-navy-600/30 animate-drop-in">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nome da categoria"
                className="flex-1 bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
              />
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-navy-600/40 bg-navy-900/50 cursor-pointer"
              />
              <button type="button" onClick={handleSaveCategory} className="ripple-btn px-3 py-2 rounded-lg bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 transition-all hover:scale-105 active:scale-95">
                <Tag size={16} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Vencimento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Recorrência</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500"
              >
                <option value="none">Única</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500"
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
              </select>
            </div>
            {status === 'paid' && (
              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Data pagamento</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 [color-scheme:dark]"
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 p-3 bg-navy-900/40 rounded-xl border border-navy-600/30 cursor-pointer hover:border-accent-500/40 transition-all">
            <input
              type="checkbox"
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
              className="w-4 h-4 rounded accent-accent-500"
            />
            <div>
              <span className="text-sm text-white font-medium">Despesa fixa mensal</span>
              <p className="text-xs text-navy-400">Despesas fixas permanecem no sistema ao encerrar o mês</p>
            </div>
          </label>

          <div>
            <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas adicionais..."
              className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 animate-fade-in">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 animate-pulse" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/40 text-sm font-medium transition-all hover:scale-105 active:scale-95">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {isEdit ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
