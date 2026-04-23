// ============================================================
//  KOUD – script principal
// ============================================================

const IMAGES = Array.from({ length: 12 }, (_, i) => `img/proyecto${i + 1}.jpg`);
const BLOCK_COUNT = 60;

// ── Configuración animación hero ─────────────────────────────
const CFG = {
  blurAmountIn:  17,
  blurAmount:    77,
  heroInterval:  10000,
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

// ── EFECTOKOUD ────────────────────────────────────────────────
  const KOUD_SPEEDS = {
    vel1: 5.0,
    vel2: 4.0,
    vel3: 3.0,
    vel4: 2.0,
    vel5: 1.0,
  };

  const KOUD_BLUR_DURATION = {
    vel1: 3.0,
    vel2: 2.3,
    vel3: 1.5,
    vel4: 0.9,
    vel5: 0.3,
  };

  const KOUD_EASE = 'cubic-bezier(0.3, 0, 0.03, 1.7)';

  function initEfectoKoud() {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        obs.unobserve(el);

        const velKey = Object.keys(KOUD_SPEEDS).find(k => el.classList.contains(`efectokoud_${k}`));
        const duration     = velKey ? KOUD_SPEEDS[velKey]        : KOUD_SPEEDS.vel3;
        const blurDuration = velKey ? KOUD_BLUR_DURATION[velKey] : KOUD_BLUR_DURATION.vel3;

        gsap.set(el, { x: '-30vw' });

        const tl = gsap.timeline();
        tl.to(el, { x: 0, duration, ease: KOUD_EASE }, 0);
        tl.to(el, { filter: 'blur(0px)', duration: blurDuration, ease: KOUD_EASE }, 0);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[class*="efectokoud_"]').forEach(el => observer.observe(el));
  }

// ── SERVICIOS / TABS con autorotación ────────────────────────
function initServiceTabs() {
  const buttons  = document.querySelectorAll('.service-btn');
  const panels   = document.querySelectorAll('.service-panel');
  const services = ['web', 'branding', 'ilustracion', 'producciongrafica'];
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


// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initScrollHint();
  initEfectoKoud(); // ← aquí
  initServiceTabs();
  initFooterGlow();

});