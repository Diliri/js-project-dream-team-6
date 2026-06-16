import Swiper from 'swiper/bundle';
var swiper = new Swiper('.mySwiper', {
  pagination: {
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
