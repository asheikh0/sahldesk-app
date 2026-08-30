import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProFeatureGate from '../components/common/ProFeatureGate';
import api from '../services/api';
import { TicketSubStatus } from '../types/api';
import { Trash2 } from 'lucide-react';

export default function SubStatusesPage() {
  const { isPro } = useAuth();
  const { t } = useLanguage();
  const [subStatuses, setSubStatuses] = useState<TicketSubStatus[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563eb');

  useEffect(() => {
    if (isPro) {
      api.get('/ticketsubstatuses')
        .then(res => setSubStatuses(res.data))
        .catch(err => console.error(err));
    }
  }, [isPro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/ticketsubstatuses', { name, color });
      setSubStatuses([...subStatuses, res.data]);
      setName('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/ticketsubstatuses/${id}`);
      setSubStatuses(subStatuses.filter(s => s.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (!isPro) {
    return <ProFeatureGate featureName="Ticket Sub-Statuses" />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{t('Ticket Sub-Statuses')}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('Add Sub-Status')}</h2>
        <form onSubmit={handleSubmit} className="flex space-x-4 items-end rtl:space-x-reverse">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Name')}</label>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border-slate-300 rounded-md shadow-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Color')}</label>
            <input 
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="h-10 w-14 rounded cursor-pointer" 
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 h-10 rounded-md hover:bg-blue-700">
            {t('Save')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">{t('Sub-Status')}</th>
              <th className="px-6 py-3 text-right">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {subStatuses.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
