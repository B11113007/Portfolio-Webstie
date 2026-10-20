/* ==========================================================================
   script.js — Portfolio site logic
   All content is loaded from:
     data/projects.json  → project cards, carousel, modal
     data/about.json     → biography, education, experience (about.html)
     data/news.json      → news items (both pages)

   To update content: edit the JSON files only. No HTML or JS changes needed.
   ========================================================================== */

/* ==========================================
   01. SVG GENERATIVE ARTWORK (fallback when no image is set)
   ========================================== */
function generateArchitecturalSvg(type, color, label) {
  color = color || '#0a7e8c';
  label = label || '';
  const uid = Math.random().toString(36).slice(2, 7);
  let innerGraphics = '';

  if (type === 'structure') {
    innerGraphics = `
      <line x1="50" y1="350" x2="350" y2="50" stroke="${color}" stroke-width="1.5"/>
      <line x1="50" y1="50" x2="350" y2="350" stroke="${color}" stroke-width="0.5" stroke-dasharray="4,4"/>
      <rect x="100" y="100" width="200" height="200" fill="none" stroke="#141414" stroke-width="2"/>
      <circle cx="200" cy="200" r="70" fill="none" stroke="${color}" stroke-width="1.5"/>
      <path d="M 120 280 Q 200 150 280 280" fill="none" stroke="#141414" stroke-width="1"/>`;
  } else if (type === 'monolith') {
    innerGraphics = `
      <rect x="80" y="60" width="100" height="280" fill="#141414" opacity="0.85"/>
      <rect x="210" y="120" width="120" height="220" fill="none" stroke="${color}" stroke-width="2"/>
      <line x1="20" y1="340" x2="380" y2="340" stroke="#141414" stroke-width="2"/>
      <line x1="130" y1="20" x2="130" y2="380" stroke="${color}" stroke-width="0.8" stroke-dasharray="2,2"/>`;
  } else if (type === 'timber') {
    innerGraphics = `
      <g stroke="${color}" stroke-width="1">
        <line x1="60" y1="80" x2="340" y2="80"/>
        <line x1="60" y1="120" x2="340" y2="120"/>
        <line x1="60" y1="160" x2="340" y2="160"/>
        <line x1="60" y1="200" x2="340" y2="200"/>
        <line x1="60" y1="240" x2="340" y2="240"/>
        <line x1="60" y1="280" x2="340" y2="280"/>
        <line x1="60" y1="320" x2="340" y2="320"/>
      </g>
      <rect x="120" y="50" width="160" height="300" fill="none" stroke="#141414" stroke-width="2"/>`;
  } else if (type === 'silo') {
    innerGraphics = `
      <circle cx="140" cy="200" r="80" fill="none" stroke="#141414" stroke-width="2"/>
      <circle cx="260" cy="200" r="80" fill="none" stroke="${color}" stroke-width="2"/>
      <line x1="60" y1="200" x2="340" y2="200" stroke="#141414" stroke-width="1"/>
      <rect x="180" y="140" width="40" height="120" fill="none" stroke="${color}" stroke-dasharray="3,3"/>`;
  } else if (type === 'diagram' || type === 'elevation') {
    innerGraphics = `
      <rect x="40" y="100" width="320" height="200" fill="none" stroke="#141414" stroke-width="1.5"/>
      <line x1="40" y1="200" x2="360" y2="200" stroke="${color}" stroke-width="1" stroke-dasharray="5,3"/>
      <rect x="80" y="130" width="60" height="170" fill="none" stroke="${color}" stroke-width="1"/>
      <rect x="180" y="150" width="80" height="150" fill="none" stroke="#141414" stroke-width="1"/>
      <rect x="290" y="120" width="50" height="180" fill="none" stroke="${color}" stroke-width="1"/>`;
  } else if (type === 'section') {
    innerGraphics = `
      <path d="M 40 300 L 40 160 Q 200 60 360 160 L 360 300 Z" fill="none" stroke="#141414" stroke-width="1.5"/>
      <line x1="40" y1="300" x2="360" y2="300" stroke="#141414" stroke-width="2"/>
      <line x1="200" y1="60" x2="200" y2="300" stroke="${color}" stroke-width="0.8" stroke-dasharray="4,3"/>`;
  } else {
    /* membrane */
    innerGraphics = `
      <path d="M 50 200 C 120 80, 280 80, 350 200 C 280 320, 120 320, 50 200 Z" fill="none" stroke="${color}" stroke-width="2"/>
      <path d="M 80 200 C 140 120, 260 120, 320 200" fill="none" stroke="#141414" stroke-width="1" stroke-dasharray="4,2"/>`;
  }

  return `<svg viewBox="0 0 400 400" width="100%" height="100%"
       xmlns="http://www.w3.org/2000/svg" style="background:#efeeea;"
       role="img" aria-label="${label}">
    <defs>
      <pattern id="g${uid}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(20,20,20,0.05)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#g${uid})"/>
    ${innerGraphics}
    <text x="20" y="385" font-family="JetBrains Mono,monospace"
          font-size="10" fill="#737373" letter-spacing="1">${label.toUpperCase()}</text>
  </svg>`;
}

/* Helper: returns <img> if path is set, otherwise SVG fallback */
function projectVisual(imagePath, svgType, label, fullSize) {
  if (imagePath) {
    return `<img src="${imagePath}" alt="${label}"
                 style="width:100%;height:100%;object-fit:cover;display:block;">`;
  }
  return generateArchitecturalSvg(svgType, '#0a7e8c', label);
}

/* ==========================================
   02. STATE
   ========================================== */
let projectsData = [];
let newsData     = [];
let aboutData    = {};
let currentLang  = 'en';
let activeCarouselIndex = 0;

/* ==========================================
   03. UI LABELS (bilingual — nav & section headings only;
       all body content now lives in JSON files)
   ========================================== */
const uiText = {
  en: {
    logoSub:    'ARCHITECTURE',
    navWork:    'WORK',
    navAbout:   'ABOUT',
    navNews:    'NEWS',
    heroLabel:  '01 / FEATURED PORTFOLIO',
    heroText:   'Graduate portfolio exploring tectonic clarity, spatial thresholds, and environmental adaptability through architectural synthesis.',
    prev:       'PREV',
    next:       'NEXT',
    viewAll:    'VIEW ALL PROJECTS',
    workLabel:  'INDEX / ALL PROJECTS',
    workTitle:  'Selected Works',
    newsLabel:  'UPDATES & PRESS',
    newsTitle:  'News',
    profileLabel: 'BIOGRAPHY & CREDENTIALS',
    profileTitle: 'Profile',
    headEdu:    'EDUCATION',
    headExp:    'SELECTED EXPERIENCE',
    cvBtn:      'DOWNLOAD FULL CV (PDF) ↓',
    modalYear:  'YEAR',
    modalLoc:   'LOCATION',
    modalCollab:'COLLABORATORS',
    modalOverview: 'PROJECT OVERVIEW',
    modalDrawings: 'ARCHITECTURAL DRAWINGS & PLANS'
  },
  zh: {
    logoSub:    '建築作品集',
    navWork:    '作品集',
    navAbout:   '關於',
    navNews:    '最新動態',
    heroLabel:  '01 / 特選作品展示',
    heroText:   '探索構造清晰度、空間邊界與環境適應力的建築設計碩士作品集。',
    prev:       '上一案',
    next:       '下一案',
    viewAll:    '檢視全部作品',
    workLabel:  '索引 / 所有項目',
    workTitle:  '設計作品',
    newsLabel:  '新聞與展覽',
    newsTitle:  '最新動態',
    profileLabel: '個人簡歷與學歷',
    profileTitle: '個人簡介',
    headEdu:    '教育背景',
    headExp:    '經歷選列',
    cvBtn:      '下載完整簡歷 (PDF) ↓',
    modalYear:  '年份',
    modalLoc:   '地點',
    modalCollab:'合作對象',
    modalOverview: '設計概念說明',
    modalDrawings: '建築圖面與模型圖'
  }
};

/* ==========================================
   04. PAGE DETECTION
   ========================================== */
const PAGE = document.body.dataset.page; // 'home' | 'about'

/* ==========================================
   05. CAROUSEL  (index.html)
   ========================================== */
function renderCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  track.innerHTML = '';

  projectsData.forEach((proj, idx) => {
    const card = document.createElement('div');
    card.className = 'carousel-card' + (idx === activeCarouselIndex ? ' active' : '');
    card.setAttribute('data-index', idx);
    card.setAttribute('role', 'listitem');
    card.innerHTML = projectVisual(proj.image, proj.primarySvgType, proj.title['en']);
    card.addEventListener('click', () => {
      if (idx === activeCarouselIndex) {
        openProjectModal(proj.id);
      } else {
        activeCarouselIndex = idx;
        updateCarouselPosition();
      }
    });
    track.appendChild(card);
  });

  updateCarouselPosition();
}

function updateCarouselPosition() {
  const track    = document.getElementById('carousel-track');
  const viewport = document.getElementById('carousel-viewport');
  if (!track || !viewport) return;

  const cards = track.querySelectorAll('.carousel-card');
  if (!cards.length) return;

  cards.forEach((c, idx) => c.classList.toggle('active', idx === activeCarouselIndex));

  const cardWidth    = cards[0].offsetWidth;
  const gapVal       = parseFloat(getComputedStyle(document.documentElement)
                         .getPropertyValue('--carousel-gap')) || 24;
  const viewportWidth = viewport.offsetWidth;
  const offset = activeCarouselIndex * (cardWidth + gapVal) - viewportWidth / 2 + cardWidth / 2;
  track.style.transform = `translateX(${-offset}px)`;

  const counter = document.getElementById('carousel-counter');
  if (counter) counter.textContent = `0${activeCarouselIndex + 1} / 0${projectsData.length}`;
}

/* ==========================================
   06. WORK GALLERY  (index.html)
   ========================================== */
function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  grid.innerHTML = '';

  projectsData.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Open: ' + proj.title[currentLang]);
    card.innerHTML = `
      <div class="gallery-thumb">
        ${projectVisual(proj.image, proj.primarySvgType, proj.title[currentLang])}
      </div>
      <div class="gallery-meta">
        <span class="tag">${proj.category[currentLang]}</span>
        <h3>${proj.title[currentLang]}</h3>
        <div class="info">
          <span>${proj.location[currentLang]}</span>
          <span>${proj.year}</span>
        </div>
      </div>`;
    const open = () => openProjectModal(proj.id);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
    grid.appendChild(card);
  });
}

/* ==========================================
   07. NEWS SECTION  (both pages)
   ========================================== */
function renderNews() {
  const container = document.getElementById('news-timeline');
  if (!container) return;
  container.innerHTML = '';

  newsData.forEach(item => {
    const el = document.createElement('div');
    el.className = 'news-item';
    el.innerHTML = `
      <div class="news-date">${item.date}</div>
      <div class="news-content">
        <h3>${item.title[currentLang]}</h3>
        <p>${item.desc[currentLang]}</p>
      </div>`;
    container.appendChild(el);
  });
}

/* ==========================================
   08. ABOUT / PROFILE  (about.html)
   ========================================== */
function renderAbout() {
  const t = uiText[currentLang];

  // Bio paragraphs
  const bioMain = document.getElementById('profile-bio-main');
  const bioSub  = document.getElementById('profile-bio-sub');
  if (bioMain) bioMain.textContent = aboutData.bio    ? aboutData.bio[currentLang]    : '';
  if (bioSub)  bioSub.textContent  = aboutData.bioSub ? aboutData.bioSub[currentLang] : '';

  // CV button
  const cvBtn = document.getElementById('cv-btn');
  if (cvBtn) {
    cvBtn.textContent = t.cvBtn;
    if (aboutData.cvFile) {
      cvBtn.href = aboutData.cvFile;
      cvBtn.removeAttribute('onclick');
    } else {
      cvBtn.href = '#';
      cvBtn.onclick = () => { alert('CV coming soon.'); return false; };
    }
  }

  // Education list
  const eduList = document.getElementById('edu-list');
  if (eduList && aboutData.education) {
    eduList.innerHTML = aboutData.education.map(entry => `
      <li class="cred-item">
        <span class="year">${entry.years}</span>
        <span class="title">${entry.title[currentLang]}</span>
        <span class="institution">${entry.institution[currentLang]}</span>
      </li>`).join('');
  }

  // Experience list
  const expList = document.getElementById('exp-list');
  if (expList && aboutData.experience) {
    expList.innerHTML = aboutData.experience.map(entry => `
      <li class="cred-item">
        <span class="year">${entry.years}</span>
        <span class="title">${entry.title[currentLang]}</span>
        <span class="institution">${entry.institution[currentLang]}</span>
      </li>`).join('');
  }

  // Section headings from uiText
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('profile-label', t.profileLabel);
  setText('profile-title', t.profileTitle);
  setText('head-edu', t.headEdu);
  setText('head-exp', t.headExp);
}

/* ==========================================
   09. PROJECT MODAL  (index.html)
   ========================================== */
function openProjectModal(id) {
  const proj   = projectsData.find(p => p.id === id);
  const target = document.getElementById('modal-content-target');
  const dialog = document.getElementById('project-modal');
  if (!proj || !target || !dialog) return;

  const t = uiText[currentLang];

  // Resolve gallery visuals dynamically (supports arbitrary number of images)
  const imgs = (proj.galleryImages || []).filter(Boolean);
  let galleryHtml = '';

  if (imgs.length > 0) {
    galleryHtml = imgs.map((imgSrc, idx) => `
      <div class="modal-img-wrapper">
        <img src="${imgSrc}" alt="${proj.title[currentLang]} - FIG 1.${idx + 1}" loading="lazy" style="width:100%;height:auto;display:block;">
        <div class="modal-img-caption">FIG 1.${idx + 1} — Architectural Drawing / Rendering</div>
      </div>`).join('');
  } else {
    // Fallback: 2 architectural SVGs
    galleryHtml = `
      <div class="modal-img-wrapper">
        ${generateArchitecturalSvg(proj.primarySvgType, '#0a7e8c', 'PRIMARY TECTONIC RENDERING')}
        <div class="modal-img-caption">FIG 1.1 — Isometric Structural Rendering</div>
      </div>
      <div class="modal-img-wrapper">
        ${generateArchitecturalSvg(proj.plansSvgType, '#141414', 'ARCHITECTURAL PLAN / SECTION')}
        <div class="modal-img-caption">FIG 1.2 — Transverse Section &amp; Detailed Threshold</div>
      </div>`;
  }

  target.innerHTML = `
    <div class="modal-header-meta">
      <span class="tag">${proj.category[currentLang]}</span>
      <h2>${proj.title[currentLang]}</h2>
      <div class="modal-specs-grid">
        <div class="spec-item"><label>${t.modalYear}</label><div>${proj.year}</div></div>
        <div class="spec-item"><label>${t.modalLoc}</label><div>${proj.location[currentLang]}</div></div>
        <div class="spec-item"><label>${t.modalCollab}</label><div>${proj.collaborators[currentLang]}</div></div>
      </div>
    </div>
    <div class="modal-body">
      <div>
        <h4 class="modal-overview-heading">${t.modalOverview}</h4>
        <p class="modal-description">${proj.desc[currentLang]}</p>
      </div>
      <div class="modal-gallery-stack">
        <h4 class="modal-drawings-heading">${t.modalDrawings}</h4>
        ${galleryHtml}
      </div>
    </div>`;

  dialog.showModal();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const dialog = document.getElementById('project-modal');
  if (dialog && dialog.open) {
    dialog.close();
    document.body.style.overflow = '';
  }
}

/* ==========================================
   10. LANGUAGE TOGGLE
   ========================================== */
function applyLanguage(lang) {
  currentLang = lang;
  const t = uiText[lang];

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('logo-sub',  t.logoSub);
  setText('nav-work',  t.navWork);
  setText('nav-about', t.navAbout);
  setText('nav-news',  t.navNews);

  if (PAGE === 'home') {
    setText('hero-label',     t.heroLabel);
    setText('hero-text',      t.heroText);
    setText('label-prev',     t.prev);
    setText('label-next',     t.next);
    setText('label-view-all', t.viewAll);
    setText('work-label',     t.workLabel);
    setText('work-title',     t.workTitle);
    setText('news-label',     t.newsLabel);
    setText('news-title',     t.newsTitle);
    renderGallery();
    renderNews();
  }

  if (PAGE === 'about') {
    setText('news-label', t.newsLabel);
    setText('news-title', t.newsTitle);
    renderAbout();
    renderNews();
  }
}

/* ==========================================
   11. INIT — fetch all data then render
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {

  // Language toggle wired up immediately (both pages)
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) langBtn.addEventListener('click', () =>
    applyLanguage(currentLang === 'en' ? 'zh' : 'en'));

  // Fetch all three JSON files in parallel
  Promise.all([
    fetch('data/projects.json').then(r => r.json()),
    fetch('data/news.json').then(r => r.json()),
    fetch('data/about.json').then(r => r.json())
  ])
  .then(([projects, news, about]) => {
    projectsData = projects;
    newsData     = news;
    aboutData    = about;

    /* ---- HOME PAGE ---- */
    if (PAGE === 'home') {
      renderCarousel();
      renderGallery();
      renderNews();

      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      if (prevBtn) prevBtn.addEventListener('click', () => {
        activeCarouselIndex = (activeCarouselIndex - 1 + projectsData.length) % projectsData.length;
        updateCarouselPosition();
      });
      if (nextBtn) nextBtn.addEventListener('click', () => {
        activeCarouselIndex = (activeCarouselIndex + 1) % projectsData.length;
        updateCarouselPosition();
      });

      const viewAllBtn = document.getElementById('btn-view-all');
      if (viewAllBtn) viewAllBtn.addEventListener('click', () =>
        document.getElementById('work').scrollIntoView({ behavior: 'smooth' }));

      const closeBtn = document.getElementById('modal-close-btn');
      const dialog   = document.getElementById('project-modal');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (dialog)   dialog.addEventListener('click', e => { if (e.target === dialog) closeModal(); });

      window.addEventListener('resize', updateCarouselPosition);
    }

    /* ---- ABOUT PAGE ---- */
    if (PAGE === 'about') {
      renderAbout();
      renderNews();
    }
  })
  .catch(err => console.error('Failed to load data files:', err));
});
