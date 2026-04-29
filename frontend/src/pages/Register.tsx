import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';
import edotLogo from '../assets/edot-logo.jpg';

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
    <div className="min-h-screen bg-surfaceLighter flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sm:mx-auto sm:w-full sm:max-w-[480px] z-10"
      >
        <div className="bg-surface shadow-2xl rounded-2xl overflow-hidden border border-borderMain">
          {/* Tabs */}
          <div className="flex bg-surfaceLighter border-b border-borderMain">
            <Link to="/login" className="flex-1 text-center py-4 text-textMuted font-medium hover:text-textMain hover:bg-surface/50 transition-colors">
              Login
            </Link>
            <div className="flex-1 text-center py-4 bg-surface text-textMain font-semibold border-t-[3px] border-primary-600 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-600"></span> Register
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto flex items-center justify-center mb-4 rounded-full overflow-hidden border border-borderMain shadow-sm">
                <img src={edotLogo} alt="EDOT Logo" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-bold text-textMain tracking-tight">Welcome to FollowFlow</h2>
              <p className="text-sm text-textMuted mt-2">Create an account to manage your leads effortlessly.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <input
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="appearance-none block w-full px-4 py-3 border border-borderMain rounded-full bg-surfaceLighter text-textMain placeholder-textMuted focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <input
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="appearance-none block w-full px-4 py-3 border border-borderMain rounded-full bg-surfaceLighter text-textMain placeholder-textMuted focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div>
                <input
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 border border-borderMain rounded-full bg-surfaceLighter text-textMain placeholder-textMuted focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="Username"
                />
              </div>

              <div>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 border border-borderMain rounded-full bg-surfaceLighter text-textMain placeholder-textMuted focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="Email Address"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="appearance-none block w-full px-4 py-3 border border-borderMain rounded-full bg-surfaceLighter text-textMain placeholder-textMuted focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="appearance-none block w-full px-4 py-3 border border-borderMain rounded-full bg-surfaceLighter text-textMain placeholder-textMuted focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>

              <p className="text-center text-sm text-textMuted pt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium transition-colors">
                  Log In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
