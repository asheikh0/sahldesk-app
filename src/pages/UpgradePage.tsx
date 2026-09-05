import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Check, X, Sparkles, Shield, Lock, Star } from 'lucide-react';

export default function UpgradePage() {
  const { t, language } = useLanguage();
  const { user, isPro } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [loading, setLoading] = useState(false);

  const isArabic = language === 'ar';

  const handleUpgrade = async () => {
    if (isPro) return;
    setLoading(true);
    const checkoutUrl = `https://checkout.freemius.com/product/23268/plan/39017/?billing_cycle=${billingCycle}&locale=${isArabic ? 'ar' : 'en'}${user?.email ? '&user_email=' + encodeURIComponent(user.email) : ''}`;

    const isEmbedded = window.self !== window.top;
    if (isEmbedded) {
      // In embedded iframe, cross-origin security prevents modal from capturing top window.
      // Open the official Freemius hosted checkout directly in a new tab for seamless payment.
      window.open(checkoutUrl, '_blank');
      setLoading(false);
      return;
    }

    try {
      if (!(window as any).FS?.Checkout) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.freemius.com/checkout.js';
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error('Failed to load checkout script'));
          document.body.appendChild(script);
        });
      }

      const FS = (window as any).FS;
      const handler = FS.Checkout.configure({
        plugin_id: '23268',
        plan_id: '39017',
        public_key: 'pk_22da665e521f5fdea813737e64420',
        image: 'https://sahldesk.com/logo.png'
      });

      handler.open({
        name: 'SahlDesk Pro',
        licenses: 1,
        billing_cycle: billingCycle,
        locale: isArabic ? 'ar' : 'en',
        user_email: user?.email,
        user_name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
      });
    } catch (err) {
      console.error('Freemius checkout load error, falling back to direct checkout URL:', err);
      window.open(checkoutUrl, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200">
            <Sparkles size={14} /> SahlDesk Pro
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {t('Upgrade to SahlDesk Pro')}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('Unlock full analytics, canned responses, team agent roles, and WooCommerce RMA returns.')}
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-200/80 rounded-xl border border-slate-300">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('Monthly')}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{t('Yearly')}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                billingCycle === 'annual'
                  ? 'bg-blue-800 text-blue-100'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {t('Save 20%')}
              </span>
            </button>
          </div>

          {billingCycle === 'annual' && (
            <p className="text-xs text-emerald-600 font-medium mt-2">
              ✨ {t('Save $48/year with annual billing')}
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                  {t('Current Plan')}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{t('Free')}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">$0</span>
                <span className="text-sm font-medium text-slate-500">{t('/ forever')}</span>
              </div>

              <div className="h-px bg-slate-100 my-6" />

              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-emerald-500 flex-shrink-0" />
                  <span>{t('Unlimited Tickets & Categories')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-emerald-500 flex-shrink-0" />
                  <span>{t('Floating Support Widget')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-emerald-500 flex-shrink-0" />
                  <span>{t('WooCommerce Order History Sync')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-emerald-500 flex-shrink-0" />
                  <span>{t('Single Agent / Admin')}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <X size={18} className="flex-shrink-0" />
                  <span className="line-through">{t('Analytics & Reports')}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <X size={18} className="flex-shrink-0" />
                  <span className="line-through">{t('Canned Responses')}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <X size={18} className="flex-shrink-0" />
                  <span className="line-through">{t('1-Click WooCommerce RMA Returns')}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <button
                type="button"
                disabled
                className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm cursor-not-allowed text-center"
              >
                {t('Active Plan')}
              </button>
            </div>
          </div>

          {/* Pro Card */}
          <div className="bg-white rounded-2xl border-2 border-blue-600 p-8 shadow-xl relative flex flex-col justify-between ring-4 ring-blue-50">
            <div className="absolute -top-3.5 right-6 rtl:right-auto rtl:left-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <Star size={12} fill="currentColor" /> {t('Most Popular')}
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {t('Pro')}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">SahlDesk Pro</h3>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                  {billingCycle === 'annual' ? '$15.99' : '$19.99'}
                </span>
                <span className="text-sm font-medium text-slate-500">{t('/ month')}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {billingCycle === 'annual' ? t('Billed annually') : t('Billed monthly')}
              </p>

              <div className="h-px bg-slate-100 my-6" />

              <ul className="space-y-3.5 text-sm text-slate-800">
                <li className="flex items-center gap-3 font-semibold text-blue-900">
                  <Check size={18} className="text-blue-600 flex-shrink-0" />
                  <span>{t('Everything in Free')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-blue-600 flex-shrink-0" />
                  <span>{t('1-Click WooCommerce RMA Returns')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-blue-600 flex-shrink-0" />
                  <span>{t('Reports & Analytics Charts')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-blue-600 flex-shrink-0" />
                  <span>{t('Canned Quick Responses')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-blue-600 flex-shrink-0" />
                  <span>{t('Multi-Agent Team Roles')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-blue-600 flex-shrink-0" />
                  <span>{t('Custom Sub-Statuses')}</span>
                </li>
                <li className="flex items-center gap-3 font-medium text-indigo-900">
                  <Sparkles size={18} className="text-indigo-600 flex-shrink-0" />
                  <span>{t('AI Copilot & Priority Support')}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 space-y-3">
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={loading || isPro}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                  isPro
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl shadow-blue-500/25 active:scale-[0.99]'
                }`}
              >
                {loading ? (
                  <span>{t('Processing...')}</span>
                ) : isPro ? (
                  <span>{t('Active Plan')}</span>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>{t('Upgrade to Pro')}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2">
                <span className="flex items-center gap-1">
                  <Shield size={14} className="text-emerald-600" /> {t('30-Day Money Back Guarantee')}
                </span>
                <span className="flex items-center gap-1">
                  <Lock size={14} className="text-slate-400" /> {t('Secure Checkout via Freemius')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
