const workSection = document.querySelector('#work');
const enterWork = document.querySelector('#work-enter');
const allCards = [...document.querySelectorAll('.work-card')];
const filters = [...document.querySelectorAll('.work-filter')];
const currentLabel = document.querySelector('#work-current');
const totalLabel = document.querySelector('#work-total');
const modal = document.querySelector('#project-modal');
const modalImage = document.querySelector('#modal-image');
const modalType = document.querySelector('#modal-type');
const modalTitle = document.querySelector('#modal-title');
const modalDescription = document.querySelector('#modal-description');
const modalIndex = document.querySelector('#modal-index');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let visibleCards = allCards;
let activeIndex = 0;
let switchLocked = false;
let touchStartY = null;

enterWork?.addEventListener('click', () => workSection?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }));

function updateCounter() {
  if (currentLabel) currentLabel.textContent = String(activeIndex + 1).padStart(2, '0');
  if (totalLabel) totalLabel.textContent = String(visibleCards.length).padStart(2, '0');
}

function setActive(index, direction = 1, immediate = false) {
  if (!visibleCards.length) return;
  activeIndex = (index + visibleCards.length) % visibleCards.length;
  allCards.forEach((card) => {
    const isCurrent = card === visibleCards[activeIndex];
    card.classList.toggle('is-active', isCurrent);
    card.classList.toggle('is-before', !isCurrent && visibleCards.indexOf(card) < activeIndex);
    card.classList.toggle('is-after', !isCurrent && visibleCards.indexOf(card) > activeIndex);
    card.style.setProperty('--slide-direction', direction > 0 ? '1' : '-1');
    if (immediate) card.style.transition = 'none';
    else card.style.removeProperty('transition');
  });
  updateCounter();
  if (immediate) window.requestAnimationFrame(() => allCards.forEach((card) => card.style.removeProperty('transition')));
}

function switchProject(direction) {
  if (switchLocked || !visibleCards.length) return;
  switchLocked = true;
  setActive(activeIndex + direction, direction);
  window.setTimeout(() => { switchLocked = false; }, reducedMotion ? 30 : 720);
}

workSection?.addEventListener('wheel', (event) => {
  if (modal?.classList.contains('is-open')) return;
  if (Math.abs(event.deltaY) < 8) return;
  event.preventDefault();
  switchProject(event.deltaY > 0 ? 1 : -1);
}, { passive: false });

workSection?.addEventListener('touchstart', (event) => {
  touchStartY = event.touches[0]?.clientY ?? null;
}, { passive: true });

workSection?.addEventListener('touchend', (event) => {
  if (touchStartY === null) return;
  const endY = event.changedTouches[0]?.clientY ?? touchStartY;
  const distance = touchStartY - endY;
  touchStartY = null;
  if (Math.abs(distance) > 34) switchProject(distance > 0 ? 1 : -1);
}, { passive: true });

function setFilter(filter) {
  const category = filter.dataset.filter;
  visibleCards = category === 'all' ? allCards : allCards.filter((card) => card.dataset.category === category);
  allCards.forEach((card) => {
    card.hidden = !visibleCards.includes(card);
    card.classList.remove('is-active', 'is-before', 'is-after');
  });
  activeIndex = 0;
  setActive(0, 1, true);
}

filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    filters.forEach((item) => {
      const active = item === filter;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
    setFilter(filter);
  });
});

allCards.forEach((card) => {
  const media = card.querySelector('.work-card__media');
  card.addEventListener('pointermove', (event) => {
    const bounds = media.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    media.style.setProperty('--card-rx', `${(-y * 2.2).toFixed(2)}deg`);
    media.style.setProperty('--card-ry', `${(x * 3).toFixed(2)}deg`);
  });
  card.addEventListener('pointerleave', () => {
    media.style.setProperty('--card-rx', '0deg');
    media.style.setProperty('--card-ry', '0deg');
  });
  card.querySelector('.work-card__button')?.addEventListener('click', () => openProject(card));
});

function openProject(card) {
  const cardIndex = allCards.indexOf(card) + 1;
  modalImage.src = card.dataset.image;
  modalImage.alt = `${card.dataset.title} 项目预览`;
  modalType.textContent = card.dataset.type;
  modalTitle.textContent = card.dataset.title;
  modalDescription.textContent = card.dataset.description;
  modalIndex.textContent = `PROJECT ${String(cardIndex).padStart(2, '0')} / YULI STUDIO`;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  modal.querySelector('.project-modal__close')?.focus();
}

function closeProject() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

modal?.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', closeProject));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal?.classList.contains('is-open')) closeProject();
  if (modal?.classList.contains('is-open')) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') switchProject(1);
  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') switchProject(-1);
});

setFilter(document.querySelector('.work-filter.is-active') || filters[0]);
