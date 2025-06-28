document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animations for Timeline Items
    const timelineItems = document.querySelectorAll('.historical-v3-timeline-item');
    if (timelineItems.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observerInstance.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 }); // Adjust threshold as needed

        timelineItems.forEach(item => {
            observer.observe(item);
        });
    } else {
        timelineItems.forEach(item => {
            item.classList.add('animate-in'); // Fallback for older browsers
        });
    }

    // Smooth scroll for hero scroll-down indicator
    const scrollIndicator = document.querySelector('.scroll-down-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});