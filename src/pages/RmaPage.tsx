import { useState, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Paperclip, 
  X, 
  Globe, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function RmaPage() {
  const [searchParams] = useSearchParams();
  const { t, language, toggleLanguage } = useLanguage();

  // Extract query parameters passed by WooCommerce
  const orderId = searchParams.get('order_id') || searchParams.get('reference_id') || '';
  const apiKey = searchParams.get('api_key') || '';
  const initialEmail = searchParams.get('customer_email') || searchParams.get('email') || '';
  const initialName = searchParams.get('customer_name') || searchParams.get('name') || '';
  const returnUrl = searchParams.get('return_url') || searchParams.get('store_url') || '';

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existingTicketId, setExistingTicketId] = useState<number | null>(null);
  const [createdTicketId, setCreatedTicketId] = useState<number | null>(null);
  const [closeNotice, setCloseNotice] = useState(false);

  const isRtl = language === 'ar';

  const returnReasons = [
    { key: 'Damaged or defective item', label: t('Damaged or defective item') },
    { key: 'Wrong item received', label: t('Wrong item received') },
    { key: 'Size or fit issue', label: t('Size or fit issue') },
    { key: 'Changed mind / No longer needed', label: t('Changed mind / No longer needed') },
    { key: 'Missing parts or accessories', label: t('Missing parts or accessories') },
    { key: 'Other reason', label: t('Other reason') },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError(t('Max file size: 10MB'));
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleClose = () => {
    try {
      window.close();
    } catch (e) {
      console.log('window.close error:', e);
    }

    // If browser blocks window.close, display confirmation notice
    setTimeout(() => {
      setCloseNotice(true);
    }, 200);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError(t('Please select a return reason'));
      return;
    }
    if (!details.trim()) {
      setError(t('Please provide details about your return request'));
      return;
    }

    setSubmitting(true);
    setError('');
    setExistingTicketId(null);

    try {
      const selectedReasonObj = returnReasons.find(r => r.key === reason);
      const reasonLabel = selectedReasonObj ? selectedReasonObj.label : reason;

      const title = isRtl
        ? `طلب استرجاع للطلب #${orderId} - ${reasonLabel}`
        : `Return Request for Order #${orderId} - ${reasonLabel}`;

      const issueContent = `${t('Return Reason')}: ${reasonLabel}\n\n${t('Additional Details')}:\n${details}`;

      const formData = new FormData();
      formData.append('email', email);
      formData.append('issue', issueContent);
      formData.append('title', title);
      formData.append('category', 'Returns');
      formData.append('channel', 'RMA');
      if (orderId) formData.append('referenceId', orderId);
      if (name) formData.append('name', name);
      if (file) formData.append('attachment', file);
      formData.append('language', language);

      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.sahldesk.com/api/v1';

      const response = await axios.post(`${baseURL}/Tickets/CreateGuestTicket`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Api-Key': apiKey,
          'X-Client-Language': language
        }
      });

      const newTicketId = response.data?.ticketId || response.data?.ticket?.id || response.data?.id;
      setCreatedTicketId(newTicketId || 1);
    } catch (err: any) {
      console.error('RMA submission error:', err);
      const resData = err.response?.data;
      if (resData?.ticketId) {
        setExistingTicketId(resData.ticketId);
        setError(resData.message || t('An active return request already exists for this order'));
      } else {
        setError(resData?.message || t('An error occurred. Please try again.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Top Header Bar */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">SahlDesk</h1>
            <p className="text-xs text-slate-500">{t('Return Request')}</p>
          </div>
        </div>

        <button
          onClick={toggleLanguage}
          className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <Globe size={14} className="text-slate-400" />
          <span>{language === 'en' ? 'عربي' : 'English'}</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          {/* SUCCESS STATE */}
          {createdTicketId ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {t('Return Request Submitted!')}
              </h2>

              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                {t('Our team will review your request and get back to you by email shortly.')}
              </p>

              <div className="bg-slate-50 rounded-xl p-4 max-w-sm mx-auto border border-slate-100 mb-8 space-y-2">
                {orderId && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">{t('Order #')}:</span>
                    <span className="font-semibold text-slate-800">#{orderId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{t('Ticket ID')}:</span>
                  <span className="font-bold text-blue-600">#{createdTicketId}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{t('Customer Email')}:</span>
                  <span className="font-medium text-slate-700">{email}</span>
                </div>
              </div>

              {/* Actions Area */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                {returnUrl ? (
                  <a
                    href={returnUrl}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rtl:space-x-reverse px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 transition"
                  >
                    <span>{t('Back to Order')}</span>
                    {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rtl:space-x-reverse px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow transition"
                >
                  <X size={16} />
                  <span>{t('Close')}</span>
                </button>
              </div>

              {closeNotice && (
                <p className="mt-4 text-xs text-slate-500">
                  {t('You may now safely close this tab.')}
                </p>
              )}
            </div>
          ) : (
            /* FORM STATE */
            <div>
              {/* Card Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-300 bg-blue-900/60 px-2.5 py-1 rounded-full border border-blue-700/50 mb-2">
                      {t('1-Click WooCommerce RMA Returns')}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold">
                      {t('Return Request for Order')} {orderId ? `#${orderId}` : ''}
                    </h2>
                  </div>
                  {orderId && (
                    <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-sm font-semibold text-white">
                      📦 #{orderId}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Container */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                
                {/* Error Banner */}
                {error && (
                  <div className="p-4 rounded-xl text-sm flex items-start space-x-3 rtl:space-x-reverse bg-red-50 text-red-700 border border-red-200">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{error}</p>
                      {existingTicketId && (
                        <p className="text-xs mt-1 text-red-600">
                          {t('Ticket ID')}: #{existingTicketId}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer Details (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      {t('Customer Name')}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder={t('Name')}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      {t('Customer Email')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder={t('Email Address')}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Return Reason Select */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    {t('Return Reason')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                  >
                    <option value="">-- {t('Select a reason')} --</option>
                    {returnReasons.map(r => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Details Textarea */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    {t('Additional Details')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    required
                    rows={4}
                    placeholder={t('Describe the issue with your order...')}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none bg-white"
                  ></textarea>
                </div>

                {/* File / Proof Attachment */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    {t('Upload Photos / Proof')}
                  </label>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <label className="cursor-pointer inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition">
                      <Paperclip size={16} />
                      <span>{t('Attach File')}</span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                    </label>

                    {file && (
                      <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-xs border border-blue-200 max-w-xs truncate">
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-blue-500 hover:text-red-600 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t('Max file size: 10MB')}
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition disabled:opacity-50 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  >
                    {submitting ? (
                      <>
                        <Clock size={18} className="animate-spin" />
                        <span>{t('Submitting Return Request...')}</span>
                      </>
                    ) : (
                      <>
                        <Package size={18} />
                        <span>{t('Submit Return Request')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl w-full mx-auto text-center py-4 text-xs text-slate-400">
        <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
          <ShieldCheck size={14} className="text-slate-400" />
          <span>Powered by SahlDesk</span>
        </div>
      </footer>
    </div>
  );
}
