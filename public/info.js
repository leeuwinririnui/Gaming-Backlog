// Get current URL
const url = new URL(window.location.href);

// Create a URLSearchParams object
const params = new URLSearchParams(url.search);

// Extract id parameter
const gameId = params.get('id');

// Encode id
const encodedId = encodeURIComponent(gameId)

// Function to retrieve relevant game information
async function getGameInfo() {
    const res = await fetch(`api/game/info?id=${encodedId}`, {
        method: 'GET',
        headers: { 'content-type': 'application/json' }
    });

    if (!res.ok) {
        console.error('Failed to retrieve game data');
    }

    const data = await res.json();

    console.log(data);

    // Extract data (should only be one element)
    const game = data.games[0];

    // Check if game exists
    if (game) {
        const { 
            title, description, sample_cover, moby_score, num_votes
         } = game;

         console.log(game);

         document.querySelector('.game-cover').src = sample_cover.image;
         document.querySelector('.title').innerHTML = `${title}`;
         document.querySelector('.description').innerHTML = `${description}`;
    } else {
        // Add HTML for error as well

        console.log("Error - could not retrieve game data");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getGameInfo();
});
