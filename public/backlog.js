import { 
    removeGame,
    addGame,
    gamePage, 
    scrollToTop,
    handleSiblings, 
    hideLinks 
} from "./helper.js";

let currentList;
let allGameIds;
let page = 0;
let gameCount = 0;
let filter = 'show all'

// Initialize page on DOMContentLoaded event
document.addEventListener('DOMContentLoaded', async () => {
    setupFilter();
    document.querySelector('#search-game').value = "";
    await getUserList();
    setupSearch();
    addPaginationLinks(gameCount);
});

// Set up search functionality
function setupSearch() {
    const searchInput = document.querySelector('#search-game');
    const searchButton = document.querySelector('#search-button');

    // Function to search for games based on user input
    const searchList = async () => {
        if (searchInput.value.trim() == "") {
            return;
        }

        document.querySelector('#loader').classList.remove('hidden');
        document.querySelector('#search-results').innerHTML = `Searching...`;

        // Reset to first page on each new search
        page = 0;
        
        // Fetch user's list of games and update pagination
        await getUserList(searchInput.value.trim());
        addPaginationLinks(gameCount, searchInput.value.trim());

        // Display search results text
        document.querySelector('#search-results').innerHTML = `Search results for <strong>"${searchInput.value.trim()}"<strong>`
        document.querySelector('#loader').classList.add('hidden');
    }

    // Add event listener to search button
    searchButton.addEventListener('click', () => {
        searchList();
    });

    // Add event listener to trigger search on pressing Enter key
    searchInput.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchList();
        }
    });
}

// Retrieve users list of games from server
async function getUserList(title) {
    const gamesList = document.querySelector('#games-list');
    const encodedFilter = encodeURIComponent(filter);

    try {
        // Make API request to fetch user's game list
        const res = await fetch(`api/game/backlog?page=${page}&title=${title}&filter=${encodedFilter}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
        });

        const data = await res.json();

        // Log error message if response is not okay
        if (!res.ok) {
            console.log(data.message);
            return;
        }

        // Update state variables with fetched data
        currentList = data.games;
        gameCount = Math.ceil(data.gameCount); 
        allGameIds = data.gameIds

        populateList(currentList, gamesList);
        gamePage();
        scrollToTop();

    } catch (error) {
        console.log(error);
    }
}

// Add papgination links based on total number of games
function addPaginationLinks(length, title) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = ''; // Clear existing links

    // Create pagination links based on the total number of pages
    for (let i = 0; i < length; i++) {
        const paginationLink = document.createElement('a');
        paginationLink.innerHTML = `${i+1}`;
        
        // Initial link states
        if (page === 0 && i === 0) { 
            paginationLink.classList.add('active'); 
        } 

        // Handle siblings
        if (page === 0 && i >= 1 && i <= 4) { 
            paginationLink.classList.add('sibling');
        }

        paginationLink.addEventListener('click', () => {  
            // Corresponding page will be sent when retrieving users list 
            page = i;
            handleSiblings(paginationLink, paginationContainer, page, length);
            getUserList(title);
        });
        
    paginationContainer.appendChild(paginationLink);
    }

    hideLinks(paginationContainer.querySelectorAll('a'));
}

// Populate game list with game elements
function populateList(games, list) {
    list.innerHTML = '';
    const fragment = document.createDocumentFragment();

    games.forEach(game => {
        // Extract data from game object
        const data = extractData(game)

        // Create main game element container
        const gameElement = document.createElement('div');
        gameElement.classList.add('game');  
        
        // Create and append cover container with game cover image
        const coverContainer = document.createElement('div');
        const cover = document.createElement('img');
        coverContainer.classList.add('cover-container');
        cover.classList.add('game-cover');
        cover.src = data.gameCover;
        cover.dataset.gameId = String(data.gameId);
        coverContainer.appendChild(cover);
        gameElement.appendChild(coverContainer);
        
        // Create and append release title container
        const titleContainer = document.createElement('div');
        const title = document.createElement('p');
        titleContainer.classList.add('title-container')
        title.classList.add('title');
        title.innerHTML = `${data.gameTitle}`;
        title.dataset.gameId = String(data.gameId);
        titleContainer.appendChild(title)

        // Create and append date container
        const dateContainer = document.createElement('div');
        const date = document.createElement('p');
        dateContainer.classList.add('date-container');
        date.classList.add('date');
        date.innerHTML = `Released: <strong>${data.releaseDate}</strong>`;
        dateContainer.appendChild(date);

        // Create and append genre container
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
        
        // Create and append button container with add and remove buttons
        const buttonContainer = document.createElement('div');
        const remove = document.createElement('button');
        const add = document.createElement('button');
        buttonContainer.classList.add('button-container');
        remove.classList.add('remove-button');
        remove.textContent = 'Remove';
        add.classList.add('add-button');
        add.classList.add('hidden'); // Hide add button by default
        add.textContent = 'Add';
        buttonContainer.appendChild(remove);
        buttonContainer.appendChild(add);

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

        // Create info container and append title, date, genre, and buttons
        const infoContainer = document.createElement('div');
        infoContainer.classList.add('game-info');
        infoContainer.appendChild(titleContainer);
        infoContainer.appendChild(dateContainer);
        infoContainer.appendChild(genreContainer);
        infoContainer.appendChild(buttonContainer);
        gameElement.appendChild(infoContainer);
        
        // Create and append score container
        const scoreContainer = document.createElement('div');
        const score = document.createElement('p');
        scoreContainer.classList.add('score-container');
        score.classList.add('score');
        if (data.mobyScore != 'N/A') score.innerHTML = `${data.mobyScore * 10}`

        // Add classes based on score to visually differentiate ratings
        if (data.mobyScore >= 7.5) {
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

    // Append fragment to main game list container
    list.appendChild(fragment);
} 


// Extract relevant game data
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

// Set up filter dropdown and handle change events
async function setupFilter() {
    const selectElement = document.querySelector('.list-status');

    selectElement.addEventListener('change', async (event) => {
        filter = event.target.value;
        console.log(filter);
        page = 0;
        await getUserList();
        addPaginationLinks(gameCount);       
    });
}