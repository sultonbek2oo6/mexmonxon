import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import ClientLayout from '../layouts/ClientLayout';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import Dashboard from '../pages/admin/Dashboard';
import Bookings from '../pages/admin/Bookings';
import Rooms from '../pages/admin/Rooms';
import RoomTypes from '../pages/admin/RoomTypes';
import Housekeeping from '../pages/admin/Housekeeping';
import Employees from '../pages/admin/Employees';
import Users from '../pages/admin/Users';
import Payments from '../pages/admin/Payments';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';

import Home from '../pages/client/Home';
import ClientRooms from '../pages/client/Rooms';
import Services from '../pages/client/Services';
import MyBookings from '../pages/client/MyBookings';

import ProtectedRoute from './ProtectedRoute';

// 1. AppRouter qismiga isDarkMode va toggleDarkMode props'larini qabul qilamiz
const AppRouter = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <Routes>
      {/* Ochiq marshrutlar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin marshrutlari */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="room-types" element={<RoomTypes />} />
          <Route path="housekeeping" element={<Housekeeping />} />
          <Route path="services" element={<Housekeeping />} />
          <Route path="service-orders" element={<Housekeeping />} />
          <Route path="employees" element={<Employees />} />
          <Route path="users" element={<Users />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Foydalanuvchi marshrutlari */}
      <Route element={<ProtectedRoute allowedRoles={['guest', 'user']} />}>
        {/* 2. ClientLayout'ga isDarkMode va toggleDarkMode props'larini uzatamiz */}
        <Route path="/client" element={<ClientLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route index element={<Navigate to="/client/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="rooms" element={<ClientRooms />} />
          <Route path="services" element={<Services />} />
          <Route path="my-bookings" element={<MyBookings />} />
        </Route>
      </Route>

      {/* Boshlang'ich sahifani Login'ga yo'naltirish */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<div className="p-8 text-center text-xl text-white">404 - Sahifa topilmadi</div>} />
    </Routes>
  );
};

export default AppRouter;
