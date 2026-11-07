import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, DoorOpen, UserMinus, X, UserRound, BriefcaseBusiness } from 'lucide-react';
import { api } from '../../lib/api';

const Employees = () => {
  const { isDarkMode, role } = useOutletContext();
  const isManager = role === 'manager';
  const [employees, setEmployees] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [staff, roomRows] = await Promise.all([api('/employees'), api('/rooms')]);
      setEmployees(staff);
      setRooms(roomRows);
    } catch (loadError) { setError(loadError.message || 'Xodimlarni yuklab bo‘lmadi.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredEmployees = useMemo(() => employees.filter((employee) =>
    `${employee.FIRST_NAME || ''} ${employee.LAST_NAME || ''} ${employee.ROLE || ''} ${employee.EMAIL || ''}`.toLowerCase().includes(search.toLowerCase())
  ), [employees, search]);

  const openAssignments = (employee) => {
    setSelectedEmployee(employee);
    setSelectedRoomIds(String(employee.ASSIGNED_ROOM_IDS || '').split(',').filter(Boolean));
  };

  const saveAssignments = async () => {
    try {
      await api(`/employees/${selectedEmployee.ID}/rooms`, { method: 'PUT', body: JSON.stringify({ roomIds: selectedRoomIds }) });
      setSelectedEmployee(null);
      await load();
    } catch (saveError) { window.alert(saveError.message); }
  };

  const dismissEmployee = async (employee) => {
    if (!window.confirm(`${employee.FIRST_NAME} ${employee.LAST_NAME} xodimlar ro‘yxatidan chiqarilsinmi?`)) return;
    try { await api(`/employees/${employee.ID}`, { method: 'DELETE' }); await load(); }
    catch (dismissError) { window.alert(dismissError.message); }
  };

  const cardClass = `rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Xodimlar</h1>
        <p className="text-sm text-slate-400 mt-1">Ishga olingan xodimlar va ularga biriktirilgan xonalar.</p>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className={`${cardClass} p-4 flex items-center gap-3`}><UserRound className="text-emerald-400" /><div><div className="text-xs text-slate-400">Faol xodimlar</div><div className="text-2xl font-bold">{employees.length}</div></div></div>
        <div className={`${cardClass} p-4 flex items-center gap-3`}><DoorOpen className="text-sky-400" /><div><div className="text-xs text-slate-400">Biriktirilgan xona</div><div className="text-2xl font-bold">{employees.reduce((count, employee) => count + String(employee.ASSIGNED_ROOM_IDS || '').split(',').filter(Boolean).length, 0)}</div></div></div>
      </div>

      <div className={`${cardClass} p-4`}>
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border w-full md:w-96 ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ism, lavozim yoki email bo‘yicha qidirish" className="bg-transparent text-sm focus:outline-none w-full" />
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">{error}</div>}
      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className={`border-b text-xs uppercase tracking-wide ${isDarkMode ? 'border-slate-800 bg-slate-900/50 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
              <th className="p-4">Xodim</th><th className="p-4">Lavozim</th><th className="p-4">Aloqa</th><th className="p-4">Biriktirilgan xonalar</th>{isManager && <th className="p-4 text-right">Amallar</th>}
            </tr></thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
              {loading ? <tr><td colSpan={isManager ? 5 : 4} className="p-8 text-center text-slate-400">Yuklanmoqda…</td></tr>
                : filteredEmployees.length ? filteredEmployees.map((employee) => <tr key={employee.ID} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                  <td className="p-4 font-semibold">{employee.FIRST_NAME} {employee.LAST_NAME}</td>
                  <td className="p-4"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"><BriefcaseBusiness className="w-3.5 h-3.5" />{employee.ROLE}</span></td>
                  <td className="p-4 text-slate-400">{employee.EMAIL || employee.PHONE || '—'}</td>
                  <td className="p-4 text-slate-300">{employee.ASSIGNED_ROOMS || <span className="text-amber-400">Xona biriktirilmagan</span>}</td>
                  {isManager && <td className="p-4"><div className="flex justify-end gap-2">
                    <button onClick={() => openAssignments(employee)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs hover:border-emerald-500 hover:text-emerald-400"><DoorOpen className="w-4 h-4" />Xonalarni belgilash</button>
                    <button onClick={() => dismissEmployee(employee)} title="Ishdan bo‘shatish" className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"><UserMinus className="w-4 h-4" /></button>
                  </div></td>}
                </tr>)
                : <tr><td colSpan={isManager ? 5 : 4} className="p-8 text-center text-slate-400">Xodim topilmadi.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmployee && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"><div className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl ${isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="flex justify-between gap-3"><div><h2 className="text-xl font-bold">Xonalarni biriktirish</h2><p className="mt-1 text-sm text-slate-400">{selectedEmployee.FIRST_NAME} {selectedEmployee.LAST_NAME} · {selectedEmployee.ROLE}</p></div><button onClick={() => setSelectedEmployee(null)} aria-label="Yopish"><X /></button></div>
        <div className="mt-5 grid max-h-80 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">{rooms.map((room) => {
          const roomId = String(room.ID);
          return <label key={room.ID} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${isDarkMode ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}><input type="checkbox" checked={selectedRoomIds.includes(roomId)} onChange={(event) => setSelectedRoomIds((current) => event.target.checked ? [...current, roomId] : current.filter((id) => id !== roomId))} />Xona {room.ROOM_NUMBER}</label>;
        })}</div>
        <div className="mt-5 flex justify-end gap-2"><button onClick={() => setSelectedEmployee(null)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Bekor qilish</button><button onClick={saveAssignments} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Saqlash</button></div>
      </div></div>}
    </div>
  );
};

export default Employees;
