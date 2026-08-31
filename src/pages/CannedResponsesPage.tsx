import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProFeatureGate from '../components/common/ProFeatureGate';
import api from '../services/api';
import { CannedResponse } from '../types/api';
import { Trash2 } from 'lucide-react';

export default function CannedResponsesPage() {
  const { isPro } = useAuth();
  const { t } = useLanguage();
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isPro) {
      api.get('/CannedResponses')
        .then(res => setResponses(res.data))
        .catch(err => console.error(err));
    }
  }, [isPro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/CannedResponses', { title, content });
      setResponses([...responses, res.data]);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/CannedResponses/${id}`);
      setResponses(responses.filter(r => r.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (!isPro) {
    return <ProFeatureGate featureName="Canned Responses" />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{t('Canned Responses')}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('Add New Response')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Title')}</label>
            <input 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Content')}</label>
            <textarea 
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            {t('Save Response')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">{t('Title')}</th>
              <th className="px-6 py-3">{t('Content')}</th>
              <th className="px-6 py-3 text-right">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {responses.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{r.title}</td>
                <td className="px-6 py-4 truncate max-w-xs">{r.content}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700">
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
