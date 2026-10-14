import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, X, Phone, UserCheck, Briefcase } from 'lucide-react';

const Employees = () => {
  const { isDarkMode } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Rasmda ko'rsatilgan xodimlar ma'lumotlari
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Ali Valiyev', position: 'Receptionist', phone: '+998 90 123 45 67', status: 'Active' },
    { id: 2, name: 'Madina Karimova', position: 'Housekeeper', phone: '+998 91 234 56 78', status: 'Active' },
    { id: 3, name: 'Jasur Turgunov', position: 'Manager', phone: '+998 90 345 67 89', status: 'Active' },
    { id: 4, name: 'Diyorbek Rahimov', position: 'Security', phone: '+998 90 456 78 90', status: 'Active' },
  ]);

  // Form holati
  const [form, setForm] = useState({
    name: '',
    position: 'Receptionist',
    phone: '',
    status: 'Active'
  });

  // Status uslublari
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'Inactive':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'On Leave':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  // Qidiruv bo'yicha filterlash
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.phone.includes(searchTerm)
  );

  // Xodimni o'chirish
  const handleDelete = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  // Saqlash yoki Yangilash
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEmployee) {
      setEmployees(
        employees.map((emp) => (emp.id === editingEmployee.id ? { ...form, id: editingEmployee.id } : emp))
      );
      setEditingEmployee(null);
    } else {
      setEmployees([...employees, { ...form, id: Date.now() }]);
    }
    setIsAddModalOpen(false);
    setForm({ name: '', position: 'Receptionist', phone: '', status: 'Active' });
  };

  const handleEditClick = (emp) => {
    setEditingEmployee(emp);
    setForm(emp);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-serif font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Employees
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage staff members, roles, contact info, and status.</p>
        </div>
      </div>

      {/* Control Bar: Search & Add Employee Button */}
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
            placeholder="Search by Name, Position or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm focus:outline-none w-full"
          />
        </div>

        {/* Add Employee Button */}
        <button
          onClick={() => {
            setEditingEmployee(null);
            setForm({ name: '', position: 'Receptionist', phone: '', status: 'Active' });
            setIsAddModalOpen(true);
          }}
          className="w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Table Container */}
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
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Position</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/20 transition duration-150">
                    <td className={`py-4 px-6 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{emp.name}</td>
                    <td className="py-4 px-6 text-slate-400 font-medium">{emp.position}</td>
                    <td className="py-4 px-6 text-slate-300 font-mono text-xs">{emp.phone}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/40 transition"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                          title="Delete Employee"
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
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden divide-y divide-slate-800/40">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{emp.name}</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getStatusBadge(emp.status)}`}>
                  {emp.status}
                </span>
              </div>

              <div className="flex flex-col space-y-1 text-xs text-slate-400 pt-1">
                <p className="flex items-center space-x-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span>Position: <strong className="text-slate-200">{emp.position}</strong></span>
                </p>
                <p className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Phone: <strong className="text-slate-200 font-mono">{emp.phone}</strong></span>
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/40">
                <button
                  onClick={() => handleEditClick(emp)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(emp.id)}
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

      {/* ADD / EDIT EMPLOYEE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
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
                  placeholder="e.g. Jasur Turgunov"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Position</label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Manager">Manager</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Housekeeper">Housekeeper</option>
                  <option value="Security">Security</option>
                  <option value="Chef">Chef</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+998 90 123 45 67"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
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
                  <option value="On Leave">On Leave</option>
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
                  {editingEmployee ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Employees;