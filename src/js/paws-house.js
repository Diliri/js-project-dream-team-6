// Переносимо ініціалізацію в асинхронну функцію для lazy loading
async function initPawsSwiper() {
  // Завантажуємо тільки базове ядро Swiper та лише потрібні модулі
  const { default: Swiper } = await import('swiper');
  const { Pagination, Navigation, Keyboard } = await import('swiper/modules');

  // Ініціалізуємо слайдер
  new Swiper('.mySwiper', {
    // Обов'язково передаємо масив підключених модулів
    modules: [Pagination, Navigation, Keyboard],

    pagination: {
      //el: '.paws-house-pagination-dots', // <-- Тепер Swiper шукає саме ваш унікальний контейнер
      //clickable: true,
      el: '.swiper-pagination',
      dynamicBullets: false,
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
      pageUpDown: false,
    },
  });
}

// Запускаємо функцію після завантаження сторінки
document.addEventListener('DOMContentLoaded', () => {
  initPawsSwiper();
});
