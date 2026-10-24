import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
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
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
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

      navigate(role === 'admin' ? '/admin/dashboard' : '/client/home', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans py-10">
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
          <h2 className="text-2xl font-bold text-white drop-shadow">Ro'yxatdan o'tish</h2>
          <p className="text-slate-200 text-sm mt-1">Grand Hotel mehmonxonasi hisobini yarating</p>
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
              minLength={8}
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
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-teal-500/85 hover:bg-teal-500 text-white font-semibold rounded-xl border border-teal-300/30 shadow-lg backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Yaratilmoqda..." : "Hisob yaratish"}
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
