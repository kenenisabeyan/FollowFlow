import React, { useState, useEffect } from 'react';
import { Search, Edit2, Plus, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function Customers() {
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({ company_name: '', contact_name: '', email: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('customers/');
      setCustomers(response.data);
    } catch (error) {
      console.error("API Error, utilizing fallback mockup metrics.", error);
      // Failsafe for UI preview without MySQL DB launched yet
      setCustomers([
        { id: 1, contact_name: "Emma Watson", email: "emma@example.com", status: "Contacted", company_name: "Stark Ind" },
        { id: 2, contact_name: "Tony Smith", email: "tony@techcorp.com", status: "New", company_name: "TechCorp" },
        { id: 3, contact_name: "Bruce Wayne", email: "bruce@wayne.enterprises", status: "Pending", company_name: "Wayne Ent" },
      ]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('customers/', formData);
      setShowModal(false);
      fetchCustomers(); // Refresh grid
    } catch (error) {
      alert("Error saving customer. Check your database connection.");
      setShowModal(false);
    }
  };

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
            className="shrink-0 bg-primary-600 hover:bg-primary-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 hover-lift"
          >
            <Plus size={16} /> Add 
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex justify-center items-center h-48 text-primary-400">Loading Client Matrix...</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-white/5 text-gray-300 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Dynamic Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xs font-bold text-gray-200">
                          {c.contact_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-200">{c.contact_name}</div>
                          <div className="text-xs text-gray-500">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-medium">{c.company_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-gray-400 hover:text-white p-1 ml-2 transition-colors"><Mail size={16} /></button>
                      <button className="text-gray-400 hover:text-primary-400 p-1 ml-2 transition-colors"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Modal Form Bound to Axios */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass w-full max-w-md rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Add New Customer</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Company Name</label>
                <input required type="text" onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full bg-surfaceLighter border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:border-primary-500 outline-none" placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Primary Contact Name</label>
                <input required type="text" onChange={e => setFormData({...formData, contact_name: e.target.value})} className="w-full bg-surfaceLighter border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:border-primary-500 outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                <input type="email" onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surfaceLighter border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:border-primary-500 outline-none" placeholder="john@acme.com" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium">Save Customer</button>
              </div>
            </form>
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
