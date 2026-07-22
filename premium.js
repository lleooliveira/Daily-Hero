const body = document.body;
const topbar = document.querySelector('.topbar');
const menuButton = document.querySelector('.menu-button');
const hero = document.querySelector('.premium-hero');
const heroReveals = [...hero.querySelectorAll('.reveal')];
const pageReveals = [...document.querySelectorAll('.reveal:not(.premium-hero .reveal)')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroAssets = ['assets/sky.png', 'assets/premium-portal.jpg'];
Promise.all(heroAssets.map((src) => new Promise((resolve) => {
  const image = new Image();
  image.onload = async () => {
    try { await image.decode?.(); } catch (_) { /* The loaded bitmap remains usable. */ }
    resolve();
  };
  image.onerror = resolve;
  image.src = src;
}))).then(() => requestAnimationFrame(() => {
  body.classList.remove('is-loading');
  body.classList.add('is-premium-ready');
  heroReveals.forEach((element) => element.classList.add('is-visible'));
}));

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
  currentX += (targetX - currentX) * 0.075;
  currentY += (targetY - currentY) * 0.075;
  hero.style.setProperty('--mx', `${currentX * -85}px`);
  hero.style.setProperty('--my', `${currentY * -48}px`);
  hero.style.setProperty('--image-x', `${currentX * 28}px`);
  hero.style.setProperty('--image-y', `${currentY * 16}px`);
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
