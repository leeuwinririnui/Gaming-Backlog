
import { 
    removeGame,
    addGame,
    gamePage, 
    scrollToTop,
    handleSiblings, 
    hideLinks 
} from "./helper.js";


document.addEventListener('DOMContentLoaded', () => {
    fetchGames();

});

// Fetch games based on type paramete (genre, popularity, etc...)
async function fetchGames(type) {
    try {
        const res = await fetch(`api/game/random`, {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new error(data.message);
        }

        fillRecent(data.games);
    } catch (error) {
        console.log(error);
    }
}

function fillRecent(games) {
    if (games) {
        const mainContainer = document.querySelector('.main-container');

        // Recent game container
        const randomGameContainer = document.createElement('div');
        randomGameContainer.classList.add('random-container');
        mainContainer.appendChild(randomGameContainer);
        games.forEach(game => {
            // Extract game data
            let data = extractData(game);

            if (data.gameCover) {     

                // Create container element for each individual game
                const randomFrame = document.createElement('div');
                randomFrame.classList.add('random-frame');
                randomGameContainer.appendChild(randomFrame);

                // Create and append a blurred version of game cover for background

                // Create and append game image cover element
                const randomGameImage = document.createElement('img');
                randomGameImage.classList.add('random-image');
                randomGameImage.src = data.gameCover;
                randomFrame.appendChild(randomGameImage);

                // Create and append title element
                const titleContainer = document.createElement('div');
                const gameTitle = document.createElement('p');
                titleContainer.classList.add('home-title-container');
                gameTitle.classList.add('home-game-title');
                gameTitle.innerHTML = `${data.gameTitle}`;
                titleContainer.appendChild(gameTitle);
                randomFrame.appendChild(titleContainer);

                // Add redirect handler for title and cover
                handleRedirect(data.gameId, randomGameImage, gameTitle)
            }
        });
    }
}

// Extract game data
function extractData(game) {
    // Default data attributes
    let gameCover;
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

function handleRedirect(id, title, cover) {
    title.addEventListener('click', () => {
        window.location.href = `/game?id=${id}`;

    });

    cover.addEventListener('click', () => {
        window.location.href = `/game?id=${id}`;
    });
}