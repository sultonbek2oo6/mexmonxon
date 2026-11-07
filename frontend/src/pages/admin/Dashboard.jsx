import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BedDouble, CalendarCheck, DollarSign, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';

const number = (value) => Number(value || 0);
const percent = (part, total) => total ? Math.round((part / total) * 100) : 0;
const formatDate = (value) => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) : '—';

const Dashboard = () => {
  const { isDarkMode } = useOutletContext();
  const [data, setData] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setData(await api(`/admin/dashboard?days=${days}`)); }
    catch (loadError) { setError(loadError.message); }
    finally { setLoading(false); }
  }, [days]);
  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const rooms = data?.rooms || {};
  const totalRooms = number(rooms.TOTAL);
  const occupied = number(rooms.OCCUPIED);
  const available = number(rooms.AVAILABLE);
  const maintenance = number(rooms.MAINTENANCE);
  const housekeeping = data?.housekeeping || {};
  const chart = useMemo(() => {
    const points = (data?.occupancy || []).map((day) => ({
      label: formatDate(day.DAY),
      value: totalRooms ? Math.min(100, percent(number(day.OCCUPIED), totalRooms)) : 0,
    }));
    if (!points.length) return [];
    const width = 470;
    const bottom = 125;
    const xGap = points.length > 1 ? width / (points.length - 1) : 0;
    return points.map((point, index) => ({ ...point, x: points.length === 1 ? 250 : 15 + index * xGap, y: bottom - point.value * 0.9 }));
  }, [data, totalRooms]);
  const line = chart.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const area = chart.length ? `${line} L ${chart[chart.length - 1].x} 140 L ${chart[0].x} 140 Z` : '';
  const statusTotal = occupied + available + maintenance;
  const occupiedPct = percent(occupied, statusTotal);
  const availablePct = percent(available, statusTotal);
  const maintenancePct = Math.max(0, 100 - occupiedPct - availablePct);
  const cardClass = `rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'}`;
  const titleClass = isDarkMode ? 'text-white' : 'text-slate-900';

  const stats = [
    { title: 'Total Rooms', value: totalRooms.toLocaleString(), subtext: `${occupied} Occupied • ${available} Available`, icon: BedDouble, iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20', progress: percent(available, totalRooms) },
    { title: 'Total Bookings', value: number(data?.bookings).toLocaleString(), icon: CalendarCheck, iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { title: 'Total Revenue', value: `${number(data?.revenue).toLocaleString()} UZS`, icon: DollarSign, iconBg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
    { title: 'Housekeeping', value: number(housekeeping.TOTAL).toLocaleString(), subtext: `${number(housekeeping.DIRTY)} Dirty`, subtext2: `${Math.max(0, number(housekeeping.TOTAL) - number(housekeeping.DIRTY))} Clean`, icon: Sparkles, iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div><h1 className={`text-3xl font-serif font-bold ${titleClass}`}>Dashboard</h1><p className="mt-1 text-sm text-slate-400">Welcome back, Admin!</p></div>
      {error && <div role="alert" className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400"><span>Dashboard ma’lumotlarini yuklab bo‘lmadi: {error}</span><button onClick={loadDashboard} className="font-semibold underline">Qayta urinish</button></div>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => { const Icon = item.icon; return <div key={item.title} className={`${cardClass} p-5 transition hover:shadow-xl`}>
          <div className={`mb-3 inline-flex rounded-xl border p-2.5 ${item.iconBg}`}><Icon className="h-5 w-5" /></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.title}</p><h3 className={`mt-1 text-2xl font-bold ${titleClass}`}>{loading && !data ? '—' : item.value}</h3>
          {item.progress !== undefined && <div className="mt-3"><div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${item.progress}%` }} /></div><p className="mt-1.5 text-[11px] text-slate-400">{item.subtext}</p></div>}
          {item.subtext2 && <p className="mt-2 text-[11px] text-slate-400"><span className="font-semibold text-amber-500">{item.subtext.split(' ')[0]}</span> Dirty · <span className="font-semibold text-emerald-500">{item.subtext2.split(' ')[0]}</span> Clean</p>}
        </div>; })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${cardClass} p-6 lg:col-span-2`}>
          <div className="mb-6 flex items-center justify-between"><div><h3 className={`text-lg font-bold ${titleClass}`}>Occupancy Rate</h3><p className="text-xs text-slate-400">Bronlar bo‘yicha band xonalar ulushi</p></div>
            <select aria-label="Bandlik davri" value={days} onChange={(event) => setDays(Number(event.target.value))} className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'}`}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option></select>
          </div>
          <div className="h-52 w-full pt-4"><svg role="img" aria-label="Kunlik bandlik grafigi" className="h-full w-full" viewBox="0 0 500 150" preserveAspectRatio="none">
            <defs><linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.3" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs>
            {[30, 75, 120].map((y) => <line key={y} x1="0" y1={y} x2="500" y2={y} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} strokeDasharray="4" />)}
            {area && <polygon points={area} fill="url(#occupancyGradient)" />}{line && <path d={line} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
            {chart.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r="4" fill="#10b981" stroke={isDarkMode ? '#0f172a' : '#fff'} strokeWidth="2"><title>{point.label}: {point.value}%</title></circle>)}
          </svg><div className="mt-2 flex justify-between gap-1 overflow-hidden px-1 text-[10px] text-slate-400 sm:text-xs">{chart.filter((_, index) => chart.length <= 10 || index % 4 === 0 || index === chart.length - 1).map((point) => <span key={point.label}>{point.label}</span>)}</div></div>
          {!loading && !chart.length && <p className="mt-2 text-center text-xs text-slate-400">Bandlik ma’lumoti mavjud emas.</p>}
        </div>

        <div className={`${cardClass} flex flex-col justify-between p-6`}><h3 className={`text-lg font-bold ${titleClass}`}>Room Status</h3>
          <div className="relative my-4 flex items-center justify-center"><svg className="h-40 w-40 -rotate-90" viewBox="0 0 160 160" aria-label="Xonalar holati diagrammasi">
            <circle cx="80" cy="80" r="60" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="16" fill="none" />
            {statusTotal > 0 && [
              { value: occupied, color: '#10b981', start: 0 },
              { value: available, color: '#22d3ee', start: occupied },
              { value: maintenance, color: '#f59e0b', start: occupied + available },
            ].map((segment) => <circle key={segment.color} cx="80" cy="80" r="60" stroke={segment.color} strokeWidth="16" strokeDasharray={`${376.8 * segment.value / statusTotal} 376.8`} strokeDashoffset={-376.8 * segment.start / statusTotal} fill="none" />)}
          </svg><div className="absolute inset-0 flex flex-col items-center justify-center text-center"><span className={`text-2xl font-bold ${titleClass}`}>{totalRooms}</span><span className="text-[11px] text-slate-400">Total Rooms</span></div></div>
          <div className="space-y-2 text-xs">{[['Occupied', occupied, 'bg-emerald-500', occupiedPct], ['Available', available, 'bg-cyan-400', availablePct], ['Maintenance', maintenance, 'bg-amber-500', maintenancePct]].map(([label, count, color, rate]) => <div key={label} className="flex items-center justify-between"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color}`} /><span className="text-slate-400">{label} · {count}</span></div><span className={`font-semibold ${titleClass}`}>{rate}%</span></div>)}</div>
        </div>
      </div>

      <div className={`${cardClass} p-6`}><h3 className={`mb-4 text-lg font-bold ${titleClass}`}>Recent Bookings</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400"><th className="px-2 pb-3">Guest Name</th><th className="px-2 pb-3">Room</th><th className="px-2 pb-3">Check-in</th><th className="px-2 pb-3">Check-out</th><th className="px-2 pb-3">Status</th></tr></thead><tbody className="divide-y divide-slate-800/40">{(data?.recentBookings || []).map((item) => <tr key={item.ID} className="hover:bg-slate-800/20"><td className={`px-2 py-3.5 font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.GUEST_NAME}</td><td className="px-2 py-3.5 text-slate-400">{item.ROOM_NUMBER}</td><td className="px-2 py-3.5 text-slate-400">{formatDate(item.CHECK_IN_DATE)}</td><td className="px-2 py-3.5 text-slate-400">{formatDate(item.CHECK_OUT_DATE)}</td><td className="px-2 py-3.5"><span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">{item.STATUS}</span></td></tr>)}{!loading && !data?.recentBookings?.length && <tr><td colSpan="5" className="p-6 text-center text-slate-400">Hozircha bronlar yo‘q.</td></tr>}</tbody></table></div></div>
    </div>
  );
};

export default Dashboard;
