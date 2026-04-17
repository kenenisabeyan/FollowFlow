import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const parseError = (err: any) => {
    const data = err?.response?.data;
    if (!data) return 'Invalid credentials, please try again.';
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) => {
          const message = Array.isArray(value) ? value.join(' ') : value;
          return `${key}: ${message}`;
        })
        .join(' ');
    }
    return 'Invalid credentials, please try again.';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload: any = { password };
    if (email.includes('@')) {
      payload.email = email;
    } else {
      payload.username = email;
    }

    try {
      const response = await api.post('auth/login/', payload);
      login(response.data.access, response.data.refresh, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(parseError(err));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-600/20 rounded-lg-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-textMain tracking-tight">
          Sign in to FollowFlow
        </h2>
        <p className="mt-2 text-center text-sm text-textMuted">
          The intelligent customer tracking system
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-borderMain">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-textMuted">Email or username</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-borderMain rounded-full bg-surfaceLighter text-textMain placeholder-textMuted focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="admin@followflow.com or username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted">Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-borderMain rounded-full bg-surfaceLighter text-textMain placeholder-textMuted focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Sign in
              </button>
            </div>
            <p className="text-center text-sm text-textMuted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
                Register
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
