import React, { useState } from 'react';
import { LayoutDashboard, Users, CheckSquare, Bell, Search, Menu, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-600/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-80 h-80 bg-brand/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen || window.innerWidth >= 768 ? 0 : -300 }}
        className="fixed md:static inset-y-0 left-0 w-64 glass z-50 flex flex-col transition-transform duration-300 md:translate-x-0"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary-500 to-brand flex items-center justify-center font-bold text-white shadow-lg">
              FF
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              FollowFlow
            </span>
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Users size={20} />} label="Customers" />
          <NavItem icon={<CheckSquare size={20} />} label="Tasks" badge="3" />
          <NavItem icon={<Bell size={20} />} label="Notifications" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">Admin User</p>
              <p className="text-xs text-gray-500">admin@followflow.com</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10 hero-gradient">
        {/* Header */}
        <header className="h-20 glass flex items-center justify-between px-6 border-b-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-semibold text-white tracking-tight hidden sm:block">Overview</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search customers, tasks..." 
                className="bg-surfaceLighter border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-primary-500/50 w-64 transition-all focus:w-72 shadow-inner"
              />
            </div>
            <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2 hover-lift">
              <Plus size={16} />
              <span className="hidden sm:inline">New Action</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 md:p-10 space-y-8 overflow-y-auto w-full max-w-7xl mx-auto">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Customers" value="1,248" trend="+12%" positive />
            <StatCard title="Pending Tasks" value="34" trend="-5%" />
            <StatCard title="Conversion Rate" value="64.2%" trend="+4%" positive />
            <StatCard title="Active Campaigns" value="8" trend="+1" positive />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Contacts Main List */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Recent Customer Activity</h2>
                <button className="text-sm text-primary-500 hover:text-primary-400 font-medium">View All</button>
              </div>
              <div className="space-y-4">
                <ActivityRow name="Emma Watson" action="Completed onboard call" time="2 hours ago" status="success" />
                <ActivityRow name="TechCorp Inc." action="Viewed proposal document" time="5 hours ago" status="pending" />
                <ActivityRow name="John Smith" action="Added to 'Q3 Leads' list" time="1 day ago" status="info" />
                <ActivityRow name="Global Solutions" action="Signed enterprise contract" time="2 days ago" status="success" />
              </div>
            </div>

            {/* Upcoming Tasks Sidebar */}
            <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Upcoming Tasks</h2>
                <span className="bg-primary-500/20 text-primary-400 text-xs px-2 py-1 rounded-full font-medium">3 Due</span>
              </div>
              <div className="space-y-4">
                <TaskCard title="Follow up email to Emma" duedate="Today, 4:00 PM" priority="High" />
                <TaskCard title="Send revised proposal" duedate="Tomorrow, 10:00 AM" priority="Medium" />
                <TaskCard title="Check in with Global Solutions" duedate="Apr 16" priority="Low" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Subcomponents for cleaner modularity

function NavItem({ icon, label, active, badge }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${active ? 'bg-primary-500/10 text-primary-500' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`${active ? 'text-primary-500' : 'text-gray-500 group-hover:text-gray-300'} transition-colors`}>
          {icon}
        </div>
        <span className="font-medium text-sm">{label}</span>
      </div>
      {badge && (
        <span className="bg-brand text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
          {badge}
        </span>
      )}
    </div>
  );
}

function StatCard({ title, value, trend, positive }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-white/5 hover-lift relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        <span className={`text-sm font-medium ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend}
        </span>
      </div>
    </motion.div>
  );
}

function ActivityRow({ name, action, time, status }) {
  const statusColors = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/20'
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surfaceLighter border border-white/10 flex items-center justify-center text-sm font-bold text-gray-300">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-200">{name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{action}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-gray-500">{time}</span>
        <div className={`w-2 h-2 rounded-full ${statusColors[status].split(' ')[1]}`} />
      </div>
    </div>
  );
}

function TaskCard({ title, duedate, priority }) {
  const pColors = {
    High: 'text-rose-400 bg-rose-400/10 border border-rose-400/20',
    Medium: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
    Low: 'text-gray-400 bg-gray-400/10 border border-gray-400/20'
  };

  return (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
      <button className="mt-1 w-5 h-5 rounded-md border-2 border-gray-600 flex-shrink-0 group-hover:border-primary-500 transition-colors" />
      <div>
        <p className="text-sm font-medium text-gray-200 leading-tight">{title}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Bell size={12} /> {duedate}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${pColors[priority]}`}>
            {priority}
          </span>
        </div>
      </div>
    </div>
  );
}
