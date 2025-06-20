class HeaderController {
    constructor() {
        this.elements = {};
        this.state = {
            isMobileMenuOpen: false,
            isLanguageMenuOpen: false,
            currentLanguage: 'ar',
            lastScrollTop: 0
        };
        
        // Language configurations
        this.languages = {
            ar: { name: 'العربية', flag: '🇵🇸', dir: 'rtl' },
            en: { name: 'English', flag: '🇺🇸', dir: 'ltr' },
            tr: { name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' }
        };
        
        this.translations = {
            ar: {
                home: 'الرئيسية',
                news: 'الأخبار',
                embassy: 'السفارة',
                education: 'الشؤون التعليمية',
                consular: 'الشؤون القنصلية',
                relations: 'العلاقات الفلسطينية التركية',
                misc: 'متفرقات',
                passport: 'الاستعلام عن جواز السفر',
                contact: 'التواصل'
            },
            en: {
                home: 'Home',
                news: 'News',
                embassy: 'Embassy',
                education: 'Educational Affairs',
                consular: 'Consular Affairs',
                relations: 'Palestinian-Turkish Relations',
                misc: 'Miscellaneous',
                passport: 'Passport Inquiry',
                contact: 'Contact'
            },
            tr: {
                home: 'Ana Sayfa',
                news: 'Haberler',
                embassy: 'Büyükelçilik',
                education: 'Eğitim İşleri',
                consular: 'Konsolosluk İşleri',
                relations: 'Filistin-Türk İlişkileri',
                misc: 'Çeşitli',
                passport: 'Pasaport Sorgulama',
                contact: 'İletişim'
            }
        };
        
        this.init();
    }

    init() {
        this.bindElements();
        this.setupEventListeners();
        this.loadSavedLanguage();
        this.setupScrollBehavior();
        console.log('🇵🇸 Header initialized successfully');
    }

    bindElements() {
        this.elements = {
            header: document.querySelector('.header'),
            mobileToggle: document.querySelector('.mobile-menu-toggle'),
            navLinks: document.querySelector('.nav-links'),
            navItems: document.querySelectorAll('.nav-item'),
            languageSwitcher: document.querySelector('.language-switcher'),
            languageButton: document.querySelector('.language-switcher button'),
            languageMenu: document.querySelector('.language-switcher ul'),
            languageItems: document.querySelectorAll('.language-switcher li')
        };
    }

    setupEventListeners() {
        // Mobile menu toggle
        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Language switcher
        if (this.elements.languageButton) {
            this.elements.languageButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLanguageMenu();
            });
        }

        // Language menu items
        this.elements.languageItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const lang = item.getAttribute('data-lang');
                if (lang) {
                    this.changeLanguage(lang);
                    this.closeLanguageMenu();
                }
            });
        });

        // Navigation dropdowns (desktop)
        this.elements.navItems.forEach(item => {
            const link = item.querySelector('a');
            const submenu = item.querySelector('.submenu');
            
            if (submenu) {
                // Desktop hover
                item.addEventListener('mouseenter', () => {
                    item.classList.add('active');
                });
                
                item.addEventListener('mouseleave', () => {
                    item.classList.remove('active');
                });
                
                // Mobile click
                if (link) {
                    link.addEventListener('click', (e) => {
                        if (window.innerWidth <= 768) {
                            e.preventDefault();
                            item.classList.toggle('active');
                        }
                    });
                }
            }
        });

        // Close menus on outside click
        document.addEventListener('click', (e) => {
            if (!this.elements.languageSwitcher?.contains(e.target)) {
                this.closeLanguageMenu();
            }
            
            if (!this.elements.navLinks?.contains(e.target) && 
                !this.elements.mobileToggle?.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeLanguageMenu();
                this.closeMobileMenu();
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
        });
    }

    setupScrollBehavior() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (this.elements.header) {
            if (scrollTop > 100) {
                this.elements.header.classList.add('scrolled');
            } else {
                this.elements.header.classList.remove('scrolled');
            }
        }
        
        this.state.lastScrollTop = scrollTop;
    }

    toggleMobileMenu() {
        this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;
        
        if (this.state.isMobileMenuOpen) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    }

    openMobileMenu() {
        this.state.isMobileMenuOpen = true;
        
        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.classList.add('active');
        }
        
        if (this.elements.navLinks) {
            this.elements.navLinks.classList.add('active');
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        this.state.isMobileMenuOpen = false;
        
        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.classList.remove('active');
        }
        
        if (this.elements.navLinks) {
            this.elements.navLinks.classList.remove('active');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Close all dropdowns
        this.elements.navItems.forEach(item => {
            item.classList.remove('active');
        });
    }

    toggleLanguageMenu() {
        this.state.isLanguageMenuOpen = !this.state.isLanguageMenuOpen;
        
        if (this.state.isLanguageMenuOpen) {
            this.openLanguageMenu();
        } else {
            this.closeLanguageMenu();
        }
    }

    openLanguageMenu() {
        this.state.isLanguageMenuOpen = true;
        
        if (this.elements.languageSwitcher) {
            this.elements.languageSwitcher.classList.add('active');
        }
        
        if (this.elements.languageMenu) {
            this.elements.languageMenu.classList.add('show');
        }
    }

    closeLanguageMenu() {
        this.state.isLanguageMenuOpen = false;
        
        if (this.elements.languageSwitcher) {
            this.elements.languageSwitcher.classList.remove('active');
        }
        
        if (this.elements.languageMenu) {
            this.elements.languageMenu.classList.remove('show');
        }
    }

    changeLanguage(language) {
        if (!this.languages[language]) {
            console.warn(`Language ${language} not supported`);
            return;
        }
        
        this.state.currentLanguage = language;
        const langConfig = this.languages[language];
        
        // Update document attributes
        document.documentElement.lang = language;
        document.documentElement.dir = langConfig.dir;
        document.body.className = document.body.className.replace(/\b(rtl|ltr)\b/g, '');
        document.body.classList.add(langConfig.dir);
        
        // Update button text
        if (this.elements.languageButton) {
            this.elements.languageButton.innerHTML = `🌐 ${langConfig.name}`;
        }
        
        // Update active language in menu
        this.elements.languageItems.forEach(item => {
            const itemLang = item.getAttribute('data-lang');
            item.classList.toggle('active', itemLang === language);
        });
        
        // Translate navigation
        this.translateNavigation(language);
        
        // Save preference
        this.saveLanguagePreference(language);
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language, direction: langConfig.dir }
        }));
        
        console.log(`Language changed to: ${language}`);
    }

    translateNavigation(language) {
        const translations = this.translations[language];
        if (!translations) return;
        
        // Update navigation text elements
        const navElements = {
            '#home': translations.home,
            '#news': translations.news,
            '#embassy': translations.embassy,
            '#education': translations.education,
            '#consular': translations.consular,
            '#relations': translations.relations,
            '#misc': translations.misc,
            '#passport': translations.passport,
            '#contact': translations.contact
        };
        
        Object.entries(navElements).forEach(([selector, text]) => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = text;
            }
        });
    }

    loadSavedLanguage() {
        const saved = localStorage.getItem('embassy_language');
        if (saved && this.languages[saved]) {
            this.changeLanguage(saved);
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0];
            const language = this.languages[browserLang] ? browserLang : 'ar';
            this.changeLanguage(language);
        }
    }

    saveLanguagePreference(language) {
        try {
            localStorage.setItem('embassy_language', language);
        } catch (error) {
            console.warn('Could not save language preference:', error);
        }
    }

    // Public API
    getCurrentLanguage() {
        return this.state.currentLanguage;
    }

    setLanguage(language) {
        this.changeLanguage(language);
    }

    isMobileMenuActive() {
        return this.state.isMobileMenuOpen;
    }
}

// Simpler main initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize header
    window.headerController = new HeaderController();
    
    // Load header and footer if containers exist
    loadPartials();
});

async function loadPartials() {
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');
    
    try {
        // Load header
        if (headerContainer) {
            const headerResponse = await fetch('/partials/_header.html');
            if (headerResponse.ok) {
                const headerHTML = await headerResponse.text();
                headerContainer.innerHTML = headerHTML;
            }
        }
        
        // Load footer
        if (footerContainer) {
            const footerResponse = await fetch('/partials/_footer.html');
            if (footerResponse.ok) {
                const footerHTML = await footerResponse.text();
                footerContainer.innerHTML = footerHTML;
            }
        }
        
        // Reinitialize header after loading partials
        if (headerContainer) {
            setTimeout(() => {
                window.headerController = new HeaderController();
            }, 100);
        }
        
    } catch (error) {
        console.error('Error loading partials:', error);
    }
}

// Utility function for smooth scroll
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HeaderController };
}