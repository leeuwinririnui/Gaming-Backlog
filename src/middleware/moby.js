// GET request to mobygames api
const fetchGame = async ( req, res, next) => {
    // Retrieve title from query
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ message: 'Game title is required' });
    }

    const apiKey = 'moby_9cJw7yCmRazpm4HboHgRCSUCmMZ';
    const endpoint = 'https://api.mobygames.com/v1/games';
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


module.exports = { fetchGame };