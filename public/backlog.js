import { 
    removeGame,
    addGame,
    gamePage, 
    scrollToTop,
    handleSiblings, 
    hideLinks 
} from "./helper.js";

let currentList;

// Hold value of active pagingation link
let page = 0;

let gameCount = 0;

document.addEventListener('DOMContentLoaded', async () => {
    document.querySelector('#search-game').value = "";
    await getUserList();
    setupSearch();
    addPaginationLinks(gameCount);
});

function setupSearch() {
    const searchInput = document.querySelector('#search-game');
    const searchButton = document.querySelector('#search-button');

    const handleSearch = () => searchGames(searchInput.value.trim());

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    });
}

// Retrieve game data 
async function searchGames(title) {
    if (title === "") return getUserList();

    const gamesList = document.querySelector('#games-list');
    const encodedTitle = encodeURIComponent(title);

    try {
        const res = await fetch(`api/game/search?title=${encodedTitle}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
        });

        if (!res.ok) throw new Error('Failed to retrieve game data');

        const data = await res.json();

        handleGameData(data.games, gamesList);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Retrieve users list
async function getUserList() {
    const gamesList = document.querySelector('#games-list');

    try {
        const res = await fetch(`api/game/backlog?page=${page}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
        });

        if (!res.ok) throw new Error('Failed to retrieve game data');

        const data = await res.json();

        currentList = data.games;
        gameCount = data.gameCount; 

        handleGameData(gamesList);
        scrollToTop();

    } catch (error) {
        console.log(error);
    }
}

function handleGameData(gamesList) {
    populateList(currentList, gamesList);
    gamePage();
}

// Add pagination links for users list
function addPaginationLinks(length) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    for (let i = 0; i < length; i++) {
        const paginationLink = document.createElement('a');
        paginationLink.innerHTML = `${i+1}`;
        
        // Initial document load pagination set up
        if (i === 0) { 
            paginationLink.classList.add('active'); 
        } 

        if (i >= 1 && i <= 4) { 
            paginationLink.classList.add('sibling');
        }

        paginationLink.addEventListener('click', () => {  
            page = i;
            handleSiblings(paginationLink, paginationContainer, i, length);
            getUserList();
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
            if (game.sample_cover && game.title && game.game_id) {
                const { sample_cover: { image: gameCover }, 
                title: gameTitle, 
                game_id: gameId, 
                moby_score: mobyScore } = game;
                const releaseDate = game.platforms[0].first_release_date;

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
                    addGame(gameId);
                });

                newTitle.dataset.gameId = String(gameId);
                newImage.dataset.gameId = String(gameId);

                // Append elements
                newCover.appendChild(newImage);
                newGame.appendChild(newCover);
                newScoreContainer.appendChild(newScore);
                newInfo.appendChild(newTitle);
                newInfo.appendChild(newDate);
                newInfo.appendChild(newRemoveButton);
                newInfo.appendChild(newAddButton);
                newGame.appendChild(newInfo);
                // newGame.appendChild(newScoreContainer);

                fragment.appendChild(newGame);
            }
        });

        list.appendChild(fragment);
    } else {
        console.error("Invalid data format");
    }
}
