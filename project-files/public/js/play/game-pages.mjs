
import { getNumberBoardElement } from './number-board-svg.mjs';

function getPulledNumbersContent(pulledNumbers) {
    
    let grouped = [[], [], [], [], []];
    for (let i = 0; i < pulledNumbers.length; i ++) {
        grouped[Math.floor((pulledNumbers[i] - 0.5) / 15)].push(pulledNumbers[i]);
    }

    let boardElement = getNumberBoardElement();
    for (let i = 0; i < 5; i ++) {
        for (let x = 0; x < grouped[i].length; x ++) {
            boardElement.querySelector(`.c-${i}-${x}`).innerHTML = grouped[i][x];
        }
    }

    return boardElement.outerHTML;
}

function updatePulledNumberBoard(pulledNumbers) {
    const mappedNumbers = document.querySelector('.mapped-numbers');
    mappedNumbers.innerHTML = getPulledNumbersContent(pulledNumbers);
}



function landingPage() {
    return `
        <div class="page">
            <img class="logo" src="../../images/logo-dark.svg">
            <div class="button-group">
                <button class="play-intro">Play Intro</button>
                <button class="register-cards">Skip Intro</button>
            </div>
        </div>
    `;
}

function introVideoPage() {
    return `
        <div class="page">
            <div class="close-intro-container">
                <button class="register-cards">Close Intro</button>
            </div>
        </div>
    `;
}

function registerCardsPage(girlIds, boyIds) {
    return `
        <div class="page" id="get-ids-page">
            <div class="button-floor">
                <button id="show-qr-button">SHOW QR CODE</button>
            </div>
            <div class="qr-code-div">
                <img
                    src="../../images/qr-bingo-card.svg"
                    draggable="false"
                >
                <button class="show-digital-card-instructions">About Digital Cards</button>
            </div>
            <div class="id-input-section">
                <div class="id-input-area">
                    <form id="get-ids">
                        <h2>Card Registration</h2>
                        <p id="submit-message"></p>
                        <label for="id-input">Type your ID here</label>
                        <input
                            type="text"
                            inputmode="numeric"
                            autocomplete="off"
                            maxlength="4"
                            class="id-input"
                            id="id-input"
                        >
                        <div class="button-row">
                            <button class="submit-id">SUBMIT</button>
                            <button class="play-game">PLAY GAME</button>
                        </div>
                    </form>
                    <div class="id-suggestions">
                        <p class="girl-suggestion">GIRL: ${girlIds[0]}</p>
                        <p class="boy-suggestion">BOY: ${boyIds[0]}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

const instructionsElement = document.querySelector('.digital-card-instructions');
function digitalCardInstructionsPage() {
    return `<div class="digital-card-instructions custom-scrollbar">${instructionsElement.innerHTML}</div>`;
}

function numberPullerPage(pulledNumbers) {
    return `
        <div class="number-puller-page">
            <div class="mapped-numbers">
                ${getPulledNumbersContent(pulledNumbers)}
            </div>
            <div id="animation-area">
                <div class="bingo-ball">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
                        <defs>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.15"/>
                            </filter>
                        </defs>

                        <circle cx="100" cy="100" r="90" fill="#FFFFFF" filter="url(#shadow)" />

                        <text
                            class="bingo-ball-text"
                            x="100"
                            y="100"
                            font-family="'Google Sans', sans-serif"
                            font-size="75"
                            text-anchor="middle"
                            fill: currentColor;
                            dominant-baseline="central"
                        >
                            err
                        </text>
                    </svg>
                </div>

                <img class="box-of-mystery" src="../../images/box-of-mystery.svg">
            </div>
            <div class="button-floor">
                <button class="pull-number">Pull Number</button>
                <button class="winner-found">We have a winner!</button>
            </div>
        </div>
    `;
}

function earlyBingoPage() {
    return `
        <div class="page">
            <div class="pop-up">
                <h2>This is awkward...</h2>
                <p>A bingo should NOT have occurred yet.</p>
                <p>Please compare the numbers with the "previous numbers" table.</p>
                <p>If there are still issues, this page may need refreshed and the cards may need re-registered.</p>
            </div>
            <div class="button-floor">
                <button class="number-puller">Back to Game</button>
            </div>
        </div>
    `;
}

function lateBingoPage() {
    return `
        <div class="page">
            <div class="pop-up">
                <h2>This is awkward...</h2>
                <p>That last number should have resulted in a bingo.</p>
                <p>Please compare your numbers to the "Previous Numbers" tab.</p>
                <p>If there are still problems, this page may need refreshed and the cards may need re-registered.</p>
            </div>
            <div class="button-floor">
                <button class="number-puller">Back to Game</button>
            </div>
        </div>
    `;
}

function congratsPage(winningGender) {
    return `
        <div class="page">
            <div class="pop-up">
                <h2>Congratulations!</h2>
                <img src="../../images/announce-${winningGender.toLowerCase()}.svg">
                <p>Thank you for letting us be part of your big reveal!</p>
                <a href="/my-games">Return to Main Site</a>
            </div>
        </div>
    `;
}

export {
    landingPage,
    introVideoPage,
    registerCardsPage,
    digitalCardInstructionsPage,
    numberPullerPage,
    earlyBingoPage,
    lateBingoPage,
    congratsPage,
    updatePulledNumberBoard
}
