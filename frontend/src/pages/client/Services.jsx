import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const Services = () => {
  // ClientLayout'dan isDarkMode holatini olamiz
  const { isDarkMode } = useOutletContext();

  const [activeModal, setActiveModal] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Xizmatlar ro'yxati
  const servicesList = [
    {
      id: 1,
      title: 'Restoran',
      desc: 'Mazali taomlar va ichimliklar',
      details: "24/7 xizmat ko'rsatuvchi restornimizda dunyo va milliy oshxona taomlaridan bahramand bo'ling.",
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
      badge: '24/7 Xizmat',
      rating: 4.9
    },
    {
      id: 2,
      title: 'Spa & Wellness',
      desc: "Relaks va sog'lomlik",
      details: "Professional massaj va spa xizmatlari orqali ruhiy va jismoniy hordiq chiqaring.",
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
      badge: 'Relaks',
      rating: 5.0
    },
    {
      id: 3,
      title: 'Fitness Center',
      desc: 'Zamonaviy uskunalar',
      icon: '🏋️‍♂️',
      details: "Zamonaviy trenajyorlar va shaxsiy murabbiy bilan mashg'ulotlarni davom ettiring.",
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
      badge: 'Sport',
      rating: 4.8
    },
    {
      id: 4,
      title: 'Airport Transfer',
      desc: 'Qulay transport',
      details: "Aeroport va vokzaldan qulay, lyuks mashinalarda kutib olish va kuzatib qo'yish xizmati.",
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
      badge: 'VIP Transfer',
      rating: 4.9
    },
    {
      id: 5,
      title: 'Laundry',
      desc: 'Tez va sifatli xizmat',
      details: "Kiyimlaringizni tez, toza va ehtiyotkorlik bilan yuvish hamda dazmollash xizmati.",
      image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=800',
      badge: 'Tezkor',
      rating: 4.7
    },
    {
      id: 6,
      title: 'Room Service',
      desc: 'Xonaga taom yetkazish',
      details: "Xohlagan vaqtingizda sevimli taom va ichimliklaringizni xonangizga buyurtma qiling.",
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      badge: 'Qulay',
      rating: 4.9
    }
  ];

  const handleOrder = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setActiveModal(null);
      setIsSuccess(false);
    }, 2000);
  };

  return (
    <div className={`py-10 relative transition-colors duration-500 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* Tun rejimida orqa fonga chiroyli glow effekti */}
      {isDarkMode && (
        <>
          <div className="absolute top-10 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Sahifa sarlavhasi */}
        <div className="mb-12">
          <h1 className={`text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Xizmatlarimiz
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Qo'shimcha xizmatlarimizdan foydalaning va hordiq chiqarishni yanada maroqli qiling.
          </p>
        </div>

        {/* Xizmatlar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service) => (
            <div
              key={service.id}
              className={`group rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col justify-between hover:shadow-2xl transform hover:-translate-y-1 ${
                isDarkMode
                  ? 'bg-slate-800/40 backdrop-blur-xl border-slate-700/60 hover:border-teal-500/40'
                  : 'bg-white border-slate-200/80 hover:border-teal-500/40 hover:shadow-slate-300/50'
              }`}
            >
              <div>
                {/* Rasm */}
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                  <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-teal-300 text-[11px] font-bold px-3 py-1 rounded-full">
                    {service.badge}
                  </span>

                  <div className="absolute bottom-3 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs text-white">
                    <span className="text-amber-400">★</span>
                    <span className="font-bold">{service.rating}</span>
                  </div>
                </div>

                {/* Ma'lumot */}
                <div className="p-6">
                  <h3 className={`text-2xl font-bold transition-colors ${
                    isDarkMode ? 'text-white group-hover:text-teal-300' : 'text-slate-900 group-hover:text-teal-600'
                  }`}>
                    {service.title}
                  </h3>
                  <p className="text-sm font-semibold text-teal-500 mt-1">{service.desc}</p>
                  <p className={`text-xs mt-3 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {service.details}
                  </p>
                </div>
              </div>

              {/* Buyurtma berish tugmasi */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => setActiveModal(service)}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-sm transition-all shadow-md transform hover:-translate-y-0.5"
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
              <h3 className="text-xl font-bold">{activeModal.title}</h3>
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
                  Xizmat xodimlari tez orada siz bilan bog'lanishadi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleOrder} className="space-y-4">
                <div className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${
                  isDarkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}>
                  <img src={activeModal.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-sm">{activeModal.title}</h4>
                    <p className="text-xs text-teal-500 font-medium">{activeModal.desc}</p>
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Xona raqamingiz
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Masalan: 204-xona"
                    className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Qo'shimcha izoh yoki vaqt
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Vaqt va maxsus istaklaringizni yozing..."
                    className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-sm transition shadow-md mt-2"
                >
                  Buyurtmani tasdiqlash
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