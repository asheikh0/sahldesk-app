import { useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';


export default function SSOHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  // login not needed here as we reload

  useEffect(() => {
    const token = searchParams.get('token');
    const apiKey = searchParams.get('api_key');
    const target = searchParams.get('target') || '/inbox';

    if (token && apiKey) {
      // We got an SSO token from WordPress!
      localStorage.setItem('token', token);
      localStorage.setItem('apiKey', apiKey);
      
      // Clean up the URL so the token doesn't stay in the address bar
      window.history.replaceState({}, document.title, location.pathname);
      
      // Trigger a page reload to re-hydrate the auth context properly 
      // or redirect immediately since we stored it.
      window.location.href = target;
    }
  }, [searchParams, location, navigate]);

  return null;
}
