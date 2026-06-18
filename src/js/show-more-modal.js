import { animalObj } from './pets-list';
import { openAdoptModal } from './order-modal';

const container = document.querySelector('.pets__list');
const cardContainer = document.querySelector('.dynamic-info');
const backdrop = document.querySelector('.modal-overlay');

let petId = null;

container.addEventListener('click', showMoreInfo);
cardContainer.addEventListener('click', handleButtons);

backdrop.addEventListener('click', handleClick);
document.addEventListener('keydown', onEscPress);

function showMoreInfo(event) {
  const btn = event.target.closest('.pet-card__btn');
  if (!btn) {
    return;
  }

  const card = btn.closest('li');
  if (!card) {
    showError('Ой! Щось пішло не так.');
    return;
  }
  const idChoosed = card.dataset.id;
  petId = idChoosed;
  const animal = animalObj.animals.find(item => {
    return item._id === idChoosed;
  });
  if (!animal) {
    showError('Тваринка не знайдена.');
    return;
  }

  cardContainer.innerHTML = createMarkup(animal);

  openModal();
}

function handleButtons(event) {
  if (event.target.closest('.first-btn')) {
    closeModal();
    openAdoptModal(petId);
    return;
  }
  if (event.target.closest('.second-btn')) {
    closeModal();
    openAdoptModal(petId);
  }
}

function handleClick(event) {
  // Клик по крестику
  if (event.target.closest('.modal__close')) {
    closeModal();
    return;
  }
  // Клик по backdrop
  if (event.target === event.currentTarget) {
    closeModal();
  }
}

function onEscPress(event) {
  if (event.key === 'Escape' && !backdrop.classList.contains('hidden')) {
    closeModal();
  }
}

function openModal() {
  backdrop.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeModal() {
  backdrop.classList.add('hidden');
  document.body.classList.remove('modal-open');
  cardContainer.innerHTML = "";
}

function createMarkup(obj) {
  return `
          <div class="img-wrap">
            <img class="card-img" src="${obj.image}" alt="${obj.species}"/>
          </div>
          <div class="wrap-descr">
            <p class="card-text small-text">${obj.species}</p>
            <h2 class="card-title">${obj.name}</h2>
            <p class="wrap-text">
              <span class="small-text">${obj.age}</span>
              <span class="small-text">${obj.gender}</span>
            </p>
            <button class="button first-btn hidden" type="button" >Взяти додому</button> 
            <h3 class="title-descr">Опис:</h3>
            <p class="card-text">${obj.description}</p>
            <h3 class="title-descr">Здоров'я:</h3>
            <p class="card-text">${obj.healthStatus}</p>
            <h3 class="title-descr">Поведінка:</h3>
            <p class="card-text">${obj.behavior}</p>
            <button class="button second-btn" type="button" >Взяти додому</button>
          </div>`;
}

let SwalInstance = null;

async function showError(message) {
  try {
    if (!SwalInstance) {
      const { default: Swal } = await import('sweetalert2');
      SwalInstance = Swal;
    }
    await SwalInstance.fire({
      icon: 'error',
      title: 'Помилка',
      text: message,
      confirmButtonText: 'Добре',
      confirmButtonColor: '#9b896a',
    });
  } catch (err) {
    console.error(err);
    alert(message);
  }
}

