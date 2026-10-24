import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Rooms = () => {
  const { isDarkMode } = useOutletContext();

  const [selectedType, setSelectedType] = useState('Barcha');
  const [priceRange, setPriceRange] = useState(2000000);
  const [selectedFloor, setSelectedFloor] = useState('Barcha');
  const [favorites, setFavorites] = useState([]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const dates = checkInDate && checkOutDate ? `${checkInDate} - ${checkOutDate}` : 'Sanalarni tanlang';
  const [guests, setGuests] = useState('2 katta, 0 bola');

  const [activeBookingRoom, setActiveBookingRoom] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Forma va to'lov usuli state'lari
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card'); // Card, Click, Payme, Cash

  // Bazadan keladigan xonalar uchun state'lar
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Backend API orqali bazadan ma'lumotlarni tortib kelish
  useEffect(() => {
    fetch(`${API_URL}/rooms`)
      .then((res) => res.json())
      .then((data) => {
        const formattedRooms = data.map((room) => ({
          id: room.ID || room.id,
          title: room.TYPE_NAME || room.type_name,
          type: room.TYPE_NAME || room.type_name,
          price: room.BASE_PRICE || room.base_price,
          capacity: `${room.CAPACITY || room.capacity || 2} mehmon`,
          size: room.DESCRIPTION || room.description || '30 m²',
          floor: `${room.FLOOR || room.floor}-qavat`,
          roomNumber: room.ROOM_NUMBER || room.room_number,
          rating: 4.8,
          reviews: 94,
          badge: room.STATUS === 'available' ? 'Mavjud' : 'Band',
          image: room.IMAGE_URL || room.image_url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800'
        }));
        setAllRooms(formattedRooms);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Xonalarni yuklashda xatolik:", err);
        setLoading(false);
      });
  }, []);

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const filteredRooms = allRooms.filter((room) => {
    const matchesType = selectedType === 'Barcha' || room.type === selectedType;
    const matchesPrice = room.price <= priceRange;
    const matchesFloor = selectedFloor === 'Barcha' || room.floor === selectedFloor;
    return matchesType && matchesPrice && matchesFloor;
  });

  // BRON VA TO'LOVNI BAZAGA SAQLASH
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setLoadingPayment(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Bron qilish uchun tizimga qayta kiring.');
      const bookingRes = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: activeBookingRoom.id,
          checkInDate,
          checkOutDate,
          fullName,
          phone,
          paymentMethod
        })
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.message || bookingData.error || 'Bronni saqlab bo‘lmadi.');
      if (bookingRes.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setActiveBookingRoom(null);
          setIsSuccess(false);
          setFullName('');
          setPhone('');
          setCheckInDate('');
          setCheckOutDate('');
          setLoadingPayment(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Server xatosi:", err);
      alert(err.message || "Server bilan bog'lanishda xatolik!");
      setLoadingPayment(false);
    }
  };

  return (
    <div className={`py-6 sm:py-8 relative transition-colors duration-500 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {isDarkMode && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div>
            <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Xonalarimiz
            </h1>
            <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Bazadan real vaqt rejimida yuklanayotgan xonalar to'plami.
            </p>
          </div>

          <div className={`p-2.5 px-4 sm:px-5 rounded-2xl border shadow-md flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs font-medium ${
            isDarkMode 
              ? 'bg-slate-800/60 backdrop-blur-md border-slate-700/60 text-slate-300' 
              : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <div className={`flex items-center gap-1.5 sm:gap-2 border-r pr-2 sm:pr-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[11px] sm:text-xs">{dates}</span>
            </div>

            <div className={`flex items-center gap-1.5 sm:gap-2 border-r pr-2 sm:pr-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[11px] sm:text-xs">{guests}</span>
            </div>

            <button className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs transition-all shadow-md">
              Qidirish
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-teal-500 font-bold text-lg animate-pulse">Xonalar bazadan yuklanmoqda...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* CHAP FILTR */}
            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xl h-fit ${
              isDarkMode 
                ? 'bg-slate-800/40 backdrop-blur-xl border-slate-700/50' 
                : 'bg-white border-slate-200/80 shadow-slate-200/50'
            }`}>
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 lg:pointer-events-none text-left"
                >
                  <h2 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Filtrlash
                  </h2>
                  <svg 
                    className={`w-4 h-4 transition-transform lg:hidden ${isFilterOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <button 
                  onClick={() => { setSelectedType('Barcha'); setPriceRange(2000000); setSelectedFloor('Barcha'); }}
                  className="text-xs text-teal-500 hover:underline font-medium"
                >
                  Tozalash
                </button>
              </div>

              <div className={`space-y-5 sm:space-y-6 mt-4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                <div>
                  <label className={`block text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Xona turi
                  </label>
                  <div className="space-y-1.5 sm:space-y-2">
                    {['Barcha', 'Standard', 'Deluxe', 'Suite'].map((type) => (
                      <label 
                        key={type} 
                        className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl cursor-pointer transition-all border ${
                          selectedType === type 
                            ? (isDarkMode ? 'bg-teal-500/10 border-teal-500/50 text-teal-300 font-semibold' : 'bg-teal-50 border-teal-200 text-teal-700 font-semibold')
                            : (isDarkMode ? 'border-transparent hover:bg-slate-700/30 text-slate-300' : 'border-transparent hover:bg-slate-100 text-slate-700')
                        }`}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <input
                            type="radio"
                            name="roomType"
                            checked={selectedType === type}
                            onChange={() => setSelectedType(type)}
                            className="hidden"
                          />
                          <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border flex items-center justify-center ${
                            selectedType === type ? 'border-teal-500 bg-teal-500' : (isDarkMode ? 'border-slate-600' : 'border-slate-300')
                          }`}>
                            {selectedType === type && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                          <span className="text-xs sm:text-sm">{type}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <hr className={isDarkMode ? 'border-slate-700/60' : 'border-slate-200'} />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Maksimal Narx
                    </label>
                    <span className="text-xs sm:text-sm font-extrabold text-teal-500">{priceRange.toLocaleString()} UZS</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="2000000"
                    step="50000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                <hr className={isDarkMode ? 'border-slate-700/60' : 'border-slate-200'} />

                <div>
                  <label className={`block text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Qavatni tanlang
                  </label>
                  <select
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(e.target.value)}
                    className={`w-full rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm font-medium border focus:outline-none focus:border-teal-500 ${
                      isDarkMode 
                        ? 'bg-slate-900/80 border-slate-700 text-slate-200' 
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="Barcha">Barcha qavatlar</option>
                    <option value="1-qavat">1-qavat</option>
                    <option value="2-qavat">2-qavat</option>
                    <option value="3-qavat">3-qavat</option>
                  </select>
                </div>
              </div>
            </div>

            {/* O'NG GRID */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6">
                {filteredRooms.map((room) => {
                  const isFav = favorites.includes(room.id);
                  return (
                    <div
                      key={room.id}
                      className={`group rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col justify-between hover:shadow-2xl ${
                        isDarkMode 
                          ? 'bg-slate-800/50 backdrop-blur-md border-slate-700/60 hover:border-teal-500/40' 
                          : 'bg-white border-slate-200/80 hover:border-teal-500/40 hover:shadow-slate-300/50'
                      }`}
                    >
                      <div>
                        <div className="h-28 sm:h-36 md:h-60 overflow-hidden relative">
                          <img
                            src={room.image}
                            alt={room.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                          <span className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-teal-300 text-[9px] sm:text-[11px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                            {room.badge}
                          </span>

                          <button
                            onClick={() => toggleFavorite(room.id)}
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700 flex items-center justify-center text-white hover:scale-110 transition"
                          >
                            <svg
                              className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'fill-none stroke-white'}`}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>

                          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-4 flex items-center gap-1 bg-black/50 backdrop-blur-md px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs text-white">
                            <span className="text-amber-400">★</span>
                            <span className="font-bold">{room.rating}</span>
                          </div>
                        </div>

                        <div className="p-2.5 sm:p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
                            <div>
                              <h3 className={`text-xs sm:text-xl font-bold transition-colors line-clamp-1 ${
                                isDarkMode ? 'text-white group-hover:text-teal-300' : 'text-slate-900 group-hover:text-teal-600'
                              }`}>
                                {room.title} (№ {room.roomNumber})
                              </h3>
                              <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{room.floor}</p>
                            </div>
                            <div className="text-left sm:text-right mt-1 sm:mt-0">
                              <span className="text-sm sm:text-xl font-black text-teal-500">{Number(room.price).toLocaleString()}</span>
                              <span className={`text-[10px] sm:text-xs inline sm:block font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>UZS / kecha</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-6 pt-0">
                        <button
                          onClick={() => setActiveBookingRoom(room)}
                          className="w-full py-2 sm:py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all shadow-md transform hover:-translate-y-0.5"
                        >
                          Bron qilish va To'lash
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* MODAL VA TO'LOV QISMI */}
      {activeBookingRoom && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className={`w-full max-w-md h-full p-6 sm:p-8 shadow-2xl border-l flex flex-col justify-between overflow-y-auto ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div>
              <div className={`flex items-center justify-between border-b pb-4 mb-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <h3 className="text-lg sm:text-xl font-bold">Xonani Bron Qilish va To'lov</h3>
                <button 
                  onClick={() => setActiveBookingRoom(null)}
                  className={`p-1 rounded-lg hover:bg-slate-500/10 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  ✕
                </button>
              </div>

              {isSuccess ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-xl font-bold">Broningiz muvaffaqiyatli saqlandi!</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>To'lov holati bronlarim bo'limida ko'rsatiladi.</p>
                </div>
              ) : (
                <form onSubmit={handleConfirmBooking} className="space-y-5">
                  <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                    isDarkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <img src={activeBookingRoom.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-sm">{activeBookingRoom.title}</h4>
                      <p className="text-teal-500 font-bold text-sm">{Number(activeBookingRoom.price).toLocaleString()} UZS / kecha</p>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>To'liq ismingiz</label>
                    <input 
                      required 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ali Valiyev" 
                      className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`} 
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Telefon raqamingiz</label>
                    <input 
                      required 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67" 
                      className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Kirish sanasi</label>
                      <input required type="date" min={new Date().toISOString().slice(0, 10)} value={checkInDate}
                        onChange={(e) => { setCheckInDate(e.target.value); if (checkOutDate && e.target.value >= checkOutDate) setCheckOutDate(''); }}
                        className={`w-full border rounded-xl p-3 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Chiqish sanasi</label>
                      <input required type="date" min={checkInDate || new Date().toISOString().slice(0, 10)} value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)}
                        className={`w-full border rounded-xl p-3 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                    </div>
                  </div>

                  {/* TO'LOV USULINI TANLASH (PAYMENT METHOD) */}
                  <div>
                    <label className={`block text-xs font-semibold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      To'lov Usulini Tanlang
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'Card', label: '💳 Plastik Karta' },
                        { id: 'Click', label: '📲 Click' },
                        { id: 'Payme', label: '📱 Payme' },
                        { id: 'Cash', label: '💵 Naqd Pul' }
                      ].map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id)}
                          className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                            paymentMethod === m.id
                              ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                              : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700')
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* KARTA RAQAMI (Agar Karta tanlansa) */}
                  {paymentMethod === 'Card' && (
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Karta raqami</label>
                      <input 
                        required 
                        type="text" 
                        maxLength="16" 
                        placeholder="8600 **** **** ****" 
                        className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500 ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`} 
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loadingPayment}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-2xl text-sm transition shadow-md disabled:opacity-50"
                  >
                    {loadingPayment ? "Bron saqlanmoqda..." : 'Bronni tasdiqlash'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Rooms;
