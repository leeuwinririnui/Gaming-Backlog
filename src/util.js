const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
var stringSimilarity = require("string-similarity");

// Match games from users list with title from search 
function matchTitles(gameTitles, title) {
    let titles = [];

    gameTitles.forEach(game => {
        if (stringSimilarity.compareTwoStrings(game, title) > 0.25) {
            titles.push(game);
        }   
    });

    return titles;
}

// Match games using id 
function matchIds(games, ids) {
    let match = [];

    games.forEach(game => {
        if (ids.includes(game.game_id)) {
            match.push(game);
        }   
    });

    return match;
}

// Filter users games by matching with title parameter
function filterGamesByTitle(games, titles) {
    let filtered_games = { games: [] };
        
    games.forEach(game => {
        if (titles.includes(game.title)) {
            filtered_games.games.push(game);
        }
    });

    return filtered_games;
}

// Generate token
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