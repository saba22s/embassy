/*====================================================
  ENHANCED TRANSLATION MANAGER
  Handles JSON-based translations with caching and fallbacks
====================================================*/

class TranslationManager {
  constructor() {
    this.currentLanguage = localStorage.getItem("preferredLanguage") || "ar";
    this.translations = new Map();
    this.loadingPromises = new Map();
    this.fallbackTranslations = new Map();
    this.isInitialized = false;
    this.retryAttempts = 3;
    this.retryDelay = 1000;

    // Define available languages and their metadata
    this.supportedLanguages = {
      ar: { 
        name: "العربية", 
        dir: "rtl", 
        flag: "🇵🇸",
        buttonText: "🌐 العربية"
      },
      en: { 
        name: "English", 
        dir: "ltr", 
        flag: "🇺🇸",
        buttonText: "🌐 English"
      },
      tr: { 
        name: "Türkçe", 
        dir: "ltr", 
        flag: "🇹🇷",
        buttonText: "🌐 Türkçe"
      }
    };

    // Cache for DOM queries to improve performance
    this.elementCache = new Map();
  }

  /**
   * Initialize the translation manager
   */
  async init() {
    try {
      console.log("🌐 Initializing Translation Manager...");
      
      // Load common translations for all languages
      await Promise.all([
        this.loadTranslations("ar", "common"),
        this.loadTranslations("en", "common"),
        this.loadTranslations("tr", "common")
      ]);

      // Set up language switcher UI
      this.setupLanguageSwitcher();
      
      // Apply current language
      await this.switchLanguage(this.currentLanguage);
      
      this.isInitialized = true;
      console.log("✅ Translation Manager initialized successfully");
      
      // Dispatch ready event
      document.dispatchEvent(new CustomEvent('translationManagerReady', {
        detail: { 
          currentLanguage: this.currentLanguage,
          supportedLanguages: Object.keys(this.supportedLanguages)
        }
      }));

    } catch (error) {
      console.error("❌ Failed to initialize Translation Manager:", error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Load translations from JSON file
   */
  async loadTranslations(language, namespace, attempt = 1) {
    const cacheKey = `${language}-${namespace}`;
    
    // Return cached translations if available
    if (this.translations.has(cacheKey)) {
      return this.translations.get(cacheKey);
    }

    // Return existing loading promise if already in progress
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    const loadingPromise = this._fetchTranslations(language, namespace, attempt);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const translations = await loadingPromise;
      this.translations.set(cacheKey, translations);
      return translations;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Internal method to fetch translations with retry logic
   */
  async _fetchTranslations(language, namespace, attempt) {
    const url = `/public/locales/${language}/${namespace}.json`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const translations = await response.json();
      console.log(`✅ Loaded translations: ${language}/${namespace}`);
      return translations;

    } catch (error) {
      console.error(`❌ Failed to load ${url} (attempt ${attempt}):`, error);
      
      if (attempt < this.retryAttempts) {
        console.log(`🔄 Retrying in ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay);
        return this._fetchTranslations(language, namespace, attempt + 1);
      }
      
      // Return fallback for common translations
      if (namespace === "common") {
        return this.getFallbackTranslations(language);
      }
      
      throw error;
    }
  }

  /**
   * Switch to a different language
   */
  async switchLanguage(language) {
    if (!this.supportedLanguages[language]) {
      console.warn(`Language "${language}" not supported`);
      return false;
    }

    try {
      // Load common translations for the target language
      await this.loadTranslations(language, "common");
      
      this.currentLanguage = language;
      localStorage.setItem("preferredLanguage", language);

      // Update document attributes
      this.updateDocumentLanguage(language);
      
      // Apply translations to the page
      this.applyTranslations(language);
      
      // Update language switcher UI
      this.updateLanguageSwitcher(language);

      console.log(`🌐 Switched to language: ${language}`);
      
      // Dispatch language change event
      document.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { 
          language: language,
          languageInfo: this.supportedLanguages[language],
          isRTL: this.supportedLanguages[language].dir === "rtl"
        }
      }));

      return true;
    } catch (error) {
      console.error(`❌ Failed to switch to language ${language}:`, error);
      return false;
    }
  }

  /**
   * Apply translations to DOM elements
   */
  applyTranslations(language) {
    const translations = this.translations.get(`${language}-common`);
    if (!translations) {
      console.warn(`No translations found for ${language}`);
      return;
    }

    // Clear element cache when switching languages
    this.elementCache.clear();

    // Apply header translations
    this.applyHeaderTranslations(translations.header);
    
    // Apply footer translations
    this.applyFooterTranslations(translations.footer);
    
    // Apply common translations
    this.applyCommonTranslations(translations.common);
  }

  /**
   * Apply header translations
   */
  applyHeaderTranslations(headerTranslations) {
    if (!headerTranslations) return;

    // Logo alt text
    this.updateElement('img[alt="شعار السفارة"]', headerTranslations.logo_alt, 'alt');

    // Navigation items
    if (headerTranslations.navigation) {
      Object.entries(headerTranslations.navigation).forEach(([key, value]) => {
        // Convert snake_case to kebab-case for IDs
        const elementId = key.replace(/_/g, '-');
        this.updateElementById(elementId, value);
      });
    }
  }

  /**
   * Apply footer translations
   */
  applyFooterTranslations(footerTranslations) {
    if (!footerTranslations) return;

    // About section
    if (footerTranslations.about) {
      this.updateElementById('about-title', footerTranslations.about.title);
      this.updateElementById('about-text', footerTranslations.about.text);
    }

    // Important links
    if (footerTranslations.important_links) {
      this.updateElementById('links-title', footerTranslations.important_links.title);
      this.updateElementById('link-foreign-ministry', footerTranslations.important_links.foreign_ministry);
      this.updateElementById('link-interior-ministry', footerTranslations.important_links.interior_ministry);
      this.updateElementById('link-consulate-istanbul', footerTranslations.important_links.consulate_istanbul);
    }

    // Contact section
    if (footerTranslations.contact) {
      this.updateElementById('contact-title', footerTranslations.contact.title);
      this.updateElementById('contact-location', footerTranslations.contact.location);
      this.updateElementById('contact-phone', footerTranslations.contact.phone);
      this.updateElementById('contact-fax', footerTranslations.contact.fax);
      this.updateElementById('contact-email', footerTranslations.contact.email);
    }

    // Social media aria labels
    if (footerTranslations.social_media) {
      this.updateElement('a[aria-label="Facebook"]', footerTranslations.social_media.facebook_aria, 'aria-label');
      this.updateElement('a[aria-label="X"]', footerTranslations.social_media.twitter_aria, 'aria-label');
      this.updateElement('a[aria-label="Instagram"]', footerTranslations.social_media.instagram_aria, 'aria-label');
      this.updateElement('a[aria-label="LinkedIn"]', footerTranslations.social_media.linkedin_aria, 'aria-label');
      this.updateElement('a[aria-label="YouTube"]', footerTranslations.social_media.youtube_aria, 'aria-label');
    }

    // Copyright
    this.updateElementById('copyright', footerTranslations.copyright);
  }

  /**
   * Apply common translations
   */
  applyCommonTranslations(commonTranslations) {
    if (!commonTranslations) return;

    // Apply common UI elements
    Object.entries(commonTranslations).forEach(([key, value]) => {
      this.updateElementById(`common-${key}`, value);
      this.updateElementByClass(`common-${key}`, value);
    });
  }

  /**
   * Update document language attributes
   */
  updateDocumentLanguage(language) {
    const langInfo = this.supportedLanguages[language];
    
    document.documentElement.lang = language;
    document.documentElement.dir = langInfo.dir;
    
    // Update body data attributes for CSS hooks
    document.body.setAttribute('data-lang', language);
    document.body.setAttribute('data-dir', langInfo.dir);
    
    // Update body class for RTL/LTR
    document.body.classList.toggle('rtl', langInfo.dir === 'rtl');
    document.body.classList.toggle('ltr', langInfo.dir === 'ltr');
  }

  /**
   * Setup language switcher UI
   */
  setupLanguageSwitcher() {
    const langButton = document.getElementById("langButton");
    const langMenu = document.getElementById("langMenu");
    
    if (!langButton || !langMenu) {
      console.warn('Language switcher elements not found');
      return;
    }

    // Setup button click
    langButton.addEventListener("click", (e) => {
      e.stopPropagation();
      langMenu.classList.toggle("hidden");
      langMenu.classList.toggle("show");
    });

    // Setup language selection
    langMenu.addEventListener("click", (e) => {
      const langItem = e.target.closest("[data-lang]");
      if (langItem) {
        const selectedLang = langItem.dataset.lang;
        this.switchLanguage(selectedLang);
        langMenu.classList.add("hidden");
        langMenu.classList.remove("show");
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!langMenu.contains(e.target) && !langButton.contains(e.target)) {
        langMenu.classList.add("hidden");
        langMenu.classList.remove("show");
      }
    });
  }

  /**
   * Update language switcher button text
   */
  updateLanguageSwitcher(language) {
    const langButton = document.getElementById("langButton");
    if (langButton && this.supportedLanguages[language]) {
      langButton.textContent = this.supportedLanguages[language].buttonText;
    }
  }

  /**
   * Helper method to update element by ID
   */
  updateElementById(id, text, attribute = 'textContent') {
    const element = this.getCachedElement(`#${id}`);
    if (element) {
      this.updateElementContent(element, text, attribute);
    }
  }

  /**
   * Helper method to update elements by class
   */
  updateElementByClass(className, text, attribute = 'textContent') {
    const elements = this.getCachedElements(`.${className}`);
    elements.forEach(element => {
      this.updateElementContent(element, text, attribute);
    });
  }

  /**
   * Helper method to update element by selector
   */
  updateElement(selector, text, attribute = 'textContent') {
    const element = this.getCachedElement(selector);
    if (element) {
      this.updateElementContent(element, text, attribute);
    }
  }

  /**
   * Update element content based on type
   */
  updateElementContent(element, text, attribute) {
    if (attribute === 'textContent') {
      if (element.tagName === 'INPUT') {
        if (element.type === 'submit' || element.type === 'button') {
          element.value = text;
        } else {
          element.placeholder = text;
        }
      } else {
        element.textContent = text;
      }
    } else {
      element.setAttribute(attribute, text);
    }
  }

  /**
   * Cache DOM queries for better performance
   */
  getCachedElement(selector) {
    if (!this.elementCache.has(selector)) {
      const element = document.querySelector(selector);
      this.elementCache.set(selector, element);
    }
    return this.elementCache.get(selector);
  }

  getCachedElements(selector) {
    const cacheKey = `${selector}:all`;
    if (!this.elementCache.has(cacheKey)) {
      const elements = Array.from(document.querySelectorAll(selector));
      this.elementCache.set(cacheKey, elements);
    }
    return this.elementCache.get(cacheKey);
  }

  /**
   * Get fallback translations for critical failures
   */
  getFallbackTranslations(language) {
    const fallbacks = {
      ar: {
        header: {
          navigation: {
            home: "الرئيسية",
            news: "الأخبار",
            embassy: "السفارة",
            contact: "التواصل"
          }
        },
        footer: {
          copyright: "2025 © سفارة دولة فلسطين"
        },
        common: {
          loading: "جاري التحميل...",
          error: "حدث خطأ"
        }
      },
      en: {
        header: {
          navigation: {
            home: "Home",
            news: "News",
            embassy: "Embassy",
            contact: "Contact"
          }
        },
        footer: {
          copyright: "2025 © Embassy of the State of Palestine"
        },
        common: {
          loading: "Loading...",
          error: "An error occurred"
        }
      },
      tr: {
        header: {
          navigation: {
            home: "Ana Sayfa",
            news: "Haberler",
            embassy: "Büyükelçilik",
            contact: "İletişim"
          }
        },
        footer: {
          copyright: "2025 © Filistin Devleti Büyükelçiliği"
        },
        common: {
          loading: "Yükleniyor...",
          error: "Bir hata oluştu"
        }
      }
    };

    return fallbacks[language] || fallbacks.ar;
  }

  /**
   * Handle initialization errors gracefully
   */
  handleInitializationError(error) {
    console.error("Translation Manager initialization failed:", error);
    
    // Apply fallback translations
    const fallback = this.getFallbackTranslations(this.currentLanguage);
    this.translations.set(`${this.currentLanguage}-common`, fallback);
    this.applyTranslations(this.currentLanguage);
    
    // Show user-friendly error message
    this.showTranslationError();
  }

  /**
   * Show translation error to user
   */
  showTranslationError() {
    const errorBanner = document.createElement('div');
    errorBanner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #fff3cd;
      color: #856404;
      padding: 10px;
      text-align: center;
      z-index: 10000;
      font-size: 14px;
      border-bottom: 1px solid #ffeaa7;
    `;
    
    const messages = {
      ar: "تم تحميل ترجمات محدودة. قد لا تظهر بعض النصوص بشكل صحيح.",
      en: "Limited translations loaded. Some text may not display correctly.",
      tr: "Sınırlı çeviriler yüklendi. Bazı metinler doğru görüntülenmeyebilir."
    };
    
    errorBanner.textContent = messages[this.currentLanguage] || messages.ar;
    document.body.prepend(errorBanner);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorBanner.remove();
    }, 5000);
  }

  /**
   * Load page-specific translations
   */
  async loadPageTranslations(pageName) {
    try {
      const translations = await this.loadTranslations(this.currentLanguage, pageName);
      
      // Apply page-specific translations
      this.applyPageTranslations(translations, pageName);
      
      console.log(`✅ Applied ${pageName} translations for ${this.currentLanguage}`);
      
      // Dispatch page translations loaded event
      document.dispatchEvent(new CustomEvent('pageTranslationsLoaded', {
        detail: { 
          page: pageName,
          language: this.currentLanguage,
          translations: translations
        }
      }));
      
      return translations;
    } catch (error) {
      console.warn(`⚠️ Failed to load ${pageName} translations:`, error);
      return null;
    }
  }

  /**
   * Apply page-specific translations
   */
  applyPageTranslations(translations, pageName) {
    if (!translations) return;
    
    // Clear element cache for fresh queries
    this.elementCache.clear();
    
    // Recursively apply translations
    this.applyNestedTranslations(translations, pageName);
  }

  /**
   * Recursively apply nested translation objects
   */
  applyNestedTranslations(obj, prefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Recurse for nested objects
        this.applyNestedTranslations(value, prefix ? `${prefix}-${key}` : key);
      } else if (typeof value === 'string') {
        // Apply translation
        const elementId = prefix ? `${prefix}-${key}` : key;
        this.updateElementById(elementId, value);
      }
    });
  }

  /**
   * Get translation by key path
   */
  getTranslation(keyPath, namespace = 'common', language = null) {
    const lang = language || this.currentLanguage;
    const translations = this.translations.get(`${lang}-${namespace}`);
    
    if (!translations) return keyPath; // Return key as fallback
    
    // Navigate nested object using dot notation
    return keyPath.split('.').reduce((obj, key) => {
      return obj && obj[key] !== undefined ? obj[key] : keyPath;
    }, translations);
  }

  /**
   * Format translation with parameters
   */
  formatTranslation(keyPath, params = {}, namespace = 'common', language = null) {
    let translation = this.getTranslation(keyPath, namespace, language);
    
    // Replace parameters in translation
    Object.entries(params).forEach(([key, value]) => {
      translation = translation.replace(`{{${key}}}`, value);
    });
    
    return translation;
  }

  /**
   * Utility method for delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current language info
   */
  getCurrentLanguage() {
    return {
      code: this.currentLanguage,
      ...this.supportedLanguages[this.currentLanguage]
    };
  }

  /**
   * Check if translation manager is ready
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return Object.keys(this.supportedLanguages);
  }

  /**
   * Add custom translations at runtime
   */
  addTranslations(language, namespace, translations) {
    const cacheKey = `${language}-${namespace}`;
    const existing = this.translations.get(cacheKey) || {};
    
    // Deep merge translations
    const merged = this.deepMerge(existing, translations);
    this.translations.set(cacheKey, merged);
    
    console.log(`✅ Added custom translations for ${language}/${namespace}`);
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });
    
    return result;
  }

  /**
   * Clear translation cache
   */
  clearCache() {
    this.translations.clear();
    this.elementCache.clear();
    this.loadingPromises.clear();
    console.log("🗑️ Translation cache cleared");
  }

  /**
   * Export current translations for debugging
   */
  exportTranslations() {
    const exported = {};
    this.translations.forEach((value, key) => {
      exported[key] = value;
    });
    return exported;
  }
}

/*====================================================
  GLOBAL INITIALIZATION AND INTEGRATION
====================================================*/

// Create global instance
let translationManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    translationManager = new TranslationManager();
    await translationManager.init();
    
    // Make available globally
    window.translationManager = translationManager;
    window.t = (keyPath, params, namespace, language) => 
      translationManager.formatTranslation(keyPath, params, namespace, language);
    
  } catch (error) {
    console.error("Failed to initialize translation manager:", error);
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TranslationManager;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.TranslationManager = TranslationManager;
}