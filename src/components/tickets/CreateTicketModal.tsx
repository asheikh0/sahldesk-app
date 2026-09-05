import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Category } from '../../types/api';
import api from '../../services/api';
import { X, Paperclip } from 'lucide-react';

interface CreateTicketModalProps {
  standalone?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: () => void;
}

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated, standalone }: CreateTicketModalProps) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/Categories').then(res => setCategories(res.data)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priority', priority);
      
      const cat = categories.find(c => c.id.toString() === categoryId);
      if (cat) formData.append('category', cat.name);
      
      if (file) formData.append('attachment', file);
      
      await api.post('/Tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      
      onTicketCreated();
      onClose();
      // Reset
      setTitle('');
      setCategoryId('');
      setPriority('Medium');
      setDescription('');
      setFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={standalone ? "w-full min-h-screen bg-transparent py-4 px-2 sm:px-4 flex justify-center items-start" : "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"}>
      <div className={standalone ? "w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col my-auto sm:my-2" : "bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"}>
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">{t('New Ticket')}</h2>
          {!standalone && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
        
        <form id="createTicketForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Subject')}</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('Category')}</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required>
                <option value="">{t('Select Category')}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('Priority')}</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Low">{t('Low')}</option>
                <option value="Medium">{t('Medium')}</option>
                <option value="High">{t('High')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Description')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Attachment')}</label>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
                <Paperclip size={16} />
                <span>{t('Attach File')}</span>
                <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              </label>
              {file && (
                <div className="flex items-center text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-md">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button type="button" onClick={() => setFile(null)} className="ml-2 rtl:mr-2 rtl:ml-0 text-slate-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
        
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3 rtl:space-x-reverse">
          {!standalone && <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-md transition-colors">{t('Cancel')}</button>}
          <button type="submit" form="createTicketForm" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50">
            {submitting ? '...' : t('Create Ticket')}
          </button>
        </div>
      </div>
    </div>
  );
}
