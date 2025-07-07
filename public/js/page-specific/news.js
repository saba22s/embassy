document.addEventListener('DOMContentLoaded', async () => {
    const newsListContainer = document.getElementById('newsListContainer');
    const newsSearchInput = document.getElementById('newsSearchInput');
    const newsCategoryFilter = document.getElementById('newsCategoryFilter');
    const noResultsMessage = document.getElementById('noResultsMessage');

    let allNews = [];
    let translations = {};

    async function fetchTranslations() {
        try {
            const lang = localStorage.getItem('selectedLanguage') || 'ar'; // Default to Arabic
            const response = await fetch(`../locales/${lang}/news.json`);
            translations = await response.json();
            updatePageContent();
            return translations.news_articles || [];
        } catch (error) {
            console.error('Error fetching translations:', error);
            return [];
        }
    }

    function updatePageContent() {
        document.getElementById('pageTitle').textContent = translations.pageTitle || 'News';
        document.getElementById('mainNewsTitle').textContent = translations.mainTitle || 'News & Announcements';
        document.getElementById('newsSubtitle').textContent = translations.subtitle || 'Follow the latest news and announcements from the Embassy of the State of Palestine in Turkey';
        newsSearchInput.placeholder = translations.searchPlaceholder || 'Search news...';
        document.getElementById('filterAll').textContent = translations.filterAll || 'All News';
        document.getElementById('filterAnnouncements').textContent = translations.filterAnnouncements || 'Announcements';
        document.getElementById('filterEvents').textContent = translations.filterEvents || 'Events';
        document.getElementById('filterConsular').textContent = translations.filterConsular || 'Consular Services';
        document.getElementById('filterEducation').textContent = translations.filterEducation || 'Education';
        document.getElementById('allNewsTitle').textContent = translations.allNewsTitle || 'All News';
        document.getElementById('noResultsText').textContent = translations.noResults || 'No results found';
        document.getElementById('tryDifferentSearchText').textContent = translations.tryDifferentSearch || 'Try different search terms or select another category';
    }

    function renderNews(newsToRender) {
        newsListContainer.innerHTML = '';
        if (newsToRender.length === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
            newsToRender.forEach(article => {
                const newsCard = document.createElement('div');
                newsCard.classList.add('news-card');
                newsCard.innerHTML = `
                    <img src="../images/news/news.title/${article.image_title}" alt="${article.title}">
                    <div class="news-card-content">
                        <span class="news-category">${translations[`category${article.category.replace(/\s/g, '')}`] || article.category}</span>
                        <h3><a href="news-detail.html?id=${article.id}">${article.title}</a></h3>
                        <p class="news-excerpt">${article.excerpt}</p>
                        <span class="news-date">${article.date}</span>
                    </div>
                `;
                newsListContainer.appendChild(newsCard);
            });
        }
    }

    function filterAndSearchNews() {
        const searchTerm = newsSearchInput.value.toLowerCase();
        const selectedCategory = newsCategoryFilter.value;

        let filteredNews = allNews.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(searchTerm) ||
                                  article.excerpt.toLowerCase().includes(searchTerm) ||
                                  (article.content_parts && article.content_parts.some(part => part.type === 'text' && part.value.toLowerCase().includes(searchTerm)));

            const matchesCategory = selectedCategory === 'all' ||
                                    article.category.toLowerCase() === selectedCategory.toLowerCase();
            return matchesSearch && matchesCategory;
        });
        renderNews(filteredNews);
    }

    // Initial load
    allNews = await fetchTranslations();
    renderNews(allNews);

    // Event Listeners
    newsSearchInput.addEventListener('input', filterAndSearchNews);
    newsCategoryFilter.addEventListener('change', filterAndSearchNews);
    window.addEventListener('languageChanged', async () => {
        allNews = await fetchTranslations();
        filterAndSearchNews(); // Re-filter and render with new language
    });
});