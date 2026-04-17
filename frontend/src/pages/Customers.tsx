import React, { useState, useEffect } from 'react';
import { Search, Edit2, Plus, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function Customers() {
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ company_name: '', contact_name: '', email: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCustomers(customers);
      return;
    }

    setFilteredCustomers(
      customers.filter((customer) =>
        customer.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('customers/');
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error('Customer API error:', error);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('customers/', formData);
      setShowModal(false);
      setFormData({ company_name: '', contact_name: '', email: '' });
      fetchCustomers();
    } catch (error) {
      alert('Error saving customer. Check your database connection.');
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Customers</h1>
          <p className="text-sm text-textMuted mt-1">Manage your customer relationships and record follow-up status.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search customers..."
              className="w-full bg-surfaceLighter border border-borderMain rounded-lg py-2 pl-9 pr-4 text-sm text-textMain focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 hover-lift"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-borderMain overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-48 text-primary-500">Loading customers...</div>
          ) : (
            <table className="w-full text-left text-sm text-textMuted">
              <thead className="bg-surfaceLighter text-textMuted uppercase text-xs font-semibold border-b border-borderMain">
                <tr>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMain">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-surfaceLighter/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surfaceLighter border border-borderMain flex items-center justify-center text-xs font-bold text-textMain">
                          {String(customer.contact_name || customer.company_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-textMain">{customer.contact_name}</div>
                          <div className="text-xs text-textMuted">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-textMain font-medium">{customer.company_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => alert('Drafting email feature coming soon.')} className="text-textMuted hover:text-textMain p-1 ml-2 transition-colors"><Mail size={16} /></button>
                      <button onClick={() => alert('Customer editing coming soon.')} className="text-textMuted hover:text-primary-500 p-1 ml-2 transition-colors"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface w-full max-w-md rounded-2xl border border-borderMain p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-textMain mb-4">Add New Customer</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Company Name</label>
                <input
                  required
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-lg p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Primary Contact Name</label>
                <input
                  required
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-lg p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-lg p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  placeholder="john@acme.com"
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
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium"
                >
                  Save Customer
                </button>
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
    New: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Contacted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Pending: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Closed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded inline-block border ${colors[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
      {status || 'New'}
    </span>
  );
}
