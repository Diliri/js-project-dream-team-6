const refs = {
  openModal: document.querySelector('.open-modal-team'),
  closeModal: document.querySelector('.close-modal-team'),
  teamBackdrop: document.querySelector('.backdrop-modal'),
  teamModal: document.getElementsByClassName('team__modal'),
};

if (
  refs.openModal &&
  refs.closeModal &&
  refs.teamBackdrop &&
  refs.teamModal.length > 0
) {
  refs.openModal.addEventListener('click', openModalTeam);
  refs.closeModal.addEventListener('click', closeModalTeam);
}

function openModalTeam(event) {
  if (event) event.preventDefault();

  refs.teamBackdrop.classList.remove('team__backdrop--hidden');
  refs.teamModal[0].classList.add('openModalAnimationTeam');

  document.body.style.overflow = 'hidden';

  refs.teamBackdrop.addEventListener('click', onBackdropClose);
  window.addEventListener('keydown', onEscapeClose);
}

function closeModalTeam() {
  refs.teamModal[0].classList.remove('openModalAnimationTeam');
  refs.teamBackdrop.classList.add('team__backdrop--hidden');

  document.body.style.overflow = '';

  refs.teamBackdrop.removeEventListener('click', onBackdropClose);
  window.removeEventListener('keydown', onEscapeClose);
}

function onEscapeClose(event) {
  if (event.code === 'Escape') {
    closeModalTeam();
  }
}

function onBackdropClose(event) {
  if (event.target === event.currentTarget) {
    closeModalTeam();
  }
}
