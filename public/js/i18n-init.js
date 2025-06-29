/**
 * نظام الترجمة المحسّن - مع إصلاح اكتشاف الملفات
 */

// وظيفة لتطبيق الترجمات
function applyTranslations() {
    if (typeof i18next === 'undefined') {
        console.error('❌ i18next is not available');
        return;
    }

    console.log('🔄 Applying translations...');
    
    // ترجمة النصوص العادية
    let translatedCount = 0;
    document.querySelectorAll('[data-i18n]:not([data-i18n*="["])').forEach(element => {
        const key = element.getAttribute('data-i18n');
        try {
            const translation = i18next.t(key);
            if (translation && translation !== key) {
                element.textContent = translation;
                translatedCount++;
                console.log(`✅ Translated: ${key} -> ${translation.substring(0, 50)}...`);
            } else {
                console.warn(`⚠️ Missing translation for: ${key}`);
            }
        } catch (error) {
            console.error(`❌ Translation error for key: ${key}`, error);
        }
    });

    // ترجمة السمات
    document.querySelectorAll('[data-i18n*="["]').forEach(element => {
        const keyWithAttribute = element.getAttribute('data-i18n');
        const match = keyWithAttribute.match(/\[(\w+)\](.+)/);
        if (match) {
            const attribute = match[1];
            const key = match[2];
            try {
                const translation = i18next.t(key);
                if (translation && translation !== key) {
                    element.setAttribute(attribute, translation);
                    translatedCount++;
                    console.log(`✅ Translated attribute [${attribute}]: ${key}`);
                }
            } catch (error) {
                console.error(`❌ Attribute translation error: ${key}`, error);
            }
        }
    });

    console.log(`📊 Total translations applied: ${translatedCount}`);

    // تحديث اتجاه الصفحة
    const currentLang = i18next.language;
    const direction = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', currentLang);
    
    const body = document.body;
    if (body && body.hasAttribute('data-lang-direction')) {
        body.setAttribute('data-lang-direction', direction);
    }
    
    console.log(`🌍 Language direction set to: ${direction} for ${currentLang}`);
}

// دالة ذكية لاكتشاف مساحة الاسم من اسم الملف
function detectPageNamespace() {
    const currentPath = window.location.pathname.toLowerCase();
    const fileName = currentPath.split('/').pop() || 'index.html';
    const baseName = fileName.replace('.html', '');
    
    console.log(`📄 Current file: ${fileName} -> Base name: ${baseName}`);
    
    // قاموس تحويل أسماء الملفات إلى namespaces
    const pageToNamespace = {
        'index': 'home',
        '': 'home',
        
        // السفارة
        'ambassador': 'ambassador',
        'embassy': 'embassy', 
        'former_ambassadors': 'former-ambassadors',
        
        // العلاقات - تحويل underscore إلى dash
        'cultural_relations': 'cultural-relations',
        'historical_relations': 'historical-relations',
        'economic_relations': 'economic-relations',
        'political_relations': 'political-relations',
        'religious_relations': 'religious-relations',
        
        // التعليم
        'turkish_universities': 'turkish-universities',
        'study_in_turkey': 'study-in-turkey',
        'student_guide': 'student-guide',
        
        // الخدمات
        'passports': 'passports',
        'services': 'services',
        'forms': 'forms',
        
        // أخرى
        'palestine': 'palestine',
        'turkey': 'turkey',
        'events': 'events',
        'feedback': 'feedback'
    };
    
    const namespace = pageToNamespace[baseName] || baseName;
    console.log(`🎯 Detected namespace: ${namespace}`);
    
    return namespace;
}

// دالة تهيئة i18next المحسّنة
window.initI18n = function() {
    console.log('🚀 Starting i18next initialization...');
    
    // التحقق من المتطلبات
    if (typeof i18next === 'undefined') {
        console.error('❌ i18next library not found');
        return;
    }

    if (typeof i18nextHttpBackend === 'undefined') {
        console.error('❌ i18nextHttpBackend library not found');
        return;
    }

    // اكتشاف مساحة الاسم للصفحة الحالية
    const pageNamespace = detectPageNamespace();
    const namespaces = ['common'];
    
    // إضافة namespace الصفحة إذا لم يكن 'common'
    if (pageNamespace && pageNamespace !== 'common' && pageNamespace !== 'home') {
        namespaces.push(pageNamespace);
    } else if (pageNamespace === 'home') {
        namespaces.push('home');
    }

    const savedLang = localStorage.getItem('preferredLanguage') || 'ar';
    console.log(`🌍 Language: ${savedLang}, Namespaces: ${namespaces.join(', ')}`);

    i18next
        .use(i18nextHttpBackend)
        .init({
            lng: savedLang,
            fallbackLng: 'en',
            debug: true,
            ns: namespaces,
            defaultNS: 'common',
            backend: {
                loadPath: '/public/locales/{{lng}}/{{ns}}.json',
                allowMultiLoading: false,
                crossDomain: false
            },
            // إعدادات إضافية للتعامل مع الأخطاء
            load: 'languageOnly', // تحميل اللغة فقط بدون regional code
            preload: [savedLang], // تحميل اللغة المحفوظة مسبقاً
            cleanCode: true // تنظيف كود اللغة
        }, function(err, t) {
            if (err) {
                console.error('❌ i18next initialization failed:', err);
                console.error('📋 Error details:', {
                    message: err.message,
                    stack: err.stack,
                    namespaces: namespaces,
                    language: savedLang
                });
                
                // fallback للنصوص الافتراضية
                console.log('🔄 Using default text as fallback...');
                return;
            }
            
            console.log('✅ i18next initialized successfully!');
            console.log(`📋 Loaded languages: ${Object.keys(i18next.store.data).join(', ')}`);
            console.log(`📋 Available namespaces: ${JSON.stringify(i18next.options.ns)}`);
            
            // اختبار ترجمة بسيطة للتأكد
            if (pageNamespace !== 'home') {
                const testKey = `${pageNamespace}:pageTitle`;
                const testTranslation = i18next.t(testKey);
                console.log(`🧪 Test translation: ${testKey} -> ${testTranslation}`);
            }
            
            applyTranslations();
            
            document.dispatchEvent(new CustomEvent('i18nextReady', {
                detail: {
                    language: savedLang,
                    namespaces: namespaces,
                    pageNamespace: pageNamespace
                }
            }));
            console.log('✅ i18nextReady event dispatched');
        });

    // مراقبة تغيير اللغة
    i18next.on('languageChanged', (lng) => {
        console.log(`🔄 Language changed to: ${lng}`);
        applyTranslations();
    });

    // مراقبة أخطاء التحميل مع تفاصيل أكثر
    i18next.on('failedLoading', (lng, ns, msg) => {
        console.error(`❌ Failed to load ${lng}/${ns}:`, msg);
        console.error(`💡 Expected file: /public/locales/${lng}/${ns}.json`);
        
        // اقتراح البحث عن ملفات بديلة
        if (ns.includes('-')) {
            const alternativeNs = ns.replace(/-/g, '_');
            console.log(`💡 Try checking for alternative file: /public/locales/${lng}/${alternativeNs}.json`);
        }
    });
};

// بدء التشغيل
document.addEventListener('componentsLoaded', () => {
    console.log('📦 Components loaded, initializing i18n...');
    window.initI18n();
});

// احتياطي للتشغيل المباشر
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, setting up fallback timer...');
    setTimeout(() => {
        if (typeof i18next === 'undefined' || !i18next.isInitialized) {
            console.log('⏰ Timeout reached, forcing initialization...');
            window.initI18n();
        }
    }, 2000);
});

// دوال مساعدة للتصحيح
window.I18nDebug = {
    // اختبار ترجمة مفتاح معين
    testTranslation: function(key) {
        if (typeof i18next !== 'undefined') {
            console.log(`Testing key: ${key}`);
            console.log(`Result: ${i18next.t(key)}`);
            console.log(`Exists: ${i18next.exists(key)}`);
        } else {
            console.log('i18next not available');
        }
    },
    
    // عرض جميع البيانات المحملة
    showLoadedData: function() {
        if (typeof i18next !== 'undefined') {
            console.log('Loaded data:', i18next.store.data);
        }
    },
    
    // إعادة تطبيق الترجمات
    reapplyTranslations: function() {
        applyTranslations();
    }
};