// Function to register are user based on details from register form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        // Retrieve user info
        const username = document.querySelector('#username');
        const password = document.querySelector('#password');
        const confirm = document.querySelector('#confirm-password');
        const display = document.querySelector('#error');

        console.log(`Username: ${username.value}`);
        console.log(`Password: ${password.value}`);
        console.log(`Confirm Password: ${confirm.value}`);

        event.preventDefault();

        display.textContent = '';

        try {

            if (password.value != confirm.value) {
                display.textContent = `Passwords do not match`;

                return;
            }
            // Send POST request to api/auth/register
            const res = await fetch('api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username: username.value, password: password.value }),
                headers: { 'Content-Type': 'application/json' }
            });
            
            // Return JSON passed as response in the API
            const data = await res.json();

            // Handle errors
            if (!res.ok) {
                display.textContent = `${data.message}`;
                if (data.error) { 
                    display.textContent += `${data.error}`; 
                } 

                return;
            }
        
            console.log('User successfully created', data);
            
            // Redirect user 
            location.assign('/'); 
        } catch (err) {
            display.textContent = 'An unexpected error occurred. Please try again.';
            console.log(err.message);
        }

    });
});
