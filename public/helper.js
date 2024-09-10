// Divide list of games into chunks of specified size
export const divideList = (games, chunk) => {
    let divided = [];
    let temp = { games: [] };
    let count = 0;

    // Iterate through each game and push chunk to divided when specified chunk size is reached
    games.forEach(game => {
        if (count === chunk) {
            divided.push(temp);
            temp = { games: [] };
            count = 0;
        }
        temp.games.push(game);
        count++;
    });

    // Push leftover chunk
    divided.push(temp);
    
    return divided;
}

// Add game by ID to user's list
export async function addGame(gameId, gameTitle) {
    // Send POST request to server to add game by ID
    const res = await fetch(`api/game/add?id=${gameId}&title=${gameTitle}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    });
    
    const data = await res.json(); // Parse the response as JSON

    // Log error message if response was not successful
    if (!res.ok) {
        console.error(data.message);
        return;
    }
}

// Remove game by ID from user's list
export async function removeGame(gameId) {
    // Send GET request to the server to remove the game by ID
    const res = await fetch(`api/game/remove?id=${gameId}`, {
        method: 'GET',
        headers: { 'content-type': 'application/json' }
    });

    const data = await res.json();
    
    if (!res.ok) {
        console.error(data.message);
        return;
    }
}

// Redirect user to game info page based on game ID
export function gamePage() {
    // Functon to handle the redirection when a game is clicked
    const handleRedirect = event => {
        const gameId = event.target.dataset.gameId;
        window.location.href = `/game?id=${gameId}`;
    };

    const gameElements = document.querySelectorAll('.title, .game-cover');

    // Add click event listeners to each game element
    gameElements.forEach(element => {
        element.addEventListener('click', handleRedirect);
    });
}

// Add sibling classes to current pagination link
export function handleSiblings(pagination, container, index, length) {
    const links = container.querySelectorAll('a');

    // Remove sbiling and active classes from all links
    links.forEach(link => {
        link.classList.remove('sibling');
        link.classList.remove('active');
    });

    pagination.classList.add('active');
    
    // Function to add sibling classes to pagination links
    const addSibling = (startLink, direction, count) => {
        let sibling = startLink;
        for (let i = 0; i < count; i++) {
            sibling = direction === 'next' ? sibling.nextElementSibling : sibling.previousElementSibling;
            if (sibling) sibling.classList.add('sibling');
            else break;
        }
    }

    // Determine siblings based on index of active link
    if (index === 0) {
        addSibling(pagination, 'next', 4);
    } else if (index === 1) {
        addSibling(pagination, 'next', 3);
        addSibling(pagination, 'prev', 1);
    } else if (index === length - 1) {
        addSibling(pagination, 'prev', 4);
    } else if (index === length - 2) {
        addSibling(pagination, 'prev', 3);
        addSibling(pagination, 'next', 1);
    } else {
        addSibling(pagination, 'next', 2);
        addSibling(pagination, 'prev', 2);
    }

    hideLinks(links);
}

// Hide pagination links that are not active or siblings
export function hideLinks(links) {
    links.forEach(link => {
        link.style.display = link.classList.contains('active') || link.classList.contains('sibling')
            ? 'inline-block'
            : 'none';
     });
}

// Scroll to top of page
export function scrollToTop() {
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
}
