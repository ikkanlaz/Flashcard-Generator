var inquirer = require('inquirer');
var BasicCard = require('./BasicCard.js');
var ClozeCard = require('./ClozeCard.js');
var jsonfile = require('jsonfile');


function checkIfFinished() {
    inquirer.prompt([
        {
            type: 'confirm',
            name: 'wantsMore',
            message: 'Would you like to do something else?',
            default: false
        }
    ]).then(function (confirm) {
        if (confirm.wantsMore) {
            initializeFlashCard();
        }
    });
}

function addFlashCardToStore(flashCard) {
    var file = "flashcards.json";
    var fileContents = {};
    jsonfile.readFile(file, function (err, obj) {
        if (err) {
            console.error(err);
        } else {
            fileContents = obj;
            fileContents.flashcards.push(flashCard);
            jsonfile.writeFile(file, fileContents, { spaces: 2 }, function (err) {
                if (err) console.error(err);
            })
        }
    });
}

function displayFlashCards(flashCardObject, number) {
    var flashcardNumber = number;
    var flashcard = flashCardObject.flashcards[number];
    if (flashcard.front) {
        inquirer.prompt([
            {
                type: 'input',
                name: 'answer',
                message: flashcard.front,
            }
        ]).then(function (answer) {
            if (answer.answer.toLowerCase() === flashcard.back.toLowerCase()) {
                console.log("Correct!");
            } else {
                console.log("Incorrect. Correct answer: " + flashcard.back);
            }
            flashcardNumber++;
            if (flashcardNumber < flashCardObject.flashcards.length) {
                displayFlashCards(flashCardObject, flashcardNumber);
            } else {
                checkIfFinished();
            }
        })
    } else {
        inquirer.prompt([
            {
                type: 'input',
                name: 'answer',
                message: flashcard.partialText,
            }
        ]).then(function (answer) {
            if (answer.answer.toLowerCase() === flashcard.cloze.toLowerCase()) {
                console.log("Correct!");
            } else {
                console.log("Incorrect. Correct answer: " + flashcard.fullText);
            }
            flashcardNumber++;
            if (flashcardNumber < flashCardObject.flashcards.length) {
                displayFlashCards(flashCardObject, flashcardNumber);
            } else {
                checkIfFinished();
            }
        })
    }

}

function initializeFlashCard() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'option',
            message: 'What do you want to do?',
            choices: [
                {
                    name: 'Add a basic flash card',
                    value: 'BasicCard'
                },
                {
                    name: 'Add a cloze flash card',
                    value: 'ClozeCard'
                },
                {
                    name: 'Read the flashcards',
                    value: 'Quiz'
                }
            ]
        }
    ]).then(function (choice) {
        if (choice.option === 'BasicCard') {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'front',
                    message: 'What does the front of the card say?',
                },
                {
                    type: 'input',
                    name: 'back',
                    message: 'What does the back of the card say?',
                }
            ]).then(function (cardText) {
                // console.log(JSON.stringify(cardText, null, '  '))
                var basic = new BasicCard(cardText.front, cardText.back);
                // console.log(JSON.stringify(basic));
                addFlashCardToStore(basic);
                checkIfFinished();
            });
        } else if (choice.option === 'ClozeCard') {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'fullText',
                    message: 'Please provide a statement for the cloze card.',
                }
            ]).then(function (card) {
                // console.log(JSON.stringify(card, null, '  '));
                var fullText = card.fullText;
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'cloze',
                        message: 'What piece of the statement should be hidden?',
                        validate: function (value) {
                            if (fullText.toLowerCase().includes(value.toLowerCase())) {
                                return true;
                            }

                            return 'Please ensure the hidden piece is included in the full statement.';
                        }
                    }
                ]).then(function (clozer) {
                    var cloze = new ClozeCard(fullText, clozer.cloze);
                    console.log(JSON.stringify(cloze));
                    addFlashCardToStore(cloze);
                    checkIfFinished();
                });
            });
        } else if (choice.option === 'Quiz') {
            var file = "flashcards.json";
            jsonfile.readFile(file, function (err, obj) {
                if (err) {
                    console.error(err);
                } else {
                    displayFlashCards(obj, 0);
                }
            });
        }
    });
}

initializeFlashCard();