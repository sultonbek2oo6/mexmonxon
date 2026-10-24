import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, Trash2, X } from 'lucide-react';

const Employees = () => {
  const { isDarkMode } = useOutletContext();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    role: 'Receptionist',
    phone: ''
  });

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Xodimlarni yuklashda xatolik:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        fetchEmployees();
        setIsAddModalOpen(false);
        setForm({ first_name: '', last_name: '', role: 'Receptionist', phone: '' });
      }
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham bu xodimni o'chirmoqchimisiz?")) return;
    try {
      await fetch(`http://localhost:5001/api/employees/${id}`, { method: 'DELETE' });
      setEmployees(employees.filter((emp) => emp.ID !== id));
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    (emp.FIRST_NAME && emp.FIRST_NAME.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (emp.ROLE && emp.ROLE.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Employees</h1>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
            Manage hotel staff members and roles.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border w-full md:w-80 ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className={`border-b text-xs uppercase tracking-wider ${
              isDarkMode ? 'border-slate-800 bg-slate-900/50 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}>
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Position</th>
              <th className="py-4 px-6">Phone</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.ID} className={`transition ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className={`py-4 px-6 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{emp.FIRST_NAME} {emp.LAST_NAME}</td>
                  <td className={`py-4 px-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{emp.ROLE}</td>
                  <td className={`py-4 px-6 font-mono text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{emp.PHONE}</td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleDelete(emp.ID)} 
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className={`py-8 text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No employees found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transition ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`flex justify-between pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="text-lg font-bold">Add New Employee</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:opacity-75"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 py-4 text-sm">
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
              <select 
                value={form.role} 
                onChange={(e) => setForm({...form, role: e.target.value})} 
                className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="Manager">Manager</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Housekeeper">Housekeeper</option>
                <option value="Security">Security</option>
              </select>
              <input 
                type="text" 
                placeholder="Phone" 
                required 
                value={form.phone} 
                onChange={(e) => setForm({...form, phone: e.target.value})} 
                className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`} 
              />
              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition">
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;