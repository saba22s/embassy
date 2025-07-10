// palestine-embassy/public/js/main.js
// Fixed version with componentsLoaded event dispatch

document.addEventListener('DOMContentLoaded', function() {

    // Function to load HTML partials
    async function loadPartial(containerId, filePath) {
        const container = document.getElementById(containerId);
        if (container) {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const html = await response.text();
                container.innerHTML = html;
                console.log(`✅ Loaded ${filePath} into #${containerId}`);
            } catch (e) {
                console.error(`❌ Failed to load ${filePath}:`, e);
            }
        }
    }

    // Load header and footer, then dispatch a custom event
    async function initializeComponents() {
        await loadPartial('header-container', '/partials/_header.html');
        await loadPartial('footer-container', '/partials/_footer.html');

        // Dispatch custom event once components are loaded
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
        console.log('📦 All components loaded and componentsLoaded event dispatched.');
    }

    // Call initializeComponents when DOM is ready
    initializeComponents();

    // ========== Header Scroll Effect ==========
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    function handleScroll() {
        const currentScrollY = window.scrollY;

        if (header) {
            if (currentScrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        lastScrollY = currentScrollY;
    }

    // Debounced scroll handler
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(handleScroll, 10);
    });

    // ========== Navigation Dropdown Handling ==========
    // This part should be dynamically set up after header is loaded
    document.addEventListener('componentsLoaded', () => {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            const submenu = item.querySelector('.submenu');
            if (submenu) {
                let hoverTimeout;

                item.addEventListener('mouseenter', function() {
                    clearTimeout(hoverTimeout);
                    submenu.style.opacity = '1';
                    submenu.style.visibility = 'visible';
                    submenu.style.transform = 'translateY(0)';
                });

                item.addEventListener('mouseleave', function() {
                    hoverTimeout = setTimeout(() => {
                        submenu.style.opacity = '0';
                        submenu.style.visibility = 'hidden';
                        submenu.style.transform = 'translateY(-8px)';
                    }, 200);
                });
            }
        });

        // Mobile Navigation for smaller screens
        function handleMobileNavigation() {
            const screenWidth = window.innerWidth;
            if (screenWidth <= 768) {
                navItems.forEach(item => {
                    const submenu = item.querySelector('.submenu');
                    const link = item.querySelector('a');

                    if (submenu && link) {
                        link.addEventListener('click', function(e) {
                            e.preventDefault();

                            // Toggle submenu visibility
                            if (submenu.style.display === 'block') {
                                submenu.style.display = 'none';
                            } else {
                                // Hide all other submenus
                                document.querySelectorAll('.submenu').forEach(menu => {
                                    menu.style.display = 'none';
                                });
                                submenu.style.display = 'block';
                            }
                        });
                    }
                });
            }
        }
        handleMobileNavigation();
        window.addEventListener('resize', handleMobileNavigation);
    });


    // ========== Smooth Scrolling for Anchor Links ==========
    function initSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');

        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);

                if (target) {
                    // Ensure header is loaded before calculating offset
                    const headerElement = document.querySelector('.header');
                    const headerHeight = headerElement ? headerElement.offsetHeight : 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    initSmoothScrolling();

    // ========== Form Validation ==========
    function initFormValidation() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;

                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.style.borderColor = '#ef4444';
                        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';

                        // Remove error styling when user starts typing
                        field.addEventListener('input', function() {
                            this.style.borderColor = '';
                            this.style.boxShadow = '';
                        }, { once: true });
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                    showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
                }
            });
        });
    }

    initFormValidation();

    // ========== Notification System ==========
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            backgroundColor: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: '300px',
            fontSize: '14px',
            fontWeight: '500'
        });

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Make showNotification globally available
    window.showNotification = showNotification;

    // ========== Intersection Observer for Animations ==========
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        const animateElements = document.querySelectorAll('.footer-column, .hero-section, .content-section');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    initScrollAnimations();

    // ========== Loading Animation ==========
    function initLoadingAnimation() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease-in-out';

        window.addEventListener('load', function() {
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        });
    }

    initLoadingAnimation();

    // ========== Copy to Clipboard Function ==========
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showNotification('تم نسخ النص بنجاح', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showNotification('تم نسخ النص بنجاح', 'success');
            } catch (fallbackErr) {
                showNotification('فشل في نسخ النص', 'error');
            }
            document.body.removeChild(textArea);
        }
    }

    // ========== Contact Info Copy Functionality ==========
    function initContactCopy() {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');

        phoneLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const phoneNumber = this.textContent;
                    copyToClipboard(phoneNumber);
                }
            });
        });

        emailLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const email = this.getAttribute('href').replace('mailto:', '');
                    copyToClipboard(email);
                }
            });
        });
    }

    initContactCopy();

    // ========== Print Functionality ==========
    function addPrintButton() {
        const printButton = document.createElement('button');
        printButton.innerHTML = '<i class="fas fa-print"></i> طباعة';
        printButton.className = 'btn btn-outline';
        printButton.style.position = 'fixed';
        printButton.style.bottom = '20px';
        printButton.style.left = '20px';
        printButton.style.zIndex = '1000';
        printButton.style.display = 'none';

        printButton.addEventListener('click', function() {
            window.print();
        });

        // Show print button on content pages
        const isContentPage = document.querySelector('.page-content');
        if (isContentPage) {
            printButton.style.display = 'block';
            document.body.appendChild(printButton);
        }
    }

    addPrintButton();

    // ========== Back to Top Button ==========
    function addBackToTopButton() {
        const backToTopButton = document.createElement('button');
        backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopButton.className = 'back-to-top';

        Object.assign(backToTopButton.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'var(--light-gold)',
            color: 'var(--black)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            zIndex: '1000',
            opacity: '0',
            visibility: 'hidden',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        });

        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Show/hide based on scroll position
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.style.opacity = '1';
                backToTopButton.style.visibility = 'visible';
            } else {
                backToTopButton.style.opacity = '0';
                backToTopButton.style.visibility = 'hidden';
            }
        });

        document.body.appendChild(backToTopButton);
    }

    addBackToTopButton();

    // ========== Search Functionality (if search input exists) ==========
    function initSearch() {
        const searchInput = document.querySelector('#search-input');
        const searchResults = document.querySelector('#search-results');

        if (searchInput) {
            let searchTimeout;

            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                const query = this.value.trim();

                if (query.length < 2) {
                    if (searchResults) searchResults.innerHTML = '';
                    return;
                }

                searchTimeout = setTimeout(() => {
                    performSearch(query);
                }, 300);
            });
        }
    }

    function performSearch(query) {
        // This is a basic search implementation
        // You can integrate with your backend search API here
        const searchableElements = document.querySelectorAll('p, h1, h2, h3, li');
        const results = [];

        searchableElements.forEach(element => {
            if (element.textContent.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    text: element.textContent.substring(0, 150) + '...',
                    element: element
                });
            }
        });

        displaySearchResults(results, query);
    }

    function displaySearchResults(results, query) {
        const searchResults = document.querySelector('#search-results');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<p>لم يتم العثور على نتائج</p>';
            return;
        }

        const resultsHTML = results.map(result =>
            `<div class="search-result">
                <p>${result.text.replace(new RegExp(query, 'gi'), `<mark>${query}</mark>`)}</p>
            </div>`
        ).join('');

        searchResults.innerHTML = resultsHTML;
    }

    initSearch();

    // ========== Accessibility Enhancements ==========
    function initAccessibility() {
        // Add skip to content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'تخطي إلى المحتوى الرئيسي';
        skipLink.className = 'skip-link';

        Object.assign(skipLink.style, {
            position: 'absolute',
            top: '-40px',
            left: '6px',
            background: 'var(--black)',
            color: 'var(--white)',
            padding: '8px',
            textDecoration: 'none',
            zIndex: '10000',
            borderRadius: '4px'
        });

        skipLink.addEventListener('focus', function() {
            this.style.top = '6px';
        });

        skipLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main content id if not exists
        const mainContent = document.querySelector('.main-content, .page-content');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }

        // Enhance keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close any open menus
                const openMenus = document.querySelectorAll('.show');
                openMenus.forEach(menu => menu.classList.remove('show'));
            }
        });
    }

    initAccessibility();

    // ========== Performance Monitoring ==========
    function initPerformanceMonitoring() {
        // Monitor page load time
        window.addEventListener('load', function() {
            if ('performance' in window) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);

                // Log slow loads
                if (loadTime > 3000) {
                    console.warn('Slow page load detected');
                }
            }
        });
    }

    initPerformanceMonitoring();

    console.log('Embassy website initialized successfully');
});

// ========== Global Utility Functions ==========

// Function to wait for an element to exist in the DOM
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(new Error(`Element with selector "${selector}" not found within ${timeout}ms`));
            }
        }, 50); // Check every 50ms
    });
}

// Format phone numbers
function formatPhoneNumber(phone) {
    return phone.replace(/(\+90)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
}

// Print page
function printPage() {
    window.print();
}

// Share page (if Web Share API is supported)
async function sharePage() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: document.title,
                url: window.location.href
            });
        } catch (err) {
            console.error('Error sharing page:', err);
        }
    } else {
        // Fallback: copy URL to clipboard
        try {
            await navigator.clipboard.writeText(window.location.href);
            if (window.showNotification) {
                window.showNotification('تم نسخ رابط الصفحة', 'success');
            }
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    }
}

// Format date for Arabic locale
function formatDate(date, locale = 'ar-SA') {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Validate email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number (Turkish format)
function validatePhoneNumber(phone) {
    const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Make utility functions globally available
window.waitForElement = waitForElement; // Added this line
window.formatPhoneNumber = formatPhoneNumber;
window.printPage = printPage;
window.sharePage = sharePage;
window.formatDate = formatDate;
window.validateEmail = validateEmail;
window.validatePhoneNumber = validatePhoneNumber;