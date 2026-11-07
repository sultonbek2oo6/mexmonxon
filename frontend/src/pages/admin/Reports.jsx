import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, TrendingUp, DollarSign, Users, BedDouble, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { api } from '../../lib/api';

const PALETTE = [
  { hex: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-500' },
  { hex: '#14b8a6', bg: 'bg-teal-500', text: 'text-teal-500' },
  { hex: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-500' },
  { hex: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-500' },
  { hex: '#8b5cf6', bg: 'bg-violet-500', text: 'text-violet-500' },
];
const money = (value) => `${Number(value || 0).toLocaleString('uz-UZ')} UZS`;

const Reports = () => {
  const { isDarkMode } = useOutletContext();
  const [period, setPeriod] = useState('week');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setReport(await api(`/admin/reports?period=${period}`)); }
    catch (loadError) { setError(loadError.message || 'Hisobotni yuklab bo‘lmadi.'); }
    finally { setLoading(false); }
  }, [period]);
  useEffect(() => { loadReport(); }, [loadReport]);

  const bookingRows = report?.bookings || [];
  const roomRows = report?.roomTypes || [];
  const totalRooms = roomRows.reduce((sum, row) => sum + Number(row.ROOM_COUNT || 0), 0);
  const typeSegments = roomRows.map((row, index) => ({ ...row, ...PALETTE[index % PALETTE.length], percent: totalRooms ? Number(row.ROOM_COUNT || 0) / totalRooms * 100 : 0 }));
  let cursor = 0;
  const donut = typeSegments.length ? `conic-gradient(${typeSegments.map((item) => {
    const start = cursor;
    cursor += item.percent;
    return `${item.hex} ${start}% ${cursor}%`;
  }).join(', ')})` : '#1e293b';
  const maxBookings = Math.max(1, ...bookingRows.map((row) => Number(row.BOOKINGS || 0)));
  const periodLabels = { week: 'Joriy hafta', month: 'Joriy oy', year: 'Joriy yil' };
  const stats = [
    { title: 'Bronlar', value: bookingRows.reduce((sum, row) => sum + Number(row.BOOKINGS || 0), 0).toLocaleString('uz-UZ'), icon: Users },
    { title: 'To‘langan tushum', value: money(report?.finance?.revenue), icon: DollarSign },
    { title: 'Xarajatlar', value: money(report?.finance?.spent), icon: DollarSign },
    { title: 'Sof qoldiq', value: money(report?.finance?.balance), icon: TrendingUp },
    { title: 'Joriy bandlik', value: report?.rooms?.TOTAL ? `${Math.round(Number(report.rooms.OCCUPIED || 0) / Number(report.rooms.TOTAL) * 100)}%` : '0%', icon: BedDouble },
  ];
  const cardClass = `rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'}`;
  const textClass = isDarkMode ? 'text-white' : 'text-slate-900';

  const exportReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hotel-report-${period}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className={`text-3xl font-serif font-bold ${textClass}`}>Hisobotlar</h1><p className="mt-1 text-sm text-slate-400">Bronlar davr bo‘yicha, tushum va xarajatlar haqiqiy to‘lov sanasi bo‘yicha jamlanadi.</p></div>
        <button disabled={!report} onClick={exportReport} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"><Download className="h-4 w-4" /><span>JSON yuklab olish</span></button>
      </div>

      <div className={`${cardClass} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between`}>
        <span className="text-sm font-medium text-slate-300">{periodLabels[period]}</span>
        <div className="flex gap-2">{[['week', 'Hafta'], ['month', 'Oy'], ['year', 'Yil']].map(([value, label]) => <button key={value} onClick={() => setPeriod(value)} aria-pressed={period === value} className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${period === value ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400' : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>)}</div>
      </div>

      {error && <div role="alert" className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">{error}<button onClick={loadReport} className="underline">Qayta urinish</button></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats.map((stat) => { const Icon = stat.icon; return <div key={stat.title} className={`${cardClass} p-5`}><div className="flex items-center justify-between"><span className="text-sm text-slate-400">{stat.title}</span><Icon className="h-5 w-5 text-emerald-400" /></div><div className={`mt-3 text-xl font-bold ${textClass}`}>{loading && !report ? '—' : stat.value}</div></div>; })}</div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className={`${cardClass} p-6 lg:col-span-7`}>
          <div className="mb-6 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-emerald-500" /><h2 className={`text-lg font-bold ${textClass}`}>Bronlar dinamikasi</h2></div>
          {bookingRows.length ? <div className="flex h-56 items-end justify-between gap-2 overflow-x-auto pt-6">{bookingRows.map((row) => <div key={row.PERIOD} className="group flex h-full min-w-8 flex-1 flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end overflow-hidden rounded-t-xl bg-slate-800/20"><div title={`${row.PERIOD}: ${row.BOOKINGS}`} style={{ height: `${Math.max(5, Number(row.BOOKINGS || 0) / maxBookings * 100)}%` }} className="relative w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400" /></div><span className="whitespace-nowrap text-[10px] text-slate-400 sm:text-xs">{row.PERIOD}</span></div>)}</div> : <p className="py-16 text-center text-sm text-slate-400">Tanlangan davrda bron qayd etilmagan.</p>}
        </section>

        <section className={`${cardClass} p-6 lg:col-span-5`}>
          <div className="mb-4 flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-emerald-500" /><h2 className={`text-lg font-bold ${textClass}`}>Xona turlari</h2></div>
          <div className="flex flex-col items-center justify-around gap-6 py-4 sm:flex-row">
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full" style={{ background: donut }}><div className={`flex h-24 w-24 flex-col items-center justify-center rounded-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-white'}`}><BedDouble className="mb-1 h-5 w-5 text-emerald-500" /><span className="text-xs text-slate-400">Xonalar</span><span className={`text-sm font-extrabold ${textClass}`}>{totalRooms}</span></div></div>
            <div className="w-full space-y-2.5 sm:w-auto">{typeSegments.map((item) => <div key={item.TYPE_NAME} className="flex items-center justify-between gap-4 text-xs font-medium"><div className="flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${item.bg}`} /><span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{item.TYPE_NAME} · {item.ROOM_COUNT}</span></div><span className={`font-mono font-bold ${item.text}`}>{Math.round(item.percent)}%</span></div>)}{!typeSegments.length && <p className="text-xs text-slate-400">Xona turlari mavjud emas.</p>}</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reports;
