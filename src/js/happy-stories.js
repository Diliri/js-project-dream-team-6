import { fetchFeedbacks } from './api.js'; // Імпорт функції запиту

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('feedbacks-container');
  const controlsBlock = document.querySelector('.happy-stories__controls');

  function generateStarsHTML(rating) {
    let starsHTML = '';
    const maxStars = 5;

    for (let i = 1; i <= maxStars; i++) {
      if (rating >= i) {
        starsHTML += `<svg class="happy-stories__star fill" viewBox="0 0 24 24" width="20" height="19"><polygon fill="currentColor" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      } else if (rating >= i - 0.5) {
        starsHTML += `
        <svg class="happy-stories__star" viewBox="0 0 24 24" width="20" height="19">
          <defs><linearGradient id="halfGrad"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs>
          <polygon fill="url(#halfGrad)" stroke="currentColor" stroke-width="2" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>`;
      } else {
        starsHTML += `<svg class="happy-stories__star empty" viewBox="0 0 24 24" width="20" height="19"><polygon fill="none" stroke="currentColor" stroke-width="2" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      }
    }
    return `<div class="happy-stories__stars">${starsHTML}</div>`;
  }

  async function loadFeedbacks() {
    try {
      const data = await fetchFeedbacks();

      // Перевірка на масив
      const feedbacksArray = Array.isArray(data)
        ? data
        : data.feedbacks || data.data || [];

      if (feedbacksArray.length < 3) {
        throw new Error('Недостатньо відгуків');
      }

      container.innerHTML = '';

      feedbacksArray.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'happy-stories__list-item swiper-slide';
        listItem.innerHTML = `
          ${generateStarsHTML(item.rate || 5)}
          <p class="happy-stories__item-text">“${item.description}”</p>
          <p class="happy-stories__item-user">${item.author}</p>
        `;
        container.appendChild(listItem);
      });

      // Є контроли, якщо раніше вони ховалися, та запускається слайдер
      if (controlsBlock) controlsBlock.style.display = 'flex';
      await initSwiperLazy();
    } catch (error) {
      console.error(error);
      container.innerHTML =
        '<li class="swiper-slide happy-stories__error">Не вдалося завантажити відгуки. Спробуйте пізніше.</li>';

      // ХОВАЄМО кнопки навігації та пагінацію, якщо сталася помилка
      if (controlsBlock) {
        controlsBlock.style.display = 'none';
      }
    }
  }

  async function initSwiperLazy() {
    const { default: Swiper } = await import('swiper');
    const { Navigation, Pagination } = await import('swiper/modules');

    new Swiper('.happy-stories__swiper', {
      modules: [Navigation, Pagination],
      slidesPerView: 1,
      spaceBetween: 20,
      grabCursor: true,

      navigation: {
        nextEl: '.happy-stories__btn--next',
        prevEl: '.happy-stories__btn:not(.happy-stories__btn--next)',
      },
      pagination: {
        el: '.happy-stories__pagination',
        clickable: true,
        dynamicBullets: true, // ТЗ про "динамічну пагінацію" (крапки зменшуються)
      },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 32 },
        1440: { slidesPerView: 4, spaceBetween: 32 },
      },
    });
  }

  loadFeedbacks();
});
