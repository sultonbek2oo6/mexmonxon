import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Save, 
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../lib/api';

const Settings = () => {
  const { isDarkMode } = useOutletContext();

  const [activeTab, setActiveTab] = useState('General');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  // General & Hotel Info formasi holati
  const [generalForm, setGeneralForm] = useState({
    hotelName: 'Grand Hotel',
    address: 'Tashkent, Uzbekistan',
    phone: '+998 71 123 45 67',
    email: 'info@grandhotel.uz',
    currency: 'UZS',
    timezone: 'UTC+5 (Tashkent)'
  });

  // Payment formasi holati
  const [paymentForm, setPaymentForm] = useState({
    acceptVisa: true,
    acceptMastercard: true,
    acceptUzcard: true,
    acceptCash: true,
    taxRate: '12%'
  });

  // Notification formasi holati
  const [notifForm, setNotifForm] = useState({
    emailAlerts: true,
    smsAlerts: false,
    newBookingNotif: true,
    cancelBookingNotif: true
  });
  const loadSettings = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const settings = await api('/admin/settings');
      if (settings.general && Object.keys(settings.general).length) setGeneralForm((current) => ({ ...current, ...settings.general }));
      if (settings.payment && Object.keys(settings.payment).length) setPaymentForm((current) => ({ ...current, ...settings.payment }));
      if (settings.notifications && Object.keys(settings.notifications).length) setNotifForm((current) => ({ ...current, ...settings.notifications }));
    } catch (error) {
      setLoadError(error.message || 'Sozlamalarni yuklab bo‘lmadi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  // Tablar ro'yxati
  const tabs = [
    { id: 'General', label: 'General' },
    { id: 'Payment', label: 'Payment' },
    { id: 'Notification', label: 'Notification' },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    if (loading || loadError) return;
    setSaving(true);
    try {
      await api('/admin/settings', { method: 'PUT', body: JSON.stringify({ general: generalForm, payment: paymentForm, notifications: notifForm }) });
      setShowSavedToast(true);
      window.setTimeout(() => setShowSavedToast(false), 3000);
    } catch (error) { window.alert(error.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">Settings saved successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-serif font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage system configurations, contact info, and payment rules.</p>
        </div>
      </div>

      {loadError && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">{loadError} <button type="button" onClick={loadSettings} className="ml-2 underline">Qayta urinish</button></div>}
      {loading && <div role="status" className="rounded-xl border border-slate-700 p-4 text-sm text-slate-400">Sozlamalar yuklanmoqda…</div>}

      {/* Settings Container */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        
        {/* Navigation Tabs (Responsive Scrollable) */}
        <div className={`border-b px-4 sm:px-6 flex space-x-6 overflow-x-auto no-scrollbar ${
          isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/50'
        }`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 font-semibold text-sm transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 max-w-3xl">
          
          {/* GENERAL & HOTEL INFO TAB */}
          {activeTab === 'General' && (
            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Hotel Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Hotel Name</label>
                <div className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={generalForm.hotelName}
                    onChange={(e) => setGeneralForm({ ...generalForm, hotelName: e.target.value })}
                    className="bg-transparent text-sm focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Address</label>
                <div className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={generalForm.address}
                    onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                    className="bg-transparent text-sm focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Phone</label>
                <div className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={generalForm.phone}
                    onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                    className="bg-transparent text-sm focus:outline-none w-full font-mono"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Email</label>
                <div className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    required
                    value={generalForm.email}
                    onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                    className="bg-transparent text-sm focus:outline-none w-full font-mono"
                  />
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving || loading || Boolean(loadError)}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
                >
                  <Save className="w-4 h-4" />
                    <span>{saving ? 'Saqlanmoqda…' : 'Save Changes'}</span>
                </button>
              </div>

            </form>
          )}

          {/* PAYMENT TAB */}
          {activeTab === 'Payment' && (
            <form onSubmit={handleSave} className="space-y-6">
              
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">To‘lov usullari bo‘yicha afzalliklar</h3>
                <p className="mb-3 text-xs text-amber-400">Bu belgilashlar hozircha ma’lumot sifatida saqlanadi; karta provayderlari va avtomatik soliq hisoblash tizimga ulanmagan.</p>
                <div className="space-y-3">
                  {[
                    { id: 'acceptVisa', label: 'Visa Card' },
                    { id: 'acceptMastercard', label: 'Mastercard' },
                    { id: 'acceptUzcard', label: 'UzCard / Humo' },
                    { id: 'acceptCash', label: 'Cash Payment on Check-In' },
                  ].map((item) => (
                    <label key={item.id} className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.label}</span>
                      <input
                        type="checkbox"
                        checked={paymentForm[item.id]}
                        onChange={(e) => setPaymentForm({ ...paymentForm, [item.id]: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Default Tax Rate (%)</label>
                <div className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                    value={paymentForm.taxRate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, taxRate: e.target.value })}
                    className="bg-transparent text-sm focus:outline-none w-full font-mono"
                  />
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving || loading || Boolean(loadError)}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saqlanmoqda…' : 'Save Payment Settings'}</span>
                </button>
              </div>

            </form>
          )}

          {/* NOTIFICATION TAB */}
          {activeTab === 'Notification' && (
            <form onSubmit={handleSave} className="space-y-6">
              
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Bildirishnoma afzalliklari</h3>
                <p className="mb-3 text-xs text-amber-400">Email va SMS jo‘natish xizmati ulanmaguncha bu tanlovlar xabar yubormaydi.</p>
                <div className="space-y-3">
                  {[
                    { id: 'emailAlerts', label: 'Email Notifications', desc: 'Receive email alerts for key updates' },
                    { id: 'smsAlerts', label: 'SMS Notifications', desc: 'Receive SMS for critical system events' },
                    { id: 'newBookingNotif', label: 'New Booking Alerts', desc: 'Notify admin when a guest books a room' },
                    { id: 'cancelBookingNotif', label: 'Cancellation Alerts', desc: 'Notify admin when a booking is cancelled' },
                  ].map((item) => (
                    <label key={item.id} className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}>
                      <div>
                        <span className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.label}</span>
                        <span className="text-xs text-slate-400">{item.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifForm[item.id]}
                        onChange={(e) => setNotifForm({ ...notifForm, [item.id]: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer mt-1"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving || loading || Boolean(loadError)}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saqlanmoqda…' : 'Save Notification Preferences'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
};

export default Settings;
