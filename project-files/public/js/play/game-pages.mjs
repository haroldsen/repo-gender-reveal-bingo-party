
function getPulledNumbersContent(pulledNumbers) {
    
    let grouped = [[], [], [], [], []];
    for (let i = 0; i < pulledNumbers.length; i ++) {
        if (pulledNumbers[i] < 16) {
            grouped[0].push(pulledNumbers[i]);
        } else if (pulledNumbers[i] < 31) {
            grouped[1].push(pulledNumbers[i]);
        } else if (pulledNumbers[i] < 46) {
            grouped[2].push(pulledNumbers[i]);
        } else if (pulledNumbers[i] < 61) {
            grouped[3].push(pulledNumbers[i]);
        } else {
            grouped[4].push(pulledNumbers[i]);
        }
    }

    for (let i = 0; i < 5; i ++) {
        while (grouped[i].length < 15) {
            grouped[i].push('\u200B');
        }
    }
    
    let output = '';
    for (let i = 0; i < 5; i ++) {
        const numbersAsHTML = grouped[i].map(listItem => `<p>${listItem}</p>`).join('');

        const content = `
            <div class="pulled-number-column">
                <p class="pulled-number-column-header">
                    ${['B', 'I', 'N', 'G', 'O'][i]}
                </p>
                ${numbersAsHTML}
            </div>
        `;

        output = output + content;
    }
    
    return output;
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
            <button class="register-cards">Close Intro</button>
            <video id="intro-video" controls controlsList="nofullscreen" src="/videos/intro-video.mp4">
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
            </div>
            <div class="id-input-section">
                <form id="get-ids">
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
                    <div id="get-ids-button-row" class="button-row">
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
    `;
}

function numberPullerPage() {
    return `
        <div class="page">
            <div id="animation-area">
                <div class="bingo-ball">
                
                </div>
                <img class="box-of-mystery" src="../../images/box-of-mystery.svg">
            </div>
            <div id="pull-number-buttons" class="button-floor">
                <button class="previous-numbers">Previous Numbers</button>
                <button class="pull-number">Pull Number</button>
                <button class="winner-found">We have a winner!</button>
            </div>
        </div>
    `;
}

function previousNumbersPage(pulledNumbers) {
    return `
        <div class="page">
            <div id="mapped-numbers">
                ${getPulledNumbersContent(pulledNumbers)}
            </div>
            <div class="button-floor">
                <button class="number-puller">Back to Number Puller</button>
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
                <p>A bingo card may not have been registered.</p>
                <p>If there are still problems, this page may need refreshed and the cards may need re-registered.</p>
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
    numberPullerPage,
    previousNumbersPage,
    earlyBingoPage,
    lateBingoPage,
    congratsPage
}
