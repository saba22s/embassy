class PalestineEmbassy {
    constructor() {
        this.config = {
            scrollThreshold: 100,
            animationDuration: 300,
            debounceDelay: 100,
            intersectionThreshold: 0.1,
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };
        
        this.state = {
            isScrolled: false,
            isMobileMenuOpen: false,
            currentLanguage: this.getCurrentLanguage(),
            isLoading: false,
            observers: new Map()
        };
        
        this.elements = {};
        this.utils = new Utils();
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.showLoadingState();
            await this.loadDOMElements();
            await this.loadPartials();
            this.initializeFeatures();
            this.setupEventListeners();
            this.initializeAnimations();
            this.hideLoadingState();
            
            console.log('🇵🇸 Palestine Embassy website initialized successfully');
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.handleError(error);
        }
    }

    /**
     * Load and cache DOM elements
     */
    async loadDOMElements() {
        const selectors = {
            header: '.header',
            headerContainer: '#header-container',
            footerContainer: '#footer-container',
            mobileMenuToggle: '.mobile-menu-toggle',
            navLinks: '.nav-links',
            skipLink: '.skip-link',
            loadingIndicator: '.loading-indicator'
        };

        for (const [key, selector] of Object.entries(selectors)) {
            this.elements[key] = document.querySelector(selector);
        }
    }

    /**
     * Load header and footer partials
     */
    async loadPartials() {
        const partials = [
            { container: this.elements.headerContainer, url: '/partials/_header.html' },
            { container: this.elements.footerContainer, url: '/partials/_footer.html' }
        ];

        const loadPromises = partials.map(({ container, url }) => 
            this.loadPartial(container, url)
        );

        await Promise.all(loadPromises);
        
        // Re-cache elements after partials load
        await this.loadDOMElements();
    }

    /**
     * Load individual partial
     */
    async loadPartial(container, url) {
        if (!container) return;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load ${url}`);
            
            const html = await response.text();
            container.innerHTML = html;
            
            // Dispatch custom event for partial loaded
            this.utils.dispatchEvent('partialLoaded', { url, container });
        } catch (error) {
            console.error(`Error loading partial ${url}:`, error);
            container.innerHTML = `<div class="error-message">Error loading content</div>`;
        }
    }

    /**
     * Initialize core features
     */
    initializeFeatures() {
        this.initializeHeader();
        this.initializeNavigation();
        this.initializeAccessibility();
        this.initializeServiceWorker();
        this.initializeLazyLoading();
        this.initializeErrorHandling();
    }

    /**
     * Initialize header functionality
     */
    initializeHeader() {
        if (!this.elements.header) return;

        // Header scroll behavior
        const handleScroll = this.utils.throttle(() => {
            const scrollTop = window.pageYOffset;
            const isScrolled = scrollTop > this.config.scrollThreshold;
            
            if (isScrolled !== this.state.isScrolled) {
                this.state.isScrolled = isScrolled;
                this.elements.header.classList.toggle('scrolled', isScrolled);
                
                // Hide header on scroll down, show on scroll up
                if (scrollTop > this.lastScrollTop && scrollTop > 200) {
                    this.elements.header.classList.add('hidden');
                } else {
                    this.elements.header.classList.remove('hidden');
                }
            }
            
            this.lastScrollTop = scrollTop;
        }, this.config.debounceDelay);

        window.addEventListener('scroll', handleScroll, { passive: true });
        this.lastScrollTop = 0;
    }

    /**
     * Initialize navigation functionality
     */
    initializeNavigation() {
        this.initializeMobileMenu();
        this.initializeDropdowns();
        this.initializeKeyboardNavigation();
    }

    /**
     * Initialize mobile menu
     */
    initializeMobileMenu() {
        const toggle = this.elements.mobileMenuToggle;
        const navLinks = this.elements.navLinks;
        
        if (!toggle || !navLinks) return;

        const toggleMenu = () => {
            this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;
            
            toggle.classList.toggle('active', this.state.isMobileMenuOpen);
            toggle.setAttribute('aria-expanded', this.state.isMobileMenuOpen);
            
            if (this.state.isMobileMenuOpen) {
                navLinks.classList.add('opening');
                setTimeout(() => navLinks.classList.add('active'), 10);
                this.trapFocus(navLinks);
                document.body.style.overflow = 'hidden';
            } else {
                navLinks.classList.remove('active', 'opening');
                this.releaseFocus();
                document.body.style.overflow = '';
            }
            
            this.utils.dispatchEvent('mobileMenuToggle', { isOpen: this.state.isMobileMenuOpen });
        };

        toggle.addEventListener('click', toggleMenu);
        
        // Close menu on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isMobileMenuOpen) {
                toggleMenu();
            }
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (this.state.isMobileMenuOpen && 
                !navLinks.contains(e.target) && 
                !toggle.contains(e.target)) {
                toggleMenu();
            }
        });
    }

    /**
     * Initialize dropdown menus
     */
    initializeDropdowns() {
        const dropdowns = document.querySelectorAll('.nav-item');
        
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a[aria-haspopup="true"]');
            const submenu = dropdown.querySelector('.submenu');
            
            if (!link || !submenu) return;

            let hoverTimeout;

            const showSubmenu = () => {
                clearTimeout(hoverTimeout);
                dropdown.classList.add('submenu-visible');
                link.setAttribute('aria-expanded', 'true');
                this.utils.dispatchEvent('submenuOpen', { dropdown });
            };

            const hideSubmenu = () => {
                hoverTimeout = setTimeout(() => {
                    dropdown.classList.remove('submenu-visible');
                    link.setAttribute('aria-expanded', 'false');
                    this.utils.dispatchEvent('submenuClose', { dropdown });
                }, 150);
            };

            // Mouse events
            dropdown.addEventListener('mouseenter', showSubmenu);
            dropdown.addEventListener('mouseleave', hideSubmenu);

            // Keyboard events
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dropdown.classList.contains('submenu-visible') ? hideSubmenu() : showSubmenu();
                }
            });

            // Touch support for mobile
            link.addEventListener('touchstart', (e) => {
                // Only toggle on touch for mobile viewports
                if (window.innerWidth <= 768) {
                    e.preventDefault(); // Prevent default link behavior
                    const isVisible = dropdown.classList.toggle('submenu-visible');
                    link.setAttribute('aria-expanded', isVisible.toString());
                }
            }, { passive: false }); // passive: false for preventDefault
        });

        // Close dropdowns when clicking outside, but not when clicking the toggle itself
        document.addEventListener('click', (e) => {
            dropdowns.forEach(dropdown => {
                const link = dropdown.querySelector('a[aria-haspopup="true"]');
                // Check if the click target is not the dropdown itself, and not the link that controls it
                if (!dropdown.contains(e.target) && (!link || !link.contains(e.target))) {
                    dropdown.classList.remove('submenu-visible');
                    if (link) link.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    /**
     * Initialize keyboard navigation
     */
    initializeKeyboardNavigation() {
        const navItems = document.querySelectorAll('.nav-links a, .submenu a');
        
        navItems.forEach((item, index) => {
            item.addEventListener('keydown', (e) => {
                let targetIndex;
                
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        targetIndex = index + 1;
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        targetIndex = index - 1;
                        break;
                    case 'Home':
                        e.preventDefault();
                        targetIndex = 0;
                        break;
                    case 'End':
                        e.preventDefault();
                        targetIndex = navItems.length - 1;
                        break;
                    default:
                        return;
                }
                
                if (targetIndex >= 0 && targetIndex < navItems.length) {
                    navItems[targetIndex].focus();
                }
            });
        });
    }

    /**
     * Initialize accessibility features
     */
    initializeAccessibility() {
        this.initializeSkipLinks();
        this.initializeFocusManagement();
        this.initializeAnnouncements();
        this.setupReducedMotion();
    }

    /**
     * Initialize skip links
     */
    initializeSkipLinks() {
        const skipLinks = document.querySelectorAll('.skip-link');
        
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    this.announceToScreenReader(`Mapsd to ${target.textContent || targetId}`);
                }
            });
        });
    }

    /**
     * Initialize focus management
     */
    initializeFocusManagement() {
        // Focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Focus trap for modals
        this.focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');
    }

    /**
     * Initialize screen reader announcements
     */
    initializeAnnouncements() {
        // Create live region for announcements
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        document.body.appendChild(this.liveRegion);
    }

    /**
     * Setup reduced motion preferences
     */
    setupReducedMotion() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleReducedMotion = (e) => {
            this.config.prefersReducedMotion = e.matches;
            document.body.classList.toggle('reduced-motion', e.matches);
        };

        mediaQuery.addListener(handleReducedMotion);
        handleReducedMotion(mediaQuery);
    }

    /**
     * Initialize Service Worker
     */
    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                
                // Update notification
                registration.addEventListener('updatefound', () => {
                    this.notifyUpdate();
                });
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Initialize lazy loading
     */
    initializeLazyLoading() {
        // Intersection Observer for images
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        }, { threshold: 0.1 });

        // Observe lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        this.state.observers.set('images', imageObserver);
    }

    /**
     * Initialize animations
     */
    initializeAnimations() {
        if (this.config.prefersReducedMotion) return;

        // Intersection Observer for animations
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    animationObserver.unobserve(entry.target);
                }
            });
        }, { threshold: this.config.intersectionThreshold });

        // Observe elements with animation classes
        document.querySelectorAll('[data-animate]').forEach(element => {
            animationObserver.observe(element);
        });

        this.state.observers.set('animations', animationObserver);
    }

    /**
     * Initialize error handling
     */
    initializeErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.handleError(e.error);
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleError(e.reason);
        });

        // Network status
        window.addEventListener('online', () => {
            this.announceToScreenReader('Connection restored');
            this.hideErrorMessage();
        });

        window.addEventListener('offline', () => {
            this.announceToScreenReader('Connection lost');
            this.showErrorMessage('No internet connection. Some features may be limited.');
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Resize handler
        const handleResize = this.utils.debounce(() => {
            this.utils.dispatchEvent('windowResize', { 
                width: window.innerWidth, 
                height: window.innerHeight 
            });
        }, this.config.debounceDelay);

        window.addEventListener('resize', handleResize, { passive: true });

        // Print handler
        window.addEventListener('beforeprint', () => {
            document.body.classList.add('print-mode');
        });

        window.addEventListener('afterprint', () => {
            document.body.classList.remove('print-mode');
        });

        // Page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    /**
     * Utility methods
     */
    
    getCurrentLanguage() {
        return document.documentElement.lang || 'ar';
    }

    showLoadingState() {
        this.state.isLoading = true;
        document.body.classList.add('loading');
        
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'block';
        }
    }

    hideLoadingState() {
        this.state.isLoading = false;
        document.body.classList.remove('loading');
        
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'none';
        }
    }

    trapFocus(container) {
        const focusableElements = container.querySelectorAll(this.focusableSelectors);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const trapTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        container.addEventListener('keydown', trapTabKey);
        this.focusTrap = { container, handler: trapTabKey };
        
        if (firstElement) firstElement.focus();
    }

    releaseFocus() {
        if (this.focusTrap) {
            this.focusTrap.container.removeEventListener('keydown', this.focusTrap.handler);
            this.focusTrap = null;
        }
    }

    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
            setTimeout(() => {
                this.liveRegion.textContent = '';
            }, 1000);
        }
    }

    pauseAnimations() {
        document.querySelectorAll('.animate-in').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        document.querySelectorAll('.animate-in').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }

    handleError(error) {
        const errorMessage = error.message || 'An unexpected error occurred';
        this.showErrorMessage(errorMessage);
        
        // Send error to logging service (if implemented)
        if (typeof this.logError === 'function') {
            this.logError(error);
        }
    }

    showErrorMessage(message) {
        // Implementation depends on your error UI design
        console.error('Error:', message);
        this.announceToScreenReader(`Error: ${message}`);
    }

    hideErrorMessage() {
        // Implementation depends on your error UI design
        this.announceToScreenReader('Error resolved');
    }

    notifyUpdate() {
        // Notify user of available update
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Update available', {
                body: 'A new version of the site is available. Refresh to update.',
                icon: '/images/logo.png'
            });
        }
    }

    /**
     * Public API methods
     */
    
    updateLanguage(language) {
        this.state.currentLanguage = language;
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        
        this.utils.dispatchEvent('languageChange', { language });
    }

    // Cleanup method
    destroy() {
        // Remove event listeners
        this.state.observers.forEach(observer => observer.disconnect());
        
        // Clear timeouts/intervals
        if (this.focusTrap) {
            this.releaseFocus();
        }
        
        // Remove live region
        if (this.liveRegion) {
            this.liveRegion.remove();
        }
    }
}

/**
 * Utility class for common functions
 */
class Utils {
    // Debounce function
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

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Custom event dispatcher
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    // Format date for Arabic locale
    formatDate(date, locale = 'ar-SA') {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Smooth scroll to element
    scrollToElement(element, offset = 0) {
        const elementTop = element.offsetTop - offset;
        window.scrollTo({
            top: elementTop,
            behavior: 'smooth'
        });
    }

    // Local storage with error handling
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            return false;
        }
    }

    getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to read from localStorage:', error);
            return defaultValue;
        }
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.PalestineEmbassy = new PalestineEmbassy();
    });
} else {
    window.PalestineEmbassy = new PalestineEmbassy();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PalestineEmbassy, Utils };
}