import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProFeatureGate from '../components/common/ProFeatureGate';
import api from '../services/api';
import { User } from '../types/api';

export default function TeamPage() {
  const { isPro } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isPro) {
      api.get('/Users')
        .then(res => setUsers(res.data))
        .catch(err => console.error(err));
    }
  }, [isPro]);

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await api.put(`/Users/${id}/role`, { role });
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
    } catch (error) {
      console.error(error);
    }
  };

  if (!isPro) {
    return <ProFeatureGate featureName="Team Roles Management" />;
  }

  const getDisplayName = (u: User) => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    if (fullName) return fullName;
    return u.email ? u.email.split('@')[0] : t('User');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{t('Team Roles Management')}</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto w-full">
        <table className="w-full min-w-[550px] text-left rtl:text-right text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left rtl:text-right font-semibold">{t('User')}</th>
              <th className="px-6 py-3 text-left rtl:text-right font-semibold">{t('Email')}</th>
              <th className="px-6 py-3 text-left rtl:text-right font-semibold">{t('Role')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map(u => {
              const displayName = getDisplayName(u);
              const initial = (displayName.charAt(0) || 'U').toUpperCase();
              const hasFullName = Boolean((u.firstName || '').trim() || (u.lastName || '').trim());

              return (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 text-left rtl:text-right align-middle">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {initial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {displayName}
                        </span>
                        {!hasFullName && (
                          <span className="text-[11px] text-slate-400 font-normal">
                            {t('No name set')}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-left rtl:text-right align-middle font-mono text-xs sm:text-sm">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 text-left rtl:text-right align-middle">
                    <select 
                      value={u.role}
                      onChange={(e) => {
                        e.currentTarget.blur();
                        handleRoleChange(u.id, e.target.value);
                      }}
                      className="border border-slate-300 rounded-md text-sm shadow-sm px-3 py-1.5 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                    >
                      <option value="Admin">{t('Admin')}</option>
                      <option value="Agent">{t('Agent')}</option>
                      <option value="Customer">{t('Customer')}</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
