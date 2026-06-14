const scrollToTopBtn = document.getElementById('scrollToTopBtn');

window.addEventListener('scroll', () => {
  // Перевіряємо, на скільки пікселів сторінка прокручена вниз
  if (window.scrollY > 300) {
    // Якщо більше ніж 300px — показуємо кнопку
    scrollToTopBtn.classList.add('is-visible');
  } else {
    // Якщо повернулися на самий верх — ховаємо
    scrollToTopBtn.classList.remove('is-visible');
  }
});