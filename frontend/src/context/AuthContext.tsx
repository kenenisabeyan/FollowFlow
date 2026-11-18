import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (access: string, refresh: string, userData: any) => void;
  logout: () => void;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('ff_token');
      if (token) {
        try {
          const response = await api.get('auth/me/');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('ff_token');
          localStorage.removeItem('ff_refresh');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (access: string, refresh: string, userData: any) => {
    localStorage.setItem('ff_token', access);
    localStorage.setItem('ff_refresh', refresh);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_refresh');
    setUser(null);
  };

  const updateUser = (userData: any) => {
    setUser((prev: any) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
