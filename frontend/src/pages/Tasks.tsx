import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle2, Circle, RefreshCcw, Plus, Search, Edit2, Trash2, PhoneCall, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState({ title: '', description: '', customer_id: '', due_date: '', priority: 'Medium' });
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [followUpData, setFollowUpData] = useState({ followup_type: 'Call', outcome: '' });

  useEffect(() => {
    fetchTasks();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('customers/');
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to load customers for dropdown', err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('tasks/');
      setTasks(response.data || []);
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
      setAlertMsg({ type: 'success', text: `Task marked as ${newStatus}.` });
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Could not update task status.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id) {
      setAlertMsg({ type: 'error', text: 'Please select a customer for this task.' });
      return;
    }

    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        priority: formData.priority,
        customer: Number(formData.customer_id),
      };

      if (editingTaskId) {
        await api.patch(`tasks/${editingTaskId}/`, payload);
        setAlertMsg({ type: 'success', text: 'Task updated successfully.' });
      } else {
        await api.post('tasks/', payload);
        setAlertMsg({ type: 'success', text: 'New task created successfully.' });
      }
      setShowModal(false);
      setEditingTaskId(null);
      setFormData({ title: '', description: '', customer_id: '', due_date: '', priority: 'Medium' });
      fetchTasks();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Error saving task. Please check date and details.';
      setAlertMsg({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = (task: any) => {
    const custId = task.customer?.id || task.customer || '';
    setFormData({ 
      title: task.title, 
      description: task.description || '', 
      customer_id: String(custId), 
      due_date: task.due_date ? task.due_date.slice(0, 16) : '', 
      priority: task.priority || 'Medium'
    });
    setEditingTaskId(task.id);
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`tasks/${taskToDelete.id}/`);
      setTasks(current => current.filter(t => t.id !== taskToDelete.id));
      setAlertMsg({ type: 'success', text: 'Task deleted successfully.' });
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Error deleting task.' });
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await api.post('followups/', {
        task: selectedTask.id,
        followup_type: followUpData.followup_type,
        outcome: followUpData.outcome
      });
      setShowFollowUpModal(false);
      setSelectedTask(null);
      setFollowUpData({ followup_type: 'Call', outcome: '' });
      setAlertMsg({ type: 'success', text: 'Follow-up logged and task set to In Progress.' });
      fetchTasks();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Error logging follow-up.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    let colors = 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    if (status === 'Pending') colors = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (status === 'In Progress') colors = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
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

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.customer_detail?.company_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl flex items-center justify-between border ${
              alertMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {alertMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {alertMsg.text}
            </div>
            <button onClick={() => setAlertMsg(null)} className="p-1 hover:opacity-75">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Tasks & Operational Workflows</h1>
          <p className="text-sm text-textMuted mt-1">Track assignments, follow-ups, deadlines, and automated status transitions.</p>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['All', 'Pending', 'In Progress', 'Completed', 'Overdue'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'bg-surface border border-borderMain text-textMuted hover:text-textMain'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-borderMain overflow-hidden flex flex-col">
        <div className="p-4 border-b border-borderMain flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative flex-1 w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search tasks, customers..."
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
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Task Title</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMain bg-surface">
                {loading ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center">Loading tasks data...</td></tr>
                ) : paginatedTasks.length > 0 ? paginatedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-surfaceLighter/50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-600 flex items-center justify-center font-bold text-xs">
                                {String(task.customer_detail?.company_name || task.customer || 'C').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-textMain">{task.customer_detail?.company_name || `Customer #${task.customer}`}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-textMain font-medium">{task.title}</td>
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
                            <button onClick={() => setTaskToDelete(task)} className="p-1 hover:text-rose-500 transition-colors" title="Delete Task"><Trash2 size={16}/></button>
                        </div>
                    </td>
                  </tr>
                )) : (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-textMuted">No tasks found. Try altering your filter or create a new one.</td></tr>
                )}
              </tbody>
            </table>
        </div>

        {/* Pagination Bar */}
        {filteredTasks.length > pageSize && (
          <div className="p-4 border-t border-borderMain flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-textMuted bg-surfaceLighter">
            <div>
              Showing <span className="font-semibold text-textMain">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-textMain">
                {Math.min(currentPage * pageSize, filteredTasks.length)}
              </span>{' '}
              of <span className="font-semibold text-textMain">{filteredTasks.length}</span> tasks
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-full border border-borderMain bg-surface disabled:opacity-40 hover:bg-surfaceLighter text-textMain transition-colors"
              >
                Previous
              </button>
              <div className="px-3 py-1 font-semibold text-textMain">
                {currentPage} / {totalPages}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-full border border-borderMain bg-surface disabled:opacity-40 hover:bg-surfaceLighter text-textMain transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Edit/Create Modal */}
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
                <label className="block text-xs font-medium text-textMuted mb-1">Task Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  placeholder="Review proposed contract"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Customer Account *</label>
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
                <label className="block text-xs font-medium text-textMuted mb-1">Due Date & Time *</label>
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
                <label className="block text-xs font-medium text-textMuted mb-1">Description & Scope</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-2xl p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  placeholder="Specific requirements or action items..."
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-full text-sm font-medium transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface w-full max-w-sm rounded-2xl border border-borderMain p-6 shadow-xl text-center"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-textMain">Delete Task?</h3>
            <p className="text-sm text-textMuted mt-2">
              Are you sure you want to delete <span className="font-semibold text-textMain">{taskToDelete.title}</span>?
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-sm text-textMuted hover:text-textMain"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-sm font-medium transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Follow-Up Modal */}
      {showFollowUpModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface w-full max-w-md rounded-2xl border border-borderMain p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-textMain mb-2">Log Follow-Up Interaction</h2>
            <p className="text-sm text-textMuted mb-5">
              Task: <span className="font-semibold text-textMain">{selectedTask.title}</span>
            </p>
            <form className="space-y-4" onSubmit={handleFollowUpSubmit}>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Interaction Medium</label>
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
                <label className="block text-xs font-medium text-textMuted mb-1">Outcome & Notes *</label>
                <textarea
                  required
                  value={followUpData.outcome}
                  onChange={(e) => setFollowUpData({ ...followUpData, outcome: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-2xl p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  placeholder="Key discussion points, agreed next steps..."
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-full text-sm font-medium transition-colors"
                >
                  {isSubmitting ? 'Logging...' : 'Save Follow-Up'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
