const jwt = require('jsonwebtoken');
const User = require('../data/user');
const endpoint = 'https://api.mobygames.com/v1/games';
const { 
    matchTitles, 
} = require('../util.js')
const JWT_SECRET = process.env.JWT_SECRET;
const MOBY_API = process.env.MOBY_API;

const chunk = 20;

// Helper function to introduce a delay
function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Fetch games based on title and paginate the results
const fetchGames = async (req, res, next) => {
    const { title, page } = req.query;

    // Validate title and page parameters
    if (!title) {
        return res.status(400).json({ message: 'Game title is required' });
    }

    if (!page) {
        return res.status(400).json({ message: 'Page number is required' });
    }

    const url = `${endpoint}?api_key=${MOBY_API}&title=${encodeURIComponent(title)}`;

    try {
        // Fetch the user using JWT token from cookies
        const user = await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userGames = user.games;
        const gameIds = userGames.map(game => game.id);

        // Fetch games from API
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({
                message: "Game was not found or there was an error with the request"
            });
        }
        
        const data = await response.json();
        
        // Divide the fetched games into pages
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

// Fetch random games from API
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
        
        // Construct query string for fetching game details by ID
        data.games.forEach(game => {
            ids += `&id=${encodeURIComponent(game)}`;
        });

        await wait(1000); // Delay to avoid hitting API rate limits

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

// Retrieve detailed information about a specific game using its ID
const gamePage = async (req, res, next) => {
    const { id } = req.query;

    // Validate game ID parameter
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

        let gameStatus;
        let status = 'null';

        if (hasGame === true) {
            // Fetch the status of the game in the user's list
            gameStatus = await User.findOne(
                { _id: user.id, 'games.id': id },
                { 'games.$': 1 } // Retrieve only first matching element
            ).exec();

            status = gameStatus.games[0].status;
        }


        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({ 
                message: "Game was not found or there was an error with the request"
            });
        }

        const data = await response.json();

        res.status(200).json({ game: data.games[0], hasGame, status });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Add game to user's list
const addGame = async (req, res, next) => {
    const gameId = req.query.id;
    const gameTitle = req.query.title;

    // Validate game ID parameter
    if (!gameId) {
        return res.status(400).json({ message: "No game id or user id was found in request" });
    }

    try {
        const user = await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(404).json({ message: "No user was found" });
        }

        // Check if the game already exists in user's list
        if (user.games.some(game => game.id === gameId)) {
            return res.status(409).json({ message: "Game already in users list" });
        }

        // Add game to user's list
        await User.findByIdAndUpdate(
            user.id,
            { $push: { games: { id: gameId, title: gameTitle } } },
        )

        return res.status(200).json({ message: "Successfully added game to list" });
        
    } catch (error) {
        return res.status(500).json({ "An error occurred": error });
    }
}

// Remove game from user's list
const removeGame = async (req, res, next) => {
    const gameId = req.query.id;

    // Validate game ID parameter
    if (!gameId) {
        return res.status(400).json({ message: "No game id or user id was found in request" });
    }

    try {
        const user = await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove the game from user's list if it exists
        if (user.games.some(game => game.id === gameId)) {
            await User.findByIdAndUpdate(
                user.id,
                { $pull: { games: { id: gameId } } },
            );
        } else {
            return res.status(404).json({ message: "Game was not found in users list" });
        }

        return res.status(200).json({ message: "Game successfully removed from list" });

    } catch (error) {
        return res.status(500).json({ message: 'Error updating user games:', error });
    }
}

// Check if game exists in user's list
const checkGame = async (req, res, next) => {
    const gameId = req.query.id;

    // Validate game ID parameter
    if (!gameId) {
        return res.status(400).json({ message: "No game id or user id was found in request" });
    }

    try {
        const user = await fetchUser(req.cookies.jwt);

        if (!user) {
            return res.status(404).json({ message: "No user was found" });
        }

        // Check and return true if game ID is in user's game list
        if (user.games.includes(gameId)) {
            return res.status(200).json({ exists: true });
        }
        
        return res.status(200).json({ exists: false });
        
    } catch (error) {
        return res.status(500).json({ "An error occurred": "error" });
    }
}

// Fetch user's list of games with pagination and optional filtering
const fetchList = async (req, res, next) => {
    try {
        const { page, title, filter } = req.query;

        // Validate page parameter
        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        const user = await fetchUser(req.cookies.jwt);

        // Return error if user is not found
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract titles and IDs from user's game list
        const userGames = user.games;
        const userTitles = userGames.map(game => game.title);
        const gameIds = userGames.map(game => game.id);
        let endpoints = "";
        let gamesToFetch = gameIds;

        // Filter games by title if provided
        if (title && title !== 'undefined') {
            const matchedTitles = matchTitles(userTitles, title);

            gamesToFetch = userGames
                .filter(game => matchedTitles.includes(game.title))
                .map(game => game.id);
        }

        // Filter games by status if a filter is provided and not 'show all'
        if (filter && filter != 'show all') {
            gamesToFetch = userGames
                .filter(game => game.status === filter)
                .map(game => game.id)
        }

        // Return error if no games match filter
        if (gamesToFetch.length === 0) {
            return res.status(404).json({ message: "No games in users list" });
        }

        // Divide games into chunks
        const dividedGames = divideArray(gamesToFetch, chunk);

        // Create endpoint for each game
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

// Fetch username using JWT from cookies
const fetchUsername = async (req, res, next) => {
    try {
        const user =  await fetchUser(req.cookies.jwt);

        // Return error if user is not found
        if (!user) {
            return res.status(400).json({
                message: "Could not retrieve username"
            });
        } 

        // Return username
        return res.status(200).json({
            username: user.username
        })

    } catch (error) {
        return res.status(500).json({
            message: "Error", error
        })
    }
}

// Update the status of game and add to user's list if needed
const updateStatus = async (req, res, next) => {
    const { option, id, title, flag } = req.query;

    const isFlagFalse = req.query.flag === 'false'

    try {
        const user = await fetchUser(req.cookies.jwt);

        // Return an error if the user is not found
        if (!user) {
            return res.status(404).json({
                message: "User was not found"
            });
        }

        // Add game to user's list if flag is flase
        if (isFlagFalse) {
            const updatedList = await User.findByIdAndUpdate(
                user.id,
                { $push: { games: { id: id, title: title } } },
                { new: true }
            )
            
            // Return error if game could not be added
            if (!updatedList) {
                return res.status(400).json({
                    message: 'Failed to add game to users list'
                });
            }

        }

        // Update game status
        const updatedGameStatus = await User.findOneAndUpdate(
            { _id: user.id, 'games.id': id }, // Find user and game
            { $set: { 'games.$.status': option } },
            { new: true}
        );
        
        // Return error if game status could not be updated
        if (!updatedGameStatus) {
            return res.status(400).json({
                message: "Failed to update game status"
            });
        }

        console.log(user);

        return res.status(200).json({
            message: `Game status has been updated to '${option}'`
        })

    } catch (error) {
        return res.status(500).json({
            message: "Error", error
        });
    }
}

// ----------------------- HELPER FUNCTIONS -----------------------

// Fetch user from database using JWT token
async function fetchUser(token) {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);

    return user;
}

// Divide an array into chunks of specified size
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
    fetchUsername,
    updateStatus
};