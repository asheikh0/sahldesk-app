import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.sahldesk.com/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const apiKey = localStorage.getItem('apiKey');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (apiKey) {
    config.headers['X-Api-Key'] = apiKey;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/Auth/login') || url.includes('request-magic-link') || url.includes('/Auth/magic-login');
      const isOnLoginPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/login');

      // Do NOT reload or redirect if this is an authentication attempt or if user is already on the login page
      if (!isAuthEndpoint && !isOnLoginPage) {
        localStorage.removeItem('token');
        const currentSearch = window.location.search;
        window.location.href = `/login${currentSearch}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
