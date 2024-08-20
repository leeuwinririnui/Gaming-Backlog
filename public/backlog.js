document.addEventListener('DOMContentLoaded', () => {
    getUserList();
    filterBySearch();
});

// Function to filter users list based on search input
function filterBySearch() {
    const searchInput = document.querySelector('#search-game');
    const searchButton = document.querySelector('#search-button');

    searchButton.addEventListener('click', () => {
        // Call function to retrieve game data
        getGameData(searchInput.value.trim());
    });

    searchInput.addEventListener('keypress', (event) => {
        // If user presses "Enter" on keyboard 
        if (event.key === 'Enter') {
            // Cancel the default action
            event.preventDefault();
            // Trigger button click on search button
            searchButton.click();
        }
    });
}

async function getGameData(title) {
    const games_list = document.querySelector('#games-list');

    // Encoded title for URI
    const encodedTitle = encodeURIComponent(title);

    try {

        const response = await fetch(`api/game/retrieve?title=${encodedTitle}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
        });

        const data = await response.json();

         // Clear games list from previous search
         games_list.innerHTML = '';

         if (Array.isArray(data.games)) {
             games_list.innerHTML = '';
             data.games.forEach(game => {
                 if (game.sample_cover && game.title && game.game_id) {
                    // Retrieve game data to displayed to user
                    const gameCover = game.sample_cover.image;
                    const gameTitle = game.title;
                    const gameId = game.game_id;
                    const releaseDate = game.platforms[0].first_release_date;

                    // Create new elements for each game
                    const newGame = document.createElement('div');  
                    const newCover = document.createElement('div');
                    const newImage = document.createElement('img');
                    const newInfo = document.createElement('div');
                    const newTitle = document.createElement('p');
                    const newDate = document.createElement('p');
                    
                    // Add attributes
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
                    // Add game id to be custom data attribute
                    newTitle.dataset.gameId = String(gameId);
                    newImage.dataset.gameId = String(gameId);

                    // Append elements
                    newCover.appendChild(newImage);
                    newGame.appendChild(newCover);
                    newInfo.appendChild(newTitle);
                    newInfo.appendChild(newDate);
                    newGame.appendChild(newInfo);
                    games_list.appendChild(newGame);
                 }
             });
             // Add redirect event listener to each game
             toGameInfoPage();
         } else {
             console.error("Invalid data format");
         }
        
    } catch (error) {
        console.error(error);
    }


}

async function getUserList() {
    // Allow user to search for games in list
    const games_list = document.querySelector('#games-list');

    try {
        const res = await fetch(`api/game/backlog`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
        });

        if (!res.ok) { 
            console.error('Failed to retrieve game data');
        }

        const data = await res.json();

        // Clear games list from previous search
        games_list.innerHTML = '';

        if (Array.isArray(data.games)) {
            games_list.innerHTML = '';
            data.games.forEach(game => {
                if (game.sample_cover && game.title && game.game_id) {
                    // Retrieve game data to displayed to user
                    const gameCover = game.sample_cover.image;
                    const gameTitle = game.title;
                    const gameId = game.game_id;
                    const releaseDate = game.platforms[0].first_release_date;

                    // Create new elements for each game
                    const newGame = document.createElement('div');  
                    const newCover = document.createElement('div');
                    const newImage = document.createElement('img');
                    const newInfo = document.createElement('div');
                    const newTitle = document.createElement('p');
                    const newDate = document.createElement('p');
                    
                    // Add attributes
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
                    // Add game id to be custom data attribute
                    newTitle.dataset.gameId = String(gameId);
                    newImage.dataset.gameId = String(gameId);

                    // Append elements
                    newCover.appendChild(newImage);
                    newGame.appendChild(newCover);
                    newInfo.appendChild(newTitle);
                    newInfo.appendChild(newDate);
                    newGame.appendChild(newInfo);
                    games_list.appendChild(newGame);
                }
            });
            // Add redirect event listener to each game
            toGameInfoPage();
        } else {
            console.error("Invalid data format");
        }
    } catch (error) {
        console.log(error);
    }
}

// Redirect user to game info page
function toGameInfoPage() {
    // Function to handle the redirection
    const handleRedirect = (event) => {
        // Retrieve game id from custom data attribute
        const gameId = event.target.dataset.gameId;
        // Redirect user to information page passing game id as parameter
        window.location.href = `/game?id=${gameId}`;
    };

    // Select all titles and game covers from document
    const gameElements = document.querySelectorAll('.game-title, .game-cover');

    // Add event listener to clickable image and title
    gameElements.forEach(element => {
        element.addEventListener('click', handleRedirect);
    });
}
