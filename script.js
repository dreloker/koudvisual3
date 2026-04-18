// ============================================================
//  IMAGE ROTATOR – hero aleatorio + proyectos sin repetición
// ============================================================

const IMAGES = Array.from({ length: 12 }, (_, i) => `img/proyecto${i + 1}.jpg`);
const PROJECT_SLOTS = 4;
const PROJECT_INTERVAL_MS = 4000; // cada 4 s cambia una tarjeta

// ── Utilidades ──────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── HERO: imagen aleatoria al cargar ────────────────────────

function initHero() {
  const img = document.querySelector('.hero__media img');
  if (!img) return;
  img.src = pickRandom(IMAGES);
}

// ── PROYECTOS: pozo compartido sin repetición ───────────────

let pool = [];       // imágenes que quedan por mostrar
let usedBySlot = []; // imagen actual de cada slot

function refillPool() {
  // Excluye las 4 imágenes que ya están visibles
  const visible = new Set(usedBySlot);
  const candidates = IMAGES.filter(img => !visible.has(img));
  pool = shuffle(candidates.length >= PROJECT_SLOTS ? candidates : IMAGES);
}

function drawFromPool() {
  if (pool.length === 0) refillPool();
  return pool.pop();
}

function initProjects() {
  const figures = document.querySelectorAll('.projects__item img');
  if (!figures.length) return;

  // Reparte las primeras 4 imágenes (sin repetir)
  refillPool();
  figures.forEach((img, i) => {
    const src = drawFromPool();
    usedBySlot[i] = src;
    img.src = src;
  });

  // Ciclo: cada intervalo reemplaza UNA tarjeta aleatoria
  setInterval(() => {
    const figures = document.querySelectorAll('.projects__item img');
    const slotIndex = Math.floor(Math.random() * PROJECT_SLOTS);
    const newSrc = drawFromPool();

    usedBySlot[slotIndex] = newSrc;
    figures[slotIndex].src = newSrc;
  }, PROJECT_INTERVAL_MS);
}

// ── Init ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initProjects();
});