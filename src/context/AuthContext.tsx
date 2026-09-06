import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  setIsPro: (isPro: boolean) => void;
  refreshPlan: () => Promise<void>;
  toggleDevPro: () => void;
  authError: string | null;
  setAuthError: (error: string | null) => void;
}

const decodeToken = (token: string): User | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const claims = JSON.parse(jsonPayload);
    return {
      id: claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || claims.sub || 1,
      email: claims.email || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 'user@example.com',
      role: claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || claims.role || 'Customer'
    };
  } catch (e) {
    console.error('Failed to decode token', e);
    return null;
  }
};

const getInitialProStatus = (): boolean => {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('is_pro')) {
      const fromUrl = searchParams.get('is_pro') === '1' || searchParams.get('is_pro') === 'true';
      localStorage.setItem('is_pro', fromUrl ? 'true' : 'false');
      return fromUrl;
    }
  } catch {}
  return localStorage.getItem('is_pro') === 'true' || localStorage.getItem('dev_isPro') === 'true';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsProState] = useState<boolean>(getInitialProStatus);
  const [authError, setAuthError] = useState<string | null>(null);

  const setIsPro = (status: boolean) => {
    setIsProState(status);
    localStorage.setItem('is_pro', status ? 'true' : 'false');
  };

  const refreshPlan = useCallback(async () => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const currentToken = localStorage.getItem('token');
      if (!apiKey && !currentToken) return;

      const response = await api.get('/Companies/plan');
      if (response.data) {
        const planIsPro = response.data.plan?.toLowerCase() === 'pro' || response.data.isPro === true;
        setIsProState(planIsPro);
        localStorage.setItem('is_pro', planIsPro ? 'true' : 'false');
      }
    } catch (err) {
      console.warn('Failed to sync plan status with backend:', err);
    }
  }, []);

  useEffect(() => {
    if (token) {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        setUser(decodedUser);
      } else {
        setUser({ id: 1, email: 'admin@sahldesk.com', role: 'Admin' });
      }
      refreshPlan();
    } else {
      const apiKey = localStorage.getItem('apiKey');
      if (apiKey) {
        refreshPlan();
      }
    }
    setIsLoading(false);
  }, [token, refreshPlan]);

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
    const decodedUser = decodeToken(newToken);
    setUser(decodedUser || response.data.user || { id: 1, email: data.email, role: 'Admin' });
    setAuthError(null);
    await refreshPlan();
  };

  const loginWithToken = async (newToken: string, apiKey: string) => {
    if (apiKey) localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const decodedUser = decodeToken(newToken);
    setUser(decodedUser || { id: 1, email: 'admin@sahldesk.com', role: 'Admin' });
    setAuthError(null);
    await refreshPlan();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!token, 
      login, 
      loginWithToken, 
      logout, 
      isLoading, 
      loading: isLoading, 
      isPro, 
      setIsPro, 
      refreshPlan, 
      toggleDevPro, 
      authError, 
      setAuthError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
