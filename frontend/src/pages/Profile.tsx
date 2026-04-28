import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Save, LogOut } from 'lucide-react';
import api from '../api/client';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Backend is RetrieveUpdateAPIView at auth/me/
      const response = await api.patch('auth/me/', formData);
      setMessage('Profile updated successfully!');
      // Update local storage or just let context refetch next time
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Ideally we would update the context here if we exposed a setUser method
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">My Profile</h1>
        <p className="text-sm text-textMuted mt-1">Manage your account details and preferences.</p>
      </div>

      {message && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-500">
          {message}
        </div>
      )}
      
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-500">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-borderMain overflow-hidden"
      >
        <div className="p-6 sm:p-10 border-b border-borderMain bg-gradient-to-br from-primary-500/10 to-transparent flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-surface shrink-0">
            {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-textMain">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}</h2>
            <p className="text-textMuted flex items-center justify-center sm:justify-start gap-2 mt-1"><Mail size={16}/> {user?.email}</p>
            <p className="text-xs font-semibold px-2 py-1 bg-surfaceLighter border border-borderMain rounded-full inline-block mt-3 text-textMain">@{user?.username}</p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full bg-surfaceLighter border border-borderMain rounded-full py-2.5 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-surfaceLighter border border-borderMain rounded-full py-2.5 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-surfaceLighter border border-borderMain rounded-full py-2.5 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-borderMain">
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
              >
                <LogOut size={18} /> Sign Out
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm"
              >
                {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
