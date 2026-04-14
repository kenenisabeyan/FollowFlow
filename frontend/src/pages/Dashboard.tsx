import React from 'react';
import { Bell, ArrowUpRight, ArrowDownRight, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const stats = [
    { title: "Total Customers", value: "1,248", up: true, pct: "12%" },
    { title: "Active Tasks", value: "34", up: false, pct: "2%" },
    { title: "Conversion Rate", value: "64.2%", up: true, pct: "4.1%" },
    { title: "Avg Resolution", value: "2.4h", up: true, pct: "18%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-primary-500/20 hover-lift">
          + New Follow-Up
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.title}
            className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover-lift"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">{stat.title}</h3>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
              <span className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${stat.up ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.pct}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5">
           <h2 className="text-lg font-semibold text-white mb-4">Today's Tasks</h2>
           <div className="space-y-3">
             <TaskRow title="Send proposal to TechCorp" time="10:00 AM" priority="High" done={false} />
             <TaskRow title="Follow up with Emma Watson" time="1:30 PM" priority="Medium" done={true} />
             <TaskRow title="Onboarding call setup" time="3:00 PM" priority="Low" done={false} />
             <TaskRow title="Review contract revisions" time="5:00 PM" priority="High" done={false} />
           </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/5">
           <h2 className="text-lg font-semibold text-rose-400 flex items-center gap-2 mb-4">
             <Bell size={18} /> Overdue Alerts
           </h2>
           <div className="space-y-4">
             <AlertRow msg="Global Solutions - Contract pending" days="2 days" />
             <AlertRow msg="John Smith - Missing email reply" days="1 day" />
           </div>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ title, time, priority, done }: any) {
  const pColor = priority === 'High' ? 'text-rose-400' : priority === 'Medium' ? 'text-amber-400' : 'text-gray-400';
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${done ? 'border-white/5 bg-white/5 opacity-60' : 'border-white/10 hover:border-primary-500/50 bg-surfaceLighter/50'}`}>
      <div className="flex items-center gap-3">
        {done ? <CheckCircle className="text-emerald-500" size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-500" />}
        <span className={`text-sm font-medium ${done ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold uppercase ${pColor}`}>{priority}</span>
        <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {time}</span>
      </div>
    </div>
  )
}

function AlertRow({ msg, days }: any) {
  return (
    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
      <p className="text-sm text-gray-200 font-medium mb-1">{msg}</p>
      <p className="text-xs text-rose-400 font-medium">Overdue by {days}</p>
    </div>
  )
}
