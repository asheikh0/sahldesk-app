import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
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
    'Sub-Status': 'Sub-Status'
  },
  ar: {
    'Inbox': 'البريد الوارد',
    'Categories': 'التصنيفات',
    'Sign Out': 'تسجيل الخروج',
    'Status': 'الحالة',
    'Open': 'مفتوح',
    'In Progress': 'قيد المعالجة',
    'Pending': 'قيد الانتظار',
    'Resolved': 'تم الحل',
    'Closed': 'مغلق',
    'Priority': 'الأولوية',
    'Low': 'منخفض',
    'Medium': 'متوسط',
    'High': 'عالي',
    'Internal Note (Staff only)': 'ملاحظة داخلية (فريق العمل فقط)',
    'Submit Reply': 'إرسال الرد',
    'Attach File': 'إرفاق ملف',
    'Add Category': 'إضافة تصنيف',
    'Edit Category': 'تعديل تصنيف',
    'Category Name': 'اسم التصنيف',
    'Color': 'اللون',
    'Tickets': 'التذاكر',
    'Actions': 'الإجراءات',
    'Save': 'حفظ',
    'Cancel': 'إلغاء',
    'Delete': 'حذف',
    'Are you sure you want to delete this category?': 'هل أنت متأكد أنك تريد حذف هذا التصنيف؟',
    'New Ticket': 'تذكرة جديدة',
    'Select Category': 'اختر التصنيف',
    'Create Ticket': 'إنشاء تذكرة',
    'All': 'الكل',
    'Search tickets...': 'ابحث في التذاكر...',
    'Subject': 'الموضوع',
    'Description': 'الوصف',
    'Attachment': 'المرفق',
    'Unassigned': 'غير معين',
    'Agent': 'الوكيل',
    'Sub-Status': 'الحالة الفرعية'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

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
