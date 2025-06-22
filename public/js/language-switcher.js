// Modern Header JavaScript
class ModernHeader {
    constructor() {
        this.header = document.getElementById('modernHeader');
        this.mobileToggle = document.getElementById('mobileMenuToggle');
        this.mobileNav = document.getElementById('mobileNav');
        this.languageSwitcher = document.getElementById('languageSwitcher');
        this.languageButton = document.getElementById('languageButton');
        this.languageDropdown = document.getElementById('languageDropdown');
        
        this.isScrolled = false;
        this.isMobileMenuOpen = false;
        this.isLanguageMenuOpen = false;
        
        this.init();
    }
    
    init() {
        this.setupScrollBehavior();
        this.setupMobileMenu();
        this.setupLanguageSwitcher();
        this.setupDropdowns();
        this.setupEventListeners();
    }
    
    setupScrollBehavior() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollTop = window.pageYOffset;
                    const shouldScroll = scrollTop > 50;
                    
                    if (shouldScroll !== this.isScrolled) {
                        this.isScrolled = shouldScroll;
                        this.header.classList.toggle('scrolled', shouldScroll);
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    setupMobileMenu() {
        this.mobileToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            if (this.isMobileMenuOpen && 
                !this.mobileNav.contains(e.target) && 
                !this.mobileToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Handle mobile dropdown toggles
        const mobileDropdownTriggers = this.mobileNav.querySelectorAll('.has-dropdown');
        mobileDropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const parentItem = trigger.closest('.nav-item');
                const isActive = parentItem.classList.contains('active');
                
                // Close all other dropdowns
                this.mobileNav.querySelectorAll('.nav-item.active').forEach(item => {
                    if (item !== parentItem) {
                        item.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                parentItem.classList.toggle('active', !isActive);
            });
        });
    }
    
    setupLanguageSwitcher() {
        this.languageButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLanguageMenu();
        });
        
        // Language options
        const languageOptions = this.languageDropdown.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                this.changeLanguage(lang);
                this.closeLanguageMenu();
            });
        });
        
        // Close language menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.languageSwitcher.contains(e.target)) {
                this.closeLanguageMenu();
            }
        });
    }
    
    setupDropdowns() {
        // Desktop dropdown behavior is handled by CSS hover
        // This is for additional JavaScript functionality if needed
    }
    
    setupEventListeners() {
        // Escape key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
                this.closeLanguageMenu();
            }
        });
        
        // Window resize handling
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        
        if (this.isMobileMenuOpen) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    }
    
    openMobileMenu() {
        this.isMobileMenuOpen = true;
        this.mobileToggle.classList.add('active');
        this.mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        this.mobileToggle.classList.remove('active');
        this.mobileNav.classList.remove('active');
        document.body.style.overflow = '';
        
        // Close all mobile dropdowns
        this.mobileNav.querySelectorAll('.nav-item.active').forEach(item => {
            item.classList.remove('active');
        });
    }
    
    toggleLanguageMenu() {
        this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
        
        if (this.isLanguageMenuOpen) {
            this.openLanguageMenu();
        } else {
            this.closeLanguageMenu();
        }
    }
    
    openLanguageMenu() {
        this.isLanguageMenuOpen = true;
        this.languageSwitcher.classList.add('active');
    }
    
    closeLanguageMenu() {
        this.isLanguageMenuOpen = false;
        this.languageSwitcher.classList.remove('active');
    }
    
    changeLanguage(lang) {
        const languages = {
            ar: { name: 'العربية', dir: 'rtl' },
            en: { name: 'English', dir: 'ltr' },
            tr: { name: 'Türkçe', dir: 'ltr' }
        };
        
        const langConfig = languages[lang];
        if (!langConfig) return;
        
        // Update document
        document.documentElement.lang = lang;
        document.documentElement.dir = langConfig.dir;
        document.body.className = document.body.className.replace(/\b(rtl|ltr)\b/g, '');
        document.body.classList.add(langConfig.dir);
        
        // Update button text
        this.languageButton.querySelector('span').textContent = langConfig.name;
        
        // Update active language
        this.languageDropdown.querySelectorAll('.language-option').forEach(option => {
            const optionLang = option.getAttribute('data-lang');
            option.classList.toggle('active', optionLang === lang);
        });
        
        // Save preference
        localStorage.setItem('embassy_language', lang);
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang, direction: langConfig.dir }
        }));
    }
}
    
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ModernHeader();
});