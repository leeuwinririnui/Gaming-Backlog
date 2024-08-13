const apiKey = 'moby_9cJw7yCmRazpm4HboHgRCSUCmMZ';
const endpoint = 'https://api.mobygames.com/v1/games';

// GET request to mobygames api
const fetchGame = async ( req, res, next) => {
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
    console.log('fag')
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


module.exports = { 
    fetchGame, 
    gamePage 
};