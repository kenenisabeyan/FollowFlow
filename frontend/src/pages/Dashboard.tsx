import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ArrowDownRight, UserPlus, DollarSign, CheckCircle2, AlertCircle, Circle, Bell, MoreHorizontal, MessageSquare, Info, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    newLeads: 0,
    contactedLeads: 0,
    pendingLeads: 0,
    closedDeals: 0,
    pipelineValue: 0,
    tasks: 0,
    completedTasks: 0,
    notifications: 0,
    userRole: 'ADMIN',
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState('All');
  const [activitySort, setActivitySort] = useState<'desc'|'asc'>('desc');
  const { user } = useAuth();

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, customersRes, tasksRes, notificationsRes] = await Promise.all([
          api.get('dashboard/stats/').catch(() => ({ data: {} })),
          api.get('customers/').catch(() => ({ data: [] })),
          api.get('tasks/').catch(() => ({ data: [] })),
          api.get('notifications/').catch(() => ({ data: [] })),
        ]);

        const s = statsRes.data || {};
        const custData = s.customers || {};
        const taskData = s.tasks || {};
        const notifData = s.notifications || {};
        const userCtx = s.user_context || {};

        setStats({
          customers: custData.total || 0,
          newLeads: custData.new || 0,
          contactedLeads: custData.contacted || 0,
          pendingLeads: custData.pending || 0,
          closedDeals: custData.closed || 0,
          pipelineValue: custData.pipeline_value || 0,
          tasks: (taskData.pending || 0) + (taskData.in_progress || 0) + (taskData.overdue || 0),
          completedTasks: taskData.completed || 0,
          notifications: notifData.unread || 0,
          userRole: userCtx.role || user?.role || 'ADMIN',
        });

        setTasks((tasksRes.data || []).slice(0, 4));
        setCustomers((customersRes.data || []).slice(0, 4));
        setNotifications((notificationsRes.data || []).slice(0, 5));
      } catch (error) {
        console.error('Failed loading dashboard metrics', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [user]);

  const getStatusBadge = (status: string) => {
    let colors = 'bg-gray-500/10 text-gray-400';
    if (status === 'New' || status === 'Pending') colors = 'bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs';
    if (status === 'Contacted' || status === 'Completed' || status === 'In Progress') colors = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs';
    if (status === 'Overdue') colors = 'bg-rose-500/10 text-rose-500 border-rose-500/20 text-xs';
    
    return <span className={`px-2 py-0.5 rounded-full inline-block border font-semibold ${colors}`}>{status}</span>;
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const statCards = [
    { title: 'Pipeline Value', value: loading ? '—' : formatCurrency(stats.pipelineValue), sub: 'Active Opportunity Scope', bgClass: 'from-emerald-600 to-teal-500', isCurrency: true },
    { title: 'Total Accounts', value: loading ? '—' : stats.customers, sub: `${stats.closedDeals} closed deals`, bgClass: 'from-blue-600 to-indigo-500' },
    { title: 'Open Tasks', value: loading ? '—' : stats.tasks, sub: `${stats.completedTasks} completed`, bgClass: 'from-amber-500 to-orange-500' },
    { title: 'Unread Alerts', value: loading ? '—' : stats.notifications, sub: 'Action items required', bgClass: 'from-purple-600 to-pink-500' },
  ];

  const displayedTasks = taskFilter === 'All' ? tasks : tasks.filter(t => t.status.includes(taskFilter));
  
  const displayedNotifications = [...notifications].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return activitySort === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface p-4 sm:p-6 rounded-2xl border border-borderMain">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Executive CRM & ERP Dashboard</h1>
          <p className="text-sm text-textMuted mt-1">Enterprise account overview, pipeline revenue velocity, and operations monitoring.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <ShieldCheck size={14} /> Role: {stats.userRole}
          </span>
        </div>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={stat.title}
            className={`rounded-2xl p-6 relative overflow-hidden group shadow-sm text-white bg-gradient-to-br ${stat.bgClass}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="absolute bottom-0 right-8 w-16 h-16 bg-white/5 rounded-full -mb-8 transition-transform group-hover:scale-110" />
            
            <h3 className="text-white/80 font-medium tracking-wide mb-1 text-xs sm:text-sm uppercase">{stat.title}</h3>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">{stat.value}</p>
            <p className="text-xs text-white/70 mt-2 font-medium">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Sales Pipeline Funnel Stage Distribution */}
      <div className="bg-surface rounded-2xl p-6 border border-borderMain">
        <h2 className="text-sm font-bold uppercase tracking-wider text-textMuted mb-4">Lead & Deal Conversion Funnel</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surfaceLighter p-4 rounded-xl border border-borderMain">
            <span className="text-xs font-semibold text-blue-400 uppercase">1. New Leads</span>
            <p className="text-2xl font-bold text-textMain mt-1">{loading ? '—' : stats.newLeads}</p>
            <span className="text-[11px] text-textMuted">Incoming accounts</span>
          </div>
          <div className="bg-surfaceLighter p-4 rounded-xl border border-borderMain">
            <span className="text-xs font-semibold text-amber-400 uppercase">2. Contacted</span>
            <p className="text-2xl font-bold text-textMain mt-1">{loading ? '—' : stats.contactedLeads}</p>
            <span className="text-[11px] text-textMuted">Discussions started</span>
          </div>
          <div className="bg-surfaceLighter p-4 rounded-xl border border-borderMain">
            <span className="text-xs font-semibold text-purple-400 uppercase">3. In Negotiation</span>
            <p className="text-2xl font-bold text-textMain mt-1">{loading ? '—' : stats.pendingLeads}</p>
            <span className="text-[11px] text-textMuted">Proposals active</span>
          </div>
          <div className="bg-surfaceLighter p-4 rounded-xl border border-borderMain">
            <span className="text-xs font-semibold text-emerald-400 uppercase">4. Closed Won</span>
            <p className="text-2xl font-bold text-textMain mt-1">{loading ? '—' : stats.closedDeals}</p>
            <span className="text-[11px] text-textMuted">Secured business</span>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customers Table */}
        <div className="bg-surface rounded-2xl flex flex-col border border-borderMain">
          <div className="p-4 border-b border-borderMain flex items-center justify-between">
            <h2 className="text-base font-bold text-textMain">
               Recent Accounts
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-textMuted">
              <thead className="text-xs bg-surfaceLighter font-medium border-b border-borderMain">
                <tr>
                  <th className="px-4 py-3 font-semibold text-textMain uppercase">Company / Contact</th>
                  <th className="px-4 py-3 font-semibold text-textMain uppercase">Status</th>
                  <th className="px-4 py-3 font-semibold text-textMain uppercase text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMain">
                {customers.length > 0 ? customers.map(c => (
                  <tr key={c.id} className="hover:bg-surfaceLighter/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-textMain">{c.company_name}</div>
                      <div className="text-xs text-textMuted">{c.contact_name}</div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(c.status)}</td>
                    <td className="px-4 py-3 text-right font-medium text-textMain">
                      {c.lead_value ? formatCurrency(Number(c.lead_value)) : '—'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={3} className="px-4 py-6 text-center text-sm text-textMuted">No customers registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-surface rounded-2xl flex flex-col border border-borderMain">
          <div className="p-4 border-b border-borderMain flex items-center justify-between">
            <h2 className="text-base font-bold text-textMain">
               Priority Tasks
            </h2>
            <div className="flex gap-2">
              <select 
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="px-2 py-1 text-xs rounded-full border border-borderMain bg-surfaceLighter text-textMain hover:bg-surface transition-colors outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
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
                {displayedTasks.length > 0 ? displayedTasks.map(t => (
                  <tr key={t.id} className="hover:bg-surfaceLighter/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-textMain truncate max-w-[150px]">{t.title}</td>
                    <td className="px-4 py-3 text-center text-xs">{new Date(t.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">{getStatusBadge(t.status)}</td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={3} className="px-4 py-6 text-center text-sm text-textMuted">No tasks match this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Alerts Feed */}
      <div className="bg-surface rounded-2xl border border-borderMain flex flex-col">
        <div className="p-4 border-b border-borderMain flex items-center justify-between">
          <h2 className="text-base font-bold text-textMain">System Notifications & Alerts</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-textMuted">Sort:</span>
            <button onClick={() => setActivitySort(prev => prev === 'desc' ? 'asc' : 'desc')} className="text-xs text-textMain font-medium flex items-center gap-1 hover:text-primary-500">
               Time {activitySort === 'desc' ? <ArrowDownRight size={14}/> : <ArrowUpRight size={14}/>}
            </button>
          </div>
        </div>
        <div className="p-2 space-y-1">
          {loading ? (
             <div className="p-8 text-center text-primary-500">Loading activities...</div>
          ) : displayedNotifications.length > 0 ? (
             displayedNotifications.map(n => (
               <div key={n.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-surfaceLighter transition-colors">
                 <div className="flex items-center gap-4">
                   <div className={`p-2 rounded-full ${n.title.toLowerCase().includes('overdue') || n.title.toLowerCase().includes('cancel') ? 'bg-rose-500/10 text-rose-500' : 'bg-primary-500/10 text-primary-500'}`}>
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
            <div className="p-6 text-center text-sm text-textMuted">No unread notifications.</div>
          )}
        </div>
      </div>
    </div>
  );
}
