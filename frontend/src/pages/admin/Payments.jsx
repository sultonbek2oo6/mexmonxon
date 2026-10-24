import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, Eye, Trash2, X, DollarSign, CreditCard, Calendar, User, FileText } from 'lucide-react';
import { api } from '../../lib/api';

const Payments = () => {
  const { isDarkMode } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingPayment, setViewingPayment] = useState(null);

  // Rasmda ko'rsatilgan to'lovlar ma'lumotlari
  const [payments, setPayments] = useState([]);
  const loadPayments = async () => {
    try { const data = await api('/payments'); setPayments(data.map((p) => ({ id: p.ID, bookingId: p.BOOKING_ID, guest: p.GUEST_NAME || '—', amount: `${Number(p.AMOUNT || 0).toLocaleString()} UZS`, method: ({ card: 'Visa', click: 'Click', payme: 'Payme', cash: 'Cash' })[String(p.PAYMENT_METHOD || '').toLowerCase()] || p.PAYMENT_METHOD, status: ({ paid: 'Paid', pending: 'Pending', failed: 'Failed', cancelled: 'Cancelled' })[String(p.PAYMENT_STATUS || '').toLowerCase()] || p.PAYMENT_STATUS, date: p.PAID_AT ? new Date(p.PAID_AT).toLocaleDateString() : '—' }))); }
    catch (error) { console.error('Payments loading failed:', error); }
  };
  useEffect(() => { loadPayments(); }, []);
  /*
  const [payments] = useState([
    { id: 'PAY001', guest: 'Ali Karimov', amount: '$120', method: 'Visa', status: 'Paid', date: 'Apr 26, 2025' },
    { id: 'PAY002', guest: 'John Smith', amount: '$250', method: 'Mastercard', status: 'Paid', date: 'Apr 26, 2025' },
    { id: 'PAY003', guest: 'Aziza Aliyeva', amount: '$180', method: 'UzCard', status: 'Pending', date: 'Apr 27, 2025' },
    { id: 'PAY004', guest: 'Emily Davis', amount: '$320', method: 'Cash', status: 'Paid', date: 'Apr 27, 2025' },
  ]); */

  // Yangi to'lov formasi
  const [form, setForm] = useState({
    id: `PAY${Math.floor(100 + Math.random() * 900)}`,
    guest: '',
    amount: '',
    method: 'Visa',
    status: 'Paid',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  });

  // Status badjlari
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'Failed':
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  // Qidiruv va filter bo'yicha saralash
  const filteredPayments = payments.filter((pay) => {
    const matchesSearch =
      pay.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.amount.includes(searchTerm);
    const matchesMethod = filterMethod === 'All' || pay.method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  // To'lovni o'chirish
  const handleDelete = async (id) => {
    try { await api(`/admin/payments/${id}`, { method: 'DELETE' }); await loadPayments(); }
    catch (error) { window.alert(error.message); }
  };

  // Yangi to'lov saqlash
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api('/admin/payments', { method: 'POST', body: JSON.stringify({ guest_name: form.guest, amount: Number(String(form.amount).replace(/[^\d.]/g, '')), method: form.method, status: form.status.toLowerCase() }) }); await loadPayments(); }
    catch (error) { window.alert(error.message); return; }
    setIsAddModalOpen(false);
    setForm({
      id: `PAY${Math.floor(100 + Math.random() * 900)}`,
      guest: '',
      amount: '',
      method: 'Visa',
      status: 'Paid',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-serif font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Payments
          </h1>
          <p className="text-slate-400 text-sm mt-1">Transaction history, payment status, and revenue logs.</p>
        </div>
      </div>

      {/* Control Bar: Search, Method Filter & Add Payment Button */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border w-full sm:w-72 ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text"
              placeholder="Search ID, Guest, Amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm focus:outline-none w-full"
            />
          </div>

          {/* Payment Method Filter */}
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className={`px-3.5 py-2 rounded-xl border text-sm w-full sm:w-auto focus:outline-none ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="All">All Methods</option>
            <option value="Visa">Visa</option>
            <option value="Mastercard">Mastercard</option>
            <option value="UzCard">UzCard</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        {/* Add Payment Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payment</span>
        </button>
      </div>

      {/* Table Container */}
      <div className={`rounded-2xl border ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={`border-b text-xs uppercase text-slate-400 tracking-wider ${
                isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'
              }`}>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Guest</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Method</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-800/20 transition duration-150">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-400">{pay.id}</td>
                    <td className={`py-4 px-6 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{pay.guest}</td>
                    <td className="py-4 px-6 font-bold text-emerald-500">{pay.amount}</td>
                    <td className="py-4 px-6 text-slate-400 font-medium">{pay.method}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(pay.status)}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs font-mono">{pay.date}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setViewingPayment(pay)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/40 transition"
                          title="View Payment"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pay.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                          title="Delete Payment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden divide-y divide-slate-800/40">
          {filteredPayments.map((pay) => (
            <div key={pay.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-slate-500 font-bold">{pay.id}</span>
                  <span className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{pay.guest}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getStatusBadge(pay.status)}`}>
                  {pay.status}
                </span>
              </div>

              <div className="flex flex-col space-y-1 text-xs text-slate-400 pt-1">
                <p className="flex items-center space-x-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Amount: <strong className="text-emerald-400 text-sm font-bold">{pay.amount}</strong></span>
                </p>
                <p className="flex items-center space-x-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Method: <strong className="text-slate-200">{pay.method}</strong></span>
                </p>
                <p className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Date: <strong className="text-slate-200 font-mono">{pay.date}</strong></span>
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/40">
                <button
                  onClick={() => setViewingPayment(pay)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => handleDelete(pay.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ADD PAYMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold">Add New Payment</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 py-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Guest Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Karimov"
                  value={form.guest}
                  onChange={(e) => setForm({ ...form, guest: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Amount ($)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 150"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Method</label>
                <select
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="UzCard">UzCard</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PAYMENT DETAILS MODAL */}
      {viewingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base">Receipt Details</h3>
              </div>
              <button 
                onClick={() => setViewingPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800/40 pb-2">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono font-bold">{viewingPayment.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-2">
                <span className="text-slate-400">Guest:</span>
                <span className="font-bold">{viewingPayment.guest}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-2">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-emerald-400">{viewingPayment.amount}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-2">
                <span className="text-slate-400">Payment Method:</span>
                <span>{viewingPayment.method}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-2">
                <span className="text-slate-400">Status:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusBadge(viewingPayment.status)}`}>
                  {viewingPayment.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-mono text-xs">{viewingPayment.date}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingPayment(null)}
              className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Payments;
