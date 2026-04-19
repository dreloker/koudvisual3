// ============================================================
//  KOUD – script principal
// ============================================================

const IMAGES = Array.from({ length: 12 }, (_, i) => `img/proyecto${i + 1}.jpg`);
const BLOCK_COUNT = 60;

// ── Configuración animación ──────────────────────────────────
let CFG = {
  "blurAmount": 27,
  "heroInterval": 7000,
  "inL3Duration": 0.6,
  "inL3Delay": 0.2,
  "inL3Stagger": 0.06,
  "inL2Duration": 0.6,
  "inL2Delay": 0.5,
  "inL2Stagger": 0.06,
  "inL1Duration": 0.9,
  "inL1Delay": 0.8,
  "inL1Stagger": 0.06,
  "outL1Duration": 0.5,
  "outL1Delay": 0,
  "outL1Stagger": 0.06,
  "outL2Duration": 0.7,
  "outL2Delay": 0.2,
  "outL2Stagger": 0.04,
  "outL3Duration": 0.6,
  "outL3Delay": 0.5,
  "outL3Stagger": 0.05
};

// ── Utilidades ──────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── HERO ────────────────────────────────────────────────────
let heroPool = [];
let heroAnimating = false;
let heroAutoplay = null;

function refillHeroPool() { heroPool = shuffle([...IMAGES]); }
function drawFromHeroPool() {
  if (heroPool.length === 0) refillHeroPool();
  return heroPool.pop();
}

function createHeroSlide(imageSrc) {
  const slide = document.createElement('div');
  slide.className = 'hero-slide';
  slide.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';

  const sliderW = document.getElementById('hero-slider').offsetWidth;
  const blockW  = sliderW / BLOCK_COUNT;

  for (let i = 0; i < BLOCK_COUNT; i++) {
    const left = i * blockW;

    const l3 = document.createElement('div');
    l3.className = 'hb-layer3';
    l3.style.cssText = `position:absolute;top:0;left:${left}px;width:${blockW}px;height:100%;background:#000;z-index:1;`;
    slide.appendChild(l3);

    const l2 = document.createElement('div');
    l2.className = 'hb-layer2';
    l2.style.cssText = `position:absolute;top:0;left:${left}px;width:${blockW}px;height:100%;background:#86EAC2;z-index:2;`;
    slide.appendChild(l2);

    const l1 = document.createElement('div');
    l1.className = 'hb-layer1';
    l1.style.cssText = `position:absolute;top:0;left:${left}px;width:${blockW}px;height:100%;overflow:hidden;z-index:3;`;

    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.cssText = `position:absolute;top:0;left:${-left}px;width:${sliderW}px;height:100%;object-fit:cover;`;
    l1.appendChild(img);
    slide.appendChild(l1);
  }

  return slide;
}

function heroTransition(incoming) {
  if (heroAnimating) return;
  heroAnimating = true;

  const sliderEl = document.getElementById('hero-slider');
  const oldSlide = sliderEl.querySelector('.hero-slide');
  const newSlide = createHeroSlide(incoming);
  sliderEl.appendChild(newSlide);

  // ── Salida (slide viejo) ─────────────────────────────────
  const l1o = oldSlide.querySelectorAll('.hb-layer1');
  const l2o = oldSlide.querySelectorAll('.hb-layer2');
  const l3o = oldSlide.querySelectorAll('.hb-layer3');

  const blurOut = `blur(${CFG.blurAmount}px)`;
  gsap.to(l1o, { scaleY: 0, filter: blurOut, transformOrigin: 'bottom center', duration: CFG.outL1Duration, ease: 'power2.in', stagger: CFG.outL1Stagger, delay: CFG.outL1Delay });
  gsap.to(l2o, { scaleY: 0, filter: blurOut, transformOrigin: 'bottom center', duration: CFG.outL2Duration, ease: 'power2.in', stagger: CFG.outL2Stagger, delay: CFG.outL2Delay });
  gsap.to(l3o, { scaleY: 0, filter: blurOut, transformOrigin: 'bottom center', duration: CFG.outL3Duration, ease: 'power2.in', stagger: CFG.outL3Stagger, delay: CFG.outL3Delay,
    onComplete: () => oldSlide.remove()
  });

  // ── Entrada (slide nuevo) ────────────────────────────────
  const l1n = newSlide.querySelectorAll('.hb-layer1');
  const l2n = newSlide.querySelectorAll('.hb-layer2');
  const l3n = newSlide.querySelectorAll('.hb-layer3');

  gsap.set([l1n, l2n, l3n], { scaleY: 0, transformOrigin: 'bottom center', filter: blurOut });
  gsap.to(l3n, { scaleY: 1, filter: 'blur(0px)', duration: CFG.inL3Duration, ease: 'power2.inOut', stagger: CFG.inL3Stagger, delay: CFG.inL3Delay });
  gsap.to(l2n, { scaleY: 1, filter: 'blur(0px)', duration: CFG.inL2Duration, ease: 'power2.inOut', stagger: CFG.inL2Stagger, delay: CFG.inL2Delay });
  gsap.to(l1n, { scaleY: 1, filter: 'blur(0px)', duration: CFG.inL1Duration, ease: 'power2.inOut', stagger: CFG.inL1Stagger, delay: CFG.inL1Delay,
    onComplete: () => { heroAnimating = false; }
  });
}

function startAutoplay() {
  clearInterval(heroAutoplay);
  heroAutoplay = setInterval(() => {
    if (!heroAnimating) heroTransition(drawFromHeroPool());
  }, CFG.heroInterval);
}

function initHero() {
  const sliderEl = document.getElementById('hero-slider');
  if (!sliderEl) return;

  refillHeroPool();

  requestAnimationFrame(() => {
    const firstSrc = drawFromHeroPool();
    const preload = new Image();
    preload.onload = () => {
      const firstSlide = createHeroSlide(firstSrc);
      sliderEl.appendChild(firstSlide);

      const l1 = firstSlide.querySelectorAll('.hb-layer1');
      const l2 = firstSlide.querySelectorAll('.hb-layer2');
      const l3 = firstSlide.querySelectorAll('.hb-layer3');
      const blurOut = `blur(${CFG.blurAmount}px)`;
      gsap.set([l1, l2, l3], { scaleY: 0, transformOrigin: 'bottom center', filter: blurOut });
      gsap.to(l3, { scaleY: 1, filter: 'blur(0px)', duration: CFG.inL3Duration, ease: 'power2.inOut', stagger: CFG.inL3Stagger, delay: CFG.inL3Delay });
      gsap.to(l2, { scaleY: 1, filter: 'blur(0px)', duration: CFG.inL2Duration, ease: 'power2.inOut', stagger: CFG.inL2Stagger, delay: CFG.inL2Delay });
      gsap.to(l1, { scaleY: 1, filter: 'blur(0px)', duration: CFG.inL1Duration, ease: 'power2.inOut', stagger: CFG.inL1Stagger, delay: CFG.inL1Delay });

      startAutoplay();
    };
    preload.src = firstSrc;
  });
}

// ── SERVICIOS / TABS ─────────────────────────────────────────
function initServiceTabs() {
  const buttons = document.querySelectorAll('.service-btn');
  const panels  = document.querySelectorAll('.portfolio-panel__content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.service;
      buttons.forEach(b => b.classList.remove('service-btn--active'));
      btn.classList.add('service-btn--active');
      panels.forEach(panel => {
        if (panel.dataset.panel === target) {
          panel.classList.remove('portfolio-panel__content--hidden');
        } else {
          panel.classList.add('portfolio-panel__content--hidden');
        }
      });
    });
  });
}

// ── HEADER: color logo según sección ─────────────────────────
function initHeaderTheme() {
  const header = document.querySelector('.site-header');
  const darkSections = ['#servicios', '#portafolio'];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        if (darkSections.includes(id)) {
          header.classList.add('site-header--dark');
          header.classList.remove('site-header--light');
        } else {
          header.classList.add('site-header--light');
          header.classList.remove('site-header--dark');
        }
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('main > section').forEach(s => observer.observe(s));
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initServiceTabs();
  initHeaderTheme();
  initDevPanel();
});