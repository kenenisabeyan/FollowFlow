import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, Activity, Menu, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await api.get('notifications/');
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed loading notifications', error);
      }
    };
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await Promise.all(
        notifications.map((notification) =>
          api.patch(`notifications/${notification.id}/`, { is_read: true })
        )
      );
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      setNotifOpen(false);
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/customers', icon: <Users size={20} />, label: 'Customers' },
    { to: '/tasks', icon: <CheckSquare size={20} />, label: 'Tasks', badge: '3' },
    { to: '/timeline', icon: <Activity size={20} />, label: 'Timeline' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-600/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-80 h-80 bg-brand/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen || window.innerWidth >= 768 ? 0 : -280 }}
        className="fixed md:static inset-y-0 left-0 w-64 glass z-50 flex flex-col transition-transform duration-300 md:translate-x-0"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary-500 to-brand flex items-center justify-center font-bold text-white shadow-lg">
              FF
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              FollowFlow
            </span>
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                  isActive ? 'bg-primary-500/10 text-primary-400' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`
              }
            >
              <div className="flex items-center gap-3 font-medium text-sm">
                <span>{item.icon}</span>
                {item.label}
              </div>
              {item.badge && (
                <span className="bg-brand text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div 
            onClick={() => {
              if(window.confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('ff_token');
                window.location.reload();
              }
            }}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors bg-white/5"
            title="Click to Log Out"
          >
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              K
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">Kenenisa</p>
              <p className="text-xs text-rose-400 font-medium truncate group-hover:text-rose-300">Log Out</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col z-10 hero-gradient min-w-0">
        <header className="h-16 glass flex items-center px-4 md:px-8 sticky top-0 z-30 justify-between">
           <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
             <Menu size={24} />
           </button>
           
           <div className="ml-auto flex items-center gap-6">
              {/* Notification System */}
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 glass rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary-400 hover:text-primary-300">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b border-white/5 text-sm ${n.read ? 'opacity-60' : 'bg-white/5'}`}>
                            <p className={`font-medium ${n.title.includes('Overdue') ? 'text-rose-400' : 'text-gray-200'}`}>
                              {n.title}
                            </p>
                          </div>
                        )) : (
                          <div className="p-6 text-center text-gray-500 text-sm">No new alerts</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden md:block text-sm text-gray-400 border border-white/10 px-3 py-1.5 rounded-full bg-surfaceLighter">
                SaaS Production Mode
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-auto">
           <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
             <Outlet />
           </div>
        </div>
      </main>
    </div>
  );
}
