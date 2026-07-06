
import { getCards } from "../card-data.mjs";
import { getWinningSequence, getRandomNumber } from "./sequence.mjs";
import {
    landingPage,
    introVideoPage,
    registerCardsPage,
    numberPullerPage,
    earlyBingoPage,
    lateBingoPage,
    congratsPage,
    updatePulledNumberBoard
} from './game-pages.mjs';

const pageViewer = document.querySelector('#page-viewer');

const cards = getCards();

// If testing, insert code here.

let cardsOutOfPlay = cards;
let cardsInPlay = [];
let sequence = [];
let sequenceIndex = 0;
let pulledNumbers = [];
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

function toggleQRCode() {
    const qrCodeDiv = document.querySelector('.qr-code-div');
    qrCodeDiv.classList.toggle('showing');
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

async function saveWinningCardToDatabase(gameId, winningData) {
    try {
        const response = await fetch('/api/game/update-winner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                gameId: gameId,
                winningId: winningData.winningId,
                sequence: winningData.sequence
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Database synced successfully:', data);
    } catch (error) {
        console.error('Failed to sync winning card details to server:', error);
        // flashMessage('Warning: Game progress not synced to server.', 'red');
    }
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
    document.querySelector('.intro-video').play();
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
    document.querySelector('#show-qr-button').addEventListener('click', () => {
        toggleQRCode();
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

        console.log(`Cards in Play:${cardsInPlay.map((card) => `\n  ${card.gender}-${card.id}`)}`);
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

}

function goToNumberPuller() {
    switchToPage(numberPullerPage(pulledNumbers));
    document.querySelector('.pull-number').addEventListener('click', () => {
        if (isDoneAnimating) {
            tryPullNumber();
        }
    });
    document.querySelector('.winner-found').addEventListener('click', () => {
        if (isDoneAnimating) {
            tryWinnerFound();
        }
    });
}

function tryPlayGame() {
    if (hasABoy && hasAGirl) {
        let maxSequenceLength = Math.floor((cardsInPlay.length * (7 / 98)) + 17.5);
        maxSequenceLength = maxSequenceLength + getRandomNumber(2);

        const winningData = getWinningSequence(window.winningGender, cardsInPlay, maxSequenceLength);

        saveWinningCardToDatabase(window.gameId, winningData);

        sequence = winningData.sequence;

        sequenceIndex = 0;
        pulledNumbers = [];
        goToNumberPuller();
    }
    else {
        let idInput = document.querySelector('#id-input');
        idInput.value = '';
        let registrationWarning = '';
        if (!hasABoy) {
            registrationWarning = registrationWarning + 'At least one boy card must be registered to play.  ';
        }
        if (!hasAGirl) {
            registrationWarning = registrationWarning + 'At least one girl card must be registered to play.  ';
        }
        flashMessage(registrationWarning, 'red');
        idInput.focus();
    }
}

function tryPullNumber() {
    if (sequenceIndex < sequence.length) {
        updatePulledNumberBoard(pulledNumbers);
        const bingoBall = document.querySelector('.bingo-ball');
        isDoneAnimating = false;
        bingoBall.addEventListener('animationend', () => { isDoneAnimating = true; });

        // Format the bingoBall to letter-number format (like 'B1', 'I16', 'O75', etc.)
        const columnLetter = ['B', 'I', 'N', 'G', 'O'][Math.floor((sequence[sequenceIndex] - 0.5) / 15)];
        document.querySelector('.bingo-ball-text').innerHTML = `${columnLetter}${sequence[sequenceIndex]}`;
        
        pulledNumbers.push(sequence[sequenceIndex]);
        pulledNumbers.sort((a, b) => a - b);

        const boxOfMystery = document.querySelector('.box-of-mystery');

        boxOfMystery.className = 'box-of-mystery';
        bingoBall.className = 'bingo-ball';
        void boxOfMystery.offsetWidth;
        void bingoBall.offsetWidth;
        boxOfMystery.className = 'box-of-mystery animating-box';
        bingoBall.className = 'bingo-ball animating-ball';

        sequenceIndex ++;
    }
    else {
        goToLateBingo();
    }
}

function tryWinnerFound() {
    if (sequenceIndex >= sequence.length) {
        switchToPage(congratsPage(window.winningGender));
    }
    else {
        goToEarlyBingo();
    }
}

function goToEarlyBingo() {
    switchToPage(earlyBingoPage());
    document.querySelector('.number-puller').addEventListener('click', () => {
        goToNumberPuller();
    });
}

function goToLateBingo() {
    switchToPage(lateBingoPage());
    document.querySelector('.number-puller').addEventListener('click', () => {
        goToNumberPuller();
    });
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
