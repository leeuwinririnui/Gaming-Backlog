// Initialize document using DOMContentLoaded event
document.addEventListener('DOMContentLoaded', async () => {
    document.querySelector('#loader').classList.remove('hidden');
    document.querySelector('#random-label').innerHTML = `Loading...`;
    toSearchPage();
    fetchUsername();
    await fetchGames();
    document.querySelector('#random-label').innerHTML = `Random Picks`;
    document.querySelector('#loader').classList.add('hidden');
});

// Redirect user to search page when search is made
function toSearchPage() {
    const searchInput = document.querySelector('#search-game');
    const searchButton = document.querySelector('#search-button');

    // Function to redirect user to search page with game title as a parameter
    const handleSearch = async () => {
        const game = searchInput.value.trim();

        if (game === "") return;
        
        window.location.href = `/search?title=${game}`;
    }
    // Add click event listener to search button
    searchButton.addEventListener('click', () => {
        handleSearch();
    });

    // Add 'Enter' key event listener to search input
    searchInput.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    });
}

// Fetches and displays username in the welcome header
async function fetchUsername() {
    const header = document.getElementById('welcome');
    
    try {
        const res = await fetch(`api/game/name`, {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        });

        const data = await res.json();

        // Log error if response unsuccessful 
        if (!res.ok) {
            console.log(data.message);
            return;
        }
        
        header.textContent += ` ${data.username}!`;
    } catch (error) {
        console.log(error);
    }
}

// Fetch random games from API and display them
async function fetchGames() {
    try {
        // Fetch random games data from the API
        const res = await fetch(`api/game/random`, {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        });

        const data = await res.json();

        // Log error if response unsuccessful 
        if (!res.ok) {
            console.log(data.message);
            return;
        }

        fillRandom(data.games);
    } catch (error) {
        console.log(error);
    }
}

// Fills the page with random games 
function fillRandom(games) {
    if (games) {
        const mainContainer = document.querySelector('.main-container');

        // Function to create section for a chunk of games
        const createGameSection = (gameChunk) => {

            // Create container for game chunk
            const randomGameContainer = document.createElement('div');
            randomGameContainer.classList.add('random-container');
            mainContainer.appendChild(randomGameContainer);

            // Iterate over each game in the chunk and create display elements
            gameChunk.forEach(game => {
                // Extract game data
                let data = extractData(game);

                if (data.gameCover) {     
                    // Create container element for game display
                    const randomFrame = document.createElement('div');
                    randomFrame.classList.add('random-frame');
                    randomGameContainer.appendChild(randomFrame);

                    // Create and append game image cover element
                    const randomImageContainer = document.createElement('div');
                    randomImageContainer.classList.add('random-image-container');
                    randomFrame.appendChild(randomImageContainer);

                    const randomGameImage = document.createElement('img');
                    randomGameImage.classList.add('random-image');
                    randomGameImage.src = data.gameCover;
                    randomImageContainer.appendChild(randomGameImage);

                    // Create container for title and score
                    const scoreTitleContainer = document.createElement('div');
                    scoreTitleContainer.classList.add('score-title-container')
                    randomFrame.appendChild(scoreTitleContainer);

                    // Create and append title element
                    const titleContainer = document.createElement('div');
                    const gameTitle = document.createElement('p');
                    titleContainer.classList.add('home-title-container');
                    gameTitle.classList.add('home-game-title');
                    gameTitle.innerHTML = `${data.gameTitle}`;
                    titleContainer.appendChild(gameTitle);
                    scoreTitleContainer.appendChild(titleContainer);
                    

                    // Create and append score element
                    const scoreContainer = document.createElement('div');
                    const gameScore = document.createElement('p');
                    scoreContainer.classList.add('home-score-container');
                    gameScore.classList.add('home-score');
                    gameScore.innerHTML = `${data.mobyScore * 10}`;
                    scoreContainer.append(gameScore);
                    scoreTitleContainer.append(scoreContainer);
                    if (data.mobyScore > 7.5) {
                        scoreContainer.classList.add('good');
                    } 
                    else if (data.mobyScore >= 5) {
                        scoreContainer.classList.add('average');
                    } 
                    else if (data.mobyScore < 5) {
                        scoreContainer.classList.add('bad');
                    }

                    // Add redirect handler for title and cover
                    handleRedirect(data.gameId, randomGameImage, gameTitle);
                }
            });
        }

        // Divide games into chunks of specified size and create sections for each chunk
        const chunkSize = 5;
            for (let i = 0; i < games.length; i += chunkSize) {
                const gameChunk = games.slice(i, i + chunkSize);
                createGameSection(gameChunk);
            }
    }
}

// Extract game data
function extractData(game) {
    // Default data attributes
    let gameCover = 'images/nocover.png';
    let gameTitle = 'Untitled Game';
    let gameId = 'N/A';
    let mobyScore = 'N/A';
    let releaseDate = 'Unknown Release Date';
    let genres = 'Unknown Genre';

    // Check if data exists before updating 
    if (game.sample_cover && game.sample_cover.image) {
        gameCover = game.sample_cover.image;
    }
    if (game.title) {
        gameTitle = game.title;
    }
    if (game.game_id) {
        gameId = game.game_id;
    }
    if (game.moby_score) {
        mobyScore = game.moby_score;
    }
    if (game.platforms && game.platforms[0] && game.platforms[0].first_release_date) {
        releaseDate = game.platforms[0].first_release_date;
    }
    if (game.genres) {
        genres = game.genres;
    }

    return { 
        gameCover: gameCover,
        gameTitle: gameTitle,
        gameId: gameId,
        mobyScore: mobyScore, 
        releaseDate: releaseDate,
        genres: genres  
    }
}

// Fucntion to handle redirection to game info page
function handleRedirect(id, title, cover) {
    title.addEventListener('click', () => {
        window.location.href = `/game?id=${id}`;

    });

    cover.addEventListener('click', () => {
        window.location.href = `/game?id=${id}`;
    });
}