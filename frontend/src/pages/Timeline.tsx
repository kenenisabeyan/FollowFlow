import React from 'react';
import { Mail, PhoneCall, FileText, CheckCircle } from 'lucide-react';

export default function Timeline() {
  const activity = [
    { id: 1, type: 'status', label: 'Stark Ind moved to Closed', time: '10 mins ago', user: 'Kenenisa', icon: <CheckCircle className="text-emerald-500" size={16}/> },
    { id: 2, type: 'note', label: 'Meeting note added', desc: '"Client prefers strict SLA"', time: '2 hours ago', user: 'John', icon: <FileText className="text-blue-400" size={16}/> },
    { id: 3, type: 'call', label: 'Discovery Call completed', desc: 'Duration: 45m', time: 'Yesterday', user: 'Kenenisa', icon: <PhoneCall className="text-purple-400" size={16}/> },
    { id: 4, type: 'email', label: 'Proposal sent to Bruce', time: 'Oct 10', user: 'System', icon: <Mail className="text-gray-400" size={16}/> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white tracking-tight">Global Activity Timeline</h1>
      
      <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 relative">
        <div className="absolute left-10 md:left-12 top-10 bottom-10 w-px bg-white/10" />
        
        <div className="space-y-8 relative z-10">
          {activity.map((act) => (
            <div key={act.id} className="flex gap-4 md:gap-6">
              <div className="w-8 h-8 rounded-full bg-surfaceLighter border border-white/20 flex items-center justify-center shrink-0 mt-1 shadow-lg">
                {act.icon}
              </div>
              <div className="flex-1 bg-surfaceLighter/30 border border-white/5 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium text-gray-200">{act.label}</p>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{act.time}</span>
                </div>
                {act.desc && <p className="text-sm text-gray-400 mt-2 bg-black/20 p-2.5 rounded border border-white/5">
                  {act.desc}
                </p>}
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-[10px] text-white">
                    {act.user.charAt(0)}
                  </div>
                   <span className="text-xs text-gray-500">by {act.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
