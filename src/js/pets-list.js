// Секція «Наші хвостики» — завантаження, фільтрація та пагінація карток.

const API_BASE = 'https://paw-hut.b.goit.study/api';

// Фіксований порядок кнопок фільтрів після «Всі»
const CATEGORY_ORDER = [
  'Собаки',
  'Коти',
  'Кролики',
  'Гризуни',
  'Птахи',
  'Тварини з особливими потребами',
  'Терміново шукають дім',
];

// DOM-елементи секції
const refs = {
  filtersContainer: document.querySelector('.pets__filters'),
  petsList: document.querySelector('.pets__list'),
  loadMoreWrapper: document.querySelector('.pets__actions'),
  loadMoreBtn: document.querySelector('.pets__load-more'),
  loader: document.querySelector('.pets__loader'),
  spinnerRoot: document.querySelector('.pets__loader-spinner'),
};

// Поточний стан пагінації та фільтра
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

// Тексти toast-повідомлень для користувача
const TOAST_MESSAGES = {
  loadFailed: 'Не вдалося завантажити список. Спробуйте ще раз.',
  filterFailed: 'Не вдалося застосувати фільтр. Спробуйте ще раз.',
  loadMoreFailed: 'Не вдалося показати більше карток. Спробуйте ще раз.',
  updateFailed: 'Не вдалося оновити список. Спробуйте ще раз.',
  listEnd: 'Це всі тваринки в цій категорії.',
};

const spinnerOptions = {
  lines: 12,
  length: 7,
  width: 4,
  radius: 10,
  color: '#88765c',
};

// Показує або ховає лоадер і блокує скрол сторінки
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

// Плавно ховає toast і видаляє його з DOM
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

// Показує toast-повідомлення (помилка або інфо для користувача)
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

// Кількість карток на сторінці: 9 на desktop, 8 на mobile/tablet
function getItemsPerPage() {
  return window.innerWidth >= 1280 ? 9 : 8;
}

// Запит категорій з API
async function fetchCategories() {
  const response = await fetch(`${API_BASE}/categories`);

  if (!response.ok) {
    throw new Error(`Categories request failed: ${response.status}`);
  }

  return response.json();
}

// Запит тварин з API (page, limit, categoryId)
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

// Створює одну кнопку фільтра категорії
function createFilterButton(name, categoryId = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pets__filter-btn';
  button.textContent = name;
  button.dataset.categoryId = categoryId;
  return button;
}

// Сортує категорії за порядком із макету
function sortCategories(categories) {
  return [...categories].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.name);
    const indexB = CATEGORY_ORDER.indexOf(b.name);

    return (
      (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB)
    );
  });
}

// Додає кнопки категорій у блок фільтрів
function renderCategories(categories) {
  const fragment = document.createDocumentFragment();

  sortCategories(categories).forEach(({ _id, name }) => {
    fragment.appendChild(createFilterButton(name, _id));
  });

  refs.filtersContainer.appendChild(fragment);
}

// Збирає HTML однієї картки тварини
function createPetCard(animal) {
  const card = document.createElement('li');
  card.className = 'pet-card';
  card.dataset.id = animal._id;

  const img = document.createElement('img');
  img.className = 'pet-card__img';

  // Оптимізація зображення через weserv (webp, менший розмір)
  const optimizedImage = `https://images.weserv.nl/?url=${encodeURIComponent(
    animal.image
  )}&w=311&output=webp&q=80`;

  img.src = optimizedImage;
  img.alt = animal.name;
  img.loading = 'lazy';

  // srcset для чіткішого зображення на Retina-екранах
  const optimizedImage2x = `https://images.weserv.nl/?url=${encodeURIComponent(
    animal.image
  )}&w=622&output=webp&q=80`;
  img.srcset = `${optimizedImage} 1x, ${optimizedImage2x} 2x`;

  img.setAttribute('width', '311');
  img.setAttribute('height', '245');

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

// Малює картки в списку (заміна або додавання)
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

// Керує видимістю та станом кнопки «Показати більше»
function updateLoadMoreButton() {
  if (!refs.loadMoreBtn || !refs.loadMoreWrapper) return;

  const renderedCount = refs.petsList.children.length;
  const hasMore = renderedCount < state.totalItems;
  const isLoading = !refs.loader.classList.contains('hidden');

  refs.loadMoreWrapper.classList.toggle('hidden', !hasMore || isLoading);
  refs.loadMoreBtn.disabled = !hasMore || isLoading;
}

// Примусово ховає кнопку пагінації (помилка або кінець списку)
function hideLoadMoreButton() {
  if (!refs.loadMoreBtn || !refs.loadMoreWrapper) return;

  refs.loadMoreWrapper.classList.add('hidden');
  refs.loadMoreBtn.disabled = true;
}

// Дані останнього запиту тварин (для модалки «Дізнатись більше»)
export let animalObj = {};

// Завантажує порцію тварин і оновлює список на сторінці
async function loadAnimals({ reset = false, append = false } = {}) {
  if (reset) {
    state.page = 1;
  }

  const data = await fetchAnimals();
  state.totalItems = data.totalItems;
  animalObj = data;
  renderPetCards(data.animals, { append });
  updateLoadMoreButton();

  if (append) {
    const renderedCount = refs.petsList.children.length;

    if (renderedCount >= state.totalItems) {
      hideLoadMoreButton();
      showToast(TOAST_MESSAGES.listEnd);
    }
  }
}

// Перезавантажує всі вже відкриті сторінки (після зміни ширини екрана)
async function reloadAnimalsForCurrentPages() {
  const pagesLoaded = state.page;

  await toggleLoader(true);

  let requestFailed = false;

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
    requestFailed = true;
    showToast(TOAST_MESSAGES.updateFailed);
  } finally {
    await toggleLoader(false);
    if (requestFailed) hideLoadMoreButton();
  }
}

// Реагує на перехід між 8 і 9 картками при resize
function handleViewportResize() {
  if (!isPetsListReady) return;

  const currentItemsPerPage = getItemsPerPage();

  if (currentItemsPerPage === lastItemsPerPage) return;

  lastItemsPerPage = currentItemsPerPage;
  reloadAnimalsForCurrentPages();
}

// Підписує обробник resize з невеликою затримкою
function bindResizeEvents() {
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleViewportResize, 200);
  });
}

// Вмикає активний стиль на обраній кнопці фільтра
function setActiveFilter(activeButton) {
  refs.filtersContainer
    .querySelectorAll('.pets__filter-btn')
    .forEach(btn => btn.classList.toggle('is-active', btn === activeButton));
}

// Обробник кліку по фільтру категорії
async function onFiltersClick(event) {
  const button = event.target.closest('.pets__filter-btn');
  if (!button || button.classList.contains('is-active')) return;

  const previousActive = refs.filtersContainer.querySelector(
    '.pets__filter-btn.is-active'
  );
  const previousCategoryId = state.categoryId;

  setActiveFilter(button);
  state.categoryId = button.dataset.categoryId || '';

  let requestFailed = false;

  try {
    await toggleLoader(true);
    await loadAnimals({ reset: true });
  } catch {
    requestFailed = true;
    setActiveFilter(previousActive);
    state.categoryId = previousCategoryId;
    showToast(TOAST_MESSAGES.filterFailed);
  } finally {
    await toggleLoader(false);
    if (requestFailed) hideLoadMoreButton();
  }
}

// Підписує кліки по фільтрах
function bindFiltersEvents() {
  refs.filtersContainer.addEventListener('click', onFiltersClick);
}

// Плавний скрол до потрібного елемента на сторінці
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

// Прокручує до першої нової картки після load more
function scrollToFirstNewCard(previousCount) {
  const firstNewCard = refs.petsList.children[previousCount];
  if (!firstNewCard) return;

  smoothScrollToElement(firstNewCard);
}

// Обробник кліку «Показати більше»
async function onLoadMoreClick() {
  if (refs.loadMoreBtn.disabled) return;

  const previousCount = refs.petsList.children.length;
  state.page += 1;

  let requestFailed = false;

  try {
    await toggleLoader(true);
    await loadAnimals({ append: true });
    scrollToFirstNewCard(previousCount);
  } catch {
    requestFailed = true;
    state.page -= 1;
    showToast(TOAST_MESSAGES.loadMoreFailed);
  } finally {
    await toggleLoader(false);
    if (requestFailed) hideLoadMoreButton();
    refs.loadMoreBtn.blur();
  }
}

// Підписує клік по кнопці пагінації
function bindLoadMoreEvents() {
  refs.loadMoreBtn.addEventListener('click', onLoadMoreClick);
}

// Скидає список до першої порції карток (8/9 шт.)
async function resetToFirstPage() {
  const isFirstPageOnly =
    state.page === 1 && refs.petsList.children.length <= getItemsPerPage();

  if (isFirstPageOnly) return;

  let requestFailed = false;

  try {
    await toggleLoader(true);
    await loadAnimals({ reset: true });

    const firstCard = refs.petsList.firstElementChild;
    if (firstCard) {
      smoothScrollToElement(firstCard);
    }
  } catch {
    requestFailed = true;
    showToast(TOAST_MESSAGES.updateFailed);
  } finally {
    await toggleLoader(false);
    if (requestFailed) hideLoadMoreButton();
  }
}

// Esc — повернути перший екран карток
function onEscapeKeydown(event) {
  if (event.key !== 'Escape' || !isPetsListReady) return;

  resetToFirstPage();
}

// Підписує клавішу Escape
function bindEscapeEvent() {
  document.addEventListener('keydown', onEscapeKeydown);
}

// Старт секції: категорії, перша порція карток, обробники подій
async function initPetsList() {
  bindFiltersEvents();
  bindLoadMoreEvents();
  bindResizeEvents();
  bindEscapeEvent();

  let requestFailed = false;

  try {
    await toggleLoader(true);

    const categories = await fetchCategories();
    renderCategories(categories);

    await loadAnimals({ reset: true });
    lastItemsPerPage = getItemsPerPage();
    isPetsListReady = true;
  } catch {
    requestFailed = true;
    showToast(TOAST_MESSAGES.loadFailed);
  } finally {
    await toggleLoader(false);
    if (requestFailed) hideLoadMoreButton();
  }
}

document.addEventListener('DOMContentLoaded', initPetsList);
