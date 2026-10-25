import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const MyBookings = () => {
  const { isDarkMode } = useOutletContext();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState('');

  const openBookingDetails = async (booking) => {
    setSelectedBooking(booking);
    setServiceOrders([]);
    setServicesError('');
    setServicesLoading(true);
    try {
      const response = await axios.get(`${API_URL}/bookings/${booking.bookingId}/services`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setServiceOrders(response.data);
    } catch (err) {
      console.error('Xizmatlar tarixini yuklashda xatolik:', err);
      setServicesError(err.response?.data?.message || 'Xizmatlar tarixini yuklab bo‘lmadi.');
    } finally {
      setServicesLoading(false);
    }
  };

  const formatServiceDate = (value) => {
    if (!value) return 'Sana ko‘rsatilmagan';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('uz-UZ');
  };

  // Backend'dan bronlarni bazadan tortib kelish
  useEffect(() => {
    const fetchBookings = async (showLoading = false) => {
      try {
        if (showLoading) setLoading(true);
        // Backend bronlarni token ichidagi joriy foydalanuvchi ID'si bo'yicha qaytaradi.
        const response = await api('/bookings');

        // Oracle bazasidan kelgan ma'lumotlarni frontend formatiga moslash
        const formattedData = response.map((item) => {
          // Sana formatlash (YYYY-MM-DD dan DD.MM.YYYY ga)
          const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
            if (Number.isNaN(d.getTime())) return String(dateStr).slice(0, 10);
            return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
          };

          const checkIn = formatDate(item.CHECK_IN_DATE || item.check_in_date);
          const checkOut = formatDate(item.CHECK_OUT_DATE || item.check_out_date);

          // Statusni tarjima qilish va rang turini belgilash
          let statusLabel = 'Tasdiqlangan';
          let statusType = 'success';
          let paymentStatus = "To'langan";

          const rawStatus = (item.STATUS || item.status || 'pending').toLowerCase();
          if (rawStatus === 'completed' || rawStatus === 'tugallangan') {
            statusLabel = 'Tugallangan';
            statusType = 'info';
          } else if (rawStatus === 'cancelled' || rawStatus === 'bekor qilingan') {
            statusLabel = 'Bekor qilingan';
            statusType = 'danger';
            paymentStatus = 'Qaytarilgan';
          } else if (rawStatus === 'pending' || rawStatus === 'kutilmoqda') {
            statusLabel = 'Kutilmoqda';
            statusType = 'info';
            paymentStatus = 'Kutilmoqda';
          } else {
            statusLabel = 'Tasdiqlangan';
            statusType = 'success';
          }

          return {
            bookingId: item.ID || item.id,
            id: `BK10${item.ID || item.id}`,
            room: item.TYPE_NAME || item.type_name || 'Standard',
            dates: `${checkIn} - ${checkOut}`,
            status: statusLabel,
            statusType: statusType,
            price: `${Number(item.TOTAL_AMOUNT || item.total_amount || 0).toLocaleString()} UZS`,
            guests: `${item.CAPACITY || item.capacity || 2} kishilik`,
            paymentStatus: item.PAYMENT_STATUS || item.payment_status || paymentStatus,
            image: item.IMAGE_URL || item.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600'
          };
        });

        setBookings(formattedData);
        setError(null);
      } catch (err) {
        console.error("Bronlarni yuklashda xatolik:", err);
        setError("Ma'lumotlarni yuklab bo'lmadi.");
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    fetchBookings(true);
    const refreshTimer = window.setInterval(() => fetchBookings(), 10000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  // Status uchun maxsus stil tayyorlash
  const getStatusBadge = (type, label) => {
    switch (type) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {label}
          </span>
        );
      case 'info':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/15 text-teal-500 border border-teal-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            {label}
          </span>
        );
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {label}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`py-10 relative transition-colors duration-500 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {isDarkMode && (
        <>
          <div className="absolute top-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">
        
        <div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Mening bronlarim
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Sizning barcha bronlaringiz ro'yxati va ularning holati.
          </p>
        </div>

        <div className={`rounded-3xl border overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-500 ${
          isDarkMode 
            ? 'bg-slate-900/70 border-slate-800' 
            : 'bg-white/90 border-slate-200/80'
        }`}>
          
          {loading ? (
            <div className="p-12 text-center text-teal-500 font-bold">Ma'lumotlar yuklanmoqda...</div>
          ) : error ? (
            <div className="p-12 text-center text-rose-500 font-bold">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">Sizda hali bronlar mavjud emas.</div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[11px] font-extrabold uppercase tracking-wider ${
                      isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-800/40' : 'border-slate-100 text-slate-400 bg-slate-50'
                    }`}>
                      <th className="py-4.5 px-6"># ID</th>
                      <th className="py-4.5 px-6">Xona</th>
                      <th className="py-4.5 px-6">Sana</th>
                      <th className="py-4.5 px-6">Status</th>
                      <th className="py-4.5 px-6">To'lov</th>
                      <th className="py-4.5 px-6 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                    {bookings.map((item) => (
                      <tr key={item.id} className={`transition-colors hover:${isDarkMode ? 'bg-slate-800/30' : 'bg-slate-50/80'}`}>
                        <td className="py-5 px-6 font-bold text-teal-500">{item.id}</td>
                        <td className="py-5 px-6 font-semibold">{item.room}</td>
                        <td className={`py-5 px-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item.dates}</td>
                        <td className="py-5 px-6">{getStatusBadge(item.statusType, item.status)}</td>
                        <td className="py-5 px-6 font-extrabold">{item.price}</td>
                        <td className="py-5 px-6 text-right">
                          <button
                            onClick={() => openBookingDetails(item)}
                            className="text-teal-500 font-bold hover:text-teal-400 hover:underline transition-all text-xs"
                          >
                            Batafsil ko'rish &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="block md:hidden divide-y divide-slate-800/20">
                {bookings.map((item) => (
                  <div key={item.id} className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-teal-500 text-base">{item.id}</span>
                      {getStatusBadge(item.statusType, item.status)}
                    </div>

                    <div className="flex items-center gap-3 py-1">
                      <img src={item.image} alt={item.room} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-base">{item.room} xonasi</h4>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.dates}</p>
                        <p className="text-sm font-extrabold text-teal-500 mt-1">{item.price}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => openBookingDetails(item)}
                        className="w-full py-2.5 bg-teal-600/10 hover:bg-teal-600/20 text-teal-500 font-bold rounded-xl text-xs border border-teal-500/20 transition"
                      >
                        Batafsil ko'rish &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* BOTTOM PREMIUM BANNER */}
        <div 
          className="relative rounded-3xl overflow-hidden p-8 sm:p-12 min-h-[200px] flex flex-col justify-center bg-cover bg-center text-white shadow-2xl"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1600')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent"></div>

          <div className="relative z-10 max-w-xl space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug drop-shadow-md">
              Sizning ishonchingiz &ndash; bizning eng katta qadriyatimiz!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light drop-shadow">
              Har bir tashrifingiz unutilmas bo'lishi uchun oliy darajadagi xizmatni taqdim etamiz.
            </p>
            <div className="pt-2">
              <Link to="/client/rooms">
                <button className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-95">
                  Yangi xona band qilish
                </button>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* BATAFSIL KO'RISH MODAL OYNASI */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl shadow-2xl border transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 mb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div>
                <h3 className="text-lg font-bold">Bron ID: {selectedBooking.id}</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedBooking.room} xonasi</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className={`p-1.5 rounded-xl hover:bg-slate-500/10 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <img src={selectedBooking.image} alt="" className="w-full h-40 object-cover rounded-2xl" />

              <div className={`p-4 rounded-2xl space-y-2.5 text-xs ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Sana:</span>
                  <span className="font-bold">{selectedBooking.dates}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Mehmonlar:</span>
                  <span className="font-bold">{selectedBooking.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>To'lov holati:</span>
                  <span className="font-bold text-emerald-500">{selectedBooking.paymentStatus}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-700/30">
                  <span className="font-bold">Umumiy summa:</span>
                  <span className="font-extrabold text-teal-500">{selectedBooking.price}</span>
                </div>
              </div>

              <section className={`rounded-2xl border p-4 ${isDarkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="font-bold">Xizmat buyurtmalari</h4>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{serviceOrders.length} ta buyurtma</span>
                </div>
                {servicesLoading ? (
                  <p className="py-4 text-center text-sm text-teal-500">Xizmatlar tarixi yuklanmoqda...</p>
                ) : servicesError ? (
                  <p className="py-3 text-sm text-rose-500">{servicesError}</p>
                ) : serviceOrders.length === 0 ? (
                  <p className={`py-3 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Bu bron bo‘yicha hali xizmat buyurtmalari yo‘q.</p>
                ) : (
                  <div className="space-y-3">
                    {serviceOrders.map((order) => (
                      <div key={order.ID || order.id} className={`rounded-xl border p-3 ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{order.SERVICE_NAME || order.service_name}</p>
                            <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              Rejalashtirilgan vaqt: {formatServiceDate(order.ORDERED_AT || order.ordered_at)} · Miqdor: {order.QUANTITY || order.quantity || 1}
                            </p>
                          </div>
                          <p className="font-extrabold text-teal-500">{Number(order.TOTAL_PRICE || order.total_price || 0).toLocaleString()} UZS</p>
                        </div>
                        <p className={`mt-2 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Xonaga biriktirilgan xodimlar: <span className="font-semibold">{order.ROOM_STAFF || order.room_staff || 'Hozircha biriktirilmagan'}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <p className={`mt-3 text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Xodimlar ro‘yxati HOUSEKEEPING jadvalidagi xonaga biriktirish ma’lumotidan olinadi.
                </p>
              </section>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-xs transition"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyBookings;
