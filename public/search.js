document.addEventListener('DOMContentLoaded', () =>{
    const searchButton = document.querySelector('#search-button');
    const searchInput = document.querySelector('#search-game');
    let timeoutID;

    // Fetch game data when search icon is clicked
    searchButton.addEventListener('click', () => {
        getGameData();
    });

    // Fetch game data after user type input (half a second delay)
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            // Clear the previous timeout
            clearTimeout(timeoutID);

            // Set new timeout
            timeoutID = setTimeout(() => {
                getGameData();
            }, 500);
        });
    }   
});

// Function to retrieve game data
async function getGameData() {
    const searchInput = document.querySelector('#search-game');
    const gamesList = document.querySelector('#games-list');
    // Retrieve game title from users entered value
    const title = searchInput.value.trim();

    // Clear list of games if no input 
    if (!title) {
        gamesList.innerHTML = '';
    } else {
        
        try {
            // Encode title to make URL safe
            const encodedTitle = encodeURIComponent(title);

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

            // Clear games list from previous search
            gamesList.innerHTML = '';
            
            if (Array.isArray(data.games)) {
                gamesList.innerHTML = '';
                data.games.forEach(game => {
                    if (game.sample_cover && game.title && game.game_id) {
                        // Retrieve game data to displayed to user
                        const gameCover = game.sample_cover.image;
                        const gameTitle = game.title;
                        const gameId = game.game_id;

                        console.log(gameId);

                        // Create new elements for each game
                        const newGame = document.createElement('div');  
                        const newCover = document.createElement('div');
                        const newImage = document.createElement('img');
                        const newInfo = document.createElement('div');
                        const newTitle = document.createElement('p');
                        
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
                        // Add game id to be custom data attribute
                        newTitle.dataset.gameId = String(gameId);

                        // Append elements
                        newCover.appendChild(newImage);
                        newGame.appendChild(newCover);
                        newInfo.appendChild(newTitle);
                        newGame.appendChild(newInfo);
                        gamesList.appendChild(newGame);
                    }
                });
                // Add redirect event listener to each game
                gamePage();

            } else {
                console.error('Invalid data format');
            }

        } catch (error) {
            console.error('Error:', error);
        }
    } 
}

// Redirect user to game info page
function gamePage() {
    // Select all titles from document
    const titles = document.querySelectorAll('.game-title');

    // Add event listener to each title
    titles.forEach(title => {
        title.addEventListener('click', (event) => {
            // Use event target to get clicked element
            const clickedTitle = event.target;
            // Retrieve game id from custom data attribute
            const gameId = clickedTitle.dataset.gameId;

            console.log(gameId);

            // Redirect user to information page passing game id as parameter
            window.location.href = `/game?id=${gameId}`;
        });
    });
}