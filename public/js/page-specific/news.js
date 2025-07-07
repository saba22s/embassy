/*====================================================
  NEWS PAGE JAVASCRIPT
  Modern, functional news system with search, filter, and pagination
====================================================*/

class NewsManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.allNews = [];
        this.filteredNews = [];
        this.searchTerm = '';
        this.categoryFilter = '';
        this.sortOrder = 'date-desc';
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing News Manager...');
        
        // Wait for i18next to be ready
        document.addEventListener('i18nextReady', () => {
            this.setupEventListeners();
            this.loadNewsData();
        });

        // Fallback if i18next is already ready
        if (typeof i18next !== 'undefined' && i18next.isInitialized) {
            this.setupEventListeners();
            this.loadNewsData();
        }
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('newsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterAndDisplayNews();
            }, 300));
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.categoryFilter = e.target.value;
                this.filterAndDisplayNews();
            });
        }

        // Sort filter
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.sortOrder = e.target.value;
                this.filterAndDisplayNews();
            });
        }

        console.log('✅ Event listeners set up');
    }

    // Sample news data - In a real application, this would come from an API
    loadNewsData() {
        this.allNews = [
            {
                id: 1,
                title: "مؤتمر الإبداع التربوي الفلسطيني الثاني في إسطنبول",
                excerpt: "نظمت مؤسسة الإبداع الفلسطيني الدولية والمجلس الأعلى للإبداع والتميز مؤتمر الإبداع التربوي الفلسطيني الثاني.",
                category: "education",
                date: "2023-08-10",
                author: "السفارة",
                image: "/public/images/news,9.jpg",
                featured: true
            },
            {
                id: 2,
                title: "زيارة وفد من الطلاب الفلسطينيين للسفارة",
                excerpt: "استقبلت السفارة وفداً من الطلاب الفلسطينيين الدارسين في الجامعات التركية لبحث سبل تطوير الخدمات المقدمة لهم.",
                category: "education",
                date: "2023-07-05",
                author: "قسم الشؤون التعليمية",
                image: "/public/images/news,9.jpg"
            },
            {
                id: 3,
                title: "ندوة عن الثقافة الفلسطينية في أنقرة",
                excerpt: "نظمت السفارة ندوة ثقافية في العاصمة التركية أنقرة لتعريف الجمهور التركي بالتراث والثقافة الفلسطينية.",
                category: "cultural",
                date: "2023-07-02",
                author: "قسم الشؤون الثقافية",
                image: "/public/images/news,9.jpg"
            },
            {
                id: 4,
                title: "توقيع اتفاقية تعاون تعليمي جديدة",
                excerpt: "تم توقيع اتفاقية تعاون بين الجامعات الفلسطينية والتركية لتسهيل تبادل الطلاب والأساتذة.",
                category: "education",
                date: "2023-06-28",
                author: "السفير",
                image: "/public/images/news,9.jpg"
            },
            {
                id: 5,
                title: "تحديث إجراءات الحصول على الجواز الفلسطيني",
                excerpt: "أعلنت السفارة عن تحديث إجراءات الحصول على الجواز الفلسطيني وتسهيل الخدمات المقدمة للمواطنين.",
                category: "consular",
                date: "2023-06-25",
                author: "القسم القنصلي",
                image: "/public/images/news,9.jpg"
            },
            {
                id: 6,
                title: "احتفال بيوم الاستقلال الفلسطيني",
                excerpt: "أقامت السفارة حفلاً بمناسبة يوم الاستقلال الفلسطيني بحضور شخصيات رسمية وجمهور من الجالية الفلسطينية.",
                category: "events",
                date: "2023-11-15",
                author: "السفارة",
                image: "/public/images/news,9.jpg"
            },
            {
                id: 7,
                title: "لقاء مع وزير الخارجية التركي",
                excerpt: "التقى السفير الفلسطيني مع وزير الخارجية التركي لبحث التطورات السياسية الإقليمية وتعزيز العلاقات الثنائية.",
                category: "political",
                date: "2023-11-10",
                author: "المكتب السياسي",
                image: "/public/images/news,9.jpg"
            },
            {
                id: 8,
                title: "منح دراسية جديدة للطلاب الفلسطينيين",
                excerpt: "أعلنت الحكومة التركية عن تقديم منح دراسية إضافية للطلاب الفلسطينيين في مختلف التخصصات.",
                category: "education",
                date: "2023-11-05",
                author: "قسم الشؤون التعليمية",
                image: "/public/images/news,9.jpg"
            },
            {
                id: 9,
                title: "معرض للتراث الفلسطيني في إسطنبول",
                excerpt: "افتتح معرض للتراث الفلسطيني في إسطنبول بمشاركة فنانين وحرفيين فلسطينيين مقيمين في تركيا.",
                category: "cultural",
                date: "2023-10-20",
                author: "قسم الشؤون الثقافية",
                image: "/public/images/news,9.jpg"
            }
        ];

        this.filterAndDisplayNews();
        console.log('✅ News data loaded');
    }

    filterAndDisplayNews() {
        // Start with all news
        this.filteredNews = [...this.allNews];

        // Apply search filter
        if (this.searchTerm) {
            this.filteredNews = this.filteredNews.filter(article => 
                article.title.toLowerCase().includes(this.searchTerm) ||
                article.excerpt.toLowerCase().includes(this.searchTerm)
            );
        }

        // Apply category filter
        if (this.categoryFilter) {
            this.filteredNews = this.filteredNews.filter(article => 
                article.category === this.categoryFilter
            );
        }

        // Apply sorting
        this.filteredNews.sort((a, b) => {
            switch (this.sortOrder) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        // Reset to first page when filtering
        this.currentPage = 1;

        // Display results
        this.displayNews();
        this.updatePagination();
    }

    displayNews() {
        const newsGrid = document.getElementById('newsGrid');
        const loadingEl = document.getElementById('newsLoading');
        const emptyEl = document.getElementById('newsEmpty');

        if (!newsGrid) return;

        // Show loading
        loadingEl.style.display = 'block';
        emptyEl.style.display = 'none';
        newsGrid.innerHTML = '';

        // Simulate loading delay
        setTimeout(() => {
            loadingEl.style.display = 'none';

            if (this.filteredNews.length === 0) {
                emptyEl.style.display = 'block';
                return;
            }

            // Calculate pagination
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const newsToShow = this.filteredNews.slice(startIndex, endIndex);

            // Generate news cards
            newsGrid.innerHTML = newsToShow.map(article => this.createNewsCard(article)).join('');

        }, 500);
    }

    createNewsCard(article) {
        const formattedDate = this.formatDate(article.date);
        const categoryName = this.getCategoryName(article.category);

        return `
            <article class="news-card" data-article-id="${article.id}">
                <div class="news-image-container">
                    <img class="news-image" src="${article.image}" alt="${article.title}" loading="lazy">
                    <span class="news-category-badge">${categoryName}</span>
                    <span class="news-date-badge">${formattedDate}</span>
                </div>
                <div class="news-content">
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-excerpt">${article.excerpt}</p>
                    <div class="news-meta">
                        <span class="news-author">${article.author}</span>
                        <a href="/public/html/news-detail.html?id=${article.id}" class="news-read-more">
                            قراءة المزيد <i class="fas fa-arrow-left"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    updatePagination() {
        const paginationEl = document.getElementById('newsPagination');
        if (!paginationEl) return;

        const totalPages = Math.ceil(this.filteredNews.length / this.itemsPerPage);

        if (totalPages <= 1) {
            paginationEl.style.display = 'none';
            return;
        }

        paginationEl.style.display = 'flex';

        let paginationHTML = '';

        // Previous button
        const prevDisabled = this.currentPage === 1 ? 'disabled' : '';
        paginationHTML += `
            <button class="pagination-button ${prevDisabled}" onclick="newsManager.goToPage(${this.currentPage - 1})" ${prevDisabled ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i> السابق
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                const activeClass = i === this.currentPage ? 'active' : '';
                paginationHTML += `
                    <button class="pagination-button ${activeClass}" onclick="newsManager.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        // Next button
        const nextDisabled = this.currentPage === totalPages ? 'disabled' : '';
        paginationHTML += `
            <button class="pagination-button ${nextDisabled}" onclick="newsManager.goToPage(${this.currentPage + 1})" ${nextDisabled ? 'disabled' : ''}>
                التالي <i class="fas fa-chevron-left"></i>
            </button>
        `;

        paginationEl.innerHTML = paginationHTML;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredNews.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;

        this.currentPage = page;
        this.displayNews();
        this.updatePagination();

        // Scroll to top of news section
        const newsContainer = document.querySelector('.news-container');
        if (newsContainer) {
            newsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        // Use Arabic locale if available
        const currentLang = typeof i18next !== 'undefined' ? i18next.language : 'ar';
        const locale = currentLang === 'ar' ? 'ar-SA' : currentLang === 'tr' ? 'tr-TR' : 'en-US';
        
        return date.toLocaleDateString(locale, options);
    }

    getCategoryName(category) {
        const categoryMap = {
            'education': 'تعليم',
            'consular': 'شؤون قنصلية',
            'cultural': 'ثقافي',
            'political': 'سياسي',
            'events': 'أحداث'
        };

        return categoryMap[category] || category;
    }

    // Utility function to debounce search input
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public methods for external access
    search(term) {
        const searchInput = document.getElementById('newsSearch');
        if (searchInput) {
            searchInput.value = term;
            this.searchTerm = term.toLowerCase();
            this.filterAndDisplayNews();
        }
    }

    filterByCategory(category) {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = category;
            this.categoryFilter = category;
            this.filterAndDisplayNews();
        }
    }

    // Get article by ID (for detail page)
    getArticleById(id) {
        return this.allNews.find(article => article.id === parseInt(id));
    }
}

/*====================================================
  INITIALIZATION
====================================================*/

let newsManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    newsManager = new NewsManager();
});

// Export for global access
window.newsManager = newsManager;

/*====================================================
  FEATURED NEWS INTERACTION
====================================================*/

// Add click tracking for featured news
document.addEventListener('DOMContentLoaded', () => {
    const featuredCard = document.querySelector('.featured-news-card');
    if (featuredCard) {
        featuredCard.addEventListener('click', (e) => {
            // Don't trigger if clicking on the read more button
            if (!e.target.closest('.featured-read-more')) {
                const articleId = featuredCard.getAttribute('data-article-id');
                if (articleId) {
                    window.location.href = `/public/html/news-detail.html?id=${articleId}`;
                }
            }
        });
    }
});

/*====================================================
  KEYBOARD NAVIGATION SUPPORT
====================================================*/

document.addEventListener('keydown', (e) => {
    // ESC to clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('newsSearch');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
            if (newsManager) {
                newsManager.searchTerm = '';
                newsManager.filterAndDisplayNews();
            }
        }
    }
});

/*====================================================
  URL PARAMETER HANDLING
====================================================*/

// Handle URL parameters for direct linking to filtered views
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    const page = urlParams.get('page');

    setTimeout(() => {
        if (newsManager) {
            if (category) {
                newsManager.filterByCategory(category);
            }
            if (search) {
                newsManager.search(search);
            }
            if (page) {
                newsManager.goToPage(parseInt(page));
            }
        }
    }, 1000);
});

/*====================================================
  PERFORMANCE OPTIMIZATION
====================================================*/

// Lazy loading for images (additional optimization)
document.addEventListener('DOMContentLoaded', () => {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        // Observe images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});

console.log('📰 News page JavaScript loaded successfully');