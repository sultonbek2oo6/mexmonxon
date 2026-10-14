import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, MoreVertical, Edit2, Trash2, X, Mail, ShieldCheck, User } from 'lucide-react';

const Users = () => {
  const { isDarkMode } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Rasmda ko'rsatilgan foydalanuvchilar ma'lumotlari
  const [users, setUsers] = useState([
    { id: 1, name: 'Sultonbek Juraboyev', email: 'sultonbek6@icloud.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Dilshod Karimov', email: 'dilshod@mail.uz', role: 'User', status: 'Active' },
    { id: 3, name: 'Aziza Tursunova', email: 'aziza@mail.uz', role: 'User', status: 'Active' },
    { id: 4, name: 'Bekzod Nazarov', email: 'bekzod@mail.uz', role: 'User', status: 'Active' },
  ]);

  // Form holati
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'User',
    status: 'Active'
  });

  // Status badjlari
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'Inactive':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  // Role badjlari
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return isDarkMode 
          ? 'bg-slate-800 text-slate-200 border-slate-700 font-bold' 
          : 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
      default:
        return isDarkMode 
          ? 'bg-slate-900/60 text-slate-400 border-slate-800' 
          : 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Qidiruv bo'yicha filterlash
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // O'chirish
  const handleDelete = (id) => {
    setUsers(users.filter((u) => u.id !== id));
    setOpenDropdownId(null);
  };

  // Saqlash yoki Yangilash
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...form, id: editingUser.id } : u))
      );
      setEditingUser(null);
    } else {
      setUsers([...users, { ...form, id: Date.now() }]);
    }
    setIsAddModalOpen(false);
    setForm({ name: '', email: '', role: 'User', status: 'Active' });
  };

  const handleEditClick = (u) => {
    setEditingUser(u);
    setForm(u);
    setIsAddModalOpen(true);
    setOpenDropdownId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-serif font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Users
          </h1>
          <p className="text-slate-400 text-sm mt-1">System user management, roles, and status controls.</p>
        </div>
      </div>

      {/* Control Bar: Search & Add User Button */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        
        {/* Search Input */}
        <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border w-full md:w-80 ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text"
            placeholder="Search by Name, Email or Role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm focus:outline-none w-full"
          />
        </div>

        {/* Add User Button */}
        <button
          onClick={() => {
            setEditingUser(null);
            setForm({ name: '', email: '', role: 'User', status: 'Active' });
            setIsAddModalOpen(true);
          }}
          className="w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Table Container */}
      <div className={`rounded-2xl border ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto overflow-y-visible">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={`border-b text-xs uppercase text-slate-400 tracking-wider ${
                isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'
              }`}>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/20 transition duration-150 relative">
                    <td className={`py-4 px-6 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{u.name}</td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-xs">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-lg text-xs border ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      {/* Uch nuqta menu / Action menu */}
                      <div className="inline-block text-left relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === u.id ? null : u.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Popup */}
                        {openDropdownId === u.id && (
                          <div className={`absolute right-0 mt-1 w-36 rounded-xl border shadow-xl z-20 py-1 ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                          }`}>
                            <button
                              onClick={() => handleEditClick(u)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-xs hover:bg-slate-800/40 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-xs hover:bg-rose-500/10 text-rose-500 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden divide-y divide-slate-800/40">
          {filteredUsers.map((u) => (
            <div key={u.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{u.name}</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getStatusBadge(u.status)}`}>
                  {u.status}
                </span>
              </div>

              <div className="flex flex-col space-y-1 text-xs text-slate-400 pt-1">
                <p className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-slate-300">{u.email}</span>
                </p>
                <p className="flex items-center space-x-2 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Role: </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] border ${getRoleBadge(u.role)}`}>{u.role}</span>
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/40">
                <button
                  onClick={() => handleEditClick(u)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
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

      {/* ADD / EDIT USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold">
                {editingUser ? 'Edit User' : 'Add New User'}
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
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sultanbek Jolraboyev"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@mail.uz"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
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
                  {editingUser ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;