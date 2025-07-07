/*====================================================
  NEWS-DETAIL.JS - إصدار متكامل مع نظام الترجمة i18next
  حل شامل لمشكلة الترجمة وعرض تفاصيل الأخبار
====================================================*/

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 News Detail with i18n Integration - Starting...');
    
    // State Management
    let pageState = {
        newsId: null,
        currentArticle: null,
        newsArticles: [],
        isLoading: false,
        isInitialized: false,
        currentLanguage: 'ar'
    };
    
    // DOM Elements
    let elements = {
        container: null,
        loading: null,
        error: null,
        pageTitle: null,
        breadcrumb: null
    };
    
    /*====================================================
      تهيئة العناصر والمتغيرات
    ====================================================*/
    
    function initializeElements() {
        elements = {
            container: document.getElementById('newsDetailContainer'),
            loading: document.getElementById('loadingIndicator'), 
            error: document.getElementById('errorContainer'),
            pageTitle: document.getElementById('detailPageTitle'),
            breadcrumb: document.getElementById('breadcrumbTitle')
        };
        
        // الحصول على معرف المقال
        const urlParams = new URLSearchParams(window.location.search);
        pageState.newsId = urlParams.get('id');
        
        console.log('🆔 News ID:', pageState.newsId);
        console.log('📋 Elements found:', Object.keys(elements).filter(key => elements[key]));
        
        return pageState.newsId && elements.container;
    }
    
    /*====================================================
      انتظار تهيئة i18next
    ====================================================*/
    
    function waitForI18next() {
        return new Promise((resolve) => {
            if (typeof i18next !== 'undefined' && i18next.isInitialized) {
                pageState.currentLanguage = i18next.language || 'ar';
                console.log('✅ i18next already initialized, language:', pageState.currentLanguage);
                resolve();
            } else {
                console.log('⏳ Waiting for i18next initialization...');
                
                // الاستماع لحدث i18nextReady
                document.addEventListener('i18nextReady', (event) => {
                    pageState.currentLanguage = event.detail?.language || 'ar';
                    console.log('✅ i18next ready, language:', pageState.currentLanguage);
                    resolve();
                });
                
                // احتياطي بعد 5 ثوانِ
                setTimeout(() => {
                    pageState.currentLanguage = 'ar';
                    console.log('⏰ Timeout, using default language: ar');
                    resolve();
                }, 5000);
            }
        });
    }
    
    /*====================================================
      تحميل الترجمات والبيانات
    ====================================================*/
    
    async function loadNewsData() {
        try {
            console.log(`📥 Loading news data for language: ${pageState.currentLanguage}`);
            
            // تحميل ملف الأخبار للغة الحالية
            const response = await fetch(`/public/locales/${pageState.currentLanguage}/news.json`);
            
            if (!response.ok) {
                console.warn(`⚠️ Failed to load ${pageState.currentLanguage}, trying Arabic...`);
                const arabicResponse = await fetch('/public/locales/ar/news.json');
                
                if (!arabicResponse.ok) {
                    throw new Error('فشل في تحميل ملفات البيانات');
                }
                
                const arabicData = await arabicResponse.json();
                pageState.newsArticles = arabicData.news_articles || [];
            } else {
                const data = await response.json();
                pageState.newsArticles = data.news_articles || [];
            }
            
            console.log(`✅ Loaded ${pageState.newsArticles.length} articles`);
            return pageState.newsArticles;
            
        } catch (error) {
            console.error('❌ Error loading news data:', error);
            throw new Error('حدث خطأ أثناء تحميل بيانات الأخبار');
        }
    }
    
    /*====================================================
      إدارة حالات العرض
    ====================================================*/
    
    function showLoading() {
        console.log('⏳ Showing loading...');
        pageState.isLoading = true;
        
        if (elements.loading) elements.loading.style.display = 'flex';
        if (elements.container) elements.container.style.display = 'none';
        if (elements.error) elements.error.style.display = 'none';
    }
    
    function showContent() {
        console.log('✅ Showing content...');
        pageState.isLoading = false;
        
        if (elements.loading) elements.loading.style.display = 'none';
        if (elements.container) elements.container.style.display = 'block';
        if (elements.error) elements.error.style.display = 'none';
    }
    
    function showError(message) {
        console.error('❌ Showing error:', message);
        pageState.isLoading = false;
        
        if (elements.loading) elements.loading.style.display = 'none';
        if (elements.container) elements.container.style.display = 'none';
        
        if (elements.error) {
            elements.error.style.display = 'block';
            const errorMsg = elements.error.querySelector('#errorMessage');
            if (errorMsg) {
                errorMsg.textContent = message;
            }
        } else {
            createErrorDisplay(message);
        }
        
        updatePageTitle('خطأ في تحميل الخبر');
    }
    
    function createErrorDisplay(message) {
        if (!elements.container) return;
        
        const errorHtml = `
            <div class="error-display">
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle error-icon"></i>
                    <h2 class="error-title">خطأ في تحميل الخبر</h2>
                    <p class="error-message">${message}</p>
                    <div class="error-actions">
                        <button onclick="location.reload()" class="retry-button">
                            <i class="fas fa-refresh"></i>
                            إعادة المحاولة
                        </button>
                        <a href="/public/html/news.html" class="back-button">
                            <i class="fas fa-arrow-right"></i>
                            العودة إلى الأخبار
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        elements.container.innerHTML = errorHtml;
        elements.container.style.display = 'block';
    }
    
    /*====================================================
      البحث عن المقال وعرضه
    ====================================================*/
    
    async function findAndDisplayArticle() {
        try {
            console.log('🔍 Searching for article...');
            
            if (!pageState.newsId) {
                throw new Error('لم يتم تحديد معرف الخبر في الرابط');
            }
            
            // تحميل البيانات
            await loadNewsData();
            
            // البحث عن المقال
            const article = pageState.newsArticles.find(item => {
                return item && String(item.id) === String(pageState.newsId);
            });
            
            if (!article) {
                console.error('❌ Article not found');
                console.log('📋 Available IDs:', pageState.newsArticles.map(a => a?.id));
                throw new Error(`المقال رقم ${pageState.newsId} غير موجود`);
            }
            
            pageState.currentArticle = article;
            console.log('✅ Article found:', article.title);
            
            // عرض المقال
            displayArticleWithTranslations(article);
            
        } catch (error) {
            console.error('❌ Error in findAndDisplayArticle:', error);
            showError(error.message);
        }
    }
    
    /*====================================================
      عرض المقال مع الترجمات
    ====================================================*/
    
    function displayArticleWithTranslations(article) {
        try {
            console.log('🎨 Displaying article with translations...');
            
            // تحديث عناوين الصفحة
            updatePageTitle(article.title);
            updateBreadcrumb(article.title);
            
            // إنشاء محتوى المقال
            const content = createArticleHTML(article);
            
            // عرض المحتوى
            if (elements.container) {
                elements.container.innerHTML = content;
                showContent();
                
                // تطبيق الترجمات على العناصر الجديدة
                applyTranslationsToNewElements();
            }
            
            // تحديث الميتا تاجز
            updateMetadata(article);
            
            console.log('✅ Article displayed with translations');
            
        } catch (error) {
            console.error('❌ Error displaying article:', error);
            showError('حدث خطأ أثناء عرض المقال');
        }
    }
    
    function createArticleHTML(article) {
        // تحديد النصوص المترجمة
        const texts = getTranslatedTexts();
        
        // تحديد فئة المقال
        const categoryText = getCategoryText(article.category);
        
        let html = `
            <article class="news-detail-article">
                <header class="article-header">
                    <div class="article-category">
                        <span class="category-badge">${categoryText}</span>
                    </div>
                    <h1 class="article-title">${article.title || texts.untitled}</h1>
                    <div class="article-meta">
                        <div class="meta-item">
                            <i class="far fa-calendar-alt"></i>
                            <span>${article.date || ''}</span>
                        </div>
                        ${article.author ? `
                            <div class="meta-item">
                                <i class="far fa-user"></i>
                                <span>${article.author}</span>
                            </div>
                        ` : ''}
                        ${article.readTime ? `
                            <div class="meta-item">
                                <i class="far fa-clock"></i>
                                <span>${article.readTime}</span>
                            </div>
                        ` : ''}
                    </div>
                </header>
        `;
        
        // الصورة الرئيسية
        if (article.image_title) {
            html += `
                <div class="article-image-main">
                    <img src="/public/images/news/news.title/${article.image_title}" 
                         alt="${article.title}" 
                         onerror="this.style.display='none'"
                         loading="lazy">
                </div>
            `;
        }
        
        // محتوى المقال
        html += `<div class="article-content">`;
        html += createContentHTML(article);
        html += `</div>`;
        
        // العلامات
        if (article.tags && Array.isArray(article.tags) && article.tags.length > 0) {
            html += `
                <div class="article-tags">
                    <h3>${texts.tags}:</h3>
                    <div class="tags-list">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        // رابط العودة
        html += `
                <footer class="article-footer">
                    <a href="/public/html/news.html" class="back-to-news">
                        <i class="fas fa-arrow-right"></i>
                        <span>${texts.backToNews}</span>
                    </a>
                </footer>
            </article>
        `;
        
        return html;
    }
    
    function createContentHTML(article) {
        let contentHtml = '';
        
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
                            contentHtml += `
                                <div class="content-image-wrapper">
                                    <img src="/public/images/news/news/${part.value}" 
                                         alt="صورة من المقال ${index + 1}" 
                                         onerror="this.parentElement.style.display='none'"
                                         loading="lazy">
                                </div>
                            `;
                        }
                        break;
                        
                    case 'video':
                        if (part.value) {
                            contentHtml += `
                                <div class="content-video-wrapper">
                                    <video controls preload="metadata">
                                        <source src="${part.value}" type="video/mp4">
                                        <p>متصفحك لا يدعم تشغيل الفيديو</p>
                                    </video>
                                </div>
                            `;
                        }
                        break;
                }
            });
        } else if (article.excerpt) {
            contentHtml += `<p class="content-paragraph">${article.excerpt}</p>`;
        } else {
            const texts = getTranslatedTexts();
            contentHtml += `<p class="content-paragraph">${texts.noContent}</p>`;
        }
        
        return contentHtml;
    }
    
    /*====================================================
      الترجمات والنصوص
    ====================================================*/
    
    function getTranslatedTexts() {
        // النصوص الافتراضية
        const defaultTexts = {
            untitled: 'عنوان غير متوفر',
            tags: 'العلامات',
            backToNews: 'العودة إلى الأخبار',
            noContent: 'محتوى هذا المقال غير متوفر حالياً',
            publishedOn: 'نُشر في',
            author: 'الكاتب',
            readTime: 'وقت القراءة',
            category: 'الفئة'
        };
        
        // محاولة الحصول على الترجمات من i18next
        if (typeof i18next !== 'undefined' && i18next.isInitialized) {
            return {
                untitled: i18next.t('news:untitled', { defaultValue: defaultTexts.untitled }),
                tags: i18next.t('news:tags', { defaultValue: defaultTexts.tags }),
                backToNews: i18next.t('news:backToNews', { defaultValue: defaultTexts.backToNews }),
                noContent: i18next.t('news:noContent', { defaultValue: defaultTexts.noContent }),
                publishedOn: i18next.t('news:publishedOn', { defaultValue: defaultTexts.publishedOn }),
                author: i18next.t('news:author', { defaultValue: defaultTexts.author }),
                readTime: i18next.t('news:readTime', { defaultValue: defaultTexts.readTime }),
                category: i18next.t('news:category', { defaultValue: defaultTexts.category })
            };
        }
        
        return defaultTexts;
    }
    
    function getCategoryText(category) {
        if (!category) return 'عام';
        
        // خريطة الفئات
        const categoryMap = {
            'إعلان': { ar: 'إعلان', en: 'Announcement', tr: 'Duyuru' },
            'فعالية': { ar: 'فعالية', en: 'Event', tr: 'Etkinlik' },
            'خدمات قنصلية': { ar: 'خدمات قنصلية', en: 'Consular Services', tr: 'Konsolosluk Hizmetleri' },
            'تعليم': { ar: 'تعليم', en: 'Education', tr: 'Eğitim' }
        };
        
        const categoryMapping = categoryMap[category];
        if (categoryMapping) {
            return categoryMapping[pageState.currentLanguage] || categoryMapping.ar;
        }
        
        // محاولة الترجمة عبر i18next
        if (typeof i18next !== 'undefined' && i18next.isInitialized) {
            const categoryKey = `category${category.replace(/\s/g, '')}`;
            const translated = i18next.t(`news:${categoryKey}`, { defaultValue: category });
            return translated;
        }
        
        return category;
    }
    
    function applyTranslationsToNewElements() {
        // تطبيق الترجمات على العناصر الجديدة إذا كان i18next متاحاً
        if (typeof i18next !== 'undefined' && i18next.isInitialized) {
            console.log('🔄 Applying translations to new elements...');
            
            // البحث عن العناصر التي تحتوي على data-i18n
            const elementsToTranslate = elements.container.querySelectorAll('[data-i18n]');
            
            elementsToTranslate.forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = i18next.t(key);
                
                if (translation && translation !== key) {
                    element.textContent = translation;
                }
            });
        }
    }
    
    /*====================================================
      تحديث البيانات الوصفية
    ====================================================*/
    
    function updatePageTitle(title) {
        const titleText = title || 'تفاصيل الخبر';
        
        if (elements.pageTitle) {
            elements.pageTitle.textContent = titleText;
        }
        
        document.title = `${titleText} - سفارة دولة فلسطين في تركيا`;
    }
    
    function updateBreadcrumb(title) {
        if (elements.breadcrumb && title) {
            elements.breadcrumb.textContent = title;
        }
    }
    
    function updateMetadata(article) {
        // تحديث description
        if (article.excerpt) {
            updateMetaTag('name', 'description', article.excerpt);
        }
        
        // تحديث Open Graph
        updateMetaTag('property', 'og:title', article.title);
        updateMetaTag('property', 'og:description', article.excerpt);
        updateMetaTag('property', 'og:type', 'article');
        updateMetaTag('property', 'og:url', window.location.href);
        
        if (article.image_title) {
            const imageUrl = `${window.location.origin}/public/images/news/news.title/${article.image_title}`;
            updateMetaTag('property', 'og:image', imageUrl);
        }
    }
    
    function updateMetaTag(attribute, name, content) {
        if (!content) return;
        
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            document.head.appendChild(meta);
        }
        meta.content = content;
    }
    
    /*====================================================
      معالجة تغيير اللغة
    ====================================================*/
    
    function handleLanguageChange(lng) {
        console.log(`🔄 Language changed to: ${lng}`);
        pageState.currentLanguage = lng;
        
        if (pageState.isInitialized && pageState.currentArticle) {
            console.log('🔄 Reloading article for new language...');
            showLoading();
            
            // إعادة تحميل المقال بالترجمة الجديدة
            setTimeout(() => {
                findAndDisplayArticle();
            }, 100);
        }
    }
    
    /*====================================================
      التهيئة الرئيسية
    ====================================================*/
    
    async function initializePage() {
        try {
            console.log('🔄 Initializing news detail page with i18n...');
            
            // تهيئة العناصر
            if (!initializeElements()) {
                throw new Error('عناصر الصفحة المطلوبة غير موجودة');
            }
            
            if (!pageState.newsId) {
                throw new Error('لم يتم تحديد معرف الخبر في الرابط');
            }
            
            // عرض مؤشر التحميل
            showLoading();
            
            // انتظار تهيئة i18next
            await waitForI18next();
            
            // البحث عن المقال وعرضه
            await findAndDisplayArticle();
            
            // إعداد مراقبة تغيير اللغة
            if (typeof i18next !== 'undefined') {
                i18next.on('languageChanged', handleLanguageChange);
            }
            
            pageState.isInitialized = true;
            console.log('✅ News detail page initialized with i18n support');
            
        } catch (error) {
            console.error('❌ Failed to initialize page:', error);
            showError(error.message);
        }
    }
    
    /*====================================================
      إضافة الأنماط
    ====================================================*/
    
    function addStyles() {
        const styles = `
            <style>
            .error-display {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 400px;
                padding: 40px 20px;
            }
            
            .error-content {
                text-align: center;
                max-width: 500px;
                background: #f8f9fa;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            
            .error-icon {
                font-size: 4rem;
                color: #dc3545;
                margin-bottom: 20px;
            }
            
            .error-title {
                font-size: 1.8em;
                color: #dc3545;
                margin-bottom: 15px;
                font-weight: 700;
            }
            
            .error-message {
                color: #6c757d;
                margin-bottom: 30px;
                font-size: 1.1em;
                line-height: 1.6;
            }
            
            .error-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .retry-button,
            .back-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s ease;
                border: none;
                cursor: pointer;
                font-size: 1em;
            }
            
            .retry-button {
                background: #007bff;
                color: white;
            }
            
            .retry-button:hover {
                background: #0056b3;
                transform: translateY(-2px);
            }
            
            .back-button {
                background: #6c757d;
                color: white;
            }
            
            .back-button:hover {
                background: #5a6268;
                transform: translateY(-2px);
                text-decoration: none;
            }
            
            .news-detail-article {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                line-height: 1.7;
            }
            
            .article-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e9ecef;
            }
            
            .category-badge {
                display: inline-block;
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9em;
                font-weight: 600;
                margin-bottom: 15px;
            }
            
            .article-title {
                font-size: 2.5em;
                color: #1a1a1a;
                margin: 15px 0;
                line-height: 1.3;
                font-weight: 700;
            }
            
            .article-meta {
                display: flex;
                justify-content: center;
                gap: 25px;
                flex-wrap: wrap;
                margin-top: 15px;
            }
            
            .meta-item {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #6c757d;
                font-size: 0.95em;
            }
            
            .meta-item i {
                color: #007bff;
            }
            
            .article-image-main {
                margin: 30px 0;
                text-align: center;
            }
            
            .article-image-main img {
                max-width: 100%;
                height: auto;
                border-radius: 12px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            }
            
            .article-content {
                font-size: 1.1em;
                line-height: 1.8;
                color: #333;
                margin: 30px 0;
            }
            
            .content-paragraph {
                margin-bottom: 25px;
                text-align: justify;
            }
            
            .content-image-wrapper,
            .content-video-wrapper {
                margin: 30px 0;
                text-align: center;
            }
            
            .content-image-wrapper img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .content-video-wrapper video {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
            }
            
            .article-tags {
                margin: 40px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .article-tags h3 {
                margin-bottom: 15px;
                color: #495057;
                font-size: 1.2em;
            }
            
            .tags-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .tag {
                background: #e3f2fd;
                color: #1976d2;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 0.9em;
                font-weight: 500;
            }
            
            .article-footer {
                margin-top: 40px;
                padding-top: 30px;
                border-top: 2px solid #e9ecef;
                text-align: center;
            }
            
            .back-to-news {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 15px 30px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .back-to-news:hover {
                background: #0056b3;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,123,255,0.3);
                color: white;
                text-decoration: none;
            }
            
            @media (max-width: 768px) {
                .news-detail-article {
                    padding: 15px;
                    margin: 10px;
                }
                
                .article-title {
                    font-size: 2em;
                }
                
                .article-meta {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .content-paragraph {
                    font-size: 1em;
                }
                
                .error-actions {
                    flex-direction: column;
                    align-items: center;
                }
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    /*====================================================
      أدوات التصحيح
    ====================================================*/
    
    window.NewsDetailDebug = {
        getState: () => pageState,
        getElements: () => elements,
        reload: () => location.reload(),
        testArticle: (id) => {
            const url = new URL(window.location);
            url.searchParams.set('id', id);
            window.location.href = url.toString();
        },
        showAvailableIds: () => {
            console.log('Available article IDs:', pageState.newsArticles.map(a => ({
                id: a.id,
                title: a.title
            })));
        },
        testTranslation: (key) => {
            if (typeof i18next !== 'undefined') {
                console.log(`Translation for "${key}":`, i18next.t(key));
            } else {
                console.log('i18next not available');
            }
        },
        forceLanguage: (lang) => {
            if (typeof i18next !== 'undefined') {
                i18next.changeLanguage(lang);
            } else {
                pageState.currentLanguage = lang;
                findAndDisplayArticle();
            }
        },
        checkI18next: () => {
            console.log('i18next status:', {
                available: typeof i18next !== 'undefined',
                initialized: typeof i18next !== 'undefined' ? i18next.isInitialized : false,
                language: typeof i18next !== 'undefined' ? i18next.language : 'not available',
                currentPageLang: pageState.currentLanguage
            });
        }
    };
    
    /*====================================================
      بدء التشغيل
    ====================================================*/
    
    // إضافة الأنماط
    addStyles();
    
    // بدء التطبيق
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        setTimeout(initializePage, 100);
    }
    
    // احتياطي للتهيئة
    setTimeout(() => {
        if (!pageState.isInitialized) {
            console.log('⏰ Timeout reached, forcing initialization...');
            initializePage();
        }
    }, 8000);
    
    console.log('✅ News Detail with i18n Integration Loaded!');
});

/*====================================================
  إضافة الترجمات المفقودة إلى ملفات JSON
====================================================*/

// يجب إضافة هذه المفاتيح إلى ملفات الترجمة:
const requiredTranslationKeys = {
    ar: {
        "untitled": "عنوان غير متوفر",
        "tags": "العلامات", 
        "backToNews": "العودة إلى الأخبار",
        "noContent": "محتوى هذا المقال غير متوفر حالياً",
        "publishedOn": "نُشر في",
        "author": "الكاتب",
        "readTime": "وقت القراءة",
        "category": "الفئة",
        "errorLoading": "خطأ في تحميل الخبر",
        "tryAgain": "إعادة المحاولة"
    },
    en: {
        "untitled": "Title Not Available",
        "tags": "Tags",
        "backToNews": "Back to News", 
        "noContent": "Content for this article is currently not available",
        "publishedOn": "Published on",
        "author": "Author",
        "readTime": "Reading Time",
        "category": "Category",
        "errorLoading": "Error Loading News",
        "tryAgain": "Try Again"
    },
    tr: {
        "untitled": "Başlık Mevcut Değil",
        "tags": "Etiketler",
        "backToNews": "Haberlere Dön",
        "noContent": "Bu makalenin içeriği şu anda mevcut değil", 
        "publishedOn": "Yayınlanma Tarihi",
        "author": "Yazar",
        "readTime": "Okuma Süresi", 
        "category": "Kategori",
        "errorLoading": "Haber Yüklenirken Hata",
        "tryAgain": "Tekrar Dene"
    }
};

console.log('📝 Required translation keys for news detail:', requiredTranslationKeys);