import React, { useCallback, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HotelIntro from './HotelIntro';
import { API_URL } from '../../lib/api';

const Register = () => {
  const [introComplete, setIntroComplete] = useState(false);
  const completeIntro = useCallback(() => setIntroComplete(true), []);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Parollar mos kelmadi!");
      return;
    }

    const nameParts = fullName.trim().split(' ');
    if (nameParts.length < 2 || nameParts.some((part) => !part)) {
      setError('Ism va familiyani alohida kiriting.');
      return;
    }
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
      }

      localStorage.setItem('token', data.token);
      const role = String(data.user.role || 'guest').toLowerCase();
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate(['admin', 'manager'].includes(role) ? '/admin/dashboard' : '/client/home', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans py-10">
      <HotelIntro onComplete={completeIntro} />
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1.015 }}
        transition={{ duration: 18, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/65 via-slate-950/35 to-amber-950/45 backdrop-blur-[2px]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-[-20%] h-[140%] w-56 rotate-[18deg] bg-gradient-to-r from-transparent via-amber-100/10 to-transparent blur-2xl"
        animate={{ x: ['-20vw', '120vw'] }}
        transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-[12%] top-[22%] h-2 w-2 rounded-full bg-amber-200/70 shadow-[0_0_24px_8px_rgba(251,191,36,0.24)]"
        animate={{ y: [0, -22, 0], opacity: [0.35, 0.9, 0.35], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[18%] right-[15%] h-1.5 w-1.5 rounded-full bg-amber-100/70 shadow-[0_0_20px_7px_rgba(251,191,36,0.2)]"
        animate={{ y: [0, 18, 0], opacity: [0.25, 0.8, 0.25] }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, delay: 1, repeatType: 'reverse' }}
      />

      {introComplete && <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-8 z-10 flex items-center gap-3"
      >
        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-200 to-amber-600 flex items-center justify-center font-serif font-bold text-slate-950 text-xl shadow-[0_8px_30px_rgba(217,165,84,0.35)] border border-amber-100/60">
          <span>Sj</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-wide text-white uppercase leading-none drop-shadow-md">Grand Hotel</span>
          <span className="text-[10px] text-amber-100/80 tracking-[0.22em] uppercase">Sultonbek Juraboyev</span>
        </div>
      </motion.div>}

      {introComplete && <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 28, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4 overflow-hidden rounded-[1.75rem] border border-amber-100/25 bg-slate-950/55 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/80 to-transparent" />
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/30 bg-amber-100/10 text-amber-200 shadow-[0_0_32px_rgba(251,191,36,0.14)]">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 className="text-2xl font-semibold tracking-wide text-white drop-shadow">Ro'yxatdan o'tish</h2>
          <p className="text-slate-200/90 text-sm mt-1">Grand Hotel mehmonxonasi hisobini yarating</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/30 border border-red-500/50 rounded-xl text-red-200 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1.5 drop-shadow">
              Ism va Familiya
            </label>
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ali Valiyev"
              className="w-full px-4 py-3 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1.5 drop-shadow">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1.5 drop-shadow">
              Parol
            </label>
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 drop-shadow">
              Parolni tasdiqlang
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300 transition"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-amber-500/85 hover:bg-amber-400 text-white font-semibold rounded-xl border border-amber-200/30 shadow-lg backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Yaratilmoqda..." : "Hisob yaratish"}
          </motion.button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-300">
          Hisobingiz bormi?{' '}
          <Link to="/login" className="text-amber-200 font-semibold hover:underline">
            Kirish
          </Link>
        </div>
      </motion.div>}
    </div>
  );
};

export default Register;
