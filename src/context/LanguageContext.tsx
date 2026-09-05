import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'Welcome back to your support portal': 'Welcome back to your support portal',
    'Passwordless Login': 'Passwordless Login',
    'Staff Login': 'Staff Login',
    'Enter your email to receive a secure, passwordless login link.': 'Enter your email to receive a secure, passwordless login link.',
    'Email Address': 'Email Address',
    'Password': 'Password',
    'API Key': 'API Key',
    'Sending...': 'Sending...',
    'Send Magic Link': 'Send Magic Link',
    'Signing in...': 'Signing in...',
    'Sign In': 'Sign In',
    'Login failed. Please check your credentials.': 'Login failed. Please check your credentials.',
    'If your email exists in our system, a secure login link has been sent to your inbox.': 'If your email exists in our system, a secure login link has been sent to your inbox.',
    'Failed to request magic link.': 'Failed to request magic link.',
    'An error occurred. Please try again.': 'An error occurred. Please try again.',

    'Inbox': 'Inbox',
    'Categories': 'Categories',
    'Sign Out': 'Sign Out',
    'Status': 'Status',
    'Open': 'Open',
    'In Progress': 'In Progress',
    'Pending': 'Pending',
    'Resolved': 'Resolved',
    'Closed': 'Closed',
    'Priority': 'Priority',
    'Low': 'Low',
    'Medium': 'Medium',
    'High': 'High',
    'Internal Note (Staff only)': 'Internal Note (Staff only)',
    'Submit Reply': 'Submit Reply',
    'Attach File': 'Attach File',
    'Add Category': 'Add Category',
    'Edit Category': 'Edit Category',
    'Category Name': 'Category Name',
    'Color': 'Color',
    'Tickets': 'Tickets',
    'Actions': 'Actions',
    'Save': 'Save',
    'Cancel': 'Cancel',
    'Delete': 'Delete',
    'Are you sure you want to delete this category?': 'Are you sure you want to delete this category?',
    'New Ticket': 'New Ticket',
    'Select Category': 'Select Category',
    'Create Ticket': 'Create Ticket',
    'All': 'All',
    'Search tickets...': 'Search tickets...',
    'Subject': 'Subject',
    'Description': 'Description',
    'Attachment': 'Attachment',
    'Unassigned': 'Unassigned',
    'Agent': 'Agent',
    'Sub-Status': 'Sub-Status',
    'Reports & Analytics': 'Reports & Analytics',
    'Timeframe': 'Timeframe',
    'Last 7 Days': 'Last 7 Days',
    'Last 30 Days': 'Last 30 Days',
    'Last 90 Days': 'Last 90 Days',
    'Last Year': 'Last Year',
    'All Time': 'All Time',
    'Total Tickets': 'Total Tickets',
    'Open Tickets': 'Open Tickets',
    'Resolved Tickets': 'Resolved Tickets',
    'Avg Resolution Time (hrs)': 'Avg Resolution Time (hrs)',
    'Ticket Volume Trend': 'Ticket Volume Trend',
    'Tickets by Status': 'Tickets by Status',
    'Category Distribution': 'Category Distribution',
    'Tickets by Priority': 'Tickets by Priority',
    'Tickets Opened': 'Tickets Opened',
    'Agent Performance': 'Agent Performance',
    'Assigned Tickets': 'Assigned Tickets',
    'Add New Response': 'Add New Response',
    'Title': 'Title',
    'Content': 'Content',
    'Save Response': 'Save Response',
    'Agent Name': 'Agent Name',
    'Assigned Count': 'Assigned Count',
    'Resolved Count': 'Resolved Count',
    'No agent performance data available yet.': 'No agent performance data available yet.',
    'Upgrade': 'Upgrade',
    'Upgrade to SahlDesk Pro': 'Upgrade to SahlDesk Pro',
    'Unlock full analytics, canned responses, team agent roles, and WooCommerce RMA returns.': 'Unlock full analytics, canned responses, team agent roles, and WooCommerce RMA returns.',
    'Monthly': 'Monthly',
    'Yearly': 'Yearly',
    'Save 20%': 'Save 20%',
    'Current Plan': 'Current Plan',
    'Active Plan': 'Active Plan',
    'Free': 'Free',
    'Pro': 'Pro',
    '/ month': '/ month',
    '/ year': '/ year',
    '/ forever': '/ forever',
    'Billed annually': 'Billed annually',
    'Billed monthly': 'Billed monthly',
    'Save $48/year with annual billing': 'Save $48/year with annual billing',
    'Unlimited Tickets & Categories': 'Unlimited Tickets & Categories',
    'Floating Support Widget': 'Floating Support Widget',
    'WooCommerce Order History Sync': 'WooCommerce Order History Sync',
    'Single Agent / Admin': 'Single Agent / Admin',
    'Analytics & Reports': 'Analytics & Reports',
    'Canned Responses': 'Canned Responses',
    '1-Click WooCommerce RMA Returns': '1-Click WooCommerce RMA Returns',
    'Everything in Free': 'Everything in Free',
    'Reports & Analytics Charts': 'Reports & Analytics Charts',
    'Canned Quick Responses': 'Canned Quick Responses',
    'Multi-Agent Team Roles': 'Multi-Agent Team Roles',
    'Custom Sub-Statuses': 'Custom Sub-Statuses',
    'AI Copilot & Priority Support': 'AI Copilot & Priority Support',
    'Upgrade to Pro': 'Upgrade to Pro',
    'Most Popular': 'Most Popular',
    '30-Day Money Back Guarantee': '30-Day Money Back Guarantee',
    'Secure Checkout via Freemius': 'Secure Checkout via Freemius',
    'Processing...': 'Processing...'
  },
    ar: {
    'Welcome back to your support portal': 'مرحباً بك مرة أخرى في بوابة الدعم الخاصة بك',
    'Passwordless Login': 'تسجيل دخول بدون كلمة مرور',
    'Staff Login': 'تسجيل دخول الموظفين',
    'Enter your email to receive a secure, passwordless login link.': 'أدخل بريدك الإلكتروني لتلقي رابط تسجيل دخول آمن وبدون كلمة مرور.',
    'Email Address': 'البريد الإلكتروني',
    'Password': 'كلمة المرور',
    'API Key': 'مفتاح API',
    'Sending...': 'جاري الإرسال...',
    'Send Magic Link': 'إرسال رابط الدخول',
    'Signing in...': 'جاري تسجيل الدخول...',
    'Sign In': 'تسجيل الدخول',
    'Login failed. Please check your credentials.': 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.',
    'If your email exists in our system, a secure login link has been sent to your inbox.': 'تم إرسال رابط الدخول إلى بريدك الإلكتروني بنجاح.',
    'Failed to request magic link.': 'فشل في طلب رابط الدخول.',
    'An error occurred. Please try again.': 'حدث خطأ. يرجى المحاولة مرة أخرى.',

    'Inbox': 'البريد الوارد',
    'Categories': 'التصنيفات',
    'Sign Out': 'تسجيل الخروج',
    'Status': 'الحالة',
    'Open': 'مفتوح',
    'In Progress': 'قيد التنفيذ',
    'Pending': 'قيد الانتظار',
    'Resolved': 'تم الحل',
    'Closed': 'مغلق',
    'Priority': 'الأولوية',
    'Low': 'منخفض',
    'Medium': 'متوسط',
    'High': 'عالي',
    'Internal Note (Staff only)': 'ملاحظة داخلية',
    'Submit Reply': 'إرسال الرد',
    'Attach File': 'إرفاق ملف',
    'Add Category': 'إضافة تصنيف',
    'Edit Category': 'تعديل التصنيف',
    'Category Name': 'اسم التصنيف',
    'Color': 'اللون',
    'Actions': 'الإجراءات',
    'Save': 'حفظ',
    'Cancel': 'إلغاء',
    'Delete': 'حذف',
    'Are you sure you want to delete this category?': 'هل أنت متأكد من حذف هذا التصنيف؟',
    'New Ticket': 'تذكرة جديدة',
    'Select Category': 'اختر التصنيف',
    'Create Ticket': 'إنشاء تذكرة',
    'All': 'الكل',
    'Search tickets...': 'ابحث في التذاكر...',
    'Subject': 'الموضوع',
    'Description': 'الوصف',
    'Attachment': 'مرفق',
    'Unassigned': 'غير معين',
    'Agent': 'الموظف',
    'Sub-Status': 'الحالة الفرعية',
    'Reports': 'التقارير',
    'Canned Responses': 'الردود الجاهزة',
    'Sub-Statuses': 'الحالات الفرعية',
    'Team': 'فريق العمل',
    'Customer Profile': 'ملف العميل',
    'Name': 'الاسم',
    'Email': 'البريد الإلكتروني',
    'ID': 'المعرف',
    'Subject & Details': 'الموضوع والتفاصيل',
    'Customer / Agent': 'العميل / الموظف',
    'Date': 'التاريخ',
    'Parent Status': 'الحالة الأساسية',
    'Add Sub-Status': 'إضافة حالة فرعية',
    'Reports & Analytics': 'التقارير والتحليلات',
    'Timeframe': 'الإطار الزمني',
    'Last 7 Days': 'آخر 7 أيام',
    'Last 30 Days': 'آخر 30 يوم',
    'Last 90 Days': 'آخر 90 يوم',
    'Last Year': 'العام الماضي',
    'All Time': 'كل الوقت',
    'Total Tickets': 'إجمالي التذاكر',
    'Open Tickets': 'التذاكر المفتوحة',
    'Resolved Tickets': 'التذاكر المحلولة',
    'Avg Resolution Time (hrs)': 'متوسط وقت الحل (ساعات)',
    'Ticket Volume Trend': 'اتجاه حجم التذاكر',
    'Tickets by Status': 'التذاكر حسب الحالة',
    'Category Distribution': 'توزيع التصنيفات',
    'Tickets by Priority': 'التذاكر حسب الأولوية',
    'Tickets Opened': 'التذاكر المفتوحة',
    'Agent Performance': 'أداء الموظفين',
    'Assigned Tickets': 'التذاكر المعينة',
    'Add New Response': 'إضافة رد جديد',
    'Title': 'العنوان',
    'Content': 'المحتوى',
    'Save Response': 'حفظ الرد',
    'Agent Name': 'اسم الموظف',
    'Assigned Count': 'العدد المعين',
    'Resolved Count': 'العدد المحلول',
    'No agent performance data available yet.': 'لا تتوفر بيانات أداء للموظفين حتى الآن.',
    'Upgrade': 'الترقية',
    'Upgrade to SahlDesk Pro': 'الترقية إلى SahlDesk Pro',
    'Unlock full analytics, canned responses, team agent roles, and WooCommerce RMA returns.': 'افتح التحليلات المتقدمة، والردود الجاهزة، وأدوار فريق العمل، ونظام إرجاع طلبات ووكومرس RMA.',
    'Monthly': 'شهري',
    'Yearly': 'سنوي',
    'Save 20%': 'وفر 20%',
    'Current Plan': 'الخطة الحالية',
    'Active Plan': 'الخطة المفعلة',
    'Free': 'مجاني',
    'Pro': 'برو',
    '/ month': '/ شهر',
    '/ year': '/ سنة',
    '/ forever': '/ للأبد',
    'Billed annually': 'يتم المحاسبة سنوياً',
    'Billed monthly': 'يتم المحاسبة شهرياً',
    'Save $48/year with annual billing': 'وفر $48 سنوياً مع الفاتورة السنوية',
    'Unlimited Tickets & Categories': 'تذاكر وتصنيفات غير محدودة',
    'Floating Support Widget': 'أداة دعم فني عائمة',
    'WooCommerce Order History Sync': 'مزامنة سجل طلبات ووكومرس',
    'Single Agent / Admin': 'وكيل / مسؤول واحد',
    'Analytics & Reports': 'التحليلات والتقارير',
    '1-Click WooCommerce RMA Returns': 'إرجاع طلبات ووكومرس RMA بنقرة واحدة',
    'Everything in Free': 'كل ما في الخطة المجانية',
    'Reports & Analytics Charts': 'تقارير ورسوم بيانية تحليلية',
    'Canned Quick Responses': 'ردود جاهزة وسريعة',
    'Multi-Agent Team Roles': 'أدوار وصلاحيات فريق العمل',
    'Custom Sub-Statuses': 'حالات فرعية مخصصة للتذاكر',
    'AI Copilot & Priority Support': 'مساعد الذكاء الاصطناعي ودعم ذو أولوية',
    'Upgrade to Pro': 'الترقية إلى برو',
    'Most Popular': 'الأكثر طلباً',
    '30-Day Money Back Guarantee': 'ضمان استرداد الأموال لمدة 30 يوماً',
    'Secure Checkout via Freemius': 'دفع آمن ومحمي عبر فريميوس',
    'Processing...': 'جار المعالجة...'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang && (urlLang === 'en' || urlLang === 'ar')) {
      setLanguage(urlLang as Language);
    } else {
      const savedLang = localStorage.getItem('language');
      if (savedLang === 'en' || savedLang === 'ar') {
        setLanguage(savedLang as Language);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div dir={dir} className={language === 'ar' ? 'font-cairo' : 'font-inter'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
