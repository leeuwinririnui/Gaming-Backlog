const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
var stringSimilarity = require("string-similarity");

// Match games from users list with a search title
// Returns an array of titles that have a similarity score greater than 0.25
function matchTitles(gameTitles, title) {
    let titles = [];

    gameTitles.forEach(game => {
        if (stringSimilarity.compareTwoStrings(game, title) > 0.25) {
            titles.push(game);
        }   
    });

    return titles;
}

// Match games using their IDs
// Returns an array of games whose IDs are included in the provided list of IDs
function matchIds(games, ids) {
    let match = [];

    games.forEach(game => {
        if (ids.includes(game.game_id)) {
            match.push(game);
        }   
    });

    return match;
}

// Filter users games by matching titles
// Returns an object with a 'games' property
function filterGamesByTitle(games, titles) {
    let filtered_games = { games: [] };
        
    games.forEach(game => {
        if (titles.includes(game.title)) {
            filtered_games.games.push(game);
        }
    });

    return filtered_games;
}

// Generate a JWT token for user
// Token expires in 4 hours
function generateToken(user) {
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        {
            expiresIn: 4 * 60 * 60, 
        }
    );

    return token;
}

module.exports = { 
    matchTitles, 
    matchIds,
    filterGamesByTitle,
    generateToken
}