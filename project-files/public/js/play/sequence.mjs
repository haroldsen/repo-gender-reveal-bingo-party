
export function getWinningSequence(winningGender, cardsInPlay, maxSequenceLength) {

    // Initialize the sequence.
    let sequence = ['FREE'];

    // Create a list of possible numbers from 1 to 75.
    let possibleNumbers = [];
    for (let i = 1; i < 76; i ++) {
        possibleNumbers.push(i);
    }

    // Create function for managing our sequence and possible numbers.
    function addToSequenceAndRemoveFromPossibles(numberList) {
        // Add numbers to sequence.
        for (let i = 0; i < numberList.length; i ++) {
            if (!sequence.includes(numberList[i])) {
                sequence.push(numberList[i]);
            }
        }
        // Remove numbers from possibles.
        for (let i = possibleNumbers.length - 1; i >= 0; i --) {
            if (numberList.includes(possibleNumbers[i])) {
                possibleNumbers.splice(i, 1);
            }
        }
    }

    // Separate the boy combos from the girl combos and append them to separate lists.
    let boyCombos = [];
    let girlCombos = [];
    for (let i = 0; i < cardsInPlay.length; i ++) {
        let combos = cardsInPlay[i].getAllCombos();
        if (cardsInPlay[i].gender === 'BOY') {
            for (let ii = 0; ii < 12; ii ++) {
                boyCombos.push(combos[ii]);
            }
        } else if (cardsInPlay[i].gender === 'GIRL') {
            for (let ii = 0; ii < 12; ii ++) {
                girlCombos.push(combos[ii]);
            }
        }
    }

    // Select a winning combo and remove it from the combo list.
    let winningCombo = [];
    if (winningGender === 'BOY') {
        let indexOfWinner = getRandomNumber(boyCombos.length);
        winningCombo = boyCombos[indexOfWinner];
        boyCombos.splice(indexOfWinner, 1);
    } else if (winningGender === 'GIRL') {
        let indexOfWinner = getRandomNumber(girlCombos.length)
        winningCombo = girlCombos[indexOfWinner];
        girlCombos.splice(indexOfWinner, 1);
    }

    // Append the winning combo's numbers to the sequence and remove those numbers from the possible numbers.
    addToSequenceAndRemoveFromPossibles(winningCombo.combo);

    // Find a close second of the losing gender to make the game appear close.
    let found = false;
    let closeSecond = '';
    while (!found) {

        // Get a random combo from the losing gender.
        if (winningGender === 'BOY') {
            closeSecond = girlCombos[getRandomNumber(girlCombos.length)];
        } else if (winningGender === 'GIRL') {
            closeSecond = boyCombos[getRandomNumber(boyCombos.length)];
        }

        // Append all but one of the close second values to a temporary sequence.
        let tempSequence = sequence.slice();
        let incompleteNumber = getRandomNumber(5);
        for (let index = 0; index < 5; index ++) {
            if (index != incompleteNumber) {
                if (!tempSequence.includes(closeSecond.combo[index])) {
                    tempSequence.push(closeSecond.combo[index]);
                }
            }
        }

        // Test if the temporary sequence will result in a bingo.
        if (!resultsInBingo('FREE', tempSequence, boyCombos, girlCombos)) {
            found = true;

            // Overwrite the sequence's numbers with the temporary sequence generated when we found the close second.
            addToSequenceAndRemoveFromPossibles(tempSequence);
        }
    }

    // Add numbers to the sequence until we either run out of possible numbers or reach our maxSequenceLength
    while (sequence.length < (maxSequenceLength + 1) && possibleNumbers.length > 0) {
        let randomIndex = getRandomNumber(possibleNumbers.length);
        if (resultsInBingo(possibleNumbers[randomIndex], sequence, boyCombos, girlCombos)) {
            possibleNumbers.splice(randomIndex, 1);
        } else {
            sequence.push(possibleNumbers[randomIndex]);
            possibleNumbers.splice(randomIndex, 1);
        }
    }

    // Remove the 'FREE' space from the final sequence.
    sequence.splice(0, 1);

    // Remove one of the first four numbers from the sequence to be used as the finishing number.
    const randomFirstFour = getRandomNumber(4);
    const finishingNumber = sequence[randomFirstFour];
    sequence.splice(randomFirstFour, 1);

    // Shuffle the sequence.
    sequence = shuffleList(sequence);

    // Append the finishing number to the end of the sequence.
    sequence.push(finishingNumber);

    // Return the final sequence.
    console.log(`winner: ${winningCombo.toString()}\nsecond: ${closeSecond.toString()}\nsequence length: ${sequence.length}\nsequence: ${sequence}`);
    return sequence;
}

function getRandomNumber(maxExclusive) {
    const randomNumber = Math.floor(Math.random() * maxExclusive);
    return randomNumber
}

function resultsInBingo(newNumber, pulledNumbers, boyCombos, girlCombos) {
    let tempList = pulledNumbers.slice();
    if (!tempList.includes(newNumber)) {
        tempList.push(newNumber);
    }
    let isFound = false;
    // Test for bingos in the boy combos.
    for (let boyCombo = 0; boyCombo < boyCombos.length; boyCombo ++) {
        let matchCount = 0;
        for (let number = 0; number < tempList.length; number ++) {
            if (boyCombos[boyCombo].combo.includes(tempList[number])) {
                matchCount ++;
            }
        }
        if (matchCount > 4) {
            isFound = true;
            break;
        }
    }
    // Test for bingos in the girl combos.
    if (!isFound) {
        for (let girlCombo = 0; girlCombo < girlCombos.length; girlCombo ++) {
            let matchCount = 0;
            for (let number = 0; number < tempList.length; number ++) {
                if (girlCombos[girlCombo].combo.includes(tempList[number])) {
                    matchCount ++;
                }
            }
            if (matchCount > 4) {
                isFound = true;
                break;
            }
        }
    }
    // Return the results.
    return isFound;
}

function shuffleList(list) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}
