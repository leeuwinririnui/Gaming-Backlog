// -------------------------- HELPER FUNCTIONS -------------------------- //
var stringSimilarity = require("string-similarity");

// Function to match games from users list with title from search 
async function matchTitles(games, title) {
    let titles = [];

    games.forEach(game => {
        if (stringSimilarity.compareTwoStrings(game.title, title) > 0.25) {
            titles.push(game.title);
        }   
        
    });

    return titles;
}

// Function to filter games in users list based on titles passed
async function filterGamesByTitle(games, titles) {
    let filtered_games = { games: [] };
        
        // OPTIMIZE!!
        games.forEach(game => {
            let match = false;
            titles.forEach(title => {
                if (game.title === title) {
                    match = true;
                }
            });

            if (match === true) {
                filtered_games.games.push(game);
            }
        });

    return filtered_games;
}

module.exports = { 
    matchTitles, 
    filterGamesByTitle 
}