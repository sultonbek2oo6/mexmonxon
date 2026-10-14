import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Utensils, 
  Sparkles, 
  Dumbbell, 
  Car, 
  Shirt, 
  ConciergeBell, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  X,
  Plus,
  Filter,
  Search
} from 'lucide-react';

const Housekeeping = () => {
  const { isDarkMode } = useOutletContext();

  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'orders'
  const [selectedOrderService, setSelectedOrderService] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [note, setNote] = useState('');

  // Rasmda ko'rsatilgan Hotel Services (Mehmonxona Xizmatlari)
  const [services] = useState([
    {
      id: 1,
      name: 'Restaurant',
      subtitle: '24/7 food service',
      price: '$15',
      icon: Utensils,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    {
      id: 2,
      name: 'Spa & Wellness',
      subtitle: 'Relax and refresh',
      price: '$30',
      icon: Sparkles,
      color: 'bg-teal-500/10 text-teal-500 border-teal-500/20'
    },
    {
      id: 3,
      name: 'Fitness Center',
      subtitle: 'Modern equipment',
      price: '$20',
      icon: Dumbbell,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    {
      id: 4,
      name: 'Airport Transfer',
      subtitle: 'Comfortable transport',
      price: '$40',
      icon: Car,
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    },
    {
      id: 5,
      name: 'Laundry',
      subtitle: 'Fast & clean',
      price: '$10',
      icon: Shirt,
      color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    },
    {
      id: 6,
      name: 'Room Service',
      subtitle: 'In-room dining',
      price: '$15',
      icon: ConciergeBell,
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    }
  ]);

  // Buyurtmalar ro'yxati (Service Orders)
  const [serviceOrders, setServiceOrders] = useState([
    { id: 101, roomNo: '202', serviceName: 'Room Service', price: '$15', time: '10:30 AM', status: 'Pending' },
    { id: 102, roomNo: '101', serviceName: 'Laundry', price: '$10', time: '09:15 AM', status: 'Completed' },
    { id: 103, roomNo: '301', serviceName: 'Spa & Wellness', price: '$30', time: '11:00 AM', status: 'In Progress' },
  ]);

  const handleOpenOrderModal = (service) => {
    setSelectedOrderService(service);
    setIsOrderModalOpen(true);
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!roomNumber) return;

    const newOrder = {
      id: Date.now(),
      roomNo: roomNumber,
      serviceName: selectedOrderService.name,
      price: selectedOrderService.price,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    };

    setServiceOrders([newOrder, ...serviceOrders]);
    setIsOrderModalOpen(false);
    setRoomNumber('');
    setNote('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'Pending':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sarlavha (Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-serif font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Housekeeping
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage hotel services and customer service requests.</p>
        </div>
      </div>

      {/* Tab Navigatsiyasi (Services / Service Orders) */}
      <div className="flex border-b border-slate-700/50 space-x-6">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center space-x-2 pb-3 font-semibold text-sm border-b-2 transition duration-200 ${
            activeTab === 'services'
              ? 'border-emerald-500 text-emerald-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Services</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-2 pb-3 font-semibold text-sm border-b-2 transition duration-200 ${
            activeTab === 'orders'
              ? 'border-emerald-500 text-emerald-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Service Orders</span>
          {serviceOrders.length > 0 && (
            <span className="ml-1.5 px-2 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              {serviceOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* 1-TAB: SERVICES (Mehmonxona xizmatlari kartochkalari) */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            Hotel Services
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
                    isDarkMode 
                      ? 'bg-[#0f172a] border-slate-800/80 hover:border-slate-700' 
                      : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {/* Sarlavha & Tavsif */}
                    <div>
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Narx */}
                    <div className="pt-2">
                      <span className="text-xl font-extrabold text-emerald-500">
                        {item.price}
                      </span>
                      <span className="text-xs text-slate-400 ml-1 font-normal">+</span>
                    </div>
                  </div>

                  {/* Buyurtma Berish Tugmasi */}
                  <button
                    onClick={() => handleOpenOrderModal(item)}
                    className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition duration-200 text-sm flex items-center justify-center space-x-2"
                  >
                    <span>Order</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2-TAB: SERVICE ORDERS (Kelib tushgan buyurtmalar jadvali) */}
      {activeTab === 'orders' && (
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
                  <th className="py-4 px-6">Service Name</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Time</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {serviceOrders.length > 0 ? (
                  serviceOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/20 transition duration-150">
                      <td className={`py-4 px-6 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Room #{order.roomNo}
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-medium">{order.serviceName}</td>
                      <td className="py-4 px-6 text-emerald-500 font-bold">{order.price}</td>
                      <td className="py-4 px-6 text-slate-400 text-xs">{order.time}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No service orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View Cards */}
          <div className="block md:hidden divide-y divide-slate-800/40">
            {serviceOrders.map((order) => (
              <div key={order.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Room #{order.roomNo}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                  <p>Service: <span className="font-semibold text-slate-200">{order.serviceName}</span></p>
                  <p>Price: <span className="font-bold text-emerald-500">{order.price}</span></p>
                </div>
                <p className="text-[11px] text-slate-500 text-right">Time: {order.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE ORDER MODAL */}
      {isOrderModalOpen && selectedOrderService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <span>Order {selectedOrderService.name}</span>
              </h3>
              <button 
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 py-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101, 202"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Price</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedOrderService.price}`}
                  className={`w-full px-3.5 py-2 rounded-xl border opacity-70 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-600'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Additional Note (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Bring extra towels..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                ></textarea>
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition"
                >
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Housekeeping;