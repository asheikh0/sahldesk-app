import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginDto } from '../types/api';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginDto, apiKey: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isPro: boolean;
  toggleDevPro: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(localStorage.getItem('dev_isPro') === 'true');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlApiKey = params.get('api_key');

    const handleMagicLink = async () => {
      try {
        if (urlApiKey) {
          localStorage.setItem('apiKey', urlApiKey);
        }
        
        // CRITICAL: Wipe out any old/invalid token from local storage BEFORE making the API call.
        // If we leave the GUID token in local storage, our api.ts interceptor will attach it as a Bearer token.
        // The .NET backend's JWT Middleware will crash trying to parse a GUID as a JWT, returning 401 Unauthorized,
        // which triggers our frontend interceptor to redirect to /login.
        localStorage.removeItem('token');
        setToken(null);
        
        // Exchange the GUID magic link for a real JWT
        const response = await api.post('/Users/magic-login', { token: urlToken });
        const newToken = response.data.token;
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser({ id: 1, email: response.data.name || 'admin@sahldesk.com', role: response.data.role || 'Admin' });
        
        // Clean URL after success
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        url.searchParams.delete('api_key');
        window.history.replaceState({}, document.title, url.toString());

      } catch (err) {
        console.error("Magic login failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (urlToken) {
      handleMagicLink();
    } else {
      if (token) {
        setUser({ id: 1, email: 'admin@sahldesk.com', role: 'Admin' });
      }
      setIsLoading(false);
    }
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
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, isPro, toggleDevPro }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
