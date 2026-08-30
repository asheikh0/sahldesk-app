import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password }, apiKey);
      navigate('/inbox');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">SahlDesk Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">API Key</label>
            <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
