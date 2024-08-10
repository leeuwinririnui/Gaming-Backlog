// Function to register are user based on details from register form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (e) => {
        const username = document.querySelector('#username');
        const password = document.querySelector('#password');
        const display = document.querySelector('#error');

        console.log(`${username.value}`);
        console.log(`${password.value}`);

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
                display.textContent = `${data.message}. `;
                if (data.error) { 
                    display.textContent += `${data.error}`; 
                } 

                return display.textContent;
            }
            
            // Redirect user based on role
            location.assign('/');
        } catch (err) {
            display.textContent = 'An unexpected error occurred. Please try again.';
            console.log(err.message);
        }

    });
});
