import { useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export const SSOHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const directToken = searchParams.get('token');
    const magicToken = searchParams.get('magic_token');
    const apiKey = searchParams.get('api_key') || '';

    const authenticate = async () => {
      try {
        let finalJwt = directToken;

        // If magic_token is provided, exchange it via API
        if (magicToken && !directToken) {
          const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://staging-api.sahldesk.com/api/v1';
          const res = await axios.post(`${apiBase}/Users/magic-login`, { token: magicToken });
          if (res.data && res.data.token) {
            finalJwt = res.data.token;
          }
        }

        if (finalJwt) {
          await loginWithToken(finalJwt, apiKey);
          
          // Clean sensitive tokens from URL without full reload
          const cleanSearch = new URLSearchParams(location.search);
          cleanSearch.delete('token');
          cleanSearch.delete('magic_token');
          cleanSearch.delete('api_key');
          
          const cleanPath = location.pathname + (cleanSearch.toString() ? `?${cleanSearch.toString()}` : '');
          navigate(cleanPath, { replace: true });
        }
      } catch (err) {
        console.error('Magic Link / SSO Authentication failed:', err);
        navigate('/login', { replace: true });
      }
    };

    if (directToken || magicToken) {
      authenticate();
    }
  }, [searchParams]);

  return null;
};
