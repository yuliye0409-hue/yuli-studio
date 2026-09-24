const workSection = document.querySelector('#work');
const enterWork = document.querySelector('#work-enter');
const cards = [...document.querySelectorAll('.work-card')];
const filters = [...document.querySelectorAll('.work-filter')];
const modal = document.querySelector('#project-modal');
const modalImage = document.querySelector('#modal-image');
const modalType = document.querySelector('#modal-type');
const modalTitle = document.querySelector('#modal-title');
const modalDescription = document.querySelector('#modal-description');
const modalIndex = document.querySelector('#modal-index');

enterWork?.addEventListener('click', () => {
  workSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
cards.forEach((card, index) => {
  card.style.transitionDelay = `${Math.min(index * .045, .36)}s`;
  revealObserver.observe(card);
});

cards.forEach((card) => {
  const media = card.querySelector('.work-card__media');
  card.addEventListener('pointermove', (event) => {
    const bounds = media.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    media.style.setProperty('--card-rx', `${(-y * 3.6).toFixed(2)}deg`);
    media.style.setProperty('--card-ry', `${(x * 4.6).toFixed(2)}deg`);
  });
  card.addEventListener('pointerleave', () => {
    media.style.setProperty('--card-rx', '0deg');
    media.style.setProperty('--card-ry', '0deg');
  });
  card.querySelector('.work-card__button')?.addEventListener('click', () => openProject(card));
});

filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const category = filter.dataset.filter;
    filters.forEach((item) => {
      const active = item === filter;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
    cards.forEach((card) => {
      const visible = category === 'all' || card.dataset.category === category;
      card.hidden = !visible;
      if (visible) requestAnimationFrame(() => card.classList.add('is-visible'));
    });
  });
});

function openProject(card) {
  const cardIndex = cards.indexOf(card) + 1;
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
});
