import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ClientLayout = ({ isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dropdown va Profil Modal holatlarini saqlash
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Profil ma'lumotlari holati
  const [userInfo, setUserInfo] = useState({
    fullName: localStorage.getItem('fullName') || 'Sultonbek Juraboyev',
    email: localStorage.getItem('email') || 'user@grandhotel.uz',
    phone: localStorage.getItem('phone') || '+998 90 123 45 67',
    passport: localStorage.getItem('passport') || 'AA 1234567',
    birthDate: localStorage.getItem('birthDate') || '2000-01-01',
    password: '',
    confirmPassword: ''
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (userInfo.password && userInfo.password !== userInfo.confirmPassword) {
      alert("Parollar mos kelmadi!");
      return;
    }
    localStorage.setItem('fullName', userInfo.fullName);
    localStorage.setItem('email', userInfo.email);
    localStorage.setItem('phone', userInfo.phone);
    localStorage.setItem('passport', userInfo.passport);
    localStorage.setItem('birthDate', userInfo.birthDate);
    alert("Profil ma'lumotlari muvaffaqiyatli saqlandi!");
    setIsProfileModalOpen(false);
  };

  // Navigatsiya linklari
  const navItems = [
    {
      name: 'Bosh sahifa',
      path: '/client/home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Xonalar',
      path: '/client/rooms',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7" />
        </svg>
      )
    },
    {
      name: 'Xizmatlar',
      path: '/client/services',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      name: 'Bronlarim',
      path: '/client/my-bookings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col pb-20 md:pb-0 transition-colors duration-500 ${
      isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header / Navbar */}
      <header className={`border-b transition-colors duration-500 sticky top-0 z-40 backdrop-blur-md ${
        isDarkMode 
          ? 'bg-[#0d1527]/90 border-slate-800 text-white' 
          : 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl font-black tracking-wider text-teal-500">
              GRAND HOTEL
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isDarkMode 
                ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' 
                : 'bg-teal-50 text-teal-700 border-teal-200'
            }`}>
              RESORT
            </span>
          </div>

          {/* Desktop Navigatsiya linklari */}
          <nav className="hidden md:flex space-x-8 text-sm font-semibold">
            {navItems.map((item) => (
              <NavLink 
                key={item.path}
                to={item.path} 
                className={({ isActive }) => 
                  isActive 
                    ? 'text-teal-500 font-bold border-b-2 border-teal-500 pb-1' 
                    : (isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* O'NG TARAF: KUN/TUN REJIM + DOIRA AVATAR & PROFIL MENYUSI */}
          <div className="flex items-center gap-3">
            
            {/* KUN / TUN REJIM TUGMASI (AVATAR YONIDA) */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full border transition-all shadow-sm flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Rejimni almashtirish"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* DOIRA SHAKLIDAGI AVATAR VA PROFIL DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center focus:outline-none group"
              >
                {/* Doira shaklidagi avatar */}
                <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 border-2 border-teal-500/60 flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition">
                  {userInfo.fullName.charAt(0).toUpperCase()}
                </div>
              </button>

              {/* DROPDOWN MENU */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl z-50 py-2 ${
                      isDarkMode ? 'bg-[#0d1527] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="px-4 py-2 border-b border-slate-800/50">
                      <p className="text-xs font-bold truncate">{userInfo.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{userInfo.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition ${
                        isDarkMode ? 'hover:bg-slate-800/60 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profil sozlamalari</span>
                    </button>

                    <div className="border-t border-slate-800/50 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Chiqish (Log Out)</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Outlet context={{ isDarkMode }} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* MOBIL UCHUN PASTKI MENYU */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-[#0d1527]/95 border-slate-800/80 text-slate-400' 
          : 'bg-white/95 border-slate-200/80 text-slate-500 shadow-lg'
      }`}>
        <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-all ${
                  isActive
                    ? 'text-teal-500 font-bold scale-105'
                    : isDarkMode 
                      ? 'hover:text-slate-200' 
                      : 'hover:text-slate-800'
                }`
              }
            >
              <div className="mb-1">{item.icon}</div>
              <span className="truncate max-w-[70px] text-center">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* TO'LIQ PROFIL SOZLAMALARI MODAL OYNASI */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl my-8 max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#0d1527] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
              <h3 className="text-lg font-bold">Profil ma'lumotlarini tahrirlash</h3>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Ism-Familiya</label>
                  <input
                    type="text"
                    required
                    value={userInfo.fullName}
                    onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-teal-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Telefon raqam</label>
                  <input
                    type="text"
                    placeholder="+998 90 123 45 67"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-teal-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email manzil</label>
                <input
                  type="email"
                  required
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-teal-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Pasport ma'lumotlari (Seriya va raqam)</label>
                  <input
                    type="text"
                    placeholder="AA 1234567"
                    value={userInfo.passport}
                    onChange={(e) => setUserInfo({ ...userInfo, passport: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-teal-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tug'ilgan sana</label>
                  <input
                    type="date"
                    value={userInfo.birthDate}
                    onChange={(e) => setUserInfo({ ...userInfo, birthDate: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-teal-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="border-t border-slate-800/50 pt-3 mt-3">
                <p className="text-xs font-bold text-teal-400 mb-3">Parolni o'zgartirish (ixtiyoriy)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Yangi parol</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={userInfo.password}
                      onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-teal-500 ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Parolni tasdiqlang</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={userInfo.confirmPassword}
                      onChange={(e) => setUserInfo({ ...userInfo, confirmPassword: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-teal-500 ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-lg transition"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClientLayout;