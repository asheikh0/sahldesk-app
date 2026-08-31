import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading, authError } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const tokenParam = searchParams.get('token')?.trim();
  const magicTokenParam = searchParams.get('magic_token')?.trim();
  const apiKeyParam = searchParams.get('api_key')?.trim();
  const adminEmailParam = searchParams.get('admin_email')?.trim();
  
  const hasValidSSOParams = Boolean(tokenParam || magicTokenParam || (apiKeyParam && adminEmailParam));

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="text-center p-8 bg-white border-2 border-red-200 shadow-lg rounded-xl max-w-lg w-full">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
          <h3 className="text-red-600 font-bold text-xl mb-4">SSO Authentication Failed</h3>
          <div className="bg-slate-100 p-4 rounded text-left overflow-auto text-sm text-slate-700 font-mono whitespace-pre-wrap">
            {authError}
          </div>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Go to standard login
          </button>
        </div>
      </div>
    );
  }

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
