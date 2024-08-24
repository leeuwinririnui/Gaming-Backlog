import { 
    divideList,
    removeGame,
    addGame,
    gamePage, 
    scrollToTop,
    handleSiblings, 
    hideLinks 
} from "./helper.js";

let dividedList;

document.addEventListener('DOMContentLoaded', () =>{
    document.querySelector('#search-game').value = "";
    setupSearch();
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
    const gamesList = document.querySelector('#games-list');
    const encodedTitle = encodeURIComponent(title);
    const searchTitle = document.querySelector('#search-results');
    searchTitle.innerHTML = `Search Results for "<strong>${title}</strong>"`;
    
    try {
        const res = await fetch(`api/game/retrieve?title=${encodedTitle}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error('Failed to retrieve game data');

        const data = await res.json(); 

        handleGameData(data.games, gamesList);
    } catch (error) {
        console.error('Error:', error);
    }
} 

function handleGameData(games, gamesList) {
    dividedList = divideList(games, 5);
    addPaginationLinks(dividedList.length);
    populateList(dividedList[0].games, gamesList);
    gamePage();
}

// Add pagination links for users list
function addPaginationLinks(length) {
    const gamesList = document.querySelector('#games-list');
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
            scrollToTop();
            populateList(dividedList[i].games, gamesList);
            handleSiblings(paginationLink, paginationContainer, i, length);
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

                // Elements
                const newGame = document.createElement('div');  
                const newCover = document.createElement('div');
                const newImage = document.createElement('img');
                const newInfo = document.createElement('div');
                const newTitle = document.createElement('p');
                const newDate = document.createElement('p');
                const newAddButton = document.createElement('button');
                
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
                newAddButton.classList.add('add-button');
                newAddButton.textContent = "Add";
                newAddButton.addEventListener('click', () => {
                    addGame(gameId);
                });
                newTitle.dataset.gameId = String(gameId);
                newImage.dataset.gameId = String(gameId);

                // Append 
                newCover.appendChild(newImage);
                newGame.appendChild(newCover);
                newInfo.appendChild(newTitle);
                newInfo.appendChild(newDate);
                newInfo.appendChild(newAddButton);
                newGame.appendChild(newInfo);
                fragment.appendChild(newGame);
            }
        });
        list.appendChild(fragment);

    } else {
        console.error('Invalid data format');
    }

}

// Function to determine button to display