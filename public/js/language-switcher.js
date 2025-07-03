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
  }

  async handleI18nextReady() {
    try {
      // Wait for elements to be available
      this.langButton = await waitForElement('#langButton');
      this.langMenu = await waitForElement('#langMenu');
      this.langItems = this.langMenu.querySelectorAll("li[data-lang]");

      this.init();
    } catch (error) {
      console.error('❌ Failed to find language switcher elements:', error);
    }
  }

  init() {
    if (this.isInitialized) return;

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
      const buttonText = i18next.t('common:header.language_switcher.button_text');
      this.langButton.textContent = buttonText;
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
new LanguageSwitcher();