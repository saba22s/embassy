/*====================================================
  Language Switcher (Updated for i18next)
====================================================*/

class LanguageSwitcher {
  constructor() {
    this.langButton = null;
    this.langMenu = null;
    this.langItems = [];
    this.isInitialized = false;

    // Listen for i18nextReady before trying to initialize fully
    document.addEventListener('i18nextReady', this.handleI18nextReady.bind(this));
  }

  async handleI18nextReady() {
    try {
      this.langButton = await waitForElement('#langButton');
      this.langMenu = await waitForElement('#langMenu');
      this.langItems = this.langMenu.querySelectorAll("li");

      this.init(); // Now safe to initialize as i18next is ready and elements exist
    } catch (error) {
      console.error('❌ Failed to find language switcher elements after i18nextReady:', error);
      // Can show an error message to the user here if this is a critical UI part
    }
  }

  init() {
    if (this.isInitialized) return; // Prevent multiple initializations

    this.setupEventListeners();
    this.updateButtonText(); // Update button text on initial setup
    this.isInitialized = true;
    console.log('✅ Language Switcher fully initialized with i18next support');
  }

  setupEventListeners() {
    // Button click handler
    this.langButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (this.langMenu && !this.langMenu.contains(e.target) && !this.langButton.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Language selection
    this.langItems.forEach((item) => {
      item.addEventListener("click", async (e) => {
        e.preventDefault();
        const selectedLang = item.dataset.lang;
        if (selectedLang && typeof i18next !== 'undefined') {
          await i18next.changeLanguage(selectedLang); // Change language using i18next
          localStorage.setItem("preferredLanguage", selectedLang); // Save language preference
          this.closeMenu();
        } else {
          console.warn('No language data or i18next not available');
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
      if (e.key === "Escape" && this.langMenu && !this.langMenu.classList.contains("hidden")) {
        this.closeMenu();
        this.langButton.focus();
      }
    });

    // Listen for language changes from i18next to update button text
    if (typeof i18next !== 'undefined') {
        i18next.on('languageChanged', () => {
            this.updateButtonText();
        });
    }
  }

  toggleMenu() {
    if (this.langMenu) {
      const isHidden = this.langMenu.classList.contains("hidden");
      if (isHidden) {
        this.langMenu.classList.remove("hidden");
        this.langMenu.classList.add("show");
      } else {
        this.langMenu.classList.add("hidden");
        this.langMenu.classList.remove("show");
      }
    }
  }

  closeMenu() {
    if (this.langMenu) {
      this.langMenu.classList.add("hidden");
      this.langMenu.classList.remove("show");
    }
  }

  updateButtonText() {
    if (this.langButton && typeof i18next !== 'undefined') {
      this.langButton.textContent = i18next.t('common:header.language_switcher.button_text');
    }
  }

  getCurrentLanguage() {
    return typeof i18next !== 'undefined' ? i18next.language : localStorage.getItem('preferredLanguage') || 'ar';
  }

  isReady() {
    return this.isInitialized;
  }
}

// Instantiate LanguageSwitcher to set up its event listener
new LanguageSwitcher();