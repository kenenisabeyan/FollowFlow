import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle2, Circle, RefreshCcw, Plus, Search, Edit2, Trash2, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState({ title: '', description: '', customer_id: '', due_date: '', priority: 'Medium' });
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [followUpData, setFollowUpData] = useState({ followup_type: 'Call', outcome: '' });

  useEffect(() => {
    fetchTasks();
    const fetchCustomers = async () => {
      try {
        const res = await api.get('customers/');
        setCustomers(res.data);
      } catch (err) {
        console.error('Failed to load customers for dropdown', err);
      }
    };
    fetchCustomers();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id) return alert('Please select a customer.');
    try {
      if (editingTaskId) {
        await api.patch(`tasks/${editingTaskId}/`, {
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date,
          priority: formData.priority,
          customer: formData.customer_id
        });
      } else {
        await api.post('tasks/', {
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date,
          priority: formData.priority,
          customer: formData.customer_id
        });
      }
      setShowModal(false);
      setEditingTaskId(null);
      setFormData({ title: '', description: '', customer_id: '', due_date: '', priority: 'Medium' });
      fetchTasks();
    } catch (err) {
      alert('Error saving task.');
    }
  };

  const handleEditTask = (task: any) => {
    setFormData({ 
      title: task.title, 
      description: task.description || '', 
      customer_id: task.customer || '', 
      due_date: task.due_date ? task.due_date.slice(0, 16) : '', 
      priority: task.priority 
    });
    setEditingTaskId(task.id);
    setShowModal(true);
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`tasks/${id}/`);
      setTasks(current => current.filter(t => t.id !== id));
    } catch (err) {
      alert('Error deleting task.');
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      await api.post('followups/', {
        task: selectedTask.id,
        followup_type: followUpData.followup_type,
        outcome: followUpData.outcome
      });
      setShowFollowUpModal(false);
      setSelectedTask(null);
      setFollowUpData({ followup_type: 'Call', outcome: '' });
      fetchTasks();
    } catch (err) {
      alert('Error logging follow-up.');
    }
  };

  const getStatusBadge = (status: string) => {
    let colors = 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    if (status === 'Pending') colors = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (status === 'Completed') colors = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (status === 'Overdue') colors = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    
    return <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border inline-block ${colors}`}>{status}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    let colors = 'bg-gray-500/10 text-gray-500';
    if (priority === 'High') colors = 'bg-rose-500/10 text-rose-500';
    if (priority === 'Medium') colors = 'bg-amber-500/10 text-amber-500';
    if (priority === 'Low') colors = 'bg-blue-500/10 text-blue-500';
    return <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block ${colors}`}>{priority}</span>;
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
          <button onClick={fetchTasks} className="bg-surface border border-borderMain text-textMuted hover:text-textMain px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
            <RefreshCcw size={16} /> Refresh
          </button>
          <button 
            onClick={() => { setEditingTaskId(null); setFormData({ title: '', description: '', customer_id: '', due_date: '', priority: 'Medium' }); setShowModal(true); }}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
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
                className="w-full bg-surfaceLighter border border-borderMain rounded-full py-2 pl-9 pr-4 text-sm text-textMain focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                />
            </div>
            <div className="text-sm font-medium text-textMuted">
              Total {filteredTasks.length} tasks
            </div>
        </div>

        {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 m-4 text-sm text-rose-500">{error}</div>}

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
                            <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-600 flex items-center justify-center font-bold text-xs">
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
                                <>
                                  <button onClick={() => { setSelectedTask(task); setShowFollowUpModal(true); }} className="p-1 hover:text-blue-500 transition-colors" title="Log Follow-Up"><PhoneCall size={16}/></button>
                                  <button onClick={() => updateStatus(task, 'Completed')} className="p-1 hover:text-emerald-500 transition-colors" title="Mark Completed"><CheckCircle2 size={16}/></button>
                                </>
                            )}
                            <button onClick={() => handleEditTask(task)} className="p-1 hover:text-primary-500 transition-colors" title="Edit Task"><Edit2 size={16}/></button>
                            <button onClick={() => handleDeleteTask(task.id)} className="p-1 hover:text-rose-500 transition-colors" title="Delete Task"><Trash2 size={16}/></button>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface w-full max-w-md rounded-2xl border border-borderMain p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-textMain mb-4">{editingTaskId ? 'Edit Task' : 'Add New Task'}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Task Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  placeholder="Review contract"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Customer</label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.contact_name} {c.company_name ? `(${c.company_name})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Due Date</label>
                <input
                  required
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-2xl p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  placeholder="Optional details"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-textMuted hover:text-textMain"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-full text-sm font-medium"
                >
                  Save Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showFollowUpModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface w-full max-w-md rounded-2xl border border-borderMain p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-textMain mb-4">Log Follow-Up</h2>
            <p className="text-sm text-textMuted mb-6">Task: <span className="font-semibold text-textMain">{selectedTask.title}</span></p>
            <form className="space-y-4" onSubmit={handleFollowUpSubmit}>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Interaction Type</label>
                <select
                  value={followUpData.followup_type}
                  onChange={(e) => setFollowUpData({ ...followUpData, followup_type: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                >
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Outcome / Notes</label>
                <textarea
                  required
                  value={followUpData.outcome}
                  onChange={(e) => setFollowUpData({ ...followUpData, outcome: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-2xl p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  placeholder="What happened during this follow-up?"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowFollowUpModal(false); setSelectedTask(null); }}
                  className="px-4 py-2 text-sm text-textMuted hover:text-textMain"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-full text-sm font-medium"
                >
                  Log Follow-Up
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
