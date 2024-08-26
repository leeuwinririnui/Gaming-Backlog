import { 
    removeGame, 
    addGame

 } from "./helper.js";

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const gameId = params.get('id');
const encodedId = encodeURIComponent(gameId);

// Check whether game is in users list
let hasGame;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    gameData();
});

// Retrieve game information
async function gameData() {
    try {
        const res = await fetch(`api/game/info?id=${encodedId}`, {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        });

        const data = await res.json();

        if (!res.ok) {
            console.log(data.message);
        }

        hasGame = data.hasGame;
        extractData(data.game);

    } catch (error) {
        console.error(error);
    }
}

// Extract information from game object
function extractData(game) {
    // Default data attributes
    let gameCover = 'default-cover.jpg';
    let screenshots = 'Screenshots'
    let gameTitle = 'Untitled Game';
    let gameId = 'N/A';
    let genres = 'N/A';
    let description = 'N/A';
    let mobyScore = 'N/A';
    let platforms = 'Unknown platforms';
    let releaseDate = 'Unknown Release Date';

    // Check if data exists before updating 
    if (game.sample_cover && game.sample_cover.image) {
        gameCover = game.sample_cover.image;
    }
    if (game.sample_screenshots) {
        screenshots = game.sample_screenshots;
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
    if (game.genres) {
        genres = game.genres
    }
    if (game.description) {
        description = game.description;
    }
    if (game.platforms) {
        platforms = game.platforms;
        console.log(platforms)
    }
    if (game.platforms && game.platforms[0] && game.platforms[0].first_release_date) {
        releaseDate = game.platforms[0].first_release_date;
    }
    
    // Render page
    renderGameData(gameCover, screenshots, gameTitle, genres, description, releaseDate, platforms, mobyScore, hasGame);
}

// Render page with game data
function renderGameData(cover, screenshots, title, genres, description, date, platforms, score) {
    // Create and append game cover
    const coverContainer = document.querySelector('.cover-container');
    const gameCover = document.createElement('img');
    gameCover.src = cover;
    gameCover.alt = `Cover of ${title}`;
    gameCover.classList.add('game-cover');
    coverContainer.appendChild(gameCover);

    // Create and append sample screenshots
    const screenshotContainer = document.querySelector('.screenshot-container');
    screenshots.forEach(screenshot => {
        const gameScreenshot = document.createElement('img');
        gameScreenshot.src = screenshot.image;
        gameScreenshot.alt = `Sample of ${title}`;
        gameScreenshot.classList.add('screenshot');
        screenshotContainer.appendChild(gameScreenshot);
    });

    // Create and append game title
    const titleContainer = document.querySelector('.title-container');
    const gameTitle = document.createElement('p');
    gameTitle.innerHTML = title;
    gameTitle.classList.add('title');
    titleContainer.appendChild(gameTitle);

    // Create and append game score
    const scoreContainer = document.querySelector('.score-container');
    const gameScore = document.createElement('p');
    gameScore.innerHTML = `Moby Score: ${score}`;
    gameScore.classList.add('moby-score');
    scoreContainer.appendChild(gameScore);

    // Create and append platforms
    const platformContainer = document.querySelector('.platform-container');
    platforms.forEach(platform => {
        const gamePlatform = document.createElement('p');
        gamePlatform.innerHTML = `${platform.platform_name}: <strong>${platform.first_release_date}<strong>`;
        gamePlatform.classList.add('platform');
        platformContainer.appendChild(gamePlatform);
    });

    // Create and append genres
    const genreContainer =  document.querySelector('.genre-container');
    genres.forEach(genre => {
        const gameGenre = document.createElement('p');
        gameGenre.innerHTML = `${genre.genre_name}`;
        gameGenre.classList.add('genre');
        genreContainer.appendChild(gameGenre);
    });

    // Create and append description
    const descriptionContainer = document.querySelector('.description-container');
    const gameDescription = document.createElement('p');
    gameDescription.innerHTML = description;
    gameDescription.classList.add('description');
    descriptionContainer.appendChild(gameDescription);

    // Create and append add and remove buttons
    const buttonContainer = document.querySelector('.button-container');

    const addButton = document.createElement('button');
    addButton.innerHTML = `Add`;
    addButton.classList.add('add-button');
    buttonContainer.appendChild(addButton);
    addButton.addEventListener('click', () => {
        addButton.classList.add('hidden');
        removeButton.classList.remove('hidden');
        addGame(gameId, title);
    });

    const removeButton = document.createElement('button');
    removeButton.innerHTML = `Remove`;
    removeButton.classList.add('remove-button');
    buttonContainer.appendChild(removeButton);
    removeButton.addEventListener('click', () => {
        removeButton.classList.add('hidden');
        addButton.classList.remove('hidden');
        removeGame(gameId);
    });

    if (hasGame) { 
        addButton.classList.add('hidden'); 
    }
    else { 
        removeButton.classList.add('hidden');
    }
}