// Import helper functions
const { filterGamesByTitle, matchTitles } = require('./helper.js')

const apiKey = 'moby_9cJw7yCmRazpm4HboHgRCSUCmMZ';
const endpoint = 'https://api.mobygames.com/v1/games';

// Import JsonWebToken
const jwt = require('jsonwebtoken');

// Secret string
const jwtSecret = '7184a7e0aa374816e3ffea4f11dc52321c9c89591b198e2084c15aab74ea9de57e3771s';

// Import User model
const User = require('../data/user');

// GET request to mobygames api
const fetchGame = async (req, res, next) => {
    // Retrieve title from query
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ message: 'Game title is required' });
    }

    const url = `${endpoint}?api_key=${apiKey}&title=${encodeURIComponent(title)}`;

    console.log(title);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(res.status).json({
                message: "Game was not found or there was an error with the request"
            });
        }
        
        // Convert response to JSON format
        const data = await response.json();

        console.log(data);

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


// Function to retrieve game information based on game ID
const gamePage = async (req, res, next) => {
    // Extract id from req query
    const { id } = req.query;

    if (!id) { 
        return res.status(400).json({ message: 'Game id is required' });
    }

    const url = `${endpoint}?api_key=${apiKey}&id=${encodeURIComponent(id)}`;

    console.log(id);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(res.stauts).json({ 
                Message: "Game was not found or there was an error with the request"
            });
        }

        const data = await response.json();

        console.log(data);

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

const addGame = async (req, res, next) => {
    // Retrieve game id from query parameter
    const game_id = req.query.id;

    // Retrieve users id from response headers
    const token = req.cookies.jwt;

    // decode token
    const decoded = jwt.verify(token, jwtSecret);

    // Retrieve user id from decoded token
    const user_id = decoded.id;
    
    console.log(user_id);

    console.log(game_id);

    if (!game_id || !user_id) {
        return res.status(400).json({ message: "No game id or user id was found in request" });
    }

    try {
        // Retrieve user from db
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(400).json({ message: "No user was found" });
        }

        // Check to see if game_id already exists in users games array
        if (user.games.includes(game_id)) {
            return res.status(409).json({ message: "Game already in users list" });
        }

        console.log(user);

        // Update user games with current game id
        await User.findByIdAndUpdate(
            user_id,
            { $push: { games: game_id } },
        )

        return res.status(200).json({ message: "User successfully added game to list" });
    } catch (error) {
        return res.status(500).json({ "An error occurred": error });
    }
}

const removeGame = async (req, res, next) => {
    // Retrieve game id from query parameter
    const game_id = req.query.id;

    // Retrieve users id from request headers
    const token = req.cookies.jwt;

    // Decode token
    const decoded = jwt.verify(token, jwtSecret);

    // Retrieve user id from decoded token
    const user_id = decoded.id;

    try {
        // Retrieve user from db
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.games.includes(game_id)) {
            console.log("Im here")
            await User.findByIdAndUpdate(
                user_id,
                 { $pull: { games: game_id } },
            );
        } else {
            return res.status(404).json({ message: "Game was not found in users list" });
        }

        return res.status(200).json({ message: "Game successfully removed from list" });

    } catch (error) {
        return res.status(500).json({ message: 'Error update user games:', error });
    }
}

const checkGame = async (req, res, next) => {
    // Retrieve game id from query parameter
    const game_id = req.query.id;

    // Retrieve users id from response headers
    const token = req.cookies.jwt;

    // Decode token
    const decoded = jwt.verify(token, jwtSecret);

    // Retrieve user id from decoded token
    const user_id = decoded.id;

    if (!game_id || !user_id) {
        return res.status(400).json({ message: "No game id or user id was found in request" });
    }

    try {
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(400).json({ message: "No user was found" })
        }

        if (user.games.includes(game_id)) {
            return res.status(200).json({ message: "True" })
        }
        
        return res.status(200).json({ message: "False" })
        
    } catch (error) {
        return res.status(500).json({ "An error occurred": "error" });
    }
}

// Function to fetch users backglog
const fetchBacklog = async (req, res, next) => {
    const token = req.cookies.jwt;

    try {
        const decoded = jwt.verify(token, jwtSecret);

        const user_id = decoded.id;

        // Retrieve user object using users id
        const user = await User.findById(user_id)

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Array to hold game ids from user's backlog
        const game_ids = user.games;

        // Array to hold endpoints for fetching game data
        let endpoints = "";

        game_ids.forEach(game_id => endpoints += `&id=${encodeURIComponent(game_id)}`);

        const url = `${endpoint}?api_key=${apiKey}` + endpoints;

        console.log(endpoints);

        console.log(url);

        const response =  await fetch(url);

        const data = await response.json();

        console.log(data);

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: "Error: ", error });
    }
}

const searchList = async (req, res, next) => {
    const token = req.cookies.jwt;

    const { title } = req.query;

    console.log(`Yo this is the ${title}`);

    try {
        const decoded = jwt.verify(token, jwtSecret);

        const user_id = decoded.id;

        // Retrieve user object using users id
        const user = await User.findById(user_id)

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Array to hold game ids from user's backlog
        const game_ids = user.games;

        // Array to hold endpoints for fetching game data
        let endpoints = "";

        game_ids.forEach(game_id => endpoints += `&id=${encodeURIComponent(game_id)}`);

        const url = `${endpoint}?api_key=${apiKey}` + endpoints;

        console.log(`Constructed URL: ${url}`);

        const response =  await fetch(url);

        if (!response.ok) {
            return res.status(400).json({ message: 'User not found' });
        }

        const data = await response.json();

        const titles = await matchTitles(data.games, title);

        const filtered_games = await filterGamesByTitle(data.games, titles);

        console.log(filtered_games);

        return res.status(200).json(filtered_games);
    } catch (error) {
        return res.status(500).json({ message: "Error:", error });
    }
}

// Function to 

module.exports = { 
    fetchGame, 
    gamePage, 
    addGame,
    checkGame,
    removeGame, 
    fetchBacklog,
    searchList 
};