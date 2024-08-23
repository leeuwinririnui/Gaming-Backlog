document.addEventListener('DOMContentLoaded', () =>{
    // Empty search
    document.querySelector('#search-game').value = "";
    
    const searchButton = document.querySelector('#search-button');
    const searchInput = document.querySelector('#search-game');

    // Fetch game data when search icon is clicked
    searchButton.addEventListener('click', () => {
        getGameData();
    });

    searchInput.addEventListener('keypress', (event) => {
        // If the user presses the "Enter" key on the keyboard
        if (event.key === "Enter") {
            // Cancel the default action
            event.preventDefault();

            // Trigger search button with click
            searchButton.click();
        }
    });
});

// Retrieve game data
async function getGameData() {
    const searchInput = document.querySelector('#search-game');
    const games_list = document.querySelector('#games-list');
    const searchTitle = document.querySelector('#search-results');
    const title = searchInput.value.trim();

    searchTitle.innerHTML = `Search Results for "<strong>${title}</strong>"`;

    if (!title) {
        games_list.innerHTML = '';
    } else {
        const encodedTitle = encodeURIComponent(title);
        
        try {
            const res = await fetch(`api/game/retrieve?title=${encodedTitle}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) { 
                console.error('Failed to retrieve game data');
            }

            const data = await res.json(); 
            
            if (Array.isArray(data.games)) {
                games_list.innerHTML = '';
                data.games.forEach(game => {
                    if (game.sample_cover && game.title && game.game_id) {
                        const gameCover = game.sample_cover.image;
                        const gameTitle = game.title;
                        const gameId = game.game_id;
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
                            addGameToList(gameId);
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
                        games_list.appendChild(newGame);
                    }
                });

                toGameInfoPage();

            } else {
                console.error('Invalid data format');
            }

        } catch (error) {
            console.error('Error:', error);
        }
    } 
}

async function addGameToList(gameId) {
    const res = await fetch(`api/game/add?id=${gameId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    });

    if (!res.ok) {

        return;
    }
    
    const data = await res.json();

    console.log(data.message);
}

async function removeGameFromList() {
    const res = await fetch(`api/game/remove?id=${gameId}`, {
        method: 'GET',
        headers: { 'content-type': 'application/json' }
    });

    if (!res.ok) {
        console.log()
    }

    const data = await res.json();

    console.log(data.message);

    window.location.reload();
}

// Redirect user to game info page
function toGameInfoPage() {
    const handleRedirect = (event) => {
        const gameId = event.target.dataset.gameId;
        window.location.href = `/game?id=${gameId}`;
    };
    const gameElements = document.querySelectorAll('.game-title, .game-cover');

    gameElements.forEach(element => {
        element.addEventListener('click', handleRedirect);
    });
}