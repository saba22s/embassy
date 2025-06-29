/**
 * ملف التكوين للـ namespaces
 * يحتوي على قائمة جميع الصفحات والـ namespaces المطلوبة لكل صفحة
 */

window.NamespaceConfig = {
    // قائمة جميع الـ namespaces المتاحة في النظام
    availableNamespaces: [
        'common',
        'home',
        'ambassador',
        'former-ambassadors',
        'embassy',
        'cultural-relations',
        'economic-relations',
        'historical-relations',
        'political-relations',
        'religious-relations',
        'turkish-universities',
        'study-in-turkey',
        'student-guide',
        'passports',
        'services',
        'forms',
        'palestine',
        'turkey',
        'events',
        'feedback'
    ],

    // خريطة تطابق أسماء الملفات مع namespaces
    pageNamespaceMap: {
        // الصفحة الرئيسية
        'index': 'home',
        '': 'home',
        
        // صفحات السفارة
        'ambassador': 'ambassador',
        'former_ambassadors': 'former-ambassadors',
        'embassy': 'embassy',
        
        // صفحات العلاقات
        'cultural_relations': 'cultural-relations',
        'economic_relations': 'economic-relations',
        'historical_relations': 'historical-relations',
        'political_relations': 'political-relations',
        'religious_relations': 'religious-relations',
        
        // صفحات التعليم
        'turkish_universities': 'turkish-universities',
        'study_in_turkey': 'study-in-turkey',
        'student_guide': 'student-guide',
        
        // صفحات قنصلية
        'passports': 'passports',
        'services': 'services',
        'forms': 'forms',
        
        // صفحات أخرى
        'palestine': 'palestine',
        'turkey': 'turkey',
        'events': 'events',
        'feedback': 'feedback'
    },

    // قائمة الصفحات التي تحتاج إلى namespaces إضافية
    additionalNamespaces: {
        // مثال: إذا كانت صفحة معينة تحتاج إلى namespaces متعددة
        'ambassador': ['ambassador', 'embassy'], // السفير قد يحتاج إلى معلومات السفارة أيضاً
        'events': ['events', 'home'] // صفحة الأحداث قد تحتاج إلى بعض العناصر من الصفحة الرئيسية
    },

    /**
     * دالة للحصول على namespace للصفحة الحالية
     */
    getCurrentPageNamespace: function() {
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop();
        const baseName = fileName.replace('.html', '');
        
        return this.pageNamespaceMap[baseName] || baseName;
    },

    /**
     * دالة للحصول على جميع namespaces المطلوبة للصفحة الحالية
     */
    getRequiredNamespaces: function() {
        let namespaces = ['common']; // دائماً نحمل common
        
        const pageNamespace = this.getCurrentPageNamespace();
        if (pageNamespace && pageNamespace !== 'common') {
            namespaces.push(pageNamespace);
        }
        
        // إضافة namespaces إضافية إذا كانت مطلوبة
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop().replace('.html', '');
        
        if (this.additionalNamespaces[fileName]) {
            this.additionalNamespaces[fileName].forEach(ns => {
                if (!namespaces.includes(ns)) {
                    namespaces.push(ns);
                }
            });
        }
        
        return namespaces;
    },

    /**
     * دالة للتحقق من وجود namespace معين
     */
    isNamespaceAvailable: function(namespace) {
        return this.availableNamespaces.includes(namespace);
    },

    /**
     * دالة لإضافة namespace جديد (للاستخدام المستقبلي)
     */
    addNamespace: function(namespace) {
        if (!this.availableNamespaces.includes(namespace)) {
            this.availableNamespaces.push(namespace);
            console.log(`✅ Added new namespace: ${namespace}`);
        }
    },

    /**
     * دالة لإضافة تطابق صفحة جديدة
     */
    addPageMapping: function(fileName, namespace) {
        this.pageNamespaceMap[fileName] = namespace;
        console.log(`✅ Added page mapping: ${fileName} -> ${namespace}`);
    }
};

// تصدير للاستخدام العالمي
window.getPageNamespaces = function() {
    return window.NamespaceConfig.getRequiredNamespaces();
};

window.getCurrentNamespace = function() {
    return window.NamespaceConfig.getCurrentPageNamespace();
};