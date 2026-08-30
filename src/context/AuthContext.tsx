import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginDto } from '../types/api';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginDto, apiKey: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlApiKey = params.get('api_key');
    if (urlToken && urlApiKey) {
      localStorage.setItem('token', urlToken);
      localStorage.setItem('apiKey', urlApiKey);
      return urlToken;
    }
    return localStorage.getItem('token');
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, verify token with API /me endpoint here.
    // For now, if we have a token, we assume logged in.
    if (token) {
      setUser({ id: 1, email: 'admin@sahldesk.com', role: 'Admin' });
    }
    setIsLoading(false);
  }, [token]);

  const login = async (data: LoginDto, apiKey: string) => {
    localStorage.setItem('apiKey', apiKey);
    const response = await api.post('/Auth/login', data);
    const newToken = response.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(response.data.user || { id: 1, email: data.email, role: 'Admin' });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
