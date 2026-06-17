// ПРИБРАЛИ СТАТИЧНИЙ ІМПОРТ spin.js З ПЕРШОГО РЯДКА

const API_BASE = 'https://paw-hut.b.goit.study/api';

const CATEGORY_ORDER = [
  'Собаки',
  'Коти',
  'Кролики',
  'Гризуни',
  'Птахи',
  'Тварини з особливими потребами',
  'Терміново шукають дім',
];

const refs = {
  filtersContainer: document.querySelector('.pets__filters'),
  petsList: document.querySelector('.pets__list'),
  loadMoreWrapper: document.querySelector('.pets__actions'),
  loadMoreBtn: document.querySelector('.pets__load-more'),
  loader: document.querySelector('.pets__loader'),
  spinnerRoot: document.querySelector('.pets__loader-spinner'),
};

const state = {
  page: 1,
  categoryId: '',
  totalItems: 0,
};

let spinner = null;
let toastTimeout = null;
let resizeTimeout = null;
let lastItemsPerPage = getItemsPerPage();
let isPetsListReady = false;

const TOAST_DURATION = 5000;

const spinnerOptions = {
  lines: 12,
  length: 7,
  width: 4,
  radius: 10,
  color: '#88765c',
};

// ОПТИМІЗОВАНА ФУНКЦІЯ ЛОАДЕРА
export async function toggleLoader(isVisible) {
  if (!refs.loader) return;

  // Класи перемикаємо миттєво, щоб інтерфейс зразу реагував (CSS-бекграунд чи розмиття)
  refs.loader.classList.toggle('hidden', !isVisible);
  document.body.classList.toggle('is-loading', isVisible);
  updateLoadMoreButton();

  if (isVisible) {
    if (!spinner && refs.spinnerRoot) {
      try {
        // ЛІНИВИЙ ІМПОРТ: завантажуємо бібліотеку тільки в момент появи лоадера
        const { Spinner } = await import('./spin.js');

        // Перевіряємо ще раз isVisible, бо поки скрипт вантажився, запит міг уже завершитись
        if (refs.loader.classList.contains('hidden')) return;

        if (!spinner) {
          spinner = new Spinner(spinnerOptions).spin(refs.spinnerRoot);
        }
      } catch (err) {
        console.error('Не вдалося завантажити спінер:', err);
      }
    }
    return;
  }

  // Якщо лоадер ховаємо, зупиняємо спінер
  if (spinner) {
    spinner.stop();
    spinner = null;
  }
}

function hideToast(toast) {
  if (!toast) return;

  toast.classList.remove('is-visible');
  toast.addEventListener(
    'transitionend',
    () => {
      toast.remove();
    },
    { once: true }
  );
}

function showToast(message) {
  const existingToast = document.querySelector('.pets-toast');
  if (existingToast) {
    hideToast(existingToast);
  }

  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }

  const toast = document.createElement('div');
  toast.className = 'pets-toast';
  toast.setAttribute('role', 'alert');

  const messageEl = document.createElement('p');
  messageEl.className = 'pets-toast__message';
  messageEl.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'pets-toast__close';
  closeBtn.setAttribute('aria-label', 'Закрити');
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }
    hideToast(toast);
  });

  toast.append(messageEl, closeBtn);
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  });

  toastTimeout = setTimeout(() => {
    hideToast(toast);
    toastTimeout = null;
  }, TOAST_DURATION);
}

function getItemsPerPage() {
  return window.innerWidth >= 1280 ? 9 : 8;
}

async function fetchCategories() {
  const response = await fetch(`${API_BASE}/categories`);

  if (!response.ok) {
    throw new Error(`Categories request failed: ${response.status}`);
  }

  return response.json();
}

async function fetchAnimals() {
  const limit = getItemsPerPage();
  const params = new URLSearchParams({
    page: String(state.page),
    limit: String(limit),
  });

  if (state.categoryId) {
    params.set('categoryId', state.categoryId);
  }

  const response = await fetch(`${API_BASE}/animals?${params}`);

  if (!response.ok) {
    throw new Error(`Animals request failed: ${response.status}`);
  }

  return response.json();
}

function createFilterButton(name, categoryId = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pets__filter-btn';
  button.textContent = name;
  button.dataset.categoryId = categoryId;
  return button;
}

function sortCategories(categories) {
  return [...categories].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.name);
    const indexB = CATEGORY_ORDER.indexOf(b.name);

    return (
      (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB)
    );
  });
}

function renderCategories(categories) {
  const fragment = document.createDocumentFragment();

  sortCategories(categories).forEach(({ _id, name }) => {
    fragment.appendChild(createFilterButton(name, _id));
  });

  refs.filtersContainer.appendChild(fragment);
}

function createPetCard(animal) {
  const card = document.createElement('li');
  card.className = 'pet-card';

  const img = document.createElement('img');
  img.className = 'pet-card__img';
  img.src = animal.image;
  img.alt = animal.name;
  img.loading = 'lazy';

  const top = document.createElement('div');
  top.className = 'pet-card__top';

  const main = document.createElement('div');
  main.className = 'pet-card__main';

  const species = document.createElement('p');
  species.className = 'pet-card__species';
  species.textContent = animal.species;

  const name = document.createElement('h3');
  name.className = 'pet-card__name';
  name.textContent = animal.name;

  main.append(species, name);

  const tags = document.createElement('div');
  tags.className = 'pet-card__tags';

  animal.categories.forEach(({ name: tagName }) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = tagName;
    tags.appendChild(tag);
  });

  top.append(main, tags);

  const footer = document.createElement('div');
  footer.className = 'pet-card__footer';

  const meta = document.createElement('div');
  meta.className = 'pet-card__meta';

  const age = document.createElement('span');
  age.textContent = animal.age;

  const gender = document.createElement('span');
  gender.textContent = animal.gender;

  meta.append(age, gender);

  const description = document.createElement('p');
  description.className = 'pet-card__description';
  description.textContent = animal.shortDescription;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pet-card__btn';
  btn.textContent = 'Дізнатись більше';
  btn.dataset.animalId = animal._id;

  footer.append(meta, description, btn);
  card.append(img, top, footer);

  return card;
}

function renderPetCards(animals, { append = false } = {}) {
  if (!append) {
    refs.petsList.innerHTML = '';
  }

  const fragment = document.createDocumentFragment();

  animals.forEach(animal => {
    fragment.appendChild(createPetCard(animal));
  });

  refs.petsList.appendChild(fragment);
}

function updateLoadMoreButton() {
  if (!refs.loadMoreBtn || !refs.loadMoreWrapper) return;

  const renderedCount = refs.petsList.children.length;
  const hasMore = renderedCount < state.totalItems;
  const isLoading = !refs.loader.classList.contains('hidden');

  refs.loadMoreWrapper.classList.toggle('hidden', !hasMore || isLoading);
  refs.loadMoreBtn.disabled = !hasMore || isLoading;
}

async function loadAnimals({ reset = false, append = false } = {}) {
  if (reset) {
    state.page = 1;
  }

  const data = await fetchAnimals();
  state.totalItems = data.totalItems;

  renderPetCards(data.animals, { append });
  updateLoadMoreButton();
}

async function reloadAnimalsForCurrentPages() {
  const pagesLoaded = state.page;

  await toggleLoader(true);

  try {
    state.page = 1;
    const firstPage = await fetchAnimals();
    state.totalItems = firstPage.totalItems;
    renderPetCards(firstPage.animals, { append: false });

    for (let page = 2; page <= pagesLoaded; page += 1) {
      state.page = page;
      const data = await fetchAnimals();
      renderPetCards(data.animals, { append: true });
    }

    updateLoadMoreButton();
  } catch {
    showToast('Не вдалося оновити список тварин. Спробуйте пізніше.');
  } finally {
    await toggleLoader(false);
  }
}

function handleViewportResize() {
  if (!isPetsListReady) return;

  const currentItemsPerPage = getItemsPerPage();

  if (currentItemsPerPage === lastItemsPerPage) return;

  lastItemsPerPage = currentItemsPerPage;
  reloadAnimalsForCurrentPages();
}

function bindResizeEvents() {
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleViewportResize, 200);
  });
}

function setActiveFilter(activeButton) {
  refs.filtersContainer
    .querySelectorAll('.pets__filter-btn')
    .forEach(btn => btn.classList.toggle('is-active', btn === activeButton));
}

async function onFiltersClick(event) {
  const button = event.target.closest('.pets__filter-btn');
  if (!button || button.classList.contains('is-active')) return;

  const previousActive = refs.filtersContainer.querySelector(
    '.pets__filter-btn.is-active'
  );
  const previousCategoryId = state.categoryId;

  setActiveFilter(button);
  state.categoryId = button.dataset.categoryId || '';

  try {
    await toggleLoader(true);
    await loadAnimals({ reset: true });
  } catch {
    setActiveFilter(previousActive);
    state.categoryId = previousCategoryId;
    showToast('Не вдалося завантажити тварин. Спробуйте пізніше.');
  } finally {
    await toggleLoader(false);
  }
}

function bindFiltersEvents() {
  refs.filtersContainer.addEventListener('click', onFiltersClick);
}

function smoothScrollToElement(element, duration = 1200) {
  const offset = 24;
  const targetY = element.getBoundingClientRect().top + window.scrollY - offset;
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  const easeInOutCubic = progress =>
    progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

  const animateScroll = currentTime => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    window.scrollTo(0, startY + distance * easeInOutCubic(progress));

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
}

function scrollToFirstNewCard(previousCount) {
  const firstNewCard = refs.petsList.children[previousCount];
  if (!firstNewCard) return;

  smoothScrollToElement(firstNewCard);
}

async function onLoadMoreClick() {
  if (refs.loadMoreBtn.disabled) return;

  const previousCount = refs.petsList.children.length;
  state.page += 1;

  try {
    await toggleLoader(true);
    await loadAnimals({ append: true });
    scrollToFirstNewCard(previousCount);
  } catch {
    state.page -= 1;
    showToast('Не вдалося завантажити ще тварин. Спробуйте пізніше.');
  } finally {
    await toggleLoader(false);
    refs.loadMoreBtn.blur();
  }
}

function bindLoadMoreEvents() {
  refs.loadMoreBtn.addEventListener('click', onLoadMoreClick);
}

async function resetToFirstPage() {
  const isFirstPageOnly =
    state.page === 1 && refs.petsList.children.length <= getItemsPerPage();

  if (isFirstPageOnly) return;

  try {
    await toggleLoader(true);
    await loadAnimals({ reset: true });

    const firstCard = refs.petsList.firstElementChild;
    if (firstCard) {
      smoothScrollToElement(firstCard);
    }
  } catch {
    showToast('Не вдалося оновити список тварин. Спробуйте пізніше.');
  } finally {
    await toggleLoader(false);
  }
}

function onEscapeKeydown(event) {
  if (event.key !== 'Escape' || !isPetsListReady) return;

  resetToFirstPage();
}

function bindEscapeEvent() {
  document.addEventListener('keydown', onEscapeKeydown);
}

async function initPetsList() {
  bindFiltersEvents();
  bindLoadMoreEvents();
  bindResizeEvents();
  bindEscapeEvent();

  try {
    await toggleLoader(true);

    const categories = await fetchCategories();
    renderCategories(categories);

    await loadAnimals({ reset: true });
    lastItemsPerPage = getItemsPerPage();
    isPetsListReady = true;
  } catch {
    showToast('Не вдалося завантажити дані. Спробуйте пізніше.');
  } finally {
    await toggleLoader(false);
  }
}

document.addEventListener('DOMContentLoaded', initPetsList);
