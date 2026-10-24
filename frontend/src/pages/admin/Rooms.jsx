import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Eye, X, Filter } from 'lucide-react';
import { api } from '../../lib/api';

const Rooms = () => {
  const { isDarkMode } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Rasmda ko'rsatilgan xonalar ma'lumotlari
  const [rooms, setRooms] = useState([]);
  const [types, setTypes] = useState([]);
  const loadRooms = async () => {
    try {
      const [data, typeRows] = await Promise.all([api('/rooms'), api('/admin/room-types')]);
      setTypes(typeRows);
      setRooms(data.map((r) => ({ id: r.ID, roomNo: r.ROOM_NUMBER, type: r.TYPE_NAME, typeId: r.TYPE_ID, floor: r.FLOOR, price: `${Number(r.BASE_PRICE).toLocaleString()} UZS`, status: ({ available: 'Free', free: 'Free', occupied: 'Occupied', booked: 'Occupied', cleaning: 'Cleaning' })[String(r.STATUS).toLowerCase()] || r.STATUS })));
    } catch (error) { console.error('Rooms loading failed:', error); }
  };
  useEffect(() => { loadRooms(); }, []);

  // Form holati
  const [roomForm, setRoomForm] = useState({
    roomNo: '',
    type: 'Standard',
    floor: 1,
    price: '$80',
    status: 'Free'
  });

  // Status ranglari va uslublari
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Free':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'Occupied':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'Cleaning':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  // Qidiruv va Filtr
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.roomNo.includes(searchTerm) || room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || room.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Xona o'chirish
  const handleDelete = async (id) => {
    try { await api(`/rooms/${id}`, { method: 'DELETE' }); await loadRooms(); }
    catch (error) { window.alert(error.message); }
  };

  // Yangi xona qo'shish yoki tahrirlash
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const typeId = roomForm.typeId || types.find((t) => t.TYPE_NAME === roomForm.type)?.ID || types[0]?.ID;
      await api(`/rooms${editingRoom ? `/${editingRoom.id}` : ''}`, { method: editingRoom ? 'PUT' : 'POST', body: JSON.stringify({ room_number: roomForm.roomNo, type_id: Number(typeId), floor: Number(roomForm.floor), status: ({ Free: 'available', Occupied: 'occupied', Cleaning: 'cleaning' })[roomForm.status] || roomForm.status }) });
      await loadRooms(); setEditingRoom(null);
    } catch (error) { window.alert(error.message); return; }
    setIsAddModalOpen(false);
    setRoomForm({ roomNo: '', type: 'Standard', floor: 1, price: '$80', status: 'Free' });
  };

  const handleEditClick = (room) => {
    setEditingRoom(room);
    setRoomForm({ ...room, typeId: room.typeId, status: ({ available: 'Free', occupied: 'Occupied', cleaning: 'Cleaning' })[String(room.status).toLowerCase()] || room.status });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-serif font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Rooms
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage hotel rooms, pricing, and availability.</p>
        </div>
      </div>

      {/* Control Bar: Search, Filter & Add Button */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border w-full sm:w-72 ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text"
              placeholder="Search by Room No or Type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm focus:outline-none w-full"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border w-full sm:w-auto ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer pr-2"
            >
              <option value="All" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>All Status</option>
              <option value="Free" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>Free</option>
              <option value="Occupied" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>Occupied</option>
              <option value="Cleaning" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>Cleaning</option>
            </select>
          </div>
        </div>

        {/* Add Room Button */}
        <button
          onClick={() => {
            setEditingRoom(null);
            setRoomForm({ roomNo: '', type: 'Standard', floor: 1, price: '$80', status: 'Free' });
            setIsAddModalOpen(true);
          }}
          className="w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* Rooms Table / Cards Container */}
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
                <th className="py-4 px-6">Room No</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Floor</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-800/20 transition duration-150">
                    <td className={`py-4 px-6 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{room.roomNo}</td>
                    <td className="py-4 px-6 text-slate-400 font-medium">{room.type}</td>
                    <td className="py-4 px-6 text-slate-400">{room.floor}</td>
                    <td className="py-4 px-6 text-emerald-500 font-semibold">{room.price}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(room.status)}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(room)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/40 transition"
                          title="Edit Room"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                          title="Delete Room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No rooms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden divide-y divide-slate-800/40">
          {filteredRooms.map((room) => (
            <div key={room.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Room #{room.roomNo}</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getStatusBadge(room.status)}`}>
                  {room.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                <p>Type: <span className="font-semibold text-slate-200">{room.type}</span></p>
                <p>Floor: <span className="font-semibold text-slate-200">{room.floor}</span></p>
                <p>Price: <span className="font-bold text-emerald-500">{room.price}</span></p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/40">
                <button
                  onClick={() => handleEditClick(room)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
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

      {/* ADD / EDIT ROOM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Room No</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101"
                    value={roomForm.roomNo}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNo: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Floor</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Type</label>
                  <select
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {types.map((type) => <option key={type.ID} value={type.TYPE_NAME}>{type.TYPE_NAME}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Price per night</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $120"
                    value={roomForm.price}
                    onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                <select
                  value={roomForm.status}
                  onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Free">Free</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
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
                  {editingRoom ? 'Update Room' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Rooms;
