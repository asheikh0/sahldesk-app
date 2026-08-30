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

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{t('Team Roles Management')}</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto w-full">
        <table className="w-full min-w-[550px] text-start rtl:text-end rtl:text-left ltr:text-right ltr:text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">{t('User')}</th>
              <th className="px-6 py-3">{t('Email')}</th>
              <th className="px-6 py-3">{t('Role')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{u.firstName} {u.lastName}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <select 
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="border-slate-300 rounded-md text-sm shadow-sm"
                  >
                    <option value="Admin">{t('role_admin') || 'Admin'}</option>
                    <option value="Agent">{t('role_agent') || 'Agent'}</option>
                    <option value="Customer">{t('role_customer') || 'Customer'}</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
