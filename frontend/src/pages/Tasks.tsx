import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle2, Circle, RefreshCcw, Plus } from 'lucide-react';
import api from '../api/client';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('tasks/');
      setTasks(response.data);
    } catch (err) {
      setError('Unable to load tasks from the server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (task: any) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const response = await api.patch(`tasks/${task.id}/`, { status: nextStatus });
      setTasks((current) => current.map((item) => (item.id === task.id ? response.data : item)));
    } catch (err) {
      setError('Could not update task status.');
      console.error(err);
    }
  };

  const categories = [
    { title: 'Pending', color: 'border-amber-500/30', data: tasks.filter((task) => task.status === 'Pending' || task.status === 'In Progress') },
    { title: 'Overdue', color: 'border-rose-500/30', data: tasks.filter((task) => task.status === 'Overdue') },
    { title: 'Completed', color: 'border-emerald-500/30', data: tasks.filter((task) => task.status === 'Completed') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tasks & Follow-Ups</h1>
          <p className="text-sm text-gray-400 mt-1">Track task status and update progress as work completes.</p>
        </div>
        <button onClick={fetchTasks} className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2">
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((column) => (
          <Column key={column.title} title={column.title} color={column.color} tasks={column.data} onUpdateStatus={updateStatus} loading={loading} />
        ))}
      </div>
    </div>
  );
}

function Column({ title, color, tasks, onUpdateStatus, loading }: { title: string; color: string; tasks: any[]; onUpdateStatus: (task: any) => void; loading: boolean; }) {
  return (
    <div className={`glass rounded-2xl p-5 border-t-4 ${color}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-300">{title} ({tasks.length})</h2>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-gray-400 text-center py-8">Loading tasks...</div>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="bg-surfaceLighter border border-white/5 p-4 rounded-xl hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="mt-0.5 shrink-0">
                  {task.status === 'Completed' ? <CheckCircle2 size={16} className="text-emerald-400" /> : task.status === 'Overdue' ? <AlertCircle size={16} className="text-rose-400" /> : <Circle size={16} className="text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'Completed' ? 'text-gray-500 line-through' : 'text-gray-200'} truncate`}>{task.title}</p>
                  <span className="text-xs text-primary-400 font-medium block mt-1">{task.customer_detail?.company_name || task.customer}</span>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                    <Calendar size={12} /> {new Date(task.due_date).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onUpdateStatus(task)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-200 hover:border-primary-500/40 transition-colors"
              >
                <Plus size={12} /> {task.status === 'Completed' ? 'Mark Pending' : 'Mark Complete'}
              </button>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">No tasks in this category.</div>
        )}
      </div>
    </div>
  );
}
