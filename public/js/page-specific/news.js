/*====================================================
  NEWS.JS - محدث بدون عرض الفئة ووقت القراءة
  نظام أخبار محدث ومتوافق مع التصميم العام
====================================================*/

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Updated News System Initializing...');
    
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
      إنشاء بطاقات الأخبار - بدون فئة ووقت قراءة
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
                 alt="${article.title || 'صورة الخبر'}" 
                 loading="lazy"
                 onerror="this.src='/public/images/news/news,9.jpg'; this.onerror=null;">
            
            <div class="news-card-content">
                <h3>
                    <a href="/public/html/news-detail.html?id=${article.id}" 
                       aria-label="اقرأ تفاصيل: ${article.title || 'الخبر'}">
                        ${article.title || 'عنوان غير متوفر'}
                    </a>
                </h3>
                
                <p class="news-excerpt">${article.excerpt || 'وصف غير متوفر'}</p>
                
                <div class="news-meta">
                    <span class="news-date">${article.date || ''}</span>
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
                    background: var(--news-bg-card);
                    border-radius: var(--news-radius);
                    border: 1px solid var(--news-border);
                    color: var(--news-text-primary);
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--news-accent); margin-bottom: 15px;"></i>
                    <h3 style="color: var(--news-accent); margin-bottom: 10px;">خطأ في تحميل الأخبار</h3>
                    <p style="color: var(--news-text-secondary); margin-bottom: 20px;">حدث خطأ أثناء تحميل الأخبار. يرجى المحاولة مرة أخرى.</p>
                    <button onclick="location.reload()" style="
                        background: var(--news-accent);
                        color: var(--news-bg-dark);
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: 600;
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
            console.log('🔄 Initializing updated news page...');
            
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
            console.log('✅ Updated news page initialized successfully');
            
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

console.log('✅ Updated News System loaded successfully!');