import { Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  featureName: string;
}

export default function ProFeatureGate({ featureName }: Props) {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  
  const wpAdminRaw = localStorage.getItem('wp_admin') || new URLSearchParams(window.location.search).get('wp_admin');
  const isWordPress = !!wpAdminRaw;
  const wpUpgradeUrl = wpAdminRaw ? wpAdminRaw.replace('page=sahldesk_settings_page', 'page=sahldesk_upgrade_page') : '';
  const freemiusUrl = `https://checkout.freemius.com/product/23268/plan/39017/?billing_cycle=annual&locale=${isArabic ? 'ar' : 'en'}`;
  const finalUrl = isWordPress ? wpUpgradeUrl : freemiusUrl;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-lg shadow-sm border border-slate-100 m-6 min-h-[400px]">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Lock size={40} className="text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('This feature is available in SahlDesk Pro')} - {t(featureName)}</h2>
      <p className="text-slate-500 max-w-md mb-8">
        {t('Upgrade your plan to unlock advanced reports, canned responses, sub-statuses, and team permissions.')}
      </p>
      <a 
        href={finalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
      >
        {isWordPress ? t('Upgrade via WordPress ↗') : t('Upgrade to SahlDesk Pro')}
      </a>
    </div>
  );
}
