const body = document.body;
const topbar = document.querySelector('.topbar');
const menuButton = document.querySelector('.menu-button');
const hero = document.querySelector('.studio-hero');
const heroReveals = [...hero.querySelectorAll('.reveal')];
const pageReveals = [...document.querySelectorAll('.reveal:not(.studio-hero .reveal)')];
const principle = document.querySelector('.principle');
const principleOrb = document.querySelector('.principle__orb div');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroAssets = ['assets/sky.png', 'assets/reality-ground.png', 'assets/reality-clouds.png'];
Promise.all(heroAssets.map((src) => new Promise((resolve) => {
  const image = new Image();
  image.onload = async () => {
    try { await image.decode?.(); } catch (_) { /* Loaded bitmap remains usable. */ }
    resolve();
  };
  image.onerror = resolve;
  image.src = src;
}))).then(() => requestAnimationFrame(() => {
  body.classList.remove('is-loading');
  body.classList.add('is-studio-ready');
  heroReveals.forEach((element) => element.classList.add('is-visible'));
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.13, rootMargin: '0px 0px -7% 0px' });
pageReveals.forEach((element) => revealObserver.observe(element));

const rootStyles = getComputedStyle(document.documentElement);
const arrivalX = Number.parseFloat(rootStyles.getPropertyValue('--arrival-nx')) || 0;
const arrivalY = Number.parseFloat(rootStyles.getPropertyValue('--arrival-ny')) || 0;
let targetX = arrivalX;
let targetY = arrivalY;
let currentX = arrivalX;
let currentY = arrivalY;
let motionFrame = 0;

const paintHeroMotion = () => {
  currentX += (targetX - currentX) * 0.075;
  currentY += (targetY - currentY) * 0.075;
  hero.style.setProperty('--sky-x', `${currentX * -118}px`);
  hero.style.setProperty('--sky-y', `${currentY * -62}px`);
  hero.style.setProperty('--ground-x', `${currentX * -12}px`);
  hero.style.setProperty('--ground-y', `${currentY * -5}px`);
  hero.style.setProperty('--cloud-x', `${currentX * 30}px`);
  hero.style.setProperty('--cloud-y', `${currentY * 15}px`);
  hero.style.setProperty('--halo-x', `${currentX * 22}px`);
  hero.style.setProperty('--halo-y', `${currentY * 12}px`);

  if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
    motionFrame = requestAnimationFrame(paintHeroMotion);
  } else {
    motionFrame = 0;
  }
};

hero.addEventListener('pointermove', (event) => {
  if (reduceMotion) return;
  targetX = event.clientX / window.innerWidth - 0.5;
  targetY = event.clientY / window.innerHeight - 0.5;
  if (!motionFrame) motionFrame = requestAnimationFrame(paintHeroMotion);
});

hero.addEventListener('pointerleave', () => {
  targetX = 0;
  targetY = 0;
  if (!motionFrame) motionFrame = requestAnimationFrame(paintHeroMotion);
});

let scrollFrame = 0;
const paintScroll = () => {
  const scrollY = window.scrollY;
  topbar.classList.toggle('is-scrolled', scrollY > 28);
  if (scrollY < window.innerHeight * 1.15) {
    hero.style.setProperty('--sky-scroll', `${scrollY * 0.045}px`);
    hero.style.setProperty('--ground-scroll', `${scrollY * 0.018}px`);
    hero.style.setProperty('--cloud-scroll', `${scrollY * 0.052}px`);
  }
  scrollFrame = 0;
};

paintScroll();
window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScroll);
}, { passive: true });

principle?.addEventListener('pointermove', (event) => {
  if (reduceMotion) return;
  const bounds = principle.getBoundingClientRect();
  const x = event.clientX / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  principleOrb.style.transform = `translate(${x * 22}px,${y * 15}px) rotate(${x * 5}deg)`;
});

principle?.addEventListener('pointerleave', () => {
  principleOrb.style.transform = '';
});

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
