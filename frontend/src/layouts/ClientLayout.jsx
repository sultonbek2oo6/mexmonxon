import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ClientLayout = ({ isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Sahifa yo'nalishi (path)ni kuzatib borish uchun[cite: 2]

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${
      isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header / Navbar */}
      <header className={`border-b transition-colors duration-500 sticky top-0 z-40 backdrop-blur-md ${
        isDarkMode 
          ? 'bg-[#0d1527]/90 border-slate-800 text-white' 
          : 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-wider text-teal-500">
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

          {/* Navigatsiya linklari */}
          <nav className="hidden md:flex space-x-8 text-sm font-semibold">
            <NavLink 
              to="/client/home" 
              className={({ isActive }) => 
                isActive 
                  ? 'text-teal-500 font-bold border-b-2 border-teal-500 pb-1' 
                  : (isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }
            >
              Bosh sahifa
            </NavLink>
            <NavLink 
              to="/client/rooms" 
              className={({ isActive }) => 
                isActive 
                  ? 'text-teal-500 font-bold border-b-2 border-teal-500 pb-1' 
                  : (isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }
            >
              Xonalar
            </NavLink>
            <NavLink 
              to="/client/services" 
              className={({ isActive }) => 
                isActive 
                  ? 'text-teal-500 font-bold border-b-2 border-teal-500 pb-1' 
                  : (isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }
            >
              Xizmatlar
            </NavLink>
            <NavLink 
              to="/client/my-bookings" 
              className={({ isActive }) => 
                isActive 
                  ? 'text-teal-500 font-bold border-b-2 border-teal-500 pb-1' 
                  : (isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }
            >
              Mening bronlarim
            </NavLink>
          </nav>

          {/* O'ng taraf: Rejim almashtirgich + Chiqish */}
          <div className="flex items-center gap-4">
            
            {/* TOGGLE BUTTON (KUN / TUN) */}
            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Rejimni almashtirish"
            >
              {isDarkMode ? (
                <>
                  <span>☀️</span>
                  <span className="hidden sm:inline">Kun</span>
                </>
              ) : (
                <>
                  <span>🌙</span>
                  <span className="hidden sm:inline">Tun</span>
                </>
              )}
            </button>

            {/* Chiqish */}
            <button
              onClick={handleLogout}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Chiqish
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - HAR BIR SAHIFA BIRDANIGA RAVON VA SKROMNIY ANIMATSIYA BO'LADI */}
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname} // Sahifa yo'nalishi o'zgarganda animatsiyani qayta ishlatadi[cite: 2]
            initial={{ opacity: 0, y: 12 }} // Skromniygina (12px) pastdan chiqish
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }} // Yengil, ravon va tezochar o'tish
          >
            <Outlet context={{ isDarkMode }} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ClientLayout;