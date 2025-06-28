document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animations
    const animatedElements = document.querySelectorAll('.rr-animate-on-scroll');
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observerInstance.unobserve(entry.target); // Optional: Unobserve after animation
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    } else { // Fallback for older browsers or if no elements
        animatedElements.forEach(el => {
            el.classList.add('is-visible'); // Make them visible directly
        });
    }

    // Simple Timeline Item Alternating Class (if not handled by more complex logic elsewhere)
    // This is a basic example; for complex timelines, more robust JS might be needed.
    const timelineItems = document.querySelectorAll('.rr-timeline-item');
    timelineItems.forEach((item, index) => {
        // This assumes the 'left' and 'right' classes are already set in HTML for desktop.
        // For mobile, the CSS already handles stacking them on one side.
        // If you need dynamic assignment based on screen size, this needs more logic.
    });

});