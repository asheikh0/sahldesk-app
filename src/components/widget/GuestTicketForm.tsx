import { useState, FormEvent } from 'react';
import axios from 'axios';
import { Paperclip, X } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

interface GuestTicketFormProps {
  apiKey: string;
  lang: string;
  onSuccess: () => void;
}

export default function GuestTicketForm({ apiKey, lang, onSuccess }: GuestTicketFormProps) {
  const [email, setEmail] = useState('');
  const [issue, setIssue] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isRtl = lang.startsWith('ar');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError(isRtl ? 'الرجاء إكمال التحقق الأمني' : 'Please complete the security check.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('issue', issue);
      if (name) formData.append('name', name);
      if (phone) formData.append('phoneNumber', phone);
      if (file) formData.append('attachment', file);
      formData.append('language', lang);
      formData.append('turnstileToken', turnstileToken);

      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.sahldesk.com/api/v1';
      
      await axios.post(`${baseURL}/Tickets/CreateGuestTicket`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Api-Key': apiKey,
          'X-Client-Language': lang
        }
      });
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
      
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || (isRtl ? 'حدث خطأ. حاول مرة أخرى.' : 'Failed to submit. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 text-center text-green-600 flex flex-col items-center justify-center h-full">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        <p className="font-medium text-lg">{isRtl ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent!'}</p>
        <p className="text-sm mt-2 text-slate-600">{isRtl ? 'سنقوم بالرد عليك عبر البريد الإلكتروني قريباً.' : 'We will reply to your email shortly.'}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{isRtl ? 'الاسم (اختياري)' : 'Name (Optional)'}</label>
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{isRtl ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}</label>
        <input 
          type="tel" 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{isRtl ? 'كيف يمكننا مساعدتك؟' : 'How can we help?'}</label>
        <textarea 
          value={issue} 
          onChange={e => setIssue(e.target.value)} 
          required 
          rows={4} 
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
        ></textarea>
      </div>

      <div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
            <Paperclip size={16} />
            <span>{isRtl ? 'إرفاق ملف' : 'Attach File'}</span>
            <input 
              type="file" 
              className="hidden" 
              onChange={e => setFile(e.target.files?.[0] || null)} 
            />
          </label>
          {file && (
            <div className="flex items-center text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-md overflow-hidden">
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button type="button" onClick={() => setFile(null)} className="ml-2 rtl:mr-2 rtl:ml-0 text-slate-400 hover:text-red-500 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center my-4">
        <Turnstile 
          siteKey="0x4AAAAAAEnoGg0WbVLdUM4l"
          onSuccess={(token) => setTurnstileToken(token)}
          onError={() => setError(isRtl ? 'فشل التحقق الأمني' : 'Security check failed')}
          options={{ theme: 'light' }}
        />
      </div>

      <button 
        type="submit" 
        disabled={submitting || !turnstileToken} 
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
      >
        {submitting ? (isRtl ? 'جاري الإرسال...' : 'Sending...') : (isRtl ? 'إرسال الرسالة' : 'Send Message')}
      </button>
    </form>
  );
}
