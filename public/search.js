import { 
    removeGame,
    addGame,
    gamePage, 
    scrollToTop,
    handleSiblings, 
    hideLinks 
} from "./helper.js";

let allGameIds;
let currentList;
let page = 0;
let gameCount = 0;

const queryString = new URLSearchParams(window.location.search);

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setupSearch();
});

// Handle search functionality
function setupSearch() {
    const searchInput = document.querySelector('#search-game');
    const searchButton = document.querySelector('#search-button');

    const handleSearch = async () => {
        if (searchInput.value.trim() === "") {
            return;
        }

        document.querySelector('#loader').classList.remove('hidden');
        document.querySelector('#search-results').innerHTML = `Searching...`;

        // Reset to first page on each new search
        page = 0;

        // Ensure games have been retrieved before setting pagination links
        await searchGames(searchInput.value.trim());
        addPaginationLinks(gameCount, searchInput.value.trim())
        document.querySelector('#search-results').innerHTML = `Search results for <strong>"${searchInput.value.trim()}"<strong>`
        document.querySelector('#loader').classList.add('hidden');
    }

    // Add event listeners
    searchButton.addEventListener('click', () => {
        handleSearch();
    });
    
    searchInput.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    });

    // Handle case where search has been made from another page
    if (queryString) {
        document.querySelector('#search-game').value = queryString.get('title');
        handleSearch();
    } else {
        document.querySelector('#search-game').value = "";
    }
}

// Function to search for games based on title
async function searchGames(title) {
    const gamesList = document.querySelector('#games-list');

    try {
        // Users list will be filtered if title is passed
        const res = await fetch(`api/game/retrieve?page=${encodeURIComponent(page)}&title=${encodeURIComponent(title)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
        });

        const data = await res.json();

        if (!res.ok) {
            console.log(data.message);
            return;
        };

        // Update sate variables
        currentList = data.games;
        gameCount = Math.ceil(data.gameCount); // Round up
        allGameIds = data.gameIds;

        populateList(currentList, gamesList);
        gamePage();
        scrollToTop();

    } catch (error) {
        console.log(error);
    }
}

// Add pagination links for users list
function addPaginationLinks(length, title) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    for (let i = 0; i < length; i++) {
        const paginationLink = document.createElement('a');
        paginationLink.innerHTML = `${i+1}`;
        
        // Inital setup
        if (i === 0) { 
            paginationLink.classList.add('active'); 
        } 

        if (i >= 1 && i <= 4) { 
            paginationLink.classList.add('sibling');
        }

        // Add 'click' event listener to each link
        paginationLink.addEventListener('click', () => {
            page = i;
            handleSiblings(paginationLink, paginationContainer, page, length);
            searchGames(title)
        });

    paginationContainer.appendChild(paginationLink);
    }

    hideLinks(paginationContainer.querySelectorAll('a'));
}



// Populate users list with html elements
function populateList(games, list) {
    list.innerHTML = '';
    const fragment = document.createDocumentFragment();

    games.forEach(game => {
        // Extract data from game object
        const data = extractData(game)

        // Create new game element
        const gameElement = document.createElement('div');
        gameElement.classList.add('game');  
        
        // Create elements for game cover 
        const coverContainer = document.createElement('div');
        const cover = document.createElement('img');
        coverContainer.classList.add('cover-container');
        cover.classList.add('game-cover');
        cover.src = data.gameCover;
        cover.dataset.gameId = String(data.gameId);
        coverContainer.appendChild(cover);
        gameElement.appendChild(coverContainer);
        
        // Create elements for game title
        const titleContainer = document.createElement('div');
        const title = document.createElement('p');
        titleContainer.classList.add('title-container')
        title.classList.add('title');
        title.innerHTML = `${data.gameTitle}`;
        title.dataset.gameId = String(data.gameId);
        titleContainer.appendChild(title)

        // Create and append date elements
        const dateContainer = document.createElement('div');
        const date = document.createElement('p');
        dateContainer.classList.add('date-container');
        date.classList.add('date');
        date.innerHTML = `Released: <strong>${data.releaseDate}</strong>`;
        dateContainer.appendChild(date);

        // Create and append genre elements
        const genreContainer = document.createElement('div');
        const genre = document.createElement('p');
        genreContainer.classList.add('genre-container');
        genre.classList.add('genre');
        data.genres.forEach(gameGenre => {
            if (gameGenre.genre_category === "Basic Genres") {
                genre.innerHTML = `${gameGenre.genre_name}`;
                return;
            }
        });
        genreContainer.appendChild(genre);
        
        // Create and append remove and add button elements
        const buttonContainer = document.createElement('div');
        const remove = document.createElement('button');
        const add = document.createElement('button');
        buttonContainer.classList.add('button-container');
        remove.classList.add('remove-button');
        remove.textContent = 'Remove';
        add.classList.add('add-button');
        add.textContent = 'Add';
        buttonContainer.appendChild(remove);
        buttonContainer.appendChild(add);

        if (allGameIds.includes(String(data.gameId))) {
            add.classList.add('hidden');
        } else {
            remove.classList.add('hidden');
        }

        // Add event listeners to buttons
        remove.addEventListener('click', () => {
            remove.classList.add('hidden');
            add.classList.remove('hidden');
            removeGame(data.gameId);
        });
        add.addEventListener('click', () => {
            add.classList.add('hidden');
            remove.classList.remove('hidden');
            addGame(data.gameId, data.gameTitle);
        });

        // Create info container and append game elements
        const infoContainer = document.createElement('div');
        infoContainer.classList.add('game-info');
        infoContainer.appendChild(titleContainer);
        infoContainer.appendChild(dateContainer);
        infoContainer.appendChild(genreContainer);
        infoContainer.appendChild(buttonContainer);
        gameElement.appendChild(infoContainer);
        
        // Create and append score elements
        const scoreContainer = document.createElement('div');
        const score = document.createElement('p');
        scoreContainer.classList.add('score-container');
        score.classList.add('score');
        score.innerHTML = (data.mobyScore != null) ? data.mobyScore : 0;
        if (data.mobyScore != 'N/A') score.innerHTML = `${data.mobyScore * 10}`
        if (data.mobyScore > 7.5) {
            scoreContainer.classList.add('good');
        } 
        else if (data.mobyScore >= 5) {
            scoreContainer.classList.add('average');
        } 
        else if (data.mobyScore < 5) {
            scoreContainer.classList.add('bad');
        }
        scoreContainer.appendChild(score);
        gameElement.appendChild(scoreContainer);
        
        // Append game element to fragment
        fragment.appendChild(gameElement);
    });

    // Append fragment to game list
    list.appendChild(fragment);
}

// Extract game data
function extractData(game) {
    // Default data attributes
    let gameCover = 'images/nocover.png'; // FIND AN IMAGE TO USE AS DEFAULT
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