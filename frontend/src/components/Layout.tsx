import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, Activity, Menu, X, Bell, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    { to: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
    { to: '/timeline', icon: <Activity size={20} />, label: 'Timeline' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden font-sans text-textMain">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen || window.innerWidth >= 768 ? 0 : -280 }}
        className="fixed md:static inset-y-0 left-0 w-64 bg-surface border-r border-borderMain z-50 flex flex-col transition-transform duration-300 md:translate-x-0"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              {/* Logo matching the screenshot - blue and red geometry */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.5 6L28 10V18L21.5 22L15 18V10L21.5 6Z" fill="#3B82F6"/>
                <path d="M10.5 13L17 17V25L10.5 29L4 25V17L10.5 13Z" fill="#EF4444"/>
                <path d="M17 17L23.5 13L17 9L10.5 13L17 17Z" fill="#60A5FA"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-textMain tracking-tight">
              FollowFlow
            </span>
          </div>
          <button className="md:hidden text-textMuted hover:text-textMain" onClick={() => setSidebarOpen(false)}>
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
                  isActive ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-textMuted hover:bg-surfaceLighter hover:text-textMain'
                }`
              }
            >
              <div className="flex items-center gap-3 font-medium text-sm">
                <span className={({ isActive }) => isActive ? 'text-primary-500' : 'text-textMuted'}>{item.icon}</span>
                {item.label}
              </div>
              {item.badge && (
                <span className="bg-primary-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-borderMain">
          <button
            onClick={() => logout()}
            className="w-full text-left flex flex-col sm:flex-row items-center sm:items-start gap-3 p-3 rounded-xl hover:bg-surfaceLighter transition-colors"
            title="Click to Log Out"
          >
            <div className="w-9 h-9 rounded-full bg-surfaceLighter border border-borderMain flex items-center justify-center text-textMain text-sm font-bold shrink-0">
              {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 mt-1">
              <p className="text-sm font-semibold text-textMain truncate">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'Admin'}</p>
              <p className="text-xs text-textMuted font-medium truncate hover:text-rose-500 transition-colors">Log Out</p>
            </div>
          </button>
        </div>
      </motion.aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col z-10 min-w-0">
        <header className="h-16 bg-surface border-b border-borderMain flex items-center px-4 md:px-8 sticky top-0 z-30 justify-between">
           <button className="md:hidden text-textMuted hover:text-textMain" onClick={() => setSidebarOpen(true)}>
             <Menu size={24} />
           </button>

           <div className="hidden md:flex flex-1 mx-8 items-center gap-6">
             <NavLink to="/" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary-500 border-b-2 border-primary-500 pb-5 -mb-5' : 'text-textMuted hover:text-textMain'}`}>Dashboard</NavLink>
             <NavLink to="/customers" className={({ isActive }) => `text-sm font-medium flex items-center gap-1 ${isActive ? 'text-primary-500 border-b-2 border-primary-500 pb-5 -mb-5' : 'text-textMuted hover:text-textMain'}`}>Customers <span className="text-[10px]">▼</span></NavLink>
             <NavLink to="/tasks" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary-500 border-b-2 border-primary-500 pb-5 -mb-5' : 'text-textMuted hover:text-textMain'}`}>Tasks</NavLink>
             <NavLink to="/notifications" className={({ isActive }) => `text-sm font-medium flex items-center gap-1 ${isActive ? 'text-primary-500 border-b-2 border-primary-500 pb-5 -mb-5' : 'text-textMuted hover:text-textMain'}`}>Notifications <span className="text-[10px]">▼</span></NavLink>
           </div>
           
           <div className="ml-auto flex items-center gap-5">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="text-textMuted hover:text-textMain transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Notification System */}
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative text-textMuted hover:text-textMain transition-colors flex items-center justify-center"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-surface rounded-xl border border-borderMain shadow-2xl overflow-hidden z-50 text-textMain"
                    >
                      <div className="p-4 border-b border-borderMain flex justify-between items-center">
                        <h3 className="text-sm font-bold">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary-500 hover:text-primary-600">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b border-borderMain text-sm ${n.is_read ? 'opacity-60' : 'bg-surfaceLighter'}`}>
                            <p className={`font-medium ${n.title.includes('Overdue') ? 'text-rose-500' : 'text-textMain'}`}>
                              {n.title}
                            </p>
                          </div>
                        )) : (
                          <div className="p-6 text-center text-textMuted text-sm">No new alerts</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-surfaceLighter border border-borderMain overflow-hidden flex items-center justify-center">
                  <span className="text-xs font-bold text-textMain">{user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}</span>
                </div>
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
