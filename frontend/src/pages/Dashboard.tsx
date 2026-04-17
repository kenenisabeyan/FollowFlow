import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ArrowDownRight, UserPlus, Clock, BookOpen, User, Phone, CheckCircle2, AlertCircle, Circle, Bell, MoreHorizontal, MessageSquare, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    tasks: 0,
    completedTasks: 0,
    notifications: 0,
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [customersRes, tasksRes, notificationsRes] = await Promise.all([
          api.get('customers/'),
          api.get('tasks/'),
          api.get('notifications/'),
        ]);

        const tasksData = tasksRes.data;
        setStats({
          customers: customersRes.data.length,
          tasks: tasksData.filter((t: any) => t.status !== 'Completed').length,
          completedTasks: tasksData.filter((t: any) => t.status === 'Completed').length,
          notifications: notificationsRes.data.length,
        });

        setTasks(tasksData.slice(0, 4));
        setCustomers(customersRes.data.slice(0, 4));
        setNotifications(notificationsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Failed loading dashboard metrics', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const getStatusBadge = (status: string) => {
    let colors = 'bg-gray-500/10 text-gray-400';
    if (status === 'New' || status === 'Pending') colors = 'bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs';
    if (status === 'Contacted' || status === 'Completed' || status === 'In Progress') colors = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs';
    if (status === 'Overdue') colors = 'bg-rose-500/10 text-rose-500 border-rose-500/20 text-xs';
    
    return <span className={`px-2 py-1 rounded-lg inline-block border font-semibold ${colors}`}>{status}</span>;
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  // Ensure these match the visual layout from the mockup perfectly
  const statCards = [
    { title: 'New Customers', value: stats.customers, up: true, pct: '11%', bgClass: 'from-blue-600 to-blue-400' },
    { title: 'Open Tasks', value: stats.tasks, up: true, pct: '5%', bgClass: 'from-orange-500 to-orange-400' },
    { title: 'Completed Tasks', value: stats.completedTasks, up: true, pct: '17%', bgClass: 'from-emerald-500 to-emerald-400' },
    { title: 'Notifications', value: stats.notifications, up: false, pct: '2%', bgClass: 'from-purple-600 to-purple-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={stat.title}
            className={`rounded-2xl p-6 relative overflow-hidden group hover-lift shadow-sm text-white bg-gradient-to-br ${stat.bgClass}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="absolute bottom-0 right-8 w-16 h-16 bg-white/5 rounded-full -mb-8 transition-transform group-hover:scale-110" />
            
            <h3 className="text-white/80 font-medium tracking-wide mb-1 text-sm md:text-base">{stat.title}</h3>
            <p className="text-4xl font-bold tracking-tight">{loading ? '—' : stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customers Table */}
        <div className="bg-surface rounded-2xl flex flex-col border border-borderMain">
          <div className="p-4 border-b border-borderMain flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-textMain">
               Customers
            </h2>
            <button onClick={() => alert('More options coming soon.')} className="text-textMuted hover:text-textMain"><MoreHorizontal size={20}/></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-textMuted">
              <thead className="text-xs bg-surfaceLighter font-medium border-b border-borderMain">
                <tr>
                  <th className="px-4 py-3 font-semibold text-textMain uppercase">Name</th>
                  <th className="px-4 py-3 font-semibold text-textMain uppercase">Phone</th>
                  <th className="px-4 py-3 font-semibold text-textMain uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMain">
                {customers.length > 0 ? customers.map(c => (
                  <tr key={c.id} className="hover:bg-surfaceLighter/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-textMain">{c.contact_name}</td>
                    <td className="px-4 py-3">{c.phone || c.email || '—'}</td>
                    <td className="px-4 py-3">{getStatusBadge(c.status)}</td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={3} className="px-4 py-6 text-center text-sm text-textMuted">No customers available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-surface rounded-2xl flex flex-col border border-borderMain">
          <div className="p-4 border-b border-borderMain flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-textMain">
               Tasks
            </h2>
            <div className="flex gap-2">
              <button onClick={() => alert('Task filtering features coming soon.')} className="px-2 py-1 text-xs rounded-full border border-borderMain hover:bg-surfaceLighter transition">Filter</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-textMuted">
              <thead className="text-xs bg-surfaceLighter font-medium border-b border-borderMain">
                <tr>
                  <th className="px-4 py-3 font-semibold text-textMain uppercase">Task</th>
                  <th className="px-4 py-3 font-semibold text-textMain uppercase text-center">Due Date</th>
                  <th className="px-4 py-3 font-semibold text-textMain uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMain">
                {tasks.length > 0 ? tasks.map(t => (
                  <tr key={t.id} className="hover:bg-surfaceLighter/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-textMain truncate max-w-[150px]">{t.title}</td>
                    <td className="px-4 py-3 text-center text-xs">{new Date(t.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">{getStatusBadge(t.status)}</td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={3} className="px-4 py-6 text-center text-sm text-textMuted">No tasks available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-surface rounded-2xl border border-borderMain flex flex-col">
        <div className="p-4 border-b border-borderMain flex items-center justify-between">
          <h2 className="text-lg font-semibold text-textMain">Recent Activity</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-textMuted">Sort by:</span>
            <button onClick={() => alert('Activity sorting coming soon.')} className="text-sm text-textMain font-medium flex items-center gap-1 hover:text-primary-500">
               Time <ArrowDownRight size={14}/>
            </button>
          </div>
        </div>
        <div className="p-2 space-y-1">
          {loading ? (
             <div className="p-8 text-center text-primary-500">Loading activities...</div>
          ) : notifications.length > 0 ? (
             notifications.map(n => (
               <div key={n.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surfaceLighter transition-colors">
                 <div className="flex items-center gap-4">
                   <div className={`p-2 rounded-lg-full ${n.title.toLowerCase().includes('overdue') || n.title.toLowerCase().includes('cancel') ? 'bg-rose-500/10 text-rose-500' : 'bg-primary-500/10 text-primary-500'}`}>
                     {n.title.toLowerCase().includes('message') ? <MessageSquare size={18} /> : n.title.toLowerCase().includes('user') || n.title.toLowerCase().includes('customer') ? <UserPlus size={18}/> : <Info size={18} />}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-textMain">{n.title}</p>
                     <p className="text-xs text-textMuted mt-0.5">{n.message}</p>
                   </div>
                 </div>
                 <div className="text-xs font-medium text-textMuted shrink-0">
                   {getRelativeTime(n.created_at)}
                 </div>
               </div>
             ))
          ) : (
            <div className="p-6 text-center text-sm text-textMuted">No recent active notifications.</div>
          )}
        </div>
      </div>
    </div>
  );
}
