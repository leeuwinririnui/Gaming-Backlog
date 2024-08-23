const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config.js');
var stringSimilarity = require("string-similarity");

// Match games from users list with title from search 
function matchTitles(games, title) {
    let titles = [];

    games.forEach(game => {
        if (stringSimilarity.compareTwoStrings(game.title, title) > 0.25) {
            titles.push(game.title);
        }   
    });

    return titles;
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
    filterGamesByTitle,
    generateToken
}