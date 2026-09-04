import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, X } from 'lucide-react';
import GuestTicketForm from '../components/widget/GuestTicketForm';

export default function WidgetPage() {
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  
  const apiKey = searchParams.get('api_key') || '';
  const color = searchParams.get('color') || '#2563eb';
  const lang = searchParams.get('lang') || 'en';

  useEffect(() => {
    // Notify parent window to resize iframe based on state
    if (window.parent && window.parent !== window) {
      if (isOpen) {
        window.parent.postMessage({ type: 'SAHLDESK_RESIZE', width: 380, height: 600 }, '*');
      } else {
        window.parent.postMessage({ type: 'SAHLDESK_RESIZE', width: 80, height: 80 }, '*');
      }
    }
  }, [isOpen]);

  // Set direction based on language
  const isRtl = lang.startsWith('ar');
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-end p-4">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden pointer-events-auto flex flex-col mb-4 max-h-[500px] w-full" style={{ alignSelf: isRtl ? 'flex-start' : 'flex-end', maxWidth: '350px' }}>
          <div className="px-4 py-3 flex justify-between items-center text-white" style={{ backgroundColor: color }}>
            <h3 className="font-semibold text-sm">
              {isRtl ? 'تواصل معنا' : 'Contact Us'}
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-50">
            <GuestTicketForm apiKey={apiKey} lang={lang} onSuccess={() => setIsOpen(false)} />
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto rounded-full w-14 h-14 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: color, alignSelf: isRtl ? 'flex-start' : 'flex-end' }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
