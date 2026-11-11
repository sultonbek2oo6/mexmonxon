import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Wallet, Plus, Search, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

const money = (value) => `${Number(value || 0).toLocaleString('uz-UZ')} UZS`;
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const Payments = () => {
  const { isDarkMode, role } = useOutletContext();
  const isManager = role === 'manager';
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ category: 'Kommunal to‘lovlar', description: '', amount: '', date: today() });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [totals, paymentRows, expenseRows] = await Promise.all([
        api('/payments/summary'), api('/payments'), api('/payments/expenses')
      ]);
      setSummary(totals); setPayments(paymentRows); setExpenses(expenseRows);
    } catch (loadError) { setError(loadError.message || 'Moliyaviy ma’lumotlarni yuklab bo‘lmadi.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredPayments = payments.filter((payment) =>
    `${payment.ID} ${payment.GUEST_NAME || ''} ${payment.ROOM_NUMBER || ''} ${payment.PAYMENT_STATUS || ''}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredExpenses = expenses.filter((expense) =>
    `${expense.CATEGORY} ${expense.DESCRIPTION} ${expense.CREATED_BY_NAME || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const confirmPayment = async (payment) => {
    if (!window.confirm(`${payment.GUEST_NAME || 'Mehmon'} uchun ${money(payment.AMOUNT)} tushum sifatida tasdiqlansinmi?`)) return;
    try {
      await api(`/admin/payments/${payment.ID}`, { method: 'PUT', body: JSON.stringify({ status: 'paid' }) });
      await load();
    } catch (confirmError) { window.alert(confirmError.message); }
  };

  const saveExpense = async (event) => {
    event.preventDefault();
    try {
      await api('/payments/expenses', { method: 'POST', body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
      setExpenseOpen(false);
      setForm({ category: 'Kommunal to‘lovlar', description: '', amount: '', date: today() });
      await load();
    } catch (saveError) { window.alert(saveError.message); }
  };

  const cardClass = `rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`;
  const summaryCards = [
    { label: 'Kirim (to‘langan)', value: summary?.received, icon: ArrowDownLeft, color: 'text-emerald-400' },
    { label: 'Kutilayotgan tushum', value: summary?.pending, icon: Wallet, color: 'text-amber-400' },
    { label: 'Chiqim (xarajatlar)', value: summary?.spent, icon: ArrowUpRight, color: 'text-rose-400' },
    { label: 'Qoldiq', value: summary?.balance, icon: Wallet, color: Number(summary?.balance || 0) >= 0 ? 'text-sky-400' : 'text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Kirim va chiqim</h1><p className="mt-1 text-sm text-slate-400">To‘langan bronlar tushum hisoblanadi. Xarajatlar alohida qayd etiladi.</p></div>
        {isManager && <button onClick={() => setExpenseOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-500"><Plus className="h-4 w-4" />Xarajat kiritish</button>}
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{summaryCards.map(({ label, value, icon: Icon, color }) => <div key={label} className={`${cardClass} p-5`}><div className="flex items-center justify-between"><span className="text-sm text-slate-400">{label}</span><Icon className={`h-5 w-5 ${color}`} /></div><div className={`mt-3 text-2xl font-bold ${color}`}>{summary ? money(value) : '—'}</div></div>)}</div>

      <div className={`${cardClass} p-4`}><div className={`flex items-center gap-2 rounded-xl border px-3 py-2 md:max-w-md ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Mehmon, xona, xarajat turi bo‘yicha qidirish" className="w-full bg-transparent text-sm outline-none" /></div></div>
      {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">{error}</div>}

      <section className={`${cardClass} overflow-hidden`}>
        <div className="border-b border-slate-800/70 p-5"><h2 className="text-lg font-bold">Bron to‘lovlari</h2><p className="mt-1 text-xs text-slate-400">Faqat `paid` holatidagi to‘lovlar kirimga qo‘shiladi.</p></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="bg-slate-900/40 text-xs uppercase text-slate-400"><th className="p-4">Mehmon</th><th className="p-4">Xona / bron</th><th className="p-4">Summa</th><th className="p-4">Usul</th><th className="p-4">Holat</th><th className="p-4">Sana</th>{isManager && <th className="p-4 text-right">Amal</th>}</tr></thead><tbody className="divide-y divide-slate-800/60">
          {loading ? <tr><td colSpan={isManager ? 7 : 6} className="p-8 text-center text-slate-400">Yuklanmoqda…</td></tr>
            : filteredPayments.length ? filteredPayments.map((payment) => {
              const status = String(payment.PAYMENT_STATUS || '').trim().toLowerCase();
              const isPaid = ['paid', 'complete', 'completed', 'success', 'successful', 'confirmed'].includes(status);
              const isPending = ['pending', 'awaiting', 'awaiting payment'].includes(status);
              const statusLabel = isPaid ? 'To‘langan' : isPending ? 'Kutilmoqda' : status || '—';
              return <tr key={payment.ID} className={isDarkMode ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50'}><td className="p-4 font-medium">{payment.GUEST_NAME || '—'}</td><td className="p-4 text-slate-400">{payment.ROOM_NUMBER ? `Xona ${payment.ROOM_NUMBER}` : '—'} · #{payment.BOOKING_ID || '—'}</td><td className="p-4 font-semibold text-emerald-400">{money(payment.AMOUNT)}</td><td className="p-4 text-slate-300">{payment.PAYMENT_METHOD || '—'}</td><td className="p-4"><span className={`rounded-full border px-2.5 py-1 text-xs ${isPaid ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : isPending ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-slate-600 bg-slate-800 text-slate-300'}`}>{statusLabel}</span></td><td className="p-4 text-xs text-slate-400">{payment.TRANSACTION_DATE ? new Date(payment.TRANSACTION_DATE).toLocaleDateString('uz-UZ') : '—'}</td>{isManager && <td className="p-4 text-right">{isPending && <button onClick={() => confirmPayment(payment)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/15 px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-600/25"><CheckCircle2 className="h-4 w-4" />Tushum tasdiqlash</button>}</td>}</tr>;
            }) : <tr><td colSpan={isManager ? 7 : 6} className="p-8 text-center text-slate-400">To‘lov topilmadi.</td></tr>}
        </tbody></table></div>
      </section>

      <section className={`${cardClass} overflow-hidden`}>
        <div className="border-b border-slate-800/70 p-5"><h2 className="text-lg font-bold">Xarajatlar</h2><p className="mt-1 text-xs text-slate-400">Xodimlar maoshi, kommunal to‘lovlar, ta’mir va boshqa chiqimlar.</p></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="bg-slate-900/40 text-xs uppercase text-slate-400"><th className="p-4">Sana</th><th className="p-4">Turi</th><th className="p-4">Izoh</th><th className="p-4">Kiritgan</th><th className="p-4 text-right">Summa</th></tr></thead><tbody className="divide-y divide-slate-800/60">
          {loading ? <tr><td colSpan="5" className="p-8 text-center text-slate-400">Yuklanmoqda…</td></tr>
            : filteredExpenses.length ? filteredExpenses.map((expense) => <tr key={expense.ID}><td className="p-4 text-slate-400">{expense.EXPENSE_DATE || '—'}</td><td className="p-4 font-medium">{expense.CATEGORY}</td><td className="p-4 text-slate-300">{expense.DESCRIPTION}</td><td className="p-4 text-slate-400">{expense.CREATED_BY_NAME || '—'}</td><td className="p-4 text-right font-semibold text-rose-400">− {money(expense.AMOUNT)}</td></tr>) : <tr><td colSpan="5" className="p-8 text-center text-slate-400">Xarajat yozuvi yo‘q.</td></tr>}
        </tbody></table></div>
      </section>

      {expenseOpen && <div className="fixed inset-0 z-50 grid place-items-start sm:place-items-center overflow-y-auto p-4 backdrop-blur-sm bg-black/60"><form onSubmit={saveExpense} className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <h2 className="text-xl font-bold">Xarajat qayd etish</h2><p className="mt-1 text-sm text-slate-400">Xarajat qoldiqdan ayriladi. Saqlangandan keyin uni o‘chirib bo‘lmaydi.</p>
        <label className="mt-5 block text-sm">Xarajat turi<select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={`mt-2 w-full rounded-xl border px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}><option>Kommunal to‘lovlar</option><option>Maosh</option><option>Ta’mirlash</option><option>Jihozlar</option><option>Oziq-ovqat</option><option>Boshqa</option></select></label>
        <label className="mt-4 block text-sm">Izoh<input required maxLength={500} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={`mt-2 w-full rounded-xl border px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} placeholder="Masalan, 2-qavat quvur ta’miri" /></label>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="text-sm">Summa (UZS)<input required min="1" step="0.01" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className={`mt-2 w-full rounded-xl border px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} /></label><label className="text-sm">Sana<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={`mt-2 w-full rounded-xl border px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} /></label></div>
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setExpenseOpen(false)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Bekor qilish</button><button className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Saqlash</button></div>
      </form></div>}
    </div>
  );
};

export default Payments;
