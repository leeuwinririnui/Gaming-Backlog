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

// Initialize page
document.addEventListener('DOMContentLoaded', () =>{
    document.querySelector('#search-game').value = "";
    setupSearch();
});

// Handle search functionality
function setupSearch() {
    const searchInput = document.querySelector('#search-game');
    const searchButton = document.querySelector('#search-button');

    const handleSearch = async () => {
        if (searchInput.value.trim() === "") {
            document.querySelector('#search-results').innerHTML = `No Title Found`;
            return;
        }
        // Set active page to first (0) for each new search
        page = 0;
        // Ensure games have been retrieve before setting pagination links
        await searchGames(searchInput.value.trim());
        addPaginationLinks(gameCount, searchInput.value.trim())
        document.querySelector('#search-results').innerHTML = `Search results for <strong>"${searchInput.value.trim()}"<strong>`
    }

    searchButton.addEventListener('click', () => {
        handleSearch();
    });
    searchInput.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    });
}

async function searchGames(title) {
    const gamesList = document.querySelector('#games-list');

    try {
        // Users list will be filtered if title is passed
        const res = await fetch(`api/game/retrieve?page=${page}&title=${title}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
        });

        const data = await res.json();

        if (!res.ok) throw new Error('Failed to retrieve game data');

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
        
        if (i === 0) { 
            paginationLink.classList.add('active'); 
        } 

        if (i >= 1 && i <= 4) { 
            paginationLink.classList.add('sibling');
        }

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

            // Elements
            const newGame = document.createElement('div');  
            const newCover = document.createElement('div');
            const newImage = document.createElement('img');
            const newInfo = document.createElement('div');
            const newTitle = document.createElement('p');
            const newDate = document.createElement('p');
            const newAddButton = document.createElement('button');
            const newRemoveButton = document.createElement('button');
            
            // Attributes
            newGame.classList.add('game');

            // Image section
            newCover.classList.add('cover');
            newImage.classList.add('game-cover');
            newImage.src = gameCover;

            // Information section
            newInfo.classList.add('game-info');
            newTitle.classList.add('game-title');
            newTitle.innerHTML = `${gameTitle}`;
            newDate.classList.add('release-date');
            newDate.innerHTML = `Release Date: <strong>${releaseDate}<strong>`

            newRemoveButton.classList.add('remove-button');
            newRemoveButton.textContent = 'Remove';

            newAddButton.classList.add('add-button');
            newAddButton.textContent = 'Add';

            if (allGameIds.includes(String(gameId))) {
                newAddButton.classList.add('hidden');
            } else {
                newRemoveButton.classList.add('hidden');
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

            // Append 
            newCover.appendChild(newImage);
            newGame.appendChild(newCover);
            newInfo.appendChild(newTitle);
            newInfo.appendChild(newDate);
            newInfo.appendChild(newRemoveButton);
            newInfo.appendChild(newAddButton);
            newGame.appendChild(newInfo);
            fragment.appendChild(newGame);
        });
        list.appendChild(fragment);

    } else {
        console.error('Invalid data format');
    }

}