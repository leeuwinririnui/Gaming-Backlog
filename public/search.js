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

// Function to retrieve game data
async function getGameData() {
    const searchInput = document.querySelector('#search-game');
    const games_list = document.querySelector('#games-list');
    const searchTitle = document.querySelector('#search-results');
    // Retrieve game title from users entered value
    const title = searchInput.value.trim();

    // Add search content to h3
    searchTitle.innerHTML = `Search Results for "<strong>${title}</strong>"`;

    // Clear list of games if no input 
    if (!title) {
        games_list.innerHTML = '';
    } else {
        // Encode title to make URL safe
        const encodedTitle = encodeURIComponent(title);
        
        try {

            // Send request to server with game title
            const res = await fetch(`api/game/retrieve?title=${encodedTitle}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) { 
                console.error('Failed to retrieve game data');
            }

            const data = await res.json(); 

            console.log(data);
            
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
                console.error('Invalid data format');
            }

        } catch (error) {
            console.error('Error:', error);
        }
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