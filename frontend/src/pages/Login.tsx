import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';
import edotLogo from '../assets/edot-logo.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="light min-h-screen bg-surfaceLighter flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden text-textMain">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sm:mx-auto sm:w-full sm:max-w-[440px] z-10"
      >
        <div className="bg-surface shadow-2xl rounded-2xl overflow-hidden border border-borderMain">
          {/* Tabs */}
          <div className="flex bg-surfaceLighter border-b border-borderMain">
            <div className="flex-1 text-center py-4 bg-surface text-textMain font-semibold border-t-[3px] border-primary-600 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-600"></span> Login
            </div>
            <Link to="/register" className="flex-1 text-center py-4 text-textMuted font-medium hover:text-textMain hover:bg-surface/50 transition-colors">
              Register
            </Link>
          </div>

          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto flex items-center justify-center mb-4 rounded-full overflow-hidden border border-borderMain shadow-sm">
                <img src={edotLogo} alt="EDOT Logo" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-bold text-textMain tracking-tight">Welcome to FollowFlow</h2>
              <p className="text-sm text-textMuted mt-2">Manage your leads and clients effortlessly.</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-borderMain rounded-full bg-surfaceLighter text-textMain placeholder-textMuted focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="Email or Username"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-borderMain rounded bg-surfaceLighter"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-textMuted">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Log In
                </button>
              </div>
              
              <p className="text-center text-sm text-textMuted pt-4">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium transition-colors">
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
