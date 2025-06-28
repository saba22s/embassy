// Fixed Economic Relations Page JavaScript
// Remove debug code and fix animation issues

document.addEventListener('DOMContentLoaded', () => {
    console.log('Economic Relations page initializing...');

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported - applying fallback');
        // Fallback: show all sections immediately
        document.querySelectorAll('.econ-v3-section').forEach(section => {
            section.classList.add('in-view');
        });
        return;
    }

    /**
     * Professional number animation function
     */
    const animateNumber = (element, target) => {
        if (!element || isNaN(target)) {
            console.warn('Invalid element or target for animation:', element, target);
            return;
        }

        if (element.dataset.animated === 'true') {
            return; // Already animated
        }
        
        element.dataset.animated = 'true';

        let current = 0;
        const duration = 2000;
        const startTime = performance.now();

        const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function for smoother animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            current = target * easeOutQuart;
            
            if (progress < 1) {
                element.textContent = Math.ceil(current).toLocaleString();
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = target.toLocaleString();
            }
        };
        
        requestAnimationFrame(updateCount);
    };

    // Set up IntersectionObserver with error handling
    const intersectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                try {
                    // 1. Add 'in-view' class to show the section
                    entry.target.classList.add('in-view');

                    // 2. Animate data bars if they exist
                    const bars = entry.target.querySelectorAll('.data-viz-bar-fill');
                    if (bars.length > 0) {
                        bars.forEach((bar, barIndex) => {
                            const percentage = bar.getAttribute('data-percentage');
                            if (percentage && !isNaN(percentage)) {
                                // Add small delay for staggered effect
                                setTimeout(() => {
                                    bar.style.width = percentage + '%';
                                }, barIndex * 200);
                            }
                        });
                    }

                    // 3. Animate number counters if they exist
                    const counters = entry.target.querySelectorAll('.stat-value[data-target]');
                    if (counters.length > 0) {
                        counters.forEach((counter, counterIndex) => {
                            const targetValue = parseInt(counter.getAttribute('data-target'), 10);
                            if (!isNaN(targetValue)) {
                                // Add delay for staggered effect
                                setTimeout(() => {
                                    animateNumber(counter, targetValue);
                                }, counterIndex * 300);
                            }
                        });
                    }

                    // 4. Stop observing this element
                    observer.unobserve(entry.target);
                } catch (error) {
                    console.error('Error animating section:', error);
                }
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '50px'
    });

    // Start observing all sections
    const sectionsToAnimate = document.querySelectorAll('.econ-v3-section');
    
    if (sectionsToAnimate.length === 0) {
        console.warn('No sections found with class .econ-v3-section');
        return;
    }
    
    sectionsToAnimate.forEach((section) => {
        intersectionObserver.observe(section);
    });

    console.log(`Initialized animations for ${sectionsToAnimate.length} sections`);
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.message, 'at', event.filename, ':', event.lineno);
});

window.addEventListener('load', () => {
    console.log('Economic Relations page fully loaded');
});