import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, RefreshCcw, XCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('notifications/', formData);
      setShowModal(false);
      setFormData({ title: '', message: '' });
      loadNotifications();
    } catch (err) {
      alert('Error creating notification. Check your backend configuration.');
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('notifications/');
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to load notifications.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: number, isRead: boolean) => {
    try {
      const response = await api.patch(`notifications/${id}/`, { is_read: !isRead });
      setNotifications((current) => current.map((n) => (n.id === id ? response.data : n)));
    } catch (err) {
      setError('Unable to update notification.');
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.is_read).map((notification) =>
          api.patch(`notifications/${notification.id}/`, { is_read: true })
        )
      );
      setNotifications((current) => current.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      setError('Unable to mark all notifications as read.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Notifications</h1>
          <p className="text-sm text-textMuted mt-1">Keep track of your follow-up alerts and system messages.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-full border border-borderMain bg-surfaceLighter px-4 py-2 text-sm text-textMain hover:border-primary-500/50 transition-colors"
          >
            <Plus size={16} /> New
          </button>
          <button
            onClick={loadNotifications}
            className="inline-flex items-center gap-2 rounded-full border border-borderMain bg-surfaceLighter px-4 py-2 text-sm text-textMain hover:border-primary-500/50 transition-colors"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-500 transition-colors"
          >
            <CheckCircle2 size={16} /> Mark all read
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-borderMain p-4">
        {loading ? (
          <div className="h-56 flex items-center justify-center text-primary-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-textMuted gap-3">
            <Bell size={36} />
            <p className="text-sm">No notifications yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`rounded-full border p-4 transition-colors ${notification.is_read ? 'border-borderMain bg-surfaceLighter' : 'border-primary-500/20 bg-primary-500/10 shadow-sm shadow-primary-500/5'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-textMain">{notification.title}</h3>
                    <p className="mt-1 text-sm text-textMain/80">{notification.message}</p>
                    <p className="mt-2 text-xs text-textMuted">{new Date(notification.created_at).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => markAsRead(notification.id, notification.is_read)}
                    className="inline-flex items-center gap-2 rounded-full border border-borderMain bg-surfaceLighter px-3 py-2 text-xs text-textMuted hover:border-primary-500/50 hover:text-textMain transition-colors"
                  >
                    <XCircle size={14} /> {notification.is_read ? 'Mark unread' : 'Mark read'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface w-full max-w-md rounded-full border border-borderMain p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-textMain mb-4">Send System Notification</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  placeholder="Alert Title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Message</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  placeholder="Notification details"
                  rows={3}
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
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
