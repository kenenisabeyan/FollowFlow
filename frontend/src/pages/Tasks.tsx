import React from 'react';
import { Calendar, AlertCircle, CheckCircle2, Circle } from 'lucide-react';

export default function Tasks() {
  const tasks = [
    { id: 1, title: "Review Cyberdyne contract", customer: "Sarah Connor", status: "Overdue", date: "Yesterday, 3:00 PM" },
    { id: 2, title: "Send revised proposal", customer: "Tony Smith", status: "Pending", date: "Today, 11:30 AM" },
    { id: 3, title: "Initial discovery call", customer: "Bruce Wayne", status: "Pending", date: "Tomorrow, 2:00 PM" },
    { id: 4, title: "Welcome email sent", customer: "Emma Watson", status: "Done", date: "Oct 12, 9:00 AM" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Tasks & Follow-Ups</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Column title="Pending" color="border-amber-500/30" tasks={tasks.filter(t => t.status === 'Pending')} />
        <Column title="Overdue" color="border-rose-500/30" tasks={tasks.filter(t => t.status === 'Overdue')} />
        <Column title="Done" color="border-emerald-500/30" tasks={tasks.filter(t => t.status === 'Done')} />
      </div>
    </div>
  );
}

function Column({ title, color, tasks }: { title: string, color: string, tasks: any[] }) {
  return (
    <div className={`glass rounded-2xl p-5 border-t-4 ${color}`}>
      <h2 className="text-sm font-semibold text-gray-300 mb-4">{title} ({tasks.length})</h2>
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="bg-surfaceLighter border border-white/5 p-4 rounded-xl hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="mt-0.5 shrink-0">
                {task.status === 'Done' ? <CheckCircle2 size={16} className="text-emerald-400" /> : 
                 task.status === 'Overdue' ? <AlertCircle size={16} className="text-rose-400" /> : 
                 <Circle size={16} className="text-gray-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === 'Done' ? 'text-gray-500 line-through' : 'text-gray-200'} truncate`}>
                  {task.title}
                </p>
                <span className="text-xs text-primary-400 font-medium block mt-1">{task.customer}</span>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                  <Calendar size={12} /> {task.date}
                </div>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <div className="text-sm text-gray-500 text-center py-4">No tasks</div>}
      </div>
    </div>
  )
}
