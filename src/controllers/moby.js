const jwt = require('jsonwebtoken');
const User = require('../data/user');
const { filterGamesByTitle, matchTitles } = require('../util.js')
const { JWT_SECRET, MOBY_API } = require('../../config.js');
const endpoint = 'https://api.mobygames.com/v1/games';

// Fetch games from Mobygames api 
const fetchGame = async (req, res, next) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ message: 'Game title is required' });
    }

    const url = `${endpoint}?api_key=${MOBY_API}&title=${encodeURIComponent(title)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({
                message: "Game was not found or there was an error with the request"
            });
        }
        
        const data = await response.json();

        res.status(200).json(data);
        
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Retrieve game information from api
const gamePage = async (req, res, next) => {
    const { id } = req.query;

    if (!id) { 
        return res.status(400).json({ message: 'Game id is required' });
    }

    const url = `${endpoint}?api_key=${MOBY_API}&id=${encodeURIComponent(id)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.stauts).json({ 
                Message: "Game was not found or there was an error with the request"
            });
        }

        const data = await response.json();

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Add game to users list
const addGame = async (req, res, next) => {
    const gameId = req.query.id;

    if (!gameId) {
        return res.status(400).json({ message: "No game id or user id was found in request" });
    }

    try {
        const user = await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(404).json({ message: "No user was found" });
        }

        if (user.games.includes(gameId)) {
            return res.status(409).json({ message: "Game already in users list" });
        }

        await User.findByIdAndUpdate(
            user.id,
            { $push: { games: gameId } },
        )

        console.log("Successfully added game to list");
        return res.status(200).json({ message: "Successfully added game to list" });
        
    } catch (error) {
        return res.status(500).json({ "An error occurred": error });
    }
}

// Remove game from users list
const removeGame = async (req, res, next) => {
    const gameId = req.query.id;

    if (!gameId) {
        return res.status(400).json({ message: "No game id or user id was found in request" });
    }

    try {
        const user = await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.games.includes(gameId)) {
            await User.findByIdAndUpdate(
                user.id,
                 { $pull: { games: gameId } },
            );
        } else {
            return res.status(404).json({ message: "Game was not found in users list" });
        }
        
        console.log("Game successfully removed from list");
        return res.status(200).json({ message: "Game successfully removed from list" });

    } catch (error) {
        return res.status(500).json({ message: 'Error updating user games:', error });
    }
}

// Check if game exists in users list
const checkGame = async (req, res, next) => {
    const gameId = req.query.id;

    if (!gameId) {
        return res.status(400).json({ message: "No game id or user id was found in request" });
    }

    try {
        const user = await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(404).json({ message: "No user was found" });
        }

        if (user.games.includes(gameId)) {
            return res.status(200).json({ exists: true });
        }
        
        return res.status(200).json({ exists: false });
        
    } catch (error) {
        return res.status(500).json({ "An error occurred": "error" });
    }
}

// Fetch users list
const fetchList = async (req, res, next) => {
    try {
        const user = await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const gameIds = user.games;

        if (gameIds.length === 0) {
            return res.status(404).json({ message: "No games in users list" });
        }

        let endpoints = "";
        gameIds.forEach(gameId => { endpoints += `&id=${encodeURIComponent(gameId)}` });
        const url = `${endpoint}?api_key=${MOBY_API}` + endpoints;

        const response =  await fetch(url);

        if (!response.ok) {
            return response.status(400).json({ message: "Game data was not retrieved" });
        }

        const data = await response.json();

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: "Error", error });
    }
}

// Filter users list using search input
const searchList = async (req, res, next) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ message: "No title was found in request" });
    }

    try {
        const user = await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const gameIds = user.games;
        let endpoints = "";
        gameIds.forEach(gameId => endpoints += `&id=${encodeURIComponent(gameId)}`);
        const url = `${endpoint}?api_key=${MOBY_API}` + endpoints;

        const response = await fetch(url);

        if (!response.ok) {
            return res.status(400).json({ message: 'Game data was not retrieved' });
        }

        const data = await response.json();

        const titles = matchTitles(data.games, title);
        const filteredGames = filterGamesByTitle(data.games, titles);

        return res.status(200).json(filteredGames);
    } catch (error) {
        return res.status(500).json({ message: "Error", error });
    }
}

// ----------------------- HELPER FUNCTIONS -----------------------

// Fetch user from db
async function fetchUser(token) {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);

    return user;
}


module.exports = { 
    fetchGame, 
    gamePage, 
    addGame,
    checkGame,
    removeGame, 
    fetchList,
    searchList 
};