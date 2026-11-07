import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { api } from '../lib/api';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const [userRole, setUserRole] = useState(token ? '' : (localStorage.getItem('role') || '').toLowerCase());

  useEffect(() => {
    if (!token) return;
    let active = true;
    api('/profile')
      .then(({ user }) => {
        if (!active) return;
        const role = String(user?.role || 'guest').toLowerCase();
        localStorage.setItem('role', role);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('permissions', JSON.stringify(user?.permissions || []));
        setUserRole(role);
      })
      .catch(() => {
        if (active) setUserRole((localStorage.getItem('role') || '').toLowerCase());
      });
    return () => { active = false; };
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!userRole) return <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-300">Hisob tekshirilmoqda…</div>;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (['admin', 'manager'].includes(userRole)) return <Navigate to="/admin/dashboard" replace />;
    if (['guest', 'user'].includes(userRole)) return <Navigate to="/client/home" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
