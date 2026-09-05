import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [mode, setMode] = useState<'customer' | 'staff'>('customer');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { login } = useAuth();
  const { language, t } = useLanguage();
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
      setMessage(t('Login failed. Please check your credentials.'));
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
      
      const data = await response.json().catch(() => null);
      if (response.ok) {
        setMessage(data?.message || t('If your email exists in our system, a secure login link has been sent to your inbox.'));
        setEmail('');
      } else {
        setMessage(data?.message || t('Failed to request magic link.'));
      }
    } catch (err) {
      setMessage(t('An error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">SahlDesk</h2>
          <p className="text-slate-500 mt-2">{t('Welcome back to your support portal')}</p>
        </div>

        {message && (
          <div className={`p-4 rounded-md mb-6 text-sm ${message.includes('sent') || message.includes('بنجاح') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        {mode === 'customer' ? (
          <form onSubmit={handleCustomerLogin} className="space-y-5">
            <p className="text-sm text-slate-600 mb-4 text-center">{t('Enter your email to receive a secure, passwordless login link.')}</p>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('Email Address')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full rounded-md border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 transition-colors" placeholder="you@example.com" dir="ltr" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-md py-2.5 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70">
              {loading ? t('Sending...') : t('Send Magic Link')}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => { setMode('staff'); setMessage(''); }} className="text-sm text-slate-500 hover:text-slate-700 transition-colors underline">
                {t('Staff Login')}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleStaffLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('Email Address')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full rounded-md border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 transition-colors" placeholder="agent@example.com" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('Password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="block w-full rounded-md border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 transition-colors" placeholder="••••••••" dir="ltr" />
            </div>
            {/* Only show API Key input if it's not present in the URL */}
            {!new URLSearchParams(window.location.search).get('api_key') && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('API Key')}</label>
                <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} required className="block w-full rounded-md border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 transition-colors" placeholder="pk_..." dir="ltr" />
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white rounded-md py-2.5 font-semibold hover:bg-slate-800 transition-colors disabled:opacity-70 mt-4">
              {loading ? t('Signing in...') : t('Sign In')}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => { setMode('customer'); setMessage(''); }} className="text-sm text-slate-500 hover:text-slate-700 transition-colors underline">
                {t('Passwordless Login')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
