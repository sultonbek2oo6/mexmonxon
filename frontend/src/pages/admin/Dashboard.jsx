import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BedDouble, CalendarCheck, DollarSign, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';

const Dashboard = () => {
  const { isDarkMode } = useOutletContext();
  const [data, setData] = useState(null);
  useEffect(() => { api('/admin/dashboard').then(setData).catch((error) => console.error('Dashboard loading failed:', error)); }, []);

  const stats = [
    {
      title: 'Total Rooms',
      value: data ? Number(data.rooms?.TOTAL || 0).toLocaleString() : '—',
      subtext: `${Math.max(0, Number(data?.rooms?.TOTAL || 0) - Number(data?.rooms?.AVAILABLE || 0))} Occupied • ${Number(data?.rooms?.AVAILABLE || 0)} Available`,
      icon: BedDouble,
      iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      progress: data?.rooms?.TOTAL ? Math.round((Number(data.rooms.AVAILABLE || 0) / Number(data.rooms.TOTAL)) * 100) : 0
    },
    {
      title: 'Total Bookings',
      value: data ? Number(data.bookings || 0).toLocaleString() : '—',
      change: '+10%',
      changeText: 'vs. last month',
      icon: CalendarCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
    {
      title: 'Total Revenue',
      value: data ? `${Number(data.revenue || 0).toLocaleString()} UZS` : '—',
      change: '+10%',
      changeText: 'vs. last month',
      icon: DollarSign,
      iconBg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    },
    {
      title: 'Housekeeping',
      value: data ? Number(data.housekeeping?.TOTAL || 0).toLocaleString() : '—',
      subtext: `${Number(data?.housekeeping?.DIRTY || 0)} Dirty`,
      subtext2: `${Math.max(0, Number(data?.housekeeping?.TOTAL || 0) - Number(data?.housekeeping?.DIRTY || 0))} Clean`,
      icon: Sparkles,
      iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    }
  ];

  const recentBookings = data ? (data.recentBookings || []).map((b) => ({
    id: b.ID, guest: b.GUEST_NAME, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    room: b.ROOM_NUMBER, checkIn: b.CHECK_IN_DATE ? new Date(b.CHECK_IN_DATE).toLocaleDateString() : '—',
    checkOut: b.CHECK_OUT_DATE ? new Date(b.CHECK_OUT_DATE).toLocaleDateString() : '—', status: b.STATUS,
    statusBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
  })) : [];
  /*
  const recentBookings = [
    {
      id: 1,
      guest: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      room: 'Deluxe Room',
      checkIn: 'Apr 26, 2025',
      checkOut: 'Apr 28, 2025',
      status: 'Confirmed',
      statusBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
    },
    {
      id: 2,
      guest: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      room: 'Suite',
      checkIn: 'Apr 26, 2025',
      checkOut: 'Apr 30, 2025',
      status: 'Checked-in',
      statusBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    },
    {
      id: 3,
      guest: 'Emily Carter',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
      room: 'Standard Room',
      checkIn: 'Apr 27, 2025',
      checkOut: 'Apr 29, 2025',
      status: 'Pending',
      statusBg: 'bg-amber-500/10 text-amber-500 border-amber-500/30'
    }
  ]; */

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className={`text-3xl font-serif font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back, Admin!</p>
      </div>

      {/* Top 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={index} 
              className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                isDarkMode 
                  ? 'bg-[#0f172a] border-slate-800/80 hover:border-slate-700' 
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl border ${item.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">{item.title}</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {item.value}
              </h3>

              {item.progress && (
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.progress}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">{item.subtext}</p>
                </div>
              )}

              {item.change && (
                <p className="text-xs text-emerald-500 mt-2 flex items-center font-medium">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  {item.change} <span className="text-slate-400 ml-1 font-normal">{item.changeText}</span>
                </p>
              )}

              {item.subtext2 && (
                <p className="text-[11px] text-slate-400 mt-2">
                  <span className="text-amber-500 font-semibold">{item.subtext.split(' ')[0]}</span> {item.subtext.split(' ')[1]} • <span className="text-emerald-500 font-semibold">{item.subtext2.split(' ')[0]}</span> {item.subtext2.split(' ')[1]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Analytics & Circular Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Occupancy Rate (Line Chart Mockup) */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Occupancy Rate</h3>
            </div>
            <select className={`text-xs px-3 py-1.5 rounded-lg border focus:outline-none ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>

          {/* SVG Line Chart */}
          <div className="h-52 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} strokeDasharray="4" />
              <line x1="0" y1="75" x2="500" y2="75" stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} strokeDasharray="4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} strokeDasharray="4" />

              {/* Area */}
              <polygon points="20,110 90,85 160,95 230,65 300,75 370,45 440,60 490,40 490,140 20,140" fill="url(#chartGradient)" />

              {/* Line */}
              <path
                d="M 20 110 L 90 85 L 160 95 L 230 65 L 300 75 L 370 45 L 440 60 L 490 40"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Dots */}
              {[
                { x: 20, y: 110 }, { x: 90, y: 85 }, { x: 160, y: 95 },
                { x: 230, y: 65 }, { x: 300, y: 75 }, { x: 370, y: 45 },
                { x: 440, y: 60 }, { x: 490, y: 40 }
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#10b981" stroke={isDarkMode ? "#0f172a" : "#ffffff"} strokeWidth="2" />
              ))}
            </svg>
            <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
              <span>Apr 20</span>
              <span>Apr 21</span>
              <span>Apr 22</span>
              <span>Apr 23</span>
              <span>Apr 24</span>
              <span>Apr 25</span>
              <span>Apr 26</span>
            </div>
          </div>
        </div>

        {/* Room Status (Donut Chart) */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Room Status</h3>

          <div className="relative flex items-center justify-center my-4">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="60" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="16" fill="transparent" />
              <circle 
                cx="80" 
                cy="80" 
                r="60" 
                stroke="#10b981" 
                strokeWidth="16" 
                strokeDasharray="376.8" 
                strokeDashoffset="75.3" 
                fill="transparent" 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{data ? Number(data.rooms?.TOTAL || 0) : '—'}</span>
              <span className="text-[11px] text-slate-400">Total Rooms</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Occupied</span>
              </div>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>83%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-slate-400">Available</span>
              </div>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>17%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-400">Maintenance</span>
              </div>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>0%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Bookings Table */}
      <div className={`p-6 rounded-2xl border ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Recent Bookings
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={`border-b text-xs uppercase text-slate-400 tracking-wider ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <th className="pb-3 px-2">Guest Name</th>
                <th className="pb-3 px-2">Room</th>
                <th className="pb-3 px-2">Check-in</th>
                <th className="pb-3 px-2">Check-out</th>
                <th className="pb-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {recentBookings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/20 transition duration-150">
                  <td className="py-3.5 px-2">
                    <div className="flex items-center space-x-3">
                      <img src={item.avatar} alt={item.guest} className="w-8 h-8 rounded-full object-cover" />
                      <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.guest}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-slate-400">{item.room}</td>
                  <td className="py-3.5 px-2 text-slate-400">{item.checkIn}</td>
                  <td className="py-3.5 px-2 text-slate-400">{item.checkOut}</td>
                  <td className="py-3.5 px-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${item.statusBg}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
