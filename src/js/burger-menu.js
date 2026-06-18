// Связываем кнопку напарницы с вашим бургер-меню
const openMenuBtn = document.querySelector('#menu-open');       // Кнопка из хедера 
const closeMenuBtn = document.querySelector('#closeMenuBtn');   // Ваш крестик
const mobileMenu = document.querySelector('#burgerMenu');       // Ваше меню
const menuLinks = document.querySelectorAll('.burger-menu__link, .burger-menu__btn');   

if (openMenuBtn && closeMenuBtn && mobileMenu) {
  // Відкрити меню
  openMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });

  // Закрити меню
  closeMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
  });

  // Закрити при кліку на посилання
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}