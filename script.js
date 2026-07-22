const track = document.querySelector('.carousel__track');
const dots = [...document.querySelectorAll('.dots button')];
const cards = [...document.querySelectorAll('.card')];
const experienceObject = document.querySelector('.experience-object');
const experienceDeck = document.querySelector('.experience-deck');
const experienceTypes = [
  ['Luxury Concierge','Dedicated support for every stage of your trip.','#cac7f5'],
  ['Private Retreats','Discover secluded destinations far from crowded tourism.','#c7e9f5'],
  ['Private Retreats','Discover secluded destinations far from crowded tourism.','#dec7f5'],
  ['Exclusive Access','Unlock locations unavailable to the public.','#f5c7c7'],
  ['Nature Escapes','Reconnect with untouched landscapes and silence.','#e2f5c7'],
  ['Exclusive Access','Unlock locations unavailable to the public.','#f5c7c7'],
  ['Private Retreats','Discover secluded destinations far from crowded tourism.','#c7e9f5'],
  ['Curated Adventures','Experiences tailored to your lifestyle and preferences.','#f5ebc7']
];

// Component 2 is a 24-position ring: 360deg / 24 = the 15deg step from Figma.
experienceDeck.innerHTML = Array.from({ length: 24 }, (_, index) => {
  const [title, description, color] = experienceTypes[index % experienceTypes.length];
  return `<article class="experience-card" style="background:${color};--delay:${0.25 + (index % 7) * 0.05}s"><i>↗</i><h3>${title.replace(' ', '<br>')}</h3><p>${description}</p></article>`;
}).join('');

const experienceCards = [...document.querySelectorAll('.experience-card')];

function selectSlide(index) {
  const safeIndex = Number(index) % cards.length;
  cards.forEach((card, i) => card.classList.toggle('is-active', i === safeIndex));
  dots.forEach((dot) => dot.classList.toggle('active', Number(dot.dataset.slide) === safeIndex));
  const shift = Math.max(0, safeIndex - 1) * 202;
  track.style.transform = `translateX(-${shift}px)`;
}

dots.forEach((dot) => dot.addEventListener('click', () => selectSlide(dot.dataset.slide)));
cards.forEach((card) => card.addEventListener('click', () => selectSlide(card.dataset.index)));

document.querySelector('.menu-button').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const open = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!open));
});

const hero = document.querySelector('.hero');
const reality = document.querySelector('.reality');
const enter = document.querySelector('.enter');
const brand = document.querySelector('.brand');

const openingAssets = [
  'figma-reference.png',
  'assets/sky.png',
  'assets/background.png',
  'assets/left.png',
  'assets/right.png'
];

Promise.all(openingAssets.map((src) => new Promise((resolve) => {
  const image = new Image();
  image.onload = image.onerror = resolve;
  image.src = src;
}))).then(() => requestAnimationFrame(() => {
  document.body.classList.remove('is-loading');
  document.body.classList.add('is-ready');
}));

let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let rafPending = false;
let carouselRotation = 0;
let realityStep = 0;
let wheelAccumulator = 0;
let wheelSettleTimer;
let dragStartX = null;
let dragDistance = 0;
let suppressCardClick = false;
let transitionTimer;
let transitionCleanupTimer;

function renderPointerMotion() {
  const nx = pointerX / window.innerWidth - 0.5;
  const ny = pointerY / window.innerHeight - 0.5;
  hero.style.setProperty('--fg-x', `${nx * 76}px`);
  hero.style.setProperty('--fg-neg-x', `${nx * -76}px`);
  hero.style.setProperty('--fg-y', `${ny * 40}px`);
  hero.style.setProperty('--sky-x', `${nx * -128}px`);
  hero.style.setProperty('--sky-y', `${ny * -70}px`);
  hero.style.setProperty('--background-x', `${nx * -18}px`);
  hero.style.setProperty('--background-y', `${ny * -12}px`);
  hero.style.setProperty('--content-x', `${nx * -15}px`);
  hero.style.setProperty('--content-neg-x', `${nx * 15}px`);
  hero.style.setProperty('--content-y', `${ny * -9}px`);
  reality.style.setProperty('--cloud-pointer-x', `${nx * 34}px`);
  reality.style.setProperty('--cloud-pointer-y', `${ny * 18}px`);
  reality.style.setProperty('--ground-x', `${nx * -7}px`);
  reality.style.setProperty('--ground-y', `${ny * -3}px`);

  if (hero.classList.contains('is-reality') || hero.classList.contains('is-diving')) {
    const width = experienceDeck.clientWidth;
    const height = experienceDeck.clientHeight;
    const centerX = width / 2;
    // Keep a true circular orbit. Only its radius is reduced; card dimensions stay intact.
    const previousRadius = Math.min(width * 0.52, 950);
    const carouselRadius = Math.min(width * 0.46, 840);
    const centerY = height * 1.48 - previousRadius + carouselRadius;
    experienceDeck.style.setProperty('--carousel-center-y', `${centerY}px`);
    // Home 5 starts with the first Private Retreats card on the visual axis.
    // The 0.162px drift is the subtle Component 4 pointer response from Figma.
    const offset = 45 + nx * 0.162;
    let selectedCard = null;
    let selectedDistance = Infinity;
    experienceCards.forEach((card, index) => {
      const angle = -120 + index * 15 + offset;
      const radians = angle * Math.PI / 180;
      const x = centerX + Math.cos(radians) * carouselRadius;
      const y = centerY + Math.sin(radians) * carouselRadius;
      const visualRadians = (angle - 15 + carouselRotation) * Math.PI / 180;
      const visualX = centerX + Math.cos(visualRadians) * carouselRadius;
      const visualY = centerY + Math.sin(visualRadians) * carouselRadius;
      const distanceToFocus = Math.hypot(visualX - centerX, visualY - (centerY - carouselRadius));
      if (distanceToFocus < selectedDistance) {
        selectedDistance = distanceToFocus;
        selectedCard = card;
      }
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
      // The card nearest the top-center of the visible arc sits above its neighbours.
      card.style.zIndex = String(1000 - Math.round(Math.abs(visualX - centerX)));
      card.style.transform = `translate(-50%,-50%) rotate(${angle + 90}deg)`;
    });
    experienceCards.forEach((card) => card.classList.toggle('is-selected', card === selectedCard));
  }
  rafPending = false;
}

window.addEventListener('pointermove', (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(renderPointerMotion);
  }
});

window.addEventListener('wheel', (event) => {
  if (!hero.classList.contains('is-reality')) return;
  event.preventDefault();
  const delta = Math.max(-120, Math.min(120, event.deltaY + event.deltaX));
  wheelAccumulator += delta;

  const previewAngle = -15 + realityStep * -15 - (wheelAccumulator / 120) * 15;
  experienceObject.classList.add('is-scrolling');
  reality.classList.add('is-carousel-scrolling');
  experienceDeck.style.setProperty('--deck-angle', `${previewAngle}deg`);
  reality.style.setProperty('--cloud-carousel-x', `${wheelAccumulator * 0.2}px`);
  reality.style.setProperty('--cloud-carousel-y', `${Math.min(10, Math.abs(wheelAccumulator) * 0.025)}px`);

  window.clearTimeout(wheelSettleTimer);
  wheelSettleTimer = window.setTimeout(() => {
    const magnitude = Math.abs(wheelAccumulator);
    const movedSteps = magnitude < 24 ? 0 : Math.max(1, Math.round(magnitude / 120));
    const nextStep = realityStep + Math.sign(wheelAccumulator) * movedSteps;
    wheelAccumulator = 0;
    reality.style.setProperty('--cloud-carousel-x', '0px');
    reality.style.setProperty('--cloud-carousel-y', '0px');
    experienceObject.classList.remove('is-scrolling');
    reality.classList.remove('is-carousel-scrolling');
    requestAnimationFrame(() => setRealityStep(nextStep));
  }, 140);
}, { passive: false });

function setRealityStep(nextStep) {
  realityStep = nextStep;
  carouselRotation = realityStep * -15;
  // The carousel rotates around a fixed axis; its wrapper never walks sideways.
  experienceObject.style.setProperty('--object-x', '0px');
  experienceDeck.style.setProperty('--component-x', '0px');
  experienceDeck.style.setProperty('--deck-angle', `${-15 + carouselRotation}deg`);
  renderPointerMotion();
}

experienceObject.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  setRealityStep(realityStep + (event.key === 'ArrowRight' ? 1 : -1));
});

experienceObject.addEventListener('pointerdown', (event) => {
  dragStartX = event.clientX;
  dragDistance = 0;
  suppressCardClick = false;
  experienceObject.classList.add('is-dragging');
  reality.classList.add('is-carousel-dragging');
  experienceObject.setPointerCapture(event.pointerId);
});
experienceObject.addEventListener('pointermove', (event) => {
  if (dragStartX === null) return;
  dragDistance = event.clientX - dragStartX;
  if (Math.abs(dragDistance) > 4) suppressCardClick = true;
  const angle = -15 + realityStep * -15 + (dragDistance / 80) * 15;
  experienceObject.style.setProperty('--object-x', '0px');
  experienceDeck.style.setProperty('--deck-angle', `${angle}deg`);
  reality.style.setProperty('--cloud-carousel-x', `${dragDistance * -0.24}px`);
  reality.style.setProperty('--cloud-carousel-y', `${Math.min(9, Math.abs(dragDistance) * 0.025)}px`);
});
experienceObject.addEventListener('pointerup', (event) => {
  if (dragStartX === null) return;
  const movedSteps = Math.abs(dragDistance) > 35 ? Math.max(1, Math.round(Math.abs(dragDistance) / 80)) : 0;
  const nextStep = realityStep + (dragDistance < 0 ? movedSteps : -movedSteps);
  dragStartX = null;
  experienceObject.classList.remove('is-dragging');
  reality.classList.remove('is-carousel-dragging');
  reality.style.setProperty('--cloud-carousel-x', '0px');
  reality.style.setProperty('--cloud-carousel-y', '0px');
  setRealityStep(nextStep);
});
experienceObject.addEventListener('pointercancel', () => {
  dragStartX = null;
  experienceObject.classList.remove('is-dragging');
  reality.classList.remove('is-carousel-dragging');
  reality.style.setProperty('--cloud-carousel-x', '0px');
  reality.style.setProperty('--cloud-carousel-y', '0px');
  setRealityStep(realityStep);
});

experienceCards.forEach((card) => card.addEventListener('click', () => {
  if (suppressCardClick) {
    suppressCardClick = false;
    return;
  }
  const rect = card.getBoundingClientRect();
  setRealityStep(realityStep + (rect.left + rect.width / 2 < window.innerWidth / 2 ? -1 : 1));
}));

function startExperienceTransition() {
  if (hero.classList.contains('is-diving') || hero.classList.contains('is-reality')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const arrivalDelay = reduceMotion ? 0 : 3000;
  const cleanupDelay = reduceMotion ? 20 : 4100;

  enter.setAttribute('aria-disabled', 'true');
  enter.setAttribute('tabindex', '-1');
  hero.classList.add('is-transitioning', 'is-diving');
  setRealityStep(0);
  renderPointerMotion();

  transitionTimer = window.setTimeout(() => {
    hero.classList.add('is-reality');
    reality.setAttribute('aria-hidden', 'false');
    enter.removeAttribute('aria-disabled');
    enter.removeAttribute('tabindex');
    renderPointerMotion();
  }, arrivalDelay);

  transitionCleanupTimer = window.setTimeout(() => {
    hero.classList.remove('is-diving');
  }, cleanupDelay);
}

enter.addEventListener('click', (event) => {
  event.preventDefault();
  startExperienceTransition();
});

brand.addEventListener('click', (event) => {
  if (!hero.classList.contains('is-reality')) return;
  event.preventDefault();
  window.clearTimeout(transitionTimer);
  window.clearTimeout(transitionCleanupTimer);
  hero.classList.remove('is-reality');
  reality.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    hero.classList.remove('is-transitioning', 'is-diving');
    renderPointerMotion();
  }, 760);
});
