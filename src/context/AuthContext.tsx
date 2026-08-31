import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginDto } from '../types/api';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginDto, apiKey: string) => Promise<void>;
  loginWithToken: (token: string, apiKey: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  loading: boolean;
  isPro: boolean;
  toggleDevPro: () => void;
  authError: string | null;
  setAuthError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(localStorage.getItem('dev_isPro') === 'true');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      setUser({ id: 1, email: 'admin@sahldesk.com', role: 'Admin' });
    }
    setIsLoading(false);
  }, []); // Run once on mount

  const toggleDevPro = () => {
    const newStatus = !isPro;
    setIsPro(newStatus);
    localStorage.setItem('dev_isPro', newStatus.toString());
  };

  const login = async (data: LoginDto, apiKey: string) => {
    localStorage.setItem('apiKey', apiKey);
    const response = await api.post('/Auth/login', data);
    const newToken = response.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(response.data.user || { id: 1, email: data.email, role: 'Admin' });
    setAuthError(null);
  };

  const loginWithToken = async (newToken: string, apiKey: string) => {
    if (apiKey) localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser({ id: 1, email: 'admin@sahldesk.com', role: 'Admin' });
    setAuthError(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, loginWithToken, logout, isLoading, loading: isLoading, isPro, toggleDevPro, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
