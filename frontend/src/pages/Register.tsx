import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const parseError = (err: any) => {
    const data = err?.response?.data;
    if (!data) return 'Registration failed.';
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) => {
          const message = Array.isArray(value) ? value.join(' ') : value;
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
          return `${formattedKey}: ${message}`;
        })
        .join(' ');
    }
    return 'Registration failed.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('auth/register/', {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
      });

      const loginResponse = await api.post('auth/login/', {
        email: formData.email,
        password: formData.password,
      });

      login(loginResponse.data.access, loginResponse.data.refresh, loginResponse.data.user);
      navigate('/');
    } catch (err: any) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Create your FollowFlow account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Securely register and start managing customers, tasks, and notifications.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="glass py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-white/5">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300">First name</label>
                <input
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-surfaceLighter px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                  placeholder="Kenenisa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Last name</label>
                <input
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-surfaceLighter px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                  placeholder="Abeyan"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Username</label>
              <input
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-surfaceLighter px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                placeholder="kenenisa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-surfaceLighter px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <div className="mt-1 relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-white/10 bg-surfaceLighter px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Confirm password</label>
                <div className="mt-1 relative">
                  <input
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-white/10 bg-surfaceLighter px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-pureWhite bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {loading ? 'Registering...' : 'Create account'}
              </button>
            </div>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-300 hover:text-primary-200">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
