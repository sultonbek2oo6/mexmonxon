import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    let userRole = 'user';
    if (email.toLowerCase().includes('admin')) {
      userRole = 'admin';
    }

    localStorage.setItem('token', 'royal_stay_jwt_token_12345');
    localStorage.setItem('role', userRole);

    if (userRole === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/client/home');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans">
      {/* Orqa fon rasmi */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920')`
        }}
      />
      
      {/* Yumshoq, yengil qorong'ulashtiruvchi qatlam */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" />

      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-8 z-10 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-teal-500/80 backdrop-blur-md flex items-center justify-center font-bold text-white text-xl shadow-lg border border-teal-400/30">
          Sj
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-wide text-white uppercase leading-none drop-shadow-md">Grand Hotel</span>
          <span className="text-[10px] text-teal-200 tracking-wider">Sultonbek Juraboyev</span>
        </div>
      </motion.div>

      {/* SHAFFOF KARTA (Framer Motion bilan animatsiya qilingan) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4 bg-slate-900/35 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white drop-shadow">Xush kelibsiz!</h2>
          <p className="text-slate-200 text-sm mt-1">Mehmonga xizmat ko'rsatish tizimiga kirish</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1.5 drop-shadow">
              Email / Login
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1.5 drop-shadow">
              Parol
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-200 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-black/40 border-white/30 text-teal-500 focus:ring-0 cursor-pointer"
              />
              <span>Eslab qolish</span>
            </label>
            <a href="#forgot" className="text-teal-300 hover:text-teal-200 hover:underline">
              Parolni unutdingizmi?
            </a>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3.5 mt-2 bg-teal-500/80 hover:bg-teal-500 text-white font-semibold rounded-xl border border-teal-300/30 shadow-lg backdrop-blur-sm transition-all duration-200"
          >
            Kirish
          </motion.button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <span className="relative bg-slate-900/60 backdrop-blur-md px-3 text-xs text-slate-300 rounded-full">yoki</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="w-full py-2.5 bg-black/30 hover:bg-black/50 border border-white/20 text-slate-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
            </svg>
            Google bilan kirish
          </motion.button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-300">
          Hisobingiz yo'qmi?{' '}
          <Link to="/register" className="text-teal-300 font-semibold hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;