/*====================================================
  UPDATED LANGUAGE-SWITCHER.JS - JSON Integration
  Simplified version that works with TranslationManager
====================================================*/

class EnhancedLanguageSwitcher {
  constructor() {
    this.langButton = document.getElementById("langButton");
    this.langMenu = document.getElementById("langMenu");
    this.langItems = this.langMenu?.querySelectorAll("li") || [];
    this.currentLang = localStorage.getItem("preferredLanguage") || "ar";
    this.isInitialized = false;
    this.translationManager = null;

    // Wait for translation manager to be ready
    if (window.translationManager) {
      this.translationManager = window.translationManager;
      this.init();
    } else {
      document.addEventListener('translationManagerReady', (event) => {
        this.translationManager = window.translationManager;
        this.init();
      });
    }
  }

  init() {
    if (!this.langButton || !this.langMenu) {
      console.warn('Language switcher elements not found');
      return;
    }

    this.setupEventListeners();
    this.updateButtonText(this.currentLang);
    this.isInitialized = true;
    
    console.log('✅ Enhanced Language Switcher initialized');
  }

  setupEventListeners() {
    // Button click handler
    this.langButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!this.langMenu.contains(e.target) && !this.langButton.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Language selection
    this.langItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const selectedLang = item.dataset.lang;
        if (selectedLang && this.translationManager) {
          this.switchLanguage(selectedLang);
          this.closeMenu();
        }
      });

      // Keyboard support
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          item.click();
        }
      });
    });

    // Escape key to close menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.langMenu.classList.contains("hidden")) {
        this.closeMenu();
        this.langButton.focus();
      }
    });

    // Listen for language changes from translation manager
    document.addEventListener('languageChanged', (event) => {
      this.currentLang = event.detail.language;
      this.updateButtonText(this.currentLang);
    });
  }

  toggleMenu() {
    this.langMenu.classList.toggle("hidden");
    this.langMenu.classList.toggle("show");
  }

  closeMenu() {
    this.langMenu.classList.add("hidden");
    this.langMenu.classList.remove("show");
  }

  async switchLanguage(lang) {
    if (this.translationManager) {
      const success = await this.translationManager.switchLanguage(lang);
      if (success) {
        this.currentLang = lang;
        this.updateButtonText(lang);
      }
    } else {
      console.warn('Translation manager not available');
    }
  }

  updateButtonText(lang) {
    const langNames = {
      ar: "🌐 العربية",
      en: "🌐 English", 
      tr: "🌐 Türkçe"
    };
    
    if (this.langButton) {
      this.langButton.textContent = langNames[lang] || `🌐 ${lang.toUpperCase()}`;
    }
  }

  // Public API methods
  getCurrentLanguage() {
    return this.currentLang;
  }

  isReady() {
    return this.isInitialized;
  }
}

/*====================================================
  CLEAN CAROUSEL CLASS - Unchanged but included for completeness
====================================================*/

class CleanCarousel {
  constructor(container) {
    this.container = container;
    this.slides = container.querySelectorAll('.visual-carousel-slide');
    this.dots = container.querySelectorAll('.carousel-dot-indicator');
    this.prevBtn = container.querySelector('.carousel-prev-button');
    this.nextBtn = container.querySelector('.carousel-next-button');
    
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.isAnimating = false;
    this.autoplayInterval = null;
    this.autoplayDelay = 5000;
    this.isUserInteracting = false;
    
    this.init();
  }

  init() {
    if (this.totalSlides === 0) return;
    
    this.setupEventListeners();
    this.updateSlidePositions();
    this.startAutoplay();
  }

  setupEventListeners() {
    // Button navigation
    this.prevBtn?.addEventListener('click', () => this.prevSlide());
    this.nextBtn?.addEventListener('click', () => this.nextSlide());
    
    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Mouse interaction handlers
    this.container.addEventListener('mouseenter', () => this.stopAutoplay());
    this.container.addEventListener('mouseleave', () => this.startAutoplay());
    
    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
  }

  updateSlidePositions() {
    this.slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === this.currentIndex);
    });
    
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  goToSlide(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    
    this.isAnimating = true;
    this.currentIndex = index;
    this.updateSlidePositions();
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 600);
  }

  nextSlide() {
    const nextIndex = (this.currentIndex + 1) % this.totalSlides;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    const prevIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
    this.goToSlide(prevIndex);
  }

  startAutoplay() {
    if (this.totalSlides <= 1) return;
    
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      if (!this.isUserInteracting) {
        this.nextSlide();
      }
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
}

/*====================================================
  PAGE INITIALIZER - Updated for JSON translations
====================================================*/

function globalPageInitializer() {
  console.log("Initializing page components with translation support...");

  // Initialize Enhanced Language Switcher
  if (document.getElementById("langButton") && !window.enhancedLanguageSwitcherInstance) {
    window.enhancedLanguageSwitcherInstance = new EnhancedLanguageSwitcher();
  }

  // Initialize Carousel if present
  const carouselContainer = document.querySelector('.visual-carousel-container');
  if (carouselContainer && !carouselContainer.carouselInstance) {
    carouselContainer.carouselInstance = new CleanCarousel(carouselContainer);
  }

  // Initialize animations
  initializeAnimations();

  // Load page-specific translations if translation manager is available
  initializePageTranslations();
}

/*====================================================
  PAGE-SPECIFIC TRANSLATION LOADING
====================================================*/

function initializePageTranslations() {
  // Detect current page and load appropriate translations
  const pageName = detectCurrentPage();
  
  if (pageName && window.translationManager) {
    window.translationManager.loadPageTranslations(pageName)
      .then(translations => {
        if (translations) {
          console.log(`✅ Loaded ${pageName} translations`);
          
          // Apply any additional page-specific logic here
          applyPageSpecificLogic(pageName, translations);
        }
      })
      .catch(error => {
        console.warn(`⚠️ Could not load ${pageName} translations:`, error);
      });
  }
}

function detectCurrentPage() {
  const path = window.location.pathname;
  const fileName = path.split('/').pop().replace('.html', '');
  
  // Map file names to translation namespaces
  const pageMap = {
    'index': 'home',
    'ambassador': 'ambassador',
    'embassy': 'embassy',
    'palestine': 'palestine',
    'turkey': 'turkey',
    'cultural_relations': 'cultural_relations',
    'political_relations': 'political_relations',
    'economic_relations': 'economic_relations',
    'historical_relations': 'historical_relations',
    'religious_relations': 'religious_relations',
    'events': 'events',
    'feedback': 'feedback',
    'forms': 'forms',
    'passports': 'passports',
    'services': 'services',
    'study_in_turkey': 'study_in_turkey',
    'student_guide': 'student_guide',
    'turkish_universities': 'turkish_universities',
    'former_ambassadors': 'former_ambassadors'
  };
  
  return pageMap[fileName] || null;
}

function applyPageSpecificLogic(pageName, translations) {
  // Add any page-specific translation logic here
  switch (pageName) {
    case 'home':
      // Apply homepage-specific translations
      applyHomePageTranslations(translations);
      break;
    case 'ambassador':
      // Apply ambassador page-specific translations
      applyAmbassadorPageTranslations(translations);
      break;
    // Add more cases as needed
    default:
      console.log(`No specific logic for page: ${pageName}`);
  }
}

function applyHomePageTranslations(translations) {
  // Example: Update homepage-specific elements
  if (translations.hero) {
    const heroTitle = document.getElementById('siteTitle');
    if (heroTitle && translations.hero.title) {
      heroTitle.textContent = translations.hero.title;
    }
  }
}

function applyAmbassadorPageTranslations(translations) {
  // Example: Update ambassador page-specific elements
  if (translations.ambassador) {
    const nameElement = document.getElementById('ambassador-full-name-main');
    if (nameElement && translations.ambassador.name) {
      nameElement.textContent = translations.ambassador.name;
    }
  }
}

/*====================================================
  ANIMATION UTILITIES - Unchanged
====================================================*/

function initializeAnimations() {
  const animatedElements = document.querySelectorAll(
    '.navigation-tile-card, .news-article-card, .institutional-link-card, .footer-column'
  );
  
  if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(element);
    });
  }
}

/*====================================================
  EXPORTS
====================================================*/

// Export for global use
window.globalPageInitializer = globalPageInitializer;
window.EnhancedLanguageSwitcher = EnhancedLanguageSwitcher;
window.CleanCarousel = CleanCarousel;