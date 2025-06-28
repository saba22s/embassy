/*====================================================
  MAIN.JS - Clean Module Loader
  Handles loading header/footer and initializing components
====================================================*/

class ComponentLoader {
  constructor() {
    this.loadedComponents = new Set();
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  async init() {
    try {
      // Load header and footer in parallel
      await Promise.all([
        this.loadComponent('/partials/_header.html', 'header-container'),
        this.loadComponent('/partials/_footer.html', 'footer-container')
      ]);

      // Initialize all page features after components are loaded
      await this.initializeFeatures();

    } catch (error) {
      console.error('Failed to initialize components:', error);
      this.handleFallback();
    }
  }

  async loadComponent(url, containerId, attempt = 1) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container with ID '${containerId}' not found`);
      return;
    }

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const htmlContent = await response.text();
      container.innerHTML = htmlContent;
      this.loadedComponents.add(containerId);
      
      console.log(`✅ Loaded ${url} into ${containerId}`);

    } catch (error) {
      console.error(`❌ Failed to load ${url} (attempt ${attempt}):`, error);
      
      if (attempt < this.retryAttempts) {
        console.log(`🔄 Retrying in ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay);
        return this.loadComponent(url, containerId, attempt + 1);
      } else {
        this.renderFallback(container, url);
      }
    }
  }

  async initializeFeatures() {
    // Check if global initializer is available
    if (typeof globalPageInitializer === 'function') {
      try {
        globalPageInitializer();
        console.log('✅ Page features initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing page features:', error);
      }
    } else {
      console.error('❌ globalPageInitializer function not found. Ensure language-switcher.js is loaded.');
    }

    // Initialize additional features specific to the current page
    this.initializePageSpecificFeatures();
  }

  initializePageSpecificFeatures() {
    // Setup external links to open in new tab
    this.setupExternalLinks();
    
    // Setup form validation if forms exist
    this.setupFormValidation();
    
    // Setup smooth scrolling for anchor links
    this.setupSmoothScrolling();
  }

  setupExternalLinks() {
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
    externalLinks.forEach(link => {
      if (!link.hasAttribute('target')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      if (!form.dataset.validationInitialized) {
        form.addEventListener('submit', this.validateForm);
        form.dataset.validationInitialized = 'true';
      }
    });
  }

  validateForm(event) {
    const form = event.target;
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });

    if (!isValid) {
      event.preventDefault();
      console.warn('Form validation failed');
    }
  }

  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      if (!anchor.dataset.smoothScrollInitialized) {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          
          try {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }
          } catch (error) {
            console.warn('Invalid selector for smooth scroll:', targetId);
          }
        });
        anchor.dataset.smoothScrollInitialized = 'true';
      }
    });
  }

  renderFallback(container, url) {
    const fallbackHTML = `
      <div style="
        background: #f8f9fa; 
        border: 1px solid #dee2e6; 
        border-radius: 4px; 
        padding: 20px; 
        text-align: center; 
        color: #6c757d;
        margin: 10px 0;
      ">
        <p style="margin: 0; font-size: 14px;">
          ⚠️ Unable to load content from <code>${url}</code>
        </p>
        <p style="margin: 5px 0 0 0; font-size: 12px;">
          Please check your connection and refresh the page.
        </p>
      </div>
    `;
    container.innerHTML = fallbackHTML;
  }

  handleFallback() {
    // Show a global error message if critical components fail to load
    const fallbackBanner = document.createElement('div');
    fallbackBanner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #dc3545;
      color: white;
      padding: 10px;
      text-align: center;
      z-index: 9999;
      font-size: 14px;
    `;
    fallbackBanner.innerHTML = `
      ⚠️ Some components failed to load. Please refresh the page.
      <button onclick="location.reload()" style="
        background: white;
        color: #dc3545;
        border: none;
        padding: 5px 10px;
        margin-left: 10px;
        border-radius: 3px;
        cursor: pointer;
      ">Refresh</button>
    `;
    document.body.prepend(fallbackBanner);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API
  isComponentLoaded(containerId) {
    return this.loadedComponents.has(containerId);
  }

  getAllLoadedComponents() {
    return Array.from(this.loadedComponents);
  }
}

/*====================================================
  ERROR HANDLING
====================================================*/

class ErrorHandler {
  constructor() {
    this.setupGlobalErrorHandling();
  }

  setupGlobalErrorHandling() {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('🚨 JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        console.error('🚨 Resource Loading Error:', {
          element: event.target.tagName,
          source: event.target.src || event.target.href,
          message: 'Failed to load resource'
        });
      }
    }, true);
  }
}

/*====================================================
  MAIN INITIALIZATION
====================================================*/

// Initialize error handling
const errorHandler = new ErrorHandler();
let componentLoader;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOM Content Loaded - Initializing...');
  
  try {
    // Initialize component loader
    componentLoader = new ComponentLoader();
    
    // Load all components
    await componentLoader.init();
    
    console.log('✅ All components loaded and initialized');
    
  } catch (error) {
    console.error('🚨 Critical error during page initialization:', error);
  }
});

// Handle page visibility changes (pause operations when hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('📱 Page hidden - pausing operations');
  } else {
    console.log('📱 Page visible - resuming operations');
  }
});

/*====================================================
  UTILITY FUNCTIONS
====================================================*/

// Debounce function for performance
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Wait for element to exist
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/*====================================================
  EXPORTS FOR GLOBAL USE
====================================================*/

// Make utilities available globally
window.ComponentLoader = ComponentLoader;
window.ErrorHandler = ErrorHandler;
window.debounce = debounce;
window.isInViewport = isInViewport;
window.waitForElement = waitForElement;

// Export component loader instance for other scripts
window.getComponentLoader = () => componentLoader;


