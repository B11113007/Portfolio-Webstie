/* ==========================================================================
   script.js — Portfolio site logic (no framework)

   All content is loaded from JSON files:
     data/projects.json → carousel, work grid, project pages
     data/about.json    → optional photo, biography, education, experience, awards
     data/site.json     → how many items appear on the home page

   To update content: edit the JSON files only. No HTML or JS changes needed.

   Pages (decided by <body data-page="...">):
     home    → index.html    carousel + work preview + profile preview
     work    → work.html     all projects
     about   → about.html    photo + biography + credentials + awards
     project → project.html?id=project-01   one shared template for every project
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
       xmlns="http://www.w3.org/2000/svg" style="background:#ECEAE2;"
       role="img" aria-label="${label}">
    <defs>
      <pattern id="g${uid}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(20,20,20,0.05)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#g${uid})"/>
    ${innerGraphics}
    <text x="20" y="385" font-family="JetBrains Mono,monospace"
          font-size="10" fill="#666660" letter-spacing="1">${label.toUpperCase()}</text>
  </svg>`;
}

/* Helper: returns <img> if a path is set, otherwise the SVG fallback */
function projectVisual(imagePath, svgType, label) {
  if (imagePath) {
    return `<img src="${imagePath}" alt="${label}" loading="lazy" draggable="false">`;
  }
  return generateArchitecturalSvg(svgType, '#0a7e8c', label);
}

/* Helper: link to a project's own page (same window) */
function projectUrl(id) {
  return 'project.html?id=' + encodeURIComponent(id);
}

/* ==========================================
   02. STATE
   ========================================== */
const PAGE = document.body.dataset.page; // home | work | about | project

let projectsData = [];
let aboutData    = {};
let siteConfig   = { homeCarouselCount: 5, homeWorkCount: 4 };
let currentLang  = localStorage.getItem('lang') === 'zh' ? 'zh' : 'en';
let activeCarouselIndex = 0;
let carouselDragged = false;

/* ==========================================
   03. UI LABELS (bilingual — navigation & headings only;
       all body content lives in the JSON files)
   ========================================== */
const uiText = {
  en: {
    navWork:       'WORK',
    navAbout:      'ABOUT',
    prev:          'PREV',
    next:          'NEXT',
    viewAll:       'VIEW ALL',
    viewProfile:   'VIEW PROFILE',
    workLabelHome: 'INDEX / SELECTED PROJECTS',
    workLabelAll:  'INDEX / ALL PROJECTS',
    workTitleHome: 'Selected Works',
    workTitleAll:  'Works',
    profileLabel:  'BIOGRAPHY & CREDENTIALS',
    profileTitle:  'Profile',
    headEdu:       'Education',
    headExp:       'Selected Experience',
    headAwards:    'Awards and Accomplishments',
    cvBtn:         'DOWNLOAD FULL CV (PDF) ↓',
    cvSoon:        'CV coming soon.',
    specYear:      'YEAR',
    specLoc:       'LOCATION',
    specCollab:    'COLLABORATORS',
    backToWork:    '← ALL WORKS',
    prevProject:   '← PREVIOUS PROJECT',
    nextProject:   'NEXT PROJECT →',
    notFound:      'Project not found.',
    figure:        'FIG'
  },
  zh: {
    navWork:       '作品集',
    navAbout:      '關於',
    prev:          'PREV',
    next:          'NEXT',
    viewAll:       '檢視全部',
    viewProfile:   '查看個人簡介',
    workLabelHome: '索引 / 精選項目',
    workLabelAll:  '索引 / 所有項目',
    workTitleHome: '設計作品',
    workTitleAll:  '全部作品',
    profileLabel:  '個人簡歷與學歷',
    profileTitle:  '個人簡介',
    headEdu:       '教育背景',
    headExp:       '經歷選列',
    headAwards:    '獲獎與展覽紀錄',
    cvBtn:         '下載完整簡歷 (PDF) ↓',
    cvSoon:        '簡歷即將提供。',
    specYear:      '年份',
    specLoc:       '地點',
    specCollab:    '合作對象',
    backToWork:    '← 全部作品',
    prevProject:   '← 上一個作品',
    nextProject:   '下一個作品 →',
    notFound:      '找不到此作品。',
    figure:        '圖'
  }
};

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ==========================================
   04. CAROUSEL (home)
   - 3 visible: centre card full size, side cards half hidden by the edges
   - infinite loop, no autoplay
   - hover overlay on the centre card only
   - click side card → move it to the centre; click centre card → project page
   ========================================== */
function carouselItems() {
  return projectsData.slice(0, siteConfig.homeCarouselCount);
}

function renderCarousel() {
  const viewport = document.getElementById('carousel-viewport');
  if (!viewport) return;
  const items = carouselItems();
  if (activeCarouselIndex >= items.length) activeCarouselIndex = 0;

  viewport.innerHTML = '';
  items.forEach((proj, idx) => {
    const card = document.createElement('a');
    card.className = 'carousel-card';
    card.href = projectUrl(proj.id);
    card.draggable = false;
    card.setAttribute('aria-label', proj.title[currentLang]);
    card.innerHTML = `
      ${projectVisual(proj.image, proj.primarySvgType, proj.title[currentLang])}
      <div class="card-overlay" aria-hidden="true">
        <span class="overlay-meta">${proj.year} — ${proj.category[currentLang]}</span>
        <h3 class="overlay-title">${proj.title[currentLang]}</h3>
        <p class="overlay-summary">${proj.summary ? proj.summary[currentLang] : ''}</p>
      </div>`;
    card.addEventListener('click', e => {
      if (carouselDragged) {
        e.preventDefault();             // ignore click right after a drag/swipe
        return;
      }
      if (idx !== activeCarouselIndex) {
        e.preventDefault();             // side card: bring to centre instead of opening
        activeCarouselIndex = idx;
        layoutCarousel();
      }
      // centre card: normal link → opens project page in the same window
    });
    viewport.appendChild(card);
  });

  layoutCarousel();
}

function layoutCarousel() {
  const viewport = document.getElementById('carousel-viewport');
  if (!viewport) return;
  const cards = viewport.querySelectorAll('.carousel-card');
  const n = cards.length;
  if (!n) return;

  const vw    = viewport.offsetWidth;
  const cardW = cards[0].offsetWidth;
  const scale = parseFloat(getComputedStyle(document.documentElement)
                  .getPropertyValue('--carousel-side-scale')) || 0.80;
  const gap   = Math.max(32, vw * 0.115);

  // Place side cards closer to the centre card (smaller horizontal blank gap)
  const sideX = cardW * (1 + scale) / 2 + gap;

  cards.forEach((card, idx) => {
    let off = ((idx - activeCarouselIndex) % n + n) % n;
    if (off > n / 2) off -= n;
    const abs = Math.abs(off);

    let x = 0;
    if (abs === 1) x = Math.sign(off) * sideX;
    if (abs >= 2)  x = Math.sign(off) * (sideX + cardW);

    card.style.transform = `translateX(calc(-50% + ${x}px)) scale(${off === 0 ? 1 : scale})`;
    card.style.zIndex = off === 0 ? 3 : (abs === 1 ? 2 : 1);
    card.classList.toggle('active', off === 0);
    card.classList.toggle('is-hidden', abs >= 2);
    card.tabIndex = abs >= 2 ? -1 : 0;
    card.setAttribute('aria-hidden', abs >= 2 ? 'true' : 'false');
    card.setAttribute('aria-current', off === 0 ? 'true' : 'false');
  });

  updateCarouselCaption();
}

/* Caption below the carousel (shown on touch devices only, via CSS) */
function updateCarouselCaption() {
  const caption = document.getElementById('carousel-caption');
  const proj = carouselItems()[activeCarouselIndex];
  if (!caption || !proj) return;
  caption.innerHTML = `
    <div class="overlay-meta">${proj.year} — ${proj.category[currentLang]}</div>
    <div class="overlay-title">${proj.title[currentLang]}</div>`;
}

function moveCarousel(step) {
  const n = carouselItems().length;
  if (!n) return;
  activeCarouselIndex = (activeCarouselIndex + step + n) % n;
  layoutCarousel();
}

function initCarouselControls() {
  const prevBtn  = document.getElementById('prev-btn');
  const nextBtn  = document.getElementById('next-btn');
  const viewport = document.getElementById('carousel-viewport');

  if (prevBtn) prevBtn.addEventListener('click', () => moveCarousel(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => moveCarousel(1));

  if (viewport) {
    viewport.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { moveCarousel(-1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { moveCarousel(1);  e.preventDefault(); }
    });

    // Touch swipe
    let startX = null;
    viewport.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) moveCarousel(dx < 0 ? 1 : -1);
      startX = null;
    });

    // Mouse drag swipe (desktop)
    let mouseDownX = null;
    viewport.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      mouseDownX = e.clientX;
      carouselDragged = false;
      viewport.classList.add('is-dragging');
    });
    window.addEventListener('mousemove', e => {
      if (mouseDownX === null) return;
      if (Math.abs(e.clientX - mouseDownX) > 12) {
        carouselDragged = true;
      }
    });
    window.addEventListener('mouseup', e => {
      if (mouseDownX === null) return;
      const dx = e.clientX - mouseDownX;
      mouseDownX = null;
      viewport.classList.remove('is-dragging');
      if (Math.abs(dx) > 40) {
        carouselDragged = true;
        moveCarousel(dx < 0 ? 1 : -1);
        setTimeout(() => { carouselDragged = false; }, 50);
      } else {
        setTimeout(() => { carouselDragged = false; }, 0);
      }
    });

    // Trackpad two-finger horizontal swipe
    let wheelCooldown = false;
    viewport.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 25) {
        e.preventDefault();
        if (wheelCooldown) return;
        wheelCooldown = true;
        moveCarousel(e.deltaX > 0 ? 1 : -1);
        setTimeout(() => { wheelCooldown = false; }, 550);
      }
    }, { passive: false });
  }

  window.addEventListener('resize', layoutCarousel);
}

/* ==========================================
   05. WORK GRID (home preview: first N / work page: all)
   ========================================== */
function renderWorkGrid(list) {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  grid.innerHTML = list.map(proj => `
    <a class="gallery-card" href="${projectUrl(proj.id)}">
      <div class="gallery-thumb">
        ${projectVisual(proj.image, proj.primarySvgType, proj.title[currentLang])}
      </div>
      <div class="gallery-meta">
        <span class="tag">${proj.category[currentLang]} | ${proj.year}</span>
        <h3>${proj.title[currentLang]}</h3>
      </div>
    </a>`).join('');
}

/* ==========================================
   06. PROFILE / ABOUT (home preview + about page)
   ========================================== */
function renderBio() {
  setText('profile-bio-main', aboutData.bio    ? aboutData.bio[currentLang]    : '');
  setText('profile-bio-sub',  aboutData.bioSub ? aboutData.bioSub[currentLang] : '');
}

function renderAbout() {
  const t = uiText[currentLang];
  renderBio();

  // Optional portrait / model photo (like Annabelle Tan's About page)
  const layout   = document.getElementById('about-layout');
  const photoCol = document.getElementById('about-photo-col');
  const photoImg = document.getElementById('about-photo');
  if (layout && photoCol && photoImg) {
    if (aboutData.photo) {
      photoImg.src = aboutData.photo;
      photoCol.hidden = false;
      layout.classList.add('has-photo');
    } else {
      photoCol.hidden = true;
      layout.classList.remove('has-photo');
    }
  }

  // CV button
  const cvBtn = document.getElementById('cv-btn');
  if (cvBtn) {
    cvBtn.textContent = t.cvBtn;
    if (aboutData.cvFile) {
      cvBtn.href = aboutData.cvFile;
      cvBtn.onclick = null;
    } else {
      cvBtn.href = '#';
      cvBtn.onclick = () => { alert(t.cvSoon); return false; };
    }
  }

  const credHtml = entry => `
    <li class="cred-item">
      <span class="year">${entry.years}</span>
      <span class="title">${entry.title[currentLang]}</span>
      <span class="institution">${entry.institution[currentLang]}</span>
    </li>`;

  const eduList = document.getElementById('edu-list');
  if (eduList && aboutData.education) eduList.innerHTML = aboutData.education.map(credHtml).join('');

  const expList = document.getElementById('exp-list');
  if (expList && aboutData.experience) expList.innerHTML = aboutData.experience.map(credHtml).join('');

  // Awards & Accomplishments (condensed from former News)
  const awardsList = document.getElementById('awards-list');
  if (awardsList && aboutData.awards) {
    awardsList.innerHTML = aboutData.awards.map(item => `
      <li class="cred-item">
        <span class="year">${item.year}</span>
        <span class="title">· ${item.title[currentLang]}</span>
      </li>`).join('');
  }

  setText('head-edu',    t.headEdu);
  setText('head-exp',    t.headExp);
  setText('head-awards', t.headAwards);
}

/* ==========================================
   07. PROJECT PAGE (project.html?id=...)
   Annabelle Tan layout:
   - Left column (sticky): Category + Teal Title + Description + Specs
   - Right column (scrolls): Full-width stack of images from top to bottom
   ========================================== */
function renderProjectPage() {
  const target = document.getElementById('project-page');
  if (!target) return;
  const t   = uiText[currentLang];
  const id  = new URLSearchParams(window.location.search).get('id');
  const idx = projectsData.findIndex(p => p.id === id);

  if (idx === -1) {
    target.innerHTML = `
      <div class="project-not-found">
        <a class="project-back" href="work.html">${t.backToWork}</a>
        <p>${t.notFound}</p>
      </div>`;
    return;
  }

  const proj = projectsData[idx];
  document.title = `${proj.title[currentLang]} — Z.Y.LEE`;

  // Gallery: any number of images; SVG fallback if none
  const imgs = (proj.galleryImages || []).filter(Boolean);
  let galleryHtml;
  if (imgs.length > 0) {
    galleryHtml = imgs.map((src, i) => `
      <figure class="project-img-wrapper">
        <img src="${src}" alt="${proj.title[currentLang]} — ${t.figure} ${i + 1}" loading="lazy">
      </figure>`).join('');
  } else {
    galleryHtml = `
      <figure class="project-img-wrapper">
        ${generateArchitecturalSvg(proj.primarySvgType, '#0a7e8c', 'PRIMARY TECTONIC RENDERING')}
      </figure>
      <figure class="project-img-wrapper">
        ${generateArchitecturalSvg(proj.plansSvgType, '#141414', 'ARCHITECTURAL PLAN / SECTION')}
      </figure>`;
  }

  // Previous / next project (loops around)
  const n = projectsData.length;
  let pagerHtml = '';
  if (n > 1) {
    const prev = projectsData[(idx - 1 + n) % n];
    const next = projectsData[(idx + 1) % n];
    pagerHtml = `
      <nav class="project-pager" aria-label="Project navigation">
        <a class="prev" href="${projectUrl(prev.id)}">
          <span class="pager-label">${t.prevProject}</span>
          <span class="pager-title">${prev.title[currentLang]}</span>
        </a>
        <a class="next" href="${projectUrl(next.id)}">
          <span class="pager-label">${t.nextProject}</span>
          <span class="pager-title">${next.title[currentLang]}</span>
        </a>
      </nav>`;
  }

  target.innerHTML = `
    <div class="project-split">
      <div class="project-info-col">
        <span class="tag">${proj.category[currentLang]}</span>
        <h1>${proj.title[currentLang]}</h1>
        <p class="project-description">${proj.desc[currentLang]}</p>
        <div class="project-specs-list">
          <div class="spec-row"><span class="spec-label">${t.specYear}</span><span>${proj.year}</span></div>
          <div class="spec-row"><span class="spec-label">${t.specLoc}</span><span>${proj.location[currentLang]}</span></div>
          <div class="spec-row"><span class="spec-label">${t.specCollab}</span><span>${proj.collaborators[currentLang]}</span></div>
        </div>
      </div>
      <div class="project-gallery-col">
        ${galleryHtml}
      </div>
    </div>
    ${pagerHtml}`;
}

/* ==========================================
   08. RENDER CURRENT PAGE + LANGUAGE
   ========================================== */
function renderPage() {
  const t = uiText[currentLang];
  document.documentElement.lang = currentLang === 'zh' ? 'zh-Hant' : 'en';

  // Shared header
  setText('nav-work',  t.navWork);
  setText('nav-about', t.navAbout);

  if (PAGE === 'home') {
    setText('label-prev', t.prev);
    setText('label-next', t.next);
    setText('work-label', t.workLabelHome);
    setText('work-title', t.workTitleHome);
    setText('label-view-all-work', t.viewAll);
    setText('profile-label', t.profileLabel);
    setText('profile-title', t.profileTitle);
    setText('label-view-profile', t.viewProfile);

    renderCarousel();
    renderWorkGrid(projectsData.slice(0, siteConfig.homeWorkCount));
    renderBio();
  }

  if (PAGE === 'work') {
    setText('work-label', t.workLabelAll);
    setText('work-title', t.workTitleAll);
    renderWorkGrid(projectsData);
  }

  if (PAGE === 'about') {
    setText('profile-label', t.profileLabel);
    setText('profile-title', t.profileTitle);
    renderAbout();
  }

  if (PAGE === 'project') {
    renderProjectPage();
  }
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  renderPage();
}

/* ==========================================
   09. INIT — fetch all data, then render
   ========================================== */
function fetchJson(path, fallback) {
  return fetch(path)
    .then(r => (r.ok ? r.json() : fallback))
    .catch(() => fallback);
}

document.addEventListener('DOMContentLoaded', () => {
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) langBtn.addEventListener('click', () =>
    applyLanguage(currentLang === 'en' ? 'zh' : 'en'));

  Promise.all([
    fetchJson('data/projects.json', []),
    fetchJson('data/about.json', {}),
    fetchJson('data/site.json', {})
  ])
  .then(([projects, about, site]) => {
    projectsData = projects;
    aboutData    = about;
    siteConfig   = Object.assign(siteConfig, site);

    if (PAGE === 'home') initCarouselControls();
    renderPage();
  })
  .catch(err => console.error('Failed to load data files:', err));
});
