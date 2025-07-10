/*====================================================
  Language Switcher (Clean and Simple)
====================================================*/

class LanguageSwitcher {
  constructor() {
    this.langButton = null;
    this.langMenu = null;
    this.langItems = [];
    this.isInitialized = false;

    // Initialize when i18next is ready
    document.addEventListener('i18nextReady', this.handleI18nextReady.bind(this));
    // Also listen for componentsLoaded, in case i18nextReady fires before header is in DOM
    document.addEventListener('componentsLoaded', this.handleComponentsLoaded.bind(this));
  }

  async handleComponentsLoaded() {
    // Only proceed if i18next is already ready, or we are sure we'll get an i18nextReady event soon
    // and elements are available.
    try {
      this.langButton = await waitForElement('#langButton');
      this.langMenu = await waitForElement('#langMenu');
      this.langItems = this.langMenu.querySelectorAll("li[data-lang]");
      
      // If i18next is already initialized, just init the switcher
      if (typeof i18next !== 'undefined' && i18next.isInitialized) {
        this.init();
      } else {
        // Otherwise, init will be called by handleI18nextReady
        console.log('LanguageSwitcher: Components loaded, waiting for i18nextReady...');
      }
    } catch (error) {
      console.error('❌ LanguageSwitcher: Failed to find language switcher elements after components loaded:', error);
    }
  }

  async handleI18nextReady() {
    try {
      // Ensure elements are available if not already found by handleComponentsLoaded
      if (!this.langButton) {
        this.langButton = await waitForElement('#langButton');
      }
      if (!this.langMenu) {
        this.langMenu = await waitForElement('#langMenu');
      }
      if (this.langItems.length === 0 && this.langMenu) { // Re-query if empty
        this.langItems = this.langMenu.querySelectorAll("li[data-lang]");
      }

      this.init();
    } catch (error) {
      console.error('❌ LanguageSwitcher: Failed to find language switcher elements during i18next ready:', error);
    }
  }

  init() {
    if (this.isInitialized || !this.langButton || !this.langMenu || this.langItems.length === 0) {
        if (!this.isInitialized) console.log('LanguageSwitcher: Init skipped - missing elements or already initialized.');
        return; 
    }

    this.setupEventListeners();
    this.updateButtonText();
    this.isInitialized = true;
    console.log('✅ Language Switcher initialized');
  }

  setupEventListeners() {
    // Button click handler
    this.langButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (this.langMenu && 
          !this.langMenu.contains(e.target) && 
          !this.langButton.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Language selection
    this.langItems.forEach((item) => {
      item.addEventListener("click", async (e) => {
        e.preventDefault();
        const selectedLang = item.dataset.lang;
        
        if (selectedLang && typeof i18next !== 'undefined') {
          try {
            await i18next.changeLanguage(selectedLang);
            localStorage.setItem("preferredLanguage", selectedLang);
            this.closeMenu();
            console.log(`🌍 Language changed to: ${selectedLang}`);
          } catch (error) {
            console.error('❌ Failed to change language:', error);
          }
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
      if (e.key === "Escape" && this.isMenuOpen()) {
        this.closeMenu();
        this.langButton.focus();
      }
    });

    // Listen for language changes from i18next
    if (typeof i18next !== 'undefined') {
        i18next.on('languageChanged', () => {
            this.updateButtonText();
        });
    }
  }

  toggleMenu() {
    if (this.isMenuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    if (this.langMenu) {
      this.langMenu.classList.remove("hidden");
      this.langMenu.classList.add("show");
    }
  }

  closeMenu() {
    if (this.langMenu) {
      this.langMenu.classList.add("hidden");
      this.langMenu.classList.remove("show");
    }
  }

  isMenuOpen() {
    return this.langMenu && !this.langMenu.classList.contains("hidden");
  }

  updateButtonText() {
    if (this.langButton && typeof i18next !== 'undefined') {
      const currentLang = i18next.language;
      const buttonTextKey = `common:header.language_switcher.${currentLang}`;
      const buttonText = i18next.t(buttonTextKey, { defaultValue: currentLang.toUpperCase() }); // Fallback to uppercase code
      this.langButton.textContent = `🌐 ${buttonText}`;
    }
  }

  getCurrentLanguage() {
    return typeof i18next !== 'undefined' ? 
           i18next.language : 
           localStorage.getItem('preferredLanguage') || 'ar';
  }

  isReady() {
    return this.isInitialized;
  }
}

/*====================================================
  INITIALIZATION
====================================================*/

// Create instance
const languageSwitcherInstance = new LanguageSwitcher();

// Expose a global function for direct language changes if needed by external scripts (optional)
window.changeLanguage = (lang) => {
    if (languageSwitcherInstance.isReady()) {
        i18next.changeLanguage(lang);
        localStorage.setItem('preferredLanguage', lang);
    } else {
        console.warn('Language switcher not fully initialized. Saving preference but change might not be immediate.');
        localStorage.setItem('preferredLanguage', lang);
        // Fallback to reload if switcher isn't ready. This might be necessary if some page scripts depend on instant change.
        location.reload();
    }
};

// This ensures the language preferences are set and applied even if i18n-init is slightly delayed
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && document.documentElement.lang !== savedLang) {
        document.documentElement.lang = savedLang;
        document.documentElement.dir = (savedLang === 'ar') ? 'rtl' : 'ltr';
        document.body.classList.toggle('rtl', savedLang === 'ar');
        document.body.classList.toggle('ltr', savedLang !== 'ar');
    }
});