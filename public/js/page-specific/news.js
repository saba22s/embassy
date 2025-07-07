/*====================================================
  ENHANCED NEWS SYSTEM - نظام الأخبار المحدث والمتكامل
  يشمل جميع الإصلاحات والتحسينات المطلوبة
====================================================*/

// ========================================
// ملف: /public/js/page-specific/news.js (نهائي ومحدث)
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Enhanced News System Initializing...');
    
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
      انتظار تهيئة i18n
    ====================================================*/
    
    function waitForI18n() {
        return new Promise((resolve) => {
            if (typeof i18next !== 'undefined' && i18next.isInitialized) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (typeof i18next !== 'undefined' && i18next.isInitialized) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                
                // احتياطي بعد 5 ثوانِ
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 5000);
            }
        });
    }
    
    /*====================================================
      تحميل ملفات الترجمة
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
                return await loadTranslationFile('ar', namespace);
            }
            
            return {};
        }
    }
    
    /*====================================================
      جلب الترجمات والبيانات
    ====================================================*/
    
    async function fetchTranslations() {
        try {
            await waitForI18n();
            
            currentLanguage = (typeof i18next !== 'undefined' && i18next.language) || 'ar';
            console.log(`🌍 Loading translations for: ${currentLanguage}`);
            
            // تحميل ترجمات الأخبار والمشتركة
            const [newsTranslations, commonTranslations] = await Promise.all([
                loadTranslationFile(currentLanguage, 'news'),
                loadTranslationFile(currentLanguage, 'common')
            ]);
            
            translations = {
                ...commonTranslations,
                ...newsTranslations
            };
            
            // تحديث محتوى الصفحة
            updatePageContent();
            
            // إرجاع مقالات الأخبار
            return translations.news_articles || [];
            
        } catch (error) {
            console.error('❌ Error fetching translations:', error);
            return [];
        }
    }
    
    /*====================================================
      تحديث محتوى الصفحة
    ====================================================*/
    
    function updatePageContent() {
        try {
            // تحديث العناوين الرئيسية
            updateElement('pageTitle', translations.pageTitle);
            updateElement('mainNewsTitle', translations.mainTitle);
            updateElement('newsSubtitle', translations.subtitle);
            updateElement('allNewsTitle', translations.allNewsTitle);
            
            // تحديث عناصر البحث والتصفية
            if (newsSearchInput) {
                newsSearchInput.placeholder = translations.searchPlaceholder || 'البحث في الأخبار...';
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
                updateElement(option.id, translations[option.key]);
            });
            
            // تحديث رسائل "لا توجد نتائج"
            updateElement('noResultsText', translations.noResults);
            updateElement('tryDifferentSearchText', translations.tryDifferentSearch);
            
            // تحديث أزرار الإجراءات
            updateElement('clearFiltersBtn', translations.clearFilters);
            updateElement('resetFiltersBtn', translations.showAllNews);
            
            console.log('✅ Page content updated successfully');
            
        } catch (error) {
            console.error('❌ Error updating page content:', error);
        }
    }
    
    function updateElement(id, text) {
        const element = document.getElementById(id);
        if (element && text) {
            element.textContent = text;
        }
    }
    
    /*====================================================
      إنشاء بطاقات الأخبار
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
        
        // تحديد فئة المقال مع الترجمة
        const categoryKey = `category${(article.category || '').replace(/\s/g, '')}`;
        const categoryText = translations[categoryKey] || article.category || 'عام';
        
        // إنشاء المحتوى
        newsCard.innerHTML = `
            <img src="${imagePath}" 
                 alt="${article.title || 'صورة الخبر'}" 
                 loading="lazy"
                 onerror="this.src='/public/images/news/news,9.jpg'; this.onerror=null;">
            
            <div class="news-card-content">
                <span class="news-category">${categoryText}</span>
                
                <h3>
                    <a href="/public/html/news-detail.html?id=${article.id}" 
                       aria-label="اقرأ تفاصيل: ${article.title || 'الخبر'}">
                        ${article.title || 'عنوان غير متوفر'}
                    </a>
                </h3>
                
                <p class="news-excerpt">${article.excerpt || 'وصف غير متوفر'}</p>
                
                <div class="news-meta">
                    <span class="news-date">${article.date || ''}</span>
                    ${article.readTime ? `<span class="news-read-time">${article.readTime}</span>` : ''}
                </div>
            </div>
        `;
        
        // إضافة أحداث التفاعل
        const link = newsCard.querySelector('a');
        if (link) {
            link.addEventListener('click', (e) => {
                // تتبع النقرات (يمكن إضافة analytics هنا)
                console.log(`📰 User clicked on article: ${article.id}`);
            });
        }
        
        return newsCard;
    }
    
    /*====================================================
      عرض الأخبار
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
            newsToRender.forEach(article => {
                const newsCard = createNewsCard(article);
                fragment.appendChild(newsCard);
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
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 1px solid #dee2e6;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 15px;"></i>
                    <h3 style="color: #dc3545; margin-bottom: 10px;">خطأ في تحميل الأخبار</h3>
                    <p style="color: #6c757d; margin-bottom: 20px;">حدث خطأ أثناء تحميل الأخبار. يرجى المحاولة مرة أخرى.</p>
                    <button onclick="location.reload()" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">إعادة التحميل</button>
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
      البحث والتصفية
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
        // البحث في العنوان
        if (article.title && article.title.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // البحث في المقتطف
        if (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // البحث في العلامات
        if (article.tags && Array.isArray(article.tags)) {
            return article.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        }
        
        // البحث في المحتوى
        if (article.content_parts && Array.isArray(article.content_parts)) {
            return article.content_parts.some(part => 
                part.type === 'text' && 
                part.value && 
                part.value.toLowerCase().includes(searchTerm)
            );
        }
        
        return false;
    }
    
    function matchesArticleCategory(article, selectedCategory) {
        if (!article.category) return false;
        
        const articleCategory = article.category.toLowerCase();
        
        // مطابقة مباشرة
        if (articleCategory === selectedCategory.toLowerCase()) {
            return true;
        }
        
        // مطابقة بالكلمات المفتاحية
        const categoryMappings = {
            'announcements': ['إعلان', 'announcement', 'duyuru'],
            'events': ['فعالية', 'event', 'etkinlik'],
            'consular': ['قنصل', 'consular', 'konsolosluk'],
            'education': ['تعليم', 'education', 'eğitim']
        };
        
        const keywords = categoryMappings[selectedCategory] || [];
        return keywords.some(keyword => articleCategory.includes(keyword.toLowerCase()));
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
      معالجة الأحداث
    ====================================================*/
    
    function setupEventListeners() {
        // البحث
        if (newsSearchInput) {
            let searchTimeout;
            newsSearchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(filterAndSearchNews, 300); // debounce
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
      معالجة تغيير اللغة
    ====================================================*/
    
    async function handleLanguageChange(lng) {
        try {
            console.log(`🔄 Language changed to: ${lng}`);
            
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
      التهيئة الرئيسية
    ====================================================*/
    
    async function initializePage() {
        try {
            console.log('🔄 Initializing news page...');
            
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
            console.log('✅ News page initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing page:', error);
            hideLoading();
            showError();
        }
    }
    
    /*====================================================
      بدء التشغيل
    ====================================================*/
    
    // انتظار تحميل المكونات
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializePage, 100);
        });
    } else {
        setTimeout(initializePage, 100);
    }
    
    // احتياطي للتهيئة المباشرة
    setTimeout(() => {
        if (!isInitialized) {
            console.log('⏰ Timeout reached, force initializing...');
            initializePage();
        }
    }, 3000);
});

/*====================================================
  وظائف مساعدة للتصحيح
====================================================*/

window.NewsPageDebug = {
    reloadNews: () => location.reload(),
    
    filterByCategory: (category) => {
        const filter = document.getElementById('newsCategoryFilter');
        if (filter) {
            filter.value = category;
            filter.dispatchEvent(new Event('change'));
        }
    },
    
    searchNews: (term) => {
        const search = document.getElementById('newsSearchInput');
        if (search) {
            search.value = term;
            search.dispatchEvent(new Event('input'));
        }
    },
    
    showStats: () => {
        console.log('📊 News Stats:', {
            totalNews: window.allNews?.length || 0,
            filteredNews: window.filteredNews?.length || 0,
            currentLanguage: window.currentLanguage || 'unknown',
            isInitialized: window.isInitialized || false
        });
    }
};

// ========================================
// ملف: /public/js/page-specific/news-detail.js (نهائي ومحدث)
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Enhanced News Detail System Initializing...');
    
    // Variables and DOM Elements
    const newsDetailContainer = document.getElementById('newsDetailContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorContainer = document.getElementById('errorContainer');
    const breadcrumbTitle = document.getElementById('breadcrumbTitle');
    const socialShareSection = document.getElementById('socialShareSection');
    const relatedArticlesSection = document.getElementById('relatedArticlesSection');
    
    // URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    
    // State Management
    let translations = {};
    let currentArticle = null;
    let currentLanguage = 'ar';
    let isInitialized = false;
    
    /*====================================================
      التحقق من المتطلبات
    ====================================================*/
    
    function validateRequirements() {
        if (!newsDetailContainer) {
            console.error('❌ News detail container not found');
            return false;
        }
        
        if (!newsId) {
            console.error('❌ No news ID provided in URL');
            showError('لم يتم تحديد معرف الخبر في الرابط');
            return false;
        }
        
        return true;
    }
    
    /*====================================================
      إدارة حالات العرض
    ====================================================*/
    
    function showLoading() {
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (newsDetailContainer) newsDetailContainer.style.display = 'none';
        if (errorContainer) errorContainer.style.display = 'none';
    }
    
    function showContent() {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (newsDetailContainer) newsDetailContainer.style.display = 'block';
        if (errorContainer) errorContainer.style.display = 'none';
    }
    
    function showError(message = 'حدث خطأ أثناء تحميل الخبر') {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (newsDetailContainer) newsDetailContainer.style.display = 'none';
        if (errorContainer) {
            errorContainer.style.display = 'block';
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }
        
        updatePageTitle('خطأ في تحميل الخبر');
    }
    
    /*====================================================
      انتظار وتحميل الترجمات
    ====================================================*/
    
    async function waitForI18n() {
        return new Promise((resolve) => {
            if (typeof i18next !== 'undefined' && i18next.isInitialized) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (typeof i18next !== 'undefined' && i18next.isInitialized) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 5000);
            }
        });
    }
    
    async function loadTranslationFile(lang, namespace) {
        try {
            const response = await fetch(`/public/locales/${lang}/${namespace}.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`❌ Failed to load ${lang}/${namespace}.json:`, error);
            
            if (lang !== 'ar') {
                return await loadTranslationFile('ar', namespace);
            }
            
            return {};
        }
    }
    
    async function fetchTranslations() {
        try {
            await waitForI18n();
            
            currentLanguage = (typeof i18next !== 'undefined' && i18next.language) || 'ar';
            console.log(`🌍 Loading translations for: ${currentLanguage}`);
            
            const [newsTranslations, commonTranslations] = await Promise.all([
                loadTranslationFile(currentLanguage, 'news'),
                loadTranslationFile(currentLanguage, 'common')
            ]);
            
            translations = {
                ...commonTranslations,
                ...newsTranslations
            };
            
            return translations.news_articles || [];
            
        } catch (error) {
            console.error('❌ Error fetching translations:', error);
            return [];
        }
    }
    
    /*====================================================
      البحث عن المقال وعرضه
    ====================================================*/
    
    async function findAndDisplayArticle() {
        try {
            console.log(`🔍 Looking for article with ID: ${newsId}`);
            
            const newsArticles = await fetchTranslations();
            const article = newsArticles.find(item => item && item.id === newsId);
            
            if (!article) {
                console.error(`❌ Article with ID ${newsId} not found`);
                showError('الخبر غير موجود أو تم حذفه');
                return;
            }
            
            currentArticle = article;
            console.log('✅ Article found:', article.title);
            
            // تحديث عنوان الصفحة والمسار
            updatePageTitle(article.title);
            updateBreadcrumb(article.title);
            
            // تحديث البيانات الوصفية
            updateMetadata(article);
            
            // إنشاء وعرض المحتوى
            const contentHtml = createDetailContent(article);
            newsDetailContainer.innerHTML = contentHtml;
            
            // عرض المحتوى
            showContent();
            
            // تحميل المحتوى الإضافي
            loadAdditionalContent(article);
            
            console.log('✅ Article displayed successfully');
            
        } catch (error) {
            console.error('❌ Error finding/displaying article:', error);
            showError('حدث خطأ أثناء تحميل تفاصيل الخبر');
        }
    }
    
    /*====================================================
      إنشاء محتوى التفاصيل
    ====================================================*/
    
    function createDetailContent(article) {
        const categoryKey = `category${(article.category || '').replace(/\s/g, '')}`;
        const categoryText = translations[categoryKey] || article.category || 'عام';
        
        let contentHtml = `
            <div class="news-detail-header">
                <span class="news-detail-category">${categoryText}</span>
                <h1>${article.title || 'عنوان غير متوفر'}</h1>
                <div class="news-detail-meta">
                    <span class="meta-item">
                        <i class="far fa-calendar"></i>
                        ${article.date || ''}
                    </span>
                    ${article.author ? `
                        <span class="meta-item">
                            <i class="far fa-user"></i>
                            ${article.author}
                        </span>
                    ` : ''}
                    ${article.readTime ? `
                        <span class="meta-item">
                            <i class="far fa-clock"></i>
                            ${article.readTime}
                        </span>
                    ` : ''}
                </div>
                ${article.tags && article.tags.length > 0 ? `
                    <div class="news-tags">
                        ${article.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // الصورة الرئيسية
        if (article.image_title) {
            const imagePath = `/public/images/news/news.title/${article.image_title}`;
            contentHtml += `
                <div class="news-detail-image-container">
                    <img src="${imagePath}" 
                         alt="${article.title || 'صورة الخبر'}" 
                         class="news-detail-image-main"
                         onerror="this.style.display='none'; console.warn('Failed to load main image');">
                </div>
            `;
        }
        
        // محتوى المقال
        contentHtml += `<div class="news-detail-content">`;
        
        if (article.content_parts && Array.isArray(article.content_parts)) {
            article.content_parts.forEach((part, index) => {
                if (!part || !part.type) return;
                
                switch (part.type) {
                    case 'text':
                        if (part.value) {
                            contentHtml += `<p class="content-paragraph">${part.value}</p>`;
                        }
                        break;
                        
                    case 'image':
                        if (part.value) {
                            const imagePath = `/public/images/news/news/${part.value}`;
                            contentHtml += `
                                <div class="content-image-container">
                                    <img src="${imagePath}" 
                                         alt="صورة من المقال ${index + 1}" 
                                         class="content-image"
                                         loading="lazy"
                                         onerror="this.parentElement.style.display='none';">
                                </div>
                            `;
                        }
                        break;
                        
                    case 'video':
                        if (part.value) {
                            contentHtml += `
                                <div class="content-video-container">
                                    <video controls class="content-video" preload="metadata">
                                        <source src="${part.value}" type="video/mp4">
                                        <p>متصفحك لا يدعم تشغيل الفيديو. 
                                           <a href="${part.value}">انقر هنا لتحميل الفيديو</a>
                                        </p>
                                    </video>
                                </div>
                            `;
                        }
                        break;
                }
            });
        } else if (article.excerpt) {
            contentHtml += `<p class="content-paragraph">${article.excerpt}</p>`;
        }
        
        contentHtml += `</div>`;
        
        // رابط العودة
        const backText = translations.backToNews || 'العودة إلى الأخبار';
        contentHtml += `
            <div class="news-detail-footer">
                <a href="/public/html/news.html" class="back-to-news-link">
                    <i class="fas fa-arrow-right"></i>
                    <span>${backText}</span>
                </a>
            </div>
        `;
        
        return contentHtml;
    }
    
    /*====================================================
      تحديث البيانات الوصفية
    ====================================================*/
    
    function updatePageTitle(title) {
        const titleText = title || 'تفاصيل الخبر';
        
        // تحديث عنوان الصفحة
        const pageTitle = document.getElementById('detailPageTitle');
        if (pageTitle) {
            pageTitle.textContent = titleText;
        }
        
        // تحديث عنوان المتصفح
        document.title = `${titleText} - سفارة دولة فلسطين في تركيا`;
    }
    
    function updateBreadcrumb(title) {
        if (breadcrumbTitle && title) {
            breadcrumbTitle.textContent = title;
        }
    }
    
    function updateMetadata(article) {
        // تحديث Open Graph
        updateMetaTag('property', 'og:title', article.title);
        updateMetaTag('property', 'og:description', article.excerpt);
        updateMetaTag('name', 'description', article.excerpt);
        
        if (article.image_title) {
            const imageUrl = `${window.location.origin}/public/images/news/news.title/${article.image_title}`;
            updateMetaTag('property', 'og:image', imageUrl);
        }
        
        // تحديث البيانات المنظمة
        updateStructuredData(article);
    }
    
    function updateMetaTag(attribute, name, content) {
        if (!content) return;
        
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }
    
    function updateStructuredData(article) {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "datePublished": article.date,
            "author": {
                "@type": "Organization",
                "name": article.author || "سفارة دولة فلسطين في تركيا"
            },
            "publisher": {
                "@type": "Organization",
                "name": "سفارة دولة فلسطين في تركيا",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${window.location.origin}/public/images/logo.png`
                }
            }
        };
        
        if (article.excerpt) {
            structuredData.description = article.excerpt;
        }
        
        if (article.image_title) {
            structuredData.image = `${window.location.origin}/public/images/news/news.title/${article.image_title}`;
        }
        
        const scriptTag = document.getElementById('structuredData');
        if (scriptTag) {
            scriptTag.textContent = JSON.stringify(structuredData, null, 2);
        }
    }
    
    /*====================================================
      تحميل المحتوى الإضافي
    ====================================================*/
    
    function loadAdditionalContent(article) {
        // تفعيل المشاركة الاجتماعية
        if (socialShareSection) {
            socialShareSection.style.display = 'block';
            setupSocialSharing(article);
        }
        
        // تحميل المقالات ذات الصلة
        loadRelatedArticles(article);
    }
    
    function setupSocialSharing(article) {
        const currentUrl = window.location.href;
        const shareTitle = article.title || document.title;
        
        // تحديث أحداث المشاركة
        const shareButtons = {
            shareFacebook: () => shareOnFacebook(currentUrl, shareTitle),
            shareTwitter: () => shareOnTwitter(currentUrl, shareTitle),
            shareWhatsApp: () => shareOnWhatsApp(currentUrl, shareTitle),
            copyLink: () => copyToClipboard(currentUrl)
        };
        
        Object.entries(shareButtons).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                button.onclick = handler;
            }
        });
    }
    
    async function loadRelatedArticles(article) {
        try {
            const allArticles = await fetchTranslations();
            const related = allArticles
                .filter(a => a.id !== article.id && a.category === article.category)
                .slice(0, 3);
            
            if (related.length > 0 && relatedArticlesSection) {
                const relatedGrid = document.getElementById('relatedArticlesGrid');
                if (relatedGrid) {
                    relatedGrid.innerHTML = related.map(createRelatedArticleCard).join('');
                    relatedArticlesSection.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('❌ Error loading related articles:', error);
        }
    }
    
    function createRelatedArticleCard(article) {
        const imagePath = article.image_title ? 
            `/public/images/news/news.title/${article.image_title}` : 
            '/public/images/news/news,9.jpg';
        
        return `
            <a href="/public/html/news-detail.html?id=${article.id}" class="related-article-card">
                <img src="${imagePath}" alt="${article.title}" loading="lazy">
                <div class="related-article-content">
                    <h4>${article.title}</h4>
                    <span class="related-article-date">${article.date}</span>
                </div>
            </a>
        `;
    }
    
    /*====================================================
      وظائف المشاركة الاجتماعية
    ====================================================*/
    
    function shareOnFacebook(url, title) {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    function shareOnTwitter(url, title) {
        const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showCopyMessage();
            }).catch(err => {
                console.error('❌ Failed to copy:', err);
                fallbackCopyToClipboard(text);
            });
        } else {
            fallbackCopyToClipboard(text);
        }
    }
    
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showCopyMessage();
        } catch (err) {
            console.error('❌ Fallback copy failed:', err);
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    function showCopyMessage() {
        const copyMessage = document.getElementById('copyMessage');
        if (copyMessage) {
            copyMessage.style.display = 'block';
            setTimeout(() => {
                copyMessage.style.display = 'none';
            }, 2000);
        }
    }
    
    /*====================================================
      معالجة تغيير اللغة
    ====================================================*/
    
    async function handleLanguageChange(lng) {
        try {
            console.log(`🔄 Language changed to: ${lng}, reloading article...`);
            
            showLoading();
            await findAndDisplayArticle();
            
        } catch (error) {
            console.error('❌ Error handling language change:', error);
            showError('حدث خطأ أثناء تغيير اللغة');
        }
    }
    
    /*====================================================
      التهيئة الرئيسية
    ====================================================*/
    
    async function initializePage() {
        try {
            console.log('🔄 Initializing news detail page...');
            
            // التحقق من المتطلبات
            if (!validateRequirements()) {
                return;
            }
            
            // عرض مؤشر التحميل
            showLoading();
            
            // البحث عن المقال وعرضه
            await findAndDisplayArticle();
            
            // إعداد مستمعي الأحداث
            if (typeof i18next !== 'undefined') {
                i18next.on('languageChanged', handleLanguageChange);
            }
            
            isInitialized = true;
            console.log('✅ News detail page initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing page:', error);
            showError('حدث خطأ أثناء تهيئة الصفحة');
        }
    }
    
    /*====================================================
      بدء التشغيل
    ====================================================*/
    
    // التشغيل الفوري أو المتأخر
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
    }, 3000);
});

/*====================================================
  وظائف مساعدة للتصحيح
====================================================*/

window.NewsDetailDebug = {
    reloadDetail: () => location.reload(),
    
    getCurrentNewsId: () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    },
    
    showCurrentArticle: () => {
        console.log('📰 Current Article:', window.currentArticle);
    },
    
    testSocialShare: (platform) => {
        const url = window.location.href;
        const title = document.title;
        
        switch(platform) {
            case 'facebook':
                shareOnFacebook(url, title);
                break;
            case 'twitter':
                shareOnTwitter(url, title);
                break;
            case 'whatsapp':
                shareOnWhatsApp(url, title);
                break;
            case 'copy':
                copyToClipboard(url);
                break;
            default:
                console.log('Available platforms: facebook, twitter, whatsapp, copy');
        }
    },
    
    checkTranslations: () => {
        console.log('🌍 Current translations:', window.translations);
    }
};

// ========================================
// تحسينات إضافية لـ CSS
// ========================================

// إضافة أنماط ديناميكية للمكونات الجديدة
const additionalStyles = `
<style>
/* تحسينات بطاقة الأخبار */
.news-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
}

.news-read-time {
    font-size: 0.8em;
    color: #6c757d;
    display: flex;
    align-items: center;
    gap: 4px;
}

.news-read-time::before {
    content: '⏱️';
    opacity: 0.7;
}

/* تحسينات صفحة التفاصيل */
.news-detail-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin: 15px 0;
    padding: 15px 0;
    border-bottom: 1px solid #e0e0e0;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6c757d;
    font-size: 0.9em;
}

.meta-item i {
    color: #007bff;
}

.news-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 15px 0;
}

.news-tag {
    background: #e3f2fd;
    color: #1976d2;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 0.8em;
    font-weight: 500;
}

.content-paragraph {
    margin-bottom: 20px;
    line-height: 1.8;
    text-align: justify;
}

.content-image-container,
.content-video-container {
    margin: 25px 0;
    text-align: center;
}

.content-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.content-video {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}

.news-detail-footer {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 2px solid #e0e0e0;
    text-align: center;
}

.back-to-news-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 25px;
    background: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.back-to-news-link:hover {
    background: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}

/* المقالات ذات الصلة */
.related-article-card {
    display: block;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
}

.related-article-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.related-article-card img {
    width: 100%;
    height: 150px;
    object-fit: cover;
}

.related-article-content {
    padding: 15px;
}

.related-article-content h4 {
    font-size: 1.1em;
    margin-bottom: 8px;
    line-height: 1.4;
    color: #333;
}

.related-article-date {
    font-size: 0.8em;
    color: #6c757d;
}

/* رسائل الخطأ المحسنة */
.error-message {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* تحسينات الاستجابة */
@media (max-width: 768px) {
    .news-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    
    .news-detail-meta {
        flex-direction: column;
        gap: 10px;
    }
    
    .news-tags {
        justify-content: center;
    }
    
    .related-article-card img {
        height: 120px;
    }
}

/* تحسينات إمكانية الوصول */
@media (prefers-reduced-motion: reduce) {
    .news-card,
    .related-article-card,
    .back-to-news-link {
        transition: none !important;
    }
    
    .error-message {
        animation: none !important;
    }
}

/* وضع الطباعة */
@media print {
    .back-to-news-link,
    .social-share-section,
    .related-articles-section {
        display: none !important;
    }
    
    .content-image,
    .content-video {
        max-width: 100% !important;
        page-break-inside: avoid;
    }
}
</style>
`;

// إضافة الأنماط إلى الصفحة
if (document.head) {
    document.head.insertAdjacentHTML('beforeend', additionalStyles);
}

// ========================================
// إضافات للأمان والأداء
// ========================================

// حماية من XSS في المحتوى الديناميكي
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// تحسين الأداء - lazy loading للصور
function enableLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// تحسين SEO - إضافة structured data
function addStructuredData(article) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "datePublished": article.date,
        "author": {
            "@type": "Organization",
            "name": "سفارة دولة فلسطين في تركيا"
        },
        "publisher": {
            "@type": "Organization",
            "name": "سفارة دولة فلسطين في تركيا"
        }
    });
    document.head.appendChild(script);
}

// معالجة الأخطاء العامة
window.addEventListener('unhandledrejection', event => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

console.log('✅ Enhanced News System loaded successfully!');