
import { getCards } from "./card-data.mjs";

let isShowingCard = false;

const cardIdForm = document.querySelector('.card-id-form');

const bingoCards = getCards();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const cardId = urlParams.get('card');

function isValidBingoCard(id) {
    return bingoCards.some(card => card.id === id);
}

function handleCardToggling(e) {
    let elementToToggle = e.target.closest('.number-square-group');
    if (elementToToggle) {
        elementToToggle.classList.toggle('toggled');
    }
}

function showBingoCardForId(id) {
    if (isValidBingoCard(id)) {
        const card = bingoCards.find(card => card.id === id);
        document.querySelector('.bingo-card-main').innerHTML = card.getSVG();
    }
}

if (cardId && isValidBingoCard(cardId)) {
    showBingoCardForId(cardId);
    isShowingCard = true;
}

cardIdForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const idInput = document.querySelector('.id-input');
    const idWarning = document.querySelector('.id-warning');

    const isValidId = isValidBingoCard(idInput.value);

    if (isValidId) {
        const nextURL = `${window.location.origin}${window.location.pathname}?card=${idInput.value}`;
        window.location.href = nextURL;
    } else {
        idWarning.innerHTML = 'This ID is invalid.';
        idWarning.style.display = 'block';

        idWarning.classList.remove('warning-flash');
        requestAnimationFrame(()=> {
            requestAnimationFrame(()=> {
                idWarning.classList.add('warning-flash');
            });
        });
    }
});

document.body.addEventListener('click', handleCardToggling);

window.addEventListener('beforeunload', (e) => {
    if (isShowingCard) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave?';
    }
});
