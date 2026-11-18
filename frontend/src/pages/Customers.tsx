import React, { useState, useEffect } from 'react';
import { Search, Edit2, Plus, Mail, Download, Trash2, Phone, Eye, ArrowRight, DollarSign, Activity, CheckCircle2, AlertCircle, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';

export default function Customers() {
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Customer 360 Summary Modal
  const [summaryCustomer, setSummaryCustomer] = useState<any | null>(null);
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    status: 'New',
    lead_value: '',
    notes: '',
  });
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<any | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let result = customers;
    if (statusFilter !== 'All') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.contact_name?.toLowerCase().includes(q) ||
          c.company_name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q)
      );
    }
    setFilteredCustomers(result);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, customers]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('customers/');
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error('Customer API error:', error);
      setAlertMsg({ type: 'error', text: 'Could not load customers. Server may be initializing.' });
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (customer: any) => {
    try {
      const response = await api.post(`customers/${customer.id}/advance-status/`);
      const updated = response.data;
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, status: updated.current_status } : c))
      );
      setAlertMsg({
        type: 'success',
        text: `Advanced ${customer.company_name} to ${updated.current_status}!`,
      });
    } catch (error) {
      setAlertMsg({ type: 'error', text: 'Failed to advance customer stage.' });
    }
  };

  const handleOpenSummary = async (customer: any) => {
    setSummaryCustomer(customer);
    setLoadingSummary(true);
    setSummaryData(null);
    try {
      const response = await api.get(`customers/${customer.id}/summary/`);
      setSummaryData(response.data);
    } catch (error) {
      setAlertMsg({ type: 'error', text: 'Could not load customer 360 summary.' });
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlertMsg(null);

    const payload = {
      ...formData,
      lead_value: formData.lead_value ? parseFloat(formData.lead_value) : 0,
    };

    try {
      if (editingCustomerId) {
        await api.patch(`customers/${editingCustomerId}/`, payload);
        setAlertMsg({ type: 'success', text: 'Customer updated successfully.' });
      } else {
        await api.post('customers/', payload);
        setAlertMsg({ type: 'success', text: 'New customer created successfully.' });
      }
      setShowModal(false);
      setEditingCustomerId(null);
      resetForm();
      fetchCustomers();
    } catch (error: any) {
      const errText = error?.response?.data?.detail || 'Failed to save customer. Please try again.';
      setAlertMsg({ type: 'error', text: errText });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      status: 'New',
      lead_value: '',
      notes: '',
    });
  };

  const handleEditCustomer = (customer: any) => {
    setFormData({
      company_name: customer.company_name || '',
      contact_name: customer.contact_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      status: customer.status || 'New',
      lead_value: customer.lead_value !== null ? String(customer.lead_value) : '',
      notes: customer.notes || '',
    });
    setEditingCustomerId(customer.id);
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    try {
      await api.delete(`customers/${customerToDelete.id}/`);
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
      setAlertMsg({ type: 'success', text: `Removed ${customerToDelete.company_name || 'customer'}.` });
    } catch (error) {
      setAlertMsg({ type: 'error', text: 'Could not delete customer.' });
    } finally {
      setCustomerToDelete(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('customers/export_csv/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customers_export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setAlertMsg({ type: 'success', text: 'CSV export completed.' });
    } catch (error) {
      console.error('Export failed:', error);
      setAlertMsg({ type: 'error', text: 'Failed to export customer CSV.' });
    }
  };

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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Customers & CRM Pipeline</h1>
          <p className="text-sm text-textMuted mt-1">Manage accounts, pipeline stages, lead values, and interaction audits.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search companies, contacts..."
              className="w-full bg-surfaceLighter border border-borderMain rounded-full py-2 pl-9 pr-4 text-sm text-textMain focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="shrink-0 bg-surfaceLighter border border-borderMain hover:bg-surface text-textMain px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => {
              setEditingCustomerId(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['All', 'New', 'Contacted', 'Pending', 'Closed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
              statusFilter === s
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-surface border border-borderMain text-textMuted hover:text-textMain'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Main Customers Table */}
      <div className="bg-surface rounded-2xl border border-borderMain overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-48 text-primary-500 font-medium">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-textMuted">No customers match your filter.</div>
          ) : (
            <table className="w-full text-left text-sm text-textMuted">
              <thead className="bg-surfaceLighter text-textMuted uppercase text-xs font-semibold border-b border-borderMain">
                <tr>
                  <th className="px-6 py-4">Account / Contact</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Lead Value</th>
                  <th className="px-6 py-4">Pipeline Stage</th>
                  <th className="px-6 py-4 text-center">Fast Track</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMain">
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-surfaceLighter/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-500/10 text-primary-600 border border-primary-500/20 flex items-center justify-center text-xs font-bold shrink-0">
                          {String(customer.contact_name || customer.company_name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-textMain">{customer.contact_name}</div>
                          <div className="text-xs text-textMuted">{customer.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-textMain font-medium">{customer.company_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-textMain">
                        ${Number(customer.lead_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {customer.status !== 'Closed' ? (
                        <button
                          onClick={() => handleAdvanceStatus(customer)}
                          className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 hover:bg-primary-600 hover:text-white transition-all inline-flex items-center gap-1 border border-primary-500/20 shadow-sm"
                          title="Advance to next sales stage"
                        >
                          <span>{customer.status === 'New' ? 'Contact →' : customer.status === 'Contacted' ? 'Qualify →' : 'Close Deal 🎉'}</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-500">Won Deal ✓</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenSummary(customer)}
                          className="text-textMuted hover:text-primary-500 p-1.5 rounded-full hover:bg-surfaceLighter transition-colors"
                          title="View 360 Summary & Audit Trail"
                        >
                          <Eye size={16} />
                        </button>
                        {customer.email && (
                          <a
                            href={`mailto:${customer.email}`}
                            className="text-textMuted hover:text-textMain p-1.5 rounded-full hover:bg-surfaceLighter transition-colors inline-block"
                            title="Draft Email"
                          >
                            <Mail size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="text-textMuted hover:text-primary-500 p-1.5 rounded-full hover:bg-surfaceLighter transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setCustomerToDelete(customer)}
                          className="text-textMuted hover:text-rose-500 p-1.5 rounded-full hover:bg-surfaceLighter transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {filteredCustomers.length > pageSize && (
          <div className="p-4 border-t border-borderMain flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-textMuted bg-surfaceLighter">
            <div>
              Showing <span className="font-semibold text-textMain">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-textMain">
                {Math.min(currentPage * pageSize, filteredCustomers.length)}
              </span>{' '}
              of <span className="font-semibold text-textMain">{filteredCustomers.length}</span> accounts
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

      {/* Customer 360 Summary Modal */}
      {summaryCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface w-full max-w-2xl rounded-2xl border border-borderMain p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-borderMain">
              <div>
                <h3 className="text-xl font-bold text-textMain flex items-center gap-2">
                  <span>{summaryCustomer.company_name}</span>
                  <StatusBadge status={summaryCustomer.status} />
                </h3>
                <p className="text-xs text-textMuted mt-0.5">Primary Contact: {summaryCustomer.contact_name} {summaryCustomer.phone ? `(${summaryCustomer.phone})` : ''}</p>
              </div>
              <button onClick={() => setSummaryCustomer(null)} className="p-1 text-textMuted hover:text-textMain">
                <X size={20} />
              </button>
            </div>

            {loadingSummary ? (
              <div className="p-12 text-center text-primary-500 font-medium">Loading account 360 summary...</div>
            ) : summaryData ? (
              <div className="space-y-6 pt-4">
                {/* Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-surfaceLighter border border-borderMain p-3 rounded-xl text-center">
                    <p className="text-xs text-textMuted">Lead Value</p>
                    <p className="text-base font-bold text-textMain mt-1">
                      ${Number(summaryData.stats?.total_lead_value || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-surfaceLighter border border-borderMain p-3 rounded-xl text-center">
                    <p className="text-xs text-textMuted">Total Tasks</p>
                    <p className="text-base font-bold text-textMain mt-1">{summaryData.stats?.total_tasks || 0}</p>
                  </div>
                  <div className="bg-surfaceLighter border border-borderMain p-3 rounded-xl text-center">
                    <p className="text-xs text-textMuted">Pending</p>
                    <p className="text-base font-bold text-amber-500 mt-1">{summaryData.stats?.pending_tasks || 0}</p>
                  </div>
                  <div className="bg-surfaceLighter border border-borderMain p-3 rounded-xl text-center">
                    <p className="text-xs text-textMuted">Completed</p>
                    <p className="text-base font-bold text-emerald-500 mt-1">{summaryData.stats?.completed_tasks || 0}</p>
                  </div>
                </div>

                {/* Audit & Activity Logs */}
                <div>
                  <h4 className="text-sm font-bold text-textMain mb-3 flex items-center gap-2">
                    <Activity size={16} className="text-primary-500" /> Recent Activity & Audit Trail
                  </h4>
                  {summaryData.recent_activity?.length > 0 ? (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {summaryData.recent_activity.map((log: any) => (
                        <div key={log.id} className="p-3 bg-surfaceLighter border border-borderMain rounded-xl text-xs flex justify-between items-start gap-3">
                          <div>
                            <span className="font-semibold text-textMain">{log.action_type}</span>
                            {log.metadata_json && (
                              <p className="text-textMuted mt-0.5">
                                {Object.entries(log.metadata_json).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                              </p>
                            )}
                          </div>
                          <div className="text-textMuted text-[10px] shrink-0 flex items-center gap-1">
                            <Clock size={12} /> {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-textMuted italic p-4 text-center bg-surfaceLighter rounded-xl">No recorded activity logs yet.</p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSummaryCustomer(null)}
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-full text-xs font-semibold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      )}

      {/* Edit/Create Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface w-full max-w-lg rounded-2xl border border-borderMain p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-textMain mb-4">
              {editingCustomerId ? 'Edit Customer Account' : 'Add New Customer Account'}
            </h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Company Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                    placeholder="Acme Global Inc"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Primary Contact Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                    placeholder="jane@acme.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                    placeholder="+1 555-0199"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Lead/Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Lead Value ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.lead_value}
                    onChange={(e) => setFormData({ ...formData, lead_value: e.target.value })}
                    className="w-full bg-surfaceLighter border border-borderMain rounded-full p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                    placeholder="15000.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Notes & Details</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-2xl p-2.5 text-sm text-textMain focus:border-primary-500 outline-none"
                  placeholder="Key account details, deal scope, requirements..."
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-full text-sm font-medium transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface w-full max-w-sm rounded-2xl border border-borderMain p-6 shadow-xl text-center"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-textMain">Delete Customer?</h3>
            <p className="text-sm text-textMuted mt-2">
              Are you sure you want to remove <span className="font-semibold text-textMain">{customerToDelete.company_name}</span>? This will also remove associated tasks.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setCustomerToDelete(null)}
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
    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full inline-block border ${colors[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
      {status || 'New'}
    </span>
  );
}
