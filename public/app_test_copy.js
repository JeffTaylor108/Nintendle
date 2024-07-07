// console id's needed: 2 (Nintendo GameCube), 3 (Nintendo 64), 4 (Nintendo Game Boy), 5 (Nintendo Game Boy Advance), 6 (SNES),
// 7 (NES), 8 (Nintendo DS), 9 (Nintendo Wii), 38 (Nintendo Wii U), 41 (Nintendo Game Boy Color), 4912 (Nintendo 3DS),
// 4971 (Nintendo Switch)

let solution = {
    id: 0,
    game: "",
    console: "",
    franchise: "",
    genres: [],
    releaseDate: "",
    boxartLink: ""
};

let guess = {
    id: 0,
    game: "",
    console: "",
    franchise: "",
    genres: [],
    releaseDate: "",
    boxartLink: ""
}

let possibleAnswers = [];

let desiredFranchises = [];

// keeps track of # of guesses and what the first row is
let guessCount = 0;
let topRow;

async function checkGuess() {
    try {
        const responseGames = await fetch('/games.json');
        const responsePlatforms = await fetch('/platforms.json');
        const responseGenres = await fetch('/genres.json');
        const responseBoxart = await fetch('/games_boxart.json');

        if (!responseGames.ok || !responsePlatforms.ok || !responseGenres.ok || !responseBoxart.ok) {
            throw new Error("Failed to fetch data from json files");
        }

        const gameData = await responseGames.json();
        const platformData = await responsePlatforms.json();
        const genreData = await responseGenres.json();
        const boxartData = await responseBoxart.json();

        const guessGameName = document.querySelector('#guessInput').value;

        // finds guessGameName's game id and index
        let guessIndex;
        let currIndex = 0

        gameData.games.forEach(game => {
            if (guessGameName == game.game_title) {
                guessIndex = currIndex;
            }
            currIndex++;
        });
        console.log(guessIndex);

        // data access outside games.json
        const platformID = gameData.games[guessIndex].platform;
        const genreIDArray = gameData.games[guessIndex].genres;
        let genres = [];
        genreIDArray.forEach(genreID => {
            genres.push(genreData.data.genres[genreID].name);
        });

        // populates guess object
        guess.id = gameData.games[guessIndex].id;
        guess.game = gameData.games[guessIndex].game_title;
        guess.console = platformData.data.platforms[`${platformID}`].name;
        guess.franchise = findFranchise(gameData.games[guessIndex].game_title);
        guess.genres = genres;
        guess.releaseDate = gameData.games[guessIndex].release_date;
        guess.boxartLink = `${boxartData.include.boxart.base_url.small}boxart/front/${guess.id}-1.jpg`; 

        // if guess is correct
        if (guess.id == solution.id) {
            let newGuessTableRow = document.createElement("tr");

            // appends Game and Box Art
            let newElem = document.createElement("td");
            let boxart = document.createElement("img");
            boxart.src = guess.boxartLink;
            boxart.className = "boxart";
            let textNode = document.createTextNode(guess.game);
            newElem.appendChild(boxart);
            newElem.appendChild(textNode);
            newElem.style.backgroundColor = "#1fd655";
            newGuessTableRow.appendChild(newElem);

            // appends Console
            newElem = document.createElement("td");
            textNode = document.createTextNode(guess.console);
            newElem.appendChild(textNode);
            newElem.style.backgroundColor = "#1fd655";
            newGuessTableRow.appendChild(newElem);

            // appends Franchise
            newElem = document.createElement("td");
            textNode = document.createTextNode(guess.franchise);
            newElem.appendChild(textNode);
            newElem.style.backgroundColor = "#1fd655";
            newGuessTableRow.appendChild(newElem);

            // appends Genres
            newElem = document.createElement("td");
            textNode = document.createTextNode(guess.genres);
            newElem.appendChild(textNode);
            newElem.style.backgroundColor = "#1fd655";
            newGuessTableRow.appendChild(newElem);

            // appends Release Date
            newElem = document.createElement("td");
            textNode = document.createTextNode(guess.releaseDate);
            newElem.appendChild(textNode);
            newElem.style.backgroundColor = "#1fd655";
            newGuessTableRow.appendChild(newElem);

            // inserts guess at the top of table
            if (guessCount == 0) {
                document.querySelector('#gamesTable').appendChild(newGuessTableRow);
                topRow = newGuessTableRow;
                guessCount++;
            }
            else {
                document.querySelector('#gamesTable').insertBefore(newGuessTableRow, topRow);
                guessCount++;
            }

            victorySequence();
        }

        // if guess is incorrect
        else if (guess.id != solution.id) {
            let newGuessTableRow = document.createElement("tr");

            // appends Game and Box Art
            let newElem = document.createElement("td");
            let boxart = document.createElement("img");
            boxart.src = guess.boxartLink;
            boxart.className = "boxart";
            let textNode = document.createTextNode(guess.game);
            newElem.appendChild(boxart);
            newElem.appendChild(textNode);
            newElem.style.backgroundColor = "#f94449";
            newGuessTableRow.appendChild(newElem);

            // appends Console
            newElem = document.createElement("td");
            textNode = document.createTextNode(guess.console);
            newElem.appendChild(textNode);
            if (guess.console == solution.console) {
                newElem.style.backgroundColor = "#1fd655";
            }
            else {
                newElem.style.backgroundColor = "#f94449"
            }
            newGuessTableRow.appendChild(newElem);

            // appends Franchise
            newElem = document.createElement("td");
            textNode = document.createTextNode(guess.franchise);
            newElem.appendChild(textNode);
            if (guess.franchise == solution.franchise) {
                newElem.style.backgroundColor = "#1fd655";
            }
            else {
                newElem.style.backgroundColor = "#f94449"
            }
            newGuessTableRow.appendChild(newElem);

            // appends Genres
            newElem = document.createElement("td");
            textNode = document.createTextNode(guess.genres.join(', ')); // makes genres list include a space after the comma
            newElem.appendChild(textNode);
            let amountOfGenresMatched = 0;
            guess.genres.forEach(genre => {
                if (solution.genres.includes(genre)) {
                    amountOfGenresMatched++;
                }
            });
            if (amountOfGenresMatched == solution.genres.length) {
                newElem.style.backgroundColor = "#1fd655";
            }
            else if (amountOfGenresMatched > 0) {
                newElem.style.backgroundColor = "#ffee8c";
            }
            else if (amountOfGenresMatched == 0) {
                newElem.style.backgroundColor = "#f94449"
            }
            newGuessTableRow.appendChild(newElem);

            // appends Release Date
            newElem = document.createElement("td");
            textNode = document.createTextNode(guess.releaseDate);
            newElem.appendChild(textNode);
            
            if (guess.releaseDate == solution.releaseDate) {
                newElem.style.backgroundColor = "#1fd655";
            }
            else {
                newElem.style.backgroundColor = "#f94449"
                if (parseInt(guess.releaseDate) > parseInt(solution.releaseDate)) {
                    let downArrow = document.createElement("img");
                    downArrow.src = 'https://www.svgrepo.com/show/505282/arrow-small-down.svg'; // down arrow
                    downArrow.className = "release-date-arrow";
                    newElem.appendChild(downArrow);
                }
                if (parseInt(guess.releaseDate) < parseInt(solution.releaseDate)) {
                    let upArrow = document.createElement("img");
                    upArrow.src = 'https://www.svgrepo.com/show/505291/arrow-small-up.svg'; // up arrow
                    upArrow.className = "release-date-arrow";
                    newElem.appendChild(upArrow);
                }
            }

            newGuessTableRow.appendChild(newElem);

            // inserts guess at the top of table
            if (guessCount == 0) {
                document.querySelector('#gamesTable').appendChild(newGuessTableRow);
                topRow = newGuessTableRow;
                guessCount++;
            }
            else {
                document.querySelector('#gamesTable').insertBefore(newGuessTableRow, topRow);
                guessCount++;
            }
        }

        document.querySelector("#guessInput").value = '';
        console.log(guess);

    } catch (error) {
        console.log("Error: ", error);
    }
}

async function generateNewSolution() {
    try {
        const responseGames = await fetch('/games.json');
        const responsePlatforms = await fetch('/platforms.json');
        const responseGenres = await fetch('/genres.json');
        const responseBoxart = await fetch('/games_boxart.json');

        if (!responseGames.ok || !responsePlatforms.ok || !responseGenres.ok || !responseBoxart.ok) {
            throw new Error("Failed to fetch data from json files");
        }

        const gameData = await responseGames.json();
        const platformData = await responsePlatforms.json();
        const genreData = await responseGenres.json();
        const boxartData = await responseBoxart.json();

        // finds random index that matches desired franchise criteria
        let randIndex;

        if (desiredFranchises.length > 0) {
            let potentialSolutionIndexes = [];
            let searchString = '';

            desiredFranchises.forEach(franchise => {
                searchString = searchString + franchise + '|';
            })
            searchString = searchString.slice(0, -1);

            let regexString = new RegExp(searchString);
            console.log(regexString);

            gameData.games.forEach((game, index) => {
                console.log(game.game_title.search("Pikmin|Animal Crossing"));
                if (game.game_title.search(regexString) !== -1) {
                    potentialSolutionIndexes.push(index);
                }
            });

            const randNum = Math.floor(Math.random() * potentialSolutionIndexes.length);
            randIndex = potentialSolutionIndexes[randNum];
            
        }
        else {
            const randNum = Math.floor(Math.random() * gameData.games.length);
            randIndex = randNum;
        }
        
        // data access outside games.json
        const platformID = gameData.games[randIndex].platform;
        const genreIDArray = gameData.games[randIndex].genres;
        let genres = [];
        genreIDArray.forEach(genreID => {
            genres.push(genreData.data.genres[genreID].name);
        });
        
        // populates solution object
        solution.id = gameData.games[randIndex].id;
        solution.game = gameData.games[randIndex].game_title;
        solution.console = platformData.data.platforms[`${platformID}`].name;
        solution.franchise = findFranchise(gameData.games[randIndex].game_title);
        solution.genres = genres;
        solution.releaseDate = gameData.games[randIndex].release_date;
        solution.boxartLink = `${boxartData.include.boxart.base_url.original}boxart/front/${solution.id}-1.jpg`;

        console.log(solution);

    } catch (error) {
        console.log("Error: ", error);
    }

    clearTable();
}

function findFranchise(gameTitle) {
    let franchise = "";

    if (gameTitle.search("Pokemon") != -1) {
        franchise = "Pokémon";
    }
    if (gameTitle.search("Mario") != -1) {
        franchise = "Mario";
    }
    if (gameTitle.search("Zelda") != -1) {
        franchise = "Zelda";
    }
    if (gameTitle.search("Kirby") != -1) {
        franchise = "Kirby";
    }
    if (gameTitle.search("Pikmin") != -1) {
        franchise = "Pikmin";
    }
    if (gameTitle.search("Metroid") != -1) {
        franchise = "Metroid";
    }
    if (gameTitle.search("Fire Emblem") != -1) {
        franchise = "Fire Emblem";
    }
    if (gameTitle.search("Animal Crossing") != -1) {
        franchise = "Animal Crossing";
    }
    if (gameTitle.search("Super Smash Bros") != -1) {
        franchise = "Super Smash Bros";
    }

    return franchise;
}

async function findPossibleAnswers() {
    try {
        const responseGames = await fetch('/games.json');
        if (!responseGames.ok) {
            throw new Error('Failed to fetch data from json files');
        }

        const gameData = await responseGames.json();
        gameData.games.forEach(game => {
            possibleAnswers.push(game.game_title);
        })

    } catch(error) {
        console.log("Error: " + error);
    }
}

// jquery function that sets up autcomplete functionality for input
$(function() {
    findPossibleAnswers();
    
    $("#guessInput").autocomplete({
        source: function(request, response) {
            let results = $.ui.autocomplete.filter(possibleAnswers, request.term);
            response(results.slice(0,10));
        },
        minLength: 1,
        delay: 100,
        select: function(event, ui) {
            console.log("Selected: " + ui.item.value);
        }
    });
});

// function that gets executed when correct answer is guessed
function victorySequence() {

}

// clears table of all rows except the first
function clearTable() {
    const table = document.querySelector('#gamesTable');
    while (table.rows.length > 1) {
        console.log(table.rows.length);
        table.deleteRow(1);
    }
    console.log("table cleared");
}

// event listener that adds/removes franchises from the desiredFranchises array
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('input[name="franchiseOptions"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                desiredFranchises.push(event.target.value);
            }
            else {
                desiredFranchises.splice(desiredFranchises.indexOf(event.target.value), 1);
            }
            console.log(desiredFranchises);
        });
    });
});


generateNewSolution();