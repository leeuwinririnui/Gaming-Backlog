document.addEventListener('DOMContentLoaded', () =>{
    const searchButton = document.querySelector('#search-button');
    const searchInput = document.querySelector('#search-game');

    searchButton.addEventListener('click', async() => {
        // Retrieve game title from users entered value
        const title = searchInput.value.trim();

        if (title) {
            
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

            } catch (error) {
                console.error('Error:', error);
            }
        }
    })
})