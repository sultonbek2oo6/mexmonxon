import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, X, Users, Maximize2 } from 'lucide-react';
import { api } from '../../lib/api';

const RoomTypes = () => {
  const { isDarkMode } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);

  // Rasmda ko'rsatilgan Xona turlari ma'lumotlari
  const [roomTypes, setRoomTypes] = useState([]);
  const loadTypes = async () => {
    try {
      const data = await api('/admin/room-types');
      setRoomTypes(data.map((t) => ({ id: t.ID, name: t.TYPE_NAME, price: `${Number(t.BASE_PRICE).toLocaleString()} UZS`, capacity: t.CAPACITY, size: t.DESCRIPTION || '', description: t.DESCRIPTION || '', image_url: t.IMAGE_URL || '', rawPrice: t.BASE_PRICE })));
    } catch (error) { console.error('Room types loading failed:', error); }
  };
  useEffect(() => { loadTypes(); }, []);

  // Form holati
  const [form, setForm] = useState({
    name: '',
    price: '$100',
    capacity: 2,
    size: '30 m²',
  });

  // Qidiruv bo'yicha saralash
  const filteredTypes = roomTypes.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // O'chirish
  const handleDelete = async (id) => {
    try { await api(`/admin/room-types/${id}`, { method: 'DELETE' }); await loadTypes(); }
    catch (error) { window.alert(error.message); }
  };

  // Saqlash yoki Yangilash
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { type_name: form.name, base_price: Number(String(form.price).replace(/[^\d.]/g, '')), capacity: Number(form.capacity), description: form.description || form.size };
      await api(`/admin/room-types${editingType ? `/${editingType.id}` : ''}`, { method: editingType ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      await loadTypes(); setEditingType(null);
    } catch (error) { window.alert(error.message); return; }
    setIsAddModalOpen(false);
    setForm({ name: '', price: '$100', capacity: 2, size: '30 m²' });
  };

  const handleEditClick = (item) => {
    setEditingType(item);
    setForm({ ...item, price: String(item.rawPrice), description: item.description || '' });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-serif font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Room Types
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage room categories, pricing, and guest capacity.</p>
        </div>
      </div>

      {/* Control Bar: Search & Add Room Type */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        
        {/* Search Bar */}
        <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border w-full md:w-80 ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text"
            placeholder="Search room type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm focus:outline-none w-full"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => {
            setEditingType(null);
            setForm({ name: '', price: '$100', capacity: 2, size: '30 m²' });
            setIsAddModalOpen(true);
          }}
          className="w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room Type</span>
        </button>
      </div>

      {/* Room Types Table / Mobile Cards */}
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
                <th className="py-4 px-6">Type Name</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Capacity</th>
                <th className="py-4 px-6">Description / Size</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredTypes.length > 0 ? (
                filteredTypes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/20 transition duration-150">
                    <td className={`py-4 px-6 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</td>
                    <td className="py-4 px-6 text-emerald-500 font-semibold">{item.price}</td>
                    <td className="py-4 px-6 text-slate-400 font-medium">{item.capacity} guests</td>
                    <td className="py-4 px-6 text-slate-400">{item.size}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/40 transition"
                          title="Edit Type"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                          title="Delete Type"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No room types found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden divide-y divide-slate-800/40">
          {filteredTypes.map((item) => (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                <span className="text-emerald-500 font-extrabold text-base">{item.price}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.capacity} guests</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.size}</span>
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/40">
                <button
                  onClick={() => handleEditClick(item)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
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

      {/* ADD / EDIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold">
                {editingType ? 'Edit Room Type' : 'Add New Room Type'}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 py-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Type Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Suite"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Price per night</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $150"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description / Size</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 40 m²"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
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
                  {editingType ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoomTypes;
