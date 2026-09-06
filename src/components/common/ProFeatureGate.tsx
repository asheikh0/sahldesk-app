import { Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  featureName: string;
}

export default function ProFeatureGate({ featureName }: Props) {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const upgradeUrl = `https://checkout.freemius.com/product/23268/plan/39017/?billing_cycle=annual&locale=${isArabic ? 'ar' : 'en'}`;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-lg shadow-sm border border-slate-100 m-6 min-h-[400px]">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Lock size={40} className="text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{t(featureName)} {t('is a Pro Feature')}</h2>
      <p className="text-slate-500 max-w-md mb-8">
        {t('Unlock')} {t(featureName)} {t('and many more advanced tools by upgrading to SahlDesk Pro.')}
      </p>
      <a 
        href={upgradeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
      >
        {t('Upgrade to SahlDesk Pro')}
      </a>
    </div>
  );
}
