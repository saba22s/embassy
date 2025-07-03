/*====================================================
  MAIN.JS - Core Component Loader (Cleaned)
  Handles loading header/footer only - NO page-specific features
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

      // Dispatch componentsLoaded event
      document.dispatchEvent(new CustomEvent('componentsLoaded'));
      console.log('✅ Components loaded and componentsLoaded event dispatched');

    } catch (error) {
      console.error('❌ Failed to initialize components:', error);
      this.handleFallback();
    }
  }

  async loadComponent(url, containerId, attempt = 1) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`⚠️ Container with ID '${containerId}' not found`);
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
  GLOBAL ERROR HANDLING
====================================================*/
window.addEventListener('error', (event) => {
  console.error('🚨 JavaScript Error:', {
    message: event.error ? event.error.message : event.message,
    filename: event.filename,
    line: event.lineno,
    column: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
});

/*====================================================
  MAIN INITIALIZATION
====================================================*/
let componentLoader;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOM Content Loaded - Initializing ComponentLoader...');
  
  try {
    componentLoader = new ComponentLoader();
    await componentLoader.init(); 
  } catch (error) {
    console.error('🚨 Critical error during page initialization:', error);
  }
});

/*====================================================
  UTILITY FUNCTIONS (Essential only)
====================================================*/
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
  EXPORTS
====================================================*/
window.ComponentLoader = ComponentLoader;
window.waitForElement = waitForElement;
window.getComponentLoader = () => componentLoader;