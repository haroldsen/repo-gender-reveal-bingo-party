
export function getWinningSequence(winningGender, cardsInPlay, maxSequenceLength, logDetails=true) {

    // Initialize the sequence.
    let sequence = new Set();
    sequence.add('FREE');

    // Create a list of possible numbers from 1 to 75.
    let possibleNumbers = new Set();
    for (let i = 1; i < 76; i ++) {
        possibleNumbers.add(i);
    }

    // Initialize columnFrequency.
    // We want the columns to be pulled from an equal amount.
    let columnFrequency = [0, 0, 0, 0, 0];

    // Create function for determining which column
    // has been pulled from the least.
    function getLeastPickedColumn() {
        let leastPickedColumn = 0;
        for (let i = 1; i < 5; i ++) {
            if (columnFrequency[i] < columnFrequency[leastPickedColumn]) {
                leastPickedColumn = i;
            }
        }
        return leastPickedColumn;
    }

    // Create function for managing our sequence and possible numbers.
    function addToSequenceAndRemoveFromPossibles(numberList) {

        // For each number in the numberList
        for (const number of numberList) {
            
            // Add the number to the sequence.
            sequence.add(number);

            // Prevent errors that could be caused by the 'FREE' space.
            if (number != 'FREE') {

                // Remove the number from the possibleNumbers.
                possibleNumbers.delete(number);

                // Track the columnFrequency.
                columnFrequency[getColumnIndexFromNumber(number)] ++;
            }
        }
    }

    // Create a list of combos from the cardsInPlay.
    let combos = cardsInPlay.map(card => card.getAllCombos()).flat();

    // Shuffle the combos.
    shuffleList(combos);

    // -------------------------------------------------------------------
    // FIND A WINNING CARD
    // -------------------------------------------------------------------

    // Select a winning combo and remove it from the combo list.
    let winningCombo = combos.find(combo => combo.gender == winningGender);
    combos = combos.filter(combo => combo != winningCombo);

    // Append the winning combo's numbers to the sequence
    // and remove those numbers from the possible numbers.
    addToSequenceAndRemoveFromPossibles(winningCombo.combo);

    // -------------------------------------------------------------------
    // FIND A LOSING CARD TO MAKE THE GAME APPEAR CLOSE
    // -------------------------------------------------------------------

    // Initialize the closeSecond
    let closeSecond = '';

    // Create a list of combos that are the losing gender
    // and are a different type from the winningCombo.
    let closeSecondCandidates = combos.filter(combo =>
        combo.gender != winningGender &&
        combo.type != winningCombo.type
    );

    // Find a closeSecond
    while (true) {

        // Select a random combo from the closeSecondCandidates
        const randomIndex = getRandomNumber(closeSecondCandidates.length);
        closeSecond = closeSecondCandidates[randomIndex];

        // Append all but one of the close second values to a temporary sequence.
        let tempSequence = new Set(sequence);
        const incompleteNumber = getRandomNumber(5);
        for (let index = 0; index < 5; index ++) {
            if (index != incompleteNumber) {
                tempSequence.add(closeSecond.combo[index]);
            }
        }

        // Test if the temporary sequence will result in a bingo.
        if (!resultsInBingo(tempSequence, combos)) {

            // Overwrite the sequence's numbers with the
            // temporary sequence generated when we found the close second.
            addToSequenceAndRemoveFromPossibles(tempSequence);

            break;
        }
    }

    // -------------------------------------------------------------------
    // ADD EXTRA NUMBERS TO MAKE THE GAME FEEL NORMAL
    // -------------------------------------------------------------------

    // Convert possibleNumbers to an array and shuffle them.
    possibleNumbers = [...possibleNumbers];
    shuffleList(possibleNumbers);

    // Add numbers to the sequence until we either
    // run out of possible numbers or reach our maxSequenceLength
    while (sequence.size < (maxSequenceLength + 1) && possibleNumbers.length > 0) {

        // Pull a number from whatever column has been pulled from the least.
        const leastPicked = getLeastPickedColumn();
        let newNumber = possibleNumbers.find(number => getColumnIndexFromNumber(number) == leastPicked);

        if (!newNumber) {
            newNumber = possibleNumbers[0];
        }
        
        // Add the newNumber
        sequence.add(newNumber);

        // Remove the new number if it will cause a premature bingo.
        if (resultsInBingo(sequence, combos)) {
            sequence.delete(newNumber);
        }
        else {
            columnFrequency[getColumnIndexFromNumber(newNumber)] ++;
        }

        // Remove the newNumber from our possibleNumbers.
        possibleNumbers = possibleNumbers.filter(number => number != newNumber);
    }

    // -------------------------------------------------------------------
    // FINALIZE THE SEQUENCE
    // -------------------------------------------------------------------

    // Remove the 'FREE' space from the final sequence.
    sequence.delete('FREE');

    // Convert sequence from a set to an array.
    sequence = [...sequence];

    // Shuffle the sequence.
    shuffleList(sequence);

    // Move the first of our winningCombo numbers to the end.
    const finishingNumber = sequence.find(number => winningCombo.combo.includes(number));
    sequence = sequence.filter(number => number != finishingNumber);
    sequence.push(finishingNumber);

    if (logDetails) {
        console.log(`
            winner: ${winningCombo.toString()}
            second: ${closeSecond.toString()}
            sequence length: ${sequence.length}
            sequence: ${sequence}
        `);
    }

    // FOR TESTING
    // verify(sequence, winningCombo, combos);

    // Return the final sequence.
    return {
        // sequence: [1],
        sequence: sequence,
        winningId: winningCombo.id
    };
}

export function getRandomNumber(maxExclusive) {
    const randomNumber = Math.floor(Math.random() * maxExclusive);
    return randomNumber
}

function resultsInBingo(sequence, combos) {

    // Test each combo for a bingo
    for (let comboIndex = 0; comboIndex < combos.length; comboIndex ++) {
        for (let numberIndex = 0; numberIndex < 5; numberIndex ++) {
            
            // Return true if all five numbers appear in the sequence.
            if (sequence.has(combos[comboIndex].combo[numberIndex])) {
                if (numberIndex >= 4) {
                    return true;
                }
            }

            // Move on to the next card if ANY of the numbers
            // can't be found in the sequence.
            else {
                break;
            }
        }
    }

    // If we've made it to this point,
    // NONE of the combos will result in a bingo.
    return false;
}

function shuffleList(list) {
    for (let i = list.length - 1; i > 0; i --) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
}

function getColumnIndexFromNumber(number) {
    return Math.floor((number - 0.5) / 15)
}

// -----------------------------------------------------------------------
// FOR TESTING
// -----------------------------------------------------------------------

// function verify(sequence, winningCombo, combos) {
//     combos.push(winningCombo);
//     let sequenceSet = new Set(sequence);
//     sequenceSet.add('FREE');
//     let combosWithBingos = [];
//     for (let comboIndex = 0; comboIndex < combos.length; comboIndex ++) {
//         let matchCount = 0;
//         for (let numberIndex = 0; numberIndex < 5; numberIndex ++) {
//             if (sequenceSet.has(combos[comboIndex].combo[numberIndex])) {
//                 matchCount ++;
//             }
//         }
//         if (matchCount > 4) {
//             combosWithBingos.push(combos[comboIndex]);
//         }
//     }
//     if (combosWithBingos.length != 1) {
//         console.error(`Wanted ${[winningCombo]}.  Got ${combosWithBingos}`);
//     }
//     if (combosWithBingos[0].id != winningCombo.id) {
//         console.error(`Resulted in bingo for wrong card.`);
//     }
// }

// console.log('BOY LONG');
// for (let i = 0; i < 1000; i ++) {
//     getWinningSequence('BOY', cards, 100, false);
// }
// console.log('End of test.');
// console.log('BOY SHORT');
// for (let i = 0; i < 1000; i ++) {
//     getWinningSequence('BOY', cards, 1, false);
// }
// console.log('End of test.');
// console.log('GIRL LONG');
// for (let i = 0; i < 1000; i ++) {
//     getWinningSequence('GIRL', cards, 100, false);
// }
// console.log('End of test.');
// console.log('GIRL SHORT');
// for (let i = 0; i < 1000; i ++) {
//     getWinningSequence('GIRL', cards, 1, false);
// }
// console.log('End of test.');
