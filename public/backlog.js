let devidedGames;

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
    if (title === "") {
        getUserList();
        return;
    }
    // Allow user to search for games in list
    const gamesList = document.querySelector('#games-list');

    // Encoded title for URI
    const encodedTitle = encodeURIComponent(title);

    try {

        const res = await fetch(`api/game/search?title=${encodedTitle}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
        });

        if (!res.ok) { 
            console.error('Failed to retrieve game data');
        }

        const data = await res.json();

        devidedGames = devideList(data.games);

        addPaginationLinks(devidedGames.length);

        populateList(devidedGames[0].games, gamesList);
    } catch (error) {
        console.error(error);
    }
}

async function getUserList() {
    // Allow user to search for games in list
    const gamesList = document.querySelector('#games-list');

    try {
        const res = await fetch(`api/game/backlog`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
        });

        if (!res.ok) { 
            console.error('Failed to retrieve game data');
        }

        const data = await res.json();

        devidedGames = devideList(data.games);

        console.log(devidedGames.games)

        addPaginationLinks(devidedGames.length);

        populateList(devidedGames[0].games, gamesList);

        
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

// OPTIMIZE!!!
// Function to devide list into array the size of n elements
function devideList(games) {
    let dividedGames = [];
    let temp = { games: [] };
    let count = 0;

    games.forEach(game => {
        if (count === 15) {
            dividedGames.push(temp);
            temp = { games: [] };
            count = 0;
        }
        
        temp.games.push(game);
        count++;
    });

    // Push any remaining games
    dividedGames.push(temp);
    
    return dividedGames;
}

// OPTIMIZE!!!
// Function to add pagination links with event listeners to document
function addPaginationLinks(length) {
    const gamesList = document.querySelector('#games-list');
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    for (let i = 0; i < length; i++) {
        const pagination_link = document.createElement('a');
        pagination_link.innerHTML = `${i+1}`;
        if (i === 0) { pagination_link.classList.add('active'); }
        if (i >= 1 && i <= 4) { 
            pagination_link.classList.add('sibling');
        }

        pagination_link.addEventListener('click', () => {
            populateList(devidedGames[i].games, gamesList);

            // Move the screen position to the top after execution stack is clear
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 0);

            const links = paginationContainer.querySelectorAll('a');

            links.forEach(link => {
                link.classList.remove('active');
                link.classList.remove('sibling');
            });

            pagination_link.classList.add('active');

            // Add sibling links to active link
            if (pagination_link.previousElementSibling) {
                pagination_link.previousElementSibling.classList.add('sibling');
            } 

            if (pagination_link.previousElementSibling.previousElementSibling) {
                pagination_link.previousElementSibling.previousElementSibling.classList.add('sibling');
            } else {
                pagination_link.nextElementSibling.nextElementSibling.classList.add('sibling');
                pagination_link.nextElementSibling.nextElementSibling.nextElementSibling.classList.add('sibling');
            }
        
            if (pagination_link.nextElementSibling) {
                pagination_link.nextElementSibling.classList.add('sibling');
            } 

            if (pagination_link.nextElementSibling.nextElementSibling) {
                pagination_link.nextElementSibling.nextElementSibling.classList.add('sibling');
            } else {
                pagination_link.previousElementSibling.previousElementSibling.classList.add('sibling');
                pagination_link.previousElementSibling.previousElementSibling.previousElementSibling.classList.add('sibling');
            }

            // Hide links that are not active or siblings
            links.forEach(link => {
               link.style.display = link.classList.contains('active') || link.classList.contains('sibling')
                    ? 'inline-block'
                    : 'none';
            });
        });

    paginationContainer.appendChild(pagination_link);
    }

    const links = paginationContainer.querySelectorAll('a');

    links.forEach(link => {
        link.style.display = link.classList.contains('active') || link.classList.contains('sibling')
            ? 'inline-block'
            : 'none';
     });
}





// KEEP AT BOTTOM!!
// Function to populate list
function populateList(games, list) {
    if (Array.isArray(games)) {
        list.innerHTML = '';
        games.forEach(game => {
            if (game.sample_cover && game.title && game.game_id) {
                // Retrieve game data to displayed to user
                const gameCover = game.sample_cover.image;
                const gameTitle = game.title;
                const gameId = game.game_id;
                const releaseDate = game.platforms[0].first_release_date;
                const mobyScore = game.moby_score;

                // Create new elements for each game
                const newGame = document.createElement('div');  
                const newCover = document.createElement('div');
                const newImage = document.createElement('img');
                const newInfo = document.createElement('div');
                const newTitle = document.createElement('p');
                const newDate = document.createElement('p');
                const newScore = document.createElement('p');
                const newScoreContainer = document.createElement('div')

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
                newScoreContainer.classList.add('score-container');
                newScore.classList.add('score');
                if (mobyScore != null) {
                    newScore.innerHTML = `${mobyScore}`;
                } else {
                    newScore.innerHTML = `0`;
                }

                // Keep number dimensions consistent
                if (mobyScore % 1 == 0) {
                    newScore.innerHTML += `.0`
                }
                
                // Add game id to be custom data attribute
                newTitle.dataset.gameId = String(gameId);
                newImage.dataset.gameId = String(gameId);

                // Append elements
                newCover.appendChild(newImage);
                newGame.appendChild(newCover);
                newScoreContainer.appendChild(newScore);
                newInfo.appendChild(newTitle);
                newInfo.appendChild(newDate);
                newGame.appendChild(newInfo);
                newGame.appendChild(newScoreContainer);
                list.appendChild(newGame);
            }
        });
        // Add redirect event listener to each game
        toGameInfoPage();
    } else {
        console.error("Invalid data format");
    }
}
