import React, { useCallback, useEffect, useState } from 'react';
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
  Bell,
  ShieldAlert
} from 'lucide-react';
import { Check, X as CloseIcon } from 'lucide-react';
import { api } from '../lib/api';
import BrandLockup from '../components/BrandLockup';

const readStorageJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
};

const AdminLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('adminDarkMode') !== 'false');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [bookingNotifications, setBookingNotifications] = useState([]);
  const [role, setRole] = useState(String(localStorage.getItem('role') || '').toLowerCase());
  const [permissions, setPermissions] = useState(() => {
    const stored = readStorageJson('permissions', []);
    return Array.isArray(stored) ? stored : [];
  });
  const [currentUser, setCurrentUser] = useState(() => readStorageJson('user', {}));
  const [adminSearch, setAdminSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Har bir router sahifasi o'zgarganda animatsiyani tetiklash uchun

  const toggleDarkMode = () => setIsDarkMode((prev) => {
    const next = !prev;
    localStorage.setItem('adminDarkMode', String(next));
    return next;
  });
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const syncSession = useCallback(async () => {
    try {
      const { user } = await api('/profile');
      const currentRole = String(user?.role || 'guest').toLowerCase();
      const currentPermissions = user?.permissions || [];
      setRole(currentRole);
      setPermissions(currentPermissions);
      setCurrentUser(user || {});
      localStorage.setItem('role', currentRole);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('permissions', JSON.stringify(currentPermissions));
      if (!['admin', 'manager'].includes(currentRole)) navigate('/client/home', { replace: true });
    } catch (error) { console.error('Session role refresh failed:', error); }
  }, [navigate]);
  useEffect(() => {
    syncSession();
    const timer = window.setInterval(syncSession, 30000);
    return () => window.clearInterval(timer);
  }, [syncSession]);
  const loadNotifications = useCallback(async () => {
    if (role !== 'manager' && !permissions.includes('bookings')) return;
    try { setBookingNotifications(await api('/admin/notifications/bookings')); }
    catch (error) { console.error('Booking notifications loading failed:', error); }
  }, [role, permissions]);
  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 10000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);
  const reviewBooking = async (bookingId, status) => {
    try {
      await api(`/admin/bookings/${bookingId}`, { method: 'PUT', body: JSON.stringify({ status }) });
      await loadNotifications();
    } catch (error) { window.alert(error.message); }
  };

  const handleLogout = () => {
    ['token', 'role', 'user', 'permissions'].forEach((key) => localStorage.removeItem(key));
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, permission: 'dashboard' },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck, permission: 'bookings' },
    { name: 'Rooms', path: '/admin/rooms', icon: BedDouble, permission: 'rooms' },
    { name: 'Room Types', path: '/admin/room-types', icon: Layers, permission: 'roomTypes' },
    { name: 'Foydalanuvchilar', path: '/admin/users', icon: Users, permission: 'users' },
    { name: 'Employees', path: '/admin/employees', icon: UserCheck, permission: 'employees' },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard, permission: 'payments' },
    { name: 'Housekeeping', path: '/admin/housekeeping', icon: Sparkles, permission: 'housekeeping' },
    { name: 'Services', path: '/admin/services', icon: ConciergeBell, permission: 'services' },
    { name: 'Service Orders', path: '/admin/service-orders', icon: ClipboardList, permission: 'services' },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3, permission: 'reports' },
    { name: 'Settings', path: '/admin/settings', icon: Settings, permission: 'settings' },
  ].filter((item) => role === 'manager' || permissions.includes(item.permission));
  const visibleNavItems = navItems.filter((item) => item.name.toLowerCase().includes(adminSearch.trim().toLowerCase()));

  useEffect(() => {
    if (!navItems.some((item) => item.path === location.pathname) && navItems.length) {
      navigate(navItems[0].path, { replace: true });
    }
  }, [location.pathname, navigate, role, permissions]);

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
            <BrandLockup small />
            <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
            {visibleNavItems.map((item) => {
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
                placeholder="Bo‘lim izlash..."
                value={adminSearch}
                onChange={(event) => setAdminSearch(event.target.value)}
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
            {(role === 'manager' || permissions.includes('bookings')) && <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen((open) => !open)}
                aria-label={`Booking notifications: ${bookingNotifications.length} pending`}
                aria-expanded={isNotificationsOpen}
                className={`p-2.5 rounded-xl border relative transition ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
              >
                <Bell className="w-5 h-5" />
                {bookingNotifications.length > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{bookingNotifications.length}</span>}
              </button>
              {isNotificationsOpen && (
                <div className={`absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border shadow-2xl overflow-hidden z-50 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
                  <div className="px-4 py-3 border-b border-slate-700/30 flex items-center justify-between">
                    <span className="font-bold text-sm">Yangi bronlar</span>
                    <button onClick={() => { setIsNotificationsOpen(false); navigate('/admin/bookings'); }} className="text-xs text-emerald-500 hover:underline">Barchasini ko‘rish</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-700/30">
                    {bookingNotifications.length ? bookingNotifications.map((booking) => (
                      <div key={booking.ID} className="p-4 space-y-2">
                        <button onClick={() => { setIsNotificationsOpen(false); navigate('/admin/bookings'); }} className="text-left w-full">
                          <p className="text-sm font-semibold">{booking.GUEST_NAME}</p>
                          <p className="text-xs text-slate-400">Xona {booking.ROOM_NUMBER} · {booking.CHECK_IN_DATE} — {booking.CHECK_OUT_DATE}</p>
                          <p className="text-xs text-emerald-500 mt-1">{Number(booking.TOTAL_AMOUNT || 0).toLocaleString()} UZS</p>
                        </button>
                        <div className="flex gap-2">
                          <button onClick={() => reviewBooking(booking.ID, 'confirmed')} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"><Check className="w-3.5 h-3.5" />Tasdiqlash</button>
                          <button onClick={() => reviewBooking(booking.ID, 'cancelled')} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold"><CloseIcon className="w-3.5 h-3.5" />Rad etish</button>
                        </div>
                      </div>
                    )) : <p className="p-5 text-sm text-slate-400 text-center">Tasdiqlashni kutayotgan bron yo‘q.</p>}
                  </div>
                </div>
              )}
            </div>}

            {/* Admin Profile */}
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-700/50">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" 
                alt="Admin Avatar" 
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500/50"
              />
              <div className="hidden md:block text-left">
                <p className={`text-sm font-bold leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{currentUser?.first_name || (role === 'manager' ? 'Menejer' : 'Admin')}</p>
                <p className="text-xs text-slate-400 mt-1">{role === 'manager' ? 'Mehmonxona menejeri' : 'Admin'}</p>
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
              {role === 'admin' && navItems.length === 0
                ? <div className={`max-w-xl mx-auto mt-12 rounded-2xl border p-8 text-center ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}><ShieldAlert className="w-10 h-10 mx-auto mb-3 text-amber-400" /><h1 className="text-xl font-bold">Bo‘lim ruxsatlari berilmagan</h1><p className="mt-2 text-sm text-slate-400">Menejer sizga kamida bitta bo‘lim huquqini berishi kerak. O‘zgarishlar avtomatik yangilanadi.</p></div>
                : <Outlet context={{ isDarkMode, role }} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
