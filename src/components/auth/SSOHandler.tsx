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
    const directToken = searchParams.get('token')?.trim();
    const magicToken = searchParams.get('magic_token')?.trim();
    const apiKey = searchParams.get('api_key')?.trim() || '';
    const adminEmail = searchParams.get('admin_email')?.trim();
    const adminName = searchParams.get('admin_name')?.trim();

    const authenticate = async () => {
      try {
        let finalJwt = directToken;
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://staging-api.sahldesk.com/api/v1';

        // 1. If magic_token is provided
        if (magicToken && !finalJwt) {
          const res = await axios.post(`${apiBase}/Users/magic-login`, { token: magicToken });
          if (res.data && res.data.token) {
            finalJwt = res.data.token;
          }
        }

        // 2. If embedded in WordPress with admin email & apiKey but no token
        if (!finalJwt && apiKey && adminEmail) {
          const ssoRes = await axios.post(`${apiBase}/Users/sso`, { email: adminEmail, name: adminName || 'Admin' }, { headers: { 'X-Api-Key': apiKey } });
          if (ssoRes.data && ssoRes.data.token) {
            finalJwt = ssoRes.data.token;
          }
        }

        if (finalJwt) {
          await loginWithToken(finalJwt, apiKey);
        }
      } catch (err) {
        console.error('SSO Authentication failed:', err);
      } finally {
        // Always strip parameters to break infinite load loops on both success and failure
        const cleanSearch = new URLSearchParams(location.search);
        cleanSearch.delete('token');
        cleanSearch.delete('magic_token');
        cleanSearch.delete('admin_email');
        cleanSearch.delete('admin_name');
        // keep api_key if needed for the app, but remove the auth triggers
        
        const cleanPath = location.pathname + (cleanSearch.toString() ? `?${cleanSearch.toString()}` : '');
        navigate(cleanPath, { replace: true });
      }
    };

    if (directToken || magicToken || (apiKey && adminEmail)) {
      authenticate();
    }
  }, [searchParams]);

  return null;
};
