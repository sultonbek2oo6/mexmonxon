import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, Trash2, Eye, Calendar, User, CheckCircle, Clock, XCircle, X, Filter } from 'lucide-react';

const Bookings = () => {
  const { isDarkMode } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Initial Bookings Data (4-rasmdagi ma'lumotlar bilan)
  const [bookings, setBookings] = useState([
    {
      id: 'BK001',
      guestName: 'Ali Karimov',
      room: '101',
      checkIn: 'Apr 28, 2025',
      checkOut: 'Apr 28, 2025',
      status: 'Confirmed',
      price: '$120',
      guestsCount: '2 Adults'
    },
    {
      id: 'BK002',
      guestName: 'John Smith',
      room: '202',
      checkIn: 'Apr 26, 2025',
      checkOut: 'Apr 30, 2025',
      status: 'Checked-in',
      price: '$320',
      guestsCount: '1 Adult'
    },
    {
      id: 'BK003',
      guestName: 'Aziza Aliyeva',
      room: '305',
      checkIn: 'Apr 27, 2025',
      checkOut: 'Apr 29, 2025',
      status: 'Pending',
      price: '$180',
      guestsCount: '2 Adults, 1 Child'
    },
    {
      id: 'BK004',
      guestName: 'Michael Brown',
      room: '404',
      checkIn: 'Apr 28, 2025',
      checkOut: 'May 1, 2025',
      status: 'Confirmed',
      price: '$250',
      guestsCount: '2 Adults'
    },
    {
      id: 'BK005',
      guestName: 'Emily Davis',
      room: '102',
      checkIn: 'Apr 29, 2025',
      checkOut: 'May 2, 2025',
      status: 'Pending',
      price: '$160',
      guestsCount: '1 Adult'
    }
  ]);

  // Yangi bron formasi uchun state
  const [newBooking, setNewBooking] = useState({
    guestName: '',
    room: '101',
    checkIn: '',
    checkOut: '',
    status: 'Confirmed',
    price: '$120'
  });

  // O'chirish funksiyasi
  const handleDelete = (id) => {
    setBookings(bookings.filter(item => item.id !== id));
  };

  // Yangi bron qo'shish
  const handleAddBooking = (e) => {
    e.preventDefault();
    if (!newBooking.guestName || !newBooking.checkIn || !newBooking.checkOut) return;

    const newId = `BK00${bookings.length + 1}`;
    setBookings([{ ...newBooking, id: newId }, ...bookings]);
    setIsAddModalOpen(false);
    setNewBooking({
      guestName: '',
      room: '101',
      checkIn: '',
      checkOut: '',
      status: 'Confirmed',
      price: '$120'
    });
  };

  // Filtr va Qidiruv
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.room.includes(searchTerm);
    const matchesStatus = selectedStatus === 'All Status' || b.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Status badgelari stili
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'Checked-in':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-serif font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Bookings
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track all hotel reservations.</p>
        </div>
      </div>

      {/* Top Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border w-full sm:w-80 ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text"
              placeholder="Search by ID, Guest, Room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm focus:outline-none w-full"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border w-full sm:w-auto ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer pr-2"
            >
              <option value="All Status" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>All Status</option>
              <option value="Confirmed" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>Confirmed</option>
              <option value="Checked-in" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>Checked-in</option>
              <option value="Pending" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>Pending</option>
            </select>
          </div>
        </div>

        {/* New Booking Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Bookings Table / Cards */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={`border-b text-xs uppercase text-slate-400 tracking-wider ${
                isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'
              }`}>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Guest Name</th>
                <th className="py-4 px-6">Room</th>
                <th className="py-4 px-6">Check-in</th>
                <th className="py-4 px-6">Check-out</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/20 transition duration-150">
                    <td className="py-4 px-6 font-semibold text-emerald-500">{item.id}</td>
                    <td className={`py-4 px-6 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.guestName}</td>
                    <td className="py-4 px-6 text-slate-400 font-mono">{item.room}</td>
                    <td className="py-4 px-6 text-slate-400">{item.checkIn}</td>
                    <td className="py-4 px-6 text-slate-400">{item.checkOut}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedBooking(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/40 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No bookings found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="block md:hidden divide-y divide-slate-800/40">
          {filteredBookings.map((item) => (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-500 text-sm">{item.id}</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div>
                <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.guestName}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Room #{item.room}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-b border-slate-800/40 py-2">
                <div>
                  <p className="text-[10px] uppercase text-slate-500">Check-in</p>
                  <p className="font-medium">{item.checkIn}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-slate-500">Check-out</p>
                  <p className="font-medium">{item.checkOut}</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={() => setSelectedBooking(item)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold">Booking Details</h3>
                <p className="text-xs text-emerald-500 font-mono mt-0.5">{selectedBooking.id}</p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Guest Name:</span>
                <span className="font-semibold">{selectedBooking.guestName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Room Assigned:</span>
                <span className="font-semibold font-mono">Room #{selectedBooking.room}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Check-in Date:</span>
                <span className="font-semibold">{selectedBooking.checkIn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Check-out Date:</span>
                <span className="font-semibold">{selectedBooking.checkOut}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getStatusBadge(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Total Price:</span>
                <span className="font-bold text-emerald-500 text-base">{selectedBooking.price}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* NEW BOOKING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold">Add New Booking</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBooking} className="space-y-4 py-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Guest Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newBooking.guestName}
                  onChange={(e) => setNewBooking({ ...newBooking, guestName: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Room Number</label>
                  <select
                    value={newBooking.room}
                    onChange={(e) => setNewBooking({ ...newBooking, room: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="101">101 (Standard)</option>
                    <option value="102">102 (Standard)</option>
                    <option value="202">202 (Deluxe)</option>
                    <option value="305">305 (Family)</option>
                    <option value="404">404 (Suite)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                  <select
                    value={newBooking.status}
                    onChange={(e) => setNewBooking({ ...newBooking, status: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked-in">Checked-in</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={newBooking.checkIn}
                    onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Check-out Date</label>
                  <input
                    type="date"
                    required
                    value={newBooking.checkOut}
                    onChange={(e) => setNewBooking({ ...newBooking, checkOut: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Bookings;