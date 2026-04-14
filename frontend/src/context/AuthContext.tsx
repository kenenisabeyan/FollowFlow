import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (access: string, refresh: string) => void;
  logout: () => void;
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
          // In a real app, hit /api/auth/me/ to validate specific user role
          // const response = await api.get('/auth/me/');
          // setUser(response.data);
          
          // Mock valid user for UI showcase
          setUser({ email: 'admin@followflow.com', role: 'Admin' });
        } catch (error) {
          localStorage.removeItem('ff_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (access: string, refresh: string) => {
    localStorage.setItem('ff_token', access);
    localStorage.setItem('ff_refresh', refresh);
    setUser({ email: 'admin@followflow.com', role: 'Admin' });
  };

  const logout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
