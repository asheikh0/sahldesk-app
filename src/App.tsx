import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import InboxPage from './pages/InboxPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import CategoriesPage from './pages/CategoriesPage';
import SSOHandler from './components/auth/SSOHandler';
import { LogOut, Globe, Tag, Inbox, Menu, X } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { logout, user } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}>
        <div className="p-4 text-xl font-bold border-b border-slate-800 flex justify-between items-center">
          <span>SahlDesk App</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/inbox" className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-slate-800 text-white font-medium rtl:space-x-reverse">
            <Inbox size={18} /> <span>{t('Inbox')}</span>
          </Link>
          <Link to="/categories" className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-slate-800 text-white font-medium rtl:space-x-reverse">
            <Tag size={18} /> <span>{t('Categories')}</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800 text-sm flex flex-col space-y-3">
          <div className="text-slate-400">{user?.email}</div>
          <button onClick={toggleLanguage} className="flex items-center space-x-2 hover:text-white transition-colors text-slate-300 rtl:space-x-reverse">
            <Globe size={16} /> <span>{language === 'en' ? 'عربي' : 'English'}</span>
          </button>
          <button onClick={logout} className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors rtl:space-x-reverse">
            <LogOut size={16} /> <span>{t('Sign Out')}</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* Mobile Header */ }
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center shadow-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 hover:text-slate-900">
            <Menu size={24} />
          </button>
          <span className="mx-4 font-semibold text-slate-800">SahlDesk App</span>
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <SSOHandler />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/inbox" element={<ProtectedRoute><AppShell><InboxPage /></AppShell></ProtectedRoute>} />
            <Route path="/tickets/:id" element={<ProtectedRoute><AppShell><TicketDetailsPage /></AppShell></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><AppShell><CategoriesPage /></AppShell></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/inbox" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
