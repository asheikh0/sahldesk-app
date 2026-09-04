import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [mode, setMode] = useState<'customer' | 'staff'>('customer');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlApiKey = params.get('api_key');
    if (urlApiKey) {
      setApiKey(urlApiKey);
    }
  }, []);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await login({ email, password }, apiKey);
      navigate('/inbox');
    } catch (err) {
      setMessage('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.sahldesk.com/api/v1'}/users/request-magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, language: localStorage.getItem('language') || 'en', apiKey }),
      });
      
      if (response.ok) {
        setMessage('If your email exists in our system, a secure login link has been sent to your inbox.');
        setEmail('');
      } else {
        const errData = await response.json().catch(() => null);
        setMessage(errData?.message || 'Failed to request magic link.');
      }
    } catch (err) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">SahlDesk</h2>
          <p className="text-slate-500 mt-2">Welcome back to your support portal</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'customer' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setMode('customer'); setMessage(''); }}
          >
            Passwordless Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'staff' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setMode('staff'); setMessage(''); }}
          >
            Staff Login
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-md mb-6 text-sm ${message.includes('sent') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        {mode === 'customer' ? (
          <form onSubmit={handleCustomerLogin} className="space-y-5">
            <p className="text-sm text-slate-600 mb-4 text-center">Enter your email to receive a secure, passwordless login link.</p>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full rounded-md border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 transition-colors" placeholder="you@example.com" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-md py-2.5 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70">
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStaffLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full rounded-md border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 transition-colors" placeholder="agent@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="block w-full rounded-md border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 transition-colors" placeholder="••••••••" />
            </div>
            {/* Only show API Key input if it's not present in the URL */}
            {!new URLSearchParams(window.location.search).get('api_key') && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">API Key</label>
                <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} required className="block w-full rounded-md border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 transition-colors" placeholder="pk_..." />
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white rounded-md py-2.5 font-semibold hover:bg-slate-800 transition-colors disabled:opacity-70 mt-4">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
