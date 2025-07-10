// palestine-embassy/public/js/i18n-init.js

document.addEventListener('DOMContentLoaded', function() {
    // الانتظار قليلاً لضمان تحميل جميع السكريبتات
    setTimeout(initializeI18n, 200);
});

async function initializeI18n() {
    // التحقق مما إذا كانت مكتبة i18next متاحة
    if (typeof i18next === 'undefined') {
        console.warn('i18next is not available. Skipping internationalization.');
        return;
    }
    // Check if LanguageDetector is available globally
    if (typeof i18nextBrowserLanguageDetector === 'undefined') {
        console.warn('i18next-browser-languagedetector is not available. Ensure it is loaded.');
        // If not loaded, proceed without it, or handle as an error
        // For now, we'll proceed assuming it might eventually load or fall back
    }

    try {
        // تعريف جميع مساحات الأسماء (namespaces) بناءً على محتوى مجلد /locales/{lang}/
        // هذا أمر بالغ الأهمية لضمان تحميل جميع الترجمات
        const allNamespaces = [
            'common', 'home', 'ambassador', 'contact', 'cultural-relations', 'economic-relations',
            'embassy', 'events', 'feedback', 'former-ambassadors', 'forms', 'historical-relations',
            'news', 'palestine', 'passports', 'political-relations', 'religious-relations', 'services',
            'student-guide', 'study-in-turkey', 'turkey', 'turkish-universities'
        ];

        // تحديد مسار التحميل (loadPath) لملفات الترجمة بشكل ديناميكي وقوي
        // هذا يضمن أن المسار سيكون صحيحًا بغض النظر عن مستوى تداخل ملف HTML
        const scriptUrl = new URL(document.querySelector('script[src*="i18n-init.js"]').src);
        const scriptPathname = scriptUrl.pathname; 
        const projectRootPath = scriptPathname.substring(0, scriptPathname.indexOf('/public/js/'));
        const dynamicLoadPath = `${projectRootPath}/public/locales/{{lng}}/{{ns}}.json`;

        const i18nConfig = {
            // Check localStorage first, then use browser preference, fallback to 'ar'
            lng: localStorage.getItem('preferredLanguage') || (navigator.language || navigator.userLanguage).split('-')[0] || 'ar',
            fallbackLng: 'ar', 
            supportedLngs: ['ar', 'en', 'tr'], 
            debug: true, 
            backend: {
                loadPath: dynamicLoadPath 
            },
            ns: allNamespaces, 
            defaultNS: 'common', 
            interpolation: {
                escapeValue: false 
            },
            returnEmptyString: false, 
            load: 'languageOnly' 
        };

        // Conditionally use LanguageDetector if it's loaded
        if (typeof i18nextBrowserLanguageDetector !== 'undefined') {
            i18next.use(i18nextBrowserLanguageDetector);
            console.log('i18next-browser-languagedetector is used.');
        } else {
            console.warn('i18next-browser-languagedetector not found, proceeding without it. Language detection might be limited.');
        }

        await i18next.use(i18nextHttpBackend).init(i18nConfig);

        // تحديث المحتوى بعد التهيئة الأولية
        updateContent();
        
        // الاستماع لتغييرات اللغة
        i18next.on('languageChanged', function(lng) {
            console.log(`i18next language changed to: ${lng}`);
            updateContent();
            updateDirection(lng);
            // إرسال حدث مخصص عند تغيير اللغة، قد تستخدمه سكريبتات أخرى لصفحات معينة
            document.dispatchEvent(new CustomEvent('i18nextLanguageChanged', { detail: { lang: lng } }));
        });
        
        console.log('i18next initialized successfully and all namespaces configured.');
        
    } catch (error) {
        console.error('Failed to initialize i18next:', error);
    }
}

// الدالة updateContent() و updateDirection() ودالة window.changeLanguage يجب أن تكون موجودة كما هي
// في ملفاتك، أو يمكنك استخدام النسخ التالية إذا لم تكن موجودة.

function updateContent() {
    // لا تتابع إلا إذا كانت i18next متاحة ومهيأة
    if (typeof i18next === 'undefined' || !i18next.isInitialized) {
        return;
    }

    // تحديث جميع العناصر التي تحتوي على خاصية data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        try {
            // التعامل مع ترجمة الخاصيات (attributes) مثل [alt] بالإضافة إلى محتوى النص
            if (key.startsWith('[') && key.includes(']')) {
                const match = key.match(/\[(.+?)\](.+)/);
                if (match) {
                    const attribute = match[1];
                    const translationKey = match[2];
                    const attributeTranslation = i18next.t(translationKey, { defaultValue: element.getAttribute(attribute) || '' });
                    if (attributeTranslation !== translationKey) {
                        element.setAttribute(attribute, attributeTranslation);
                    }
                }
            } else {
                // ترجمة محتوى النص العادي
                const translation = i18next.t(key, { defaultValue: element.textContent });
                if (translation !== key) {
                    element.textContent = translation;
                }
            }
        } catch (error) {
            console.warn(`Translation error for key: ${key}`, error);
        }
    });
}

function updateDirection(lng) {
    // تحديث اتجاه الوثيقة بناءً على اللغة
    const isRTL = lng === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    
    // تحديث فئة الـ body لتنسيقات RTL/LTR المحددة
    document.body.classList.toggle('rtl', isRTL);
    document.body.classList.toggle('ltr', !isRTL);
}

// تجاوز دالة changeLanguage العالمية للعمل مع i18next (إذا كانت موجودة بالفعل)
// this function will now be removed from window scope and managed by LanguageSwitcher class
// to avoid conflicts.
// if (window.changeLanguage) {
//     delete window.changeLanguage; // Remove the global function if it exists
// }

// Keeping a simple placeholder for direct language change if needed, but LanguageSwitcher class is preferred.
window.setLanguage = async function(lang) {
    console.log(`Attempting to set language globally to: ${lang}`);
    if (typeof i18next !== 'undefined' && i18next.isInitialized) {
        try {
            await i18next.changeLanguage(lang);
            localStorage.setItem('preferredLanguage', lang);
            console.log(`Language set to ${lang} via i18next.`);
        } catch (error) {
            console.error(`Error setting language via i18next: ${error}`);
        }
    } else {
        console.warn('i18next not initialized, cannot set language.');
        localStorage.setItem('preferredLanguage', lang); // Still save preference
        updateDirection(lang); // Update direction immediately
        // Consider a full page reload if i18next is not ready to ensure content reflects change
        location.reload(); 
    }
};

// Dispatch a custom event when i18next is fully ready
document.addEventListener('DOMContentLoaded', () => {
    const checkI18nReady = () => {
        if (typeof i18next !== 'undefined' && i18next.isInitialized) {
            console.log('📡 Dispatching i18nextReady event from i18n-init.js');
            document.dispatchEvent(new CustomEvent('i18nextReady', {
                detail: { 
                    language: i18next.language,
                    source: 'i18next-initialization'
                }
            }));
        } else {
            setTimeout(checkI18nReady, 100);
        }
    };
    // Give some time for i18next to potentially auto-initialize first
    setTimeout(checkI18nReady, 500);
});