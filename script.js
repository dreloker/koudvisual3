// ============================================================
//  KOUD – script principal
// ============================================================

const IMAGES = Array.from({ length: 12 }, (_, i) => `img/proyecto${i + 1}.jpg`);
const BLOCK_COUNT = 60;

// ── Configuración animación hero ─────────────────────────────
const CFG = {
  blurAmountIn:  12,
  blurAmount:    27,
  heroInterval:  7000,
  inL3Duration:  0.6,  inL3Delay: 0.2,  inL3Stagger: 0.06,
  inL2Duration:  0.6,  inL2Delay: 0.5,  inL2Stagger: 0.06,
  inL1Duration:  0.9,  inL1Delay: 0.8,  inL1Stagger: 0.06,
  outL1Duration: 0.5,  outL1Delay: 0.0, outL1Stagger: 0.06,
  outL2Duration: 0.7,  outL2Delay: 0.2, outL2Stagger: 0.04,
  outL3Duration: 0.6,  outL3Delay: 0.5, outL3Stagger: 0.05,
};

// ── Utilidades ───────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── HERO ─────────────────────────────────────────────────────
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
    l2.style.cssText = `position:absolute;top:0;left:${left}px;width:${blockW}px;height:100%;background:#0cf095;z-index:2;`;
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

  const l1o = oldSlide.querySelectorAll('.hb-layer1');
  const l2o = oldSlide.querySelectorAll('.hb-layer2');
  const l3o = oldSlide.querySelectorAll('.hb-layer3');
  const blurOut = `blur(${CFG.blurAmount}px)`;
  const blurIn  = `blur(${CFG.blurAmountIn}px)`;

  gsap.to(l1o, { scaleY: 0, filter: blurOut, transformOrigin: 'bottom center', duration: CFG.outL1Duration, ease: 'power2.in', stagger: CFG.outL1Stagger, delay: CFG.outL1Delay });
  gsap.to(l2o, { scaleY: 0, filter: blurOut, transformOrigin: 'bottom center', duration: CFG.outL2Duration, ease: 'power2.in', stagger: CFG.outL2Stagger, delay: CFG.outL2Delay });
  gsap.to(l3o, { scaleY: 0, filter: blurOut, transformOrigin: 'bottom center', duration: CFG.outL3Duration, ease: 'power2.in', stagger: CFG.outL3Stagger, delay: CFG.outL3Delay,
    onComplete: () => oldSlide.remove()
  });

  const l1n = newSlide.querySelectorAll('.hb-layer1');
  const l2n = newSlide.querySelectorAll('.hb-layer2');
  const l3n = newSlide.querySelectorAll('.hb-layer3');

  gsap.set([l1n, l2n, l3n], { scaleY: 0, transformOrigin: 'bottom center', filter: blurIn });
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
      const blurIn = `blur(${CFG.blurAmountIn}px)`;

      gsap.set([l1, l2, l3], { scaleY: 0, transformOrigin: 'bottom center', filter: blurIn });
      gsap.to(l3, { scaleY: 1, filter: 'blur(0px)', duration: CFG.inL3Duration, ease: 'power2.inOut', stagger: CFG.inL3Stagger, delay: CFG.inL3Delay });
      gsap.to(l2, { scaleY: 1, filter: 'blur(0px)', duration: CFG.inL2Duration, ease: 'power2.inOut', stagger: CFG.inL2Stagger, delay: CFG.inL2Delay });
      gsap.to(l1, { scaleY: 1, filter: 'blur(0px)', duration: CFG.inL1Duration, ease: 'power2.inOut', stagger: CFG.inL1Stagger, delay: CFG.inL1Delay });

      startAutoplay();
    };
    preload.src = firstSrc;
  });
}

// ── SCROLL AL INICIO al cargar o al navegar a #inicio ────────
function initScrollToTop() {
  if (window.location.hash === '' || window.location.hash === '#inicio') {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  document.querySelectorAll('a[href="#inicio"], a[href="/"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.pushState(null, '', '/');
    });
  });
}

// ── CHEVRON: click lleva a servicios + ocultar al salir hero ─
function initScrollHint() {
  const chevron   = document.getElementById('chevron');
  const hint      = document.getElementById('scroll-hint');
  const hero      = document.getElementById('inicio');
  const servicios = document.getElementById('servicios');
  if (!chevron || !hero || !servicios) return;

  hint.addEventListener('click', () => {
    servicios.scrollIntoView({ behavior: 'smooth' });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      chevron.classList.toggle('is-hidden', !entry.isIntersecting);
    });
  }, { threshold: 0.1 });

  observer.observe(hero);
}

// ── ENTRADA animada izquierda → derecha ──────────────────────
function initParallax() {
  const X_START = -90;

  const onLoad = [
    { sel: '.about__scroll-hint',   dur: 1.2, blur: 12, delay: 0.1  },
    { sel: '.about__title-cell',    dur: 1.8, blur: 16, delay: 0.35 },
    { sel: '.about__marquee-cell',  dur: 2.4, blur: 20, delay: 0.6  },
  ];

  const onScroll = [
    { sel: '.service-btn:nth-child(1)', dur: 1.4, blur: 12, delay: 0.0  },
    { sel: '.service-btn:nth-child(2)', dur: 2.0, blur: 18, delay: 0.25 },
    { sel: '.service-btn:nth-child(3)', dur: 2.8, blur: 24, delay: 0.5  },
    { sel: '.about__panel-col',         dur: 2.2, blur: 20, delay: 0.15 },
  ];

  function prepare(defs) {
    return defs.map(d => ({ ...d, el: document.querySelector(d.sel) }))
               .filter(d => d.el);
  }

  function reset(defs) {
    defs.forEach(({ el, blur }) => {
      gsap.killTweensOf(el);
      gsap.set(el, { opacity: 0, x: X_START, filter: `blur(${blur}px)` });
    });
  }

  function animate(defs) {
    defs.forEach(({ el, dur, blur, delay }) => {
      gsap.killTweensOf(el);
      gsap.set(el, { opacity: 0, x: X_START, filter: `blur(${blur}px)` });
      gsap.to(el, {
        opacity: 1, x: 0, filter: 'blur(0px)',
        duration: dur, delay, ease: 'power3.out',
      });
    });
  }

  const loadDefs   = prepare(onLoad);
  const scrollDefs = prepare(onScroll);

  // Estado inicial de todos
  reset(loadDefs);
  reset(scrollDefs);

  // onLoad: animar al entrar el scroll-hint, resetear al salir
  const scrollHint = document.querySelector('.about__scroll-hint');
  if (scrollHint) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) animate(loadDefs);
        else reset(loadDefs);
      });
    }, { threshold: 0.1 }).observe(scrollHint);
  }

  // onScroll: animar al entrar services-row, resetear al salir
  const servicesRow = document.querySelector('.about__services-row');
  if (servicesRow) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) animate(scrollDefs);
        else reset(scrollDefs);
      });
    }, { threshold: 0.1 }).observe(servicesRow);
  }
}

// ── FOOTER: gradiente mesh que sigue al cursor global ────────
function initFooterGlow() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  const PRIMARIO   = '#0cf095';
  const SECUNDARIO = '#6a6684';
  const OSCURO     = '#000000';

  let curX = 50, curY = 50;
  let tarX = 50, tarY = 50;
  const LERP = 0.027;

  window.addEventListener('mousemove', (e) => {
    const rect = footer.getBoundingClientRect();
    tarX = ((e.clientX - rect.left) / rect.width)  * 100;
    tarY = ((e.clientY - rect.top)  / rect.height) * 100;
  });

  function updateGradient() {
    curX += (tarX - curX) * LERP;
    curY += (tarY - curY) * LERP;

    const r1 = window.innerWidth * 0.7;
    const r2 = window.innerWidth * 0.9;

    footer.style.backgroundImage = `
      radial-gradient(ellipse ${r1}px ${r1}px at ${curX}% ${curY}%, ${PRIMARIO}99 0%, transparent 100%),
      radial-gradient(ellipse ${r2}px ${r2}px at ${curX}% ${curY}%, ${SECUNDARIO}cc 0%, transparent 100%),
      radial-gradient(ellipse 100% 100% at 50% 50%, ${OSCURO} 0%, ${OSCURO} 100%)
    `;

    requestAnimationFrame(updateGradient);
  }

  requestAnimationFrame(updateGradient);
}

// ── SERVICIOS / TABS con autorotación ────────────────────────
function initServiceTabs() {
  const buttons  = document.querySelectorAll('.service-btn');
  const panels   = document.querySelectorAll('.service-panel');
  const services = ['web', 'branding', 'ilustracion'];
  let current    = 0;
  let autoRotate = null;

  function showService(key) {
    buttons.forEach(b => b.classList.toggle('service-btn--active', b.dataset.service === key));
    panels.forEach(p => p.classList.toggle('service-panel--hidden', p.dataset.panel !== key));
  }

  function nextService() {
    current = (current + 1) % services.length;
    showService(services[current]);
  }

  function startAutoRotate() {
    autoRotate = setInterval(nextService, 3000);
  }

  function stopAutoRotate() {
    clearInterval(autoRotate);
    autoRotate = null;
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      stopAutoRotate();
      current = services.indexOf(btn.dataset.service);
      showService(btn.dataset.service);
    });
  });

  startAutoRotate();
}

// ── HEADER: color logo según sección ────────────────────────
function initHeaderTheme() {
  const header       = document.querySelector('.site-header');
  const darkSections = ['#servicios'];

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
  }, { threshold: 0.3 });

  document.querySelectorAll('main > section').forEach(s => observer.observe(s));
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollToTop();
  initHero();
  initScrollHint();
  initParallax();
  initFooterGlow();
  initServiceTabs();
  initHeaderTheme();
});