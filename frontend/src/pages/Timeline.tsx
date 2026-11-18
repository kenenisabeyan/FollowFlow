import React, { useEffect, useState } from 'react';
import { Mail, PhoneCall, FileText, CheckCircle, Bell, Calendar, Activity, Users, UserCheck } from 'lucide-react';
import api from '../api/client';

export default function Timeline() {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, notificationsRes, logsRes] = await Promise.all([
        api.get('tasks/').catch(() => ({ data: [] })),
        api.get('notifications/').catch(() => ({ data: [] })),
        api.get('activity-logs/').catch(() => ({ data: [] })),
      ]);

      const logEvents = (logsRes.data || []).map((log: any) => {
        let icon = <Activity className="text-primary-500" size={16} />;
        if (log.action_type.includes('Follow-Up')) {
          icon = <PhoneCall className="text-amber-500" size={16} />;
        } else if (log.action_type.includes('Customer')) {
          icon = <Users className="text-blue-500" size={16} />;
        } else if (log.action_type.includes('Task Completed')) {
          icon = <CheckCircle className="text-emerald-500" size={16} />;
        } else if (log.action_type.includes('Task')) {
          icon = <Calendar className="text-violet-500" size={16} />;
        }

        let desc = log.customer_name ? `Customer: ${log.customer_name}` : '';
        if (log.metadata_json) {
          if (log.metadata_json.outcome) {
            desc += ` • Note: ${log.metadata_json.outcome}`;
          } else if (log.metadata_json.task_title) {
            desc += ` • ${log.metadata_json.task_title}`;
          }
        }

        return {
          id: `log-${log.id}`,
          type: 'activity',
          label: log.action_type,
          desc: desc.trim(),
          time: new Date(log.created_at).toLocaleString(),
          rawTime: new Date(log.created_at).getTime(),
          user: log.user_name || 'System',
          icon,
        };
      });

      const taskEvents = (tasksRes.data || []).map((task: any) => ({
        id: `task-${task.id}`,
        type: task.status === 'Completed' ? 'done' : 'task',
        label: `${task.title} (${task.status})`,
        desc: task.customer_detail?.company_name || String(task.customer || ''),
        time: new Date(task.due_date).toLocaleString(),
        rawTime: new Date(task.due_date).getTime(),
        user: 'Assigned User',
        icon: task.status === 'Completed' ? <CheckCircle className="text-emerald-500" size={16} /> : <Calendar className="text-blue-400" size={16} />,
      }));

      const notificationEvents = (notificationsRes.data || []).map((note: any) => ({
        id: `note-${note.id}`,
        type: 'notification',
        label: note.title,
        desc: note.message,
        time: new Date(note.created_at).toLocaleString(),
        rawTime: new Date(note.created_at).getTime(),
        user: 'System Notification',
        icon: <Bell className="text-violet-400" size={16} />,
      }));

      const combined = [...logEvents, ...taskEvents, ...notificationEvents].sort(
        (a, b) => b.rawTime - a.rawTime
      );

      setActivity(combined.slice(0, 20));
    } catch (err) {
      setError('Unable to load timeline events.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Global Activity Timeline</h1>
          <p className="text-sm text-textMuted mt-1">Audit log of all customer engagements, task events, and system notifications.</p>
        </div>
        <button
          onClick={fetchActivity}
          className="bg-surfaceLighter border border-borderMain hover:bg-surface text-textMain px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          Refresh Feed
        </button>
      </div>

      {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-500">{error}</div>}

      <div className="bg-surface p-6 md:p-8 rounded-2xl border border-borderMain relative">
        <div className="absolute left-10 md:left-12 top-10 bottom-10 w-px bg-borderMain" />

        {loading ? (
          <div className="h-56 flex items-center justify-center text-primary-500">Loading timeline...</div>
        ) : (
          <div className="space-y-6 relative z-10">
            {activity.map((act) => (
              <div key={act.id} className="flex gap-4 md:gap-6">
                <div className="w-8 h-8 rounded-full bg-surfaceLighter border border-borderMain flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  {act.icon}
                </div>
                <div className="flex-1 bg-surfaceLighter border border-borderMain p-4 rounded-xl">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-1">
                    <p className="text-sm font-semibold text-textMain">{act.label}</p>
                    <span className="text-xs text-textMuted whitespace-nowrap">{act.time}</span>
                  </div>
                  {act.desc && (
                    <p className="text-sm text-textMuted mt-1.5 bg-surface px-3 py-2 rounded-lg border border-borderMain">
                      {act.desc}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-surface border border-borderMain flex items-center justify-center text-[10px] text-textMain font-bold">
                      {act.user.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-textMuted">by {act.user}</span>
                  </div>
                </div>
              </div>
            ))}
            {activity.length === 0 && <div className="text-textMuted text-center py-12">No activity recorded yet. Create customers or tasks to populate the feed.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
