/*====================================================
  NEWS DETAIL PAGE JAVASCRIPT
  Handles individual article display and sharing functionality
====================================================*/

class NewsDetailManager {
    constructor() {
        this.articleId = null;
        this.articleData = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing News Detail Manager...');
        
        // Get article ID from URL
        this.articleId = this.getArticleIdFromURL();
        
        // Wait for i18next to be ready
        document.addEventListener('i18nextReady', () => {
            this.loadArticleData();
            this.setupSharingButtons();
        });

        // Fallback if i18next is already ready
        if (typeof i18next !== 'undefined' && i18next.isInitialized) {
            this.loadArticleData();
            this.setupSharingButtons();
        }
    }

    getArticleIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        return id ? parseInt(id) : 1; // Default to article 1 if no ID provided
    }

    // Sample article data - In real app, this would come from an API
    getArticleData(id) {
        const articles = {
            1: {
                id: 1,
                title: "مؤتمر الإبداع التربوي الفلسطيني الثاني في مدينة إسطنبول",
                category: "تعليم",
                date: "2023-08-10",
                author: "السفارة",
                readTime: "5 دقائق قراءة",
                image: "/public/images/news,9.jpg",
                imageCaption: "مؤتمر الإبداع التربوي الفلسطيني الثاني في إسطنبول",
                content: `
                    <p>نظمت مؤسسة الإبداع الفلسطيني الدولية والمجلس الأعلى للإبداع والتميز وبالتعاون مع وزارة التعليم العالي والبحث العلمي الفلسطينية مؤتمر الإبداع التربوي الفلسطيني الثاني تحت عنوان "الإبداع التربوي الفلسطيني ودوره في تحقيق التنمية المستدامة" في مدينة إسطنبول يومي 9 و 10 آب/أغسطس 2023.</p>

                    <h2>أهداف المؤتمر</h2>
                    <p>هدف المؤتمر إلى تسليط الضوء على أهمية الإبداع في التعليم الفلسطيني وكيفية توظيفه لخدمة التنمية المستدامة، بالإضافة إلى تبادل الخبرات والتجارب الناجحة في مجال التعليم الإبداعي بين المختصين والأكاديميين الفلسطينيين.</p>

                    <blockquote>"الإبداع التربوي هو المحرك الأساسي للتقدم والتنمية في أي مجتمع، وفلسطين تحتاج إلى استثمار طاقاتها الإبداعية لبناء مستقبل أفضل لأجيالها القادمة"</blockquote>

                    <h2>المشاركون والحضور</h2>
                    <p>شارك في المؤتمر نخبة من الأكاديميين والباحثين والتربويين الفلسطينيين من مختلف الجامعات والمؤسسات التعليمية، بالإضافة إلى ممثلين عن وزارة التعليم العالي والبحث العلمي الفلسطينية وعدد من المؤسسات الأكاديمية التركية.</p>

                    <h3>محاور المؤتمر الرئيسية</h3>
                    <ul>
                        <li>الإبداع التربوي ومفاهيمه المعاصرة</li>
                        <li>دور التكنولوجيا في تعزيز الإبداع التعليمي</li>
                        <li>التجارب الدولية الناجحة في التعليم الإبداعي</li>
                        <li>التحديات والفرص في التعليم الفلسطيني</li>
                        <li>استراتيجيات تطوير المناهج الإبداعية</li>
                    </ul>

                    <p>وقد تضمن المؤتمر جلسات نقاشية مثمرة وورش عمل تطبيقية، حيث تم استعراض العديد من البحوث والدراسات الحديثة في مجال التعليم الإبداعي، كما تم تبادل الخبرات والممارسات الفضلى بين المشاركين.</p>

                    <h2>التوصيات والنتائج</h2>
                    <p>خرج المؤتمر بعدة توصيات مهمة تهدف إلى تطوير التعليم الفلسطيني وتعزيز الجانب الإبداعي فيه، منها ضرورة إدماج التكنولوجيا الحديثة في العملية التعليمية، وتدريب المعلمين على أساليب التدريس الإبداعية، وتطوير المناهج لتواكب التطورات العالمية في مجال التعليم.</p>
                `,
                tags: ["تعليم", "إبداع", "مؤتمر", "إسطنبول", "تنمية مستدامة"]
            },
            2: {
                id: 2,
                title: "زيارة وفد من الطلاب الفلسطينيين للسفارة",
                category: "تعليم",
                date: "2023-07-05",
                author: "قسم الشؤون التعليمية",
                readTime: "3 دقائق قراءة",
                image: "/public/images/news,9.jpg",
                imageCaption: "وفد من الطلاب الفلسطينيين يزور السفارة",
                content: `
                    <p>استقبلت سفارة دولة فلسطين في أنقرة وفداً من الطلاب الفلسطينيين الدارسين في مختلف الجامعات التركية، وذلك في إطار التواصل المستمر مع أبناء الجالية الفلسطينية وتقديم الدعم اللازم لهم.</p>

                    <h2>هدف الزيارة</h2>
                    <p>هدفت الزيارة إلى بحث سبل تطوير الخدمات المقدمة للطلاب الفلسطينيين، والاستماع إلى احتياجاتهم ومقترحاتهم لتحسين الخدمات التعليمية والقنصلية.</p>

                    <p>خلال اللقاء، تم مناقشة عدة مواضيع مهمة تتعلق بأوضاع الطلاب الدراسية والمعيشية، وآليات تقديم الدعم الأكاديمي والنفسي لهم.</p>

                    <h2>التوصيات</h2>
                    <p>خرج اللقاء بعدة توصيات مهمة منها تفعيل برامج الإرشاد الأكاديمي وتوفير فرص التدريب والتطوير المهني للطلاب.</p>
                `,
                tags: ["طلاب", "تعليم", "زيارة", "سفارة", "دعم"]
            }
            // Add more articles as needed
        };

        return articles[id] || articles[1]; // Return default article if ID not found
    }

    loadArticleData() {
        this.articleData = this.getArticleData(this.articleId);
        
        if (!this.articleData) {
            console.error('❌ Article not found');
            this.showNotFound();
            return;
        }

        this.displayArticle();
        this.loadRelatedArticles();
        this.updatePageTitle();
        
        console.log('✅ Article data loaded');
    }

    displayArticle() {
        if (!this.articleData) return;

        const formattedDate = this.formatDate(this.articleData.date);

        // Update article elements
        this.updateElement('articleCategory', this.articleData.category);
        this.updateElement('articleTitle', this.articleData.title);
        this.updateElement('articleDate', formattedDate);
        this.updateElement('articleAuthor', this.articleData.author);
        this.updateElement('readTime', this.articleData.readTime);
        this.updateElement('articleContent', this.articleData.content, true);
        this.updateElement('imageCaption', this.articleData.imageCaption);

        // Update image
        const articleImage = document.getElementById('articleImage');
        if (articleImage) {
            articleImage.src = this.articleData.image;
            articleImage.alt = this.articleData.title;
        }

        // Update tags
        this.displayTags();
    }

    updateElement(id, content, isHTML = false) {
        const element = document.getElementById(id);
        if (element) {
            if (isHTML) {
                element.innerHTML = content;
            } else {
                element.textContent = content;
            }
        }
    }

    displayTags() {
        if (!this.articleData.tags) return;

        const tagsContainer = document.querySelector('.tags-list');
        if (tagsContainer) {
            tagsContainer.innerHTML = this.articleData.tags.map(tag => 
                `<a href="/public/html/news.html?search=${encodeURIComponent(tag)}" class="tag-item">${tag}</a>`
            ).join('');
        }
    }

    loadRelatedArticles() {
        // For demo purposes, we'll show some sample related articles
        const relatedContainer = document.getElementById('relatedArticles');
        if (!relatedContainer) return;

        const relatedArticles = [
            {
                id: 2,
                title: "زيارة وفد من الطلاب الفلسطينيين للسفارة",
                excerpt: "استقبلت السفارة وفداً من الطلاب الفلسطينيين الدارسين في الجامعات التركية لبحث سبل تطوير الخدمات المقدمة لهم.",
                date: "2023-07-05",
                image: "/public/images/news,9.jpg"
            },
            {
                id: 3,
                title: "ندوة عن الثقافة الفلسطينية في أنقرة",
                excerpt: "نظمت السفارة ندوة ثقافية في العاصمة التركية أنقرة لتعريف الجمهور التركي بالتراث والثقافة الفلسطينية.",
                date: "2023-07-02",
                image: "/public/images/news,9.jpg"
            },
            {
                id: 4,
                title: "توقيع اتفاقية تعاون تعليمي جديدة",
                excerpt: "تم توقيع اتفاقية تعاون بين الجامعات الفلسطينية والتركية لتسهيل تبادل الطلاب والأساتذة.",
                date: "2023-06-28",
                image: "/public/images/news,9.jpg"
            }
        ];

        // Filter out current article
        const filteredArticles = relatedArticles.filter(article => article.id !== this.articleId);

        const relatedHTML = filteredArticles.map(article => `
            <a href="/public/html/news-detail.html?id=${article.id}" class="related-card">
                <img class="related-image" src="${article.image}" alt="${article.title}" loading="lazy">
                <div class="related-content">
                    <h3 class="related-card-title">${article.title}</h3>
                    <p class="related-excerpt">${article.excerpt}</p>
                    <span class="related-date">${this.formatDate(article.date)}</span>
                </div>
            </a>
        `).join('');

        relatedContainer.innerHTML = relatedHTML;
    }

    setupSharingButtons() {
        // Social sharing functionality
        window.shareOnFacebook = () => this.shareOn('facebook');
        window.shareOnTwitter = () => this.shareOn('twitter');
        window.shareOnLinkedIn = () => this.shareOn('linkedin');
        window.shareOnWhatsApp = () => this.shareOn('whatsapp');
        window.shareByEmail = () => this.shareOn('email');
    }

    shareOn(platform) {
        if (!this.articleData) return;

        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(this.articleData.title);
        const description = encodeURIComponent(this.articleData.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...');

        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            whatsapp: `https://wa.me/?text=${title}%20${url}`,
            email: `mailto:?subject=${title}&body=${description}%0A%0A${url}`
        };

        if (shareUrls[platform]) {
            if (platform === 'email') {
                window.location.href = shareUrls[platform];
            } else {
                window.open(shareUrls[platform], '_blank', 'width=600,height=400');
            }
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        const currentLang = typeof i18next !== 'undefined' ? i18next.language : 'ar';
        const locale = currentLang === 'ar' ? 'ar-SA' : currentLang === 'tr' ? 'tr-TR' : 'en-US';
        
        return date.toLocaleDateString(locale, options);
    }

    updatePageTitle() {
        if (this.articleData) {
            document.title = `${this.articleData.title} - سفارة دولة فلسطين في تركيا`;
            
            // Update meta description
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                const plainTextContent = this.articleData.content.replace(/<[^>]*>/g, '').substring(0, 160);
                metaDesc.setAttribute('content', plainTextContent);
            }
        }
    }

    showNotFound() {
        const articleContainer = document.getElementById('newsArticle');
        if (articleContainer) {
            articleContainer.innerHTML = `
                <div class="article-not-found" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 2rem;">📄</div>
                    <h2 style="color: var(--news-accent); margin-bottom: 1rem;">المقال غير موجود</h2>
                    <p style="color: var(--news-text-secondary); margin-bottom: 2rem;">عذراً، لم يتم العثور على المقال المطلوب.</p>
                    <a href="/public/html/news.html" style="
                        background: var(--news-accent);
                        color: var(--news-background);
                        padding: 12px 24px;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    ">العودة إلى الأخبار</a>
                </div>
            `;
        }
    }
}

/*====================================================
  READING PROGRESS INDICATOR
====================================================*/

class ReadingProgress {
    constructor() {
        this.init();
    }

    init() {
        this.createProgressBar();
        this.setupScrollListener();
    }

    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.id = 'reading-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: var(--news-accent);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
    }

    setupScrollListener() {
        const progressBar = document.getElementById('reading-progress');
        const article = document.querySelector('.article-content');
        
        if (!progressBar || !article) return;

        window.addEventListener('scroll', () => {
            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.pageYOffset;

            const articleStart = articleTop - windowHeight / 2;
            const articleEnd = articleTop + articleHeight - windowHeight / 2;

            if (scrollTop < articleStart) {
                progressBar.style.width = '0%';
            } else if (scrollTop > articleEnd) {
                progressBar.style.width = '100%';
            } else {
                const progress = ((scrollTop - articleStart) / (articleEnd - articleStart)) * 100;
                progressBar.style.width = progress + '%';
            }
        });
    }
}

/*====================================================
  INITIALIZATION
====================================================*/

let newsDetailManager;
let readingProgress;

document.addEventListener('DOMContentLoaded', () => {
    newsDetailManager = new NewsDetailManager();
    readingProgress = new ReadingProgress();
});

// Export for global access
window.newsDetailManager = newsDetailManager;

/*====================================================
  KEYBOARD SHORTCUTS
====================================================*/

document.addEventListener('keydown', (e) => {
    // ESC to go back to news page
    if (e.key === 'Escape') {
        window.location.href = '/public/html/news.html';
    }
    
    // Ctrl/Cmd + S to share
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (navigator.share && newsDetailManager.articleData) {
            navigator.share({
                title: newsDetailManager.articleData.title,
                text: newsDetailManager.articleData.content.replace(/<[^>]*>/g, '').substring(0, 200),
                url: window.location.href
            });
        }
    }
});

/*====================================================
  SMOOTH SCROLLING FOR ANCHOR LINKS
====================================================*/

document.addEventListener('DOMContentLoaded', () => {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

/*====================================================
  COPY LINK FUNCTIONALITY
====================================================*/

// Add copy link button functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add copy link button to share section
    const shareButtons = document.querySelector('.share-buttons');
    if (shareButtons) {
        const copyButton = document.createElement('button');
        copyButton.className = 'share-button share-copy';
        copyButton.style.background = 'var(--news-text-secondary)';
        copyButton.style.color = 'var(--news-background)';
        copyButton.innerHTML = '<i class="fas fa-link"></i><span>نسخ الرابط</span>';
        
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                
                // Show feedback
                const originalText = copyButton.querySelector('span').textContent;
                copyButton.querySelector('span').textContent = 'تم النسخ!';
                copyButton.style.background = 'var(--news-accent)';
                
                setTimeout(() => {
                    copyButton.querySelector('span').textContent = originalText;
                    copyButton.style.background = 'var(--news-text-secondary)';
                }, 2000);
                
            } catch (err) {
                console.log('Fallback: Copy not supported');
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = window.location.href;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
        });
        
        shareButtons.appendChild(copyButton);
    }
});

/*====================================================
  PRINT FUNCTIONALITY
====================================================*/

// Add print button and styling
document.addEventListener('DOMContentLoaded', () => {
    // Add print button after share section
    const shareSection = document.querySelector('.article-share');
    if (shareSection) {
        const printButton = document.createElement('button');
        printButton.className = 'print-button';
        printButton.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--news-card-bg);
            border: 1px solid var(--news-border);
            color: var(--news-text-primary);
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            margin-top: 1rem;
        `;
        printButton.innerHTML = '<i class="fas fa-print"></i><span>طباعة المقال</span>';
        
        printButton.addEventListener('click', () => {
            window.print();
        });
        
        printButton.addEventListener('mouseenter', () => {
            printButton.style.background = 'var(--news-highlight)';
            printButton.style.borderColor = 'var(--news-accent)';
        });
        
        printButton.addEventListener('mouseleave', () => {
            printButton.style.background = 'var(--news-card-bg)';
            printButton.style.borderColor = 'var(--news-border)';
        });
        
        shareSection.appendChild(printButton);
    }
});

/*====================================================
  PRINT STYLES
====================================================*/

// Add print-specific styles
const printStyles = `
    @media print {
        body * {
            visibility: hidden;
        }
        
        .news-detail-container,
        .news-detail-container * {
            visibility: visible;
        }
        
        .news-detail-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
        }
        
        .news-back-nav,
        .article-share,
        .related-articles,
        #reading-progress {
            display: none !important;
        }
        
        .article-content {
            font-size: 12pt;
            line-height: 1.6;
        }
        
        .article-title {
            font-size: 18pt;
            margin-bottom: 1rem;
        }
        
        .article-image {
            max-height: 300px;
            width: auto;
            display: block;
            margin: 0 auto;
        }
        
        blockquote {
            border: 1px solid #ccc;
            background: #f9f9f9;
            color: #333;
        }
        
        a {
            color: #000;
            text-decoration: none;
        }
        
        a:after {
            content: " (" attr(href) ")";
            font-size: 0.8em;
        }
    }
`;

// Inject print styles
const styleSheet = document.createElement('style');
styleSheet.textContent = printStyles;
document.head.appendChild(styleSheet);

/*====================================================
  ACCESSIBILITY IMPROVEMENTS
====================================================*/

// Improve focus management
document.addEventListener('DOMContentLoaded', () => {
    // Skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#articleTitle';
    skipLink.textContent = 'تخطي إلى المحتوى';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--news-accent);
        color: var(--news-background);
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
});

/*====================================================
  IMAGE ZOOM FUNCTIONALITY
====================================================*/

document.addEventListener('DOMContentLoaded', () => {
    const articleImage = document.querySelector('.article-image');
    if (articleImage) {
        articleImage.style.cursor = 'zoom-in';
        
        articleImage.addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                cursor: zoom-out;
            `;
            
            const zoomedImage = articleImage.cloneNode();
            zoomedImage.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 8px;
            `;
            
            overlay.appendChild(zoomedImage);
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', () => {
                document.body.removeChild(overlay);
            });
            
            // ESC to close
            const closeOnEsc = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(overlay);
                    document.removeEventListener('keydown', closeOnEsc);
                }
            };
            document.addEventListener('keydown', closeOnEsc);
        });
    }
});

console.log('📄 News detail page JavaScript loaded successfully');