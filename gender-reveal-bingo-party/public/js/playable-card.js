
import { getCards } from "./card-data.mjs";

let isShowingCard = false;

const submitIdButton = document.getElementById('submit-id-button');
const idInput = document.getElementById('id-input');
const idWarning = document.getElementById('id-warning');

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
        document.getElementsByClassName('bingo-card-main')[0].innerHTML = card.getSVG();
    }
}

if (cardId && isValidBingoCard(cardId)) {
    showBingoCardForId(cardId);
    isShowingCard = true;
}

submitIdButton.addEventListener('click', () => {

    const isValidId = isValidBingoCard(idInput.value);

    if (isValidId) {
        const nextURL = `${window.location.origin}${window.location.pathname}?card=${idInput.value}`;
        window.location.href = nextURL;
    } else {
        idWarning.innerHTML = 'This ID is invalid.';
    }

});

document.body.addEventListener('click', handleCardToggling);

window.addEventListener('beforeunload', (e) => {
    if (isShowingCard) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave?';
    }
});
