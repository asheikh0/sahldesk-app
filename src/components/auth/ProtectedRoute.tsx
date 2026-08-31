import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const tokenParam = searchParams.get('token')?.trim();
  const magicTokenParam = searchParams.get('magic_token')?.trim();
  const apiKeyParam = searchParams.get('api_key')?.trim();
  const adminEmailParam = searchParams.get('admin_email')?.trim();
  
  const hasValidSSOParams = Boolean(tokenParam || magicTokenParam || (apiKeyParam && adminEmailParam));

  if (loading || hasValidSSOParams) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Authenticating your secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
