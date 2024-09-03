const jwt = require('jsonwebtoken');
const User = require('../data/user');
const fs = require('fs').promises;
const endpoint = 'https://api.mobygames.com/v1/games';
const { 
    filterGamesByTitle, 
    matchTitles, 
    matchIds 
} = require('../util.js')
const { 
    JWT_SECRET, 
    MOBY_API 
} = require('../../config.js');
const chunk = 20;

function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Fetch games using title 
const fetchGames = async (req, res, next) => {
    const { title, page } = req.query;

    if (!title) {
        return res.status(400).json({ message: 'Game title is required' });
    }

    if (!page) {
        return res.status(400).json({ message: 'Page number is required' });
    }

    const url = `${endpoint}?api_key=${MOBY_API}&title=${encodeURIComponent(title)}`;

    try {
        const user = await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userGames = user.games;
        const gameIds = userGames.map(game => game.id);

        const response = await fetch(url);
        

        if (!response.ok) {
            return res.status(response.status).json({
                message: "Game was not found or there was an error with the request"
            });
        }
        
        const data = await response.json();

        const dividedGames = divideArray(data.games, chunk);
        
        res.status(200).json({ 
            games: dividedGames[page],
            gameCount: dividedGames.length,
            gameIds: gameIds
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Fetch random games
const fetchRandom = async (req, res, next) => {
    const url = `${endpoint}/random?api_key=${MOBY_API}&limit=50`;
    
    try {
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({ 
                message: "Games were not found or there was an error with the request"
             });
        }

        const data = await response.json();

        let ids = '';
        
        data.games.forEach(game => {
            ids += `&id=${encodeURIComponent(game)}`;
        });

        await wait(1000);

        const urlRecent = `${endpoint}?api_key=${MOBY_API}` + ids;
        
        const randomRes = await fetch(urlRecent);

        if (!randomRes.ok) {
            return res.status(randomRes.status).json({ 
                message: "Games were not found or there was an error with the request"
             });
        }

        const random = await randomRes.json();

        return res.status(200).json({ games: random.games });

    } catch (error) {
        return res.status(500).json({ message: "Error", error });
    }
}

// Fetch top games of current year (Metacritic)
const fetchTopGamesThisYear = async (req, res, next) => {
    try {
        const metacriticData = await fs.readFile('src/data/metacritic.json', 'utf-8');

        const gamesData = JSON.parse(metacriticData);

        let url = `${endpoint}?api_key=${MOBY_API}&limit=20`;

        gamesData.forEach(title => {
            url += `&title=${encodeURIComponent(String(title))}`;
        })

        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({
                message: "Failed to retrieve game data"
            });
        }

        const data = await response.json();

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ message: "Error", error });
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
        const user = await fetchUser(req.cookies.jwt);

        const userGames = user.games;
        const gameIds = userGames.map(game => game.id);

        let hasGame = false;

        if (gameIds.includes(id)) {
            hasGame = true;
        }

        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.stauts).json({ 
                message: "Game was not found or there was an error with the request"
            });
        }

        const data = await response.json();

        console.log(data)

        res.status(200).json({ game: data.games[0], hasGame });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Add game to users list
const addGame = async (req, res, next) => {
    const gameId = req.query.id;
    const gameTitle = req.query.title;

    if (!gameId) {
        return res.status(400).json({ message: "No game id or user id was found in request" });
    }

    try {
        const user = await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(404).json({ message: "No user was found" });
        }

        if (user.games.some(game => game.id === gameId)) {
            return res.status(409).json({ message: "Game already in users list" });
        }

        await User.findByIdAndUpdate(
            user.id,
            { $push: { games: { id: gameId, title: gameTitle } } },
            // { new: true }
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

        if (user.games.some(game => game.id === gameId)) {
            await User.findByIdAndUpdate(
                user.id,
                { $pull: { games: { id: gameId } } },
                { new: true }
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
        const { page, title } = req.query;

        if (!page) {
            return res.status(400).json({ message: 'Page not found' });
        }
        const user = await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract titles and IDs
        const userGames = user.games;
        const userTitles = userGames.map(game => game.title);
        const gameIds = userGames.map(game => game.id);

        let endpoints = "";
        let gamesToFetch = gameIds;

        if (title && title !== 'undefined') {
            const matchedTitles = matchTitles(userTitles, title);

            gamesToFetch = userGames
                .filter(game => matchedTitles.includes(game.title))
                .map(game => game.id);
        }


        if (gamesToFetch.length === 0) {
            return res.status(404).json({ message: "No games in users list" });
        }

        const dividedGames = divideArray(gamesToFetch, chunk);

        dividedGames[page].forEach(gameId => { endpoints += `&id=${encodeURIComponent(gameId)}` });
        const url = `${endpoint}?api_key=${MOBY_API}` + endpoints;

        const response =  await fetch(url);

        if (!response.ok) {
            return response.status(400).json({ message: "Game data was not retrieved" });
        }

        const data = await response.json();

        return res.status(200).json({ 
            games: data.games,
            gameCount: gamesToFetch.length / chunk,
            gameIds: gameIds
        });
    } catch (error) {
        return res.status(500).json({ message: "Error", error });
    }
}

// Fetch username 
const fetchUsername = async (req, res, next) => {
    try {
        const user =  await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(400).json({
                message: "Could not retrieve username"
            });
        } 

        return res.status(200).json({
            username: user.username
        })

    } catch (error) {
        return res.status(500).json({
            message: "Error", error
        })
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

// Divide an array into chunks
function divideArray(array, chunkSize) {
    const divided = [];
    let temp = [];

    array.forEach(item => {
        if (temp.length === chunkSize) {
            divided.push(temp);
            temp = [];
        }
        temp.push(item);
    });

    if (temp.length > 0) {
        divided.push(temp);
    }

    return divided;
}

module.exports = { 
    fetchGames, 
    gamePage, 
    addGame,
    checkGame,
    removeGame, 
    fetchList,
    fetchRandom,
    fetchUsername
};