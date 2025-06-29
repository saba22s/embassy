/**
 * ملف التكوين الخاص بنظام الترجمة
 * يحتوي على جميع إعدادات الترجمة والخريطة الخاصة بالصفحات
 */

// تكوين نظام الترجمة
window.I18nConfig = {
    // الإعدادات الأساسية
    defaultLanguage: 'ar',
    fallbackLanguage: 'en',
    debugMode: true,
    
    // مسار ملفات الترجمة
    translationPath: '/public/locales/{{lng}}/{{ns}}.json',
    
    // خريطة أسماء الصفحات إلى مساحات الأسماء
    // يمكنك إضافة صفحات جديدة هنا دون الحاجة لتعديل الكود الأساسي
    pageNamespaces: {
        // الصفحة الرئيسية
        'index.html': 'home',
        '': 'home',
        '/': 'home',
        
        // صفحات السفارة
        'ambassador.html': 'ambassador',
        'embassy.html': 'embassy',
        'former_ambassadors.html': 'former-ambassadors',
        
        // صفحات العلاقات
        'cultural_relations.html': 'cultural-relations',
        'historical_relations.html': 'historical-relations',
        'economic_relations.html': 'economic-relations',
        'political_relations.html': 'political-relations',
        'religious_relations.html': 'religious-relations',
        
        // صفحات الدول
        'palestine.html': 'palestine',
        'turkey.html': 'turkey',
        
        // صفحات الأحداث والأنشطة
        'events.html': 'events',
        'feedback.html': 'feedback',
        
        // صفحات الخدمات القنصلية
        'services.html': 'services',
        'passports.html': 'passports',
        'forms.html': 'forms',
        
        // صفحات التعليم
        'turkish_universities.html': 'turkish-universities',
        'study_in_turkey.html': 'study-in-turkey',
        'student_guide.html': 'student-guide'
    },
    
    // اللغات المدعومة
    supportedLanguages: [
        { code: 'ar', name: 'العربية', dir: 'rtl' },
        { code: 'en', name: 'English', dir: 'ltr' },
        { code: 'tr', name: 'Türkçe', dir: 'ltr' }
    ],
    
    // دالة للحصول على مساحة الاسم للصفحة الحالية
    getCurrentPageNamespace() {
        const currentPath = window.location.pathname.toLowerCase();
        const fileName = currentPath.split('/').pop() || 'index.html';
        return this.pageNamespaces[fileName] || null;
    },
    
    // دالة للحصول على جميع مساحات الأسماء المطلوبة
    getRequiredNamespaces() {
        const namespaces = ['common']; // Always load common
        const pageNamespace = this.getCurrentPageNamespace();
        
        if (pageNamespace) {
            namespaces.push(pageNamespace);
            console.log(`🎯 Page detected: ${pageNamespace}`);
        } else {
            console.log(`⚠️ Unknown page, using only common namespace`);
        }
        
        return namespaces;
    },
    
    // دالة للحصول على اتجاه اللغة
    getLanguageDirection(langCode) {
        const lang = this.supportedLanguages.find(l => l.code === langCode);
        return lang ? lang.dir : 'ltr';
    },
    
    // دالة لإضافة صفحة جديدة
    addPageNamespace(fileName, namespace) {
        this.pageNamespaces[fileName] = namespace;
        console.log(`✅ Added new page mapping: ${fileName} -> ${namespace}`);
    }
};