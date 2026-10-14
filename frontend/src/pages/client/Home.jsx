import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

const Home = () => {
  // ClientLayout'dan rejim holatini olamiz
  const { isDarkMode } = useOutletContext();

  const [checkIn, setCheckIn] = useState('2025-04-26');
  const [checkOut, setCheckOut] = useState('2025-04-28');
  const [guests, setGuests] = useState('2 katta, 0 bola');

  // Xonalar ro'yxati
  const rooms = [
    {
      id: 1,
      title: 'Standart xona',
      capacity: '2 mehmon',
      size: '25 m²',
      price: '\$80',
      badge: 'Shinam',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 2,
      title: 'Deluxe xona',
      capacity: '2 mehmon',
      size: '35 m²',
      price: '\$120',
      badge: 'Mashhur',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 3,
      title: 'Family xona',
      capacity: '4 mehmon',
      size: '50 m²',
      price: '\$160',
      badge: 'Oila uchun',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 4,
      title: 'Suite xona',
      capacity: '4 mehmon',
      size: '70 m²',
      price: '\$250',
      badge: 'Top Tanlov',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600'
    }
  ];

  // Xizmatlar ro'yxati
  const services = [
    {
      id: 1,
      title: 'Restoran',
      desc: '24/7 xizmat',
      icon: (
        <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Spa & Wellness',
      desc: "Relaks va go'zallik",
      icon: (
        <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Fitness Center',
      desc: 'Zamonaviy uskunalar',
      icon: (
        <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 4,
      title: 'Bepul Wi-Fi',
      desc: 'Barcha hududda',
      icon: (
        <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      )
    },
    {
      id: 5,
      title: 'Airport Transfer',
      desc: 'Qulay transport',
      icon: (
        <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    }
  ];

  return (
    <div className={`relative transition-colors duration-500 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* Background Glows (Tun rejimida orqa fondagi nur effekti) */}
      {isDarkMode && (
        <>
          <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
          <div className="absolute top-96 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
        </>
      )}

      {/* HERO SECTION WITH BACKGROUND IMAGE */}
      <section 
        className="relative min-h-[580px] flex flex-col justify-between pt-16 pb-12 px-6 bg-cover bg-center text-white" 
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920')` }}
      >
        {/* Dark Overlay - Tun rejimida to'qroq, Kun rejimida biroz yorqinroq */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-[#0f172a]/80 via-[#0f172a]/60 to-[#0f172a]' 
            : 'bg-gradient-to-b from-[#0b1329]/70 via-[#0b1329]/40 to-[#0b1329]/90'
        }`} />

        <div className="relative z-10 max-w-7xl mx-auto w-full pt-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 backdrop-blur-md mb-4">
            ★ Lux Mehmonxona & Resort
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-wide leading-tight max-w-2xl drop-shadow-md">
            Orzularingizdagi dam olish maskani
          </h1>
          <p className="mt-4 text-slate-200 text-base md:text-lg max-w-xl font-light drop-shadow">
            Biz sizga eng yaxshi sharoit va unutilmas taassurotlarni taqdim etamiz.
          </p>
        </div>

        {/* SEARCH / BOOKING PANEL (Glassmorphism Modal) */}
        <div className="relative z-10 max-w-7xl mx-auto w-full mt-12">
          <div className={`p-4 md:p-6 rounded-3xl backdrop-blur-xl border shadow-2xl transition-all duration-500 grid grid-cols-1 md:grid-cols-4 gap-4 items-center ${
            isDarkMode 
              ? 'bg-slate-900/80 border-slate-700/80 text-white' 
              : 'bg-white/95 border-white/60 text-slate-800'
          }`}>
            
            {/* Kirish sanasi */}
            <div className={`flex items-center space-x-3 border-r pr-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="text-teal-500 p-2 rounded-xl bg-teal-500/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex flex-col w-full">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  Kirish sanasi
                </span>
                <input 
                  type="text" 
                  value={checkIn} 
                  onChange={(e) => setCheckIn(e.target.value)}
                  className={`text-sm font-bold bg-transparent focus:outline-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                />
              </div>
            </div>

            {/* Chiqish sanasi */}
            <div className={`flex items-center space-x-3 border-r pr-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="text-teal-500 p-2 rounded-xl bg-teal-500/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex flex-col w-full">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  Chiqish sanasi
                </span>
                <input 
                  type="text" 
                  value={checkOut} 
                  onChange={(e) => setCheckOut(e.target.value)}
                  className={`text-sm font-bold bg-transparent focus:outline-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                />
              </div>
            </div>

            {/* Mehmonlar */}
            <div className={`flex items-center space-x-3 border-r pr-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="text-teal-500 p-2 rounded-xl bg-teal-500/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex flex-col w-full">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  Mehmonlar
                </span>
                <input 
                  type="text" 
                  value={guests} 
                  onChange={(e) => setGuests(e.target.value)}
                  className={`text-sm font-bold bg-transparent focus:outline-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                />
              </div>
            </div>

            {/* Qidirish tugmasi */}
            <button className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-2xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2">
              <span>Qidirish</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

          </div>
        </div>
      </section>

      {/* ROOMS SHOWCASE SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Bizning xonalarimiz
            </h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Sizning qulayligingiz uchun eng shinam va zamonaviy tanlovlar
            </p>
          </div>
          <Link 
            to="/client/rooms" 
            className="text-teal-500 font-bold text-sm hover:text-teal-400 flex items-center gap-1 transition"
          >
            <span>Barcha xonalar</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div 
              key={room.id} 
              className={`group rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col justify-between hover:shadow-2xl ${
                isDarkMode 
                  ? 'bg-slate-800/40 backdrop-blur-md border-slate-700/60 hover:border-teal-500/40' 
                  : 'bg-white border-slate-200/80 hover:border-teal-500/40 hover:shadow-slate-300/50'
              }`}
            >
              <div>
                <div className="h-52 overflow-hidden relative">
                  <img 
                    src={room.image} 
                    alt={room.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10"></div>
                  
                  {/* Badge */}
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-teal-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {room.badge}
                  </span>

                  {/* Rating */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg text-xs text-white">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="font-bold">{room.rating}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className={`text-lg font-bold transition-colors ${
                    isDarkMode ? 'text-white group-hover:text-teal-300' : 'text-slate-900 group-hover:text-teal-600'
                  }`}>
                    {room.title}
                  </h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {room.capacity} &bull; {room.size}
                  </p>
                  
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-teal-500">{room.price}</span>
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>/ kecha</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link to="/client/rooms">
                  <button className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md transform hover:-translate-y-0.5">
                    Bron qilish
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES BOTTOM BAR */}
      <section className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        <div className="mb-6">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Qulayliklar va Xizmatlar
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {services.map((service) => (
            <div 
              key={service.id} 
              className={`p-4.5 rounded-3xl border transition-all duration-300 flex items-center gap-3.5 hover:shadow-lg ${
                isDarkMode 
                  ? 'bg-slate-800/40 backdrop-blur-md border-slate-700/60 hover:border-teal-500/40' 
                  : 'bg-white border-slate-200/80 hover:border-teal-500/40 hover:shadow-slate-200/50'
              }`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                isDarkMode 
                  ? 'bg-teal-500/10 border-teal-500/30' 
                  : 'bg-teal-50 border-teal-100'
              }`}>
                {service.icon}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-bold leading-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  {service.title}
                </span>
                <span className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  {service.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;