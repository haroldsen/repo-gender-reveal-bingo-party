
import { getCards } from "../card-data.mjs";
import { getWinningSequence } from "./sequence.mjs";

const pageViewer = document.getElementById('page-viewer');

const cards = getCards();

let maxSequenceLength = 24;
let cardsOutOfPlay = cards;
let cardsInPlay = [];
let sequence = [];
let sequenceIndex = 0;
let pulled = [];
let doneAnimating = true;
let hasABoy = false;
let hasAGirl = false;
let boyIds = cards
    .filter(item => item.gender === 'BOY')
    .map(item => item.id);
let girlIds = cards
    .filter(item => item.gender === 'GIRL')
    .map(item => item.id);



// Create landing page
const landingPage = document.createElement('div');
landingPage.className = 'page';
landingPage.innerHTML = `
    <img class="logo" src="../../images/logo.svg">
    <button class="play-intro-button">Play Intro</button>
    <button class="skip-intro-button">Skip Intro</button>
`;

// Handle interactions
landingPage.addEventListener('click', (e) => {
    let classOfClicked = e.target.className;
    if (classOfClicked == 'play-intro-button') {
        switchToPage(introVideoPage);
        const video = document.getElementById('intro-video');
        video.play();
    }
    else if (classOfClicked == 'skip-intro-button') {
        switchToPage(getIdsPage);
    }
});



// Create intro video page
const introVideoPage = document.createElement('div');
introVideoPage.className = 'page';
introVideoPage.innerHTML = `
    <button class="close-intro">Close Intro</button>
    <video id="intro-video" controls controlsList="nofullscreen" src="/videos/intro-video.mp4">
`;

// Handle interactions
introVideoPage.addEventListener('click', (e) => {
    let classOfClicked = e.target.className;
    if (classOfClicked == 'close-intro') {
        switchToPage(getIdsPage);
    }
});



// Create get ids page
const getIdsPage = document.createElement('div');
getIdsPage.className = 'page';
getIdsPage.id = 'get-ids-page';
getIdsPage.innerHTML = `
    <div class="qr-code-div">
        <p>Scan for a bingo card!</p>
        <img
            src="../../images/qr-bingo-card.svg"
            draggable="false"
        >
        <p class="small-url">genderrevealbingo.party/bingo-card</p>
    </div>
    <div class="id-input-section">
        <form id="get-ids">
            <p id="submit-message"></p>
            <label for="id-input">Type your ID here</label>
            <input type="text" autocomplete="off" maxlength="4" class="id-input" id="id-input">
            <div id="get-ids-button-row" class="button-row">
                <button class="submit-id-button">SUBMIT</button>
            </div>
        </form>
        <div class="id-suggestions">
            <p id="girl-suggestion">GIRL: ${girlIds[0]}</p>
            <p id="boy-suggestion">BOY: ${boyIds[0]}</p>
        </div>
    </div>
`;
const showQRCodeButton = document.createElement('button');
showQRCodeButton.id = 'show-qr-button';
showQRCodeButton.innerHTML = 'SHOW QR CODE';
showQRCodeButton.addEventListener('click', () => {
    getIdsPage.classList.toggle('show-qr-code');
});
getIdsPage.insertAdjacentElement('afterbegin', showQRCodeButton);

const playButton = document.createElement('button');
playButton.innerHTML = 'PLAY';
playButton.addEventListener('click', initializeGame);

// Handle interactions
getIdsPage.addEventListener('click', (e) => {
    let classOfClicked = e.target.className;
    if (classOfClicked == 'submit-id-button') {
        tryIdSubmit();
    }
});
getIdsPage.addEventListener('submit', (e) => {
    e.preventDefault();
    let classOfClicked = e.target.className;
    if (classOfClicked == 'submit-id-button') {
        tryIdSubmit();
    }
});



// Create home page for game play
const newNumberPage = document.createElement('div');
newNumberPage.className = 'page';
newNumberPage.innerHTML = `
    <div id="animation-area">
        
    </div>
    <div id="pull-number-buttons" class="button-floor">
        <button class="previous-numbers-button">Previous Numbers</button>
        <button class="next-number-button">Pull Number</button>
        <button class="winner-found-button">We have a winner!</button>
    </div>
`;
const bingoBall = document.createElement('div');
bingoBall.id = 'bingo-ball';
const boxOfMystery = document.createElement('img');
boxOfMystery.id = 'box-of-mystery';
boxOfMystery.src = "../../images/box-of-mystery.svg";
bingoBall.addEventListener('animationend', noticeAnimationEnd);

// Handle interactions
newNumberPage.addEventListener('click', (e) => {
    let classOfClicked = e.target.className;
    if (classOfClicked == 'previous-numbers-button' && doneAnimating) {
        updatePulledNumbersPage();
        switchToPage(pulledNumbersPage);
    }
    else if (classOfClicked == 'next-number-button' && doneAnimating) {
        if (sequenceIndex < sequence.length) {
            pullNumber();
        }
        else {
            switchToPage(lateBingoPage);
        }
    }
    else if (classOfClicked == 'winner-found-button' && doneAnimating) {
        if (sequenceIndex < sequence.length) {
            switchToPage(earlyBingoPage);
        }
        else {
            switchToPage(congratsPage);
        }
    }
});



// Create page for pulled numbers
const pulledNumbersPage = document.createElement('div');
pulledNumbersPage.className = 'page';

// Handle interactions
pulledNumbersPage.addEventListener('click', (e) => {
    let classOfClicked = e.target.className;
    if (classOfClicked == 'back-to-number-puller') {
        switchToPage(newNumberPage);
    }
});



// Create page for a late bingo
const lateBingoPage = document.createElement('div');
lateBingoPage.className = 'page';
lateBingoPage.innerHTML = `
    <div class="pop-up">
        <h2>This is awkward...</h2>
        <p>That last number should have resulted in a bingo.</p>
        <p>Please compare your numbers to the "Previous Numbers" tab.</p>
        <p>If there are still problems, this page may need refreshed and the cards may need re-registered.</p>
    </div>
    <div class="button-floor">
        <button class="back-to-game">Back to Game</button>
    </div>
`;

// Handle interactions
lateBingoPage.addEventListener('click', (e) => {
    let classOfClicked = e.target.className;
    if (classOfClicked == 'back-to-game') {
        switchToPage(newNumberPage);
    }
});



// Create page for an early bingo
const earlyBingoPage = document.createElement('div');
earlyBingoPage.className = 'page';
earlyBingoPage.innerHTML = `
    <div class="pop-up">
        <h2>This is awkward...</h2>
        <p>There should NOT have been a bingo yet.</p>
        <p>A bingo card may not have been registered.</p>
        <p>If there are still problems, this page may need refreshed and the cards may need re-registered.</p>
    </div>
    <div class="button-floor">
        <button class="back-to-game">Back to Game</button>
    </div>
`;

// Handle interactions
earlyBingoPage.addEventListener('click', (e) => {
    let classOfClicked = e.target.className;
    if (classOfClicked == 'back-to-game') {
        switchToPage(newNumberPage);
    }
});



// Create congrats page
const congratsPage = document.createElement('div');
congratsPage.className = 'page';
let imgSrc = `../../images/announce-${winningGender.toLowerCase()}.svg`;
congratsPage.innerHTML = `
    <div class="pop-up">
        <h2>Congratulations!</h2>
        <img src="${imgSrc}">
        <p>Thank you for letting us be part of your big reveal!</p>
        <a href="/my-games">Return to Main Site</a>
    </div>
`;


function switchToPage(pageElement) {
    pageViewer.innerHTML = '';
    pageViewer.insertAdjacentElement('afterbegin', pageElement);
    boxOfMystery.className = '';
    bingoBall.className = '';
}

function tryIdSubmit() {
    let idInput = document.getElementById('id-input');
    let submitMessage = document.getElementById('submit-message');

    let searchId = idInput.value;
    idInput.value = '';
    let notFound = true;
    // Test if the user id is already in play.
    for (let i = 0; i < cardsInPlay.length; i ++) {
        if (searchId === cardsInPlay[i].id) {
            submitMessage.style.color = 'var(--red)';
            submitMessage.innerHTML = `Card "${searchId}" is already in play.`;
            notFound = false;
            break;
        }
    }
    // Test if the user id can be added.
    for (let i = 0; i < cardsOutOfPlay.length; i ++) {
        if (searchId === cardsOutOfPlay[i].id) {
            // Notice if a girl or a boy is being added to the cardsInPlay.
            if (cardsOutOfPlay[i].gender === 'BOY') {
                hasABoy = true;
            } else if (cardsOutOfPlay[i].gender === 'GIRL') {
                hasAGirl = true;
            }
            // Add the card to the cardsInPlay
            cardsInPlay.push(cardsOutOfPlay[i]);
            cardsOutOfPlay.splice(i, 1);
            submitMessage.style.color = 'var(--green)';
            submitMessage.innerHTML = `Card "${searchId}" added!`;
            notFound = false;

            // Update the ID suggestions
            boyIds = boyIds.filter(id => id != searchId);
            girlIds = girlIds.filter(id => id != searchId);
            document.getElementById('boy-suggestion').innerHTML = `BOY: ${boyIds[0]}`;
            document.getElementById('girl-suggestion').innerHTML = `GIRL: ${girlIds[0]}`;

            break;
        }
    }
    // If the user id doesn't exist, alert the user.
    if (notFound) {
        submitMessage.style.color = 'var(--red)';
        submitMessage.innerHTML = `Card "${searchId}" does not exist.`;
    }
    // Show the play button if a boy card and a girl card have been provided.
    if (hasABoy && hasAGirl) {
        document.getElementById('get-ids-button-row').insertAdjacentElement('beforeend', playButton);
    }
    submitMessage.className = '';
    requestAnimationFrame(()=> {
        requestAnimationFrame(()=> {
            submitMessage.classList.add('flashing');
        });
    });
    submitMessage.style.display = 'flex';
    idInput.focus();
    console.log(`Cards in Play: ${cardsInPlay}`);
}

function initializeGame() {
    if (hasABoy && hasAGirl) {
        sequence = getWinningSequence(winningGender, cardsInPlay, maxSequenceLength);
        sequenceIndex = 0;
        pulled = [];
        switchToPage(newNumberPage);
    }
}

function updatePulledNumbersPage() {
    pulledNumbersPage.innerHTML = `
        <div id="mapped-numbers">
            <table>
                <thead>
                    <tr>
                        <th>B</th>
                        <th>I</th>
                        <th>N</th>
                        <th>G</th>
                        <th>O</th>
                    </tr>
                </thead>
                <tbody id="pulled-number-table">

                </tbody>
            </table>
        </div>
        <div class="button-floor">
            <button class="back-to-number-puller">Back to Number Puller</button>
        </div>
    `;

    let tableBody = pulledNumbersPage.querySelector('#pulled-number-table');
    
    let grouped = [[], [], [], [], []];
    for (let index = 0; index < pulled.length; index ++) {
        if (pulled[index] < 16) {
            grouped[0].push(pulled[index]);
        } else if (pulled[index] < 31) {
            grouped[1].push(pulled[index]);
        } else if (pulled[index] < 46) {
            grouped[2].push(pulled[index]);
        } else if (pulled[index] < 61) {
            grouped[3].push(pulled[index]);
        } else {
            grouped[4].push(pulled[index]);
        }
    }

    for (let index = 0; index < 5; index ++) {
        while (grouped[index].length < 15) {
            grouped[index].push('');
        }
    }

    for (let index = 0; index < 15; index ++) {
        tableBody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${grouped[0][index]}</td>
                <td>${grouped[1][index]}</td>
                <td>${grouped[2][index]}</td>
                <td>${grouped[3][index]}</td>
                <td>${grouped[4][index]}</td>
            </tr>
        `);
    }
}

function pullNumber() {
    doneAnimating = false;
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
    // pulled.sort((a, b) => a - b);

    let animationArea = document.getElementById('animation-area');
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

function noticeAnimationEnd() {
    doneAnimating = true;
}

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

switchToPage(landingPage);

window.addEventListener('beforeunload', (e) => {
    const message = "Are you sure you want to leave? Your unsaved changes may be lost.";
    e.returnValue = message;
    return message;
});

document.getElementById('fullscreen-button').addEventListener('click', toggleFullscreen);
