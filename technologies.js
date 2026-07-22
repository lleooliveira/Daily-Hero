const body = document.body;
const topbar = document.querySelector('.topbar');
const menuButton = document.querySelector('.menu-button');
const hero = document.querySelector('.technology-hero');
const heroReveals = [...hero.querySelectorAll('.reveal')];
const pageReveals = [...document.querySelectorAll('.reveal:not(.technology-hero .reveal)')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const seamlessArrival = document.documentElement.classList.contains('technology-route-arrival');
const revealHero = () => {
  body.classList.remove('is-loading');
  body.classList.add('is-technologies-ready');
  heroReveals.forEach((element) => element.classList.add('is-visible'));
};

const heroAssets = ['assets/sky_technologie_1.webp', 'assets/sky_technologie_2.webp'];
Promise.all(heroAssets.map((src) => new Promise((resolve) => {
  const image = new Image();
  image.onload = async () => {
    try { await image.decode?.(); } catch (_) { /* The loaded bitmap remains usable. */ }
    resolve();
  };
  image.onerror = resolve;
  image.src = src;
}))).then(() => {
  if (seamlessArrival) revealHero();
  else requestAnimationFrame(revealHero);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
pageReveals.forEach((element) => revealObserver.observe(element));

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let motionFrame = 0;
const paintMotion = () => {
  currentX += (targetX - currentX) * 0.07;
  currentY += (targetY - currentY) * 0.07;
  hero.style.setProperty('--mx', `${currentX * -74}px`);
  hero.style.setProperty('--my', `${currentY * -42}px`);
  hero.style.setProperty('--gx', `${currentX * 22}px`);
  hero.style.setProperty('--gy', `${currentY * 10}px`);
  if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) motionFrame = requestAnimationFrame(paintMotion);
  else motionFrame = 0;
};
hero.addEventListener('pointermove', (event) => {
  if (reduceMotion) return;
  targetX = event.clientX / window.innerWidth - 0.5;
  targetY = event.clientY / window.innerHeight - 0.5;
  if (!motionFrame) motionFrame = requestAnimationFrame(paintMotion);
});
hero.addEventListener('pointerleave', () => {
  targetX = 0;
  targetY = 0;
  if (!motionFrame) motionFrame = requestAnimationFrame(paintMotion);
});

const counter = document.querySelector('[data-counter]');
const counterTarget = Number(counter.dataset.counter);
let counterStarted = false;
const runCounter = () => {
  if (counterStarted) return;
  counterStarted = true;
  const started = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - started) / 1700, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = String(Math.round(counterTarget * eased)).padStart(2, '0');
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
if (reduceMotion) counter.textContent = String(counterTarget);
else setTimeout(runCounter, 650);

const systemData = {
  intelligence: { label: 'Adaptive Intelligence', status: 'Signal / 01 · Active', accent: '#9dd8df', radius: '50%' },
  spatial: { label: 'Spatial Computing', status: 'Signal / 02 · Mapping', accent: '#e6b8a8', radius: '32%' },
  realtime: { label: 'Real-time Worlds', status: 'Signal / 03 · Rendering', accent: '#a99bc9', radius: '47% 53% 34% 66%' },
  sensing: { label: 'Responsive Sensing', status: 'Signal / 04 · Listening', accent: '#d9dfbf', radius: '50% 28% 50% 34%' }
};
const systems = [...document.querySelectorAll('.system')];
const visual = document.querySelector('.system-visual');
const visualOrb = visual.querySelector('.system-visual__orb');
const visualLabel = visual.querySelector('.system-visual__label');
const visualStatus = visual.querySelector('small');
systems.forEach((system) => system.addEventListener('click', () => {
  systems.forEach((item) => item.classList.toggle('is-active', item === system));
  const data = systemData[system.dataset.system];
  visual.style.setProperty('--accent', data.accent);
  visualOrb.style.borderRadius = data.radius;
  visualOrb.style.transform = `translate(-50%,-50%) rotate(${systems.indexOf(system) * 22}deg)`;
  visualLabel.textContent = data.label;
  visualStatus.textContent = data.status;
}));

let scrollFrame = 0;
const paintScroll = () => {
  topbar.classList.toggle('is-scrolled', window.scrollY > 28);
  scrollFrame = 0;
};
window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScroll);
}, { passive: true });

menuButton.addEventListener('click', () => {
  const isOpen = topbar.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  body.style.overflow = isOpen ? 'hidden' : '';
});
document.querySelectorAll('.mobile-nav a').forEach((link) => link.addEventListener('click', () => {
  topbar.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
  body.style.overflow = '';
}));
