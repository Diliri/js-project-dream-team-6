import axios from 'axios';
import Swal from 'sweetalert2';

    const adoptModalOverlay = document.getElementById('adoptModalOverlay');
    const adoptModalClose   = document.getElementById('adoptModalClose');
    const adoptForm = document.getElementById('adoptForm');
    
    const openAdoptModalBtn = document.getElementById('openAdoptModalBtn');

    const fieldName    = document.getElementById('fieldName');
    const fieldPhone   = document.getElementById('fieldPhone');
    const inputName    = document.getElementById('inputName');
    const inputPhone   = document.getElementById('inputPhone');
    const inputComment = document.getElementById('inputComment');
    
    let currentAnimalId = null;

    function openAdoptModal(animalId) {
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
      btn.textContent = 'Надіслати';
    }

    adoptModalClose.addEventListener('click', closeAdoptModal);
    adoptModalOverlay.addEventListener('click', (e) => {
      if (e.target === adoptModalOverlay) closeAdoptModal();
    });

    /* ─── Логіка кліку на кнопку "Відкрити модальне вікно" ─── */
  if (openAdoptModalBtn) {
    openAdoptModalBtn.addEventListener('click', () => {
    // Передаємо тестовий ID, щоб бекенд успішно приймав форму при тестах
    openAdoptModal('65c2b0c3f5963c0012345678'); 
  });
}

    /* ───────────────── Спільна логіка overlay ───────────────── */
    function openOverlay(overlay) {
      overlay.classList.remove('hidden');
      document.body.classList.add('modal-open');
    }

    function closeOverlay(overlay) {
      overlay.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }

    // Закриття по Escape
    document.addEventListener('keydown', (e) => {
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

    inputName.addEventListener('input', () => fieldName.classList.remove('field--error'));
    inputPhone.addEventListener('input', () => fieldPhone.classList.remove('field--error'));

    /* ───────────────── Сабміт форми ───────────────── */
    adoptForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) return;

      const btn = adoptForm.querySelector('.modal__submit');
      btn.disabled = true;
      btn.textContent = 'Надсилання…';

      const payload = {
        name: inputName.value.trim(),
        phone: inputPhone.value.trim(),
        comment: inputComment.value.trim(),
        animalId: currentAnimalId
      };

      try {
        const response = await axios.post('https://paw-hut.b.goit.study/api/orders', payload);

        const orderData = response.data;
    console.log('orderData :>> ', orderData);

        await Swal.fire({
          icon: 'success',
          title: 'Заявку надіслано!',
          text: 'Ми звяжемося з вами найближчим часом.',
          confirmButtonColor: '#9b896a'
        });

        closeAdoptModal();

      } catch (err) {
        console.error(err);

        const errorMessage = err.response?.data?.message || err.message || 'Не вдалося надіслати заявку.';

        await Swal.fire({
          icon: 'error',
          title: 'Помилка',
          text: errorMessage,
          confirmButtonColor: '#9b896a'
        });

        btn.disabled = false;
        btn.textContent = 'Надіслати';
      }
    });