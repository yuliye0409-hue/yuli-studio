const workSection = document.querySelector('#work');
const workGrid = document.querySelector('#work-grid');
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
let offset = 0;
let velocity = 0;
let targetOffset = null;
let frameId = null;
let pointerId = null;
let lastPointerX = 0;
let isDragging = false;
let lastMoveTime = 0;
let dragDistance = 0;
let suppressClick = false;

enterWork?.addEventListener('click', () => workSection?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }));

function updateCounter() {
  if (currentLabel) currentLabel.textContent = String(activeIndex + 1).padStart(2, '0');
  if (totalLabel) totalLabel.textContent = String(visibleCards.length).padStart(2, '0');
}

function bounds() {
  if (!workGrid || !visibleCards.length) return { min: 0, max: 0 };
  const gridWidth = workGrid.clientWidth;
  const first = visibleCards[0];
  const last = visibleCards[visibleCards.length - 1];
  const center = (card) => card.offsetLeft + card.offsetWidth / 2;
  const viewportCenter = gridWidth / 2;
  return {
    min: viewportCenter - center(last),
    max: viewportCenter - center(first),
  };
}

function clampOffset(value) {
  const range = bounds();
  return Math.max(range.min, Math.min(range.max, value));
}

function applyOffset() {
  if (!workGrid) return;
  offset = clampOffset(offset);
  workGrid.style.setProperty('--gallery-x', `${offset}px`);
}

function nearestCardIndex() {
  if (!workGrid || !visibleCards.length) return 0;
  const center = workGrid.clientWidth / 2;
  let nearest = 0;
  let distance = Infinity;
  visibleCards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2 + offset;
    const nextDistance = Math.abs(cardCenter - center);
    if (nextDistance < distance) {
      distance = nextDistance;
      nearest = index;
    }
  });
  return nearest;
}

function setActive(index) {
  if (!visibleCards.length) return;
  activeIndex = Math.max(0, Math.min(visibleCards.length - 1, index));
  allCards.forEach((card) => card.classList.toggle('is-active', card === visibleCards[activeIndex]));
  updateCounter();
}

function centerCard(index, immediate = false) {
  if (!workGrid || !visibleCards.length) return;
  const card = visibleCards[Math.max(0, Math.min(visibleCards.length - 1, index))];
  targetOffset = workGrid.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
  if (immediate || reducedMotion) {
    offset = targetOffset;
    targetOffset = null;
    applyOffset();
    setActive(index);
  }
}

function animate() {
  if (targetOffset !== null) {
    const delta = targetOffset - offset;
    offset += delta * (reducedMotion ? 1 : .14);
    if (Math.abs(delta) < .35) {
      offset = targetOffset;
      targetOffset = null;
    }
  } else if (Math.abs(velocity) > .02) {
    offset += velocity;
    velocity *= reducedMotion ? 0 : .9;
  }
  applyOffset();
  const nextIndex = nearestCardIndex();
  if (nextIndex !== activeIndex) setActive(nextIndex);
  frameId = window.requestAnimationFrame(animate);
}

function startAnimation() {
  if (frameId === null) frameId = window.requestAnimationFrame(animate);
}

function moveBy(delta) {
  targetOffset = null;
  const next = Math.max(0, Math.min(visibleCards.length - 1, activeIndex + delta));
  centerCard(next);
  startAnimation();
}

function setFilter(filter) {
  const category = filter.dataset.filter;
  visibleCards = category === 'all' ? allCards : allCards.filter((card) => card.dataset.category === category);
  allCards.forEach((card) => {
    card.hidden = !visibleCards.includes(card);
    card.classList.remove('is-active');
  });
  activeIndex = 0;
  offset = 0;
  targetOffset = null;
  centerCard(0, true);
  setActive(0);
  startAnimation();
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

workSection?.addEventListener('wheel', (event) => {
  if (modal?.classList.contains('is-open')) return;
  event.preventDefault();
  targetOffset = null;
  velocity += event.deltaY * -.7;
  velocity = Math.max(-40, Math.min(40, velocity));
  startAnimation();
}, { passive: false });

workSection?.addEventListener('pointerdown', (event) => {
  if (event.target.closest('.work-filter, .work-intro a, #work-enter')) return;
  pointerId = event.pointerId;
  lastPointerX = event.clientX;
  lastMoveTime = performance.now();
  dragDistance = 0;
  suppressClick = false;
  isDragging = true;
  targetOffset = null;
  workSection.setPointerCapture?.(pointerId);
  workSection.classList.add('is-dragging');
});

workSection?.addEventListener('pointermove', (event) => {
  if (!isDragging || event.pointerId !== pointerId) return;
  const now = performance.now();
  const dx = event.clientX - lastPointerX;
  dragDistance += Math.abs(dx);
  if (dragDistance > 8) suppressClick = true;
  offset += dx;
  velocity = dx / Math.max(1, now - lastMoveTime) * 16;
  lastPointerX = event.clientX;
  lastMoveTime = now;
  applyOffset();
  startAnimation();
});

function stopDragging(event) {
  if (!isDragging || (event && event.pointerId !== pointerId)) return;
  isDragging = false;
  workSection.classList.remove('is-dragging');
  if (event) workSection.releasePointerCapture?.(event.pointerId);
}

workSection?.addEventListener('pointerup', stopDragging);
workSection?.addEventListener('pointercancel', stopDragging);
workSection?.addEventListener('pointerleave', (event) => {
  if (isDragging && event.pointerType === 'mouse') stopDragging(event);
});

allCards.forEach((card) => {
  const media = card.querySelector('.work-card__media');
  card.addEventListener('pointermove', (event) => {
    if (isDragging) return;
    const boundsRect = media.getBoundingClientRect();
    const x = (event.clientX - boundsRect.left) / boundsRect.width - .5;
    const y = (event.clientY - boundsRect.top) / boundsRect.height - .5;
    media.style.setProperty('--card-rx', `${(-y * 2.2).toFixed(2)}deg`);
    media.style.setProperty('--card-ry', `${(x * 3).toFixed(2)}deg`);
  });
  card.addEventListener('pointerleave', () => {
    media.style.setProperty('--card-rx', '0deg');
    media.style.setProperty('--card-ry', '0deg');
  });
  card.querySelector('.work-card__button')?.addEventListener('click', (event) => {
    if (suppressClick) {
      event.preventDefault();
      suppressClick = false;
      return;
    }
    openProject(card);
  });
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
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') moveBy(1);
  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') moveBy(-1);
});

window.addEventListener('resize', () => centerCard(activeIndex, true));
setFilter(document.querySelector('.work-filter.is-active') || filters[0]);
