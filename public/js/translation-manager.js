/*====================================================
  FIXED TRANSLATION MANAGER
  Enhanced with proper initialization and error handling
====================================================*/

class TranslationManager {
  constructor() {
    this.currentLanguage = localStorage.getItem("preferredLanguage") || "ar";
    this.translations = new Map();
    this.loadingPromises = new Map();
    this.isInitialized = false;
    this.retryAttempts = 3;
    this.retryDelay = 1000;

    // Define available languages
    this.supportedLanguages = {
      ar: {
        name: "العربية",
        dir: "rtl",
        buttonText: "🌐 العربية"
      },
      en: {
        name: "English",
        dir: "ltr",
        buttonText: "🌐 English"
      },
      tr: {
        name: "Türkçe",
        dir: "ltr",
        buttonText: "🌐 Türkçe"
      }
    };

    // Cache for DOM queries
    this.elementCache = new Map();
  }

  /**
   * Initialize the translation manager
   */
  async init() {
    try {
      console.log("🌐 Initializing Translation Manager...");

      // Load common translations for current language first
      await this.loadTranslations(this.currentLanguage, "common");

      // Apply current language immediately
      this.updateDocumentLanguage(this.currentLanguage);
      this.applyTranslations(this.currentLanguage);

      this.isInitialized = true;
      console.log("✅ Translation Manager initialized successfully");

      // Dispatch ready event
      this.dispatchEvent('translationManagerReady', {
        translationManager: this,
        currentLanguage: this.currentLanguage,
        supportedLanguages: Object.keys(this.supportedLanguages)
      });

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Translation Manager:", error);
      this.handleInitializationError(error);
      return false;
    }
  }

  /**
   * Load translations from JSON file with better error handling
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
      this.loadingPromises.delete(cacheKey);
      return translations;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);

      // Use fallback translations for critical namespaces
      if (namespace === "common") {
        console.warn(`Using fallback translations for ${language}/common`);
        const fallback = this.getFallbackTranslations(language);
        this.translations.set(cacheKey, fallback);
        return fallback;
      }

      throw error;
    }
  }

  /**
   * Internal method to fetch translations
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

      const previousLanguage = this.currentLanguage;
      this.currentLanguage = language;
      localStorage.setItem("preferredLanguage", language);

      // Update document attributes
      this.updateDocumentLanguage(language);

      // Apply translations to the page
      this.applyTranslations(language);

      console.log(`🌐 Switched to language: ${language}`);

      // Dispatch language change event
      this.dispatchEvent('languageChanged', {
        language: language,
        previousLanguage: previousLanguage,
        languageInfo: this.supportedLanguages[language],
        isRTL: this.supportedLanguages[language].dir === "rtl"
      });

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
    const commonTranslations = this.translations.get(`${language}-common`);
    if (!commonTranslations) {
      console.warn(`No common translations found for ${language}, applying page-specific only.`);
      // Even if common fails, page-specific might still work
      this.applyPageSpecificTranslations(language);
      return;
    }
  
    try {
      // Apply header, footer, and common translations
      if (commonTranslations.header) this.applyHeaderTranslations(commonTranslations.header);
      if (commonTranslations.footer) this.applyFooterTranslations(commonTranslations.footer);
      if (commonTranslations.common) this.applyCommonTranslations(commonTranslations.common);
  
      // Also apply page-specific translations
      this.applyPageSpecificTranslations(language);
  
      console.log(`✅ Applied ${language} translations to page`);
    } catch (error) {
      console.error(`❌ Error applying translations:`, error);
    }
  }

  applyPageSpecificTranslations(language) {
    const pageName = this.detectCurrentPage();
    if (pageName) {
      const pageTranslations = this.translations.get(`${language}-${pageName}`);
      if (pageTranslations) {
        console.log(`Applying translations for page: ${pageName}`);
        // Here you would have specific functions to apply these translations
        // For now, let's just log it.
      }
    }
  }
  
  detectCurrentPage() {
      const path = window.location.pathname;
      const fileName = path.split('/').pop().replace('.html', '');
      if (fileName === 'index' || fileName === '') return 'home';
      return fileName;
  }
  
  /**
   * Apply header translations
   */
  applyHeaderTranslations(headerTranslations) {
    if (!headerTranslations) return;

    // Logo alt text
    this.updateElement('img[alt*="شعار"], img[alt*="Logo"], img[alt*="logo"]',
                      headerTranslations.logo_alt, 'alt');

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

    // Copyright
    if (footerTranslations.copyright) {
      this.updateElementById('copyright', footerTranslations.copyright);
    }
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

    // Update body data attributes
    document.body.setAttribute('data-lang', language);
    document.body.setAttribute('data-dir', langInfo.dir);

    // Update body class for RTL/LTR
    document.body.classList.remove('rtl', 'ltr');
    document.body.classList.add(langInfo.dir);
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
    if (!element || !text) return;

    try {
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
    } catch (error) {
      console.warn(`Failed to update element:`, element, error);
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
          logo_alt: "شعار السفارة",
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
          logo_alt: "Embassy Logo",
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
          logo_alt: "Büyükelçilik Logosu",
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

    // Mark as initialized even with fallbacks
    this.isInitialized = true;

    // Dispatch ready event even with fallbacks
    this.dispatchEvent('translationManagerReady', {
      translationManager: this, // Ensure instance is passed on error
      currentLanguage: this.currentLanguage,
      supportedLanguages: Object.keys(this.supportedLanguages),
      fallbackMode: true
    });
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
   * Get button text for current language
   */
  getButtonText(language = null) {
    const lang = language || this.currentLanguage;
    return this.supportedLanguages[lang]?.buttonText || `🌐 ${lang.toUpperCase()}`;
  }

  /**
   * Check if translation manager is ready
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Utility method for delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Dispatch custom events safely
   */
  dispatchEvent(eventName, detail) {
    try {
      document.dispatchEvent(new CustomEvent(eventName, {
        detail
      }));
    } catch (error) {
      console.warn(`Failed to dispatch event ${eventName}:`, error);
    }
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.translations.clear();
    this.elementCache.clear();
    this.loadingPromises.clear();
    console.log("🗑️ Translation cache cleared");
  }
}

/*====================================================
  GLOBAL INITIALIZATION
====================================================*/

// Global instance
let translationManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🌐 Initializing Translation Manager...');

  try {
    // Create the instance
    translationManager = new TranslationManager();

    // Make it available globally immediately to prevent race conditions
    window.translationManager = translationManager;

    // Now, initialize it (which will load files and dispatch events)
    await translationManager.init();

    console.log('✅ Translation Manager ready');

  } catch (error) {
    console.error("❌ Failed to initialize translation manager:", error);
    // The init method has its own internal error handling,
    // but we catch any synchronous errors here.
  }
});

// Export
window.TranslationManager = TranslationManager;