/*====================================================
  NEWS PAGE JAVASCRIPT - FIXED VERSION
  Dynamic news loading and management system
====================================================*/

class NewsManager {
    constructor() {
        this.newsData = null;
        this.currentLanguage = 'ar';
        this.currentCategory = 'all';
        this.itemsPerPage = 6;
        this.currentPage = 1;
        this.filteredNews = [];
        this.isLoading = false;
        
        this.elements = {
            newsGrid: null,
            loadMoreBtn: null,
            loadMoreSection: null,
            loadingIndicator: null,
            errorMessage: null,
            noNewsMessage: null,
            retryBtn: null,
            filterBtns: null
        };
        
        this.init();
    }

    async init() {
        try {
            // Wait for i18next to be ready
            await this.waitForI18next();
            
            // Get DOM elements
            this.getElements();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load news data
            await this.loadNewsData();
            
            // Render initial news
            this.renderNews();
            
            console.log('✅ NewsManager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize NewsManager:', error);
            this.showError();
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
            }
        });
    }

    getElements() {
        this.elements.newsGrid = document.getElementById('news-grid');
        this.elements.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.elements.loadMoreSection = document.getElementById('load-more-section');
        this.elements.loadingIndicator = document.getElementById('loading-indicator');
        this.elements.errorMessage = document.getElementById('error-message');
        this.elements.noNewsMessage = document.getElementById('no-news-message');
        this.elements.retryBtn = document.getElementById('retry-btn');
        this.elements.filterBtns = document.querySelectorAll('.filter-btn');

        // Verify all elements exist
        Object.entries(this.elements).forEach(([key, element]) => {
            if (!element) {
                console.warn(`⚠️ Element not found: ${key}`);
            }
        });
    }

    setupEventListeners() {
        // Load more button
        if (this.elements.loadMoreBtn) {
            this.elements.loadMoreBtn.addEventListener('click', () => {
                this.loadMoreNews();
            });
        }

        // Retry button
        if (this.elements.retryBtn) {
            this.elements.retryBtn.addEventListener('click', () => {
                this.retryLoading();
            });
        }

        // Filter buttons
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCategoryFilter(e.target.dataset.category);
            });
        });

        // Language change listener
        if (typeof i18next !== 'undefined') {
            i18next.on('languageChanged', (lng) => {
                this.currentLanguage = lng;
                this.loadNewsData().then(() => {
                    this.renderNews();
                });
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
            this.filteredNews = this.newsData.news || [];
            this.hideLoading();
            
            console.log(`✅ Loaded ${this.filteredNews.length} news items for ${this.currentLanguage}`);
            
        } catch (error) {
            console.error('❌ Failed to load news data:', error);
            this.hideLoading();
            this.showError();
            throw error;
        }
    }

    handleCategoryFilter(category) {
        // Update active filter button
        this.elements.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        this.currentCategory = category;
        this.currentPage = 1;
        this.filterNews();
        this.renderNews();
    }

    filterNews() {
        if (!this.newsData || !this.newsData.news) {
            this.filteredNews = [];
            return;
        }

        if (this.currentCategory === 'all') {
            this.filteredNews = [...this.newsData.news];
        } else {
            this.filteredNews = this.newsData.news.filter(
                news => news.category === this.currentCategory
            );
        }

        // Sort by date (newest first)
        this.filteredNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    renderNews() {
        if (!this.elements.newsGrid) {
            console.error('❌ News grid element not found');
            return;
        }

        // Clear previous content
        this.elements.newsGrid.innerHTML = '';

        // Check if we have news to display
        if (!this.filteredNews || this.filteredNews.length === 0) {
            this.showNoNews();
            this.hideLoadMore();
            return;
        }

        // Calculate items to show
        const itemsToShow = this.currentPage * this.itemsPerPage;
        const newsToRender = this.filteredNews.slice(0, itemsToShow);

        // Render news items
        newsToRender.forEach(news => {
            const newsElement = this.createNewsElement(news);
            this.elements.newsGrid.appendChild(newsElement);
        });

        // Show/hide load more button
        if (itemsToShow >= this.filteredNews.length) {
            this.hideLoadMore();
        } else {
            this.showLoadMore();
        }

        this.hideNoNews();
        this.hideError();
    }

    createNewsElement(news) {
        const newsCard = document.createElement('article');
        newsCard.className = `news-card${news.featured ? ' featured' : ''}`;
        newsCard.setAttribute('data-news-id', news.id);

        const formattedDate = this.formatDate(news.date);
        const categoryText = this.getCategoryText(news.category);
        const imageUrl = news.image ? `/Home/Image/?name=${news.image}` : '/public/images/news-placeholder.jpg';

        newsCard.innerHTML = `
            <div class="news-image-container">
                <img class="news-image" 
                     src="${imageUrl}" 
                     alt="${news.title}"
                     loading="lazy"
                     onerror="this.src='/public/images/news-placeholder.jpg'">
                <div class="news-category-badge">${categoryText}</div>
            </div>
            <div class="news-content">
                <h3 class="news-title">${news.title}</h3>
                <p class="news-summary">${news.summary}</p>
                ${news.tags ? this.createTagsHTML(news.tags) : ''}
                <div class="news-footer">
                    <div class="news-date">
                        <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <a href="/public/html/news-detail.html?id=${news.id}" class="read-more-btn">
                        <span data-i18n="news:read_full">قراءة كاملة</span>
                        <i class="fas fa-arrow-left" aria-hidden="true"></i>
                    </a>
                </div>
            </div>
        `;

        return newsCard;
    }

    createTagsHTML(tags) {
        if (!tags || tags.length === 0) return '';
        
        const tagsHTML = tags.map(tag => `<span class="news-tag">${tag}</span>`).join('');
        return `<div class="news-tags">${tagsHTML}</div>`;
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            // Format based on current language
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

    loadMoreNews() {
        if (this.isLoading) return;
        
        this.currentPage++;
        this.renderNews();
    }

    retryLoading() {
        this.loadNewsData().then(() => {
            this.renderNews();
        }).catch(() => {
            // Error handling is already done in loadNewsData
        });
    }

    // UI State Management
    showLoading() {
        this.isLoading = true;
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'block';
        }
        if (this.elements.loadMoreBtn) {
            this.elements.loadMoreBtn.disabled = true;
        }
    }

    hideLoading() {
        this.isLoading = false;
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'none';
        }
        if (this.elements.loadMoreBtn) {
            this.elements.loadMoreBtn.disabled = false;
        }
    }

    showError() {
        if (this.elements.errorMessage) {
            this.elements.errorMessage.style.display = 'block';
        }
        this.hideNoNews();
        this.hideLoadMore();
    }

    hideError() {
        if (this.elements.errorMessage) {
            this.elements.errorMessage.style.display = 'none';
        }
    }

    showNoNews() {
        if (this.elements.noNewsMessage) {
            this.elements.noNewsMessage.style.display = 'block';
        }
    }

    hideNoNews() {
        if (this.elements.noNewsMessage) {
            this.elements.noNewsMessage.style.display = 'none';
        }
    }

    showLoadMore() {
        if (this.elements.loadMoreSection) {
            this.elements.loadMoreSection.style.display = 'block';
        }
    }

    hideLoadMore() {
        if (this.elements.loadMoreSection) {
            this.elements.loadMoreSection.style.display = 'none';
        }
    }

    // Public API
    getCurrentNews() {
        return this.filteredNews;
    }

    getNewsById(id) {
        return this.filteredNews.find(news => news.id == id);
    }

    getTotalNews() {
        return this.filteredNews.length;
    }

    getCurrentPage() {
        return this.currentPage;
    }

    refresh() {
        return this.loadNewsData().then(() => {
            this.filterNews();
            this.renderNews();
        });
    }
}

/*====================================================
  INITIALIZATION
====================================================*/

let newsManager;

// Initialize when i18next is ready
document.addEventListener('i18nextReady', () => {
    console.log('🚀 Initializing NewsManager...');
    newsManager = new NewsManager();
});

// Fallback initialization
document.addEventListener('DOMContentLoaded', () => {
    // Give time for i18next to load
    setTimeout(() => {
        if (!newsManager) {
            console.log('⏰ Fallback NewsManager initialization...');
            newsManager = new NewsManager();
        }
    }, 2000);
});

/*====================================================
  EXPORTS AND UTILITIES
====================================================*/

// Export for global access
window.NewsManager = NewsManager;
window.getNewsManager = () => newsManager;

// Utility functions
window.NewsUtils = {
    formatDate: (dateString, language = 'ar') => {
        try {
            const date = new Date(dateString);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const locale = language === 'ar' ? 'ar-EG' : 
                          language === 'tr' ? 'tr-TR' : 'en-US';
            return date.toLocaleDateString(locale, options);
        } catch (error) {
            return dateString;
        }
    },
    
    truncateText: (text, maxLength = 150) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength).trim() + '...';
    },
    
    generateSlug: (title) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
};