const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const gameId = params.get('id');
const encodedId = encodeURIComponent(gameId);
let gameTitle = ""
let currentGameStatus = ""

// Check whether game is in users list
let hasGame;

// Initialize page on DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    toSearchPage();
    gameData();
});

// Redirect user to search page when search made
function toSearchPage() {
    const searchInput = document.querySelector('#search-game');
    const searchButton = document.querySelector('#search-button');

    // Function to redirect user
    const handleSearch = async () => {
        const game = searchInput.value.trim();

        if (game === "") return;
        
        window.location.href = `/search?title=${game}`;
    }

    // Add redirect function to search button
    searchButton.addEventListener('click', () => {
        handleSearch();
    });

    // Add redirect function to search input 
    searchInput.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    });
}

// Retrieve game information
async function gameData() {
    try {
        // Fetch game data using id of user
        const res = await fetch(`api/game/info?id=${encodedId}`, {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        });

        const data = await res.json();

        if (!res.ok) {
            console.log(data.message);
        }

        // Update state variables
        gameTitle = data.title;
        hasGame = data.hasGame;
        currentGameStatus = data.status;

        extractData(data.game);

    } catch (error) {
        console.error(error);
    }
}

// function to update status of game
async function handleStatus(option, id) {
    const encodedOption = encodeURIComponent(option);
    const encodedId = encodeURIComponent(id);
    const encodedHasGame = encodeURIComponent(hasGame);
    const encodedTitle = encodeURIComponent(gameTitle);

    try {
        const res = await fetch(`/api/game/status?option=${encodedOption}&id=${encodedId}&title=${encodedTitle}&flag=${encodedHasGame}`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' }
        });

        const data = await res.json();

    } catch (error) {

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
    renderGameData(gameCover, screenshots, gameTitle, genres, description, releaseDate, platforms, mobyScore, gameId);
}

// Render page with game data
function renderGameData(cover, screenshots, title, genres, description, date, platforms, score, id) {
    // Main container
    const gamePageContainer = document.querySelector('.game-page-container');

    // Container for game cover and screenshots
    const topContainer = document.createElement('div');
    topContainer.classList.add('top-container');
    gamePageContainer.appendChild(topContainer);
    
    // Create and append game cover
    const coverContainer = document.createElement('div');
    const gameCover = document.createElement('img');
    coverContainer.classList.add('box-container')
    gameCover.src = cover;
    gameCover.alt = `Cover of ${title}`;
    gameCover.classList.add('box-cover');
    coverContainer.appendChild(gameCover);
    topContainer.appendChild(coverContainer);

    // Create and append status container
    const selectStatusContainer = document.createElement('div');
    const selectStatus = document.createElement('select');
    const statuses = ['Completed', 'On Hold', 'Playing'];

    selectStatusContainer.classList.add('status-container');
    selectStatus.classList.add('status');

    // Add a default empty option
    if (!hasGame) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Status'; 
        defaultOption.selected = true;
        defaultOption.disabled = true; // Prevent selection of the default option
        selectStatus.appendChild(defaultOption);
    }

    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.toLowerCase();
        option.textContent = status;
        if (option.value === currentGameStatus) {
            option.selected = true;
        }
        selectStatus.appendChild(option);
    });
    
    selectStatus.addEventListener('change', (event) => {
        const selectedOption = event.target.value;
        handleStatus(selectedOption, id);
    });

    selectStatusContainer.appendChild(selectStatus);

    gamePageContainer.appendChild(selectStatusContainer);

    // Create and append info container
    const topInfoContainer = document.createElement('div');
    topInfoContainer.classList.add('top-info-container');
    topContainer.appendChild(topInfoContainer)

    // Create and append description container
    const descriptionContainer = document.createElement('div');
    const descriptionLabel = document.createElement('p');
    const descriptionLabelContainer = document.createElement('div');
    const gameDescription = document.createElement('p');
    descriptionContainer.classList.add('description-container');
    descriptionLabelContainer.classList.add('description-label-container');
    descriptionLabel.classList.add('description-label');
    gameDescription.classList.add('description');
    gameDescription.innerHTML = description;
    descriptionLabel.innerHTML = `Description`;
    descriptionLabelContainer.appendChild(descriptionLabel);
    gamePageContainer.appendChild(descriptionLabelContainer);
    descriptionContainer.appendChild(gameDescription);
    gamePageContainer.append(descriptionContainer);

    // Create and append add and remove buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('game-page-button-container');
    gamePageContainer.appendChild(buttonContainer);


    // Create and append sample screenshots
    if (screenshots.length > 0) {
        const screenshotContainer = document.createElement('div');
        screenshotContainer.classList.add('screenshot-container');
        screenshots.forEach(screenshot => {
            const gameScreenshot = document.createElement('img');
            gameScreenshot.src = screenshot.image;
            gameScreenshot.alt = `Sample of ${title}`;
            gameScreenshot.classList.add('screenshot');
            screenshotContainer.appendChild(gameScreenshot);
        });
        gamePageContainer.append(screenshotContainer);
    }
    
    // Create and append game title
    const titleContainer = document.createElement('div');
    const gameTitle = document.createElement('p');
    titleContainer.classList.add('game-title-container')
    gameTitle.innerHTML = title;
    gameTitle.classList.add('game-title');
    titleContainer.appendChild(gameTitle);
    topInfoContainer.appendChild(titleContainer);

    // Create and append game score
    const scoreContainer = document.createElement('div');
    const gameScore = document.createElement('p');
    scoreContainer.classList.add('score-container')
    gameScore.innerHTML = `Moby Score: ${score}`;
    gameScore.classList.add('moby-score');
    scoreContainer.appendChild(gameScore);

    // Create container to hold platforms and genres
    const platformGenreContainer = document.createElement('div');
    platformGenreContainer.classList.add('platform-genre-container');

    // Create and append genres
    const genreContainer =  document.createElement('div');
    const genreLabel = document.createElement('p');
    genreContainer.classList.add('page-genre-container');
    genreLabel.classList.add('genre-label')
    genreLabel.textContent = `Genres`;
    genreContainer.appendChild(genreLabel);
    genres.forEach(genre => {
        const gameGenre = document.createElement('p');
        gameGenre.innerHTML = `${genre.genre_name}`;
        gameGenre.classList.add('page-genre');
        genreContainer.appendChild(gameGenre);
    });
    platformGenreContainer.appendChild(genreContainer);

    // Create and append platforms
    const platformContainer = document.createElement('div');
    const platformLabel = document.createElement('p');
    platformContainer.classList.add('platform-container');
    platformLabel.classList.add('platform-label');
    platformLabel.textContent = `Platforms`;
    platformContainer.appendChild(platformLabel);
    platforms.forEach(platform => {
        const gamePlatform = document.createElement('p');
        gamePlatform.innerHTML = `<strong>${platform.platform_name}:</strong> ${platform.first_release_date}`;
        gamePlatform.classList.add('platform');
        platformContainer.appendChild(gamePlatform);
    });
    platformGenreContainer.appendChild(platformContainer);

    topInfoContainer.appendChild(platformGenreContainer);
}