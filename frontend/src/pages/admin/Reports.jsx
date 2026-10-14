import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BedDouble, 
  ChevronDown, 
  PieChart as PieChartIcon, 
  BarChart3 
} from 'lucide-react';

const Reports = () => {
  const { isDarkMode } = useOutletContext();

  const [dateRange, setDateRange] = useState('Apr 20, 2025 - Apr 26, 2025');
  const [selectedReportType, setSelectedReportType] = useState('Weekly');

  // Rasmda ko'rsatilgan statistik ko'rsatkichlar
  const stats = [
    { title: 'Total Bookings', value: '48', change: '+12%', icon: Users, isPositive: true },
    { title: 'Revenue', value: '$8,640', change: '+18.5%', icon: DollarSign, isPositive: true },
    { title: 'Occupancy Rate', value: '83%', change: '+5%', icon: TrendingUp, isPositive: true },
  ];

  // Bar Chart (Bookings Overview) ma'lumotlari
  const bookingsOverview = [
    { day: 'Mon', value: 35, height: '35%' },
    { day: 'Tue', value: 45, height: '45%' },
    { day: 'Wed', value: 60, height: '60%' },
    { day: 'Thu', value: 50, height: '50%' },
    { day: 'Fri', value: 40, height: '40%' },
    { day: 'Sat', value: 85, height: '85%' },
    { day: 'Sun', value: 75, height: '75%' },
  ];

  // Room Type Distribution ma'lumotlari
  const roomTypes = [
    { type: 'Standard', percentage: 40, color: 'bg-emerald-500', textColor: 'text-emerald-500' },
    { type: 'Deluxe', percentage: 25, color: 'bg-teal-500', textColor: 'text-teal-500' },
    { type: 'Family', percentage: 15, color: 'bg-amber-500', textColor: 'text-amber-500' },
    { type: 'Suite', percentage: 20, color: 'bg-cyan-500', textColor: 'text-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-serif font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Reports
          </h1>
          <p className="text-slate-400 text-sm mt-1">Analytics, revenue metrics, and booking breakdown.</p>
        </div>

        {/* Export Button */}
        <button 
          onClick={() => alert('Report downloaded successfully!')}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl border w-full sm:w-auto ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-sm font-medium font-mono">{dateRange}</span>
          <ChevronDown className="w-4 h-4 text-slate-400 cursor-pointer ml-auto sm:ml-2" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['Weekly', 'Monthly', 'Yearly'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedReportType(type)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition ${
                selectedReportType === type
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isDarkMode 
                    ? 'text-slate-400 hover:bg-slate-800/50' 
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition hover:border-emerald-500/40 ${
                isDarkMode 
                  ? 'bg-[#0f172a] border-slate-800/80 text-white' 
                  : 'bg-white border-slate-200/80 text-slate-900 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">{stat.title}</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-3xl font-extrabold tracking-tight">{stat.value}</h3>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Bookings Overview (Bar Chart) */}
        <div className={`lg:col-span-7 p-6 rounded-2xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <h2 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Bookings Overview
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Mon - Sun</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
            {bookingsOverview.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full bg-slate-800/20 rounded-t-xl h-full flex items-end overflow-hidden">
                  <div
                    style={{ height: item.height }}
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg group-hover:brightness-125 transition-all duration-300 relative"
                  >
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded border border-slate-700 pointer-events-none transition">
                      {item.value}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400 font-mono">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Room Type Distribution (Donut Chart) */}
        <div className={`lg:col-span-5 p-6 rounded-2xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5 text-emerald-500" />
              <h2 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Room Type Distribution
              </h2>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* CSS Donut Chart */}
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center shrink-0"
                 style={{
                   background: `conic-gradient(
                     #10b981 0% 40%, 
                     #14b8a6 40% 65%, 
                     #f59e0b 65% 80%, 
                     #06b6d4 80% 100%
                   )`
                 }}>
              <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center ${
                isDarkMode ? 'bg-[#0f172a]' : 'bg-white'
              }`}>
                <BedDouble className="w-5 h-5 text-emerald-500 mb-1" />
                <span className="text-xs font-bold text-slate-400">Total</span>
                <span className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>100%</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-2.5 w-full sm:w-auto">
              {roomTypes.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 text-xs font-medium">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{item.type}</span>
                  </div>
                  <span className={`font-bold font-mono ${item.textColor}`}>{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Reports;