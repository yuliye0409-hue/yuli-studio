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
let visibleCards = allCards;
let activeIndex = 0;

enterWork?.addEventListener('click', () => workSection?.scrollIntoView({ behavior: 'auto', block: 'start' }));

function updateCounter() {
  if (currentLabel) currentLabel.textContent = String(activeIndex + 1).padStart(2, '0');
  if (totalLabel) totalLabel.textContent = String(visibleCards.length).padStart(2, '0');
}

function setActive(index) {
  if (!visibleCards.length) return;
  activeIndex = (index + visibleCards.length) % visibleCards.length;
  allCards.forEach((card) => {
    const isCurrent = card === visibleCards[activeIndex];
    card.classList.toggle('is-active', isCurrent);
    card.classList.remove('is-before', 'is-after');
    card.hidden = !isCurrent;
  });
  const activeCard = visibleCards[activeIndex];
  const activeImage = activeCard?.querySelector('img');
  if (activeImage) {
    activeImage.loading = 'eager';
    activeImage.fetchPriority = 'high';
  }
  updateCounter();
}

function setFilter(filter) {
  const category = filter.dataset.filter;
  visibleCards = category === 'all' ? allCards : allCards.filter((card) => card.dataset.category === category);
  allCards.forEach((card) => card.hidden = true);
  activeIndex = 0;
  setActive(0);
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

allCards.forEach((card) => card.querySelector('.work-card__button')?.addEventListener('click', () => openProject(card)));

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
});

setFilter(document.querySelector('.work-filter.is-active') || filters[0]);
