import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Parollar mos kelmadi!");
      return;
    }

    localStorage.setItem('token', 'royal_stay_register_token_12345');
    localStorage.setItem('role', 'user');

    navigate('/client/home');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans py-10">
      {/* Orqa fon rasmi */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920')`
        }}
      />
      
      {/* Yumshoq qorong'ulashtirish */}
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
          <h2 className="text-2xl font-bold text-white drop-shadow">Ro'yxatdan o'tish</h2>
          <p className="text-slate-200 text-sm mt-1">Grand Hotel mehmonxonasi hisobini yarating</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1.5 drop-shadow">
              Ism va Familiya
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ali Valiyev"
              className="w-full px-4 py-3 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1.5 drop-shadow">
              Email
            </label>
            <input
              type="email"
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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 drop-shadow">
              Parolni tasdiqlang
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3.5 mt-2 bg-teal-500/80 hover:bg-teal-500 text-white font-semibold rounded-xl border border-teal-300/30 shadow-lg backdrop-blur-sm transition-all duration-200"
          >
            Hisob yaratish
          </motion.button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-300">
          Hisobingiz bormi?{' '}
          <Link to="/login" className="text-teal-300 font-semibold hover:underline">
            Kirish
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;