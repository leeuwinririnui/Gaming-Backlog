// Divide list of games into chuncks of specified size
export const divideList = (games, chunk) => {
    let divided = [];
    let temp = { games: [] };
    let count = 0;

    games.forEach(game => {
        if (count === chunk) {
            divided.push(temp);
            temp = { games: [] };
            count = 0;
        }
        temp.games.push(game);
        count++;
    });

    divided.push(temp);
    
    return divided;
}

// Add game by ID to users list
export async function addGame(gameId, gameTitle) {
    const res = await fetch(`api/game/add?id=${gameId}&title=${gameTitle}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    });
    
    const data = await res.json();

    if (!res.ok) {
        console.error(data.message);
        return;
    }
    
    console.log(data.message);
}

// Remove game by ID from users list
export async function removeGame(gameId) {
    const res = await fetch(`api/game/remove?id=${gameId}`, {
        method: 'GET',
        headers: { 'content-type': 'application/json' }
    });

    const data = await res.json();
    
    if (!res.ok) {
        console.error(data.message);
        return;
    }
    console.log(data.message);
}

// Redirect user to game info page
export function gamePage() {
    const handleRedirect = event => {
        const gameId = event.target.dataset.gameId;
        window.location.href = `/game?id=${gameId}`;
    };

    const gameElements = document.querySelectorAll('.title, .game-cover');

    gameElements.forEach(element => {
        element.addEventListener('click', handleRedirect);
    });
}

// Add siblings to current pagination link
export function handleSiblings(pagination, container, index, length) {
    const links = container.querySelectorAll('a');

    links.forEach(link => {
        link.classList.remove('sibling');
        link.classList.remove('active');
    });

    pagination.classList.add('active');
    
    const addSibling = (startLink, direction, count) => {
        let sibling = startLink;
        for (let i = 0; i < count; i++) {
            sibling = direction === 'next' ? sibling.nextElementSibling : sibling.previousElementSibling;
            if (sibling) sibling.classList.add('sibling');
            else break;
        }
    }

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

// Hide pagination links
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
