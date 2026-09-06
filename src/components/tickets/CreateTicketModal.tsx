import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Category } from '../../types/api';
import api from '../../services/api';
import { X, Paperclip, CheckCircle2, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

interface CreateTicketModalProps {
  standalone?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: () => void;
}

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated, standalone }: CreateTicketModalProps) {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<number | null>(null);

  const isRtl = language === 'ar';

  useEffect(() => {
    if (isOpen) {
      api.get('/Categories').then(res => setCategories(res.data)).catch(console.error);
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('order_id') || params.get('reference_id');
      if (orderId && !title) {
        setTitle(isRtl ? `طلب استرجاع / استفسار للطلب #${orderId}` : `Return Request / Inquiry for Order #${orderId}`);
      }
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
      
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('order_id') || params.get('reference_id');
      if (orderId) {
        formData.append('referenceId', orderId);
        formData.append('channel', 'RMA');
      }
      
      const response = await api.post('/Tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      const newTicketId = response.data?.id || response.data?.Id;

      if (standalone) {
        setCreatedTicketId(newTicketId || 1);
        onTicketCreated();
      } else {
        onTicketCreated();
        onClose();
        // Reset
        setTitle('');
        setCategoryId('');
        setPriority('Medium');
        setDescription('');
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      alert(t('An error occurred. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewTicket = () => {
    const params = new URLSearchParams(window.location.search);
    const portalUrl = params.get('portal_url');
    if (portalUrl && window.self !== window.top && window.top) {
      const sep = portalUrl.includes('?') ? '&' : '?';
      window.top.location.href = `${portalUrl}${sep}ticket_id=${createdTicketId}`;
    } else {
      window.location.href = `/tickets/${createdTicketId}`;
    }
  };

  const handleGoToPortal = () => {
    const params = new URLSearchParams(window.location.search);
    const portalUrl = params.get('portal_url');
    if (portalUrl && window.self !== window.top && window.top) {
      window.top.location.href = portalUrl;
    } else {
      window.location.href = '/inbox';
    }
  };

  const handleResetForm = () => {
    setCreatedTicketId(null);
    setTitle('');
    setCategoryId('');
    setPriority('Medium');
    setDescription('');
    setFile(null);
  };

  // SUCCESS STATE FOR EMBEDDED / STANDALONE FORM
  if (standalone && createdTicketId) {
    const params = new URLSearchParams(window.location.search);
    const portalUrl = params.get('portal_url');

    return (
      <div className="w-full min-h-[500px] bg-transparent py-6 px-4 flex justify-center items-center">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
            <CheckCircle2 size={36} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {t('Ticket Created Successfully!')}
          </h2>

          <p className="text-sm text-slate-600 max-w-sm mx-auto mb-6 leading-relaxed">
            {t('Your ticket has been received. Our support team will review it and reply by email shortly.')}
          </p>

          <div className="bg-slate-50 rounded-xl p-4 max-w-xs mx-auto border border-slate-100 mb-8">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">{t('Ticket ID')}:</span>
              <span className="font-bold text-blue-600">#{createdTicketId}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleViewTicket}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rtl:space-x-reverse px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 transition"
            >
              <span>{t('View Ticket')}</span>
              {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </button>

            {portalUrl && (
              <button
                type="button"
                onClick={handleGoToPortal}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rtl:space-x-reverse px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                <span>{t('Go to Support Portal')}</span>
                <ExternalLink size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition"
            >
              <span>{t('Open Another Ticket')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
