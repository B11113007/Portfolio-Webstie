/* ==========================================================================
   script.js — Portfolio site logic
   Fetches data/projects.json, renders carousel, gallery, news, and modal.
   ========================================================================== */

/* ==========================================
   01. SVG GENERATIVE ARTWORK PLACEHOLDERS
   ========================================== */
function generateArchitecturalSvg(type, color = '#0a7e8c', label = '') {
  let innerGraphics = '';

  if (type === 'structure') {
    innerGraphics = `
      <line x1="50" y1="350" x2="350" y2="50" stroke="${color}" stroke-width="1.5"/>
      <line x1="50" y1="50" x2="350" y2="350" stroke="${color}" stroke-width="0.5" stroke-dasharray="4,4"/>
      <rect x="100" y="100" width="200" height="200" fill="none" stroke="#141414" stroke-width="2"/>
      <circle cx="200" cy="200" r="70" fill="none" stroke="${color}" stroke-width="1.5"/>
      <path d="M 120 280 Q 200 150 280 280" fill="none" stroke="#141414" stroke-width="1"/>
    `;
  } else if (type === 'monolith') {
    innerGraphics = `
      <rect x="80" y="60" width="100" height="280" fill="#141414" opacity="0.85"/>
      <rect x="210" y="120" width="120" height="220" fill="none" stroke="${color}" stroke-width="2"/>
      <line x1="20" y1="340" x2="380" y2="340" stroke="#141414" stroke-width="2"/>
      <line x1="130" y1="20" x2="130" y2="380" stroke="${color}" stroke-width="0.8" stroke-dasharray="2,2"/>
    `;
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
      <rect x="120" y="50" width="160" height="300" fill="none" stroke="#141414" stroke-width="2"/>
    `;
  } else if (type === 'silo') {
    innerGraphics = `
      <circle cx="140" cy="200" r="80" fill="none" stroke="#141414" stroke-width="2"/>
      <circle cx="260" cy="200" r="80" fill="none" stroke="${color}" stroke-width="2"/>
      <line x1="60" y1="200" x2="340" y2="200" stroke="#141414" stroke-width="1"/>
      <rect x="180" y="140" width="40" height="120" fill="none" stroke="${color}" stroke-dasharray="3,3"/>
    `;
  } else if (type === 'diagram' || type === 'elevation') {
    innerGraphics = `
      <rect x="40" y="100" width="320" height="200" fill="none" stroke="#141414" stroke-width="1.5"/>
      <line x1="40" y1="200" x2="360" y2="200" stroke="${color}" stroke-width="1" stroke-dasharray="5,3"/>
      <rect x="80" y="130" width="60" height="170" fill="none" stroke="${color}" stroke-width="1"/>
      <rect x="180" y="150" width="80" height="150" fill="none" stroke="#141414" stroke-width="1"/>
      <rect x="290" y="120" width="50" height="180" fill="none" stroke="${color}" stroke-width="1"/>
    `;
  } else if (type === 'section') {
    innerGraphics = `
      <path d="M 40 300 L 40 160 Q 200 60 360 160 L 360 300 Z" fill="none" stroke="#141414" stroke-width="1.5"/>
      <line x1="40" y1="300" x2="360" y2="300" stroke="#141414" stroke-width="2"/>
      <line x1="200" y1="60" x2="200" y2="300" stroke="${color}" stroke-width="0.8" stroke-dasharray="4,3"/>
    `;
  } else {
    /* membrane */
    innerGraphics = `
      <path d="M 50 200 C 120 80, 280 80, 350 200 C 280 320, 120 320, 50 200 Z" fill="none" stroke="${color}" stroke-width="2"/>
      <path d="M 80 200 C 140 120, 260 120, 320 200" fill="none" stroke="#141414" stroke-width="1" stroke-dasharray="4,2"/>
    `;
  }

  return `
    <svg viewBox="0 0 400 400" width="100%" height="100%"
         xmlns="http://www.w3.org/2000/svg" style="background:#efeeea;" role="img"
         aria-label="${label}">
      <defs>
        <pattern id="grid-${type}-${Math.random().toString(36).slice(2,6)}"
                 width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none"
                stroke="rgba(20,20,20,0.05)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#grid-${type}-${Math.random().toString(36).slice(2,6)})"/>
      ${innerGraphics}
      <text x="20" y="385" font-family="JetBrains Mono,monospace"
            font-size="10" fill="#737373" letter-spacing="1">${label.toUpperCase()}</text>
    </svg>
  `;
}

/* ==========================================
   02. STATE
   ========================================== */
let projectsData = [];
let currentLang = 'en';
let activeCarouselIndex = 0;

/* ==========================================
   03. UI TEXT (bilingual)
   ========================================== */
const uiText = {
  en: {
    logoSub: 'ARCHITECTURE',
    navWork: 'WORK',
    navAbout: 'ABOUT',
    navNews: 'NEWS',
    heroLabel: '01 / FEATURED PORTFOLIO',
    heroText: 'Graduate portfolio exploring tectonic clarity, spatial thresholds, and environmental adaptability through architectural synthesis.',
    prev: 'PREV',
    next: 'NEXT',
    viewAll: 'VIEW ALL PROJECTS',
    workLabel: 'INDEX / ALL PROJECTS',
    workTitle: 'Selected Works',
    profileLabel: 'BIOGRAPHY & CREDENTIALS',
    profileTitle: 'Profile',
    profileBioMain: 'Yuan-Hao Lin is an architecture researcher and designer focusing on resilient urban infrastructures, material re-use, and spatial phenomenology in subtropical climates.',
    profileBioSub: 'Having completed M.Arch studies with distinction, his work investigates the intersection between precise structural engineering and soft environmental boundaries. Prior to graduate research, he worked with award-winning practices on public cultural centers and experimental housing prototypes.',
    cvBtn: 'DOWNLOAD FULL CV (PDF) ↓',
    headEdu: 'EDUCATION',
    edu1Title: 'Master of Architecture (M.Arch I)',
    edu1Inst: 'Graduate School of Design / Thesis Distinction',
    edu2Title: 'Bachelor of Science in Architectural Design',
    edu2Inst: 'Department of Architecture / First Class Honors',
    headExp: 'SELECTED EXPERIENCE',
    exp1Title: 'Architectural Assistant & Researcher',
    exp2Title: 'Design Intern',
    newsLabel: 'UPDATES & PRESS',
    newsTitle: 'News',
    modalYear: 'YEAR',
    modalCat: 'CATEGORY',
    modalLoc: 'LOCATION',
    modalCollab: 'COLLABORATORS',
    modalOverview: 'PROJECT OVERVIEW',
    modalDrawings: 'ARCHITECTURAL DRAWINGS & PLANS'
  },
  zh: {
    logoSub: '建築作品集',
    navWork: '作品集',
    navAbout: '關於',
    navNews: '最新動態',
    heroLabel: '01 / 特選作品展示',
    heroText: '探索構造清晰度、空間邊界與環境適應力的建築設計碩士作品集。',
    prev: '上一案',
    next: '下一案',
    viewAll: '檢視全部作品',
    workLabel: '索引 / 所有項目',
    workTitle: '設計作品',
    profileLabel: '個人簡歷與學歷',
    profileTitle: '個人簡介',
    profileBioMain: '林元浩（Yuan-Hao Lin）是一位建築研究者與設計師，專注於亞熱帶氣候下的韌性城市基礎設施、材料循環再利用與空間現象學。',
    profileBioSub: '以優異成績取得建築碩士學位，其作品探討精確結構工程與柔性環境邊界之間的交會。曾於多家獲獎事務所參與公共文化中心與實驗住宅原型開發。',
    cvBtn: '下載完整簡歷 (PDF) ↓',
    headEdu: '教育背景',
    edu1Title: '建築學碩士 (M.Arch I)',
    edu1Inst: '設計研究生院 / 畢業論文優異獎',
    edu2Title: '建築學理學士',
    edu2Inst: '建築學系 / 一等榮譽畢業',
    headExp: '經歷選列',
    exp1Title: '建築助理與研究員',
    exp2Title: '設計實習生',
    newsLabel: '新聞與展覽',
    newsTitle: '最新動態',
    modalYear: '年份',
    modalCat: '類別',
    modalLoc: '地點',
    modalCollab: '合作對象',
    modalOverview: '設計概念說明',
    modalDrawings: '建築圖面與模型圖'
  }
};

/* ==========================================
   04. NEWS DATA
   ========================================== */
const newsData = [
  {
    date: '2026.02',
    title: { en: 'M.Arch Thesis Award First Runner-Up', zh: '碩士畢業設計獎 亞軍' },
    desc: { en: 'Hydrological Thresholds project selected for national design publication.', zh: '作品「水文交界處」獲選刊登於全國建築設計年鑑。' }
  },
  {
    date: '2025.11',
    title: { en: 'Exhibited at Young Architects Forum', zh: '參展 青年建築師論壇' },
    desc: { en: 'Subtropical Timber Housing prototypes presented in Taipei Fine Arts Museum.', zh: '亞熱帶積層木造住宅模型於台北市立美術館展示。' }
  },
  {
    date: '2024.08',
    title: { en: 'Winner of Kaohsiung Silo Reuse Competition', zh: '高雄工業遺構改造競賽 獲勝' },
    desc: { en: 'Awarded first place among 120 international student proposals.', zh: '於120件國際學生提案中榮獲首獎。' }
  }
];

/* ==========================================
   05. PAGE DETECTION
   ========================================== */
const PAGE = document.body.dataset.page; // 'home' or 'about'

/* ==========================================
   06. CAROUSEL (index.html only)
   ========================================== */
function renderCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  track.innerHTML = '';

  projectsData.forEach((proj, idx) => {
    const card = document.createElement('div');
    card.className = `carousel-card${idx === activeCarouselIndex ? ' active' : ''}`;
    card.setAttribute('data-index', idx);
    card.innerHTML = generateArchitecturalSvg(proj.primarySvgType, '#0a7e8c', proj.id);
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
  const track = document.getElementById('carousel-track');
  const viewport = document.getElementById('carousel-viewport');
  if (!track || !viewport) return;

  const cards = track.querySelectorAll('.carousel-card');
  if (!cards.length) return;

  cards.forEach((c, idx) => {
    c.classList.toggle('active', idx === activeCarouselIndex);
  });

  const cardWidth = cards[0].offsetWidth;
  const gapVal = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--carousel-gap')
  ) || 24;
  const viewportWidth = viewport.offsetWidth;
  const activeOffset = activeCarouselIndex * (cardWidth + gapVal) - viewportWidth / 2 + cardWidth / 2;
  track.style.transform = `translateX(${-activeOffset}px)`;

  const counter = document.getElementById('carousel-counter');
  if (counter) {
    counter.textContent = `0${activeCarouselIndex + 1} / 0${projectsData.length}`;
  }
}

/* ==========================================
   07. WORK GALLERY (index.html only)
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
    card.setAttribute('aria-label', `Open project: ${proj.title[currentLang]}`);
    card.innerHTML = `
      <div class="gallery-thumb">
        ${generateArchitecturalSvg(proj.primarySvgType, '#0a7e8c', proj.id)}
      </div>
      <div class="gallery-meta">
        <span class="tag">${proj.category[currentLang]}</span>
        <h3>${proj.title[currentLang]}</h3>
        <div class="info">
          <span>${proj.location[currentLang]}</span>
          <span>${proj.year}</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => openProjectModal(proj.id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openProjectModal(proj.id); });
    grid.appendChild(card);
  });
}

/* ==========================================
   08. NEWS SECTION
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
      </div>
    `;
    container.appendChild(el);
  });
}

/* ==========================================
   09. PROJECT MODAL (index.html only)
   ========================================== */
function openProjectModal(id) {
  const proj = projectsData.find(p => p.id === id);
  if (!proj) return;

  const target = document.getElementById('modal-content-target');
  if (!target) return;

  const t = uiText[currentLang];

  target.innerHTML = `
    <div class="modal-header-meta">
      <span class="tag">${proj.category[currentLang]}</span>
      <h2>${proj.title[currentLang]}</h2>
      <div class="modal-specs-grid">
        <div class="spec-item">
          <label>${t.modalYear}</label>
          <div>${proj.year}</div>
        </div>
        <div class="spec-item">
          <label>${t.modalLoc}</label>
          <div>${proj.location[currentLang]}</div>
        </div>
        <div class="spec-item">
          <label>${t.modalCollab}</label>
          <div>${proj.collaborators[currentLang]}</div>
        </div>
      </div>
    </div>

    <div class="modal-body">
      <div>
        <h4 class="modal-overview-heading">${t.modalOverview}</h4>
        <p class="modal-description">${proj.desc[currentLang]}</p>
      </div>
      <div class="modal-gallery-stack">
        <h4 class="modal-drawings-heading">${t.modalDrawings}</h4>
        <div class="modal-img-wrapper">
          ${generateArchitecturalSvg(proj.primarySvgType, '#0a7e8c', 'PRIMARY TECTONIC RENDERING')}
          <div class="modal-img-caption">FIG 1.1 — Isometric Structural Rendering</div>
        </div>
        <div class="modal-img-wrapper">
          ${generateArchitecturalSvg(proj.plansSvgType, '#141414', 'ARCHITECTURAL PLAN / SECTION')}
          <div class="modal-img-caption">FIG 1.2 — Transverse Architectural Section &amp; Detailed Threshold</div>
        </div>
      </div>
    </div>
  `;

  const dialog = document.getElementById('project-modal');
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const dialog = document.getElementById('project-modal');
  if (dialog) {
    dialog.close();
    document.body.style.overflow = '';
  }
}

/* ==========================================
   10. PROFILE SECTION (about.html only)
   ========================================== */
function applyProfileText() {
  const t = uiText[currentLang];
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setText('profile-label', t.profileLabel);
  setText('profile-title', t.profileTitle);
  setText('profile-bio-main', t.profileBioMain);
  setText('profile-bio-sub', t.profileBioSub);
  setText('head-edu', t.headEdu);
  setText('edu-1-title', t.edu1Title);
  setText('edu-1-inst', t.edu1Inst);
  setText('edu-2-title', t.edu2Title);
  setText('edu-2-inst', t.edu2Inst);
  setText('head-exp', t.headExp);
  setText('exp-1-title', t.exp1Title);
  setText('exp-2-title', t.exp2Title);
}

/* ==========================================
   11. LANGUAGE TOGGLE
   ========================================== */
function applyLanguage(lang) {
  currentLang = lang;
  const t = uiText[lang];

  // Shared nav items (present on both pages)
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('logo-sub', t.logoSub);
  setText('nav-work', t.navWork);
  setText('nav-about', t.navAbout);
  setText('nav-news', t.navNews);

  if (PAGE === 'home') {
    setText('hero-label', t.heroLabel);
    setText('hero-text', t.heroText);
    setText('label-prev', t.prev);
    setText('label-next', t.next);
    setText('label-view-all', t.viewAll);
    setText('work-label', t.workLabel);
    setText('work-title', t.workTitle);
    setText('news-label', t.newsLabel);
    setText('news-title', t.newsTitle);
    renderGallery();
    renderNews();
  }

  if (PAGE === 'about') {
    applyProfileText();
    setText('news-label', t.newsLabel);
    setText('news-title', t.newsTitle);
    renderNews();
  }
}

/* ==========================================
   12. INIT
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Language toggle (both pages)
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', () => applyLanguage(currentLang === 'en' ? 'zh' : 'en'));
  }

  // Fetch project data then render page-specific content
  fetch('data/projects.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      projectsData = data;

      if (PAGE === 'home') {
        renderCarousel();
        renderGallery();
        renderNews();

        // Carousel buttons
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

        // View All scrolls to gallery
        const viewAllBtn = document.getElementById('btn-view-all');
        if (viewAllBtn) viewAllBtn.addEventListener('click', () => {
          document.getElementById('work').scrollIntoView({ behavior: 'smooth' });
        });

        // Modal controls
        const closeBtn = document.getElementById('modal-close-btn');
        const dialog = document.getElementById('project-modal');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (dialog) dialog.addEventListener('click', e => { if (e.target === dialog) closeModal(); });

        window.addEventListener('resize', updateCarouselPosition);
      }

      if (PAGE === 'about') {
        applyProfileText();
        renderNews();
      }
    })
    .catch(err => console.error('Failed to load projects.json:', err));
});
