import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, Activity, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors bg-white/5">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
              K
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">Kenenisa</p>
              <p className="text-xs text-gray-500 truncate">Admin</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col z-10 hero-gradient min-w-0">
        <header className="h-16 glass flex items-center px-4 md:px-8 sticky top-0 z-30 justify-between md:justify-end">
           <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
             <Menu size={24} />
           </button>
           <div className="text-sm text-gray-400 border border-white/10 px-3 py-1.5 rounded-full bg-surfaceLighter">
             SaaS Production Mode
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
