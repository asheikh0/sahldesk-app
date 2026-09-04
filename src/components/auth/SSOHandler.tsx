import { useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export const SSOHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken, setAuthError } = useAuth();

  useEffect(() => {
    const rawToken = searchParams.get('token')?.trim();
    let magicToken = searchParams.get('magic_token')?.trim();
    const apiKey = searchParams.get('api_key')?.trim() || '';
    const adminEmail = searchParams.get('admin_email')?.trim();
    const adminName = searchParams.get('admin_name')?.trim();

    let directToken = undefined;
    if (rawToken) {
      if (rawToken.includes('.')) {
        directToken = rawToken;
      } else {
        magicToken = rawToken;
      }
    }

    const authenticate = async () => {
      let finalJwt = directToken;
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://api.sahldesk.com/api/v1';

        // 1. If magic_token is provided
        if (magicToken && !finalJwt) {
          const res = await axios.post(`${apiBase}/Users/magic-login`, { token: magicToken });
          if (res.data && res.data.token) {
            finalJwt = res.data.token;
          } else {
            throw new Error('Magic login succeeded but returned no token.');
          }
        }

        // 2. If embedded in WordPress with admin email & apiKey but no token
        if (!finalJwt && apiKey && adminEmail) {
          const ssoRes = await axios.post(`${apiBase}/Users/sso`, { email: adminEmail, name: adminName || 'Admin' }, { headers: { 'X-Api-Key': apiKey } });
          if (ssoRes.data && ssoRes.data.token) {
            finalJwt = ssoRes.data.token;
          } else {
            throw new Error('SSO login succeeded but returned no token.');
          }
        }

        if (finalJwt) {
          await loginWithToken(finalJwt, apiKey);
          // Success! Clear URL params
          const cleanSearch = new URLSearchParams(location.search);
          cleanSearch.delete('token');
          cleanSearch.delete('magic_token');
          cleanSearch.delete('admin_email');
          cleanSearch.delete('admin_name');
          const cleanPath = location.pathname + (cleanSearch.toString() ? `?${cleanSearch.toString()}` : '');
          navigate(cleanPath, { replace: true });
        } else {
          throw new Error('No valid token or SSO credentials provided in URL.');
        }
      } catch (err: any) {
        console.error('SSO Authentication failed:', err);
        // Extract error message clearly
        let errorMsg = err.message || 'Unknown error occurred.';
        if (err.response && err.response.data) {
          errorMsg = typeof err.response.data === 'string' 
            ? err.response.data 
            : JSON.stringify(err.response.data, null, 2);
        }
        setAuthError(`Endpoint: ${import.meta.env.VITE_API_BASE_URL || 'https://api.sahldesk.com/api/v1'}\nError: ${errorMsg}`);
        
        // DO NOT navigate away if there's an error so the user can see the error screen!
      }
    };

    if (directToken || magicToken || (apiKey && adminEmail)) {
      authenticate();
    }
  }, [searchParams]);

  return null;
};
