import Swiper from 'swiper/bundle';
document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://paw-hut.b.goit.study/api/feedbacks';
  const container = document.getElementById('feedbacks-container');

  // Функція малювання зірочок (враховує цілі та 0.5 значення)
  function generateStarsHTML(rating) {
    let starsHTML = '';
    const maxStars = 5;
    for (let i = 1; i <= maxStars; i++) {
      if (rating >= i) {
        starsHTML += `<svg class="happy-stories__star fill" viewBox="0 0 24 24" width="16" height="16"><polygon fill="currentColor" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      } else if (rating >= i - 0.5) {
        starsHTML += `
          <svg class="happy-stories__star" viewBox="0 0 24 24" width="16" height="16">
            <defs><linearGradient id="halfGrad"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs>
            <polygon fill="url(#halfGrad)" stroke="currentColor" stroke-width="2" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>`;
      } else {
        starsHTML += `<svg class="happy-stories__star empty" viewBox="0 0 24 24" width="16" height="16"><polygon fill="none" stroke="currentColor" stroke-width="2" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      }
    }
    return `<div class="happy-stories__stars">${starsHTML}</div>`;
  }

  // Запит до серверу
  async function fetchFeedbacks() {
    try {
      const response = await fetch(API_URL);

      // Якщо сервер повернув помилку (наприклад, код 500 чи 404)
      if (!response.ok) throw new Error('Помилка сервера');

      const data = await response.json();
      // Якщо data — це вже масив, беремо його. Якщо об'єкт — шукаємо масив всередині (data.feedbacks або data.data).
      const feedbacksArray = Array.isArray(data)
        ? data
        : data.feedbacks || data.data || [];
      // Перевірка умови ТЗ (мінімум 3 відгуки)
      if (!data || data.length < 3) {
        container.innerHTML =
          '<li class="swiper-slide happy-stories__error">Недостатньо відгуків для відображення.</li>';
        return;
      }
      console.log(feedbacksArray);

      // Очищуємо контейнер від тексту "Завантаження..."
      container.innerHTML = '';

      // Рендеримо картки у структурі <li>
      feedbacksArray.forEach(item => {
        const listItem = document.createElement('li');
        // Поєднуємо класи Swiper та твої власні класи
        listItem.className = 'happy-stories__list-item swiper-slide';

        listItem.innerHTML = `
          ${generateStarsHTML(item.rate || 5)}
          <p class="happy-stories__item-text">“${item.description}”</p>
          <p class="happy-stories__item-user">${item.author}</p>
        `;
        container.appendChild(listItem);
      });

      // Ініціалізація слайдера після успішного рендеру
      initSwiper();
    } catch (error) {
      console.error(error);
      // Якщо запит не вдався — користувач побачить це повідомлення про помилку
      container.innerHTML =
        '<li class="swiper-slide happy-stories__error">Не вдалося завантажити відгуки. Спробуйте пізніше.</li>';
    }
  }

  // Налаштування Swiper під класи в happy-stories.html
  function initSwiper() {
    new Swiper('.happy-stories__swiper', {
      slidesPerView: 1, // 1 картка на мобільних
      spaceBetween: 20,
      grabCursor: true,
      allowTouchMove: true,

      navigation: {
        nextEl: '.swiper-btn-next',
        prevEl: '.swiper-btn-prev',
      },
      pagination: {
        el: '.happy-stories__pagination',
        clickable: true,
        dynamicBullets: true,
      },
      breakpoints: {
        // Від 768px (планшет і десктоп) показує 2 картки в ряд
        768: {
          slidesPerView: 2,
          spaceBetween: 32,
        },
      },
    });
  }

  fetchFeedbacks();
});
