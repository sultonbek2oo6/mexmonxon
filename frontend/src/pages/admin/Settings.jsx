import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Bell, 
  Save, 
  Sliders, 
  CheckCircle2, 
  Globe, 
  ShieldCheck 
} from 'lucide-react';
import { api } from '../../lib/api';

const Settings = () => {
  const { isDarkMode } = useOutletContext();

  const [activeTab, setActiveTab] = useState('General');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // General & Hotel Info formasi holati
  const [generalForm, setGeneralForm] = useState({
    hotelName: 'Grand Hotel',
    address: 'Tashkent, Uzbekistan',
    phone: '+998 71 123 45 67',
    email: 'info@grandhotel.uz',
    currency: 'USD ($)',
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
  useEffect(() => {
    api('/admin/settings').then((settings) => {
      if (settings.general && Object.keys(settings.general).length) setGeneralForm((current) => ({ ...current, ...settings.general }));
      if (settings.payment && Object.keys(settings.payment).length) setPaymentForm((current) => ({ ...current, ...settings.payment }));
      if (settings.notifications && Object.keys(settings.notifications).length) setNotifForm((current) => ({ ...current, ...settings.notifications }));
    }).catch((error) => console.error('Settings loading failed:', error));
  }, []);

  // Tablar ro'yxati
  const tabs = [
    { id: 'General', label: 'General' },
    { id: 'Hotel Info', label: 'Hotel Info' },
    { id: 'Payment', label: 'Payment' },
    { id: 'Notification', label: 'Notification' },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api('/admin/settings', { method: 'PUT', body: JSON.stringify({ general: generalForm, payment: paymentForm, notifications: notifForm }) });
    } catch (error) { window.alert(error.message); return; }
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 3000);
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
          {(activeTab === 'General' || activeTab === 'Hotel Info') && (
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
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>
          )}

          {/* PAYMENT TAB */}
          {activeTab === 'Payment' && (
            <form onSubmit={handleSave} className="space-y-6">
              
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Accepted Payment Gateways</h3>
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
                    type="text"
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
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Payment Settings</span>
                </button>
              </div>

            </form>
          )}

          {/* NOTIFICATION TAB */}
          {activeTab === 'Notification' && (
            <form onSubmit={handleSave} className="space-y-6">
              
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Notification Preferences</h3>
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
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Notification Preferences</span>
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
