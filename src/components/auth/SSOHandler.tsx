import { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';


export default function SSOHandler() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  // login not needed here as we reload

  useEffect(() => {
    const token = searchParams.get('token');
    const apiKey = searchParams.get('api_key');

    if (token && apiKey) {
      // Token is already handled by AuthContext synchronously.
      // Just clean up the URL so the token doesn't stay in the address bar.
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [searchParams, location]);

  return null;
}
