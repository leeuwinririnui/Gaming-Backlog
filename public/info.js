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
            title, description, sample_cover, moby_score, num_votes, sample_screenshots, genres
         } = game;

        console.log(game);
         
        document.querySelector('.game-cover').src = sample_cover.image;
        document.querySelector('.title').innerHTML = `${title}`;
        document.querySelector('.description').innerHTML = `${description}`;
        document.querySelector('.score').innerHTML += `${moby_score}`;
        // Uses different classes depending on the score of game
        if (moby_score >= 7) {
            document.querySelector('.score').classList.replace('score', 'score-good');
        } else if (moby_score <= 7 && moby_score >= 4) {
            document.querySelector('.score').classList.replace('score', 'score-av');
        } else {
            document.querySelector('.score').classList.replace('score', 'score-bad');
        }
        document.querySelector('.votes').innerHTML += `${num_votes}`;

        // Retrieve screen shots from sample_screenshots array
        sample_screenshots.forEach(screen => {
            const shot = document.createElement('img');
            shot.classList.add('screenshot');
            shot.src = screen.thumbnail_image;
            console.log(screen);
            document.querySelector('.sample-screenshots').appendChild(shot);
        });

        // Retrieve genres from genres array
        genres.forEach(gameGenre => {
            const genre = document.createElement('p');
            genre.classList.add('genre');
            genre.innerHTML = gameGenre.genre_name;
            document.querySelector('.info-genre').appendChild(genre);
        });

    } else {
        // Add HTML for error as well

        console.log("Error - could not retrieve game data");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getGameInfo();
});
