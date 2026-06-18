// Імпортуємо функцію відправки з нашого єдиного модуля API
import { createOrder } from './api.js';

const adoptModalOverlay = document.getElementById('adoptModalOverlay');
const adoptModalClose = document.getElementById('adoptModalClose');
const adoptForm = document.getElementById('adoptForm');

const fieldName = document.getElementById('fieldName');
const fieldPhone = document.getElementById('fieldPhone');
const inputName = document.getElementById('inputName');
const inputPhone = document.getElementById('inputPhone');
const inputComment = document.getElementById('inputComment');

let currentAnimalId = null;

/* ───────────────── Спільна логіка overlay ───────────────── */
export function openOverlay(overlay) {
  overlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

export function closeOverlay(overlay) {
  overlay.classList.add('hidden');

  const petModalOverlay = document.getElementById('petModalOverlay');
  const stillOpen =
    !adoptModalOverlay.classList.contains('hidden') ||
    (petModalOverlay && !petModalOverlay.classList.contains('hidden'));

  if (!stillOpen) {
    document.body.classList.remove('modal-open');
  }
}

export function openAdoptModal(animalId) {
  currentAnimalId = animalId || currentAnimalId;
  openOverlay(adoptModalOverlay);
  inputName.focus();
}

function closeAdoptModal() {
  closeOverlay(adoptModalOverlay);
  adoptForm.reset();
  fieldName.classList.remove('field--error');
  fieldPhone.classList.remove('field--error');
  const btn = adoptForm.querySelector('.modal__submit');
  btn.disabled = false;
  btn.classList.remove('is-loading');
  btn.textContent = 'Надіслати';
}

adoptModalClose.addEventListener('click', closeAdoptModal);
adoptModalOverlay.addEventListener('click', e => {
  if (e.target === adoptModalOverlay) closeAdoptModal();
});

// Закриття по Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !adoptModalOverlay.classList.contains('hidden')) {
    closeAdoptModal();
  }
});

/* ───────────────── Валідація форми ───────────────── */
function validate() {
  let valid = true;

  if (!inputName.value.trim()) {
    fieldName.classList.add('field--error');
    valid = false;
  } else {
    fieldName.classList.remove('field--error');
  }

  const phone = inputPhone.value.trim();
  if (!phone || !/^[\d\+\-\(\)\s]{7,20}$/.test(phone)) {
    fieldPhone.classList.add('field--error');
    valid = false;
  } else {
    fieldPhone.classList.remove('field--error');
  }

  return valid;
}

inputName.addEventListener('input', () =>
  fieldName.classList.remove('field--error')
);
inputPhone.addEventListener('input', () =>
  fieldPhone.classList.remove('field--error')
);

/* ───────────────── Лоадер на кнопці сабміту ───────────────── */
function setSubmitLoading(btn, isLoading) {
  if (isLoading) {
    btn.disabled = true;
    if (!btn.dataset.originalText) {
      btn.dataset.originalText = btn.textContent;
    }
    btn.innerHTML =
      '<span class="btn-spinner" aria-hidden="true"></span><span>Надсилання…</span>';
    btn.classList.add('is-loading');
  } else {
    btn.disabled = false;
    btn.classList.remove('is-loading');
    btn.textContent = btn.dataset.originalText || 'Надіслати';
  }
}

/* ───────────────── Сабміт форми (Виправлений) ───────────────── */
adoptForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validate()) return;

  const btn = adoptForm.querySelector('.modal__submit');
  setSubmitLoading(btn, true);

  const payload = {
    name: inputName.value.trim(),
    phone: inputPhone.value.trim(),
    animalId: currentAnimalId,
  };

  const comment = inputComment.value.trim();
  if (comment) {
    payload.comment = comment;
  }

  try {
    // Динамічно завантажуємо тільки SweetAlert2, бо Axios вже працює через модуль api.js
    const swalModule = await import('sweetalert2');
    const Swal = swalModule.default;

    // Виклик винесеної функції замість прямого axios.post
    const orderData = await createOrder(payload);
    console.log('orderData :>> ', orderData);

    // Показуємо красиве вікно успіху
    await Swal.fire({
      icon: 'success',
      title: 'Заявку надіслано!',
      text: 'Ми звʼяжемося з вами найближчим часом.',
      confirmButtonColor: '#9b896a',
    });

    closeAdoptModal();
  } catch (err) {
    console.error(err);

    let Swal;
    try {
      const swalModule = await import('sweetalert2');
      Swal = swalModule.default;
    } catch {
      Swal = null;
    }

    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Не вдалося надіслати заявку.';

    if (Swal) {
      await Swal.fire({
        icon: 'error',
        title: 'Помилка',
        text: errorMessage,
        confirmButtonColor: '#9b896a',
      });
    } else {
      alert(`Помилка: ${errorMessage}`);
    }

    setSubmitLoading(btn, false);
  }
});
