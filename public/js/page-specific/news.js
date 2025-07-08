/*====================================================
  NEWS.JS - نسخة محدثة مع تصحيح تحميل الترجمات
  نظام أخبار محدث ومتوافق مع التصميم العام
====================================================*/

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Updated News System with Fixed Translations Initializing...');
    
    // Variables and DOM Elements
    const newsListContainer = document.getElementById('newsListContainer');
    const newsSearchInput = document.getElementById('newsSearchInput');
    const newsCategoryFilter = document.getElementById('newsCategoryFilter');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const newsCount = document.getElementById('newsCount');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    
    // State Management
    let allNews = [];
    let filteredNews = [];
    let translations = {};
    let currentLanguage = 'ar';
    let isInitialized = false;
    
    /*====================================================
      التحقق من العناصر المطلوبة
    ====================================================*/
    
    function validateElements() {
        const requiredElements = {
            newsListContainer,
            newsSearchInput,
            newsCategoryFilter,
            noResultsMessage
        };
        
        for (const [name, element] of Object.entries(requiredElements)) {
            if (!element) {
                console.error(`❌ Required element missing: ${name}`);
                return false;
            }
        }
        return true;
    }
    
    /*====================================================
      إدارة حالة التحميل
    ====================================================*/
    
    function showLoading() {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        if (newsListContainer) {
            newsListContainer.style.display = 'none';
        }
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
    }
    
    function hideLoading() {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        if (newsListContainer) {
            newsListContainer.style.display = 'grid';
        }
    }
    
    /*====================================================
      انتظار تهيئة i18n مع تحسينات
    ====================================================*/
    
    function waitForI18n() {
        return new Promise((resolve) => {
            if (typeof i18next !== 'undefined' && i18next.isInitialized) {
                currentLanguage = i18next.language || document.documentElement.lang || 'ar';
                console.log('✅ i18next ready, language:', currentLanguage);
                resolve();
            } else {
                console.log('⏳ Waiting for i18next initialization...');
                
                // محاولة الحصول على اللغة من HTML
                currentLanguage = document.documentElement.lang || 'ar';
                
                const checkInterval = setInterval(() => {
                    if (typeof i18next !== 'undefined' && i18next.isInitialized) {
                        currentLanguage = i18next.language || currentLanguage;
                        clearInterval(checkInterval);
                        console.log('✅ i18next initialized, language:', currentLanguage);
                        resolve();
                    }
                }, 100);
                
                // احتياطي بعد 3 ثوانِ
                setTimeout(() => {
                    clearInterval(checkInterval);
                    console.log('⏰ Timeout, using detected language:', currentLanguage);
                    resolve();
                }, 3000);
            }
        });
    }
    
    /*====================================================
      تحميل ملفات الترجمة المحسن
    ====================================================*/
    
    async function loadTranslationFile(lang, namespace) {
        try {
            const response = await fetch(`/public/locales/${lang}/${namespace}.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            console.log(`✅ Loaded ${lang}/${namespace}.json`);
            return data;
        } catch (error) {
            console.error(`❌ Failed to load ${lang}/${namespace}.json:`, error);
            
            // العودة للغة الافتراضية
            if (lang !== 'ar') {
                console.log(`🔄 Falling back to ar/${namespace}.json`);
                try {
                    const fallbackResponse = await fetch(`/public/locales/ar/${namespace}.json`);
                    if (fallbackResponse.ok) {
                        const fallbackData = await fallbackResponse.json();
                        console.log('✅ Loaded fallback Arabic translation');
                        return fallbackData;
                    }
                } catch (fallbackError) {
                    console.error('❌ Fallback also failed:', fallbackError);
                }
            }
            
            // إرجاع ترجمات افتراضية
            return getDefaultTranslations();
        }
    }
    
    /*====================================================
      ترجمات افتراضية للحالات الطارئة
    ====================================================*/
    
    function getDefaultTranslations() {
        return {
            pageTitle: "الأخبار - سفارة دولة فلسطين في تركيا",
            mainTitle: "الأخبار والإعلانات", 
            subtitle: "تابع آخر الأخبار والإعلانات من سفارة دولة فلسطين في تركيا",
            allNewsTitle: "جميع الأخبار",
            searchPlaceholder: "البحث في الأخبار...",
            filterAll: "جميع الأخبار",
            filterAnnouncements: "إعلانات",
            filterEvents: "فعاليات",
            filterConsular: "خدمات قنصلية",
            filterEducation: "تعليم",
            noResults: "لم يتم العثور على نتائج",
            tryDifferentSearch: "جرب مصطلحات بحث مختلفة أو اختر فئة أخرى",
            clearFilters: "مسح المرشحات",
            showAllNews: "عرض جميع الأخبار",
            newsItem: "خبر",
            newsItems: "أخبار",
            loading: "جاري التحميل...",
            news_articles: []
        };
    }
    
    /*====================================================
      جلب الترجمات والبيانات المحسن
    ====================================================*/
    
    async function fetchTranslations() {
        try {
            await waitForI18n();
            
            console.log(`🌍 Loading translations for: ${currentLanguage}`);
            
            // تحميل ملف الأخبار
            const newsData = await loadTranslationFile(currentLanguage, 'news');
            
            // تحديث الترجمات العامة
            translations = {
                ...getDefaultTranslations(),
                ...newsData
            };
            
            // تحديث محتوى الصفحة
            updatePageContent();
            
            // إرجاع مقالات الأخبار
            return translations.news_articles || [];
            
        } catch (error) {
            console.error('❌ Error fetching translations:', error);
            translations = getDefaultTranslations();
            updatePageContent();
            return [];
        }
    }
    
    /*====================================================
      تحديث محتوى الصفحة المحسن
    ====================================================*/
    
    function updatePageContent() {
        try {
            // تحديث العناوين الرئيسية
            updateElementSafely('pageTitle', translations.pageTitle);
            updateElementSafely('mainNewsTitle', translations.mainTitle);
            updateElementSafely('newsSubtitle', translations.subtitle);
            updateElementSafely('allNewsTitle', translations.allNewsTitle);
            
            // تحديث عناصر البحث والتصفية
            if (newsSearchInput && translations.searchPlaceholder) {
                newsSearchInput.placeholder = translations.searchPlaceholder;
                newsSearchInput.setAttribute('aria-label', translations.searchPlaceholder);
            }
            
            // تحديث خيارات التصفية
            const filterOptions = [
                { id: 'filterAll', key: 'filterAll' },
                { id: 'filterAnnouncements', key: 'filterAnnouncements' },
                { id: 'filterEvents', key: 'filterEvents' },
                { id: 'filterConsular', key: 'filterConsular' },
                { id: 'filterEducation', key: 'filterEducation' }
            ];
            
            filterOptions.forEach(option => {
                updateElementSafely(option.id, translations[option.key]);
            });
            
            // تحديث رسائل "لا توجد نتائج"
            updateElementSafely('noResultsText', translations.noResults);
            updateElementSafely('tryDifferentSearchText', translations.tryDifferentSearch);
            
            // تحديث أزرار الإجراءات
            updateButtonText('clearFiltersBtn', translations.clearFilters);
            updateButtonText('resetFiltersBtn', translations.showAllNews);
            
            console.log('✅ Page content updated successfully');
            
        } catch (error) {
            console.error('❌ Error updating page content:', error);
        }
    }
    
    function updateElementSafely(id, text) {
        const element = document.getElementById(id);
        if (element && text) {
            element.textContent = text;
        }
    }
    
    function updateButtonText(id, text) {
        const button = document.getElementById(id);
        if (button && text) {
            const span = button.querySelector('span');
            if (span) {
                span.textContent = text;
            } else {
                button.textContent = text;
            }
        }
    }
    
    /*====================================================
      إنشاء بطاقات الأخبار - محسن بدون فئة ووقت قراءة
    ====================================================*/
    
    function createNewsCard(article) {
        if (!article || !article.id) {
            console.warn('⚠️ Invalid article data:', article);
            return document.createElement('div');
        }
        
        const newsCard = document.createElement('div');
        newsCard.classList.add('news-card');
        newsCard.setAttribute('data-category', article.category || '');
        newsCard.setAttribute('data-id', article.id);
        
        // تحديد مسار الصورة
        const imagePath = article.image_title ? 
            `/public/images/news/news.title/${article.image_title}` : 
            '/public/images/news/news,9.jpg';
        
        // إنشاء المحتوى بدون فئة ووقت القراءة
        newsCard.innerHTML = `
            <img src="${imagePath}" 
                 alt="${escapeHtml(article.title || 'صورة الخبر')}" 
                 loading="lazy"
                 onerror="this.src='/public/images/news/news,9.jpg'; this.onerror=null;">
            
            <div class="news-card-content">
                <h3>
                    <a href="/public/html/news-detail.html?id=${article.id}" 
                       aria-label="${escapeHtml('اقرأ تفاصيل: ' + (article.title || 'الخبر'))}">
                        ${escapeHtml(article.title || 'عنوان غير متوفر')}
                    </a>
                </h3>
                
                <p class="news-excerpt">${escapeHtml(article.excerpt || 'وصف غير متوفر')}</p>
                
                <div class="news-meta">
                    <span class="news-date">${escapeHtml(article.date || '')}</span>
                </div>
            </div>
        `;
        
        // إضافة أحداث التفاعل
        const link = newsCard.querySelector('a');
        if (link) {
            link.addEventListener('click', (e) => {
                console.log(`📰 User clicked on article: ${article.id}`);
            });
        }
        
        return newsCard;
    }
    
    /*====================================================
      وظيفة لتنظيف النصوص من HTML
    ====================================================*/
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /*====================================================
      عرض الأخبار المحسن
    ====================================================*/
    
    function renderNews(newsToRender) {
        try {
            if (!newsListContainer) {
                console.error('❌ News container not found');
                return;
            }
            
            // مسح المحتوى السابق
            newsListContainer.innerHTML = '';
            
            if (!newsToRender || newsToRender.length === 0) {
                showNoResults();
                return;
            }
            
            hideNoResults();
            
            // إنشاء وإضافة بطاقات الأخبار
            const fragment = document.createDocumentFragment();
            newsToRender.forEach((article, index) => {
                try {
                    const newsCard = createNewsCard(article);
                    if (newsCard.children.length > 0) { // تأكد من أن البطاقة تم إنشاؤها بنجاح
                        fragment.appendChild(newsCard);
                    }
                } catch (cardError) {
                    console.error(`❌ Error creating card for article ${index}:`, cardError);
                }
            });
            
            newsListContainer.appendChild(fragment);
            
            // تحديث عداد الأخبار
            updateNewsCount(newsToRender.length);
            
            console.log(`✅ Rendered ${newsToRender.length} news articles`);
            
        } catch (error) {
            console.error('❌ Error rendering news:', error);
            showError();
        }
    }
    
    function showNoResults() {
        if (noResultsMessage) {
            noResultsMessage.style.display = 'block';
        }
        if (newsListContainer) {
            newsListContainer.style.display = 'none';
        }
        updateNewsCount(0);
    }
    
    function hideNoResults() {
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
        if (newsListContainer) {
            newsListContainer.style.display = 'grid';
        }
    }
    
    function showError() {
        if (newsListContainer) {
            newsListContainer.innerHTML = `
                <div class="error-message" style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 40px;
                    background: var(--news-bg-card);
                    border-radius: var(--news-radius);
                    border: 1px solid var(--news-border);
                    color: var(--news-text-primary);
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--news-accent); margin-bottom: 15px;"></i>
                    <h3 style="color: var(--news-accent); margin-bottom: 10px;">${translations.error || 'خطأ في تحميل الأخبار'}</h3>
                    <p style="color: var(--news-text-secondary); margin-bottom: 20px;">${translations.loadingError || 'حدث خطأ أثناء تحميل الأخبار. يرجى المحاولة مرة أخرى.'}</p>
                    <button onclick="location.reload()" style="
                        background: var(--news-accent);
                        color: var(--news-bg-dark);
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: 600;
                    ">${translations.retry || 'إعادة التحميل'}</button>
                </div>
            `;
        }
    }
    
    function updateNewsCount(count) {
        if (newsCount) {
            const countText = count === 1 ? 
                `${count} ${translations.newsItem || 'خبر'}` : 
                `${count} ${translations.newsItems || 'أخبار'}`;
            newsCount.textContent = countText;
        }
    }
    
    /*====================================================
      البحث والتصفية المحسن
    ====================================================*/
    
    function filterAndSearchNews() {
        try {
            const searchTerm = newsSearchInput ? newsSearchInput.value.toLowerCase().trim() : '';
            const selectedCategory = newsCategoryFilter ? newsCategoryFilter.value : 'all';
            
            console.log(`🔍 Filtering - Search: "${searchTerm}", Category: "${selectedCategory}"`);
            
            filteredNews = allNews.filter(article => {
                if (!article) return false;
                
                // فحص البحث
                const matchesSearch = !searchTerm || searchInArticle(article, searchTerm);
                
                // فحص الفئة
                const matchesCategory = selectedCategory === 'all' || matchesArticleCategory(article, selectedCategory);
                
                return matchesSearch && matchesCategory;
            });
            
            renderNews(filteredNews);
            updateFilterButtons();
            
        } catch (error) {
            console.error('❌ Error in filterAndSearchNews:', error);
            showError();
        }
    }
    
    function searchInArticle(article, searchTerm) {
        const searchFields = [
            article.title,
            article.excerpt,
            ...(article.tags || []),
            ...(article.content_parts || [])
                .filter(part => part.type === 'text')
                .map(part => part.value)
        ].filter(Boolean);
        
        return searchFields.some(field => 
            field.toLowerCase().includes(searchTerm)
        );
    }
    
    function matchesArticleCategory(article, selectedCategory) {
        if (!article.category) return selectedCategory === 'all';
        
        const articleCategory = article.category.toLowerCase();
        const selected = selectedCategory.toLowerCase();
        
        // مطابقة مباشرة
        if (articleCategory === selected) return true;
        
        // مطابقة بالكلمات المفتاحية
        const categoryMappings = {
            'announcements': ['إعلان', 'announcement', 'duyuru'],
            'events': ['فعالية', 'event', 'etkinlik'],
            'consular': ['قنصل', 'consular', 'konsolosluk'],
            'education': ['تعليم', 'education', 'eğitim']
        };
        
        const keywords = categoryMappings[selected] || [];
        return keywords.some(keyword => 
            articleCategory.includes(keyword.toLowerCase())
        );
    }
    
    function updateFilterButtons() {
        const hasFilters = (newsSearchInput && newsSearchInput.value.trim()) || 
                          (newsCategoryFilter && newsCategoryFilter.value !== 'all');
        
        if (clearFiltersBtn) {
            clearFiltersBtn.style.display = hasFilters ? 'inline-flex' : 'none';
        }
    }
    
    function clearAllFilters() {
        if (newsSearchInput) {
            newsSearchInput.value = '';
        }
        if (newsCategoryFilter) {
            newsCategoryFilter.value = 'all';
        }
        
        renderNews(allNews);
        updateFilterButtons();
        
        console.log('🧹 All filters cleared');
    }
    
    /*====================================================
      معالجة الأحداث المحسن
    ====================================================*/
    
    function setupEventListeners() {
        // البحث مع debounce
        if (newsSearchInput) {
            let searchTimeout;
            newsSearchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(filterAndSearchNews, 300);
            });
            
            // إضافة Enter key support
            newsSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(searchTimeout);
                    filterAndSearchNews();
                }
            });
        }
        
        // تصفية الفئات
        if (newsCategoryFilter) {
            newsCategoryFilter.addEventListener('change', filterAndSearchNews);
        }
        
        // مسح المرشحات
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', clearAllFilters);
        }
        
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', clearAllFilters);
        }
        
        // تغيير اللغة
        if (typeof i18next !== 'undefined') {
            i18next.on('languageChanged', handleLanguageChange);
        }
        
        console.log('✅ Event listeners set up');
    }
    
    /*====================================================
      معالجة تغيير اللغة المحسن
    ====================================================*/
    
    async function handleLanguageChange(lng) {
        try {
            console.log(`🔄 Language changed to: ${lng}`);
            currentLanguage = lng;
            
            showLoading();
            
            // إعادة تحميل البيانات
            allNews = await fetchTranslations();
            
            // إعادة تطبيق المرشحات
            filterAndSearchNews();
            
            hideLoading();
            
        } catch (error) {
            console.error('❌ Error handling language change:', error);
            hideLoading();
            showError();
        }
    }
    
    /*====================================================
      التهيئة الرئيسية المحسنة
    ====================================================*/
    
    async function initializePage() {
        try {
            console.log('🔄 Initializing enhanced news page...');
            
            // التحقق من العناصر المطلوبة
            if (!validateElements()) {
                throw new Error('Required DOM elements not found');
            }
            
            // عرض مؤشر التحميل
            showLoading();
            
            // تحميل البيانات
            allNews = await fetchTranslations();
            
            if (allNews.length === 0) {
                console.warn('⚠️ No news articles found');
            }
            
            // عرض جميع الأخبار
            renderNews(allNews);
            
            // إعداد مستمعي الأحداث
            setupEventListeners();
            
            hideLoading();
            
            isInitialized = true;
            console.log('✅ Enhanced news page initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing page:', error);
            hideLoading();
            showError();
        }
    }
    
    /*====================================================
      بدء التشغيل المحسن
    ====================================================*/
    
    // انتظار تحميل DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializePage, 100);
        });
    } else {
        setTimeout(initializePage, 100);
    }
    
    // احتياطي للتهيئة
    setTimeout(() => {
        if (!isInitialized) {
            console.log('⏰ Timeout reached, force initializing...');
            initializePage();
        }
    }, 5000);
    
    /*====================================================
      Global Debug Functions
    ====================================================*/
    
    window.NewsPageDebug = {
        getState: () => ({
            allNews: allNews.length,
            filteredNews: filteredNews.length,
            currentLanguage,
            isInitialized,
            translations: Object.keys(translations).length
        }),
        
        reloadNews: () => location.reload(),
        
        filterByCategory: (category) => {
            if (newsCategoryFilter) {
                newsCategoryFilter.value = category;
                filterAndSearchNews();
            }
        },
        
        searchNews: (term) => {
            if (newsSearchInput) {
                newsSearchInput.value = term;
                filterAndSearchNews();
            }
        },
        
        testTranslation: (key) => {
            console.log(`Translation for "${key}":`, translations[key] || 'Not found');
        },
        
        forceLanguage: async (lang) => {
            currentLanguage = lang;
            if (typeof i18next !== 'undefined') {
                await i18next.changeLanguage(lang);
            } else {
                await handleLanguageChange(lang);
            }
        }
    };
});

console.log('✅ Enhanced News System with Fixed Translations loaded successfully!');