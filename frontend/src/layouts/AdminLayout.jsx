import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  BedDouble, 
  Layers, 
  Users, 
  UserCheck, 
  CreditCard, 
  Sparkles, 
  ConciergeBell, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Search,
  Bell
} from 'lucide-react';

const AdminLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Har bir router sahifasi o'zgarganda animatsiyani tetiklash uchun

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Rooms', path: '/admin/rooms', icon: BedDouble },
    { name: 'Room Types', path: '/admin/room-types', icon: Layers },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Employees', path: '/admin/employees', icon: UserCheck },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Housekeeping', path: '/admin/housekeeping', icon: Sparkles },
    { name: 'Services', path: '/admin/services', icon: ConciergeBell },
    { name: 'Service Orders', path: '/admin/service-orders', icon: ClipboardList },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0b1320] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isDarkMode ? 'bg-[#0f172a] border-r border-slate-800/80' : 'bg-[#0d1b2a] text-white'}`}>
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg shadow-inner">
                🏨
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-serif">Grand Hotel</span>
            </div>
            <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className={`sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b backdrop-blur-md transition-colors ${
          isDarkMode ? 'bg-[#0b1320]/80 border-slate-800/80' : 'bg-white/80 border-slate-200'
        }`}>
          <div className="flex items-center space-x-3">
            <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800/20">
              <Menu className="w-6 h-6" />
            </button>

            {/* Search Input */}
            <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent text-sm focus:outline-none w-48 lg:w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Dark/Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification Bell */}
            <button className={`p-2.5 rounded-xl border relative transition ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Admin Profile */}
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-700/50">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" 
                alt="Admin Avatar" 
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500/50"
              />
              <div className="hidden md:block text-left">
                <p className={`text-sm font-bold leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Admin</p>
                <p className="text-xs text-slate-400 mt-1">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Page with Smooth Transition */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
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
      </div>
    </div>
  );
};

export default AdminLayout;