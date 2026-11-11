import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, MoreVertical, Edit2, Trash2, X, Mail, ShieldCheck, BriefcaseBusiness } from 'lucide-react';
import { api } from '../../lib/api';

const Users = () => {
  const { isDarkMode, role: currentRole } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const isManager = String(currentRole || localStorage.getItem('role') || '').toLowerCase() === 'manager';
  const [permissionTarget, setPermissionTarget] = useState(null);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [formError, setFormError] = useState('');
  const [hireTarget, setHireTarget] = useState(null);
  const [hireRooms, setHireRooms] = useState([]);
  const [hirePosition, setHirePosition] = useState('Housekeeper');
  const [hireRoomIds, setHireRoomIds] = useState([]);

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
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await api('/users');
      setUsers(data);
    } catch (err) {
      setUsersError(err.message || 'Foydalanuvchilarni yuklab bo‘lmadi.');
    } finally { setUsersLoading(false); }
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
    setFormError('');
    try {
      const method = editingUser ? 'PUT' : 'POST';
      await api(`/users${editingUser ? `/${editingUser.ID}` : ''}`, { method, body: JSON.stringify(form) });
      {
        await fetchUsers();
        setIsAddModalOpen(false);
        setEditingUser(null);
        setForm({ first_name: '', last_name: '', email: '', password: '', phone: '', passport_number: '', role: 'user' });
      }
    } catch (err) {
      setFormError(err.message || 'Foydalanuvchini saqlab bo‘lmadi.');
    }
  };

  // Tahrirlash tugmasi bosilganda
  const handleEditClick = (u) => {
    setFormError('');
    setEditingUser(u);
    setForm({
      first_name: u.FIRST_NAME || '',
      last_name: u.LAST_NAME || '',
      email: u.EMAIL || '',
      password: '',
      phone: u.PHONE || '',
      passport_number: u.PASSPORT_NUMBER || '',
      role: String(u.ROLE || 'user').toLowerCase()
    });
    setIsAddModalOpen(true);
    setOpenDropdownId(null);
  };

  // O'chirish
  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham bu foydalanuvchini o'chirmoqchimisiz?")) return;
    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      setUsers((current) => current.filter((u) => u.ID !== id));
      setOpenDropdownId(null);
    } catch (err) {
      window.alert(err.message);
    }
  };

  const editPermissions = async (user) => {
    try {
      const data = await api(`/users/${user.ID}/permissions`);
      setPermissionTarget(user); setAvailablePermissions(data.available); setSelectedPermissions(data.permissions);
    } catch (error) { window.alert(error.message); }
  };
  const savePermissions = async () => {
    try {
      await api(`/users/${permissionTarget.ID}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions: selectedPermissions }) });
      setPermissionTarget(null);
    } catch (error) { window.alert(error.message); }
  };
  const openHireModal = async (user) => {
    try {
      setHireRooms(await api('/rooms'));
      setHireTarget(user);
      setHirePosition('Housekeeper');
      setHireRoomIds([]);
      setOpenDropdownId(null);
    } catch (error) { window.alert(error.message); }
  };
  const hireUser = async (event) => {
    event.preventDefault();
    try {
      await api(`/users/${hireTarget.ID}/hire`, { method: 'POST', body: JSON.stringify({ position: hirePosition, roomIds: hireRoomIds }) });
      setHireTarget(null);
      await fetchUsers();
    } catch (error) { window.alert(error.message); }
  };

  const filteredUsers = users.filter((u) =>
    `${u.FIRST_NAME || ''} ${u.LAST_NAME || ''} ${u.EMAIL || ''} ${u.PHONE || ''} ${u.ROLE || ''}`.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{isManager ? 'Foydalanuvchilar va adminlar' : 'Foydalanuvchilar'}</h1>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
            {isManager ? 'Bu yerda foydalanuvchi akkauntlari va admin huquqlari boshqariladi. Xodimlarni alohida Employees bo‘limidan ko‘ring.' : 'Mehmon akkauntlarini boshqarish.'}
          </p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setEditingUser(null);
            setForm({ first_name: '', last_name: '', email: '', password: '', phone: '', passport_number: '', role: 'user' });
            setIsAddModalOpen(true);
          }}
          className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isManager ? 'Hisob yaratish' : 'Mehmon qo‘shish'}</span>
        </button>
      </div>

      {usersError && <div role="alert" className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">{usersError}<button onClick={fetchUsers} className="underline">Qayta urinish</button></div>}

      {isManager && <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Jami hisoblar', value: users.length, tone: 'text-slate-300' },
          { label: 'Adminlar', value: users.filter((user) => String(user.ROLE).toLowerCase() === 'admin').length, tone: 'text-emerald-400' },
          { label: 'Mehmonlar', value: users.filter((user) => ['guest', 'user'].includes(String(user.ROLE).toLowerCase())).length, tone: 'text-sky-400' },
        ].map((stat) => <div key={stat.label} className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}><div className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</div><div className={`text-2xl font-bold mt-1 ${stat.tone}`}>{stat.value}</div></div>)}
      </div>}

      {/* Control Bar */}
      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border w-full md:w-80 ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Ism, email yoki rol bo‘yicha qidirish..."
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
              <th className="py-4 px-6">Ism</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6">Telefon</th>
              <th className="py-4 px-6">Rol</th>
              <th className="py-4 px-6 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
            {usersLoading ? <tr><td colSpan="5" className="py-8 text-center text-slate-400">Yuklanmoqda…</td></tr> : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u.ID} className={`transition ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className={`py-4 px-6 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{u.FIRST_NAME} {u.LAST_NAME}</td>
                  <td className={`py-4 px-6 font-mono text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{u.EMAIL}</td>
                  <td className={`py-4 px-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{u.PHONE || 'N/A'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs border font-medium ${getRoleBadge(u.ROLE)}`}>
                      {roleLabels[String(u.ROLE).toLowerCase()] || u.ROLE}
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
                        <div className={`absolute right-0 mt-1 w-52 rounded-xl border shadow-xl z-20 py-1 ${
                          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                        }`}>
                          {isManager && String(u.ROLE).toLowerCase() === 'admin' && <button onClick={() => editPermissions(u)} className={`w-full flex items-center space-x-2 px-3 py-2 text-xs ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}><ShieldCheck className="w-3.5 h-3.5 text-amber-500" /><span>Ruxsatlarni sozlash</span></button>}
                          {isManager && ['guest', 'user'].includes(String(u.ROLE).toLowerCase()) && <button onClick={() => openHireModal(u)} className={`w-full flex items-center space-x-2 px-3 py-2 text-xs ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}><BriefcaseBusiness className="w-3.5 h-3.5 text-sky-400" /><span>Xodim sifatida ishga olish</span></button>}
                          {((isManager && String(u.ROLE).toLowerCase() !== 'manager') || ['guest', 'user'].includes(String(u.ROLE).toLowerCase())) && <button
                            onClick={() => handleEditClick(u)}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-xs transition ${
                              isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                            }`}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Edit</span>
                          </button>}
                          {((isManager && String(u.ROLE).toLowerCase() !== 'manager') || ['guest', 'user'].includes(String(u.ROLE).toLowerCase())) && <button
                            onClick={() => handleDelete(u.ID)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-xs hover:bg-rose-500/10 text-rose-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>}
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
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transition ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`flex justify-between pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="text-lg font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:opacity-75"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
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

              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
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
                <option value="user">Foydalanuvchi</option>
                {isManager && <option value="admin">Admin</option>}
                <option value="guest">Mehmon</option>
              </select>

              {formError && <p className="text-sm text-rose-400" role="alert">{formError}</p>}

              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition">
                {editingUser ? 'Update' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
      {permissionTarget && <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4 bg-black/60 backdrop-blur-sm"><div className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl ${isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="flex items-center justify-between mb-2"><h3 className="text-lg font-bold">{permissionTarget.FIRST_NAME} — admin huquqlari</h3><button onClick={() => setPermissionTarget(null)}><X className="w-5 h-5" /></button></div>
        <p className="text-sm text-slate-400 mb-4">Kerakli bo‘limlarni tanlang. O‘zgarishlar darhol kuchga kiradi.</p>
        <div className="grid sm:grid-cols-2 gap-2">{availablePermissions.map((permission) => <label key={permission} className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${isDarkMode ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}><input type="checkbox" checked={selectedPermissions.includes(permission)} onChange={(event) => setSelectedPermissions((current) => event.target.checked ? [...current, permission] : current.filter((item) => item !== permission))} />{permissionLabels[permission] || permission}</label>)}</div>
        <button onClick={savePermissions} className="w-full mt-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl">Saqlash</button>
      </div></div>}
      {hireTarget && <div className="fixed inset-0 z-50 grid place-items-start sm:place-items-center overflow-y-auto p-4 backdrop-blur-sm bg-black/60"><form onSubmit={hireUser} className={`w-full max-w-xl rounded-2xl border p-4 sm:p-6 shadow-2xl ${isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="flex justify-between gap-3"><div><h2 className="text-xl font-bold">Xodim sifatida ishga olish</h2><p className="mt-1 text-sm text-slate-400">{hireTarget.FIRST_NAME} {hireTarget.LAST_NAME} · {hireTarget.EMAIL}</p></div><button type="button" onClick={() => setHireTarget(null)} aria-label="Yopish"><X /></button></div>
        <label className="mt-5 block text-sm font-medium">Lavozim<select value={hirePosition} onChange={(event) => setHirePosition(event.target.value)} className={`mt-2 w-full rounded-xl border px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}><option>Housekeeper</option><option>Receptionist</option><option>Security</option><option>Accountant</option><option>Maintenance</option></select></label>
        <div className="mt-4"><div className="text-sm font-medium">Mas’ul xonalar <span className="text-slate-400">(ixtiyoriy, bir nechta tanlash mumkin)</span></div><div className="mt-2 grid max-h-52 grid-cols-1 min-[420px]:grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">{hireRooms.map((room) => {
          const roomId = String(room.ID);
          return <label key={room.ID} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${isDarkMode ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}><input type="checkbox" checked={hireRoomIds.includes(roomId)} onChange={(event) => setHireRoomIds((current) => event.target.checked ? [...current, roomId] : current.filter((id) => id !== roomId))} />Xona {room.ROOM_NUMBER}</label>;
        })}</div></div>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setHireTarget(null)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Bekor qilish</button><button className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Ishga olish</button></div>
      </form></div>}
    </div>
  );
};

const permissionLabels = { dashboard: 'Bosh sahifa', bookings: 'Bronlar', rooms: 'Xonalar', roomTypes: 'Xona turlari', housekeeping: 'Tozalik', services: 'Xizmatlar', employees: 'Xodimlar', users: 'Mehmonlar', payments: 'To‘lovlar', reports: 'Hisobotlar', settings: 'Sozlamalar' };
const roleLabels = { manager: 'Menejer', admin: 'Admin', guest: 'Mehmon', user: 'Foydalanuvchi' };

export default Users;
