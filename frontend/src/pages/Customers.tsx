import React, { useState } from 'react';
import { Search, MoreVertical, Edit2, Plus, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Customers() {
  const [showModal, setShowModal] = useState(false);

  const mockCustomers = [
    { id: 1, name: "Emma Watson", email: "emma@example.com", status: "Contacted", company: "Stark Ind" },
    { id: 2, name: "Tony Smith", email: "tony@techcorp.com", status: "New", company: "TechCorp" },
    { id: 3, name: "Sarah Connor", email: "sarah@cyberdyne.com", status: "Closed", company: "Cyberdyne" },
    { id: 4, name: "Bruce Wayne", email: "bruce@wayne.enterprises", status: "Pending", company: "Wayne Ent" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Customers</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full bg-surfaceLighter border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-sm text-gray-200 focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="shrink-0 bg-primary-600 hover:bg-primary-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add 
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-gray-300 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xs font-bold text-gray-200">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-200">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{c.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-gray-400 hover:text-white p-1 ml-2"><Mail size={16} /></button>
                    <button className="text-gray-400 hover:text-primary-400 p-1 ml-2"><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Basic Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass w-full max-w-md rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Add Customer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                <input type="text" className="w-full bg-surfaceLighter border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                <input type="email" className="w-full bg-surfaceLighter border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:border-primary-500 outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium">Save Customer</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'New': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Contacted': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Pending': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Closed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded inline-block border ${colors[status] || 'bg-gray-500/10 text-gray-400'}`}>
      {status}
    </span>
  )
}
