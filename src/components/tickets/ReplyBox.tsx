import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CannedResponse } from '../../types/api';
import { Paperclip, X } from 'lucide-react';
import api from '../../services/api';

interface ReplyBoxProps {
  ticketId: number;
  onReplyAdded: () => void;
}

export default function ReplyBox({ ticketId, onReplyAdded }: ReplyBoxProps) {
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const { isPro, user } = useAuth();
  const isCustomer = user?.role === 'Customer';
  const [isInternal, setIsInternal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);

  React.useEffect(() => {
    if (isPro) {
      api.get('/CannedResponses')
        .then(res => setCannedResponses(res.data))
        .catch(err => console.error(err));
    }
  }, [isPro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('isInternal', String(isInternal));
      if (file) {
        formData.append('attachment', file);
      }

      await api.post(`/Tickets/${ticketId}/comments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setContent('');
      setFile(null);
      setIsInternal(false);
      onReplyAdded();
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-3">
        {isPro && cannedResponses.length > 0 && (
          <div className="mb-2">
            <select 
              className="text-sm border-slate-300 rounded-md text-slate-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 max-w-xs"
              onChange={(e) => {
                const text = e.target.value;
                if(text) setContent(prev => prev + (prev ? '\n\n' : '') + text);
                e.target.value = "";
              }}
            >
              <option value="">{t('Insert Canned Response...')}</option>
              {cannedResponses.map(r => (
                <option key={r.id} value={r.content}>{r.title}</option>
              ))}
            </select>
          </div>
        )}
        <div className="relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={isInternal ? "Write an internal note..." : "Write a reply to the customer..."}
            className={`w-full min-h-[100px] p-3 pb-10 border rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              isInternal ? 'bg-amber-50/30 border-amber-300' : 'bg-white border-slate-300'
            }`}
            required
          />
          <div className="absolute bottom-3 left-3 text-xs text-slate-400">
            {content.length} chars
          </div>
        </div>
        
        {file && (
          <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-100 p-2 rounded w-fit rtl:space-x-reverse">
            <Paperclip size={14} />
            <span className="truncate max-w-[200px]">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-3">
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto space-x-4 sm:space-x-6 rtl:space-x-reverse">
            {!isCustomer && (
              <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={isInternal} 
                  onChange={e => setIsInternal(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <span className={isInternal ? 'font-medium text-amber-700 whitespace-nowrap text-xs sm:text-sm' : 'whitespace-nowrap text-xs sm:text-sm'}>{t('Internal Note (Staff only)')}</span>
              </label>
            )}

            <label className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
              <Paperclip size={16} />
              <span>{t('Attach File')}</span>
              <input 
                type="file" 
                className="hidden" 
                onChange={e => setFile(e.target.files?.[0] || null)}
                accept=".jpg,.jpeg,.png,.pdf"
              />
            </label>
          </div>
          
          <button 
            type="submit" 
            disabled={submitting || !content.trim()}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '...' : t('Submit Reply')}
          </button>
        </div>
      </form>
    </div>
  );
}
