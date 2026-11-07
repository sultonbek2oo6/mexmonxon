import React, { useCallback, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import HotelIntro from './HotelIntro';
import { API_URL } from '../../lib/api';

const Login = () => {
  const [introComplete, setIntroComplete] = useState(false);
  const completeIntro = useCallback(() => setIntroComplete(true), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const resetToken = searchParams.get('resetToken');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Tizimga kirishda xatolik yuz berdi");
      }

      localStorage.setItem('token', data.token);
      const role = String(data.user.role || 'guest').toLowerCase();
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('permissions', JSON.stringify(data.user.permissions || []));

      if (['admin', 'manager'].includes(role)) {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/home');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Tiklash xatini yuborib bo‘lmadi.');
      setNotice(data.message);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: resetPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Parolni yangilab bo‘lmadi.');
      setNotice(data.message);
      setSearchParams({});
      setForgotMode(false);
      setPassword('');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans">
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
          {!resetToken && !forgotMode && <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/30 bg-amber-100/10 text-amber-200 shadow-[0_0_32px_rgba(251,191,36,0.14)]">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>}
          <h2 className="text-2xl font-semibold tracking-wide text-white drop-shadow">{resetToken ? 'Yangi parol' : forgotMode ? 'Parolni tiklash' : 'Xush kelibsiz!'}</h2>
          <p className="text-slate-200/90 text-sm mt-1">{resetToken ? 'Yangi parolingizni kiriting' : forgotMode ? 'Email manzilingizga tiklash havolasi yuboramiz' : "Mehmonga xizmat ko'rsatish tizimiga kirish"}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/30 border border-red-500/50 rounded-xl text-red-200 text-xs text-center">
            {error}
          </div>
        )}
        {notice && <div className="mb-4 p-3 bg-amber-500/15 border border-amber-300/30 rounded-xl text-amber-100 text-xs text-center">{notice}</div>}

        {resetToken ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200">Yangi parol</label>
            <input type="password" minLength={8} required value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Kamida 8 belgi" className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-300" />
            <button disabled={loading} className="w-full py-3.5 bg-amber-500/85 text-white font-semibold rounded-xl disabled:opacity-50">{loading ? 'Saqlanmoqda...' : 'Parolni yangilash'}</button>
          </form>
        ) : forgotMode ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-300" />
            <button disabled={loading} className="w-full py-3.5 bg-amber-500/85 text-white font-semibold rounded-xl disabled:opacity-50">{loading ? 'Yuborilmoqda...' : 'Tiklash havolasini yuborish'}</button>
            <button type="button" onClick={() => { setForgotMode(false); setError(''); setNotice(''); }} className="w-full text-amber-100 text-sm hover:underline">Kirishga qaytish</button>
          </form>
        ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1.5 drop-shadow">
              Email / Login
            </label>
            <input
              type="email"
              autoComplete="username"
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300 transition"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-200 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-black/40 border-white/30 text-amber-400 focus:ring-0 cursor-pointer"
              />
              <span>Eslab qolish</span>
            </label>
            <button type="button" onClick={() => { setForgotMode(true); setError(''); setNotice(''); }} className="text-amber-200 hover:text-amber-100 hover:underline">
              Parolni unutdingizmi?
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-amber-500/85 hover:bg-amber-400 text-white font-semibold rounded-xl border border-amber-200/30 shadow-lg backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Tekshirilmoqda..." : "Kirish"}
          </motion.button>
        </form>
        )}

        {!forgotMode && !resetToken && <div className="text-center mt-6 text-xs text-slate-300">
          Hisobingiz yo'qmi?{' '}
          <Link to="/register" className="text-amber-200 font-semibold hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </div>}
      </motion.div>}
    </div>
  );
};

export default Login;
