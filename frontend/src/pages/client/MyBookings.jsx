import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';

const MyBookings = () => {
  // ClientLayout'dan isDarkMode holatini olamiz
  const { isDarkMode } = useOutletContext();

  const [selectedBooking, setSelectedBooking] = useState(null);

  // Bronlar ro'yxati (rasmdagi ma'lumotlar va qo'shimcha tafsilotlar)
  const [bookings, setBookings] = useState([
    {
      id: 'BK1024',
      room: 'Deluxe',
      dates: '26.04.2025 - 28.04.2025',
      status: 'Tasdiqlangan',
      statusType: 'success', // success | info | danger
      price: '$240',
      guests: '2 katta',
      paymentStatus: "To'langan",
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'BK1023',
      room: 'Standart',
      dates: '20.04.2025 - 22.04.2025',
      status: 'Tugallangan',
      statusType: 'info',
      price: '$160',
      guests: '1 katta',
      paymentStatus: "To'langan",
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'BK1022',
      room: 'Family',
      dates: '15.04.2025 - 17.04.2025',
      status: 'Bekor qilingan',
      statusType: 'danger',
      price: '$320',
      guests: '4 katta',
      paymentStatus: 'Qaytarilgan',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'BK1021',
      room: 'Suite',
      dates: '10.04.2025 - 12.04.2025',
      status: 'Tugallangan',
      statusType: 'info',
      price: '$500',
      guests: '2 katta, 1 bola',
      paymentStatus: "To'langan",
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600'
    }
  ]);

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
      
      {/* Background Glows (Tun rejimida orqa fondagi neon nur effektlari) */}
      {isDarkMode && (
        <>
          <div className="absolute top-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">
        
        {/* Sahifa sarlavhasi */}
        <div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Mening bronlarim
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Sizning barcha bronlaringiz ro'yxati va ularning holati.
          </p>
        </div>

        {/* JADVAL WA CARDS BO'LIMI (Desktop'da Table, Mobile'da Cards) */}
        <div className={`rounded-3xl border overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-500 ${
          isDarkMode 
            ? 'bg-slate-900/70 border-slate-800' 
            : 'bg-white/90 border-slate-200/80'
        }`}>
          
          {/* DESKTOP TABLE VIEW (md: va undan katta ekranlar uchun) */}
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
                        onClick={() => setSelectedBooking(item)}
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

          {/* MOBILE CARDS VIEW (Kichik ekranlar - telefonlar uchun) */}
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
                    onClick={() => setSelectedBooking(item)}
                    className="w-full py-2.5 bg-teal-600/10 hover:bg-teal-600/20 text-teal-500 font-bold rounded-xl text-xs border border-teal-500/20 transition"
                  >
                    Batafsil ko'rish &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* BOTTOM PREMIUM BANNER (Rasmdagi pastki banner) */}
        <div 
          className="relative rounded-3xl overflow-hidden p-8 sm:p-12 min-h-[200px] flex flex-col justify-center bg-cover bg-center text-white shadow-2xl"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1600')` }}
        >
          {/* Dark Overlay */}
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
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border transition-all ${
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