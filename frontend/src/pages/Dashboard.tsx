import React, { useEffect, useState } from 'react';
import { Bell, ArrowUpRight, ArrowDownRight, Clock, CheckCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

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
          tasks: tasksData.length,
          completedTasks: tasksData.filter((task: any) => task.status === 'Completed').length,
          notifications: notificationsRes.data.length,
        });
        setTasks(tasksData.slice(0, 4));
      } catch (error) {
        console.error('Failed loading dashboard metrics', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const summary = [
    { title: 'Customers', value: stats.customers, up: true, pct: '8%' },
    { title: 'Open Tasks', value: stats.tasks, up: stats.tasks > 0, pct: '5%' },
    { title: 'Completed', value: stats.completedTasks, up: true, pct: '12%' },
    { title: 'Alerts', value: stats.notifications, up: stats.notifications === 0, pct: '0%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-400 mt-1">Live customer, task, and alert metrics pulled from the API.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-primary-500/20 hover-lift">
          + New Follow-Up
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            key={stat.title}
            className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover-lift"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">{stat.title}</h3>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-semibold text-white">{loading ? '—' : stat.value}</p>
              <span className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${stat.up ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.pct}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-lg font-semibold text-white">Upcoming Tasks</h2>
            <span className="text-xs uppercase text-gray-400 tracking-[0.2em]">Realtime</span>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-primary-400">Loading tasks...</div>
          ) : (
            <div className="space-y-3">
              {tasks.length > 0 ? tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  title={task.title}
                  time={new Date(task.due_date).toLocaleString()}
                  priority={task.priority}
                  done={task.status === 'Completed'}
                  status={task.status}
                />
              )) : (
                <div className="text-gray-400 text-sm">No tasks assigned yet.</div>
              )}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-rose-400 flex items-center gap-2 mb-4">
            <Bell size={18} /> Active Alerts
          </h2>
          <div className="space-y-4">
            <AlertRow msg="Client meeting scheduled for tomorrow" days="1 day" />
            <AlertRow msg="Contract review overdue for Stark Ind" days="2 days" />
            <AlertRow msg="Follow-up response needed from Bruce Wayne" days="3 days" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ title, time, priority, done, status }: any) {
  const pColor = priority === 'High' ? 'text-rose-400' : priority === 'Medium' ? 'text-amber-400' : 'text-gray-400';
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${done ? 'border-white/5 bg-white/5 opacity-70' : 'border-white/10 hover:border-primary-500/50 bg-surfaceLighter/50'}`}>
      <div>
        <p className={`text-sm font-medium ${done ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{title}</p>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
          <span>{status}</span>
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{time}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold uppercase ${pColor}`}>{priority}</span>
        {done ? <CheckCircle className="text-emerald-400" size={18} /> : <Clock size={18} className="text-gray-500" />}
      </div>
    </div>
  );
}

function AlertRow({ msg, days }: any) {
  return (
    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
      <p className="text-sm text-gray-200 font-medium mb-1">{msg}</p>
      <p className="text-xs text-rose-400 font-medium">{days} remaining</p>
    </div>
  );
}
