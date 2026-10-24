import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
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
      const response = await fetch('http://localhost:5001/api/auth/login', {
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

      if (role === 'admin') {
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
      const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
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
      const response = await fetch('http://localhost:5001/api/auth/reset-password', {
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
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920')`
        }}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-8 z-10 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-teal-500/85 backdrop-blur-md flex items-center justify-center font-bold text-white text-xl shadow-lg border border-teal-400/30">
          Sj
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-wide text-white uppercase leading-none drop-shadow-md">Grand Hotel</span>
          <span className="text-[10px] text-teal-200 tracking-wider">Sultonbek Juraboyev</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white drop-shadow">{resetToken ? 'Yangi parol' : forgotMode ? 'Parolni tiklash' : 'Xush kelibsiz!'}</h2>
          <p className="text-slate-200 text-sm mt-1">{resetToken ? 'Yangi parolingizni kiriting' : forgotMode ? 'Email manzilingizga tiklash havolasi yuboramiz' : "Mehmonga xizmat ko'rsatish tizimiga kirish"}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/30 border border-red-500/50 rounded-xl text-red-200 text-xs text-center">
            {error}
          </div>
        )}
        {notice && <div className="mb-4 p-3 bg-teal-500/20 border border-teal-400/40 rounded-xl text-teal-100 text-xs text-center">{notice}</div>}

        {resetToken ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200">Yangi parol</label>
            <input type="password" minLength={8} required value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Kamida 8 belgi" className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white text-sm focus:outline-none focus:border-teal-400" />
            <button disabled={loading} className="w-full py-3.5 bg-teal-500/80 text-white font-semibold rounded-xl disabled:opacity-50">{loading ? 'Saqlanmoqda...' : 'Parolni yangilash'}</button>
          </form>
        ) : forgotMode ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white text-sm focus:outline-none focus:border-teal-400" />
            <button disabled={loading} className="w-full py-3.5 bg-teal-500/80 text-white font-semibold rounded-xl disabled:opacity-50">{loading ? 'Yuborilmoqda...' : 'Tiklash havolasini yuborish'}</button>
            <button type="button" onClick={() => { setForgotMode(false); setError(''); setNotice(''); }} className="w-full text-teal-200 text-sm hover:underline">Kirishga qaytish</button>
          </form>
        ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1.5 drop-shadow">
              Email / Login
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
            <button type="button" onClick={() => { setForgotMode(true); setError(''); setNotice(''); }} className="text-teal-300 hover:text-teal-200 hover:underline">
              Parolni unutdingizmi?
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-teal-500/80 hover:bg-teal-500 text-white font-semibold rounded-xl border border-teal-300/30 shadow-lg backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Tekshirilmoqda..." : "Kirish"}
          </motion.button>
        </form>
        )}

        {!forgotMode && !resetToken && <div className="text-center mt-6 text-xs text-slate-300">
          Hisobingiz yo'qmi?{' '}
          <Link to="/register" className="text-teal-300 font-semibold hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </div>}
      </motion.div>
    </div>
  );
};

export default Login;
