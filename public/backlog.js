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

// Initialize page 
document.addEventListener('DOMContentLoaded', async () => {
    document.querySelector('#search-game').value = "";
    await getUserList();
    setupSearch();
    addPaginationLinks(gameCount);
});

// Handle search functionality
function setupSearch() {
    const searchInput = document.querySelector('#search-game');
    const searchButton = document.querySelector('#search-button');

    const searchList = async () => {
        // Set active page to first (0) for each new search
        page = 0;
        // Ensure all users games are retrieved before adding links
        await getUserList(searchInput.value.trim());
        addPaginationLinks(gameCount, searchInput.value.trim());
    }

    searchButton.addEventListener('click', () => {
        searchList();
    });
    searchInput.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchList();
        }
    });
}

// Retrieve users list of games
async function getUserList(title) {
    const gamesList = document.querySelector('#games-list');

    try {
        // Users list will be filtered if title is passed
        const res = await fetch(`api/game/backlog?page=${page}&title=${title}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
        });

        if (!res.ok) throw new Error('Failed to retrieve game data');

        const data = await res.json();

        // Update current list with newly retrieved data
        currentList = data.games;
        // Round up to ensure all games are covered
        gameCount = Math.ceil(data.gameCount); 
        // Could come in handy
        allGameIds = data.gameIds

        populateList(currentList, gamesList);
        gamePage();
        scrollToTop();

    } catch (error) {
        console.log(error);
    }
}

// Add papgination links
function addPaginationLinks(length, title) {
    console.log("Pagination links:", length);
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    for (let i = 0; i < length; i++) {
        const paginationLink = document.createElement('a');
        paginationLink.innerHTML = `${i+1}`;
        
        // Initial pagination setup 
        if (page === 0 && i === 0) { 
            paginationLink.classList.add('active'); 
        } 

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

// Populate users list with game elements
function populateList(games, list) {
    if (Array.isArray(games)) {
        list.innerHTML = '';
        const fragment = document.createDocumentFragment();

        games.forEach(game => {
                // Default data attributes
                let gameCover = 'default-cover.jpg';
                let gameTitle = 'Untitled Game';
                let gameId = 'N/A';
                let mobyScore = 'N/A';
                let releaseDate = 'Unknown Release Date';

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

                // Create elements
                const newGame = document.createElement('div');  
                const newCover = document.createElement('div');
                const newImage = document.createElement('img');
                const newInfo = document.createElement('div');
                const newTitle = document.createElement('p');
                const newDate = document.createElement('p');
                const newRemoveButton = document.createElement('button');
                const newAddButton = document.createElement('button');
                const newScore = document.createElement('p');
                const newScoreContainer = document.createElement('div')

                // Set Attributes and content
                newGame.classList.add('game');

                newCover.classList.add('cover');
                newImage.classList.add('game-cover');
                newImage.src = gameCover;

                newInfo.classList.add('game-info');
                newTitle.classList.add('game-title');
                newTitle.innerHTML = gameTitle;
                
                newDate.classList.add('release-date');
                newDate.innerHTML = `Release Date: <strong>${releaseDate}<strong>`

                newRemoveButton.classList.add('remove-button');
                newRemoveButton.textContent = 'Remove';

                newAddButton.classList.add('add-button');
                newAddButton.classList.add('hidden');
                newAddButton.textContent = 'Add';

                newScoreContainer.classList.add('score-container');
                newScore.classList.add('score');
                newScore.innerHTML = (mobyScore != null) ? mobyScore : 0;
                if (mobyScore % 1 == 0) {
                    newScore.innerHTML += `.0`
                }
                
                // Event listeners
                newRemoveButton.addEventListener('click', () => {
                    newRemoveButton.classList.add('hidden');
                    newAddButton.classList.remove('hidden');
                    removeGame(gameId);
                });
                newAddButton.addEventListener('click', () => {
                    newAddButton.classList.add('hidden');
                    newRemoveButton.classList.remove('hidden');
                    addGame(gameId, gameTitle);
                });

                newTitle.dataset.gameId = String(gameId);
                newImage.dataset.gameId = String(gameId);

                // Append elements to their parents
                newCover.appendChild(newImage);
                newGame.appendChild(newCover);
                newScoreContainer.appendChild(newScore);
                newInfo.appendChild(newTitle);
                newInfo.appendChild(newDate);
                newInfo.appendChild(newRemoveButton);
                newInfo.appendChild(newAddButton);
                newGame.appendChild(newInfo);
                // newGame.appendChild(newScoreContainer);
                
                // Append to document fragment
                fragment.appendChild(newGame);
        });

        list.appendChild(fragment);
    } else {
        console.error("Invalid data format");
    }
}
