document.addEventListener('DOMContentLoaded', async () => {
    const newsDetailContainer = document.getElementById('newsDetailContainer');
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    let translations = {};

    async function fetchTranslations() {
        try {
            const lang = localStorage.getItem('selectedLanguage') || 'ar'; // Default to Arabic
            const response = await fetch(`../locales/${lang}/news.json`);
            translations = await response.json();
            return translations.news_articles || [];
        } catch (error) {
            console.error('Error fetching translations:', error);
            return [];
        }
    }

    async function displayNewsDetail() {
        if (!newsId) {
            newsDetailContainer.innerHTML = '<p>News article not found. Please provide a valid ID.</p>';
            document.getElementById('detailPageTitle').textContent = 'Error - News Not Found';
            return;
        }

        const newsArticles = await fetchTranslations();
        const article = newsArticles.find(item => item.id === newsId);

        if (article) {
            document.getElementById('detailPageTitle').textContent = article.title;
            let contentHtml = `
                <div class="news-detail-header">
                    <span class="news-detail-category">${translations[`category${article.category.replace(/\s/g, '')}`] || article.category}</span>
                    <h1>${article.title}</h1>
                    <div class="news-detail-meta">
                        <span>${article.date}</span>
                    </div>
                </div>
            `;

            // Add main image (title photo) if available
            if (article.image_title) {
                contentHtml += `<img src="../images/news/news.title/${article.image_title}" alt="${article.title}" class="news-detail-image-main">`;
            } else if (article.content_parts && article.content_parts[0] && article.content_parts[0].type === 'image') {
                 // Fallback to first content image if no specific title_image is provided
                contentHtml += `<img src="../images/news/news/${article.content_parts[0].value}" alt="${article.title}" class="news-detail-image-main">`;
            }


            contentHtml += `<div class="news-detail-content">`;
            if (article.content_parts) {
                article.content_parts.forEach(part => {
                    if (part.type === 'text') {
                        contentHtml += `<p>${part.value}</p>`;
                    } else if (part.type === 'image') {
                        // Assuming content images are in ../images/news/news/
                        contentHtml += `<img src="../images/news/news/${part.value}" alt="News Image">`;
                    } else if (part.type === 'video') {
                        // Add video player for video content
                        contentHtml += `<div class="video-container"><video controls src="${part.value}"></video></div>`;
                    }
                });
            } else {
                // If content_parts is not defined, use the excerpt as main text
                contentHtml += `<p>${article.excerpt}</p>`;
            }
            contentHtml += `</div>`;

            contentHtml += `<a href="news.html" class="news-detail-back-link">${translations.backToNews || 'Back to News'}</a>`;

            newsDetailContainer.innerHTML = contentHtml;

        } else {
            newsDetailContainer.innerHTML = '<p>News article not found. Invalid ID or article missing.</p>';
            document.getElementById('detailPageTitle').textContent = 'Error - News Not Found';
        }
    }

    // Initial display
    await displayNewsDetail();

    // Re-render on language change
    window.addEventListener('languageChanged', displayNewsDetail);
});