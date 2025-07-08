/*====================================================
  NEWS-DETAIL.JS - إصدار مُصحح مع دعم تغيير اللغة
  متوافق مع التصميم الموحد مع حل مشكلة تغيير اللغة
====================================================*/

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 News Detail Page - Fixed Language Support Starting...');
    
    // State Management
    let pageState = {
        newsId: null,
        currentArticle: null,
        newsArticles: [],
        isLoading: false,
        isInitialized: false,
        currentLanguage: 'ar',
        languageChangeInProgress: false
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
      انتظار تهيئة i18next مع تحسينات
    ====================================================*/
    
    function waitForI18next() {
        return new Promise((resolve) => {
            if (typeof i18next !== 'undefined' && i18next.isInitialized) {
                pageState.currentLanguage = i18next.language || document.documentElement.lang || 'ar';
                console.log('✅ i18next already initialized, language:', pageState.currentLanguage);
                resolve();
            } else {
                console.log('⏳ Waiting for i18next initialization...');
                
                // محاولة الحصول على اللغة من HTML
                pageState.currentLanguage = document.documentElement.lang || 'ar';
                
                // الاستماع لحدث i18nextReady
                const handleI18nReady = (event) => {
                    pageState.currentLanguage = event.detail?.language || pageState.currentLanguage;
                    console.log('✅ i18next ready via event, language:', pageState.currentLanguage);
                    document.removeEventListener('i18nextReady', handleI18nReady);
                    resolve();
                };
                
                document.addEventListener('i18nextReady', handleI18nReady);
                
                // فحص دوري
                const checkInterval = setInterval(() => {
                    if (typeof i18next !== 'undefined' && i18next.isInitialized) {
                        pageState.currentLanguage = i18next.language || pageState.currentLanguage;
                        clearInterval(checkInterval);
                        document.removeEventListener('i18nextReady', handleI18nReady);
                        console.log('✅ i18next ready via polling, language:', pageState.currentLanguage);
                        resolve();
                    }
                }, 100);
                
                // احتياطي بعد 5 ثوان
                setTimeout(() => {
                    clearInterval(checkInterval);
                    document.removeEventListener('i18nextReady', handleI18nReady);
                    console.log('⏰ Timeout, using detected language:', pageState.currentLanguage);
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
            
            // محاولة تحميل ملف اللغة الحالية
            let response = await fetch(`/public/locales/${pageState.currentLanguage}/news.json`);
            
            if (!response.ok) {
                console.warn(`⚠️ Failed to load ${pageState.currentLanguage}, trying Arabic...`);
                response = await fetch('/public/locales/ar/news.json');
                
                if (!response.ok) {
                    throw new Error('فشل في تحميل ملفات البيانات');
                }
                
                console.log('✅ Loaded Arabic fallback');
            } else {
                console.log(`✅ Loaded ${pageState.currentLanguage} successfully`);
            }
            
            const data = await response.json();
            pageState.newsArticles = data.news_articles || [];
            
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
            <div class="error-display" style="
                text-align: center;
                padding: 60px 20px;
                background: var(--news-detail-bg-card);
                border-radius: var(--news-detail-radius);
                margin: 40px auto;
                max-width: 600px;
                border: 1px solid var(--news-detail-border);
                box-shadow: 0 8px 25px var(--news-detail-shadow);
            ">
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle" style="
                        font-size: 4rem;
                        color: #dc3545;
                        margin-bottom: 25px;
                        filter: drop-shadow(0 4px 8px rgba(220,53,69,0.2));
                    "></i>
                    <h2 style="
                        color: var(--news-detail-text-primary);
                        margin-bottom: 20px;
                        font-size: 1.8rem;
                        font-family: var(--news-detail-font-heading);
                    ">خطأ في تحميل الخبر</h2>
                    <p style="
                        color: var(--news-detail-text-secondary);
                        margin-bottom: 30px;
                        font-size: 1.1rem;
                        line-height: 1.6;
                    ">${message}</p>
                    <div class="error-actions" style="
                        display: flex;
                        gap: 20px;
                        justify-content: center;
                        flex-wrap: wrap;
                    ">
                        <button onclick="location.reload()" style="
                            background: var(--news-detail-accent);
                            color: var(--news-detail-bg-dark);
                            border: none;
                            padding: 15px 25px;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 1rem;
                            transition: var(--news-detail-transition);
                        ">
                            <i class="fas fa-refresh" style="margin-left: 8px;"></i>
                            إعادة المحاولة
                        </button>
                        <a href="/public/html/news.html" style="
                            background: var(--news-detail-text-secondary);
                            color: var(--news-detail-text-primary);
                            text-decoration: none;
                            padding: 15px 25px;
                            border-radius: 8px;
                            font-weight: 600;
                            font-size: 1rem;
                            transition: var(--news-detail-transition);
                        ">
                            <i class="fas fa-arrow-right" style="margin-left: 8px;"></i>
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
            await displayArticleWithTranslations(article);
            
        } catch (error) {
            console.error('❌ Error in findAndDisplayArticle:', error);
            showError(error.message);
        }
    }
    
    /*====================================================
      عرض المقال مع الترجمات
    ====================================================*/
    
    async function displayArticleWithTranslations(article) {
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
                await applyTranslationsToNewElements();
            }
            
            // تحديث الميتا تاجز
            updateMetadata(article);
            
            // إعداد Social Share
            setupSocialShare();
            
            console.log('✅ Article displayed with translations');
            
        } catch (error) {
            console.error('❌ Error displaying article:', error);
            showError('حدث خطأ أثناء عرض المقال');
        }
    }
    
    function createArticleHTML(article) {
        // تحديد النصوص المترجمة
        const texts = getTranslatedTexts();
        
        let html = `
            <article class="news-detail-article">
                <header class="news-detail-header">
                    <h1 class="article-title">${escapeHtml(article.title || texts.untitled)}</h1>
                    <div class="news-detail-meta">
                        <div class="meta-item">
                            <i class="far fa-calendar-alt"></i>
                            <span>${escapeHtml(article.date || '')}</span>
                        </div>
                        ${article.author ? `
                            <div class="meta-item">
                                <i class="far fa-user"></i>
                                <span>${escapeHtml(article.author)}</span>
                            </div>
                        ` : ''}
                    </div>
                </header>
        `;
        
        // الصورة الرئيسية
        if (article.image_title) {
            html += `
                <img class="news-detail-image-main" 
                     src="/public/images/news/news.title/${article.image_title}" 
                     alt="${escapeHtml(article.title)}" 
                     onerror="this.style.display='none'"
                     loading="lazy">
            `;
        }
        
        // محتوى المقال
        html += `<div class="news-detail-content">`;
        html += createContentHTML(article);
        html += `</div>`;
        
        // العلامات
        if (article.tags && Array.isArray(article.tags) && article.tags.length > 0) {
            html += `
                <div class="article-tags">
                    <h3>${texts.tags}:</h3>
                    <div class="tags-list">
                        ${article.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        // رابط العودة
        html += `
                <a href="/public/html/news.html" class="news-detail-back-link">
                    <i class="fas fa-arrow-right"></i>
                    <span>${texts.backToNews}</span>
                </a>
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
                            contentHtml += `<p>${escapeHtml(part.value)}</p>`;
                        }
                        break;
                        
                    case 'image':
                        if (part.value) {
                            contentHtml += `
                                <img src="/public/images/news/news/${part.value}" 
                                     alt="${escapeHtml('صورة من المقال ' + (index + 1))}" 
                                     onerror="this.style.display='none'"
                                     loading="lazy">
                            `;
                        }
                        break;
                        
                    case 'video':
                        if (part.value) {
                            contentHtml += `
                                <div class="video-container">
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
            contentHtml += `<p>${escapeHtml(article.excerpt)}</p>`;
        } else {
            const texts = getTranslatedTexts();
            contentHtml += `<p>${texts.noContent}</p>`;
        }
        
        return contentHtml;
    }
    
    /*====================================================
      وظيفة تنظيف النصوص
    ====================================================*/
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /*====================================================
      الترجمات والنصوص المحسن
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
            readTime: 'وقت القراءة'
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
                readTime: i18next.t('news:readTime', { defaultValue: defaultTexts.readTime })
            };
        }
        
        return defaultTexts;
    }
    
    async function applyTranslationsToNewElements() {
        // تطبيق الترجمات على العناصر الجديدة إذا كان i18next متاحاً
        if (typeof i18next !== 'undefined' && i18next.isInitialized && elements.container) {
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
      معالجة تغيير اللغة - مُصحح
    ====================================================*/
    
    async function handleLanguageChange(lng) {
        try {
            if (pageState.languageChangeInProgress) {
                console.log('🔄 Language change already in progress, skipping...');
                return;
            }
            
            pageState.languageChangeInProgress = true;
            console.log(`🔄 Language changed to: ${lng}`);
            
            const oldLanguage = pageState.currentLanguage;
            pageState.currentLanguage = lng;
            
            if (pageState.isInitialized && pageState.currentArticle) {
                console.log('🔄 Reloading article for new language...');
                showLoading();
                
                try {
                    // إعادة تحميل المقال بالترجمة الجديدة
                    await findAndDisplayArticle();
                    console.log('✅ Article reloaded successfully for new language');
                } catch (error) {
                    console.error('❌ Error reloading article:', error);
                    // العودة للغة السابقة في حالة الخطأ
                    pageState.currentLanguage = oldLanguage;
                    showError('حدث خطأ أثناء تغيير اللغة');
                }
            }
            
        } catch (error) {
            console.error('❌ Error in handleLanguageChange:', error);
            showError('حدث خطأ أثناء تغيير اللغة');
        } finally {
            pageState.languageChangeInProgress = false;
        }
    }
    
    /*====================================================
      إعداد Social Share
    ====================================================*/
    
    function setupSocialShare() {
        const socialSection = document.getElementById('socialShareSection');
        if (!socialSection) return;
        
        socialSection.style.display = 'block';
        
        // Facebook Share
        const facebookBtn = document.getElementById('shareFacebook');
        if (facebookBtn) {
            facebookBtn.addEventListener('click', () => {
                const url = encodeURIComponent(window.location.href);
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
            });
        }
        
        // Twitter Share
        const twitterBtn = document.getElementById('shareTwitter');
        if (twitterBtn) {
            twitterBtn.addEventListener('click', () => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(pageState.currentArticle?.title || 'خبر من سفارة فلسطين');
                window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
            });
        }
        
        // WhatsApp Share
        const whatsappBtn = document.getElementById('shareWhatsApp');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(pageState.currentArticle?.title || 'خبر من سفارة فلسطين');
                window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
            });
        }
        
        // Copy Link
        const copyBtn = document.getElementById('copyLink');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    
                    const copyMessage = document.getElementById('copyMessage');
                    if (copyMessage) {
                        copyMessage.style.display = 'block';
                        setTimeout(() => {
                            copyMessage.style.display = 'none';
                        }, 3000);
                    }
                } catch (err) {
                    console.error('Failed to copy:', err);
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = window.location.href;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                }
            });
        }
    }
    
    /*====================================================
      إعداد مراقب تغيير اللغة
    ====================================================*/
    
    function setupLanguageChangeListener() {
        // إعداد مراقبة تغيير اللغة من i18next
        if (typeof i18next !== 'undefined') {
            i18next.on('languageChanged', handleLanguageChange);
            console.log('✅ Language change listener set up for i18next');
        }
        
        // إعداد مراقبة تغيير اللغة من HTML lang attribute
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
                    const newLang = document.documentElement.lang;
                    if (newLang && newLang !== pageState.currentLanguage) {
                        console.log(`🔄 HTML lang changed to: ${newLang}`);
                        handleLanguageChange(newLang);
                    }
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['lang']
        });
        
        console.log('✅ HTML lang attribute observer set up');
    }
    
    /*====================================================
      التهيئة الرئيسية
    ====================================================*/
    
    async function initializePage() {
        try {
            console.log('🔄 Initializing news detail page...');
            
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
            
            // إعداد مراقب تغيير اللغة
            setupLanguageChangeListener();
            
            pageState.isInitialized = true;
            console.log('✅ News detail page initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize page:', error);
            showError(error.message);
        }
    }
    
    /*====================================================
      أدوات التصحيح المحسنة
    ====================================================*/
    
    window.NewsDetailDebug = {
        getState: () => ({
            ...pageState,
            elementsFound: Object.keys(elements).filter(key => elements[key])
        }),
        
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
        
        forceLanguage: async (lang) => {
            console.log(`🔧 Force changing language to: ${lang}`);
            if (typeof i18next !== 'undefined' && i18next.changeLanguage) {
                await i18next.changeLanguage(lang);
            } else {
                await handleLanguageChange(lang);
            }
        },
        
        simulateLanguageChange: (lang) => {
            console.log(`🧪 Simulating language change to: ${lang}`);
            handleLanguageChange(lang);
        },
        
        checkI18nStatus: () => {
            console.log('i18next Status:', {
                available: typeof i18next !== 'undefined',
                initialized: typeof i18next !== 'undefined' ? i18next.isInitialized : false,
                currentLanguage: typeof i18next !== 'undefined' ? i18next.language : 'N/A',
                pageLanguage: pageState.currentLanguage,
                htmlLang: document.documentElement.lang
            });
        },
        
        testLanguageSwitch: () => {
            const languages = ['ar', 'en', 'tr'];
            const currentIndex = languages.indexOf(pageState.currentLanguage);
            const nextLang = languages[(currentIndex + 1) % languages.length];
            console.log(`🔄 Testing switch from ${pageState.currentLanguage} to ${nextLang}`);
            this.forceLanguage(nextLang);
        }
    };
    
    /*====================================================
      بدء التشغيل المحسن
    ====================================================*/
    
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
    
    // تنظيف عند إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
        if (typeof i18next !== 'undefined') {
            i18next.off('languageChanged', handleLanguageChange);
        }
    });
    
    console.log('✅ Fixed News Detail System with Language Support Loaded!');
});