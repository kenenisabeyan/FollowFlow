import React, { useEffect, useState } from 'react';
import { Mail, PhoneCall, FileText, CheckCircle, Bell, Calendar } from 'lucide-react';
import api from '../api/client';

export default function Timeline() {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError('');
      try {
        const [tasksRes, notificationsRes] = await Promise.all([
          api.get('tasks/'),
          api.get('notifications/'),
        ]);

        const taskEvents = tasksRes.data.map((task: any) => ({
          id: `task-${task.id}`,
          type: task.status === 'Completed' ? 'done' : 'task',
          label: `${task.title} (${task.status})`,
          desc: task.customer_detail?.company_name || task.customer,
          time: new Date(task.due_date).toLocaleString(),
          user: 'You',
          icon: task.status === 'Completed' ? <CheckCircle className="text-emerald-500" size={16} /> : <Calendar className="text-blue-400" size={16} />,
        }));

        const notificationEvents = notificationsRes.data.map((note: any) => ({
          id: `note-${note.id}`,
          type: 'notification',
          label: note.title,
          desc: note.message,
          time: new Date(note.created_at).toLocaleString(),
          user: 'System',
          icon: <Bell className="text-violet-400" size={16} />,
        }));

        const events = [...taskEvents, ...notificationEvents].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setActivity(events.slice(0, 8));
      } catch (err) {
        setError('Unable to load timeline events.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Global Activity Timeline</h1>
          <p className="text-sm text-textMuted mt-1">Live updates from tasks and notifications synced with your backend.</p>
        </div>
        <div className="text-xs uppercase tracking-[0.25em] text-textMuted">Data synced on every load</div>
      </div>

      {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-500">{error}</div>}

      <div className="bg-surface p-6 md:p-8 rounded-2xl border border-borderMain relative">
        <div className="absolute left-10 md:left-12 top-10 bottom-10 w-px bg-borderMain" />

        {loading ? (
          <div className="h-56 flex items-center justify-center text-primary-500">Loading timeline...</div>
        ) : (
          <div className="space-y-8 relative z-10">
            {activity.map((act) => (
              <div key={act.id} className="flex gap-4 md:gap-6">
                <div className="w-8 h-8 rounded-full bg-surfaceLighter border border-borderMain flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  {act.icon}
                </div>
                <div className="flex-1 bg-surfaceLighter border border-borderMain p-4 rounded-xl">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-1">
                    <p className="text-sm font-medium text-textMain">{act.label}</p>
                    <span className="text-xs text-textMuted whitespace-nowrap">{act.time}</span>
                  </div>
                  {act.desc && (
                    <p className="text-sm text-textMuted mt-2 bg-surface p-2.5 rounded-full border border-borderMain">
                      {act.desc}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-surface border border-borderMain flex items-center justify-center text-[10px] text-textMain font-bold">
                      {act.user.charAt(0)}
                    </div>
                    <span className="text-xs text-textMuted">by {act.user}</span>
                  </div>
                </div>
              </div>
            ))}
            {activity.length === 0 && <div className="text-textMuted text-center py-12">No activity available yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
