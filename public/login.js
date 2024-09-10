document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    // Login user based on details from login form
    form.addEventListener('submit', async (e) => {
        const username = document.querySelector('#username');
        const password = document.querySelector('#password');
        const display = document.querySelector('#error');

        e.preventDefault();

        display.textContent = '';

        try {
            // Send POST request to api/auth/login
            const res = await fetch('api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username: username.value, password: password.value }),
                headers: { 'Content-Type': 'application/json' }
            });
            
            // Return JSON passed as response in the API
            const data = await res.json();

            // Handle errors
            if (res.status === 400 || res.status === 401) {
                console.log(data.message);
                display.textContent = `${data.message}. `;
                if (data.error) { 
                    display.textContent += `${data.error}`; 
                } 

                return display.textContent;
            }
            
            // Redirect user to home page
            location.assign('/');
        } catch (err) {
            display.textContent = 'An unexpected error occurred. Please try again.';
            console.log(err.message);
        }
    });
});
