import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle2, Circle, RefreshCcw, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import api from '../api/client';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const updateStatus = async (task: any, newStatus: string) => {
    try {
      const response = await api.patch(`tasks/${task.id}/`, { status: newStatus });
      setTasks((current) => current.map((item) => (item.id === task.id ? response.data : item)));
    } catch (err) {
      setError('Could not update task status.');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    let colors = 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    if (status === 'Pending') colors = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (status === 'Completed') colors = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (status === 'Overdue') colors = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    
    return <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border inline-block ${colors}`}>{status}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    let colors = 'bg-gray-500/10 text-gray-500';
    if (priority === 'High') colors = 'bg-rose-500/10 text-rose-500';
    if (priority === 'Medium') colors = 'bg-amber-500/10 text-amber-500';
    if (priority === 'Low') colors = 'bg-blue-500/10 text-blue-500';
    return <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded inline-block ${colors}`}>{priority}</span>;
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.customer_detail?.company_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Tasks</h1>
          <p className="text-sm text-textMuted mt-1">Easily manage and track your follow-up workflows.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchTasks} className="bg-surface border border-borderMain text-textMuted hover:text-textMain px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <RefreshCcw size={16} /> Refresh
          </button>
          <button 
            onClick={() => alert('Task creation modal coming soon.')}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-borderMain overflow-hidden flex flex-col">
        <div className="p-4 border-b border-borderMain flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative flex-1 w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search"
                className="w-full bg-surfaceLighter border border-borderMain rounded-lg py-2 pl-9 pr-4 text-sm text-textMain focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                />
            </div>
            <div className="text-sm font-medium text-textMuted">
              Total {filteredTasks.length} tasks
            </div>
        </div>

        {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 m-4 text-sm text-rose-500">{error}</div>}

        <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-textMuted whitespace-nowrap">
              <thead className="text-xs bg-surfaceLighter text-textMuted uppercase border-b border-borderMain">
                <tr>
                  <th className="px-6 py-4 font-semibold w-12">
                    <input type="checkbox" className="rounded border-borderMain bg-surfaceLighter" />
                  </th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Task</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMain bg-surface">
                {loading ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center">Loading tasks data...</td></tr>
                ) : filteredTasks.length > 0 ? filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-surfaceLighter/50 transition-colors group">
                    <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-borderMain bg-surfaceLighter focus:ring-primary-500" />
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-primary-500/20 text-primary-600 flex items-center justify-center font-bold text-xs">
                                {String(task.customer_detail?.company_name || task.customer || 'C').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-textMain">{task.customer_detail?.company_name || String(task.customer) || 'Unknown Customer'}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-textMain">{task.title}</td>
                    <td className="px-6 py-4">{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="px-6 py-4">
                        {getStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-textMuted">
                            {task.status !== 'Completed' && (
                                <button onClick={() => updateStatus(task, 'Completed')} className="p-1 hover:text-emerald-500" title="Mark Completed"><CheckCircle2 size={16}/></button>
                            )}
                            <button onClick={() => alert('Task editing coming soon.')} className="p-1 hover:text-primary-500"><Edit2 size={16}/></button>
                            <button onClick={() => alert('Task deletion coming soon.')} className="p-1 hover:text-rose-500"><Trash2 size={16}/></button>
                        </div>
                    </td>
                  </tr>
                )) : (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-textMuted">No tasks found. Try altering your search or create one.</td></tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
