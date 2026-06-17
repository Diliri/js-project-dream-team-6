import Swal from "sweetalert2";
import { animalObj } from "./pets-list"; 
import { openAdoptModal } from "./order-modal";

const container = document.querySelector(".pets__list");
const cardContainer = document.querySelector(".dinamic-info");
const backdrop = document.querySelector(".modal-overlay");

const closeBtn = document.querySelector(".modal__close");

let petId = null;

container.addEventListener("click", showMoreInfo);
cardContainer.addEventListener("click", handleButtons);

backdrop.addEventListener("click", handleClick);
cardContainer.addEventListener("keydown", onEscPress);

function showMoreInfo(event) {
  const btn = event.target.closest(".pet-card__btn");
  if (!btn){ return; }

  const card = btn.closest("li");
  if (!card) {
    showError("Ой! Щось пішло не так.");
    return;
  }
  const idChoosed = card.dataset.id;
  petId = idChoosed;
  const aniMal = animalObj.animals.find(item => {
    return item._id === idChoosed;
  });
    if (!aniMal) {
      showError("Тваринка не знайдена.");
     return;
  }
  
  cardContainer.innerHTML = createMarkup(aniMal);

  openModal();
}

function handleButtons(event) {
  console.log(event.target);
   if(event.target.closest(".first-btn")){
     openAdoptModal(petId);
     closeModal();
      return;
    }
   if(event.target.closest(".second-btn")){
     openAdoptModal(petId);
     closeModal();
    }
}

function handleClick(event) {
   // Клик по крестику
  if (event.target.closest(".modal__close")) {
      cardClear();
      closeModal();
      return;
    }
   // Клик по backdrop
  if (event.target === event.currentTarget) {
      cardClear();
      closeModal();
    }
}

function onEscPress(event){
  if (event.key === "Escape") {
      cardClear();
      closeModal();
    }
}

function cardClear() {
  cardContainer.innerHTML = "";
}

function openModal(){
  backdrop.classList.remove("hidden");
  document.body.classList.add("modal-open");

}

function closeModal() {
  backdrop.classList.add("hidden");
  document.body.classList.remove("modal-open");
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
            <h3 class="title-descr">Опис:</p>
            <p class="card-text">${obj.description}</p>
            <h3 class="title-descr">Здоров'я:</p>
            <p class="card-text">${obj.healthStatus}</p>
            <h3 class="title-descr">Поведінка:</p>
            <p class="card-text">${obj.behavior}</p>
            <button class="button second-btn" type="button" >Взяти додому</button>
          </div>`;
}

function showError(message) {

   Swal.fire({
      icon: "error",
      title: "Помилка",
      text: message,
      confirmButtonText: "Добре",
      confirmButtonColor: "#9b896a",

    });
}

