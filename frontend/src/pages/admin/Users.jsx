import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, MoreVertical, Edit2, Trash2, X, Mail, ShieldCheck } from 'lucide-react';

const Users = () => {
  const { isDarkMode } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    passport_number: '',
    role: 'user'
  });

  // Bazadan foydalanuvchilarni olish
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Foydalanuvchilarni yuklashda xatolik:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Role badjlari uchun ranglar
  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return isDarkMode 
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'receptionist':
        return isDarkMode 
          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
          : 'bg-blue-50 text-blue-700 border-blue-300';
      default:
        return isDarkMode 
          ? 'bg-slate-500/10 text-slate-400 border-slate-500/30' 
          : 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  // Saqlash yoki Yangilash (Submit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingUser 
        ? `http://localhost:5001/api/users/${editingUser.ID}` 
        : 'http://localhost:5001/api/users';
      
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        fetchUsers();
        setIsAddModalOpen(false);
        setEditingUser(null);
        setForm({ first_name: '', last_name: '', email: '', password: '', phone: '', passport_number: '', role: 'user' });
      }
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  // Tahrirlash tugmasi bosilganda
  const handleEditClick = (u) => {
    setEditingUser(u);
    setForm({
      first_name: u.FIRST_NAME || '',
      last_name: u.LAST_NAME || '',
      email: u.EMAIL || '',
      password: '',
      phone: u.PHONE || '',
      passport_number: u.PASSPORT_NUMBER || '',
      role: u.ROLE || 'user'
    });
    setIsAddModalOpen(true);
    setOpenDropdownId(null);
  };

  // O'chirish
  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham bu foydalanuvchini o'chirmoqchimisiz?")) return;
    try {
      await fetch(`http://localhost:5001/api/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter((u) => u.ID !== id));
      setOpenDropdownId(null);
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.FIRST_NAME && u.FIRST_NAME.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.EMAIL && u.EMAIL.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.ROLE && u.ROLE.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Users</h1>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
            System user management and controls.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setForm({ first_name: '', last_name: '', email: '', password: '', phone: '', passport_number: '', role: 'user' });
            setIsAddModalOpen(true);
          }}
          className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border w-full md:w-80 ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className={`border-b text-xs uppercase tracking-wider ${
              isDarkMode ? 'border-slate-800 bg-slate-900/50 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}>
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6">Phone</th>
              <th className="py-4 px-6">Role</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u.ID} className={`transition ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className={`py-4 px-6 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{u.FIRST_NAME} {u.LAST_NAME}</td>
                  <td className={`py-4 px-6 font-mono text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{u.EMAIL}</td>
                  <td className={`py-4 px-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{u.PHONE || 'N/A'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs border font-medium ${getRoleBadge(u.ROLE)}`}>
                      {u.ROLE}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right relative">
                    <div className="inline-block text-left relative">
                      <button
                        onClick={() => setOpenDropdownId(openDropdownId === u.ID ? null : u.ID)}
                        className={`p-1.5 rounded-lg transition ${
                          isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openDropdownId === u.ID && (
                        <div className={`absolute right-0 mt-1 w-36 rounded-xl border shadow-xl z-20 py-1 ${
                          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                        }`}>
                          <button
                            onClick={() => handleEditClick(u)}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-xs transition ${
                              isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                            }`}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(u.ID)}
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
              <tr><td colSpan="5" className={`py-8 text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transition ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`flex justify-between pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="text-lg font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:opacity-75"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  required 
                  value={form.first_name} 
                  onChange={(e) => setForm({...form, first_name: e.target.value})} 
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`} 
                />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  value={form.last_name} 
                  onChange={(e) => setForm({...form, last_name: e.target.value})} 
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`} 
                />
              </div>
              <input 
                type="email" 
                placeholder="Email" 
                required 
                value={form.email} 
                onChange={(e) => setForm({...form, email: e.target.value})} 
                className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`} 
              />
              
              {!editingUser && (
                <input 
                  type="password" 
                  placeholder="Password" 
                  required 
                  value={form.password} 
                  onChange={(e) => setForm({...form, password: e.target.value})} 
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`} 
                />
              )}

              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="Phone" 
                  value={form.phone} 
                  onChange={(e) => setForm({...form, phone: e.target.value})} 
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`} 
                />
                <input 
                  type="text" 
                  placeholder="Passport" 
                  value={form.passport_number} 
                  onChange={(e) => setForm({...form, passport_number: e.target.value})} 
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`} 
                />
              </div>

              <select 
                value={form.role} 
                onChange={(e) => setForm({...form, role: e.target.value})} 
                className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="receptionist">Receptionist</option>
                <option value="guest">Guest</option>
              </select>

              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition">
                {editingUser ? 'Update' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;