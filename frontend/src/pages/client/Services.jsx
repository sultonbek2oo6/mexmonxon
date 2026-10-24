import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getServiceScheduleDefaults = () => {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  const pad = (value) => String(value).padStart(2, '0');
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`
  };
};

const toDateInputValue = (value) => {
  if (!value) return '';
  if (value instanceof Date) {
    const pad = (part) => String(part).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  return String(value).slice(0, 10);
};

const getLocalToday = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const getCurrentLocalTime = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const Services = () => {
  // ClientLayout'dan isDarkMode holatini olamiz
  const { isDarkMode } = useOutletContext();

  const [servicesList, setServicesList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [scheduledDate, setScheduledDate] = useState(() => getServiceScheduleDefaults().date);
  const [scheduledTime, setScheduledTime] = useState(() => getServiceScheduleDefaults().time);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');
  const selectedBooking = bookings.find((booking) => String(booking.ID || booking.id) === String(selectedBookingId));
  const bookingCheckIn = toDateInputValue(selectedBooking?.CHECK_IN_DATE || selectedBooking?.check_in_date);
  const bookingCheckOut = toDateInputValue(selectedBooking?.CHECK_OUT_DATE || selectedBooking?.check_out_date);
  const scheduleMinDate = bookingCheckIn && bookingCheckIn > getLocalToday() ? bookingCheckIn : getLocalToday();

  // Backenddan xizmatlarni bazadagi ma'lumotlar bilan birga olib kelish
  useEffect(() => {
    const token = localStorage.getItem('token');
    Promise.all([
      fetch(`${API_URL}/services`).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Xizmatlar ro‘yxatini olib bo‘lmadi.');
        return data;
      }),
      fetch(`${API_URL}/bookings`, { headers: { Authorization: `Bearer ${token}` } }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Bron qilingan xonalarni olib bo‘lmadi.');
        return data;
      })
    ]).then(([services, userBookings]) => {
      setServicesList(services);
      const activeBookings = userBookings.filter((booking) =>
        !['cancelled', 'canceled', 'bekor qilingan'].includes(String(booking.STATUS || booking.status || '').trim().toLowerCase())
      );
      setBookings(activeBookings);
      if (activeBookings.length) setSelectedBookingId(String(activeBookings[0].ID || activeBookings[0].id));
    }).catch((err) => {
      console.error('Xizmatlarni yuklashda xatolik:', err);
      setPageError(err.message);
    }).finally(() => setLoading(false));
  }, []);

  const handleOrder = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Buyurtma berish uchun tizimga qayta kiring.');
      if (!selectedBookingId) throw new Error('Avval bron qilingan xonani tanlang.');

      const response = await fetch(`${API_URL}/services/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: Number(selectedBookingId),
          serviceId: activeModal.ID || activeModal.id,
          quantity: Number(quantity),
          paymentMethod,
          scheduledAt: `${scheduledDate}T${scheduledTime}`
        })
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || result.error || 'Buyurtma saqlanmadi.');
      setIsSuccess(true);
    } catch (error) {
      console.error('Xizmat buyurtmasida xatolik:', error);
      alert(error.message || 'Server bilan bog‘lanishda xatolik.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className={`py-6 sm:py-10 relative transition-colors duration-500 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* Tun rejimida orqa fonga chiroyli glow effekti */}
      {isDarkMode && (
        <>
          <div className="absolute top-10 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 relative z-10">
        
        {/* Sahifa sarlavhasi */}
        <div className="mb-6 sm:mb-12">
          <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Xizmatlarimiz
          </h1>
          <p className={`text-xs sm:text-sm mt-1 sm:mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Qo'shimcha xizmatlarimizdan foydalaning va hordiq chiqarishni yanada maroqli qiling.
          </p>
        </div>

        {pageError && <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-500">{pageError}</div>}
        {!pageError && bookings.length === 0 && (
          <div className={`mb-5 rounded-xl border p-4 text-sm ${isDarkMode ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            Xizmatga buyurtma berish uchun avval xona bron qiling.
          </div>
        )}

        {/* Xizmatlar Grid - Mobilda 2 tadan (grid-cols-2), kompyuterda 3 tadan (lg:grid-cols-3) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {servicesList.map((service) => (
            <div
              key={service.ID || service.id}
              className={`group rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col justify-between hover:shadow-2xl transform hover:-translate-y-1 ${
                isDarkMode
                  ? 'bg-slate-800/40 backdrop-blur-xl border-slate-700/60 hover:border-teal-500/40'
                  : 'bg-white border-slate-200/80 hover:border-teal-500/40 hover:shadow-slate-300/50'
              }`}
            >
              <div>
                {/* Rasm balandligi mobilda moslashtirildi */}
                <div className="h-28 sm:h-36 md:h-56 overflow-hidden relative">
                  <img
                    src={service.IMAGE_URL || service.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'}
                    alt={service.SERVICE_NAME || service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                  <span className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-teal-300 text-[9px] sm:text-[11px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    {service.PRICE ? `${service.PRICE} so'm` : '24/7 Xizmat'}
                  </span>

                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs text-white">
                    <span className="text-amber-400">★</span>
                    <span className="font-bold">{service.RATING || service.rating || '4.9'}</span>
                  </div>
                </div>

                {/* Ma'lumot */}
                <div className="p-3 sm:p-6">
                  <h3 className={`text-sm sm:text-2xl font-bold transition-colors line-clamp-1 ${
                    isDarkMode ? 'text-white group-hover:text-teal-300' : 'text-slate-900 group-hover:text-teal-600'
                  }`}>
                    {service.SERVICE_NAME || service.title}
                  </h3>
                  <p className="text-[11px] sm:text-sm font-semibold text-teal-500 mt-0.5 sm:mt-1 line-clamp-1">
                    {service.DESC || service.desc || "Mehmonxona qo'shimcha xizmati"}
                  </p>
                  <p className={`text-[10px] sm:text-xs mt-1.5 sm:mt-3 leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {service.DETAILS || service.details || "Professional darajada xizmat ko'rsatiladi."}
                  </p>
                </div>
              </div>

              {/* Buyurtma berish tugmasi */}
              <div className="p-3 sm:p-6 pt-0">
                <button
                  onClick={() => {
                    const defaults = getServiceScheduleDefaults();
                    setScheduledDate(defaults.date);
                    setScheduledTime(defaults.time);
                    setActiveModal(service);
                    setQuantity(1);
                    setIsSuccess(false);
                  }}
                  disabled={bookings.length === 0}
                  className="w-full py-2 sm:py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all shadow-md transform hover:-translate-y-0.5"
                >
                  Buyurtma berish
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* BUYURTMA QILISH MODAL OYNASI */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 mb-5 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className="text-xl font-bold">{activeModal.SERVICE_NAME || activeModal.title}</h3>
              <button
                onClick={() => setActiveModal(null)}
                className={`p-1.5 rounded-xl hover:bg-slate-500/10 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
              >
                ✕
              </button>
            </div>

            {isSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h4 className="text-lg font-bold">Buyurtmangiz qabul qilindi!</h4>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Xizmat buyurtmasi va to‘lov yozuvi saqlandi. To‘lov holati: kutilmoqda.
                </p>
                <button type="button" onClick={() => { setActiveModal(null); setIsSuccess(false); }} className="mt-3 rounded-xl bg-teal-600 px-5 py-2 text-sm font-bold text-white">Yopish</button>
              </div>
            ) : (
              <form onSubmit={handleOrder} className="space-y-4">
                <div className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${
                  isDarkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}>
                  <img 
                    src={activeModal.IMAGE_URL || activeModal.image} 
                    alt="" 
                    className="w-14 h-14 rounded-xl object-cover" 
                  />
                  <div>
                    <h4 className="font-bold text-sm">{activeModal.SERVICE_NAME || activeModal.title}</h4>
                    <p className="text-xs text-teal-500 font-medium">Narxi: {activeModal.PRICE || activeModal.price || 0} so'm</p>
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Bron qilingan xona</label>
                  <select required value={selectedBookingId} onChange={(e) => setSelectedBookingId(e.target.value)} className={`w-full border rounded-xl p-3 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    {bookings.map((booking) => (
                      <option key={booking.ID || booking.id} value={booking.ID || booking.id}>
                        Xona № {booking.ROOM_NUMBER || booking.room_number || '—'} · {booking.TYPE_NAME || booking.type_name || 'Xona'} · {String(booking.STATUS || booking.status || 'pending')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Miqdor</label>
                    <input type="number" min="1" max="20" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className={`w-full border rounded-xl p-3 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>To‘lov usuli</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={`w-full border rounded-xl p-3 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                      <option value="cash">Naqd pul</option>
                      <option value="card">Karta</option>
                      <option value="click">Click</option>
                      <option value="payme">Payme</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Xizmat ko‘rsatish vaqti</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input required type="date" min={scheduleMinDate} max={bookingCheckOut || undefined} value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className={`w-full border rounded-xl p-3 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                    <input required type="time" min={scheduledDate === getLocalToday() ? getCurrentLocalTime() : undefined} value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className={`w-full border rounded-xl p-3 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                  </div>
                  <p className={`mt-1 text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Xodimlar xizmatni belgilangan vaqtda ko‘rsatishi uchun oldindan rejalashtiring (masalan, aeroport transferi 21:30).
                  </p>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Jami: {(Number(activeModal.PRICE || activeModal.price || 0) * Number(quantity || 0)).toLocaleString()} UZS · to‘lov holati buyurtmada “kutilmoqda” bo‘ladi.</p>

                <button
                  type="submit"
                  disabled={submitting || !selectedBookingId}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition shadow-md mt-2"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Buyurtma va to‘lovni saqlash'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Services;
