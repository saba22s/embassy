/*====================================================
  LANGUAGE-SWITCHER.JS - Clean Language Management
  Handles language switching without design conflicts
====================================================*/

class LanguageSwitcher {
  constructor() {
    this.langButton = document.getElementById("langButton");
    this.langMenu = document.getElementById("langMenu");
    this.langItems = this.langMenu?.querySelectorAll("li") || [];
    this.currentLang = localStorage.getItem("preferredLanguage") || "ar";
    this.isInitialized = false;

    // Complete translations object
    this.translations = {
      ar: {
        // Navigation
        home: "الرئيسية",
        news: "الأخبار",
        embassy: "السفارة",
        "embassy-about": "السفارة في السطور",
        "embassy-ambassador": "السفير",
        "embassy-former": "السفراء السابقون",
        education: "الشؤون التعليمية",
        "edu-universities": "الجامعات في تركيا",
        "edu-study": "الدراسة في تركيا",
        "edu-guide": "دليل الطلاب الجديد",
        consular: "الشؤون القنصلية",
        "cons-passports": "الجوازات",
        "cons-forms": "النماذج",
        "cons-services": "خدمات السفارة",
        "cons-guide": "دليل المواطن للخدمات القنصلية",
        relations: "العلاقات الفلسطينية التركية",
        "rel-pal": "فلسطين",
        "rel-tur": "تركيا",
        "rel-rel": "العلاقات الدينية",
        "rel-his": "العلاقات التاريخية",
        "rel-cul": "العلاقات الثقافية",
        "rel-pol": "العلاقات السياسية",
        "rel-eco": "العلاقات الاقتصادية",
        misc: "متفرقات",
        "misc-events": "الأحداث والأنشطة",
        "misc-feedback": "الاقتراحات والشكاوي",
        "misc-links": "مواقع هامة",
        "misc-media": "الوسائط",
        passport: "الاستعلام عن جواز السفر",
        contact: "التواصل",

        // Common Elements
        siteTitle: "سفارة دولة فلسطين في تركيا",
        ambassadorTitle: "كلمة السفير",
        ambassadorMessage: "بإسم سفارة دولة فلسطين لدى الجمهورية التركية وكافة العاملين فيها، يسعدني أن أتوجه إليكم بالتحيه والتقدير، وأرحب بكافة زائري موقعنا هذا بحلته الجديدة، أملاً أن يشكل هذا الموقع نافذة للجمهور الفلسطيني لكي يتعرف من خلاله على كافة المعلومات المطلوبة حول السفارة، ودورها، ونشاطاتها في كافة المجالات، بالإضافة إلى الخدمات القنصلية التي تقدمها للطلبة والجالية الفلسطينية في الجمهورية التركية.",
        ambassadorName: "الدكتور فائد مصطفى",
        ambassadorTitleOnly: "السفير",

        // Footer
        "about-title": "حول السفارة",
        "about-text": "وجدت سفارة دولة فلسطين في تركيا من أجل خدمة أبناء الشعب الفلسطيني المتواجدين حالياً في تركيا، بالإضافة إلى نشر الثقافة والتراث الفلسطيني في جميع المدن التركية وتقديم صورة عن المجتمع الفلسطيني وعاداته.",
        "links-title": "مواقع هامة",
        "link-foreign-ministry": "وزارة الخارجية",
        "link-interior-ministry": "وزارة الداخلية",
        "link-consulate-istanbul": "القنصلية العامة في إسطنبول",
        "contact-title": "التواصل",
        "contact-location": "Kılıç Ali Caddesi No:5, Diplomatik Site, 06450 Or-an Ankara",
        "contact-phone": "الهاتف: +90 312 490 35 46",
        "contact-fax": "الفاكس: +90 312 490 40 77",
        "contact-email": "البريد الإلكتروني: tremb@mfae.gov.ps",
        copyright: "2025 © سفارة دولة فلسطين",

        // Homepage specific
        galleryTitle: "معرض الصور",
        galleryDescription: "استعرض جمال وتاريخ مدن فلسطين",
        jerusalemTitle: "القدس",
        jerusalemDescription: "عاصمة فلسطين",
        haifaTitle: "حيفا",
        haifaDescription: "مدينة من أكبر وأهم مدن فِلسطِين التَاريخِية",
        gazaTitle: "غزة",
        gazaDescription: "غَزَّة مدينة ساحلية فلسطينية",
        nazarethTitle: "الناصرة",
        nazarethDescription: "من أهم مدن فلسطين التاريخية",
        hebronTitle: "الخليل",
        hebronDescription: "تُعد الخليل من أقدم مدن العالم، وتاريخها يعود إلى 5500 عام.",

        // Official cards
        presidency_card: "الرئاسة الفلسطينية",
        pm_card: "رئاسة الوزراء",
        mofa_card: "وزارة الخارجية",
        moi_card: "وزارة الداخلية",
        culture_card: "وزارة الثقافة",
        wafa_card: "وكالة وفا الرسمية",

        // Info grid
        "info-palestine": "فلسطين",
        "info-embassy": "السفارة",
        "info-consular": "الشؤون القنصلية",
        "info-turkey": "تركيا",
        "info-education": "الشؤون التعليمية",
        "info-circulars": "التعاميم والإعلانات",
        "info-news": "الأخبار",
        "info-activities": "الأنشطة والفعاليات",
        "info-holidays": "الأعياد الوطنية",

        // News
        newsTitle1: "أحدث الأخبار",
        "news-headline-1": "عنوان الخبر الرئيسي هنا",
        "news-desc-1": "وصف مختصر للخبر يتضمن أهم المعلومات والتفاصيل المتعلقة بالموضوع المطروح.",
        "news-date-1": "25 مايو 2025",
        "news-headline-2": "أخبار محلية مهمة",
        "news-desc-2": "تفاصيل الأحداث المحلية والتطورات الجديدة في المنطقة مع التركيز على الجوانب المهمة.",
        "news-date-2": "24 مايو 2025",
        "news-headline-3": "تطورات جديدة في السياسة",
        "news-desc-3": "آخر المستجدات السياسية والقرارات الحكومية الجديدة التي تؤثر على المواطنين.",
        "news-date-3": "23 مايو 2025"
      },

      en: {
        // Navigation
        home: "Home",
        news: "News",
        embassy: "Embassy",
        "embassy-about": "About the Embassy",
        "embassy-ambassador": "Ambassador",
        "embassy-former": "Former Ambassadors",
        education: "Education Affairs",
        "edu-universities": "Universities in Turkey",
        "edu-study": "Study in Turkey",
        "edu-guide": "New Student Guide",
        consular: "Consular Affairs",
        "cons-passports": "Passports",
        "cons-forms": "Forms",
        "cons-services": "Embassy Services",
        "cons-guide": "Citizen's Consular Guide",
        relations: "Palestinian-Turkish Relations",
        "rel-pal": "Palestine",
        "rel-tur": "Turkey",
        "rel-rel": "Religious Relations",
        "rel-his": "Historical Relations",
        "rel-cul": "Cultural Relations",
        "rel-pol": "Political Relations",
        "rel-eco": "Economic Relations",
        misc: "Miscellaneous",
        "misc-events": "Events & Activities",
        "misc-feedback": "Suggestions & Complaints",
        "misc-links": "Important Links",
        "misc-media": "Media",
        passport: "Passport Inquiry",
        contact: "Contact",

        // Common Elements
        siteTitle: "Embassy of the State of Palestine in Turkey",
        ambassadorTitle: "Ambassador's Message",
        ambassadorMessage: "On behalf of the Embassy of the State of Palestine in the Republic of Turkey and all its staff, I am pleased to extend my greetings and appreciation to you. I welcome all visitors to our newly redesigned website, hoping that it serves as a window for the Palestinian public to access all the required information about the embassy, its roles, activities in all fields, in addition to the consular services it provides to students and the Palestinian community in the Republic of Turkey.",
        ambassadorName: "Dr. Faed Mustafa",
        ambassadorTitleOnly: "Ambassador",

        // Footer
        "about-title": "About the Embassy",
        "about-text": "The Embassy of the State of Palestine in Turkey was established to serve the Palestinian people currently residing in Turkey, as well as to promote Palestinian culture and heritage across Turkish cities and to present an image of Palestinian society and its traditions.",
        "links-title": "Important Links",
        "link-foreign-ministry": "Ministry of Foreign Affairs",
        "link-interior-ministry": "Ministry of Interior",
        "link-consulate-istanbul": "Consulate General in Istanbul",
        "contact-title": "Contact",
        "contact-location": "Kılıç Ali Caddesi No:5, Diplomatik Site, 06450 Or-an Ankara",
        "contact-phone": "Phone: +90 312 490 35 46",
        "contact-fax": "Fax: +90 312 490 40 77",
        "contact-email": "Email: tremb@mfae.gov.ps",
        copyright: "2025 © Embassy of the State of Palestine",

        // Homepage specific
        galleryTitle: "Photo Gallery",
        galleryDescription: "Explore the beauty and history of Palestinian cities",
        jerusalemTitle: "Jerusalem",
        jerusalemDescription: "Capital of Palestine",
        haifaTitle: "Haifa",
        haifaDescription: "One of the largest and most important historical Palestinian cities",
        gazaTitle: "Gaza",
        gazaDescription: "Gaza is a coastal Palestinian city",
        nazarethTitle: "Nazareth",
        nazarethDescription: "One of the most important historical cities in Palestine",
        hebronTitle: "Hebron",
        hebronDescription: "Hebron is one of the oldest cities in the world, dating back 5500 years.",

        // Official cards
        presidency_card: "Palestinian Presidency",
        pm_card: "Prime Minister's Office",
        mofa_card: "Ministry of Foreign Affairs",
        moi_card: "Ministry of Interior",
        culture_card: "Ministry of Culture",
        wafa_card: "WAFA Official Agency",

        // Info grid
        "info-palestine": "Palestine",
        "info-embassy": "Embassy",
        "info-consular": "Consular Affairs",
        "info-turkey": "Turkey",
        "info-education": "Educational Affairs",
        "info-circulars": "Circulars & Announcements",
        "info-news": "News",
        "info-activities": "Activities & Events",
        "info-holidays": "National Holidays",

        // News
        newsTitle1: "Latest News",
        "news-headline-1": "Main News Headline Here",
        "news-desc-1": "A brief summary of the news including the most important information and relevant details.",
        "news-date-1": "May 25, 2025",
        "news-headline-2": "Important Local News",
        "news-desc-2": "Details of local events and new developments in the region with a focus on key aspects.",
        "news-date-2": "May 24, 2025",
        "news-headline-3": "New Political Developments",
        "news-desc-3": "The latest political updates and new government decisions affecting citizens.",
        "news-date-3": "May 23, 2025"
      },

      tr: {
        // Navigation
        home: "Ana Sayfa",
        news: "Haberler",
        embassy: "Büyükelçilik",
        "embassy-about": "Büyükelçilik Hakkında",
        "embassy-ambassador": "Büyükelçi",
        "embassy-former": "Önceki Büyükelçiler",
        education: "Eğitim İşleri",
        "edu-universities": "Türkiye'deki Üniversiteler",
        "edu-study": "Türkiye'de Eğitim",
        "edu-guide": "Yeni Öğrenci Rehberi",
        consular: "Konsolosluk İşleri",
        "cons-passports": "Pasaportlar",
        "cons-forms": "Formlar",
        "cons-services": "Büyükelçilik Hizmetleri",
        "cons-guide": "Vatandaş Konsolosluk Rehberi",
        relations: "Filistin-Türkiye İlişkileri",
        "rel-pal": "Filistin",
        "rel-tur": "Türkiye",
        "rel-rel": "Dini İlişkiler",
        "rel-his": "Tarihi İlişkiler",
        "rel-cul": "Kültürel İlişkiler",
        "rel-pol": "Siyasi İlişkiler",
        "rel-eco": "Ekonomik İlişkiler",
        misc: "Diğer",
        "misc-events": "Etkinlikler",
        "misc-feedback": "Öneri ve Şikayetler",
        "misc-links": "Önemli Bağlantılar",
        "misc-media": "Medya",
        passport: "Pasaport Sorgulama",
        contact: "İletişim",

        // Common Elements
        siteTitle: "Filistin Devleti'nin Türkiye Büyükelçiliği",
        ambassadorTitle: "Elçinin Mesajı",
        ambassadorMessage: "Filistin Devleti'nin Türkiye Cumhuriyeti Büyükelçiliği ve tüm personeli adına, sizlere selam ve takdirlerimi sunmaktan memnuniyet duyuyorum. Yenilenen web sitemize tüm ziyaretçileri hoş geldiniz diyor, bu sitenin Filistin halkının elçilik hakkında ihtiyaç duyduğu tüm bilgileri, faaliyetleri ve öğrencilere ile Filistin topluluğuna sunduğu konsolosluk hizmetlerini öğrenmesi için bir pencere olmasını umuyorum.",
        ambassadorName: "Dr. Faed Mustafa",
        ambassadorTitleOnly: "Elçi",

        // Footer
        "about-title": "Büyükelçilik Hakkında",
        "about-text": "Türkiye'de bulunan Filistin Devleti Büyükelçiliği, şu anda Türkiye'de yaşayan Filistin halkına hizmet etmek, Filistin kültürünü ve mirasını Türkiye'nin tüm şehirlerinde tanıtmak ve Filistin toplumunu ve geleneklerini yansıtmak amacıyla kurulmuştur.",
        "links-title": "Önemli Bağlantılar",
        "link-foreign-ministry": "Dışişleri Bakanlığı",
        "link-interior-ministry": "İçişleri Bakanlığı",
        "link-consulate-istanbul": "İstanbul Başkonsolosluğu",
        "contact-title": "İletişim",
        "contact-location": "Kılıç Ali Caddesi No:5, Diplomatik Site, 06450 Or-an Ankara",
        "contact-phone": "Telefon: +90 312 490 35 46",
        "contact-fax": "Faks: +90 312 490 40 77",
        "contact-email": "E-posta: tremb@mfae.gov.ps",
        copyright: "2025 © Filistin Devleti Büyükelçiliği",

        // Homepage specific
        galleryTitle: "Fotoğraf Galerisi",
        galleryDescription: "Filistin şehirlerinin güzelliğini ve tarihini keşfedin",
        jerusalemTitle: "Kudüs",
        jerusalemDescription: "Filistin'in başkenti",
        haifaTitle: "Hayfa",
        haifaDescription: "Filistin'in en büyük ve en önemli tarihi şehirlerinden biri",
        gazaTitle: "Gaza",
        gazaDescription: "Gaza, sahil kenarında bir Filistin şehridir",
        nazarethTitle: "Nasıra",
        nazarethDescription: "Filistin'in en önemli tarihi şehirlerinden biri",
        hebronTitle: "El Halil",
        hebronDescription: "El Halil, dünyanın en eski şehirlerinden biridir ve tarihi 5500 yıl öncesine dayanır.",

        // Official cards
        presidency_card: "Filistin Başkanlığı",
        pm_card: "Başbakanlık",
        mofa_card: "Dışişleri Bakanlığı",
        moi_card: "İçişleri Bakanlığı",
        culture_card: "Kültür Bakanlığı",
        wafa_card: "WAFA Resmi Ajansı",

        // Info grid
        "info-palestine": "Filistin",
        "info-embassy": "Büyükelçilik",
        "info-consular": "Konsolosluk İşleri",
        "info-turkey": "Türkiye",
        "info-education": "Eğitim İşleri",
        "info-circulars": "Genelgeler ve Duyurular",
        "info-news": "Haberler",
        "info-activities": "Etkinlikler ve Faaliyetler",
        "info-holidays": "Milli Bayramlar",

        // News
        newsTitle1: "Son Haberler",
        "news-headline-1": "Ana Haber Başlığı Burada",
        "news-desc-1": "Habere dair en önemli bilgi ve detayları içeren kısa bir özet.",
        "news-date-1": "25 Mayıs 2025",
        "news-headline-2": "Önemli Yerel Haberler",
        "news-desc-2": "Bölgedeki yerel olayların ve gelişmelerin önemli yönlerine odaklanılarak anlatılması.",
        "news-date-2": "24 Mayıs 2025",
        "news-headline-3": "Yeni Siyasi Gelişmeler",
        "news-desc-3": "Vatandaşları etkileyen son siyasi gelişmeler ve yeni hükümet kararları.",
        "news-date-3": "23 Mayıs 2025"
      }
    };

    this.init();
  }

  init() {
    if (!this.langButton || !this.langMenu) {
      console.warn('Language switcher elements not found');
      return;
    }

    this.setupEventListeners();
    this.switchLanguage(this.currentLang);
    this.isInitialized = true;
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
        if (selectedLang && this.translations[selectedLang]) {
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
  }

  toggleMenu() {
    this.langMenu.classList.toggle("hidden");
    this.langMenu.classList.toggle("show");
  }

  closeMenu() {
    this.langMenu.classList.add("hidden");
    this.langMenu.classList.remove("show");
  }

  switchLanguage(lang) {
    if (!this.translations[lang]) {
      console.warn(`Language "${lang}" not supported`);
      return;
    }

    this.currentLang = lang;
    localStorage.setItem("preferredLanguage", lang);

    // Set document direction and language
    const isRTL = lang === "ar";
    this.setDocumentDirection(isRTL, lang);

    // Update all translatable elements
    this.updateElements(lang);

    // Update language button
    this.updateLanguageButton(lang);

    // Dispatch custom event for other components
    document.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { 
        language: lang, 
        isRTL: isRTL,
        translations: this.translations[lang] 
      }
    }));
  }

  setDocumentDirection(isRTL, lang) {
    // Set document attributes ONLY - no CSS manipulation
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    
    // Set body data attributes for CSS hooks (don't add classes that conflict)
    document.body.setAttribute('data-lang', lang);
    document.body.setAttribute('data-dir', isRTL ? "rtl" : "ltr");
  }

  updateElements(lang) {
    const translations = this.translations[lang];
    
    Object.entries(translations).forEach(([key, text]) => {
      const element = document.getElementById(key);
      if (element) {
        this.updateElement(element, text);
      }
    });
  }

  updateElement(element, text) {
    // Handle different element types appropriately
    if (element.tagName === 'INPUT') {
      if (element.type === 'submit' || element.type === 'button') {
        element.value = text;
      } else {
        element.placeholder = text;
      }
    } else if (element.tagName === 'IMG') {
      element.alt = text;
    } else if (element.tagName === 'BUTTON') {
      element.textContent = text;
    } else {
      // For regular elements, update text content
      element.textContent = text;
    }
  }

  updateLanguageButton(lang) {
    const langNames = {
      ar: "🌐 العربية",
      en: "🌐 English", 
      tr: "🌐 Türkçe"
    };
    
    this.langButton.textContent = langNames[lang] || `🌐 ${lang.toUpperCase()}`;
  }

  // Public API methods
  getCurrentLanguage() {
    return this.currentLang;
  }

  getSupportedLanguages() {
    return Object.keys(this.translations);
  }

  isReady() {
    return this.isInitialized;
  }

  // Add translation for dynamic content
  addTranslations(newTranslations) {
    Object.keys(newTranslations).forEach(lang => {
      if (this.translations[lang]) {
        Object.assign(this.translations[lang], newTranslations[lang]);
      }
    });
  }
}

/*====================================================
  CLEAN CAROUSEL CLASS - Removed redundant code
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
  CLEAN PAGE INITIALIZER - Removed redundancy
====================================================*/

function globalPageInitializer() {
  console.log("Initializing page components...");

  // Initialize Language Switcher
  if (document.getElementById("langButton") && !window.languageSwitcherInstance) {
    window.languageSwitcherInstance = new LanguageSwitcher();
  }

  // Initialize Carousel if present
  const carouselContainer = document.querySelector('.visual-carousel-container');
  if (carouselContainer && !carouselContainer.carouselInstance) {
    carouselContainer.carouselInstance = new CleanCarousel(carouselContainer);
  }

  // Initialize animations
  initializeAnimations();
}

/*====================================================
  SIMPLIFIED ANIMATION UTILITIES
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

// Export for global use
window.globalPageInitializer = globalPageInitializer;
window.LanguageSwitcher = LanguageSwitcher;
window.CleanCarousel = CleanCarousel;