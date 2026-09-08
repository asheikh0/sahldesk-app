import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CannedResponse } from '../../types/api';
import { Paperclip, X, Zap, ChevronDown } from 'lucide-react';
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
  const [showCannedMenu, setShowCannedMenu] = useState(false);

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
    <div className="shrink-0 bg-white border-t border-slate-200 p-3 md:p-4 z-20 shadow-lg md:shadow-none">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-3">
        {isPro && cannedResponses.length > 0 && (
          <div className="relative inline-block mb-1">
            <button
              type="button"
              onClick={() => setShowCannedMenu(!showCannedMenu)}
              className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors shadow-sm cursor-pointer"
            >
              <Zap size={14} className="text-amber-500 fill-amber-500" />
              <span>{t('Canned Responses')}</span>
              <ChevronDown size={14} className={`text-slate-500 transition-transform duration-150 ${showCannedMenu ? 'rotate-180' : ''}`} />
            </button>

            {showCannedMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowCannedMenu(false)} 
                />
                <div className="absolute left-0 rtl:left-auto rtl:right-0 bottom-full mb-1.5 w-72 sm:w-80 max-h-60 overflow-y-auto bg-white rounded-lg shadow-xl border border-slate-200 z-40 py-1 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {t('Select a response')}
                  </div>
                  {cannedResponses.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setContent(prev => prev + (prev ? '\n\n' : '') + r.content);
                        setShowCannedMenu(false);
                      }}
                      className="w-full text-left rtl:text-right px-3 py-2 hover:bg-blue-50 transition-colors flex flex-col group cursor-pointer"
                    >
                      <span className="text-sm font-medium text-slate-800 group-hover:text-blue-600 truncate">
                        {r.title}
                      </span>
                      {r.content && (
                        <span className="text-xs text-slate-400 group-hover:text-blue-500/80 truncate mt-0.5">
                          {r.content}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        <div className="relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={isInternal ? "Write an internal note..." : "Write a reply to the customer..."}
            className={`w-full min-h-[75px] md:min-h-[100px] p-3 pb-10 border rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
