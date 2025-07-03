/*====================================================
  NEWS DETAIL PAGE JAVASCRIPT - FIXED VERSION
  Dynamic news detail loading and display system
====================================================*/

class NewsDetailManager {
    constructor() {
        this.newsData = null;
        this.currentNews = null;
        this.currentLanguage = 'ar';
        this.newsId = null;
        this.newsSlug = null;
        
        this.elements = {
            loadingIndicator: null,
            errorMessage: null,
            newsDetailContent: null,
            retryBtn: null,
            shareBtn: null,
            printBtn: null,
            relatedNewsSection: null
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Starting NewsDetailManager initialization...');
            
            // Extract news ID/slug from URL
            this.extractNewsIdentifier();
            
            // Get DOM elements first
            this.getElements();
            
            // Show loading immediately
            this.showLoading();
            
            // Wait for i18next to be ready
            await this.waitForI18next();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Add small delay to prevent flickering
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Load news data
            await this.loadNewsData();
            
            // Find and display the specific news
            this.findAndDisplayNews();
            
            console.log('✅ NewsDetailManager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize NewsDetailManager:', error);
            this.showError();
        }
    }

    extractNewsIdentifier() {
        const searchParams = new URLSearchParams(window.location.search);
        
        // Try to get ID from URL parameter (?id=40862)
        this.newsId = searchParams.get('id');
        
        // Try to get slug from URL parameter (?slug=news-slug)
        this.newsSlug = searchParams.get('slug');
        
        // Convert to number if it's numeric
        if (this.newsId) {
            this.newsId = parseInt(this.newsId);
        }
        
        console.log('📍 News identifier extracted:', { 
            id: this.newsId, 
            slug: this.newsSlug,
            fullURL: window.location.href 
        });
        
        // Validate that we have at least one identifier
        if (!this.newsId && !this.newsSlug) {
            console.error('❌ No news identifier found in URL');
            throw new Error('No news identifier found');
        }
    }

    waitForI18next() {
        return new Promise((resolve) => {
            if (typeof i18next !== 'undefined' && i18next.isInitialized) {
                this.currentLanguage = i18next.language || 'ar';
                resolve();
            } else {
                document.addEventListener('i18nextReady', () => {
                    this.currentLanguage = i18next.language || 'ar';
                    resolve();
                });
                
                // Fallback timeout
                setTimeout(() => {
                    this.currentLanguage = 'ar';
                    resolve();
                }, 3000);
            }
        });
    }

    getElements() {
        this.elements.loadingIndicator = document.getElementById('loading-indicator');
        this.elements.errorMessage = document.getElementById('error-message');
        this.elements.newsDetailContent = document.getElementById('news-detail-content');
        this.elements.retryBtn = document.getElementById('retry-btn');
        this.elements.shareBtn = document.getElementById('share-btn');
        this.elements.printBtn = document.getElementById('print-btn');
        this.elements.relatedNewsSection = document.getElementById('related-news-section');

        // Verify critical elements exist
        const criticalElements = ['loadingIndicator', 'errorMessage', 'newsDetailContent'];
        const missingElements = criticalElements.filter(key => !this.elements[key]);
        
        if (missingElements.length > 0) {
            console.error('❌ Critical elements not found:', missingElements);
        }
    }

    setupEventListeners() {
        // Retry button
        if (this.elements.retryBtn) {
            this.elements.retryBtn.addEventListener('click', () => {
                this.retryLoading();
            });
        }

        // Share button
        if (this.elements.shareBtn) {
            this.elements.shareBtn.addEventListener('click', () => {
                this.shareNews();
            });
        }

        // Print button
        if (this.elements.printBtn) {
            this.elements.printBtn.addEventListener('click', () => {
                window.print();
            });
        }

        // Language change listener
        if (typeof i18next !== 'undefined') {
            i18next.on('languageChanged', (lng) => {
                this.currentLanguage = lng;
                this.loadNewsData().then(() => {
                    this.findAndDisplayNews();
                }).catch(console.error);
            });
        }
    }

    async loadNewsData() {
        this.showLoading();
        
        try {
            const response = await fetch(`/public/locales/${this.currentLanguage}/news.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.newsData = await response.json();
            console.log(`✅ Loaded news data for ${this.currentLanguage}:`, this.newsData);
            
        } catch (error) {
            console.error('❌ Failed to load news data:', error);
            this.showError();
            throw error;
        }
    }

    findAndDisplayNews() {
        console.log('🔍 Finding news with:', { id: this.newsId, slug: this.newsSlug });
        
        if (!this.newsData || !this.newsData.news) {
            console.error('❌ No news data available');
            this.showError();
            return;
        }

        // Find news by ID or slug
        this.currentNews = this.newsData.news.find(news => {
            if (this.newsId && news.id == this.newsId) {
                return true;
            }
            if (this.newsSlug && news.slug === this.newsSlug) {
                return true;
            }
            return false;
        });

        console.log('🎯 Search result:', this.currentNews);

        if (!this.currentNews) {
            console.error('❌ News not found:', { 
                searchId: this.newsId, 
                searchSlug: this.newsSlug,
                availableNews: this.newsData.news.map(n => ({ id: n.id, slug: n.slug }))
            });
            this.showError();
            return;
        }

        console.log('✅ Found news:', this.currentNews.title);
        this.displayNews();
        this.setupSocialShare();
        this.loadRelatedNews();
        this.updateMetaTags();
    }

    displayNews() {
        console.log('📄 Displaying news:', this.currentNews.title);
        
        // Update breadcrumb
        const breadcrumbTitle = document.getElementById('breadcrumb-title');
        if (breadcrumbTitle) {
            breadcrumbTitle.textContent = this.truncateText(this.currentNews.title, 50);
        }

        // Update category badge
        const categoryElement = document.getElementById('article-category');
        if (categoryElement) {
            const categoryText = this.getCategoryText(this.currentNews.category);
            categoryElement.textContent = categoryText;
        }

        // Update date
        const dateElement = document.getElementById('article-date');
        if (dateElement) {
            const dateText = dateElement.querySelector('.date-text');
            if (dateText) {
                dateText.textContent = this.formatDate(this.currentNews.date);
            }
        }

        // Update author
        const authorElement = document.getElementById('article-author');
        if (authorElement && this.currentNews.author) {
            const authorText = authorElement.querySelector('.author-text');
            if (authorText) {
                authorText.textContent = this.currentNews.author;
            }
        } else if (authorElement) {
            authorElement.style.display = 'none';
        }

        // Update title
        const titleElement = document.getElementById('article-title');
        if (titleElement) {
            titleElement.textContent = this.currentNews.title;
        }

        // Update summary
        const summaryElement = document.getElementById('article-summary-text');
        if (summaryElement) {
            summaryElement.textContent = this.currentNews.summary;
        }

        // Update image
        this.updateImage();

        // Update content
        const contentElement = document.getElementById('article-content-text');
        if (contentElement) {
            // Convert newlines to paragraphs
            const formattedContent = this.formatContent(this.currentNews.content);
            contentElement.innerHTML = formattedContent;
        }

        // Update tags
        this.updateTags();

        // Show the content
        this.showContent();
    }

    updateImage() {
        const imageContainer = document.getElementById('article-image-container');
        const imageElement = document.getElementById('article-image');
        
        if (this.currentNews.image && imageElement) {
            const imageUrl = `/Home/Image/?name=${this.currentNews.image}`;
            imageElement.src = imageUrl;
            imageElement.alt = this.currentNews.title;
            imageElement.onerror = () => {
                imageElement.src = '/public/images/news-placeholder.jpg';
            };
            
            if (imageContainer) {
                imageContainer.style.display = 'block';
            }
        } else if (imageContainer) {
            imageContainer.style.display = 'none';
        }
    }

    updateTags() {
        const tagsContainer = document.getElementById('article-tags-container');
        const tagsElement = document.getElementById('article-tags');
        
        // إخفاء الكلمات المفتاحية تماماً
        if (tagsContainer) {
            tagsContainer.style.display = 'none';
        }
        
        // يمكن تفعيل هذا الكود لاحقاً إذا أردت إظهار الكلمات المفتاحية
        /*
        if (this.currentNews.tags && this.currentNews.tags.length > 0 && tagsElement) {
            const tagsHTML = this.currentNews.tags.map(tag => 
                `<span class="article-tag">${tag}</span>`
            ).join('');
            
            tagsElement.innerHTML = tagsHTML;
            
            if (tagsContainer) {
                tagsContainer.style.display = 'block';
            }
        } else if (tagsContainer) {
            tagsContainer.style.display = 'none';
        }
        */
    }

    formatContent(content) {
        if (!content) return '';
        
        // Split content by double newlines to create paragraphs
        const paragraphs = content.split('\n\n');
        
        return paragraphs.map(paragraph => {
            // Skip empty paragraphs
            if (!paragraph.trim()) return '';
            
            // Check if it's a heading (starts with ##)
            if (paragraph.trim().startsWith('##')) {
                const headingText = paragraph.trim().replace(/^##\s*/, '');
                return `<h3>${headingText}</h3>`;
            }
            
            // Check if it's a numbered point (starts with numbers followed by dot)
            if (/^\d+\./.test(paragraph.trim())) {
                return `<h4>${paragraph.trim()}</h4>`;
            }
            
            // Regular paragraph
            return `<p>${paragraph.trim()}</p>`;
        }).filter(p => p).join('');
    }

    setupSocialShare() {
        const currentUrl = window.location.href;
        const title = encodeURIComponent(this.currentNews.title);
        const summary = encodeURIComponent(this.currentNews.summary);

        // Facebook
        const facebookBtn = document.getElementById('share-facebook');
        if (facebookBtn) {
            facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        }

        // Twitter
        const twitterBtn = document.getElementById('share-twitter');
        if (twitterBtn) {
            twitterBtn.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${title}`;
        }

        // LinkedIn
        const linkedinBtn = document.getElementById('share-linkedin');
        if (linkedinBtn) {
            linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
        }

        // WhatsApp
        const whatsappBtn = document.getElementById('share-whatsapp');
        if (whatsappBtn) {
            whatsappBtn.href = `https://wa.me/?text=${title}%20${encodeURIComponent(currentUrl)}`;
        }
    }

    loadRelatedNews() {
        if (!this.newsData || !this.newsData.news) return;

        // Find related news (same category, excluding current news)
        const relatedNews = this.newsData.news
            .filter(news => 
                news.id !== this.currentNews.id && 
                news.category === this.currentNews.category
            )
            .slice(0, 3); // Show max 3 related news

        if (relatedNews.length === 0) {
            // If no news in same category, show latest news
            const latestNews = this.newsData.news
                .filter(news => news.id !== this.currentNews.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3);
            
            this.renderRelatedNews(latestNews);
        } else {
            this.renderRelatedNews(relatedNews);
        }
    }

    renderRelatedNews(relatedNews) {
        const relatedNewsGrid = document.getElementById('related-news-grid');
        const relatedNewsSection = this.elements.relatedNewsSection;
        
        if (!relatedNewsGrid || relatedNews.length === 0) {
            if (relatedNewsSection) {
                relatedNewsSection.style.display = 'none';
            }
            return;
        }

        relatedNewsGrid.innerHTML = '';

        relatedNews.forEach(news => {
            const newsCard = this.createRelatedNewsCard(news);
            relatedNewsGrid.appendChild(newsCard);
        });

        if (relatedNewsSection) {
            relatedNewsSection.style.display = 'block';
        }
    }

    createRelatedNewsCard(news) {
        const card = document.createElement('a');
        card.className = 'related-news-card';
        card.href = `/public/html/news-detail.html?id=${news.id}`;
        
        const imageUrl = news.image ? `/Home/Image/?name=${news.image}` : '/public/images/news-placeholder.jpg';
        const formattedDate = this.formatDate(news.date);

        card.innerHTML = `
            <img class="related-news-image" 
                 src="${imageUrl}" 
                 alt="${news.title}"
                 loading="lazy"
                 onerror="this.src='/public/images/news-placeholder.jpg'">
            <div class="related-news-content">
                <h4 class="related-news-title-text">${news.title}</h4>
                <div class="related-news-date">
                    <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                    <span>${formattedDate}</span>
                </div>
            </div>
        `;

        return card;
    }

    updateMetaTags() {
        // Update page title
        document.title = `${this.currentNews.title} - سفارة دولة فلسطين`;
        
        // Update meta description
        const metaDescription = document.getElementById('meta-description');
        if (metaDescription) {
            metaDescription.setAttribute('content', this.currentNews.summary);
        }

        // Update meta keywords
        const metaKeywords = document.getElementById('meta-keywords');
        if (metaKeywords && this.currentNews.tags) {
            const keywords = this.currentNews.tags.join(', ');
            metaKeywords.setAttribute('content', keywords);
        }

        // Update Open Graph tags
        const ogTitle = document.getElementById('og-title');
        if (ogTitle) {
            ogTitle.setAttribute('content', this.currentNews.title);
        }

        const ogDescription = document.getElementById('og-description');
        if (ogDescription) {
            ogDescription.setAttribute('content', this.currentNews.summary);
        }

        const ogUrl = document.getElementById('og-url');
        if (ogUrl) {
            ogUrl.setAttribute('content', window.location.href);
        }

        const ogImage = document.getElementById('og-image');
        if (ogImage && this.currentNews.image) {
            const imageUrl = `${window.location.origin}/Home/Image/?name=${this.currentNews.image}`;
            ogImage.setAttribute('content', imageUrl);
        }

        // Update structured data
        this.updateStructuredData();
    }

    updateStructuredData() {
        const structuredDataElement = document.getElementById('structured-data');
        if (!structuredDataElement) return;

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": this.currentNews.title,
            "description": this.currentNews.summary,
            "author": {
                "@type": "Organization",
                "name": this.currentNews.author || "سفارة دولة فلسطين في تركيا"
            },
            "publisher": {
                "@type": "Organization",
                "name": "سفارة دولة فلسطين في تركيا",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${window.location.origin}/public/images/logo.png`
                }
            },
            "datePublished": this.currentNews.date,
            "dateModified": this.currentNews.date,
            "url": window.location.href
        };

        if (this.currentNews.image) {
            structuredData.image = `${window.location.origin}/Home/Image/?name=${this.currentNews.image}`;
        }

        structuredDataElement.textContent = JSON.stringify(structuredData);
    }

    shareNews() {
        if (navigator.share) {
            navigator.share({
                title: this.currentNews.title,
                text: this.currentNews.summary,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('تم نسخ رابط الخبر إلى الحافظة');
            }).catch(() => {
                alert('لا يمكن نسخ الرابط');
            });
        }
    }

    retryLoading() {
        this.loadNewsData().then(() => {
            this.findAndDisplayNews();
        }).catch(console.error);
    }

    // Utility functions
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            const locale = this.currentLanguage === 'ar' ? 'ar-EG' : 
                          this.currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
            
            return date.toLocaleDateString(locale, options);
        } catch (error) {
            console.error('❌ Date formatting error:', error);
            return dateString;
        }
    }

    getCategoryText(category) {
        if (typeof i18next !== 'undefined' && this.newsData && this.newsData.categories) {
            return this.newsData.categories[category] || category;
        }
        return category;
    }

    truncateText(text, maxLength = 150) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength).trim() + '...';
    }

    // UI State Management
    showLoading() {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'block';
        }
        this.hideContent();
        this.hideError();
    }

    hideLoading() {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'none';
        }
    }

    showError() {
        if (this.elements.errorMessage) {
            this.elements.errorMessage.style.display = 'block';
        }
        this.hideContent();
        this.hideLoading();
    }

    hideError() {
        if (this.elements.errorMessage) {
            this.elements.errorMessage.style.display = 'none';
        }
    }

    showContent() {
        // تأخير بسيط لضمان تحميل كامل المحتوى
        setTimeout(() => {
            if (this.elements.newsDetailContent) {
                this.elements.newsDetailContent.style.display = 'block';
                this.elements.newsDetailContent.style.opacity = '1';
            }
            this.hideLoading();
            this.hideError();
        }, 200);
    }

    hideContent() {
        if (this.elements.newsDetailContent) {
            this.elements.newsDetailContent.style.display = 'none';
            this.elements.newsDetailContent.style.opacity = '0';
        }
    }

    // Public API
    getCurrentNews() {
        return this.currentNews;
    }

    getNewsData() {
        return this.newsData;
    }
}

/*====================================================
  INITIALIZATION
====================================================*/

let newsDetailManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing NewsDetailManager...');
    newsDetailManager = new NewsDetailManager();
});

// Also initialize when i18next is ready (backup)
document.addEventListener('i18nextReady', () => {
    if (!newsDetailManager) {
        console.log('🔄 Backup initialization of NewsDetailManager...');
        newsDetailManager = new NewsDetailManager();
    }
});

/*====================================================
  EXPORTS
====================================================*/

window.NewsDetailManager = NewsDetailManager;
window.getNewsDetailManager = () => newsDetailManager;