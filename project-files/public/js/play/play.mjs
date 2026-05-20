

import { getCards } from "../card-data.mjs";
import { getWinningSequence } from "./sequence.mjs";
import {
    landingPage,
    introVideoPage,
    registerCardsPage,
    newNumberPage,
    previousNumbersPage,
    earlyBingoPage,
    lateBingoPage,
    congratsPage
} from './game-pages.mjs';

const pageViewer = document.querySelector('#page-viewer');

const cards = getCards();

let maxSequenceLength = 1;
let cardsOutOfPlay = cards;
let cardsInPlay = [];
let sequence = [];
let sequenceIndex = 0;
let pulled = [];
let isDoneAnimating = true;
let hasABoy = false;
let hasAGirl = false;
let boyIds = cards
    .filter(item => item.gender === 'BOY')
    .map(item => item.id);
let girlIds = cards
    .filter(item => item.gender === 'GIRL')
    .map(item => item.id);

//------------------------------------------------------------------------
// HELPER FUNCTIONS
//------------------------------------------------------------------------

function toggleFullscreen() {
    const element = document.documentElement;

    if (!document.fullscreenElement) {
        // If NOT in fullscreen, request fullscreen for the element
        // We use document.documentElement to target the entire page
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } 
        // Include vendor prefixes for wider browser compatibility
        else if (element.mozRequestFullScreen) { // Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Edge
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE/Edge
            element.msRequestFullscreen();
        }
        
    } else {
        // If already in fullscreen, exit fullscreen mode
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } 
        // Include vendor prefixes for wider browser compatibility
        else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari, Edge
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
    }
}

function switchToPage(content) {
    pageViewer.innerHTML = content;
}

function noticeAnimationEnd() {
    isDoneAnimating = true;
}

function updateIdSuggestions(searchId) {
    boyIds = boyIds.filter(id => id != searchId);
    girlIds = girlIds.filter(id => id != searchId);
    document.querySelector('.boy-suggestion').innerHTML = `BOY: ${boyIds[0] || 'USED ALL'}`;
    document.querySelector('.girl-suggestion').innerHTML = `GIRL: ${girlIds[0] || 'USED ALL'}`;
}

function flashMessage(message, colorClass) {
    let submitMessage = document.querySelector('#submit-message');
    submitMessage.innerHTML = message;
    submitMessage.className = colorClass;
    void submitMessage.offsetWidth;
    submitMessage.classList.add('flashing');
}

//------------------------------------------------------------------------
// CORE FUNCTIONS
//------------------------------------------------------------------------

function showLandingPage() {
    switchToPage(landingPage());
    document.querySelector('.play-intro').addEventListener('click', () => {
        goToIntroVideo();
    });
    document.querySelector('.register-cards').addEventListener('click', () => {
        goToRegisterCards();
    });
}

function goToIntroVideo() {
    switchToPage(introVideoPage());
    document.querySelector('.register-cards').addEventListener('click', () => {
        goToRegisterCards();
    });
}

function goToRegisterCards() {
    switchToPage(registerCardsPage(girlIds, boyIds));
    document.querySelector('#get-ids').addEventListener('submit', (e) => {
        e.preventDefault();
        tryIdSubmit();
    });
    document.querySelector('.submit-id').addEventListener('click', (e) => {
        e.preventDefault();
        tryIdSubmit();
    });
    document.querySelector('.play-game').addEventListener('click', (e) => {
        e.preventDefault();
        tryPlayGame();
    });
}

function tryIdSubmit() {

    let idInput = document.querySelector('#id-input');
    
    let searchId = idInput.value;
    idInput.value = '';

    // Add the card if it can be added
    if (cardsOutOfPlay.some(card => card.id === searchId)) {
        const cardToAdd = cardsOutOfPlay.find(card => card.id === searchId);
        cardsInPlay.push(cardToAdd);
        cardsOutOfPlay = cardsOutOfPlay.filter(card => card.id !== searchId);

        if (cardToAdd.gender === 'BOY') {
            hasABoy = true;
        } else if (cardToAdd.gender === 'GIRL') {
            hasAGirl = true;
        }

        updateIdSuggestions(searchId);

        flashMessage(`Card "${searchId}" added!`, 'green');
    }

    // Warn the user if the card has already been added
    else if (cardsInPlay.some(card => card.id === searchId)) {
        flashMessage(`Card "${searchId}" is already in play.`, 'red');
    }

    // Warn the user if the card is invalid
    else {
        flashMessage(`Card "${searchId}" does not exist.`, 'red');
    }

    idInput.focus();
    console.log(`Cards in Play: ${cardsInPlay}`);
}

function goToNumberPuller() {
    switchToPage(newNumberPage());
    document.querySelector('.previous-numbers').addEventListener('click', () => {
        goToPreviousNumbers();
    });
    document.querySelector('.pull-number').addEventListener('click', () => {
        tryPullNumber();
    });
    document.querySelector('.winner-found').addEventListener('click', () => {
        tryWinnerFound();
    });
}

function tryPlayGame() {
    if (hasABoy && hasAGirl) {
        sequence = getWinningSequence(winningGender, cardsInPlay, maxSequenceLength);
        sequenceIndex = 0;
        pulled = [];
        goToNumberPuller();
    }
    else {
        let idInput = document.querySelector('#id-input');
        idInput.value = '';
        flashMessage(`There must be at least one girl card and one boy card registered.`, 'red');
        idInput.focus();
    }
}

function tryPullNumber() {
    isDoneAnimating = false;
    if (sequence[sequenceIndex] < 16) {
        bingoBall.innerHTML = `B${sequence[sequenceIndex]}`;
    } else if (sequence[sequenceIndex] < 31) {
        bingoBall.innerHTML = `I${sequence[sequenceIndex]}`;
    } else if (sequence[sequenceIndex] < 46) {
        bingoBall.innerHTML = `N${sequence[sequenceIndex]}`;
    } else if (sequence[sequenceIndex] < 61) {
        bingoBall.innerHTML = `G${sequence[sequenceIndex]}`;
    } else {
        bingoBall.innerHTML = `O${sequence[sequenceIndex]}`;
    }
    pulled.push(sequence[sequenceIndex]);
    pulled.sort((a, b) => a - b);

    let animationArea = document.querySelector('#animation-area');
    animationArea.insertAdjacentElement('afterbegin', bingoBall);
    animationArea.insertAdjacentElement('beforeend', boxOfMystery);
    boxOfMystery.className = '';
    bingoBall.className = '';
    void boxOfMystery.offsetWidth;
    void bingoBall.offsetWidth;
    boxOfMystery.className = 'animating-box';
    bingoBall.className = 'animating-ball';

    sequenceIndex ++;
}

function goToPreviousNumbers() {
    switchToPage(previousNumbersPage());
}

function tryWinnerFound() {

}

//------------------------------------------------------------------------
// INITIALIZE PROGRAM
//------------------------------------------------------------------------

showLandingPage();

window.addEventListener('beforeunload', (e) => {
    const message = "Are you sure you want to leave? Your unsaved changes may be lost.";
    e.returnValue = message;
    return message;
});

document.getElementById('fullscreen-button').addEventListener('click', toggleFullscreen);
